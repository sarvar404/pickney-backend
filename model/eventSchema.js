import mongoose from "mongoose";
import { eventTb, kidTb, userTb } from "../tbEnums.js";

const eventSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
    },
    
    event_type: {
      type: String,
      enum: ["D", "M", "W", "A"],
      required: true,
    },
    reward_type: {
      type: String,
      enum: ["C", "D"],
      required: true,
    },
    is_recurring: {
      type: Boolean,
      default: true,
      required: true,
    },
    tags: {
      type: [String],
      // Assuming the tags are strings representing IDs
    },
    is_auto_complete_event: {
      type: Boolean,
    },
    frequency: {
      type: String,
      enum: ["D", "M", "W", "A"],
    },
    max_count: {
      type: Number,
    },
    start_at: {
      type: Date,
    },
    end_at: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    photo: {
      type: [String],
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(eventTb, eventSchema);
