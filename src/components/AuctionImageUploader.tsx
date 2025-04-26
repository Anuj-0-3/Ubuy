"use client";

import { useState } from "react";
import Image from "next/image";

interface AuctionImageUploaderProps {
  onUpload: (imageUrl: string) => void;
}

const AuctionImageUploader: React.FC<AuctionImageUploaderProps> = ({ onUpload }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onUpload(data.url); // ✅ Pass uploaded image URL to parent
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }

    setUploading(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-96">
      <input type="file" onChange={handleFileChange} className="mb-2" />
      {preview &&
        <div className="relative w-full h-64 mb-2">
        <Image
          src={preview}
          alt="Preview"
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
      </div>
       }
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default AuctionImageUploader;
