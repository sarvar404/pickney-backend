import mongoose from "mongoose";
import { eventTb } from "../tbEnums.js";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    created_by: {
      type: String,
      // You might want to change this type based on your user structure
    },
    stars: {
      type: Number,
      // Assuming stars can be fractional, change to Integer if it should be a whole number
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
    },
    is_recurring: {
      type: Boolean,
    },
    frequency: {
      type: Number,
      enum: [1, 2, 3], // (daily, weekly, monthly)
    },
    tags: {
      type: [String],
      // Assuming the tags are strings representing IDs
    },
    start_at: {
      type: Date,
    },
    end_at: {
      type: Date,
    },
    status: {
      type: Number,
      enum: [1, 2, 3], // [ active, inactive, deleted]
    },
    is_auto_complete: {
      type: Boolean,
    },
    max_count: {
      type: Number,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(eventTb, eventSchema);
