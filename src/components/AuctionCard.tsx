import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getRemainingTime } from "@/utils/time";
import { useSession } from "next-auth/react";

interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  category: string;
  endTime: string;
  status: "active" | "closed";
}

interface AuctionCardProps {
  auction: Auction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [bidInput, setBidInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(getRemainingTime(auction.endTime));
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handleBid = async () => {
    const bidAmount = parseFloat(bidInput);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Please enter a valid bid amount.");
      return;
    }

    try {
      const res = await fetch(`/api/auction/bid/${auction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidAmount }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to place bid");

      toast.success("Bid placed successfully!");
      setBidInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };
  const toggleWishlist = () => {
    if (!session) {
      toast("Please log in to add to wishlist.");
      return;
    }

    if (wishlist.includes(auction._id)) {
      setWishlist(wishlist.filter((id) => id !== auction._id));
      toast("Removed from wishlist");
    } else {
      setWishlist([...wishlist, auction._id]);
      toast("Added to wishlist");
    }
  };

  const isClosed = timeLeft === "Closed" || auction.status === "closed";

  const getBadgeColor = () => {
    if (isClosed) return "bg-gray-500";
    if (timeLeft.includes("h") && parseInt(timeLeft) < 24) return "bg-yellow-500";
    return "bg-emerald-500";
  };


  return (
    <Card className="relative bg-white border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden">
      {/* Wishlist Button */}
      <div className="absolute top-3 left-3 z-10">
        <Heart
          onClick={toggleWishlist}
          className="w-6 h-6 text-emerald-500 cursor-pointer hover:scale-110 transition-transform"
          fill={wishlist.includes(auction._id) ? "currentColor" : "none"}
          stroke="currentColor"
        />
      </div>

      {/* Time Badge */}
      <div className={`absolute top-3 right-3 ${getBadgeColor()} text-white text-sm font-semibold px-3 py-1 rounded-full z-10 shadow`}>
        {isClosed ? "Closed" : timeLeft}
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
          <p><strong>Current Price:</strong> <span className="text-emerald-600 text-semibold">₹{auction.currentPrice}</span></p>
          <p><strong>Category:</strong> {auction.category}</p>
        </div>


        {!isClosed && (
          <div className="pt-2 space-y-2">
            {session ? (
              <>
                <Input
                  type="number"
                  placeholder="Your Bid (₹)"
                  className="border border-gray-300 bg-white focus:border-emerald-500"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleBid}
                    className="flex-1 bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
                  >
                    Place Bid
                  </Button>
                  <div className="flex-1">
                    <Link href={`/auctions/${auction._id}`} passHref>
                      <Button className="w-full bg-indigo-500 text-white rounded-full hover:bg-indigo-600">
                        Explore More
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => toast("Please log in to place a bid.")}
                  className="flex-1 bg-emerald-400 text-white rounded-full hover:bg-emerald-500"
                >
                  Log in to Bid
                </Button>
                <div className="flex-1">
                  <Link href={`/auctions/${auction._id}`} passHref>
                    <Button className="w-full bg-indigo-500 text-white rounded-full hover:bg-indigo-600">
                      Explore More
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
