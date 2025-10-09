import { Weekoff } from "./../models/weekoffModel.js";
import { validateBodyParams } from "../utility/helper.js";
import { ERRORS, MESSAGES } from "./../config/constants.js"
import { checkIsWeekOffExistForWeekDay } from "./../utility/helper.js"; // adjust path

// utils/validateWeekoff.js
export const validateWeekoffInput = (weekday, weeks) => {
    // Validate weekday
    if (typeof weekday !== "number" || isNaN(weekday) || weekday < 0 || weekday > 6) {
        return { valid: false, message: MESSAGES.WEEKDAY_VALIDATION_FAILED };
    }

    // Validate weeks
    if (!Array.isArray(weeks) || weeks.some(w => typeof w !== "number" || w < 1 || w > 5)) {
        return { valid: false, message: MESSAGES.WEEK_VALIDATION_FAILED };
    }

    return { valid: true };
};


export const createWeekoff = async (req, res) => {
    try {
        const { weekday, weeks } = req.body;

        // Required fields check
        const validatebody = await validateBodyParams(req, res, ["weekday", "weeks"]);
        if (validatebody) return;

        // Validate weekday and weeks using common helper
        const { valid, message } = validateWeekoffInput(weekday, weeks);

        if (!valid) {
            return res.status(400).json({ isSuccess: false, message });
        }

        // Check if weekday already exists
        const weekoffExists = await Weekoff.findOne({ weekday });
        if (weekoffExists) {
            return res.status(400).json({
                isSuccess: false,
                message: MESSAGES.WEEKOFF_ALREADY_EXISTS
            });
        }




        // Create new Weekoff
        const weekoff = new Weekoff({ weekday, weeks });
        const result = await weekoff.save();

        if (!result) {
            return res.status(500).json({
                isSuccess: false,
                message: MESSAGES.FAILED_CREATE_WEEKOFF
            });
        }

        res.status(201).json({
            isSuccess: true,
            message: MESSAGES.WEEKOFF_CREATED,
            data: result
        });
    } catch (error) {
        console.error("Weekoff create error :", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};


export const getWeekoffs = async (req, res) => {
    try {
        const weekoffs = await Weekoff.find();
        res.status(200).json({ isSuccess: true, data: weekoffs });
    } catch (error) {
        console.error("Get Weekoff error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};




export const updateWeekoff = async (req, res) => {
    try {
        const { weekday, weeks } = req.body;

        // Required params check
        const validatebody = await validateBodyParams(req, res, ["weekday", "weeks"]);
        if (validatebody) return;

        // Run validation helper
        const { valid, message } = validateWeekoffInput(weekday, weeks);
        if (!valid) {
            return res.status(400).json({ isSuccess: false, message });
        }

        // Find weekoff by id
        const weekoffById = await Weekoff.findById(req.params.id);
        if (!weekoffById) {
            return res.status(404).json({
                isSuccess: false,
                message: MESSAGES.WEEKOFF_NOT_FOUND
            });
        }

        // If weekday changed, check duplicate
        if (weekoffById.weekday !== weekday) {
            const existsForWeekday = await checkIsWeekOffExistForWeekDay(weekday);
            if (existsForWeekday) {
                return res.status(400).json({
                    isSuccess: false,
                    message: MESSAGES.WEEKOFF_ALREADY_EXISTS
                });
            }
        }

        // Update weekoff
        const weekoff = await Weekoff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!weekoff) {
            return res.status(500).json({
                isSuccess: false,
                message: MESSAGES.FAILED_UPDATE_WEEKOFF
            });
        }

        res.status(200).json({ isSuccess: true, data: weekoff });
    } catch (error) {
        console.error("Update Weekoff Error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};



export const deleteWeekoff = async (req, res) => {
    try {

        const isWeekOffExists = await Weekoff.findById(req.params.id);
        if (!isWeekOffExists) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.WEEKOFF_NOT_FOUND });
        }

        const result = await Weekoff.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_DELETE_WEEKOFF });
        }

        res.status(200).json({ isSuccess: true, message: MESSAGES.WEEKOFF_DELETED });
    } catch (error) {
        console.log("Delete weekoff error ", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};

