"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import { getRemainingTime } from "@/utils/time";
import Image from "next/image";

interface Auction {
  _id: string;
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  highestBidder?: string;
  startTime: string;
  endTime: string;
  status: "active" | "closed";
  createdBy: string;
}

const AllAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: string }>({});
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("/api/auction/all");
        const data = await res.json();
        setAuctions(data);
      } catch (err) {
        console.error("Error fetching auctions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes: { [key: string]: string } = {};
      auctions.forEach((auction) => {
        updatedTimes[auction._id] = getRemainingTime(auction.endTime);
      });
      setRemainingTimes(updatedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [auctions]);

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
      const updated = await fetch("/api/auction/all");
      setAuctions(await updated.json());
      setBidInputs({ ...bidInputs, [id]: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">All Auctions</h1>
          <p className="text-gray-600 mt-2">Explore live and upcoming auctions</p>
        </div>

        {loading ? (
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
            {auctions.length === 0 ? (
              <p className="text-gray-500">No auctions found.</p>
            ) : (
              auctions.map((auction) => {
                const timeLeft = remainingTimes[auction._id] || "Calculating...";
                const isClosed = timeLeft === "Closed" || auction.status === "closed";

                return (
                  
                  <Card
                    key={auction._id}
                    className="relative bg-white/10 backdrop-blur-md border border-emerald-400/40 shadow-lg rounded-2xl transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <Link href={`/auctions/${auction._id}`} passHref>
                    {/* ⏳ Countdown in top right */}
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full z-10 shadow">
                      {timeLeft}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                      <p className="text-gray-700">{auction.description}</p>
                      {auction.image && (
                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
                        <Image
                          src={auction.image}
                          alt={auction.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      )}
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Start:</strong> {new Date(auction.startTime).toLocaleString()}</p>
                        <p><strong>End:</strong> {new Date(auction.endTime).toLocaleString()}</p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={isClosed ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                            {isClosed ? "Closed" : "Active"}
                          </span>
                        </p>
                        <p><strong>Current Price:</strong> ₹{auction.currentPrice}</p>
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
                            className="w-full bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
                          >
                            Place Bid
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    </Link>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AllAuctionsPage;


