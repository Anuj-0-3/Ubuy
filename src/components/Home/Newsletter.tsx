'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Newsletter() {
  return (
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
        <Button className="bg-white hover:cursor-pointer text-emerald-700 hover:bg-emerald-100">
          Subscribe
        </Button>
      </div>
    </motion.section>
  );
}
