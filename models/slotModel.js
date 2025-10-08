import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "10:00"
    quotaForSlot: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Slot", SlotSchema);
