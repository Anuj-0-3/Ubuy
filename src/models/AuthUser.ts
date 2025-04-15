import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthUser extends Document {
  email: string;
  name: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthUserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'google',
      enum: ['google'],
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

export default mongoose.models.AuthUser || mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);
