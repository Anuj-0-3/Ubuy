'use client';
import { HammerIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const reasons = [
  {
    title: 'Secure Payments',
    desc: 'Your transactions are safe and encrypted.',
    icon: <ShieldCheckIcon className="w-10 h-10 mx-auto text-emerald-600" />,
  },
  {
    title: 'Verified Sellers',
    desc: 'We onboard only trusted and quality sellers.',
    icon: <UserIcon className="w-10 h-10 mx-auto text-emerald-600" />,
  },
  {
    title: '24/7 Support',
    desc: 'Our team is always here to assist you.',
    icon: <HammerIcon className="w-10 h-10 mx-auto text-emerald-600" />,
  },
];

export default function WhyChooseUs() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white py-12 px-6 text-center"
    >
      <h2 className="text-2xl font-semibold text-emerald-800 mb-6">Why Choose Us?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reasons.map((item, index) => (
          <div key={index} className="p-6 border rounded-lg hover:shadow-lg">
            {item.icon}
            <h3 className="text-lg font-semibold mt-4 text-emerald-800">{item.title}</h3>
            <p className="text-gray-600 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
