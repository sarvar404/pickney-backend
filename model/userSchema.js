import mongoose from "mongoose";
import { kidTb, userTb } from "../tbEnums.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    kidFK : {
      type: mongoose.Schema.Types.ObjectId,
      ref: kidTb, // Reference to the user schema
    },
    uniqueId : {
      type: String,
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
      default: false,
    },
    enable: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String, // Assuming it's a file path or URL
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(userTb, userSchema);
