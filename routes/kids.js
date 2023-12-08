import express from "express";
import dotenv from "dotenv";
import { kidLogin, kidRegister, kidUpdate, refreshToken } from "../controller/kidsController.js";

dotenv.config();
const router = express.Router();

router.post("/kids/register",kidRegister);
router.post("/kids/login",kidLogin);
router.post("/kids/refresh",refreshToken);
router.put("/kids/update/:id",kidUpdate);


export default router;
