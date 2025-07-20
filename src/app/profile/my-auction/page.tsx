"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import AuctionCard from "@/components/AuctionCard";
import AuctionCardSkeleton from "@/components/Skeleton/AuctionCardSkeleton";

export interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  category: string;
  highestBidder?: string;
  startTime: string;
  endTime: string;
  status: "active" | "closed";
  createdBy: string;
}

const ITEMS_PER_PAGE = 6;

const MyAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/auction/myauction");
      const data = await res.json();
      setAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching auctions", err);
      toast.error("Something went wrong while fetching auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const indexOfLastAuction = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstAuction = indexOfLastAuction - ITEMS_PER_PAGE;
  const currentAuctions = auctions.slice(indexOfFirstAuction, indexOfLastAuction);
  const totalPages = Math.ceil(auctions.length / ITEMS_PER_PAGE);

  return (
    <>
      <Head>
        <title>My Auctions</title>
        <meta name="description" content="Manage all the auctions you have created." />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">My Auctions</h1>
          <p className="text-gray-600 mt-2">Here are all the auctions you’ve created</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
              {currentAuctions.length === 0 ? (
                <p className="text-gray-500">No auctions found.</p>
              ) : (
                currentAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} showWishlist={false} />
                ))
              )}
            </div>

            {auctions.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center mt-8 space-x-4">
                <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-gray-700 font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default MyAuctionsPage;
