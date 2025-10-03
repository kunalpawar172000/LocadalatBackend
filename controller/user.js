import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./../config/config.env" });
export const createUser = async (req, res) => {
    try {
        const { password, email } = req.body;

        // Basic validation
        if (!password || !email) {
            return res.status(400).json({ isSuccess: false, message: "Name and Email are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ isSuccess: false, message: "User with this email already exists" });
        }

        const newUser = new User({ password, email });
        await newUser.save();

        res.status(201).json({
            isSuccess: true,
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ isSuccess: false, message: "Internal Server Error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "_id email"); // only id and email

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ isSuccess: false, message: "Internal Server Error test mongodb connection" });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("secret", process.env.JWT_SECRET);
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // console.log("Login attempt:", email);

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Email or password is invalid" });
        }


        // create JWT token
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
        );

        // send cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true only in prod
            sameSite: "none",
        });

        res.json({ message: "Login successful", user: { id: user._id, email: user.email } });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};