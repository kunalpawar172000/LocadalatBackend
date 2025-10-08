import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "10:00"
    createdAt: { type: Date, default: Date.now },
    quotaForSlot: { type: String, required: true },

});

export default mongoose.model("Slot", SlotSchema);
