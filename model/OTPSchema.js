import mongoose from "mongoose";
import { OTPTb, userTb } from "../tbEnums.js";

const OTPSchema = new mongoose.Schema(
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

export default mongoose.model(OTPTb, OTPSchema);
