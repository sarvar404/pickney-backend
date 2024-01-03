import express from "express";
import dotenv from "dotenv";
import { getAllKidList, getSingleKid, kidLogin, kidRegister, kidUpdate, refreshToken } from "../controller/kidsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/kids/register", authSecurityHeader, kidRegister);
router.post("/kids/login", authSecurityHeader, kidLogin);
router.post("/kids/refresh", authSecurityHeader, refreshToken);
router.put("/kids/update", authSecurityHeader, kidUpdate);
router.get("/kids/single-kid/:id", authSecurityHeader, getSingleKid);
router.get("/kids/all-kid", authSecurityHeader, getAllKidList);


export default router;
