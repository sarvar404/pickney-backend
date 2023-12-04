import mongoose from "mongoose";
import { userTb } from "../tbEnums.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    guardian: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String, // Assuming it's a file path or URL
    },
    verified: {
      type: Boolean,
    },
    enable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(userTb, userSchema);
