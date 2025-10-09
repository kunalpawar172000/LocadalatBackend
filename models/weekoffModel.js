import mongoose from "mongoose";

// const weekoffSchema = new mongoose.Schema({
//   dayOfWeek: { type: Number, min: 0, max: 6, required: true,unique: true }, // 0=Sunday ... 6=Saturday

//   recurring: { type: Boolean, default: true }, //for every month

//   // Case 1: Global recurring → applies every week in every month
//   everyWeek: { type: Boolean, default: false },

//   // Case 2: Specific weeks of month → e.g. 1st, 3rd
//   weeksOfMonth: [{ type: Number, min: 1, max: 5 }],

//   // Case 3: Non-recurring → date-based
//   validFrom: { type: Date },
//   validTo: { type: Date },

//   active: { type: Boolean, default: true },
// }, { timestamps: true });



const weekoffSchema = new mongoose.Schema({
  weekday: { type: Number, min: 0, max: 6, required: true, unique: true }, // 0=Sunday ... 6=Saturday
  weeks: [{ type: Number, min: 0, max: 5, required: true }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


const Weekoff = mongoose.model("Weekoff", weekoffSchema);
export { Weekoff };
