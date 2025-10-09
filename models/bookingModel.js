import mongoose from "mongoose";
 
const bookingSchema = new mongoose.Schema({
  // basic contact / booking information
  phone: { type: String },
 
  // scheduled appointment date
  bookingDate: { type: Date },
 
  vehicleNo: { type: String },
  chalanNo: { type: String },
 
  // optional court case number
  courtCaseNo: { type: String },
 
  // slot identifier (if slots are managed entities)
  slotId: { type: String },
 
  // guest/display name and email
  name: { type: String },
  email: { type: String },
 
  // display name of the registered user
  userName: { type: String },
 
  // token number for display/queueing
  tokenNumber: { type: String, index: true },
 
  // status
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
 
  // created date
  createdAt: { type: Date, default: Date.now }
});
 
// index bookingDate for faster range queries
bookingSchema.index({ bookingDate: 1 });
 
export default mongoose.model("Booking", bookingSchema);