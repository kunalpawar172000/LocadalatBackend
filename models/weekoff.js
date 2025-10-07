import mongoose from "mongoose";

const weekoffSchema = new mongoose.Schema({
  dayOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday
  weekOfMonth: [{ type: Number, min: 1, max: 5 }], // Empty = every week
  recurring: { type: Boolean, default: true },
  validFrom: { type: Date }, // used only if recurring=false
  validTo: { type: Date },   // used only if recurring=false
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Weekoff = mongoose.model("Weekoff", weekoffSchema);
export { Weekoff };
