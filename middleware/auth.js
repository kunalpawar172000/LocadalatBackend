// auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MESSAGES } from "../config/constants.js";
dotenv.config({ path: "./../config/config.env" });

// full paths since middleware is at "/"
const PUBLIC_PATHS = [
  "/",
  "/api/user/login",
  "/api/user/forgot-password",
  "/api/booking",
  "/api/booking/token/:tokenNumber",
  "/api/slot/availability",
  "/api/slot/getSlots",

];

export const authenticateToken = (req, res, next) => {
  // Skip OPTIONS requests
  //   if (req.method === "OPTIONS") {
  //     return next();
  //   }

  // Skip if request matches public paths
  if (PUBLIC_PATHS.includes(req.path)) {
    return next();
  }

  const token =
       req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ isSuccess: false, message: MESSAGES.UNAUTHORIZED });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ isSuccess: false, message: MESSAGES.INVALID_TOKEN });
  }
};
