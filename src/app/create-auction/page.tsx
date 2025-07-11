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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, setHours, setMinutes, addHours } from "date-fns";
import { toast } from "sonner";


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
  const [token, setToken] = useState("");

  const now = new Date();

  const getLocalTimeString = (date = new Date()) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [startDate, setStartDate] = useState<Date | null>(now);
  const [startTime, setStartTime] = useState(getLocalTimeString());
  const [endDate, setEndDate] = useState<Date | null>(addHours(now, 1));
  const [endTime, setEndTime] = useState(getLocalTimeString(addHours(now, 1)));

  useEffect(() => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const start = setMinutes(setHours(new Date(), hours), minutes);
    const end = addHours(start, 1);
    setFormData(prev => ({
      ...prev,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }));
    setEndDate(end);
    setEndTime(getLocalTimeString(end));
  }, []);

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

    if (!session) {
      toast("You must be logged in to create an auction.");
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      toast("Validation Error: Title cannot be empty.");
      setLoading(false);
      return;
    }

    if (!formData.startingPrice || Number(formData.startingPrice) <= 0) {
      toast("Validation Error: Starting price must be greater than zero.");
      setLoading(false);
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      toast("Validation Error: Please upload at least one image.");
      setLoading(false);
      return;
    }

    if (!token) {
      toast("CAPTCHA validation failed. Please try again.");
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

      toast("Auction created successfully!");

      setFormData({
        title: "",
        description: "",
        startingPrice: "",
        startTime: "",
        endTime: "",
        images: [],
        category: "Other",
      });

      setStartTime(getLocalTimeString());
      setEndTime(getLocalTimeString(addHours(new Date(), 1)));
    } catch (err) {
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {session ? (
        <div className="w-full max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
            Create Auction
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter auction title"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  aria-label="Auction Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price (₹)</label>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 1000"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  aria-label="Starting Price"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe your item in detail"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                aria-label="Description"
              />
            </div>

            <div className="border-t pt-4 mt-4 flex gap-4">
             
                  {/* Start Time */}
                  <div className="w-1/2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Date & Time (24H)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm text-left ${!startDate ? "text-gray-400" : "text-gray-800"}`}
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
                      aria-label="Start Time"
                    />
              </div>

              
                  <div className="w-1/2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Date & Time (24H)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm text-left ${!endDate ? "text-gray-400" : "text-gray-800"}`}
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
                          className="bg-white text-gray-900 border rounded-xl shadow"
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
                      className="w-full p-2 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-emerald-500"
                      aria-label="End Time"
                    />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {["Collectibles", "Art", "Electronics", "Fashion", "Other"].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-center">
              <AuctionImageUploader onUpload={handleImageUpload} />
            </div>

            <div className="flex justify-center mt-4">
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token) => setToken(token)}
                aria-label="Captcha Verification"
              />
            </div>

            <Button type="submit" className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
              {loading ? "Creating Auction..." : "Create Auction"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg shadow-lg bg-white">
          <Lock size={48} className="text-gray-500" />
          <p className="text-lg text-gray-700">You must log in to create an auction.</p>
          <Link href="/sign-in">
            <Button className="bg-emerald-600 text-white">Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreateAuction;
