import express from "express";

import { createWeekOff,updateWeekoff } from "../controller/weekoffController.js";

const router = express.Router();

router.post("/createWeekoff", createWeekOff);
router.put("/:id", updateWeekoff);
// router.delete("/:id", deleteHoliday);

export default router;