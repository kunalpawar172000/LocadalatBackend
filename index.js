import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/user.js";
import {authenticateToken} from "./middleware/auth.js";
//  Load environment variables first
dotenv.config({ path: "./config/config.env" });

//  Connect to database
connectDB()
    .then((database) => {
        console.log(
            "Test SS");

        //  Create Express app
        const app = express();

        //  Middleware
        app.use(cors({
            origin: ["http://localhost:3000","https://locadalat-frontend-dev.vercel.app"
            ],
            credentials: true // allow cookies for cross-domain
        }));
        app.use(express.json());
        // app.use(authenticateToken); // apply auth middleware globally
        //  Routes
        app.get("/", (req, res) => {
            res.send("Hello from server");
        });
        app.use("/api/user", userRoutes);

        //  Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    })
    .catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1); // stop server if DB connection fails
    });
