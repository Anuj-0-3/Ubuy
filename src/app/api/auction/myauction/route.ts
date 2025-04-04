import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Auction from "@/models/Auction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    
    try {
           
         await dbConnect();
         const useremail = session?.user?.email;
         
         if (!useremail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
    
         const auctions = await Auction.find({ createdByemail: useremail }).select("-createdByemail -_id");
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