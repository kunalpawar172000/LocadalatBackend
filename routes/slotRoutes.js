import express from "express";
import { getSlots, updateSlot, slotAvailabilityByMonth,slotAvailabilityByDays } from "../controller/slotController.js";
const router = express.Router();

router.get("/getSlots", getSlots);
router.get("/getSlotAvailability", slotAvailabilityByDays);
router.put("/updateSlot", updateSlot);

export default router;