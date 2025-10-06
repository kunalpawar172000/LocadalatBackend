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
        res.cookie("access_token", token,{httpOnly:true,sameSite:"none",secure:true});


        res.json({ message: "Login successful", user: { id: user._id, email: user.email }, access_token: token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ name: error.name, message: error.message });
    }
};