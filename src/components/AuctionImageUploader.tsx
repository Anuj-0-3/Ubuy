"use client";

import { useState } from "react";
import Image from "next/image";

interface AuctionImageUploaderProps {
  onUpload: (imageUrls: string[]) => void;
}

const AuctionImageUploader: React.FC<AuctionImageUploaderProps> = ({ onUpload }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => validateFile(file));

    if (validFiles.length + images.length > 5) {
      setError("You can upload up to 5 images.");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => validateFile(file));

    if (validFiles.length + images.length > 5) {
      setError("You can upload up to 5 images.");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
  };

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    return validTypes.includes(file.type);
  };

  const UPLOADIMG = process.env.NEXT_PUBLIC_UPLOAD_API || "/api/upload";

  const handleUpload = async () => {
    if (images.length === 0) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    images.forEach((file) => formData.append("files", file));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOADIMG, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.urls) {
          onUpload(response.urls); // pass the uploaded URLs to the parent
          setImages([]);
          setPreviews([]);
          setProgress(0);
        } else {
          setError("Unexpected response format.");
        }
      } else {
        setError("Upload failed: " + xhr.responseText);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("An error occurred during the upload.");
    };

    xhr.send(formData);
  };

  return (
    <div className="p-6 border hover:cursor-pointer rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-semibold mb-4">Upload up to 5 Images</h2>

      <div
        className="border-2 border-dashed p-4 rounded-lg bg-gray-50 mb-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          id="file-upload"
          multiple
        />
        <label htmlFor="file-upload" className="w-full text-center text-gray-600 font-medium cursor-pointer">
          Drag & Drop or Click to Upload (max 5)
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {previews.map((src, idx) => (
            <div key={idx} className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={src}
                alt={`Preview ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 transition duration-200 ease-in-out"
        disabled={uploading || images.length === 0}
      >
        {uploading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin h-6 w-6 border-t-2 border-white rounded-full"></div>
          </div>
        ) : (
          "Upload"
        )}
      </button>

      {uploading && (
        <div className="mt-4 text-center">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
};

export default AuctionImageUploader;
