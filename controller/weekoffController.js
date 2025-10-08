
import { Weekoff } from "../models/weekoffModel.js";
import { validateBodyParams } from "../utility/helper.js";
import { ERRORS, MESSAGES } from "../config/constants.js";

export const getWeekoffs = async (req, res) => {
    try {
        const weekoffs = await Weekoff.find({ isActive: true });
        if(!weekoffs){
            return res.status(404).json({
                isSuccess: false,
                message: MESSAGES.FAILED_FETCH_WEEKOFFS
            });
        }
        return res.status(200).json({
            isSuccess: true,
            data: weekoffs
        });
    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: ERRORS.INTERNAL
        });
    }
};

export const createWeekOff = async (req, res) => {
    try {
        const { dayOfWeek, weeksOfMonth, recurring, everyWeek, validFrom, validTo } = req.body;

        // If any parameter is missing, the response is sent and function returns
        const requiredParams = ["dayOfWeek", "recurring"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params

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
                        message: MESSAGES.WEEKS_OF_MONTH_REQUIRED
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
                    message: MESSAGES.VALID_FROM_TO_REQUIRED
                });
            }
            if (new Date(validFrom) > new Date(validTo)) {
                return res.status(400).json({
                    isSuccess: false,
                    message: MESSAGES.VALID_FROM_AFTER_VALID_TO
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

        if (!result) {
            return res.status(500).json({
                isSuccess: false,
                message: MESSAGES.FAILED_CREATE_WEEKOFF
            });
        }
        return res.status(201).json({
            isSuccess: true,
            message: MESSAGES.WEEKOFF_CREATED
        });

    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: ERRORS.INTERNAL
        });
    }
};

export const updateWeekoff = async (req, res) => {
    try {
        const { id } = req.params;
        const { dayOfWeek, weeksOfMonth, recurring, everyWeek, validFrom, validTo } = req.body;

        // If any parameter is missing, the response is sent and function returns
        const requiredParams = ["dayOfWeek", "recurring"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params

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
                        message: MESSAGES.WEEKS_OF_MONTH_REQUIRED
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
                    message: MESSAGES.VALID_FROM_TO_REQUIRED
                });
            }
            if (new Date(validFrom) > new Date(validTo)) {
                return res.status(400).json({
                    isSuccess: false,
                    message: MESSAGES.VALID_FROM_AFTER_VALID_TO
                });
            }
            updateData.validFrom = validFrom;
            updateData.validTo = validTo;
            updateData.everyWeek = false;
            updateData.weeksOfMonth = [];
        }

        // 5. Update in DB
        const updatedDoc = await Weekoff.findOneAndUpdate(
            { _id: id, isActive: true },
            updateData,
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_UPDATE_WEEKOFF });
        }

        return res.status(200).json({
            isSuccess: true,
            message: MESSAGES.WEEKOFF_UPDATED
        });

    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: ERRORS.INTERNAL
        });
    }
};

export const deleteWeekOff = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDoc = await Weekoff.findOneAndUpdate(
            { _id: id, isActive: true },
            { isActive: false },
            { new: true }
        );
        if (!deletedDoc) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.WEEKOFF_NOT_FOUND });
        }
        return res.status(200).json({
            isSuccess: true,
            message: MESSAGES.WEEKOFF_DELETED
        });
    } catch (err) {
        return res.status(500).json({
            isSuccess: false,
            message: ERRORS.INTERNAL
        });
    }
}