import mongoose from "mongoose";
import { kidTb, loanTb, userTb } from "../tbEnums.js";

const loanSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    principal: {
      type: Number,
      required: true,
    },
    interest: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    // emi_star: {
    //   type: Number,
    //   required: true,
    // },
    ends_at: {
      type: Date,
    },
    status: {
      type: String,
      required : true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(loanTb, loanSchema);
