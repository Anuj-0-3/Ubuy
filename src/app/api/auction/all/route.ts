import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Auction from "@/models/Auction";
import { autoCloseExpiredAuctions } from "@/lib/autoCloseExpiredAuctions";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Automatically close auctions whose endTime has passed
    await autoCloseExpiredAuctions();

    // Fetch auctions without revealing user email
    const auctions = await Auction.find().select("-createdByemail").sort({ endTime: -1 });

    return NextResponse.json(auctions, { status: 200 });

  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: "Failed to fetch data", details: errorMessage },
      { status: 500 }
    );
  }
}
