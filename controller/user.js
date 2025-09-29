import User from "../models/user.js";

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
        const users = await User.find();

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

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // compare password directly
        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}