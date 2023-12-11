import express from "express";
import dotenv from "dotenv";
import { addTag, deleteTag, updateTag } from "../controller/tagsController.js";
import { authSecurityHeader } from "../middlewares/middlewareAuth.js";


dotenv.config();
const router = express.Router();

router.post("/tags/add-tag",authSecurityHeader, addTag);
router.put("/tags/update-tag/:id", authSecurityHeader, updateTag);
router.delete("/tags/delete-tag/:id", authSecurityHeader, deleteTag);


export default router;
