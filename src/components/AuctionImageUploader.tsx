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
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const UPLOADIMG = process.env.NEXT_PUBLIC_UPLOAD_API || "/api/upload";

  const handleUpload = async () => {
    if (!image) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", image);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOADIMG, true);

    // Track progress of the upload
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    // On successful upload
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        onUpload(response.url);
      } else {
        alert("Upload failed: " + xhr.responseText);
      }
    };

    // On error
    xhr.onerror = () => {
      setUploading(false);
      alert("An error occurred during the upload.");
    };

    // Send the FormData
    xhr.send(formData);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-96">
      <input type="file" onChange={handleFileChange} className="mb-2" />
      {preview && (
        <div className="relative w-full h-64 mb-2">
          <Image
            src={preview}
            alt="Preview"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
      )}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {uploading && (
        <div className="mt-2">
          <progress value={progress} max={100} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default AuctionImageUploader;
