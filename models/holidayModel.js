import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });



const Holiday = mongoose.model("Holiday", holidaySchema);

export { Holiday };
