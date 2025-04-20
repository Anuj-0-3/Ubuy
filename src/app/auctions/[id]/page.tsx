"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, IndianRupee, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import BiddersTable from "@/components/BiddersTable";

type Bidder = {
  _id: string;
  bidder: {
    name: string;
  };
  amount: number;
  bidTime: string;
};

type Auction = {
  _id: string;
  title: string;
  description: string;
  image: string;
  currentPrice: number;
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

      // ✅ Safe live update
      setAuction((prevAuction) => {
        if (!prevAuction) return prevAuction;

        return {
          ...prevAuction,
          currentPrice: result.updatedAuction.currentPrice,
          bidders: result.updatedAuction.bidders,
        };
      });

      setBidInputs({ ...bidInputs, [id]: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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
        {/* Left Side Image */}
        <div className="flex justify-center">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={auction.image}
              alt={auction.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>

        {/* Right Side Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {auction.title}
          </h1>

          <p className="text-gray-600">{auction.description}</p>

          <div className="space-y-2">
            {auction && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <IndianRupee className="text-green-600" />
                Current Price: ₹{auction.currentPrice}
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-500">
              <Timer className="text-orange-500" />
              Ends At: {new Date(auction.endTime).toLocaleString()}
            </div>
          </div>

          {!isClosed && auction && (
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
                className="w-full bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
              >
                Place Bid
              </Button>
            </div>
          )}


          <div className="border rounded-lg overflow-hidden mt-6">
            <h2 className="bg-gray-100 px-4 py-2 font-semibold text-lg">
              Top 5 Bidders
            </h2>
            <BiddersTable bidders={auction.bidders.slice(0, 5)} />
          </div>
        </div>
      </div>
    </div>
  );
}

