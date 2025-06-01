import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../(user-auth)/auth/[...nextauth]/options";

const validCategories = ["Collectibles", "Art", "Electronics", "Fashion", "Other"];

export async function POST(req: Request) {
  await dbConnect();

  // Get session and user
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, image, startingPrice, startTime, endTime,category, } = body;

    // Validate required fields
    if (!title || !description || !startingPrice || !startTime || !endTime|| !category) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 });
    }

    // Validate category
    if (!validCategories.includes(category)) {
      return NextResponse.json({ message: "Invalid category provided" }, { status: 400 });
    }

    // Determine the correct model for createdBy
    const createdByModel = session.user.authProvider ? "AuthUser" : "User"; 

    // Create auction
    const newAuction = await Auction.create({
      title,
      description,
      image: image || "",
      startingPrice,
      currentPrice: startingPrice,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "active",
      category, 
      createdBy: session.user.id,   
      createdByModel: createdByModel,
      notified: false, 
    });

    return NextResponse.json({ message: "Auction created successfully", auction: newAuction }, { status: 201 });

  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

