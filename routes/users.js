import express from "express";
import dotenv from "dotenv";
import { accessTrue, deleteUser, login, refreshToken, registration } from "../controller/usersController.js";
import { verifyAccessToken } from "../middlewares/middlewareAuth.js";

dotenv.config();
const router = express.Router();

router.post("/user/register", registration);
router.post("/user/login", login);
router.post("/user/refresh",refreshToken);
router.post("/user/verify",verifyAccessToken,accessTrue);
router.delete("/user/delete/:id",deleteUser);


export default router;
