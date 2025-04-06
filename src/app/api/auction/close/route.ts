import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userEmail = session.user.email;

    // Find the latest active auction created by this user
    const auction = await Auction.findOne({
      createdByemail: userEmail,
      status: "active",
    }).sort({ endTime: -1 });

    if (!auction) {
      return NextResponse.json({ success: false, message: "No active auction found for this user" }, { status: 404 });
    }

    // Close auction and update endTime to now
    auction.status = "closed";
    auction.endTime = new Date();

    await auction.save();

    return NextResponse.json(
      {
        success: true,
        message: "Auction closed successfully",
        auction: {
          id: auction._id,
          title: auction.title,
          finalPrice: auction.currentPrice,
          highestBidder: auction.highestBidder,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error closing auction:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
