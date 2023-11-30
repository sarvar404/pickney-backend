import express from "express";
import dotenv from "dotenv";
import { addTag, deleteTag, updateTag } from "../controller/tagsController.js";


dotenv.config();
const router = express.Router();

router.post("/tags/add-tag", addTag);
router.put("/tags/update-tag/:id", updateTag);
router.delete("/tags/delete-tag/:id", deleteTag);


export default router;
