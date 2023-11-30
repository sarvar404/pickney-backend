import mongoose from "mongoose";
import { tagsTb } from "../tbEnums.js";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    photo: {
      type: String, // Assuming it's a file path or URL
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model(tagsTb, tagSchema);
