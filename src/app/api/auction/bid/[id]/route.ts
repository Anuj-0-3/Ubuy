import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // Await params to ensure you have access to its properties
  const { id: auctionId } = await params; // Awaiting params before using auctionId

  // Get the current session
  const session = await getServerSession(authOptions);

  // Unauthorized if no session or user email
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the user has a valid ID and username
  if (!session.user.id || !session.user.username) {
    return NextResponse.json({ error: "User data incomplete" }, { status: 400 });
  }

  // Connect to the database
  await dbConnect();

  // Validate auctionId (ensure it's a valid MongoDB ObjectId)
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return NextResponse.json({ error: "Invalid Auction ID" }, { status: 400 });
  }

  // Get the request body
  const body = await req.json();
  const { bidAmount } = body;

  // Validate bidAmount
  if (typeof bidAmount !== "number" || bidAmount <= 0) {
    return NextResponse.json({ error: "Invalid bid amount" }, { status: 400 });
  }

  // Find the auction by ID
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  }

  // ✅ Auto-close auction if expired
  const currentTime = new Date();
  if (new Date(auction.endTime) <= currentTime) {
    auction.status = "closed";
    await auction.save();
    return NextResponse.json({ error: "Auction has ended and is now closed" }, { status: 403 });
  }

  // Ensure auction is not closed
  if (auction.status === "closed") {
    return NextResponse.json({ error: "Auction is closed" }, { status: 403 });
  }

  // Ensure bid is higher than current price
  if (bidAmount <= auction.currentPrice) {
    return NextResponse.json({ error: "Bid must be higher than the current price" }, { status: 400 });
  }

  // Add the bidder to the auction
  auction.bidders.push({
    bidder: session.user.id,  // Assuming session.user.id is available
    amount: bidAmount,
    bidTime: new Date(),
  });

  // Update the auction's current price and highest bidder
  auction.currentPrice = bidAmount;
  auction.highestBidder = session.user.username;

  // Save the updated auction
  await auction.save();

  // Return success response
  return NextResponse.json({
    message: "Bid placed successfully",
    currentPrice: auction.currentPrice,
  });
}

