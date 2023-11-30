import express from "express";
import dotenv from "dotenv";
import { addEvent, deleteEvent, updateEvent } from "../controller/eventsController.js";

dotenv.config();
const router = express.Router();

router.post("/events/add-event", addEvent);
router.put("/events/update-event/:id", updateEvent);
router.delete("/events/delete-event/:id", deleteEvent);


export default router;
