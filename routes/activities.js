import express from "express";
import dotenv from "dotenv";
import { addActivity, deleteActivity, updateActivity } from "../controller/activitiesController.js";

dotenv.config();
const router = express.Router();

router.post("/activities/add-activity", addActivity);
router.put("/activities/update-activity/:id", updateActivity);
router.delete("/activities/delete-activity/:id", deleteActivity);


export default router;
