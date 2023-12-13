import mongoose from "mongoose";
import { loanTb, userTb } from "../tbEnums.js";

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    created_by: {
      type: String, // You may need to adjust the type based on the actual data type
    },
    amount: {
      type: Number,
      required: true,
    },
    interest: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    emi_star: {
      type: Number,
      required: true,
    },
    ends_at: {
      type: Date,
    },
    status: {
      type: Number,
      enum: [1, 2, 3], // [ active, inactive, deleted]
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(loanTb, loanSchema);
