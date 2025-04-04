import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const auctionId = params.id;

  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return NextResponse.json({ error: "Invalid Auction ID" }, { status: 400 });
  }

  const body = await req.json();
  const { bidAmount } = body;

  if (typeof bidAmount !== "number" || bidAmount <= 0) {
    return NextResponse.json({ error: "Invalid bid amount" }, { status: 400 });
  }

  const auction = await Auction.findById(auctionId);

  if (!auction) {
    return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  }

  if (auction.status === "closed") {
    return NextResponse.json({ error: "Auction is closed" }, { status: 403 });
  }

  if (bidAmount <= auction.currentPrice) {
    return NextResponse.json({ error: "Bid must be higher than the current price" }, { status: 400 });
  }

  auction.currentPrice = bidAmount;
  auction.highestBidder = session.user.email;

  await auction.save();

  return NextResponse.json({ message: "Bid placed successfully", currentPrice: auction.currentPrice });
}
