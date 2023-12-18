import mongoose from "mongoose";
import { eventDefaultTb } from "../tbEnums.js";

const defaultEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    points: {
      type: Number,
    },
    event_type: {
      type: String,
    },
    is_recurring: {
      type: Boolean,
      default: true,
      required: true,
    },
    frequency: {
      type: String,
      enum: ["D", "M", "W", "A"],
    },
    tags: {
      type: [String],
    },
    photo: {
      type: [String],
    },
    is_recommended: {
      type: Boolean,
      default: false
    },
    status: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(eventDefaultTb, defaultEventSchema);
