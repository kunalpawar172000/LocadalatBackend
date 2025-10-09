import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env variables
dotenv.config({ path: "./config/config.env" });

let isConnected = false; // For caching connection (important on Vercel)

const connectDB = async () => {
    if (isConnected) {
        console.log(" Using existing MongoDB connection");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGOURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10s timeout
        });

        isConnected = true;
        console.log(` MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(" Database connection failed:", err.message);
        throw err;
    }
};

export default connectDB;
