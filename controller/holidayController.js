import { Holiday } from "./../models/holiday.js";

export async function createHoliday(req, res) {
    try {
        const { name, date, recurring } = req.body;

        if (!name) return res.status(400).json({ isSuccess: false, message: "Holiday name is required" });
        if (!date) return res.status(400).json({ isSuccess: false, message: "Date is required for holiday" });

        if (date) {
            const holidayDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (holidayDate < today) return res.status(400).json({ isSuccess: false, message: "Holiday date cannot be in the past" });
        }

        const holiday = new Holiday({ name, date, recurring });
        await holiday.save();
        return res.status(201).json({ isSuccess: true, message: "Holiday created successfully" });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}

export async function getHolidays(req, res) {
    try {
        const holidays = await Holiday.find({ active: true });
        return res.status(200).json({ isSuccess: true, holidays });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}

export async function updateHoliday(req, res) {
    try {
        const { id } = req.params;
        const { name, date, recurring, region, active } = req.body;

        if (date) {
            const holidayDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (holidayDate < today) return res.status(400).json({ isSuccess: false, message: "Holiday date cannot be in the past" });
        }

        const holiday = await Holiday.findByIdAndUpdate(id, { name, date, recurring, region, active }, { new: true });
        if (!holiday) return res.status(404).json({ isSuccess: false, message: "Holiday not found" });
        return res.status(200).json({ isSuccess: true, holiday });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}

export async function deleteHoliday(req, res) {
    try {
        const { id } = req.params;
        const holiday = await Holiday.findOneAndUpdate(
            { _id: id, active: true },   // only match active holidays
            { active: false },
            { new: true }
        );
        if (!holiday) return res.status(404).json({ isSuccess: false, message: "Holiday not found" });
        return res.status(200).json({ isSuccess: true, message: "Holiday deleted successfully." });
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message });
    }
}
