"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getRemainingTime } from "@/utils/time";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Heart } from "lucide-react";

interface Auction {
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

const ITEMS_PER_PAGE = 9;

const AllAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: string }>({});
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("endingSoon");
  const categories = ["All", "Art", "Electronics", "Fashion", "Other", "Collectibles"];
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [, setWishlistLoading] = useState(false);


  // Fetch all auctions on component mount
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
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/auction/wishlist/fetch");
        const data = await res.json();
        if (data.wishlist) {
            const wishlistAuctionIds: string[] = data.wishlist.map((item: { auction: { _id: string } }) => item.auction._id);
          setWishlist(wishlistAuctionIds);
        }
      } catch (err) {
        console.error("Error fetching wishlist", err);
      }
    };
    fetchWishlist();

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
      if (!res.ok) throw new Error(result.error || "Failed to place bid");

      toast.success("Bid placed successfully!");
      const updated = await fetch("/api/auction/all");
      setAuctions(await updated.json());
      setBidInputs({ ...bidInputs, [id]: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleAddToWishlist = async (auctionId: string) => {
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/auction/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add to wishlist");

      setWishlist((prev) => [...prev, auctionId]);
      toast.success(result.message || "Added to wishlist!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (auctionId: string) => {
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/auction/wishlist/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to remove from wishlist");

      setWishlist((prev) => prev.filter((id) => id !== auctionId));
      toast.success(result.message || "Removed from wishlist!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
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

  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const currentAuctions = filteredAuctions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">All Auctions</h1>
        <p className="text-gray-600 mt-2">Explore live and upcoming auctions</p>
      </div>

      {/* Search, Filter, Sort */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-6xl px-4 mb-8"
      >
        <div className="flex flex-wrap gap-4 sm:gap-6 items-center bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-sm transition-all duration-300 ease-in-out">

          {/* Search Input - flex-grow more */}
          <div className="relative flex-[2] min-w-[150px]">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <Input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-full border-gray-300 focus:ring-2 focus:ring-emerald-400 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[120px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="flex-1 min-w-[140px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Option */}
          <div className="flex-1 min-w-[120px]">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                <SelectItem value="endingSoon">Ending Soon</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button - flex-grow less */}
          <div className="flex-[0.5] min-w-[100px]">
            <Button
              variant="outline"
              className="w-full text-white text-sm rounded-full bg-red-500 hover:bg-red-600 border-none flex items-center justify-center gap-2"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("All");
                setSortOption("endingSoon");
              }}
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </form>
      {loading ? (
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-sm sm:w-full px-8 sm:px-4 max-w-6xl">
            {currentAuctions.length === 0 ? (
              <p className="text-gray-500">No auctions found in this category.</p>
            ) : (
              currentAuctions.map((auction) => {
                const timeLeft = remainingTimes[auction._id] || "Calculating...";
                const isClosed = timeLeft === "Closed" || auction.status === "closed";

                return (
                  <Card
                    key={auction._id}
                    className="relative bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden"
                  >
                    {/* Wishlist Button - top left */}
                    <div className="absolute top-3 left-3 z-10">
                      {wishlist.includes(auction._id) ? (
                        <Heart
                          onClick={() => handleRemoveFromWishlist(auction._id)}
                          className="w-6 h-6 text-emerald-500 cursor-pointer hover:scale-110 transition-transform"
                          fill="currentColor"
                          stroke="currentColor"
                        />
                      ) : (
                        <Heart
                          onClick={() => handleAddToWishlist(auction._id)}
                          className="w-6 h-6 text-emerald-500 cursor-pointer hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                        />
                      )}
                    </div>


                    {/* Time Badge - top right */}
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full z-10 shadow">
                      {timeLeft}
                    </div>


                    <CardContent className="p-6 space-y-2 sm:space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                      <p className="text-gray-700">{auction.description}</p>
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
                      <div className="text-sm text-gray-600 space-y-1">
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
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={isClosed ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                            {isClosed ? "Closed" : "Active"}
                          </span>
                        </p>
                        <p><strong>Starting Price:</strong> ₹{auction.startingPrice}</p>
                        <p><strong>Current Price:</strong> ₹{auction.currentPrice}</p>
                        <p><strong>Category:</strong> {auction.category}</p>
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
                          <Link href={`/auctions/${auction._id}`} passHref>
                            <Button className="w-full hover:cursor-pointer bg-indigo-500 text-white rounded-full hover:bg-indigo-600">Explore More</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>


          {/* Pagination */}
          <div className="flex justify-center mt-10 space-x-4">
            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            <span className="text-gray-700">{`Page ${currentPage} of ${totalPages}`}</span>
            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllAuctionsPage;



