import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import User from "@/models/User";
import AuthUser from "@/models/AuthUser";
import { getServerSession } from "next-auth";
import { authOptions } from "../../(user-auth)/auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

interface Bidder {
  bidder: Types.ObjectId;
  amount: number;
  _id: string;
}

interface AuctionPopulated {
  bidders: Bidder[];
  winner?: Types.ObjectId;
  _id: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const isAuthUser = session.user.authProvider === "AuthUser";
  const UserModel = isAuthUser ? AuthUser : User;

  try {
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const auctionIds = user.biddedauction;

    const auctions = await Auction.find({
      _id: { $in: auctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
    }).populate([
      {
        path: "bidders.bidder",
        select: "_id username email",
      },
    ]);


    const totalBids = auctions.reduce(
      (total: number, auction: AuctionPopulated) =>
        total + auction.bidders.filter(
          (bid: Bidder) => bid.bidder.equals(user._id)
        ).length,
      0
    );

    const auctionsCreated = await Auction.countDocuments({ createdBy: user._id });

    const auctionsWon = auctions.filter((auction) => auction.winner?.toString() === user._id.toString()).length;

    return NextResponse.json({
      totalBids,
      auctionsCreated,
      auctionsWon,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json({ error: "Failed to fetch data", details: errorMessage }, { status: 500 });
  }
}

