import express from "express";
import dotenv from "dotenv";
import { addEvent, deleteEvent, updateEvent } from "../controller/eventsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/events/add-event", authSecurityHeader, addEvent);
router.put("/events/update-event/:id", authSecurityHeader, updateEvent);
router.delete("/events/delete-event/:id", authSecurityHeader, deleteEvent);


export default router;
