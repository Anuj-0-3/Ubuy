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
} from "@/components/ui/select";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [, setSortOption] = useState("endingSoon");
  const categories = ["All", "Art", "Electronics", "Fashion", "Other", "Collectibles"];
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [, setWishlistLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(0);
  const [quickPriceFilter, setQuickPriceFilter] = useState("");


  // Fetch auctions
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

  // Fetch wishlist and timers
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

  // Filtered auctions
  const filteredAuctions = auctions
    .filter((a) =>
      (a.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (a.description?.toLowerCase() || "").includes(search.toLowerCase())
    )
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter((a) => categoryFilter === "All" || a.category === categoryFilter)
    .filter((a) => {
      if (quickPriceFilter === "under500") return a.currentPrice <= 500;
      if (quickPriceFilter === "500to1000") return a.currentPrice > 500 && a.currentPrice <= 1000;
      if (quickPriceFilter === "above1000") return a.currentPrice > 1000;
      return a.currentPrice <= priceRange || priceRange === 0;
    })
    .sort((a, b) => {
      if (a.status === "active" && b.status === "closed") return -1;
      if (a.status === "closed" && b.status === "active") return 1;
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const currentAuctions = filteredAuctions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full mx-auto px-6 sm:px-12 py-10">

      {/* Search Bar at Top */}
      <div className="w-full mb-4">
        <div className="relative w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <Input
            type="text"
            placeholder="Search auctions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm rounded-full border-gray-300 focus:ring-2 focus:ring-emerald-400 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters (PC) */}
        <aside className="hidden lg:block p-4  space-y-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          {renderFilters()}
        </aside>

        {/* Mobile Filters Toggle */}
        <div className="block lg:hidden mb-4">
          <Button onClick={() => setShowFilters(true)} className="w-full bg-emerald-500 text-white rounded-full">
            Show Filters
          </Button>
        </div>

        {/* Auctions Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentAuctions.length === 0 ? (
                  <p className="text-gray-500">No auctions found.</p>
                ) : (
                  currentAuctions.map((auction) => renderAuctionCard(auction))
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
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Transparent backdrop */}
            <div
              className="absolute inset-0 bg-black/80  bg-opacity-20"
              onClick={() => setShowFilters(false)}
            />

            {/* Sliding filter panel */}
            <motion.div
              className="relative bg-white rounded-t-xl w-full p-3 max-h-[80vh] overflow-y-auto space-y-3"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFilters(false)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Close
                </Button>
              </div>
              {renderFilters()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  // Renders filters block
  function renderFilters() {
    return (
      <>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full rounded-full border-gray-300">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full rounded-full border-gray-300">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price: ₹{priceRange || "Any"}</label>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange}
            onChange={(e) => {
              setPriceRange(parseInt(e.target.value));
              setQuickPriceFilter("");
            }}
            className="w-full"
          />
        </div>

        {/* Quick Price Filters */}
        <div className="flex flex-wrap gap-2">
          {["under500", "500to1000", "above1000"].map((range) => (
            <Button
              key={range}
              size="sm"
              variant={quickPriceFilter === range ? "default" : "outline"}
              onClick={() => {
                setQuickPriceFilter(range);
                setPriceRange(0);
              }}
            >
              {range === "under500" && "Under ₹500"}
              {range === "500to1000" && "₹500 - ₹1000"}
              {range === "above1000" && "Above ₹1000"}
            </Button>
          ))}
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          className="w-full text-white bg-red-500 hover:bg-red-600 rounded-full"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setCategoryFilter("All");
            setSortOption("endingSoon");
            setPriceRange(0);
            setQuickPriceFilter("");
          }}
        >
          <X className="w-4 h-4 mr-2" /> Clear Filters
        </Button>
      </>
    );
  }

  // Renders single auction card
  function renderAuctionCard(auction: Auction) {
    const timeLeft = remainingTimes[auction._id] || "Calculating...";
    const isClosed = timeLeft === "Closed" || auction.status === "closed";

    return (
      <Card key={auction._id} className="relative bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden">
        {/* Wishlist Button */}
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

        {/* Time Badge */}
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
                onChange={(e) => setBidInputs({ ...bidInputs, [auction._id]: e.target.value })}
              />
              <Button
                onClick={() => handleBid(auction._id)}
                className="w-full bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
              >
                Place Bid
              </Button>
              <Link href={`/auctions/${auction._id}`} passHref>
                <Button className="w-full bg-indigo-500 text-white rounded-full hover:bg-indigo-600">
                  Explore More
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
};

export default AllAuctionsPage;
