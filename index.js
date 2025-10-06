import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/user.js";
import { authenticateToken } from "./middleware/auth.js";
import cookieParser from "cookie-parser";
// import bcrypt from "bcrypt";
import unless from "express-unless";

connectDB();


// const hash = bcrypt.hashSync("Tejas@1234", 10);
// bcrypt.compareSync("Tejas@1234", hash); 
// console.log(bcrypt.compareSync("Tejas@1234", hash),hash);

const app = express();

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT;
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
app.use(authenticateToken);


// authenticateToken.unless = unless;

// apply globally but exclude login, forgot-password, and OPTIONS
// app.use(
//     authenticateToken.unless({
//         path: [
//             { url: "/api/user/login", methods: ["POST"] },
//             { url: "/api/user/forgot-password", methods: ["POST"] },
//             { url: "*", methods: ["OPTIONS"] } // skip all OPTIONS
//         ]
//     })
// );

app.get("/", (req, res) => {
    res.send("Hello from server");
});

app.use("/api/user", userRoutes);

// after all routes
app.use(/.*/, (req, res) => {
    res.status(404).json({
        success: false,
        message: "No API found for this route",
        path: req.originalUrl,
        method: req.method,
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
