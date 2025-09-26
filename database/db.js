import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
const connectDB = () => {

    console.log(process.env.MONGOURL);

    mongoose.connect(process.env.MONGOURL, {}).then(() => {
        console.log("Database connected");
    }).catch((err) => {
        console.log("Database connection failed", err);
    });
}

export default connectDB;