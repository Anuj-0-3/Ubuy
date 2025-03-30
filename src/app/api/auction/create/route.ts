import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Auction from "@/models/Auction";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const body = await req.json();
    const { title, description, image, startingPrice, startTime, endTime } = body;

    if (!title || !description || !startingPrice || !startTime || !endTime) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 });
    }

    const newAuction = await Auction.create({
      title,
      description,
      image: image || "",
      startingPrice,
      currentPrice: startingPrice,
      startTime,
      endTime,
      status: "active",
    });

    return NextResponse.json({ message: "Auction created successfully", auction: newAuction }, { status: 201 });
  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
