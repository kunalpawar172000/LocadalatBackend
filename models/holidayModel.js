import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date },
    recurring: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });



const Holiday = mongoose.model("Holiday", holidaySchema);

export { Holiday };
