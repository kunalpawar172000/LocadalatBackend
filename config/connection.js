import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
const connectDB = () => {

    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGOURL, {}).then(() => {
            console.log("Database connected");
            resolve("Database connected");
        }).catch((err) => {
            reject("Database connection failed", err);
        });
    })

}

export default connectDB;