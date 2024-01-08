import express from "express";
import dotenv from "dotenv";
import { addFixedDeposit, deleteFixedDeposit, fdCalculation, getAllFixedDeposit, getFixedDeposit, updateFixedDeposit } from "../controller/fixedDepositController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/fd/add-fd", authSecurityHeader,  addFixedDeposit);
router.put("/fd/update-fd/:id", authSecurityHeader,  updateFixedDeposit);
router.delete("/fd/delete-fd/:id", authSecurityHeader,  deleteFixedDeposit);
// Get record
router.get("/fd/get-single-fd-entry/:id", authSecurityHeader,  getFixedDeposit);
router.get("/fd/get-all-fd-entry", authSecurityHeader,  getAllFixedDeposit);
// calculate fd
router.get("/fd/fd-calculation", authSecurityHeader,  fdCalculation);


export default router;
