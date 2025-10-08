import express from "express";
import { getSlots } from "../controller/slotController.js";
const router = express.Router();

router.get("/getSlots",getSlots);

export default router;