import mongoose from "mongoose";
import { loanLogsTb, loanTb } from "../tbEnums.js";

const loanLogsSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: loanTb, // Reference to the loan schema
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      required: true,
    },
    emi_date: {
      type: Date,
    },
    emi_paid_date: {
      type: Date,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(loanLogsTb, loanLogsSchema);
