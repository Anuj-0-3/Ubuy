"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession } from "next-auth/react";

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
  winnerId?: string;
}

interface PaymentLinkResponse {
  payment_link?: string;
  error?: string;
}

const ITEMS_PER_PAGE = 9;

const BiddedAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // ✅ Pagination state
  const { data: session } = useSession();
  const myUserId = session?.user?.id;

  // Fetch bidded auctions
  const fetchBiddedAuctions = async () => {
    try {
      const res = await fetch("/api/auction/bidded-auction");
      const data = await res.json();

      if (data.biddedAuctions && Array.isArray(data.biddedAuctions)) {
        setAuctions(data.biddedAuctions);
      } else {
        toast.error(data.error || "Failed to fetch bidded auctions");
        setAuctions([]);
      }
    } catch (err) {
      console.error("Error fetching bidded auctions", err);
      toast.error("Something went wrong while fetching bidded auctions.");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiddedAuctions();
  }, []);

  const handleAuctionClick = (auctionId: string) => {
    window.location.href = `/auctions/${auctionId}`;
  };

  const handlePayHere = async (auctionId: string) => {
    try {
      setProcessing(auctionId);
      toast.loading("Generating payment link...", { id: "payment" });

      const res = await fetch("/api/auction/notify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId }),
      });

      const data: PaymentLinkResponse = await res.json();
      console.log("Payment link response:", data);

      toast.dismiss("payment");

      if (res.ok && data.payment_link) {
        toast.success("Redirecting to payment page...");
        window.location.href = data.payment_link;
      } else {
        toast.error(data.error || "Failed to generate payment link.");
      }
    } catch (err) {
      console.error("Error generating payment link:", err);
      toast.dismiss("payment");
      toast.error("Something went wrong while creating payment link.");
    } finally {
      setProcessing(null);
    }
  };

  // ✅ Pagination logic
  const indexOfLastAuction = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstAuction = indexOfLastAuction - ITEMS_PER_PAGE;
  const currentAuctions = auctions.slice(indexOfFirstAuction, indexOfLastAuction);
  const totalPages = Math.ceil(auctions.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Bidded Auctions</h1>
        <p className="text-gray-600 mt-2">Here are the auctions you've placed bids on</p>
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
            {currentAuctions.length === 0 ? (
              <p className="text-gray-500">You haven't placed any bids yet.</p>
            ) : (
              currentAuctions.map((auction) => (
                <Card
                  key={auction._id}
                  className="relative bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden"
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

                    <Button
                      className="w-full mt-4 bg-emerald-500 text-white hover:bg-emerald-600"
                      onClick={() => handleAuctionClick(auction._id)}
                    >
                      View Auction Details
                    </Button>

                    {auction.status === "closed" && auction.winnerId === myUserId && (
                      <Button
                        className="w-full mt-2 bg-purple-600 text-white hover:bg-purple-700"
                        disabled={processing === auction._id}
                        onClick={() => handlePayHere(auction._id)}
                      >
                        {processing === auction._id ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={18} />
                            Redirecting...
                          </>
                        ) : (
                          "Pay Here"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* ✅ Pagination controls */}
          {auctions.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center mt-8 space-x-4">
              <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
              <span className="text-gray-700 font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BiddedAuctionsPage;


