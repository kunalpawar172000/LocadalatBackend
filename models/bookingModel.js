import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // optional reference to a registered user
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

  // basic contact / booking information
  // For registered users, `user` should be used. For guest bookings we keep
  // guest details inside `metadata` (guestName/guestEmail). phone remains top-level for quick access.
  phone: { type: String },

  vehicleNo: { type: String },
  chalanNo: { type: String },

  // token number for display/queueing
  tokenNumber: { type: String, index: true },

  // status and payment/amount metadata
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  amount: { type: Number, required: true, default: 0 },
  metadata: { type: Object, default: {} },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
