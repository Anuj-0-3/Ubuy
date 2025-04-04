import mongoose, { Schema, Document } from "mongoose";

export interface IAuction extends Document {
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  highestBidder?: string;
  startTime: Date;
  endTime: Date;
  status: "active" | "closed";
  createdBy: string;
  createdByemail:string;
}

const AuctionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  startingPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  highestBidder: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  createdBy: { type: String, required: true },
  createdByemail:{type :String, required: true},
});

export default mongoose.model<IAuction>("Auction", AuctionSchema);
