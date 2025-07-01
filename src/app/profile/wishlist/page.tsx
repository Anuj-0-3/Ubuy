"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

interface Auction {
    _id: string;
    title: string;
    description: string;
    images: string[];
    currentPrice: number;
    category: string;
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auction/wishlist/fetch");
            const data = await res.json();
            if (res.ok) {
                interface WishlistItem {
                    auction: Auction;
                }
                const auctions = (data.wishlist as WishlistItem[]).map((item: WishlistItem): Auction => ({
                    _id: item.auction._id,
                    title: item.auction.title,
                    description: item.auction.description,
                    images: item.auction.images,
                    currentPrice: item.auction.currentPrice,
                    category: item.auction.category,
                }));
                setWishlist(auctions);
            } else {
                toast.error(data.error || "Failed to fetch wishlist");
            }
        } catch (err) {
            console.error("Error fetching wishlist", err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (auctionId: string) => {
        try {
            const res = await fetch("/api/wishlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ auctionId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove");

            setWishlist((prev) => prev.filter((a) => a._id !== auctionId));
            toast.success(data.message || "Removed from wishlist");
        } catch (err) {
            console.error("Error removing from wishlist", err);
            toast.error(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
            <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-2">Your saved auctions</p>
            </div>

            {loading ? (
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            ) : wishlist.length === 0 ? (
                <p className="text-gray-500">No items in your wishlist yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-sm sm:w-full px-8 sm:px-4 max-w-6xl">
                    {wishlist.map((auction) => (
                        <Card key={auction._id} className="bg-white border border-gray-200 shadow rounded-lg overflow-hidden">
                            <CardContent className="p-4 space-y-2">
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
                                <h2 className="text-lg font-bold text-gray-900">{auction.title}</h2>
                                <p className="text-gray-700">{auction.description}</p>
                                <p className="text-gray-800 font-semibold">₹{auction.currentPrice}</p>
                                <p className="text-gray-500 text-sm">Category: {auction.category}</p>
                                <Button
                                    onClick={() => handleRemove(auction._id)}
                                    className="w-full hover:cursor-pointer bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    Remove from Wishlist
                                </Button>
                                <Link href={`/auctions/${auction._id}`} passHref>
                                    <Button className="w-full hover:cursor-pointer bg-emerald-500 text-white rounded-full hover:bg-emerald-600">Explore More</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
