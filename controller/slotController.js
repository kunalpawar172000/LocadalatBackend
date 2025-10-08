import Slot from "../models/slotModel.js";
import { ERRORS, MESSAGES } from "../config/constants.js";

export const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ isActive: true });
        if (!slots) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.FAILED_FETCH_SLOTS });
        }
        res.status(200).json({
            isSuccess: true,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};