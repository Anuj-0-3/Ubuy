"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import AuctionCard from "@/components/AuctionCard";
import Image from "next/image";
import { Auction } from "@/hooks/useAuctions";
import "swiper/css";
import "swiper/css/navigation";
import AuctionCardSkeleton from "../Skeleton/AuctionCardSkeleton";

export const AuctionSection = ({ auctions, loading }: { auctions: Auction[]; loading: boolean }) => {
  const activeAuctions = auctions.filter((a) => a.status !== "closed");

  return (
    <section className="relative overflow-hidden bg-gray-50 py-12 px-6">
      <div className="absolute inset-0 z-0 opacity-10 sm:opacity-5 pointer-events-none">
        <Image
          src="/topography.svg"
          alt="Background pattern"
          fill
          priority
          quality={75}
          className="object-cover object-[20%_0%]"
        />
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl sm:text-3xl px-2 sm:px-8 font-semibold text-emerald-800 mb-6">
          Live Auctions
          <span className="inline-block p-2 ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        ) : activeAuctions.length === 0 ? (
          <p className="text-gray-500">No live auctions available.</p>
        ) : (
          <div className="w-full max-w-6xl mx-auto">
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
              {activeAuctions.map((auction) => (
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
          </div>
        )}
      </div>
    </section>
  );
};