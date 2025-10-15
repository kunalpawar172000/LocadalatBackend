import Booking from "../models/bookingModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { checkIsDayHoliday, checkIsDayWeekOff } from "../utility/helper.js";
import { ERRORS } from "../config/constants.js";

dotenv.config({ path: "./config/config.env" });



// Create a new booking/appointment
export const createBooking = async (req, res) => {
  try {
    const body = req.body || {};

    // relevant fields (metadata removed)
    const {
      status,
      customerName,
      email,
      phone,
      date,
      bookingDate: bookingDateRaw,
      courtCaseNo,
      vehicleNo,
      chalanNo,
      slotId,
      name
    } = body;

    // Helper: safe date normalizer (accepts string, timestamp, or { $date: ... })
    const parseIncomingDate = (val) => {
      if (!val) return null;
      if (typeof val === 'object' && val.$date) val = val.$date;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Helper: generate token number (defensive)
    const generateTokenNumber = async (bookingDate) => {
      let currentDate = bookingDate ? new Date(bookingDate) : new Date();
      if (isNaN(currentDate.getTime())) currentDate = new Date();

      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const dayLetter = daysOfWeek[currentDate.getDay()];

      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      const bookingsTodayCount = await Booking.countDocuments({
        bookingDate: { $gte: start, $lte: end }
      });

      const serialNumber = (bookingsTodayCount + 1).toString().padStart(3, '0');
      return `${dateStr}-${dayLetter}-${serialNumber}-LOK`;
    };

    // Build booking payload
    const bookingData = {
      phone,
      vehicleNo,
      chalanNo
    };

    // slotId (top-level) if provided
    if (slotId) bookingData.slotId = slotId;

    // courtCaseNo
    if (courtCaseNo) bookingData.courtCaseNo = courtCaseNo;

    // name/email: prefer top-level name, fallback to customerName
    if (name) bookingData.name = name;
    else if (customerName) bookingData.name = customerName;

    if (email) bookingData.email = email;
    if (status) bookingData.status = status;

    // parse bookingDate if provided (accept either 'bookingDate' or legacy 'date')
    const incomingDateRaw = bookingDateRaw || date;
    const parsedDate = parseIncomingDate(incomingDateRaw);
    if (incomingDateRaw && !parsedDate) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Invalid date. Please provide a valid date in ISO format.'
      });
    }
    if (parsedDate) {
      // normalize to UTC midnight
      parsedDate.setUTCHours(0, 0, 0, 0);
      // prevent past-date bookings
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (parsedDate < today) {
        return res.status(400).json({
          isSuccess: false,
          message: 'Cannot create booking for a past date.'
        });
      }
      bookingData.bookingDate = parsedDate;
    }

    // Check holiday / weekoff validity (use booking date if provided, otherwise today)
    const bookingDateForCheck = bookingData.bookingDate ? new Date(bookingData.bookingDate) : new Date();
    const isHoliday = await checkIsDayHoliday(bookingDateForCheck);
    const isWeekOff = await checkIsDayWeekOff(bookingDateForCheck);

    if (isHoliday || isWeekOff) {
      return res.status(400).json({ isSuccess: false, message: ERRORS.HOLIDAY_WEEKOFF });
    }

    // generate and attach tokenNumber (server-generated)
    bookingData.tokenNumber = await generateTokenNumber(bookingData.bookingDate);

    // persist
    const booking = new Booking(bookingData);
    const saved = await booking.save();

    return res.status(201).json({ isSuccess: true, data: saved });
  } catch (err) {
    console.error('Error in createBooking', err);
    return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};

// Returns overall booking statistics:
export const getBookingStats = async (req, res) => {
  try {
    const recentLimit = parseInt(req.query.recentLimit, 10) || 5;
    const totalCount = await Booking.countDocuments();

    const byStatusAgg = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const byStatus = byStatusAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const recent = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(recentLimit)
      .select("_id tokenNumber status bookingDate slotId createdAt name email");

    res.json({ isSuccess: true, data: { totalCount, byStatus, recent } });
  } catch (err) {
    console.error("Error in getBookingStats:", err);
    res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};

// Admin: get appointments with filtering, pagination and search
export const getAppointments = async (req, res) => {
  try {
    const { date, fromDate, toDate, slotId, size = 10, page = 1, search } = req.query;

    const pageSize = Math.max(parseInt(size, 10) || 10, 1);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};

    // Date exact match (same day)
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.bookingDate = { $gte: start, $lte: end };
    }

    // Date range (by bookingDate)
    if (fromDate || toDate) {
      filter.bookingDate = filter.bookingDate || {};
      if (fromDate) {
        const f = new Date(fromDate);
        filter.bookingDate.$gte = new Date(f.setHours(0, 0, 0, 0));
      }
      if (toDate) {
        const t = new Date(toDate);
        filter.bookingDate.$lte = new Date(t.setHours(23, 59, 59, 999));
      }
    }

    // Filter by slotId
    if (slotId) {
      filter['slotId'] = slotId;
    }

    // Basic search: booking id, phone, email, name
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      const User = (await import('../models/userModel.js')).default;
      const matchedUsers = await User.find({ $or: [{ email: searchRegex }, { name: searchRegex }] }, "_id");
      const userIdsFromEmail = matchedUsers.map(u => u._id);

      filter.$or = [
        { _id: search }, // search by exact id
        { phone: searchRegex }, // phone search
        { email: searchRegex }, // email search
        { name: searchRegex }, // name search
        { userId: { $in: userIdsFromEmail } }
      ];
    }

    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .sort({ bookingDate: -1, createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      isSuccess: true,
      count: bookings.length,
      total,
      page: pageNum,
      pageSize,
      data: bookings
    });
  } catch (err) {
    console.error('Error in getAppointments', err);
    res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};


// Get a single booking by id
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ isSuccess: false, message: ERRORS.INVALID_BOOKING_ID });
    }
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ isSuccess: false, message: ERRORS.BOOKING_NOT_FOUND });
    return res.status(200).json({ isSuccess: true, data: booking });
  } catch (err) {
    console.error('Error in getBookingById', err);
    return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};

// Get a booking by token number
export const getBookingByToken = async (req, res) => {
  try {
    const { tokenNumber } = req.params;
    if (!tokenNumber) return res.status(400).json({ isSuccess: false, message: ERRORS.TOKEN_REQUIRED });
    const booking = await Booking.findOne({ tokenNumber });
    if (!booking) return res.status(404).json({ isSuccess: false, message: ERRORS.TOKEN_NOT_FOUND });
    return res.status(200).json({ isSuccess: true, data: booking });
  } catch (err) {
    console.error('Error in getBookingByToken', err);
    return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};

// Get bookings in a date range (by bookingDate)
export const getBookingsInRange = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    if (!fromDate || !toDate) {
      return res.status(400).json({ isSuccess: false, message: ERRORS.DATES_REQUIRED });
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ isSuccess: false, message: ERRORS.INVALID_DATE_FORMAT });
    }
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const bookingsInRange = await Booking.find({ bookingDate: { $gte: from, $lte: to } }).lean();
    if (!bookingsInRange || bookingsInRange.length === 0) {
      return res.status(404).json({ isSuccess: false, message: ERRORS.NO_BOOKINGS_IN_RANGE });
    }
    return res.status(200).json({ isSuccess: true, data: bookingsInRange });
  } catch (err) {
    console.error('Error in getBookingsInRange', err);
    return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};