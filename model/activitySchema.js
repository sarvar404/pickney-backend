import mongoose from "mongoose";
import { activitiesTb, eventTb, kidTb, userTb } from "../tbEnums.js";

const activitySchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: eventTb,
    },
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
    status: {
      type: Number,
      enum: [1,2,3], // 1 : active , 2: inactive, 3 : deleted
      required : true,
    },
    remarks: {
      type: String,
    },
    start_at: {
      type: String,
      required : true,
    },
    end_at: {
      type: String,
      required : true,
    },
    photo: {
      type: String, // Assuming it's a file path or URL
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(activitiesTb, activitySchema);
