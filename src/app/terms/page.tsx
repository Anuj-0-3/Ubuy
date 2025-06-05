"use client";

import Head from "next/head";
import { motion } from "framer-motion";
import { ShieldCheckIcon, UserIcon, HammerIcon, FileTextIcon, LockIcon, AlertTriangleIcon } from "lucide-react";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | TechSaviour</title>
        <meta name="description" content="Read the terms and conditions of TechSaviour — covering your rights, responsibilities, privacy, and safe usage policies." />
        <meta property="og:title" content="Terms & Conditions | TechSaviour" />
        <meta property="og:description" content="Read the terms and conditions of TechSaviour — covering your rights, responsibilities, privacy, and safe usage policies." />
        <meta name="keywords" content="TechSaviour, Terms and Conditions, Privacy Policy, User Agreement, Auction Terms, Digital Services" />
      </Head>

      <section className="max-w-6xl mx-auto p-6 sm:p-10 space-y-14">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-gray-800">Terms & Conditions</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Please carefully read these terms and conditions before using TechSaviour’s services.
          </p>
        </motion.div>


        {/* Key Policies */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-800">Key Terms & Policies</h2>

          {[
            {
              icon: <FileTextIcon className="text-blue-600 text-3xl" />,
              title: "User Agreement",
              desc: "By using our platform, you agree to abide by our rules, respect other users, and participate in fair, legal bidding activities.",
            },
            {
              icon: <LockIcon className="text-purple-600 text-3xl" />,
              title: "Privacy Policy",
              desc: "Your data is collected securely and used only to enhance your experience and process transactions. We never sell your information.",
            },
            {
              icon: <AlertTriangleIcon className="text-red-600 text-3xl" />,
              title: "Prohibited Activities",
              desc: "Users are prohibited from engaging in fraud, misrepresentation, unauthorized use of accounts, or attempting to manipulate auctions.",
            },
          ].map((policy, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 bg-white p-6 rounded-xl shadow"
            >
              <div className="p-3 bg-emerald-100 rounded-full">{policy.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{policy.title}</h3>
                <p className="text-gray-600 mt-1">{policy.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.section>
      </section>
    </>
  );
}
