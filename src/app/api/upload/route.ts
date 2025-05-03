import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = 'nodejs';

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
            console.error("Cloudinary upload error:", error);
            return reject(error); // Reject with Cloudinary error
          }

          // Log the full result for debugging
          console.log("Cloudinary response:", result);

          if (!result || !result.secure_url) {
            console.error("Cloudinary response error: No secure URL");
            return reject(new Error("Upload failed with no result URL"));
          }

          resolve(result.secure_url);
        }
      );

      stream.pipe(uploadStream);

      // Handle stream errors
      stream.on('error', (streamError) => {
        console.error("Stream error:", streamError);
        reject(new Error('Stream error: ' + streamError.message));
      });
    });

    return NextResponse.json({ url: uploadedUrl });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
