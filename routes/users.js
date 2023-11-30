import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/user/login", getAllDataDashboard);


export default router;
