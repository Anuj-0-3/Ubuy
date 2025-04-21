"use client";

import Head from "next/head";
import { motion } from "framer-motion";
import { ShieldCheckIcon, LockIcon, FileTextIcon, AlertTriangleIcon, UserIcon } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | TechSaviour</title>
        <meta name="description" content="Learn how TechSaviour securely collects, uses, and protects your personal data while ensuring your privacy." />
        <meta property="og:title" content="Privacy Policy | TechSaviour" />
        <meta property="og:description" content="Learn how TechSaviour securely collects, uses, and protects your personal data while ensuring your privacy." />
        <meta name="keywords" content="Privacy Policy, Data Protection, TechSaviour, User Privacy, Secure Information, Personal Data" />
      </Head>

      <section className="max-w-6xl mx-auto p-6 sm:p-10 space-y-14">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-gray-800">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Your privacy is important to us. This page outlines how TechSaviour collects, uses, and protects your data.
          </p>
        </motion.div>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white py-12 px-6 text-center"
        >
          <h2 className="text-2xl font-semibold text-emerald-800 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <UserIcon className="text-emerald-600" />,
                title: "Account Registration",
                desc: "Sign up with your secure details — all information is encrypted and confidential.",
              },
              {
                icon: <LockIcon className="text-emerald-600" />,
                title: "Data Protection",
                desc: "We securely store your personal and transactional data using advanced encryption.",
              },
              {
                icon: <ShieldCheckIcon className="text-emerald-600" />,
                title: "Privacy Assurance",
                desc: "Your data is never shared without consent and is used only for improving our services.",
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="p-4 bg-emerald-200 rounded-full mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-emerald-800">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Privacy Principles */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-800">Our Privacy Principles</h2>

          {[
            {
              icon: <FileTextIcon className="text-blue-600 text-3xl" />,
              title: "Data Collection",
              desc: "We collect minimal, essential data needed to provide you with a seamless auction experience, including your name, email, contact details, and bidding history.",
            },
            {
              icon: <AlertTriangleIcon className="text-red-600 text-3xl" />,
              title: "No Unauthorised Sharing",
              desc: "We do not sell, trade, or rent your personal information to third parties without your explicit consent, except where legally required.",
            },
            {
              icon: <LockIcon className="text-purple-600 text-3xl" />,
              title: "Secure Storage",
              desc: "All sensitive data is securely encrypted and stored with strict access controls to prevent unauthorized access or misuse.",
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
