import express from "express";
import { getSlots, updateSlot, slotAvailability } from "../controller/slotController.js";
const router = express.Router();

router.get("/getSlots", getSlots);
router.get("/slotAvailability", slotAvailability);
router.put("/updateSlot", updateSlot);

export default router;