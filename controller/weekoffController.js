
import { Weekoff } from "../models/weekoff.js";


export const createWeekOff = async (req, res) => {
    try {
        const { dayOfWeek, weeksOfMonth, recurring, everyWeek, validFrom, validTo } = req.body;

        // 2. Validate dayOfWeek flag
        if (!("dayOfWeek" in req.body)) {
            return res.status(400).json({
                isSuccess: false,
                message: "dayOfWeek parameter is missing"
            });
        }
        // 2. Validate recurring flag
        if (!("recurring" in req.body)) {
            return res.status(400).json({
                isSuccess: false,
                message: "recurring parameter is missing"
            });
        }

        let weekOffDoc;

        if (recurring) {
            // 3a. Every week case
            if (everyWeek) {
                weekOffDoc = new Weekoff({
                    dayOfWeek,
                    recurring,
                    everyWeek
                });
            }
            // 3b. Specific weeksOfMonth case
            else {
                if (!weeksOfMonth || !Array.isArray(weeksOfMonth) || weeksOfMonth.length === 0) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "weeksOfMonth is required for recurring week off when everyWeek is false"
                    });
                }
                weekOffDoc = new Weekoff({
                    dayOfWeek,
                    weeksOfMonth,
                    recurring: true,
                    everyWeek: false
                });
            }
        } else {
            // 4. Non-recurring → validFrom & validTo required
            if (!validFrom || !validTo) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "validFrom and validTo are required for non-recurring week off"
                });
            }
            if (new Date(validFrom) > new Date(validTo)) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "validFrom cannot be after validTo"
                });
            }

            weekOffDoc = new Weekoff({
                dayOfWeek,
                recurring: false,
                validFrom,
                validTo
            });
        }

        // 5. Save to DB
        const result = await weekOffDoc.save();

        return res.status(201).json({
            isSuccess: true,
            message: "Week off created successfully"
        });

    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: err.message
        });
    }
};

export const updateWeekoff = async (req, res) => {
    try {
        const { id } = req.params;
        const { dayOfWeek, weeksOfMonth, recurring, everyWeek, validFrom, validTo } = req.body;

        // 1. Validate dayOfWeek flag
        if (!("dayOfWeek" in req.body)) {
            return res.status(400).json({
                isSuccess: false,
                message: "dayOfWeek parameter is missing"
            });
        }
        // 2. Validate recurring flag
        if (!("recurring" in req.body)) {
            return res.status(400).json({
                isSuccess: false,
                message: "recurring parameter is missing"
            });
        }

        let updateData = { dayOfWeek, recurring };

        if (recurring) {
            // 3a. Every week case
            if (everyWeek) {
                updateData.everyWeek = true;
                updateData.weeksOfMonth = []; // clear weeksOfMonth if it exists
            }
            // 3b. Specific weeksOfMonth case
            else {
                if (!weeksOfMonth || !Array.isArray(weeksOfMonth) || weeksOfMonth.length === 0) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "weeksOfMonth is required for recurring week off when everyWeek is false"
                    });
                }
                updateData.weeksOfMonth = weeksOfMonth;
                updateData.everyWeek = false;
            }
            // Remove date fields for recurring
            updateData.validFrom = undefined;
            updateData.validTo = undefined;
        } else {
            // 4. Non-recurring → validFrom & validTo required
            if (!validFrom || !validTo) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "validFrom and validTo are required for non-recurring week off"
                });
            }
            if (new Date(validFrom) > new Date(validTo)) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "validFrom cannot be after validTo"
                });
            }
            updateData.validFrom = validFrom;
            updateData.validTo = validTo;
            updateData.everyWeek = false;
            updateData.weeksOfMonth = [];
        }

        // 5. Update in DB
        const updatedDoc = await Weekoff.findOneAndUpdate(
            { _id: id, active: true },
            updateData,
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({ isSuccess: false, message: "Weekoff not found" });
        }

        return res.status(200).json({
            isSuccess: true,
            message: "Weekoff updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: err.message
        });
    }
};

export const deleteWeekOff = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDoc = await Weekoff.findOneAndUpdate(
            { _id: id, active: true },
            { active: false },
            { new: true }
        );
        if (!deletedDoc) {
            return res.status(404).json({ isSuccess: false, message: "Weekoff not found" });
        }
        return res.status(200).json({
            isSuccess: true,
            message: "Weekoff deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: err.message
        });
    }
}