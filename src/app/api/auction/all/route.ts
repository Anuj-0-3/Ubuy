import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Auction from "@/models/Auction";
import { autoCloseExpiredAuctions } from "@/lib/autoCloseExpiredAuctions";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Automatically close expired auctions
    await autoCloseExpiredAuctions();

    // Fetch auctions, populate createdBy info, sorted by endTime descending
    const auctions = await Auction.find()
      .populate({
        path: "createdBy",
        select: "username email", // Include only these fields
      })
      .sort({ endTime: -1 });

    return NextResponse.json(auctions, { status: 200 });

  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: "Failed to fetch auctions", details: errorMessage },
      { status: 500 }
    );
  }
}

