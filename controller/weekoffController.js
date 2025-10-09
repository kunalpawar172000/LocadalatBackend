import { Weekoff } from "./../models/weekoffModel.js";
import { validateBodyParams } from "../utility/helper.js";
import { ERRORS, MESSAGES } from "./../config/constants.js"
export const createWeekoff = async (req, res) => {
    try {

        const { weekday, weeks } = req.body;

        // required fields check
        const validatebody = await validateBodyParams(req, res, ["weekday", "weeks"]);
        if (validatebody)
            return


        // weekday validation (0–6)
        if (weekday < 0 || weekday > 6) {
            return res.status(400).json({ isSuccess: false, message: MESSAGES.WEEKDAY_VALIDATION_FAILED });
        }

        // weeks validation (array with values 1–5)
        if (!Array.isArray(weeks) || weeks.some((w) => w < 0 || w > 5)) {
            return res.status(400).json({ isSuccess: false, message: MESSAGES.WEEK_VALIDATION_FAILED });
        }

        const weekoff = new Weekoff({ weekday, weeks });
        const result = await weekoff.save();

        if (!result) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_CREATE_WEEKOFF });
        }

        res.status(201).json({ isSuccess: true, message:MESSAGES.WEEKOFF_CREATED});
    } catch (error) {
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL_SERVER_ERROR });
    }
};


export const getWeekoffs = async (req, res) => {
    try {
        const weekoffs = await Weekoff.find();
        res.status(200).json({ isSuccess: true, data: weekoffs });
    } catch (error) {
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL_SERVER_ERROR });
    }
};


export const updateWeekoff = async (req, res) => {
    try {
        const { weekday, weeks } = req.body;

        const validatebody = await validateBodyParams(req, res, ["weekday", "weeks"]);
        if (validatebody) return;

        // validations again
        if (weekday < 0 || weekday > 6) {
            return res.status(400).json({ isSuccess: false, message: "Weekday must be between 0 and 6" });
        }
        if (!Array.isArray(weeks) || weeks.some((w) => w < 0 || w > 5)) {
            return res.status(400).json({ isSuccess: false, message: "Weeks must be an array of numbers between 0 and 5" });
        }

        const isWeekOffExists = await Weekoff.findById(req.params.id);
        if (!isWeekOffExists) {
            return res.status(404).json({ isSuccess: false, message: "Weekoff not found" });
        }

        const weekoff = await Weekoff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!weekoff) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_UPDATE_WEEKOFF });
        }
        res.status(200).json({ isSuccess: true, data: weekoff });
    } catch (error) {
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL_SERVER_ERROR });
    }
};


export const deleteWeekoff = async (req, res) => {
    try {
        const isWeekOffExists = await Weekoff.findById(req.params.id);
        if (!isWeekOffExists) {
            return res.status(404).json({ isSuccess: false, message: "Weekoff not found" });
        }

        const result = await Weekoff.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_DELETE_WEEKOFF });
        }

        res.status(200).json({ isSuccess: true, message: "Weekoff deleted successfully" });
    } catch (error) {
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL_SERVER_ERROR });
    }
};

