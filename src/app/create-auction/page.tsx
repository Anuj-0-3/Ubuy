"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import AuctionImageUploader from "@/components/AuctionImageUploader";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

const CreateAuction = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
    image: "",
    category: "Other",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!session) {
      setError("You must be logged in to create an auction.");
      setLoading(false);
      return;
    }

    if (!formData.image) {
      setError("Please upload an image before submitting.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startingPrice: Number(formData.startingPrice),
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSuccess("Auction created successfully!");
      setFormData({
        title: "",
        description: "",
        startingPrice: "",
        startTime: "",
        endTime: "",
        image: "",
        category: "Other",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex py-10 flex-col items-center justify-center min-h-screen">
      {session ? (
        <div className="w-full max-w-lg p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-4">Create Auction</h2>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Starting Price (₹)</label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  min={getMinDateTime()}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="w-1/2">
                <label className="block font-medium">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={getMinDateTime()}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full p-2 border rounded"
              >
                <option value="Collectibles">Collectibles</option>
                <option value="Art">Art</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Other">Other</option>
              </select>
            </div>
             <div className="flex justify-center">

            <AuctionImageUploader onUpload={handleImageUpload} />
            {formData.image && <p className="text-green-600">Image uploaded successfully!</p>}
             </div>

            <Button type="submit" className="w-full bg-emerald-600 text-white" disabled={loading}>
              {loading ? "Creating Auction..." : "Create Auction"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 border border-gray-300 p-6 rounded-lg shadow-lg">
          <Lock size={48} className="text-gray-500" />
          <p className="text-lg text-gray-700">You must log in to create an auction.</p>
          <Link href="/sign-in">
            <Button className="bg-emerald-600 text-gray-50" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreateAuction;
