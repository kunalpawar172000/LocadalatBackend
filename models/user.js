import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
});

// Export with ES Modules
export default mongoose.model("User", userSchema);
