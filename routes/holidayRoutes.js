import express from "express";
import { createHoliday, getHolidays, updateHoliday, deleteHoliday } from "../controller/holidayController.js";

const router = express.Router();

router.post("/createholiday", createHoliday);
router.get("/getholidays", getHolidays);
router.put("/:id", updateHoliday);
router.delete("/:id", deleteHoliday);

export default router;
