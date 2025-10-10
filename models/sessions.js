import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        sessionId: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
