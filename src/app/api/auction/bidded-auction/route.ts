import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import User from "@/models/User";
import AuthUser from "@/models/AuthUser";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);

  // ✅ Check for valid session and id
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Determine which model to use (AuthUser or User)
  const isAuthUser = session.user.authProvider === "AuthUser";
  const UserModel = isAuthUser ? AuthUser : User;

  try {
    // ✅ Fetch the user based on session
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Get the auction IDs the user has bid on
    const auctionIds = user.biddedauction;

    // ✅ Auto-close any expired auctions the user has bid on
    const currentTime = new Date();
    await Auction.updateMany(
      {
        _id: { $in: auctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        endTime: { $lte: currentTime },
        status: "active",
      },
      { $set: { status: "closed" } }
    );

   // ✅ Fetch the auctions corresponding to the auction IDs in biddedauction
    const auctions = await Auction.find({
      _id: { $in: auctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
    });


    // ✅ If no auctions are found, return a message
    if (auctions.length === 0) {
      return NextResponse.json({ error: "No bidded auctions found for the user" }, { status: 404 });
    }


    // ✅ Return the bidded auctions
    return NextResponse.json({ biddedAuctions: auctions });

  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: "Failed to fetch data", details: errorMessage },
      { status: 500 }
    );
  }
}
