import express from "express";
import dotenv from "dotenv";
import { addEvent, deleteEvent, deleteGrantedKid, getAllEventList, getSingleEvent, grantKid, updateEvent, updateGrantedKid } from "../controller/eventsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/events/add-event", authSecurityHeader, addEvent);
router.put("/events/update-event/:id", authSecurityHeader, updateEvent);
router.delete("/events/delete-event/:id", authSecurityHeader, deleteEvent);


router.post("/events/grant-kid", authSecurityHeader, grantKid);
router.put("/events/update-granted-kid/:id", authSecurityHeader, updateGrantedKid);
router.delete("/events/delete-granted-kid/:id", authSecurityHeader, deleteGrantedKid);

// GET USER
router.get("/events/get-single-events/:id", authSecurityHeader, getSingleEvent);
router.get("/events/get-all-events", authSecurityHeader, getAllEventList);


export default router;
