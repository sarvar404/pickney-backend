import express from "express";
import dotenv from "dotenv";
import { OTPVerification, OTPVerificationAndSignIn, accessTrue, deleteUser, forgotAndGetOTP, login, reSetPassword, refreshToken, registration } from "../controller/usersController.js";
import { verifyAccessToken } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/user/register", registration);
router.post("/user/login", login);
router.post("/user/refresh",refreshToken);
router.post("/user/verify",verifyAccessToken,accessTrue);
router.delete("/user/delete/:id",deleteUser);
router.post("/user/opt-verification",OTPVerification);
router.post("/user/opt-verification-check",OTPVerificationAndSignIn);
router.post("/user/forgot",forgotAndGetOTP);
router.post("/user/reset-password",reSetPassword);


export default router;
