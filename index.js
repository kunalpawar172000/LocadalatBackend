import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connection.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoute from "./routes/bookingRoute.js";
// import adminRoutes from "./routes/admin.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import weekoffRoutes from "./routes/weekoffRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import { authenticateToken } from "./middleware/auth.js";
import cookieParser from "cookie-parser";


connectDB().catch((message, error) => {
    console.log(message);

});

const app = express();

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT;
app.use(cors({
    origin: ["http://localhost:3000",
        // "https://locadalat-frontend-dev.vercel.app",
        // "https://locadalat-frontend.vercel.app",
        "https://locadalat-frontend-orpin.vercel.app",
        "https://lokadalat.dlsapune.org"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded()); // <-- parse form-encoded bodies


app.use(authenticateToken);

app.get("/", (req, res) => {
    res.send("Hello from server");
});

app.use("/api/user", userRoutes);
app.use("/api/booking", bookingRoute);
// app.use("/api/admin", adminRoutes);
app.use("/api/holiday", holidayRoutes);
app.use("/api/weekoff", weekoffRoutes);
app.use("/api/slot", slotRoutes);

// import Slot from "./models/slotModel.js";
//     // Create slot documents
//     const slots = [
//       {
//         name: "Morning Slot",
//         startTime: "10:00",
//         endTime: "13:00",  // 1 PM
//         quotaForSlot: "50",  // example quota
//       },
//       {
//         name: "Evening Slot",
//         startTime: "14:00", // 2 PM
//         endTime: "17:00",   // 5 PM
//         quotaForSlot: "50", // example quota
//       }
//     ];
//     // Insert into MongoDB
//     await Slot.insertMany(slots);
//     console.log("Slots inserted successfully ✅");

// after all routes
import { MESSAGES } from "./config/constants.js";

app.use(/.*/, (req, res) => {
    res.status(404).json({
        isSuccess: false,
        message: MESSAGES.NOT_FOUND_ROUTE,
        path: req.originalUrl,
        method: req.method,
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
