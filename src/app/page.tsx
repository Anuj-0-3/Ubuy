"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Auction from "@/models/Auction";
import { Card, CardContent } from "@/components/ui/card";
import {
  HammerIcon,
  UserIcon,
  ShieldCheckIcon,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getRemainingTime } from "@/utils/time";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { motion } from "framer-motion";
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

export default function HomePage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState<{
    [key: string]: string;
  }>({});

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

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-emerald-100">
        {/* Hero Section */}
        <div className="relative bg-cover bg-center h-[60vh] flex flex-col justify-center items-center text-white text-center px-4 bg-gradient-to-b from-emerald-700 to-emerald-500 shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Bid, Win & Own Unique Items</h1>
          <p className="text-lg mb-6">Join live auctions and get the best deals.</p>
          <div className="flex gap-4">
            <Button className="bg-emerald-800 hover:bg-emerald-900">
              Start Bidding
            </Button>
            <Button
              variant="outline"
              className="text-emerald-600 border-white hover:bg-gray-300 hover:text-emerald-800"
            >
              Sell an Item
            </Button>
          </div>
        </div>

        {/* Live Auctions */}
        <div className="flex py-12 px-6 flex-col bg-gray-50">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-6">
            Live Auctions
            <span className="inline-block p-2 ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </h2>

          {loading ? (
            <Loader2 className="animate-spin text-emerald-500" size={40} />
          ) : (
            <div className="w-full max-w-6xl mx-auto">
              {auctions.filter((a) => a.status !== "closed").length === 0 ? (
                <p className="text-gray-500">No live auctions available.</p>
              ) : (
                <Swiper
                  slidesPerView={1}
                  spaceBetween={20}
                  breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  navigation
                  modules={[Navigation]}
                  className="py-4"
                >
                  {auctions
                    .filter((auction) => auction.status !== "closed")
                    .map((auction) => {
                      const timeLeft =
                        remainingTimes[auction._id] || "Calculating...";

                      return (
                        <SwiperSlide key={auction._id}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Card className="p-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-white shadow-md border-emerald-300">
                              <div className="top-3 right-3 text-red-500 text-sm font-semibold px-3 py-1">
                                {timeLeft}
                              </div>

                              <CardContent className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                  {auction.title}
                                </h2>
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
                                  <p>
                                    <strong>Start:</strong>{" "}
                                    {new Date(auction.startTime).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>End:</strong>{" "}
                                    {new Date(auction.endTime).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Current Price:</strong> ₹
                                    {auction.currentPrice}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </SwiperSlide>
                      );
                    })}
                </Swiper>
              )}
            </div>
          )}
        </div>

        {/* How It Works */}
        <section className="bg-white py-12 px-6 text-center">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <UserIcon className="text-emerald-600" />,
                title: "Sign Up",
                desc: "Create your free account to start bidding.",
              },
              {
                icon: <HammerIcon className="text-emerald-600" />,
                title: "Place Bids",
                desc: "Join live auctions and place competitive bids.",
              },
              {
                icon: <ShieldCheckIcon className="text-emerald-600" />,
                title: "Win & Secure",
                desc: "Secure payments and trusted transactions.",
              },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="p-4 bg-emerald-200 rounded-full mb-3">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-emerald-800">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-emerald-700 text-white text-center py-12 px-6">
          <h2 className="text-2xl font-semibold mb-4">
            Want to Sell Your Items?
          </h2>
          <p className="mb-6">List your items and start earning today!</p>
          <Button className="bg-white text-emerald-700 hover:bg-gray-200">
            Start Selling
          </Button>
        </section>
      </div>
    </>
  );
}

