import Slot from "../models/slotModel.js";

export const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ isActive: true });
        if (!slots) {
            return res.status(404).json({ isSuccess: false, message: "Failed to fetch slots" });
        }
        res.status(200).json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({ isSuccess: false, message: "Internal Server Error" });
    }
};