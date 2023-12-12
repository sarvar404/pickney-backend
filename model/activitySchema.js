import mongoose from "mongoose";
import { activitiesTb, eventTb } from "../tbEnums.js";

const activitySchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: eventTb,
    },
    assigned_to: {
      type: String,
    },
    status: {
      type: Number,
      enum: [1, 2, 3], // [ active, inactive, deleted]
    },
    remarks: {
      type: String,
    },
    start_at: {
      type: Date,
    },
    end_at: {
      type: Date,
    },
    photo: {
      type: String, // Assuming it's a file path or URL
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(activitiesTb, activitySchema);
