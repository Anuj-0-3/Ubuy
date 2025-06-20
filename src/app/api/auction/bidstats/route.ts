import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import User from "@/models/User";
import AuthUser from "@/models/AuthUser";
import { getServerSession } from "next-auth";
import { authOptions } from "../../(user-auth)/auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import mongoose from "mongoose";


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
    // Count the total number of bids the user has placed
    interface Bidder {
      bidder: typeof user._id;
      amount: number;
      _id: string;
      // add other fields if present in your schema
    }

    interface AuctionPopulated {
      bidders: Bidder[];
      winner?: typeof user._id;
      _id: string;
      // add other fields if present in your schema
    }

    const auctions = await Auction.find({
          _id: { $in: auctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        }).populate([
          {
            path: "bidders.bidder",
            select: "_id username email",
          },
        ]);

    const totalBids: number = auctions.reduce(
      (total: number, auction: AuctionPopulated) =>
        total + auction.bidders.filter((bid: Bidder) => bid.bidder.toString() === user._id.toString()).length,
      0
    );

    // Count the total number of auctions created by the user
    const auctionsCreated = await Auction.countDocuments({ createdBy: user._id });

    // Count the total number of auctions the user has won
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
