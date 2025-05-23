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
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file && validateFile(file)) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setError("Please select a valid image file (JPG, PNG, GIF).");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setError("Please select a valid image file (JPG, PNG, GIF).");
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    return validTypes.includes(file.type);
  };

  const UPLOADIMG = process.env.NEXT_PUBLIC_UPLOAD_API || "/api/upload";

  const handleUpload = async () => {
    if (!image) return;
    setUploading(true);
    setError(null);  // Clear previous errors

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
        setError("Upload failed: " + xhr.responseText);
      }
    };

    // On error
    xhr.onerror = () => {
      setUploading(false);
      setError("An error occurred during the upload.");
    };

    // Send the FormData
    xhr.send(formData);
  };

  return (
    <div className="p-6 border hover:cursor-pointer rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-semibold mb-4">Upload Your Image</h2>

      <div
        className={`border-2 border-dashed p-4 rounded-lg ${dragging ? "bg-blue-100" : "bg-gray-50"} mb-4`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="w-full text-center text-gray-600 font-medium cursor-pointer">
          {dragging ? "Release to drop the file here" : "Drag & Drop or Click to Upload"}
        </label>
      </div>

      {preview && (
        <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-100 transition-opacity duration-500 ease-in-out opacity-100">
          <Image
            src={preview}
            alt="Preview"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 transition duration-200 ease-in-out"
        disabled={uploading}
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
            <div className="flex mb-2 items-center justify-between">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
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
