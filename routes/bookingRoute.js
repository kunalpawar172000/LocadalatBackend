import express from "express";
import { getBookingStats } from "../controller/bookingController.js";
import { createBooking } from "../controller/bookingController.js";
import { authenticateToken } from "../middleware/auth.js";
import { getAppointments } from "../controller/bookingController.js";
import { getBookingById, getBookingByToken, getBookingsInRange } from "../controller/bookingController.js";

const router = express.Router();

// GET /api/booking/stats
router.get("/stats", getBookingStats);

// POST /api/booking - create a booking
router.post("/", createBooking);

// Admin endpoint (merged): GET /api/booking/admin/appointments
router.get("/admin/appointments", authenticateToken, getAppointments);

// GET /api/booking/token/:tokenNumber - fetch booking by token
router.get('/token/:tokenNumber', getBookingByToken);

// GET /api/booking/range?fromDate=&toDate=
router.get('/range', getBookingsInRange);

// GET /api/booking/:id - fetch single booking by id
router.get('/:id', getBookingById);

export default router;
