import express from "express";
import dotenv from "dotenv";
import { addActivity, deleteActivity, updateActivity } from "../controller/activitiesController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/activities/add-activity", authSecurityHeader, addActivity);
router.put("/activities/update-activity/:id", authSecurityHeader, updateActivity);
router.delete("/activities/delete-activity/:id", authSecurityHeader, deleteActivity);


export default router;
