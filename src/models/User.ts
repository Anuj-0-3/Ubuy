import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true,unique: true },
  email: { type: String, required: true, unique: true,match: [/.+\@.+\..+/, 'Please use a valid email address'] },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
