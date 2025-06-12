"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AuctionImageUploader from "@/components/AuctionImageUploader";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import Turnstile from "react-turnstile";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, setHours, setMinutes } from "date-fns";



const CreateAuction = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
    images: [] as string[],
    category: "Other",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");

  const now = new Date();

  const [startDate, setStartDate] = useState<Date | null>(now);

  const getLocalTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  const [startTime, setStartTime] = useState(getLocalTimeString());

  const [endDate, setEndDate] = useState<Date | null>(now);
  const [endTime, setEndTime] = useState(getLocalTimeString());

  useEffect(() => {
    const [hours, minutes] = getLocalTimeString().split(":").map(Number);
    const start = setMinutes(setHours(new Date(), hours), minutes);
    setFormData(prev => ({ ...prev, startTime: start.toISOString(), endTime: start.toISOString() }));
  }, []);

  const getCurrentTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrls: string[]) => {
    setFormData({ ...formData, images: imageUrls });
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

    if (!formData.images || formData.images.length === 0) {
      setError("Please upload at least one image before submitting.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("CAPTCHA validation failed. Please try again.");
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
          token,
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
        images: [],
        category: "Other",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex py-10 px-4 sm:px-0 flex-col items-center justify-center min-h-screen bg-gray-50">
      {session ? (
        <div className="w-full max-w-lg p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Create Auction
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-4 bg-emerald-100 border-emerald-400 text-emerald-800">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter auction title"
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe your item in detail"
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Starting Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price (₹)
              </label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                required
                placeholder="e.g. 1000"
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Start & End Time */}
            <div className="flex gap-4">
              {/* Start Time */}
              <div className="w-1/2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm text-left ${!startDate ? "text-gray-400" : "text-gray-800"
                        }`}
                    >
                      {startDate ? format(startDate, "PPP") : "Pick a start date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        const [hours, minutes] = startTime.split(":").map(Number);
                        const fullDate = setMinutes(setHours(date, hours), minutes);
                        setStartDate(fullDate);
                        setFormData({ ...formData, startTime: fullDate.toISOString() });
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="bg-white text-gray-900 border rounded-xl shadow"
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="time"
                  value={startTime}
                  min={
                    startDate && new Date().toDateString() === startDate.toDateString()
                      ? getCurrentTimeString()
                      : undefined
                  }
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (startDate) {
                      const [hours, minutes] = e.target.value.split(":").map(Number);
                      const updated = setMinutes(setHours(startDate, hours), minutes);
                      setStartDate(updated);
                      setFormData({ ...formData, startTime: updated.toISOString() });
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />


              </div>

              {/* End Time */}
              <div className="w-1/2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm text-left ${!endDate ? "text-gray-400" : "text-gray-800"
                        }`}
                    >
                      {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        const [hours, minutes] = endTime.split(":").map(Number);
                        const fullDate = setMinutes(setHours(date, hours), minutes);
                        setEndDate(fullDate);
                        setFormData({ ...formData, endTime: fullDate.toISOString() });
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (endDate) {
                      const [hours, minutes] = e.target.value.split(":").map(Number);
                      const updated = setMinutes(setHours(endDate, hours), minutes);
                      setEndDate(updated);
                      setFormData({ ...formData, endTime: updated.toISOString() });
                    }
                  }}
                  className="w-full p-2 text-sm bg-white text-gray-800 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>


            {/* Category with shadcn Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {["Collectibles", "Art", "Electronics", "Fashion", "Other"].map(
                    (cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="cursor-pointer px-4 py-2 text-sm hover:bg-emerald-100 aria-selected:bg-emerald-200"
                      >
                        {cat}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col items-center">
              <AuctionImageUploader onUpload={handleImageUpload} />
              {formData.images.length > 0 && (
                <p className="text-sm text-emerald-600 font-medium mt-2">
                  ✅ {formData.images.length} image(s) uploaded successfully!
                </p>
              )}
            </div>
            <div className="flex justify-center mt-4">

              {/* Turnstile CAPTCHA */}
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token) => setToken(token)}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full hover:cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full py-3 transition-all"
            >
              {loading ? "Creating Auction..." : " Create Auction"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 border border-gray-300 p-6 rounded-lg shadow-lg bg-white">
          <Lock size={48} className="text-gray-500" />
          <p className="text-lg text-gray-700">
            You must log in to create an auction.
          </p>
          <Link href="/sign-in">
            <Button className="bg-emerald-600 text-white">Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreateAuction;
