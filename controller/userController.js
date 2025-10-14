import User from "./../models/userModel.js";
import Session from "./../models/sessions.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { ERRORS, MESSAGES, REGEX } from "../config/constants.js";
import { validateBodyParams } from "./../utility/helper.js"
dotenv.config({ path: "./../config/config.env" });

export const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const requiredParams = ["name", "email", "password"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);

        if (errorResponse) return; // stop execution if missing params
        // Basic validation
        if (!password || !email || !name) {
            return res.status(400).json({ isSuccess: false, message: MESSAGES.ALL_FIELDS_REQUIRED });
        }

        //Validate
        const errors = [];

        // Email validation
        const emailRegex = REGEX.EMAIL;
        if (!email || typeof email !== "string" || !emailRegex.test(email)) {
            errors.push(MESSAGES.INVALID_EMAIL);
        }

        // Password validation
        if (!password || typeof password !== "string" || password.length < 6) {
            errors.push(MESSAGES.INVALID_PASSWORD);
        }

        // If there are validation errors, return them
        if (errors.length > 0) {
            return res.status(400).json({
                isSuccess: false,
                message: errors.join(", ")
            });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ isSuccess: false, message: MESSAGES.USER_ALREADY_EXISTS });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        const result = await newUser.save();

        if (!result) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_CREATE_USER });
        }
        // create new active session
        // const sessionId = new mongoose.Types.ObjectId().toString();
        // const session = new Session({ userId: result._id, sessionId });
        // await session.save();
        res.status(201).json({
            isSuccess: true,
            message: MESSAGES.USER_CREATED
        });
    } catch (error) {
        console.error("Creating user error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true }, { _id: 1, email: 1 }); // only id and email

        if (!users) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.FAILED_FETCH_USERS });
        }
        res.status(200).json({
            isSuccess: true,
            data: users
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const requiredParams = ["email", "password"];
        const errorResponse = await validateBodyParams(req, res, requiredParams);
        if (errorResponse) return; // stop execution if missing params
        if (!email) {
            return res.status(200).json({ isSuccess: false, message: MESSAGES.EMAIL_REQUIRED });
        }
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.USER_NOT_FOUND });
        }
        // if (user.password !== password )) {
        //     return res.status(400).json({ message: "Email or password is invalid" });
        // }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(200).json({ isSuccess: false, message: MESSAGES.INVALID_CREDENTIALS });
        }



        const sessionForUserAlreadyExist = await Session.findOne({ userId: user._id, isActive: true });
        if (sessionForUserAlreadyExist) {
            // deactivate old session
            await Session.findByIdAndUpdate(sessionForUserAlreadyExist._id, { isActive: false });
        }
        const sessionId = await new mongoose.Types.ObjectId().toString();
        // create new active session
        const session = new Session({ userId: user._id, sessionId });
        await session.save();

        // create JWT token
        const token = jwt.sign(
            { email: user.email, id: user._id, name: user.name, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // send cookie
        // res.cookie("access_token", token, { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ isSuccess: true, message: MESSAGES.LOGIN_SUCCESS, user: { id: user._id, email: user.email }, access_token: token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
};

export const updatePassword = async (req, res) => {


    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ isSuccess: false, message: MESSAGES.EMAIL_AND_NEW_PASSWORD_REQUIRED });
        }
        // Find user by email
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(404).json({ isSuccess: false, message: MESSAGES.USER_NOT_FOUND });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update and save password
        user.password = hashedPassword;
        const result = await user.save();

        if (!result) {
            return res.status(500).json({ isSuccess: false, message: MESSAGES.FAILED_UPDATE_PASSWORD });
        }
        return res.status(200).json({ isSuccess: true, message: MESSAGES.PASSWORD_UPDATED });
    } catch (err) {
        console.error("Updating password error:", err);
        return res.status(500).json({ isSuccess: false, message: ERRORS.INTERNAL });
    }
}

export const logout = () => {
    console.log("Logout called");
}