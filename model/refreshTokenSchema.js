import mongoose from 'mongoose';
import { refreshtokenTb, userTb } from '../tbEnums.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userTb,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    role: {
      type: String, // Assuming it's a file path or URL
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model(refreshtokenTb, refreshTokenSchema);
