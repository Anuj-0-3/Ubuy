import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const auctionId = searchParams.get("id");

    if (!auctionId) {
      return NextResponse.json({ success: false, message: "Auction ID is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return NextResponse.json({ success: false, message: "Invalid auction ID" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return NextResponse.json({ success: false, message: "Auction not found" }, { status: 404 });
    }

    if (auction.createdBy.toString() !== user._id) {
      return NextResponse.json({ success: false, message: "You are not authorized to delete this auction" }, { status: 403 });
    }

    await Auction.findByIdAndDelete(auctionId);

    return NextResponse.json({ success: true, message: "Auction deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

