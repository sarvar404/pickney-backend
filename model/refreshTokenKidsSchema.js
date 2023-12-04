import mongoose from 'mongoose';
import { kidTb, refreshtokenKidTb, refreshtokenTb, userTb } from '../tbEnums.js';

const refreshTokenKidsSchema = new mongoose.Schema(
  {
    kidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: kidTb,
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
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model(refreshtokenKidTb, refreshTokenKidsSchema);
