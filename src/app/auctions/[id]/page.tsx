"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, IndianRupee, Timer, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import BiddersTable from "@/components/BiddersTable";
import Pusher from "pusher-js";

type Bidder = {
  _id: string;
  bidderName: string;
  amount: number;
  bidTime: string;
};

type Auction = {
  _id: string;
  title: string;
  description: string;
  images: string[]; 
  currentPrice: number;
  startingPrice: number;
  category: string;
  endTime: string;
  status: string;
  bidders: Bidder[];
};

export default function AuctionDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleBid = async (id: string) => {
    const bidAmount = parseFloat(bidInputs[id]);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Please enter a valid bid amount.");
      return;
    }

    try {
      const res = await fetch(`/api/auction/bid/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidAmount }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to place bid");
      }

      toast.success("Bid placed successfully!");

      const updatedRes = await fetch(`/api/auction/${id}/details`);
      const updatedData = await updatedRes.json();
      if (updatedData.success) {
        setAuction(updatedData.auction);
      }

      setBidInputs({ ...bidInputs, [id]: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  useEffect(() => {
    async function fetchAuction() {
      setLoading(true);
      try {
        const res = await fetch(`/api/auction/${id}/details`);
        const data = await res.json();
        if (data.success) {
          setAuction(data.auction);
        }
      } catch (err) {
        console.error("Failed to fetch auction:", err);
      }
      setLoading(false);
    }

    if (id) fetchAuction();
  }, [id]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "default-cluster",
    });

    const channel = pusher.subscribe(`auction-${id}`);
    channel.bind("new-bid", (data: Bidder) => {
      setAuction((prevAuction) => {
        if (prevAuction) {
          const updatedBidders = [...prevAuction.bidders, data];
          return {
            ...prevAuction,
            currentPrice: data.amount,
            bidders: updatedBidders,
          };
        }
        return prevAuction;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [id]);

  // Set default selected image when auction data loads
  useEffect(() => {
    if (auction?.images && auction.images.length > 0) {
      setSelectedImage(auction.images[0]);
    }
  }, [auction]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center mt-10 text-gray-500">Auction not found.</div>
    );
  }

  const isClosed = auction.status === "closed";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side Image with Mini Photo Viewer */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-4">
          {/* Thumbnails */}
          <div className="flex lg:flex-col sm:gap-2 overflow-x-auto lg:overflow-y-auto">
            {auction.images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`relative flex-shrink-0 w-20 h-20 border rounded cursor-pointer overflow-hidden ${
                  selectedImage === imgUrl ? "ring-2 ring-emerald-500" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(imgUrl)}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={auction.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
        </div>

        {/* Right Side Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {auction.title}
          </h1>

          <p className="text-gray-600">{auction.description}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Tag className="text-purple-500" />
              Category:{" "}
              <span className="font-medium text-gray-600">
                {auction.category}
              </span>
            </div>

            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <IndianRupee className="text-blue-500" />
              Starting Price: ₹{auction.startingPrice}
            </div>

            <div className="flex items-center gap-2 text-lg font-semibold">
              <IndianRupee className="text-green-600" />
              Current Price: ₹{auction.currentPrice}
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <Timer className="text-orange-500" />
              Ends At: {new Date(auction.endTime).toLocaleString()}
            </div>
          </div>

          {!isClosed && (
            <div className="pt-2 space-y-2">
              <Input
                type="number"
                placeholder="Your Bid (₹)"
                className="border border-gray-300 focus:border-emerald-500"
                value={bidInputs[auction._id] || ""}
                onChange={(e) =>
                  setBidInputs({ ...bidInputs, [auction._id]: e.target.value })
                }
              />
              <Button
                onClick={() => handleBid(auction._id)}
                className="w-full hover:cursor-pointer bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
              >
                Place Bid
              </Button>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden mt-6">
            <h2 className="bg-purple-300 flex justify-center px-4 py-2 font-semibold tracking-wide text-xl md:text-2xl">
              Top 5 Bidders
            </h2>
            <BiddersTable bidders={auction.bidders} />
          </div>
        </div>
      </div>
    </div>
  );
}



