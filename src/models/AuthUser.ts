import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthUser extends Document {
  email: string;
  name: string;
  provider: string;  
  authProvider: string;  
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
      default: 'google',  // Default to Google for external users
      enum: ['google', 'facebook', 'github'], // Add other providers if needed
    },
    authProvider: {
      type: String,
      default: 'google',  // Field for authentication provider (can be 'google' or another provider)
      enum: ['google', 'facebook', 'github'],  // You can add more providers here
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.models.AuthUser || mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);
