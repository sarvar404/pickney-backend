import mongoose from "mongoose";
import { kidTb, loanLogsTb, loanTb, userTb } from "../tbEnums.js";

const loanLogsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    kidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: kidTb, // Reference to the user schema
      required: true,
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: loanTb, // Reference to the loan schema
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    emi_date: {
      type: String,
      required: true,
    },
    emi_paid_date: {
      type: String,
    },
    emi_amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(loanLogsTb, loanLogsSchema);
