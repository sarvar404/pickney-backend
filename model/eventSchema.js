import mongoose from "mongoose";
import { eventTb, kidTb, tagsTb, userTb } from "../tbEnums.js";

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
      type: Boolean,
      default: true,
      required: true,
    },
    reward_type: {
      type: String,
      enum: ["CR", "DR"],
      required: true,
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: tagsTb // Make sure this matches the model name of your tagSchema
    }],
    is_auto_complete_event: {
      type: Boolean,
    },
    frequency: {
      type: String,
      enum: ["D", "M", "W", "A"],
      required: true,
    },
    max_count: {
      type: Number,
      required: true,
    },
    start_at: {
      type: String,
      required : true,
    },
    end_at: {
      type: String,
      required : true,
    },
    status: {
      type: Number,
      enum: [1,2,3], // a : active , 2: inactive, 3 : deleted
      required : true,
    },
    photo: {
      type: [String],
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(eventTb, eventSchema);
