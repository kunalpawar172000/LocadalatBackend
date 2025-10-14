import Slot from "./../models/slotModel.js";
import Booking from "./../models/bookingModel.js";
import { Holiday } from "./../models/holidayModel.js";
import { Weekoff } from "./../models/weekoffModel.js";
import { ERRORS, MESSAGES } from "../config/constants.js";
import { validateBodyParams } from "../utility/helper.js";
import { getWeekOfMonth, getDay } from "date-fns";

export const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ isActive: true });
        if (!slots) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.FAILED_FETCH_SLOTS });
        }
        res.status(200).json({
            isSuccess: true,
            data: slots
        });
    } catch (error) {
        console.error("Get slots error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};

export const updateSlot = async (req, res) => {
    try {
        const { slotSize } = req.body;

        const validateParams = await validateBodyParams(req, res, ['slotSize']);
        if (validateParams) {
            return;
        }

        const result = await Slot.updateMany(
            { isActive: true },                 // filter
            { $set: { quotaForSlot: slotSize } } // update
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                isSuccess: false,
                message: MESSAGES.SLOTS_NOT_FOUND
            });
        }

        res.status(200).json({
            isSuccess: true,
            message: MESSAGES.SLOT_UPDATED_SUCCESS,
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Updating slots error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};

export const getBookingsGroupedByDate = async (monthStart, nextMonthStart) => {
    return await Booking.aggregate([
        {
            $match: {
                bookingDate: { $gte: monthStart, $lt: nextMonthStart }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
                    slotId: "$slotId"
                },
                totalBookings: { $sum: 1 }
            }
        }
    ]);
};

export const slotAvailabilityByMonth = async (req, res) => {
    try {
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month);

        if (!year || !month) {
            return res
                .status(400)
                .json({ error: "Please provide 'year' and 'month' query parameters." });
        }

        // Define month range
        const monthStart = new Date(Date.UTC(year, month - 1, 1));
        const nextMonthStart = new Date(Date.UTC(year, month, 1));
        const daysInMonth = new Date(year, month, 0).getDate();

        // Fetch all active slots
        const slots = await Slot.find({ isActive: true }).select(
            "_id name startTime endTime quotaForSlot"
        );

        // Fetch bookings grouped by date + slotId
        const bookings = await getBookingsGroupedByDate(monthStart, nextMonthStart);

        console.log("Bookings", bookings);

        // Convert bookings array → map for quick lookup
        const bookingMap = {};
        bookings.forEach(b => {
            const key = `${b._id.date}_${b._id.slotId}`;
            bookingMap[key] = b.totalBookings;
        });

        console.log("Booking Map", bookingMap);

        // Fetch holidays
        const holidays = await Holiday.find({
            date: { $gte: monthStart, $lt: nextMonthStart }
        }).select("date name -_id");

        const holidayMap = {};
        holidays.forEach(h => {
            const date = h.date.toISOString().substring(0, 10);
            holidayMap[date] = h.name;
        });

        console.log("Holiday Map", holidayMap);

        // Fetch weekoffs
        const weekoffs = await Weekoff.find({ isActive: true });



        console.log("Weekoffs", weekoffs);

        const dayNames = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
        ];

        // Build response
        const results = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(Date.UTC(year, month - 1, day));
            const isoDate = currentDate.toISOString().substring(0, 10);

            console.log("Processing date:", isoDate);


            const dayIndex = getDay(currentDate); // 0 = Sunday, 6 = Saturday
            console.log("Day Index:", dayIndex);

            const dayName = dayNames[dayIndex];

            // figure out which week of month this date falls in
            const weekOfMonth = getWeekOfMonth(currentDate);


            let isBlocked = false;
            let blockedReason = "";

            // Weekoff check
            const matchingWeekoff = weekoffs.find(w =>
                w.weekday === dayIndex &&
                (w.weeks.length === 0 || w.weeks.includes(weekOfMonth))
            );

            if (matchingWeekoff) {
                isBlocked = true;
                blockedReason = `Weekoff (${dayName.charAt(0).toUpperCase() + dayName.slice(1)})`;
            }

            // Holiday check
            if (holidayMap[isoDate]) {
                isBlocked = true;
                blockedReason = `Holiday (${holidayMap[isoDate]})`;
            }

            // Build slot-wise availability for this date
            const slotWise = slots.map(slot => {
                const key = `${isoDate}_${slot._id}`;
                // console.log(key, bookingMap[key]);

                const booked = bookingMap[key] || 0;
                const available = isBlocked
                    ? 0
                    : Math.max(parseInt(slot.quotaForSlot) - booked, 0);

                return {
                    slotId: slot._id,
                    // slotName: slot.name,
                    // startTime: slot.startTime,
                    // endTime: slot.endTime,
                    // quota: slot.quotaForSlot,
                    // booked,
                    available
                };
            });

            results.push({
                date: isoDate,
                isBlocked,
                blockedReason,
                slots: slotWise
            });
        }

        res.json({ success: true, data: results });
    } catch (err) {
                console.error("Slot availability error in get by month :", err);

        res.status(500).json({ error: "Internal server error" });
    }
};

export const slotAvailabilityByDays = async (req, res) => {
    try {
        const startDateStr = req.query.startDate; // client sends start date as YYYY-MM-DD
        if (!startDateStr) {
            return res
                .status(400)
                .json({ error: "Please provide 'startDate' query parameter." });
        }

        const startDate = new Date(startDateStr);
        if (isNaN(startDate)) {
            return res.status(400).json({ error: "Invalid 'startDate' format." });
        }

        // Fetch all active slots
        const slots = await Slot.find({ isActive: true }).select(
            "_id name startTime endTime quotaForSlot"
        );

        // Fetch bookings for 15 days from start date
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 15);

        const bookings = await getBookingsGroupedByDate(startDate, endDate);

        // Convert bookings array → map for quick lookup
        const bookingMap = {};
        bookings.forEach(b => {
            const key = `${b._id.date}_${b._id.slotId}`;
            bookingMap[key] = b.totalBookings;
        });

        // Fetch holidays
        const holidays = await Holiday.find({
            date: { $gte: startDate, $lt: endDate }
        }).select("date name -_id");

        const holidayMap = {};
        holidays.forEach(h => {
            const date = h.date.toISOString().substring(0, 10);
            holidayMap[date] = h.name;
        });
        // Fetch weekoffs
        const weekoffs = await Weekoff.find({ isActive: true });

        const dayNames = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
        ];

        // Build response
        const results = [];
        for (let i = 0; i < 15; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const isoDate = currentDate.toISOString().substring(0, 10);

            const dayIndex = getDay(currentDate); // 0 = Sunday, 6 = Saturday

            const dayName = dayNames[dayIndex];
            const weekOfMonth = getWeekOfMonth(currentDate);

            let isBlocked = false;
            let blockedReason = "";

            // Weekoff check
            const matchingWeekoff = weekoffs.find(w =>
                w.weekday === dayIndex && w.weeks.includes(weekOfMonth)
            );

            if (matchingWeekoff) {
                isBlocked = true;
                blockedReason = `Weekoff (${dayName.charAt(0).toUpperCase() + dayName.slice(1)})`;
            }

            // Holiday check
            if (holidayMap[isoDate]) {
                isBlocked = true;
                blockedReason = `Holiday (${holidayMap[isoDate]})`;
            }

            // Build slot-wise availability for this date
            const slotWise = !isBlocked ?
                slots.map(slot => {
                    const key = `${isoDate}_${slot._id}`;
                    const booked = bookingMap[key] || 0;
                    const available = isBlocked
                        ? 0
                        : Math.max(parseInt(slot.quotaForSlot) - booked, 0);

                    return {
                        slotId: slot._id,
                        slotName: slot.name,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        available
                    };
                }) : null;

            results.push({
                date: isoDate,
                isBlocked,
                blockedReason,
                slots: slotWise
            });
        }

        res.json({ success: true, data: results });
    } catch (err) {
        console.error("Slot availability error :", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
