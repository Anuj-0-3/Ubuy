'use client';
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_DURATION = 12 * 60 * 60;

export default function MegaAuction() {
  const [timeLeft, setTimeLeft] = useState(INITIAL_DURATION);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? INITIAL_DURATION : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-emerald-800 text-white py-8 text-center"
    >
      <h2 className="text-2xl sm:text-3xl flex justify-center items-center font-bold mb-2">
        <Flame className="w-6 h-6 sm:w-8 sm:h-8 fill-amber-400 text-orange-500 mr-2" />
        Mega Auction Ends In:
      </h2>
      <p className="text-4xl font-semibold">{formatTime(timeLeft)}</p>
      <p className="mt-4 px-4">Hurry up — grab your favorite items before time runs out!</p>
    </motion.section>
  );
}
