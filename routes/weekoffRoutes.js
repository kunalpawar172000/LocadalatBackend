import express from "express";

import { createWeekOff,updateWeekoff,deleteWeekOff } from "../controller/weekoffController.js";

const router = express.Router();

router.post("/createWeekoff", createWeekOff);
router.put("/:id", updateWeekoff);
router.delete("/:id", deleteWeekOff);

export default router;