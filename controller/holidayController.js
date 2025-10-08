import { Holiday } from "../models/holidayModel.js";

import { checkIsDayWeekOff, isHolidayExistInDb, checkIsDayHoliday, validateBodyParams } from "./../utility/helper.js"

export const createHoliday = async (req, res) => {
    try {
        const { name, date, recurring } = req.body;

        // If any parameter is missing, the response is sent and function returns
        const requiredParams = ["name", "recurring", "date"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params

        if (!name) return res.status(400).json({ isSuccess: false, message: "Holiday name is required" });
        if (!date) return res.status(400).json({ isSuccess: false, message: "Date is required for holiday" });

        if (date) {
            const holidayDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (holidayDate <= today) return res.status(400).json({ isSuccess: false, message: "Holiday date cannot be in the past or today" });
        }
        //validation here to not add holidy if that day has bookings or check if that date has weekoffs

        const isDayWeekOff = await checkIsDayWeekOff(date);

        if (isDayWeekOff) {
            return res.status(409).json({ isSuccess: false, message: "Cannot add holiday on a weekly off day" });
        }

        // Check for duplicate holiday on the same date
        const existingHoliday = await checkIsDayHoliday(date);
        if (existingHoliday) return res.status(409).json({ isSuccess: false, message: "A holiday already exists on this date" });

        const holiday = new Holiday({ name, date, recurring });
        const result = await holiday.save();
        if (!result) {
            return res.status(500).json({ isSuccess: false, message: "Failed to create holiday" });
        }
        return res.status(201).json({ isSuccess: true, message: "Holiday added successfully" });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}

export const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({ isActive: true });
        if (!holidays) {
            return res.status(404).json({ isSuccess: false, message: "Failed to fetch holidays" });
        }
        return res.status(200).json({ isSuccess: true, holidays });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}

export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, recurring } = req.body;
        // If any parameter is missing, the response is sent and function returns
        const requiredParams = ["name", "recurring", "date"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params
        const isHolidayExist = isHolidayExistInDb(id);
        if (!isHolidayExist) return res.status(404).json({ isSuccess: false, message: "Holiday not found" });

        if (date) {
            const holidayDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (holidayDate <= today) return res.status(400).json({ isSuccess: false, message: "Holiday date cannot be in the past or today" });
        }
        if (new Date(isHolidayExist.date) !== new Date(date)) {
            const isDayWeekOff = await checkIsDayWeekOff(date);
            if (isDayWeekOff) {
                return res.status(409).json({ isSuccess: false, message: "Cannot add holiday on a weekly off day" });
            }
            const existingHoliday = await checkIsDayHoliday(date);
            if (existingHoliday) return res.status(409).json({ isSuccess: false, message: "A holiday already exists on this date" });
        }
        const holiday = await Holiday.findByIdAndUpdate(id, { name, date, recurring, region, isActive }, { new: true });
        if (!holiday) return res.status(500).json({ isSuccess: false, message: "Failed to update holiday" });
        return res.status(200).json({ isSuccess: true, message: "Holiday updated successfully" });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}

export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        //check if holiday is in past date then cannot delete
        const isHolidayExist = await isHolidayExistInDb(id);
        if (!isHolidayExist) return res.status(404).json({ isSuccess: false, message: "Holiday not found" });
        if (new Date(isHolidayExist.date) < new Date()) {
            return res.status(400).json({ isSuccess: false, message: "Cannot delete a holiday in the past" });
        }

        const holiday = await Holiday.findOneAndUpdate(
            { _id: id, isActive: true },   // only match isActive holidays
            { isActive: false },
            { new: true }
        );
        if (!holiday) return res.status(500).json({ isSuccess: false, message: "Failed to delete holiday" });
        return res.status(200).json({ isSuccess: true, message: "Holiday deleted successfully." });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}
