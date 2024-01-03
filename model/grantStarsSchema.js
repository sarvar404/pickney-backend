import mongoose from "mongoose";
import { kidGrantTb, eventTb, userTb, kidTb } from "../tbEnums.js";

const grantStarsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    kidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: kidTb,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: eventTb, // Reference to the user schema
      required: true,
    },
    event_name: {
      type: String,
    },
    event_type: {
      type: String,
    },
    is_recurring: {
      type: Boolean,
      default: false, // Set a default value if needed
    },
    values: {
      type: Number,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model(kidGrantTb, grantStarsSchema);
