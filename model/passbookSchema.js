import mongoose from "mongoose";
import { activitiesTb, passbookTb, userTb } from "../tbEnums.js";

const passbookSchema = new mongoose.Schema(
  {
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: activitiesTb, // Reference to the user schema
      required: true,
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entryType: {
      type: String,
      enum: Object.values(entryTypeEnums), // Assuming entryTypeEnums contains valid entry types
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb, // Reference to the user schema
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(entryStatusEnums), // Assuming entryStatusEnums contains valid status values
      required: true,
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
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(passbookTb, passbookSchema);
