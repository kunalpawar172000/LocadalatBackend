import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // optional reference to a registered user (stored as userId for clarity)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

  // basic contact / booking information
  // For registered users, `user` should be used. For guest bookings we keep
  // guest details inside `metadata` (guestName/guestEmail). phone remains top-level for quick access.
  phone: { type: String },

  // scheduled appointment date
  bookingDate: { type: Date },

  vehicleNo: { type: String },
  chalanNo: { type: String },
  // optional court case number (some bookings include a case reference)
  courtCaseNo: { type: String },
  // selected appointment slot (stored as top-level for easy querying)
  slot: { type: String },
  // optional slot identifier (if slots are managed entities)
  slotId: { type: String },
  // guest/display name and email for easy access (registered users still referenced by `user`)
  name: { type: String },
  email: { type: String },
  // display name of the registered user (kept alongside `user` ref for clarity)
  userName: { type: String },

  // token number for display/queueing
  tokenNumber: { type: String, index: true },

  // status and payment/amount metadata
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  amount: { type: Number, required: true, default: 0 },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

// index bookingDate for faster range queries
bookingSchema.index({ bookingDate: 1 });

export default mongoose.model("Booking", bookingSchema);
