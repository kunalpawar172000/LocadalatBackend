import { Holiday } from "../models/holidayModel.js";
import Booking from "../models/bookingModel.js";
import { checkIsDayWeekOff, isHolidayExistInDb, checkIsDayHoliday, validateBodyParams } from "./../utility/helper.js"
import { ERRORS, MESSAGES } from "../config/constants.js";

export const createHoliday = async (req, res) => {
    try {
        const { name, date } = req.body;

        // If any parameter is missing, the response is sent and function returns
        const requiredParams = ["name", "date"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params

        if (!name) return res.status(400).json({ isSuccess: false, message: MESSAGES.NAME_REQUIRED });
        if (!date) return res.status(400).json({ isSuccess: false, message: MESSAGES.DATE_REQUIRED });

        if (date) {
            const holidayDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (holidayDate <= today) return res.status(400).json({ isSuccess: false, message: MESSAGES.INVALID_HOLIDAY_DATE });
        }
        //validation here to not add holidy if that day has bookings or check if that date has weekoffs

        const bookings = await Booking.find({ bookingDate: new Date(date) });

        if (bookings && bookings.length) {
            return res.status(409).json({ isSuccess: false, message: MESSAGES.CANNOT_ADD_HOLIDAY_ON_BOOKING });
        }

        const isDayWeekOff = await checkIsDayWeekOff(date);

        if (isDayWeekOff) {
            return res.status(409).json({ isSuccess: false, message: MESSAGES.CANNOT_ADD_HOLIDAY_ON_WEEKOFF });
        }

        // Check for duplicate holiday on the same date
        const existingHoliday = await checkIsDayHoliday(date);
        if (existingHoliday) return res.status(409).json({ isSuccess: false, message: MESSAGES.HOLIDAY_ALREADY_EXISTS });

        const holiday = new Holiday({ name, date });
        const result = await holiday.save();
        if (!result) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_CREATE_HOLIDAY });
        }
        return res.status(201).json({ isSuccess: true, message: MESSAGES.HOLIDAY_ADDED });
    } catch (err) {
        console.log("Create holiday error :", err);
        return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
}

export const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({ isActive: true });
        if (!holidays) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.FAILED_FETCH_HOLIDAYS });
        }
        return res.status(200).json({ isSuccess: true, holidays });
    } catch (err) {
        console.log("Get holiday error : ", err);
        return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
}

export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date } = req.body;
        // If any parameter is missing, the response is sent and function returns
        const requiredParams = ["name", "date"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params
        const isHolidayExist = await isHolidayExistInDb(id);
        if (!isHolidayExist) return res.status(404).json({ isSuccess: false, message: MESSAGES.HOLIDAY_NOT_FOUND });

        if (date) {
            const holidayDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (holidayDate <= today) return res.status(400).json({ isSuccess: false, message: MESSAGES.INVALID_HOLIDAY_DATE });
        }
        if (new Date(isHolidayExist.date).toISOString() !== new Date(date).toISOString()) {
            const isDayWeekOff = await checkIsDayWeekOff(date);
            if (isDayWeekOff) {
                return res.status(409).json({ isSuccess: false, message: MESSAGES.CANNOT_ADD_HOLIDAY_ON_WEEKOFF });
            }
            const existingHoliday = await checkIsDayHoliday(date);
            if (existingHoliday) return res.status(409).json({ isSuccess: false, message: MESSAGES.HOLIDAY_ALREADY_EXISTS });

            const bookings = await Booking.find({ bookingDate: new Date(date) });

            if (bookings && bookings.length) {
                return res.status(409).json({ isSuccess: false, message: MESSAGES.CANNOT_ADD_HOLIDAY_ON_BOOKING });
            }
        }
        const holiday = await Holiday.findByIdAndUpdate(id, { name, date });
        if (!holiday) return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_UPDATE_HOLIDAY });
        return res.status(200).json({ isSuccess: true, message: MESSAGES.HOLIDAY_UPDATED });
    } catch (err) {
        console.log("Update Holiday error :", err);
        return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
}

export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        //check if holiday is in past date then cannot delete
        const isHolidayExist = await isHolidayExistInDb(id);
        if (!isHolidayExist) return res.status(404).json({ isSuccess: false, message: MESSAGES.HOLIDAY_NOT_FOUND });
        if (new Date(isHolidayExist.date) < new Date()) {
            return res.status(400).json({ isSuccess: false, message: MESSAGES.CANNOT_DELETE_PAST_HOLIDAY });
        }

        const holiday = await Holiday.findOneAndUpdate(
            { _id: id, isActive: true },   // only match isActive holidays
            { isActive: false },
            { new: true }
        );
        if (!holiday) return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_DELETE_HOLIDAY });
        return res.status(200).json({ isSuccess: true, message: MESSAGES.HOLIDAY_DELETED });
    } catch (err) {
        console.log("Holiday delete error :", err);
        return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
}
