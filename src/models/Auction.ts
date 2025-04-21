import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuction extends Document {
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  bidders: {
    bidder: Types.ObjectId;
    bidderName?: string;
    amount: number;
    bidTime: Date;
  }[];
  startTime: Date;
  endTime: Date;
  status: "active" | "closed";
  createdBy: Types.ObjectId;
}

const AuctionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 },
    bidders: [
      {
        bidder: { type: Schema.Types.ObjectId, ref: "User", required: true },
        bidderName: { type: String },
        amount: { type: Number, required: true },
        bidTime: { type: Date, default: Date.now },
      },
    ],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);
