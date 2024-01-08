import mongoose from "mongoose";
import { tagsTb, userTb } from "../tbEnums.js";

const tagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
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
