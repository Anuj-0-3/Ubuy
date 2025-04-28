import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
  await dbConnect();

  // Get session and user
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, image, startingPrice, startTime, endTime } = body;

    // Validate required fields
    if (!title || !description || !startingPrice || !startTime || !endTime) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 });
    }

    // Determine the correct model for createdBy
    const createdByModel = session.user.authProvider ? "AuthUser" : "User"; // Assuming `authProvider` can be used to distinguish AuthUser vs User

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
      createdBy: session.user.id,   // saving the ObjectId reference here
      createdByModel: createdByModel, // Dynamically set model type
    });

    return NextResponse.json({ message: "Auction created successfully", auction: newAuction }, { status: 201 });

  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

