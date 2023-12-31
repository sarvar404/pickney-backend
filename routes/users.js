import express from "express";
import dotenv from "dotenv";
import { OTPVerification, OTPVerificationAndSignIn, accessTrue, deleteUser, forgotAndGetOTP, getAllProfiles, getKidsDetailForUser, getProfile, login, reSetPassword, refreshToken, registration, registrationVerify, updateUserProfile } from "../controller/usersController.js";
import { authSecurityHeader, verifyAccessToken } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/user/register", authSecurityHeader, registration);
router.post("/user/regist-verification", authSecurityHeader, registrationVerify);
router.post("/user/login", authSecurityHeader, login);
router.post("/user/refresh", authSecurityHeader, refreshToken);
router.post("/user/verify", authSecurityHeader, verifyAccessToken,accessTrue);
router.delete("/user/delete/:id", authSecurityHeader, deleteUser);
router.post("/user/opt-verification", authSecurityHeader, OTPVerification);
router.post("/user/opt-verification-check",authSecurityHeader, OTPVerificationAndSignIn);
router.post("/user/forgot", authSecurityHeader, forgotAndGetOTP);
router.post("/user/reset-password", authSecurityHeader, reSetPassword);

// GET USER
router.get("/user/get-user/:id", authSecurityHeader, getProfile);
router.get("/user/get-all-user", authSecurityHeader, getAllProfiles);
router.put("/user/update", authSecurityHeader, updateUserProfile);
router.get("/user/kids-details", authSecurityHeader, getKidsDetailForUser);


export default router;
