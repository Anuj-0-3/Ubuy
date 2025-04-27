import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export async function POST(req: Request) {
  console.log("Incoming upload request!");
  
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    console.log("File received:", (file as File).name);

    return NextResponse.json({ message: "File received successfully" });
  } catch (error) {
    console.error("Error inside POST:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
