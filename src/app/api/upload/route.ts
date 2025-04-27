import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const uploadedUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "auction_images" },
        (error, result) => {
          if (error) {
            reject(error);  
          } else if (result?.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error("Upload failed with no URL"));
          }
        }
      );

      stream.pipe(uploadStream);
    });

    return NextResponse.json({ url: uploadedUrl });

  } catch (error) {
    console.error("Error uploading file:",error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
