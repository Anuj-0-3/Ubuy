import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Auction from "@/models/Auction";

export async function GET(request: Request) {
    try {
  
         await dbConnect();
        
    
         const auctions = await Auction.find().select("-createdByemail -_id");
        console.log(auctions);
    
        return NextResponse.json(auctions, { status: 200 });
        
      } catch (error) {
        const errorMessage = (error as Error).message;
        return NextResponse.json(
          { error: "Failed to fetch data", details: errorMessage },
          { status: 500 }
        );
      }
}