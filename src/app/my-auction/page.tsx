"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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

const MyAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/auction/myauction");
      const data = await res.json();

      if (Array.isArray(data)) {
        setAuctions(data);
      } else {
        toast.error(data.error || "Failed to fetch auctions");
        setAuctions([]);
      }
    } catch (err) {
      console.error("Error fetching auctions", err);
      toast.error("Something went wrong while fetching auctions.");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAuction = async (auctionId: string) => {
    console.log("👉 Closing auction with ID:", auctionId);
    try {
      const res = await fetch("/api/auction/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to close auction");

      toast.success("Auction closed successfully!");
      fetchAuctions();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">My Auctions</h1>
          <p className="text-gray-600 mt-2">Here are all the auctions you’ve created</p>
        </div>

        {loading ? (
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
            {auctions.length === 0 ? (
              <p className="text-gray-500">No auctions found.</p>
            ) : (
              auctions.map((auction) => (
                <Card
                  key={auction._id}
                  className="bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                    <p className="text-gray-700">{auction.description}</p>
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
                      <Image
                        src={auction.image}
                        alt={auction.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Start:</strong> {new Date(auction.startTime).toLocaleString()}</p>
                      <p><strong>End:</strong> {new Date(auction.endTime).toLocaleString()}</p>
                      <p><strong>Status:</strong> {auction.status}</p>
                      <p><strong>Current Price:</strong> ₹{auction.currentPrice}</p>
                    </div>

                    {auction.status === "active" && (
                      <AlertDialog >
                        <AlertDialogTrigger asChild>
                          <Button className="w-full mt-4 bg-red-500 text-white hover:bg-red-600">
                            Close Auction
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Closing this auction will prevent any further bids. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleCloseAuction(auction._id)}
                            >
                              Yes, close it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MyAuctionsPage;


