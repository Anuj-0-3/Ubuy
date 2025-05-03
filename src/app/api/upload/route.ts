import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = 'nodejs'; // Good for stream handling

export async function POST(req: Request) {
  try {
    // Get the file from the form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // If no file is provided, return a 400 error
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a buffer and create a readable stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Attempt to upload the file to Cloudinary
    const uploadedUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "auction_images" },
        (error, result) => {
          // Handle Cloudinary upload errors
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error); // Reject with the Cloudinary error
          }

          // Check for successful result
          if (!result || !result.secure_url) {
            console.error("Cloudinary response error: No secure URL");
            return reject(new Error("Upload failed with no result URL"));
          }

          resolve(result.secure_url);
        }
      );

 
      stream.pipe(uploadStream);

    
      stream.on('error', (streamError) => {
        console.error("Stream error:", streamError);
        reject(new Error('Stream error: ' + streamError.message));
      });
    });

    return NextResponse.json({ url: uploadedUrl });
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Upload error:", error);

    // Return the error details in the response for debugging
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


