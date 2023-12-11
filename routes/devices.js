import express from "express";
import dotenv from "dotenv";
import { addDevice, deleteDevice, updateDevice } from "../controller/devicesController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/devices/add-device", authSecurityHeader, addDevice);
router.put("/devices/update-device/:id", authSecurityHeader, updateDevice);
router.delete("/devices/delete-device/:id", authSecurityHeader, deleteDevice);


export default router;
