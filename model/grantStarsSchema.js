import mongoose from "mongoose";
import { kidGrantTb, eventTb, userTb } from "../tbEnums.js";

const grantStarsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: eventTb, // Reference to the user schema
      required: true,
    },
    kidId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    is_recurring: {
      type: Boolean,
      default: false, // Set a default value if needed
    },
    select_event: {
      type: String,
    },
    select_value: {
      type: Number,
    },
    select_count: {
      type: Number,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(kidGrantTb, grantStarsSchema);
