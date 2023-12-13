import mongoose from "mongoose";
import { FDLogsTb, FDTb } from "../tbEnums.js";

const fixedDepositLogsSchema = new mongoose.Schema(
  {
    fdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: FDTb, // Reference to the fixed deposit schema
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(FDLogsTb, fixedDepositLogsSchema);
