import mongoose from "mongoose";
import { tagsTb } from "../tbEnums.js";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tag_type: {
      type: String,
      required: true,
    },
    photo: {
      type: [String],
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model(tagsTb, tagSchema);
