import express from "express";
import dotenv from "dotenv";

import { addLoan, deleteLoan, getAllLoan, getLoan, updateLoan } from "../controller/loanController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";
import { getAllPassbookEntries, getCommonAcoountPassBookEntries, getSinglePassbookEntry } from "../controller/passbookController.js";

dotenv.config();
const router = express.Router();

router.post("/loan/add-loan", authSecurityHeader,  addLoan);
router.put("/loan/update-loan/:id", authSecurityHeader,  updateLoan);
router.delete("/loan/delete-loan/:id", authSecurityHeader,  deleteLoan);
// Get record
router.get("/loan/get-single-loan-entry/:id", authSecurityHeader,  getLoan);
router.get("/loan/get-all-loan-entry", authSecurityHeader,  getAllLoan);

// passbook

router.get("/passbook/get-single-passbook-entry/:id", authSecurityHeader,  getSinglePassbookEntry);
router.get("/passbook/get-all-passbook-entry", authSecurityHeader,  getAllPassbookEntries);
router.get("/passbook/get-all-common-ac-passbook-entry/:id", authSecurityHeader,  getCommonAcoountPassBookEntries);


export default router;
