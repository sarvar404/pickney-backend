import mongoose from "mongoose";
import { forgotTb, userTb } from "../tbEnums.js";

const ForgotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model(forgotTb, ForgotSchema);
