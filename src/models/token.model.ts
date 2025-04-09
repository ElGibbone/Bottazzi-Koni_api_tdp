import mongoose, { Document, Schema } from 'mongoose';

// Interface for the token document
export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: string;
  expires: Date;
  createdAt: Date;
}

// Schema for the token model
const tokenSchema = new Schema<IToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verification'],
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the token model
const Token = mongoose.model<IToken>('Token', tokenSchema);
export default Token; 