"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"


interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  highestBidder?: string;
  startTime: string;
  category: string;
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("endingSoon");
  const categories = ["All", "Art", "Electronics", "Fashion", "Other", "Collectibles"];
  const [categoryFilter, setCategoryFilter] = useState("All");

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

  // Search, Filter, and Sort
  const filteredAuctions = auctions
    .filter((a) =>
      (a.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (a.description?.toLowerCase() || "").includes(search.toLowerCase())
    )
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter((a) => categoryFilter === "All" || a.category === categoryFilter)
    .sort((a, b) => {
      if (a.status === "active" && b.status === "closed") return -1;
      if (a.status === "closed" && b.status === "active") return 1;
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

  console.log("Filtered:", filteredAuctions.map(a => a.title));

  // Handle payment link generation
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
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Bidded Auctions</h1>
        <p className="text-gray-600 mt-2">Here are the auctions you&apos;ve placed bids on</p>
      </div>

      {/* Search, Filter, Sort */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-6xl px-4 mb-8 overflow-x-auto"
      >
        <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 items-center bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-sm transition-all duration-300 ease-in-out">

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-2.5 text-gray-400"><Search className="w-4 h-4" /></span>
            <Input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-full border-gray-300 focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[130px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                <SelectItem value="all" className="cursor-pointer px-4 py-2 text-sm focus:bg-emerald-400 hover:bg-emerald-400 aria-selected:bg-emerald-300">All Status</SelectItem>
                <SelectItem value="active" className="cursor-pointer px-4 py-2 text-sm focus:bg-emerald-400 hover:bg-emerald-400 aria-selected:bg-emerald-300">Active</SelectItem>
                <SelectItem value="closed" className="cursor-pointer px-4 py-2 text-sm focus:bg-emerald-400 hover:bg-emerald-400 aria-selected:bg-emerald-300">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="min-w-[150px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                {categories.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-emerald-400 focus:bg-emerald-400 aria-selected:bg-emerald-300"
                  >
                    {cat === "All" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          {/* Sort Option */}
          <div className="min-w-[130px]">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                <SelectItem value="endingSoon" className="cursor-pointer px-4 py-2 text-sm hover:bg-emerald-400 focus:bg-emerald-400 aria-selected:bg-emerald-300">Ending Soon</SelectItem>
                <SelectItem value="newest" className="cursor-pointer px-4 py-2 text-sm hover:bg-emerald-400 focus:bg-emerald-400 aria-selected:bg-emerald-300">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/*  Reset Filters */}
          <div className="min-w-[130px]">
            <Button
              variant="outline"
              className="w-full text-white hover:text-gray-100 hover:cursor-pointer text-sm rounded-full bg-red-500 border-gray-300 hover:bg-red-600"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("All");
                setSortOption("endingSoon");
              }}
            >
              <X className="w-4 h-4 text-white" />
              Clear Filters
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 sm:px-4 max-w-6xl">
            {currentAuctions.length === 0 ? (
              <p className="text-gray-500">You haven&apos;t placed any bids yet.</p>
            ) : (
              currentAuctions.map((auction) => (
                <Card
                  key={auction._id}
                  className="relative bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden"
                >
                  <CardContent className="p-6 space-y-2 sm:space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                    <p className="text-gray-700">{auction.description}</p>
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
                      {auction.images && auction.images.length > 0 && (
                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
                          <Image
                            src={auction.images[0]}
                            alt={auction.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Start:</strong> {new Date(auction.startTime).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}</p>

                      <p><strong>End:</strong> {new Date(auction.endTime).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}</p>
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


