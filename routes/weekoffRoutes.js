import express from "express";

import { createWeekoff, updateWeekoff, deleteWeekoff, getWeekoffs } from "../controller/weekoffController.js";

const router = express.Router();

router.get("/getWeekoffs", getWeekoffs);
router.post("/createWeekoff", createWeekoff);
router.put("/:id", updateWeekoff);
router.delete("/:id", deleteWeekoff);

export default router;