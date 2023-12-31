import express from "express";
import dotenv from "dotenv";
import { addEvent, addEventDefault, deleteEvent, deleteEventDefault, getActivitiesByDate, getAllEventList, getOnetimeEvents, getRecurringEvents, getSingleEvent, updateEvent, updateEventDefault } from "../controller/eventsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";
import { deleteGrantedKid, grantStar, updateGrantedKid } from "../controller/starGrantController.js";

dotenv.config();
const router = express.Router();

router.post("/events/add-event", authSecurityHeader, addEvent);
router.put("/events/update-event", authSecurityHeader, updateEvent);
router.delete("/events/delete-event/:id", authSecurityHeader, deleteEvent);


router.post("/events/grant-star", authSecurityHeader, grantStar);
router.put("/events/update-granted-kid/:id", authSecurityHeader, updateGrantedKid);
router.delete("/events/delete-granted-kid/:id", authSecurityHeader, deleteGrantedKid);

router.post("/events/add-event-default", authSecurityHeader, addEventDefault);
router.put("/events/update-event-default/:id", authSecurityHeader, updateEventDefault);
router.delete("/events/delete-event-default/:id", authSecurityHeader, deleteEventDefault);

// GET USER
router.get("/events/get-single-events/:id", authSecurityHeader, getSingleEvent);
router.get("/events/get-all-events", authSecurityHeader, getAllEventList);
router.get("/events/get-events-by-date", authSecurityHeader, getActivitiesByDate);

// star grant
router.get("/events/get-onetime-events", authSecurityHeader, getOnetimeEvents);
router.get("/events/get-recurring-events", authSecurityHeader, getRecurringEvents);

export default router;
