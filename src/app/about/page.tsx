"use client";

import Head from "next/head";
import { motion } from "framer-motion";
import { FaPeopleCarry, FaAward, FaRocket, FaHeart, FaLightbulb, FaUsers } from "react-icons/fa";
import { JSX } from "react";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | TechSaviour</title>
        <meta name="description" content="Discover TechSaviour — our mission, values, inspiring story, and passionate team driving digital innovation forward." />
        <meta property="og:title" content="About TechSaviour" />
        <meta property="og:description" content="Discover TechSaviour — our mission, values, inspiring story, and passionate team driving digital innovation forward." />
        <meta name="keywords" content="TechSaviour, About Us, Company Story, Our Mission, Web Development, Innovation, Team" />
      </Head>

      <section className="max-w-6xl mx-auto p-6 sm:p-10 space-y-14">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-gray-800">About Us</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            We’re a creative tech company focused on delivering innovative solutions that make people’s digital lives easier, better, and more meaningful.
          </p>
        </motion.div>

        {/* Mission, Values, Vision */}
        <div className="grid gap-8 md:grid-cols-3">
          <AboutCard
            icon={<FaRocket className="text-white text-4xl" />}
            title="Our Mission"
            description="To empower individuals and businesses by creating fast, reliable, and user-friendly digital experiences."
            color="bg-emerald-500"
          />
          <AboutCard
            icon={<FaPeopleCarry className="text-white text-4xl" />}
            title="Our Values"
            description="Innovation, honesty, and a relentless commitment to providing value to our community."
            color="bg-indigo-500"
          />
          <AboutCard
            icon={<FaAward className="text-white text-4xl" />}
            title="Our Vision"
            description="To be a globally recognized brand known for setting standards in quality, creativity, and customer satisfaction."
            color="bg-pink-500"
          />
        </div>

        {/* Who We Are */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Who We Are</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            TechSaviour is a passionate collective of designers, developers, and thinkers united by a common goal — to bring meaningful technology solutions to life. We believe that technology should be beautiful, easy to use, and accessible to everyone.
          </p>
        </motion.div>

        {/* Our Story (Timeline) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
          <div className="space-y-6 border-l-4 border-emerald-500 pl-6">
            <div>
              <h3 className="text-xl font-semibold text-emerald-600">2023 — TechSaviour Begins</h3>
              <p className="text-gray-600 mt-2">A group of passionate tech enthusiasts come together to build impactful, user-first digital products.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-emerald-600">2024 — First Major Projects</h3>
              <p className="text-gray-600 mt-2">We partnered with clients across industries and launched several successful web platforms and applications.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-emerald-600">2025 — Scaling Up</h3>
              <p className="text-gray-600 mt-2">Expanding our team, introducing AI-powered solutions, and pushing the boundaries of innovation.</p>
            </div>
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<FaHeart className="text-red-500 text-3xl" />} title="Customer Focused" />
            <FeatureCard icon={<FaLightbulb className="text-yellow-500 text-3xl" />} title="Creative Solutions" />
            <FeatureCard icon={<FaUsers className="text-purple-500 text-3xl" />} title="Talented Team" />
          </div>
        </motion.div>
      </section>
    </>
  );
}

interface AboutCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  color: string;
}

function AboutCard({ icon, title, description, color }: AboutCardProps) {
  return (
    <motion.article
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl p-6 text-white shadow-lg ${color} flex flex-col items-center text-center transition-all`}
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-base leading-relaxed">{description}</p>
    </motion.article>
  );
}

interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
}

function FeatureCard({ icon, title }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center bg-white rounded-xl shadow p-6 text-center transition-all"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </motion.div>
  );
}

