import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, username, password } = await req.json();
    const existingUser = await User.findOne({ email });
    const existingVerifiedUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      verificationcode: verifyCode,
      verificationCodeExpiry: expiry,
      isVerified: false,
    });
    
    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during sign-up:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
