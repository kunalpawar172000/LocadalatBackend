import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/user.js";
import authenticateToken from "./middleware/auth.js";
import cookieParser from "cookie-parser";
connectDB();

const app = express();

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT;
console.log(process.env.PORT);
app.use(cors({
    origin: ["http://localhost:3000",
        "https://locadalat-frontend-dev.vercel.app",
        "http://locadalat-frontend-dev.vercel.app",
        "https://locadalat-frontend-dev.vercel.app/",
        "http://locadalat-frontend-dev.vercel.app/",
        "https://locadalat-frontend.vercel.app",
        "https://locadalat-frontend-jz1dm68lj-tejas-pawars-projects-96af44dc.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser());
app.use(express.json());
// app.use(authenticateToken);


app.get("/", (req, res) => {
    res.send("Hello from server");
});

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
