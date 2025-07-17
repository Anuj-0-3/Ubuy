'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  { title: 'Electronics', icon: '/Electronics.png' },
  { title: 'Collectibles', icon: '/Collectibles.png' },
  { title: 'Art', icon: '/Art.png' },
  { title: 'Fashion', icon: '/Fashion.png' },
];

export default function Categories() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white py-12 px-6"
    >
      <h2 className="text-4xl font-semibold text-emerald-800 mb-6 text-center">Explore Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {categories.map((category, i) => (
          <Link key={i} href={`/auctions/by-category/${encodeURIComponent(category.title)}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-lg bg-gray-100 shadow-md cursor-pointer"
            >
              <Image
                src={category.icon}
                alt={`${category.title} icon`}
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
  );
}
