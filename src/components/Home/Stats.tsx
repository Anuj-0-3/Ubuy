// components/Home/Stats.tsx
'use client';
import { motion } from 'framer-motion';

const stats = [
  { title: 'Live Auctions', value: 124 },
  { title: 'Happy Users', value: 5000 },
  { title: 'Items Sold', value: 1023 },
  { title: 'Trusted Sellers', value: 120 },
];

export default function Stats() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-emerald-50 py-12 px-6 text-center"
    >
      <h2 className="text-2xl font-semibold text-emerald-800 mb-6">Auction Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
  );
}
