import mongoose, { Schema, Document } from "mongoose";

export interface IBid extends Document {
  auction: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  amount: number;
  bidTime: Date;
}

const BidSchema: Schema = new Schema({
  auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
  bidder: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  bidTime: { type: Date, default: Date.now },
});

export default mongoose.model<IBid>("Bid", BidSchema);
