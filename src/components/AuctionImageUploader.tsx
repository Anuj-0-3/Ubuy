"use client";

import { useState } from "react";

const AuctionImageUploader = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

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
        setImageUrl(data.url);
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
      {preview && <img src={preview} alt="Preview" className="w-full mb-2" />}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {imageUrl && (
        <p className="mt-2 text-green-500">Uploaded: {imageUrl}</p>
      )}
    </div>
  );
};

export default AuctionImageUploader;
