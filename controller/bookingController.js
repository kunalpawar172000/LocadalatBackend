import Booking from "../models/bookingModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { checkIsDayHoliday, checkIsDayWeekOff } from "../utility/helper.js";
import { ERRORS } from "../config/constants.js";

dotenv.config({ path: "./config/config.env" });

// Create a new booking/appointment
export const createBooking = async (req, res) => {
  try {
    // Accept a wider set of fields for the booking (keeps backwards compatibility)
    const {
      amount = 0,
      metadata = {},
      status,
      user,
      customerName,
      email,
      phone,
      date,
      courtCaseNo,
      vehicleNo,
      chalanNo,
      slot,
      slotId,
      name
    } = req.body;

    // basic validation
    if (typeof amount === 'undefined' || amount === null) {
      return res.status(400).json({ isSuccess: false, message: ERRORS.AMOUNT_REQUIRED });
    }

    // Helper: generate token number
    const generateTokenNumber = async (bookingDate) => {
      const currentDate = bookingDate ? new Date(bookingDate) : new Date();
      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

      const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const dayLetter = daysOfWeek[currentDate.getDay()];

      // start and end of the day for counting existing bookings
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      const bookingsTodayCount = await Booking.countDocuments({
        bookingDate: { $gte: start, $lte: end }
      });

      const serialNumber = (bookingsTodayCount + 1).toString().padStart(3, '0');
      const tokenNumber = `${dateStr}-${dayLetter}-${serialNumber}-LOK`;
      return tokenNumber;
    };

    const bookingData = {
      amount: Number(amount) || 0,
      metadata,
      phone,
      vehicleNo,
      chalanNo
    };

    // persist slot as a top-level field for easier queries (prefer top-level over metadata)
    if (slot) bookingData.slot = slot;
    else if (metadata && metadata.slot) bookingData.slot = metadata.slot;

    // prefer explicit courtCaseNo field, otherwise allow it in metadata
    if (courtCaseNo) bookingData.courtCaseNo = courtCaseNo;
    else if (metadata && metadata.courtCaseNo) bookingData.courtCaseNo = metadata.courtCaseNo;

  // slot identifier (if provided)
  if (slotId) bookingData.slotId = slotId;

  // name/email: try top-level, then legacy customerName, then metadata
  if (name) bookingData.name = name;
  else if (customerName) bookingData.name = customerName;
  

  if (email) bookingData.email = email;
  else if (metadata && metadata.guestEmail) bookingData.email = metadata.guestEmail;

  if (status) bookingData.status = status;
  if (user) bookingData.userId = user;
  else if (req.user && req.user.id) bookingData.userId = req.user.id;
    else {
      // Backward-compatibility: older clients may send top-level customerName/email.
      // Keep supporting that shape by mapping them into metadata (guestName/guestEmail).
      // New clients should prefer providing guest info inside metadata directly.
      if (customerName) bookingData.metadata = { ...bookingData.metadata, guestName: customerName };
      if (email) bookingData.metadata = { ...bookingData.metadata, guestEmail: email };
    }

    // set userName for clarity: prefer authenticated user's name, else fetch from User model when user id provided
    if (req.user && req.user.name) {
      bookingData.userName = req.user.name;
    } else if (bookingData.userId) {
      try {
        const User = (await import('../models/userModel.js')).default;
        const u = await User.findById(bookingData.userId).select('name');
        if (u && u.name) bookingData.userName = u.name;
      } catch (e) {
        // ignore failures to fetch user name — not critical
      }
    }

    // parse bookingDate if provided (accept either 'bookingDate' or legacy 'date')
    const incomingDate = req.body.bookingDate || req.body.date;
    if (incomingDate) {
      const parsed = new Date(incomingDate);
      if (!isNaN(parsed)) {
        // normalize to UTC midnight
        parsed.setUTCHours(0, 0, 0, 0);
        bookingData.bookingDate = parsed;
      }
    }

    // NOTE: we don't validate metadata.holidayId here — booking validity is determined
    // by the booking date using the holiday/weekoff helpers.

    // Check holiday / weekoff validity (use booking date if provided, otherwise today)
  const bookingDateForCheck = bookingData.bookingDate ? new Date(bookingData.bookingDate) : new Date();
    const isHoliday = await checkIsDayHoliday(bookingDateForCheck);
    const isWeekOff = await checkIsDayWeekOff(bookingDateForCheck);

    if (isHoliday || isWeekOff) {
      return res.status(400).json({ isSuccess: false, message: ERRORS.HOLIDAY_WEEKOFF });
    }

  // generate and attach tokenNumber
  bookingData.tokenNumber = await generateTokenNumber(bookingData.bookingDate);

    const booking = new Booking(bookingData);
    const saved = await booking.save();

  const populated = await Booking.findById(saved._id).populate('userId', '_id email name');

  return res.status(201).json({ isSuccess: true, data: populated });
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
    const totalAmountAgg = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalAmount = (totalAmountAgg[0] && totalAmountAgg[0].total) || 0;
  const recent = await Booking.find({}).sort({ createdAt: -1 }).limit(recentLimit).select("_id userId status amount createdAt");
  res.json({ isSuccess: true, data: { totalCount, totalAmount, byStatus, recent } });
  } catch (err) {
    console.error("Error in getBookingStats:", err);
    res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};

// Admin: get appointments with filtering, pagination and search
export const getAppointments = async (req, res) => {
  try {
    const { date, fromDate, toDate, slot, size = 10, page = 1, search } = req.query;

    const pageSize = Math.max(parseInt(size, 10) || 10, 1);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};

    // Date exact match (same day) - match by bookingDate (scheduled appointment date)
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

    // Slot (top-level field)
    if (slot) {
      filter['slot'] = slot;
    }

    // Basic search: booking id, metadata fields, user email
    let userIdsFromEmail = [];
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // Find users that match email or name
      // require User model lazily to avoid circular requires
      const User = (await import('../models/userModel.js')).default;
      const matchedUsers = await User.find({ $or: [{ email: searchRegex }, { name: searchRegex }] }, "_id");
      userIdsFromEmail = matchedUsers.map(u => u._id);

      filter.$or = [
        { _id: search }, // allow searching by exact id
        { 'metadata.phone': searchRegex },       
        { userId: { $in: userIdsFromEmail } }
      ];
    }

    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .sort({ bookingDate: -1, createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
  .populate('userId', '_id email name')
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
  const booking = await Booking.findById(id).populate('userId', '_id email name');
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
  const booking = await Booking.findOne({ tokenNumber }).populate('userId', '_id email name');
  if (!booking) return res.status(404).json({ isSuccess: false, message: ERRORS.TOKEN_NOT_FOUND });
  return res.status(200).json({ isSuccess: true, data: booking });
  } catch (err) {
    console.error('Error in getBookingByToken', err);
    return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};

// Get bookings in a date range (by booking.date)
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

  const bookingsInRange = await Booking.find({ bookingDate: { $gte: from, $lte: to } }).populate('userId', '_id email name').lean();
    if (!bookingsInRange || bookingsInRange.length === 0) {
      return res.status(404).json({ isSuccess: false, message: ERRORS.NO_BOOKINGS_IN_RANGE });
    }
    return res.status(200).json({ isSuccess: true, data: bookingsInRange });
  } catch (err) {
    console.error('Error in getBookingsInRange', err);
    return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
  }
};
