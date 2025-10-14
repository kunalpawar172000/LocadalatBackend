// auth.js
import jwt from "jsonwebtoken";
import Session from "./../models/sessions.js"
import dotenv from "dotenv";
import { MESSAGES, ERRORS } from "../config/constants.js";
dotenv.config({ path: "./../config/config.env" });

// full paths since middleware is at "/"
const PUBLIC_PATHS = [
  "/",
  "/api/user/login",
  "/api/user/forgot-password",
  "/api/booking",
  "/api/booking/token/:tokenNumber",
  "/api/slot/getSlotAvailability",
  "/api/slot/getSlots",
];

export const authenticateToken = async (req, res, next) => {
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
    const sessionForUserAlreadyExist = await Session.findOne({ sessionId: payload.sessionId, isActive: true });
    if (!sessionForUserAlreadyExist) {
      return res.status(401).json({ isSuccess: false, message: MESSAGES.SESSION_EXPIRED });
    }

    req.user = payload;
    return next();
  } catch (err) {
    console.log("Auth middlware error : ", err);
    return res.status(401).json({ isSuccess: false, message: MESSAGES.INVALID_TOKEN });
  }
};
