import mongoose, { Schema, Document } from "mongoose";

export interface IAuction extends Document {
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  seller: mongoose.Types.ObjectId;
  highestBidder?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "active" | "closed";
}

const AuctionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  startingPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  highestBidder: { type: Schema.Types.ObjectId, ref: "User" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ["active", "closed"], default: "active" },
});

export default mongoose.model<IAuction>("Auction", AuctionSchema);
