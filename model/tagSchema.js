import mongoose from "mongoose";
import { tagsTb } from "../tbEnums.js";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    tag_type: {
      type: String,
    },
    photo: {
      type: [String],
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model(tagsTb, tagSchema);
