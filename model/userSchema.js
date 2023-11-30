import mongoose from "mongoose";
import { userTb } from "../tbEnums.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    guardian: {
      type: String,
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
    },
    photo: {
      type: String, // Assuming it's a file path or URL
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(userTb, userSchema);
