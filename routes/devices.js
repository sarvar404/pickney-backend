import express from "express";
import dotenv from "dotenv";
import { addDevice, deleteDevice, updateDevice } from "../controller/devicesController.js";

dotenv.config();
const router = express.Router();

router.post("/devices/add-device", addDevice);
router.put("/devices/update-device/:id", updateDevice);
router.delete("/devices/delete-device/:id", deleteDevice);


export default router;
