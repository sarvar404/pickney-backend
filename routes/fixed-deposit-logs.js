import express from "express";
import dotenv from "dotenv";
import { addFixedDepositLog, deleteFixedDepositLog, getAllFixedDepositLog, getFixedDepositLog, updateFixedDepositLog } from "../controller/fixedDepositLogsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/fd-log/add-fd-log", authSecurityHeader,  addFixedDepositLog);
router.put("/fd-log/update-fd-log/:id", authSecurityHeader,  updateFixedDepositLog);
router.delete("/fd-log/delete-fd-log/:id", authSecurityHeader,  deleteFixedDepositLog);
// Get record
router.get("/fd-log/get-single-fd-log-entry/:id", authSecurityHeader,  getFixedDepositLog);
router.get("/fd-log/get-all-fd-log-entry", authSecurityHeader,  getAllFixedDepositLog);


export default router;
