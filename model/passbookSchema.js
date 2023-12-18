import mongoose from "mongoose";
import { activitiesTb, passbookTb, userTb } from "../tbEnums.js";

const passbookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entryType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: true
    },
    remarks: {
      type: String,
    },
    start_at: {
      type: Date,
    },
    ends_at: {
      type: Date,
    },
    photo: {
      type: String,
    },
    balance_stars: {
      type: Number,
      default: 0, // You can set a default value if needed
    },
    is_credit: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at"} }
);

export default mongoose.model(passbookTb, passbookSchema);
