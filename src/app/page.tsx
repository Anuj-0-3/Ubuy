"use client";

import { Button } from "@/components/ui/button";
import Auction from "@/models/Auction";
import {
  HammerIcon,
  UserIcon,
  ShieldCheckIcon,
  Loader2,
  Flame,
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
import { Input } from "@/components/ui/input";
import AuctionCard from "@/components/AuctionCard";

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



export default function HomePage() {
  const { data: session } = useSession();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRemainingTimes] = useState<{ [key: string]: string }>({});
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  // Fetch auctions from the API
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

  // Update remaining times every second
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

  // countdown duration 
  const INITIAL_DURATION = 12 * 60 * 60;

  const [timeLeft, setTimeLeft] = useState(INITIAL_DURATION);

  // Format time into HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return INITIAL_DURATION;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });


  return (
    <main className="min-h-screen bg-emerald-100">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-b from-emerald-700 to-emerald-500 shadow-lg h-[80vh] flex items-center px-4"
      >
        {/* Animated Blob */}
        <div className="absolute -top-32 left-52 w-[600px] h-[600px] bg-amber-300 opacity-20 blur-3xl z-0 animate-[blob_8s_infinite]"></div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto z-10">
          {/* Left: Image with float animation */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: [20, -10, 20] }}
            transition={{ repeat: 0, duration: 3, ease: "easeInOut" }}
            className="w-full md:w-1/2 flex justify-center md:justify-start mb-8 md:mb-0"
          >
            <Image
              src="/hero.png"
              alt="Hero Image"
              width={350}
              height={300}
              className="w-full max-w-[500px] h-auto object-cover drop-shadow-2xl"
            />
          </motion.div>

          {/* Right: Animated Text */}
          <div className="w-full md:w-1/2  text-white text-center md:text-left">
            {session ? (
              <>
                <motion.h1
                  custom={0}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  Welcome back, {session.user.name || 'Valued Bidder'}!
                </motion.h1>
                <motion.p
                  custom={1}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-lg text-gray-200 mb-6"
                >
                  Ready to place your next winning bid or list something new?
                </motion.p>
              </>
            ) : (
              <>
                <motion.h1
                  custom={0}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  Bid, Win & Own Unique Items
                </motion.h1>
                <motion.p
                  custom={1}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-lg text-gray-200 mb-6"
                >
                  Join live auctions and get the best deals.
                </motion.p>
              </>
            )}

            {/* Buttons */}
            <motion.div
              custom={2}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center md:justify-start gap-4"
            >
              {session ? (
                <>
                  <Button className="bg-emerald-800 text-base p-2 sm:p-4 hover:cursor-pointer hover:bg-emerald-900">
                    Start Bidding
                  </Button>
                  <Button
                    variant="outline"
                    className="text-emerald-600 text-base p-2 sm:p-4 hover:cursor-pointer border-white hover:bg-gray-300 hover:text-emerald-800"
                  >
                    Sell an Item
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button className="bg-white text-base p-2 sm:p-4 hover:cursor-pointer text-emerald-700 hover:bg-gray-200">
                      Login to Bid
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      variant="outline"
                      className="bg-emerald-800 text-base p-2 sm:p-4 hover:cursor-pointer text-white hover:bg-gray-400"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Live Auctions */}
      <section className="relative overflow-hidden bg-gray-50 py-12 px-6">
        {/* Background SVG */}
        <div className="absolute inset-0 z-0 opacity-10 sm:opacity-5 pointer-events-none">
          <Image
            src="/topography.svg"
            alt="Banquet Hall Background"
            fill
            priority
            quality={75}
            className="object-cover object-[20%_0%]"
          />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl px-2 sm:px-8  font-semibold text-emerald-800 mb-6">
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
                    .map((auction) => (
                      <SwiperSlide key={auction._id}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <AuctionCard auction={auction} />
                        </motion.div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Mega Auction */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-emerald-800 text-white py-8 text-center"
      >
        <h2 className="text-2xl sm:text-3xl flex flex-wrap items-center justify-center font-bold mb-2">
          <Flame className="w-6 h-6 sm:w-8 sm:h-8 fill-amber-400 text-orange-500 mr-2" />
          Mega Auction Ends In:
        </h2>

        <p className="text-4xl font-semibold">{formatTime(timeLeft)}</p>
        <p className="mt-4 px-8">Hurry up — grab your favorite items before time runs out!</p>
      </motion.section>

      {/* Featured Categories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white py-12 px-6"
      >
        <h2 className="text-4xl font-semibold text-emerald-800 mb-6 text-center">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { title: "Electronics", icon: "/Electronics.png" },
            { title: "Collectibles", icon: "/Collectibles.png" },
            { title: "Art", icon: "/Art.png" },
            { title: "Fashion", icon: "/Fashion.png" },
          ].map((category, i) => (
            <Link key={i} href={`/auctions/by-category/${encodeURIComponent(category.title)}`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-lg bg-gray-100 shadow-md cursor-pointer"
              >
                <Image
                  src={category.icon}
                  alt=""
                  aria-hidden="true"
                  width={250}
                  height={150}
                  className="mx-auto mb-2"
                />
                <p className="text-gray-800 text-xl font-semibold">{category.title}</p>
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

      {/* Newsletter Subscription */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-emerald-500 text-white py-12 px-6 text-center"
      >
        <h2 className="text-2xl font-semibold mb-4">Stay Updated!</h2>
        <p className="mb-6">Subscribe to our newsletter to get the latest auction alerts.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 bg-white rounded-md text-emerald-700 w-full sm:w-64 placeholder:text-gray-400"
          />
          <Button className="bg-white hover:cursor-pointer text-emerald-700 hover:bg-emerald-100">Subscribe</Button>
        </div>
      </motion.section>
    </main>
  );
}

