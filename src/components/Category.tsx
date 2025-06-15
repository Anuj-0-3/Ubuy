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

interface CategoryAuctionsProps {
  category: string;
}

const CategoryAuctionsPage: React.FC<CategoryAuctionsProps> = ({ category }) => {
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

  useEffect(() => {
    const fetchCategoryAuctions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/auction/bycategory?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        setAuctions(data);
      } catch (err) {
        console.error("Error fetching auctions by category", err);
        toast.error("Failed to load auctions for this category.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAuctions();
  }, [category]);

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
      // Refresh auctions list
      const updated = await fetch(`/api/auction/bycategory?category=${encodeURIComponent(category)}`);
      setAuctions(await updated.json());
      setBidInputs({ ...bidInputs, [id]: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
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


  console.log("Filtered:", filteredAuctions.map(a => a.title));


  // Pagination logic
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
        <h1 className="text-4xl font-extrabold text-gray-900">
          {category} Auctions
        </h1>
        <p className="text-gray-600 mt-2">
          Explore live and upcoming auctions in the &quot;{category}&quot;  category.
        </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
            {currentAuctions.length === 0 ? (
              <p className="text-gray-500">No auctions found in this category.</p>
            ) : (
              currentAuctions.map((auction) => {
                const timeLeft = remainingTimes[auction._id] || "Calculating...";
                const isClosed = timeLeft === "Closed" || auction.status === "closed";

                return (
                  <Card
                    key={auction._id}
                    className="relative bg-white/10 backdrop-blur-md border border-emerald-400/40 shadow-lg rounded-2xl transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full z-10 shadow">
                      {timeLeft}
                    </div>

                    <CardContent className="p-6 space-y-4">
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
                        <p><strong>Start:</strong> {new Date(auction.startTime).toLocaleString()}</p>
                        <p><strong>End:</strong> {new Date(auction.endTime).toLocaleString()}</p>
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

          <div className="flex justify-center mt-8 space-x-4">
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
            <span className="text-gray-700 font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryAuctionsPage;
