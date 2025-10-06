import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./../config/config.env" });
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", ""); // support both cookie and header

    console.log("Authenticating token:", token);
    if (!token) {
        console.log("No token provided");

        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified", decoded);

        req.user = decoded; // attach user info to request  
        next();
    } catch (err) {
        console.log("Invalid token", err.message, err.name);

        return res.status(401).json({ message: "Invalid token" });
    }
};
export default authenticateToken;