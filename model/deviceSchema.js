import mongoose from "mongoose";
import { devicesTb } from "../tbEnums.js";

const deviceSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
    },
    device_id: {
      type: String,
      required: true,
    },
    device_name: {
      type: String,
      required: true,
    },
    login_at: {
      type: Date,
    },
    device_ip: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model(devicesTb, deviceSchema);
