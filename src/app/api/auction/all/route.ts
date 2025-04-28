import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Auction from "@/models/Auction";
import { autoCloseExpiredAuctions } from "@/lib/autoCloseExpiredAuctions";
import "@/models/User";
import "@/models/AuthUser";

export async function GET() {
  try {
    await dbConnect();

    // Automatically close expired auctions
    await autoCloseExpiredAuctions();

    // Fetch auctions sorted by endTime descending
    const auctions = await Auction.find().sort({ endTime: -1 });

    // Manually populate both createdBy and bidders.bidder (polymorphic)
    await Auction.populate(auctions, [
      {
        path: "createdBy",
        select: "username email provider",
      },
      {
        path: "bidders.bidder",
        select: "username email provider",
      },
    ]);

    return NextResponse.json(auctions, { status: 200 });

  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: "Failed to fetch auctions", details: errorMessage },
      { status: 500 }
    );
  }
}
