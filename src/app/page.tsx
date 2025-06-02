"use client";

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
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  highestBidder?: string;
  startTime: string;
  endTime: string;
  status: "active" | "closed";
  createdBy: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});

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
    <div className="min-h-screen bg-emerald-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-cover bg-center h-[60vh] flex flex-col justify-center items-center text-white text-center px-4 bg-gradient-to-b from-emerald-700 to-emerald-500 shadow-lg"
      >
        <h1 className="text-4xl font-bold mb-4">Bid, Win & Own Unique Items</h1>
        <p className="text-lg mb-6">Join live auctions and get the best deals.</p>
        <div className="flex gap-4">
          {session ? (
            <>
              <Button className="bg-emerald-800 hover:cursor-pointer hover:bg-emerald-900">
                Start Bidding
              </Button>
              <Button
                variant="outline"
                className="text-emerald-600 hover:cursor-pointer border-white hover:bg-gray-300 hover:text-emerald-800"
              >
                Sell an Item
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button className="bg-white hover:cursor-pointer text-emerald-700 hover:bg-gray-200">
                  Login to Bid
                </Button>
              </Link>
              <Link href="/sign-up" >
                <Button variant="outline" className="bg-emerald-700 hover:cursor-pointer text-white hover:bg-gray-400">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>

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
                    const timeLeft = remainingTimes[auction._id] || "Calculating...";

                    return (
                      <SwiperSlide key={auction._id}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="p-4 transition-transform duration-300 hover:shadow-xl bg-white shadow-md border-emerald-300">
                            <div className="top-3 right-3 text-red-500 text-sm font-semibold px-3 py-1">
                              {timeLeft}
                            </div>

                            <CardContent className="space-y-4">
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
                                <p><strong>Current Price:</strong> ₹{auction.currentPrice}</p>
                              </div>
                              <Link href={`/auctions/${auction._id}`} passHref>
                                <Button className="w-full hover:cursor-pointer bg-indigo-500 text-white rounded-full hover:bg-indigo-600 ">Explore More</Button>
                              </Link>
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


      {/* Mega Auction */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-emerald-800 text-white py-8 text-center"
      >
        <h2 className="text-3xl font-bold mb-2">🔥 Mega Auction Ends In:</h2>
        <p className="text-4xl font-semibold" id="countdown">00:45:32</p>
        <p className="mt-4">Hurry up — grab your favorite items before time runs out!</p>
      </motion.section>


      {/* Featured Categories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white py-12 px-6"
      >
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6 text-center">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { title: "Electronics", icon: "/electronics.png" },
            { title: "Collectibles", icon: "/Collectibles.png" },
            { title: "Art", icon: "/Art.png" },
            { title: "Fashion", icon: "/fashion.png" },
          ].map((category, i) => (
            <Link key={i} href={`/auctions/by-category/${encodeURIComponent(category.title)}`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-4 rounded-lg bg-gray-100 shadow-md cursor-pointer"
              >
                <Image
                  src={category.icon}
                  alt={category.title}
                  width={150}
                  height={50}
                  className="mx-auto mb-2"
                />
                <p className="text-gray-800 font-semibold">{category.title}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.section>


      {/* Auction Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-emerald-50 py-12 px-6 text-center"
      >
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6">Auction Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Live Auctions", value: 124 },
            { title: "Happy Users", value: 5000 },
            { title: "Items Sold", value: 1023 },
            { title: "Trusted Sellers", value: 120 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow text-emerald-700"
            >
              <p className="text-3xl font-bold">{stat.value}+</p>
              <p className="text-gray-600">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>


      {/* Why Choose Us */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white py-12 px-6 text-center"
      >
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Secure Payments",
              desc: "Your transactions are safe and encrypted.",
              icon: <ShieldCheckIcon className="w-10 h-10 mx-auto text-emerald-600" />,
            },
            {
              title: "Verified Sellers",
              desc: "We onboard only trusted and quality sellers.",
              icon: <UserIcon className="w-10 h-10 mx-auto text-emerald-600" />,
            },
            {
              title: "24/7 Support",
              desc: "Our team is always here to assist you.",
              icon: <HammerIcon className="w-10 h-10 mx-auto text-emerald-600" />,
            },
          ].map((item, index) => (
            <div key={index} className="p-6 border rounded-lg hover:shadow-lg">
              {item.icon}
              <h3 className="text-lg font-semibold mt-4 text-emerald-800">{item.title}</h3>
              <p className="text-gray-600 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

