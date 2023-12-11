import express from "express";
import dotenv from "dotenv";
import { kidLogin, kidRegister, kidUpdate, refreshToken } from "../controller/kidsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/kids/register", authSecurityHeader, kidRegister);
router.post("/kids/login", authSecurityHeader, kidLogin);
router.post("/kids/refresh", authSecurityHeader, refreshToken);
router.put("/kids/update/:id", authSecurityHeader, kidUpdate);


export default router;
