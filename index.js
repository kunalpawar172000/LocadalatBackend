import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/user.js";
connectDB();

const app = express();

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT;
console.log(process.env.PORT);
app.use(cors({
    origin: ["http://localhost:3000", "https://locadalat-frontend-dev.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from server");
});


app.use("/api/user", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
