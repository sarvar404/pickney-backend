import express from "express";
import dotenv from "dotenv";
import { addLoanLog, deleteLoanLog, getAllLoanLog, getLoanLog, updateLoanLog } from "../controller/loanLogsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/loan-logs/add-loan-log", authSecurityHeader,  addLoanLog);
router.put("/loan-logs/update-loan-log/:id", authSecurityHeader,  updateLoanLog);
router.delete("/loan-logs/delete-loan-log/:id", authSecurityHeader,  deleteLoanLog);
// Get record
router.get("/loan-logs/get-single-loan-log-entry/:id", authSecurityHeader,  getLoanLog);
router.get("/loan-logs/get-all-loan-log-entry", authSecurityHeader,  getAllLoanLog);


export default router;
