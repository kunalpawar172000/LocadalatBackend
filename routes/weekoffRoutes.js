import express from "express";

import { createWeekOff,updateWeekoff,deleteWeekOff ,getWeekoffs} from "../controller/weekoffController.js";

const router = express.Router();

router.get("/getWeekoffs", getWeekoffs);
router.post("/createWeekoff", createWeekOff);
router.put("/:id", updateWeekoff);
router.delete("/:id", deleteWeekOff);

export default router;