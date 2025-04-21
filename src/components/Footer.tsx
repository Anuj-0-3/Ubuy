"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Input } from "./ui/input";


export default function Footer() {
    return (
        <footer className="bg-emerald-600 text-gray-300 pt-10 pb-6 ">
            <div className=" mx-auto  px-10 grid grid-cols-1 md:grid-cols-4 gap-10">

                {/* Logo & Intro */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-4">U-Buy</h2>
                    <p className="text-sm leading-relaxed">
                        Bid, win, and own unique collectibles and rare finds at unbeatable prices. Experience seamless, real-time auctions.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                        <li><Link href="/auctions" className="hover:text-white transition">Auctions</Link></li>
                        <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                        <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Contact & Social */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Connect with Us</h3>
                    <p className="text-sm flex items-center mb-3">
                        <Mail className="w-4 h-4 mr-2" />
                        <a href="mailto:support@auctionify.com" className="hover:text-white">support@auctionify.com</a>
                    </p>

                    <div className="flex space-x-5 mt-4">
                        <a href="https://facebook.com/auctionify" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white">
                            <FaFacebookF className="w-5 h-5" />
                        </a>
                        <a href="https://twitter.com/auctionify" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white">
                            <FaTwitter className="w-5 h-5" />
                        </a>
                        <a href="https://instagram.com/auctionify" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white">
                            <FaInstagram className="w-5 h-5" />
                        </a>
                    </div>

                </div>

            </div>

            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-emerald-600 text-white py-12 px-6 text-center"
            >
                <h2 className="text-2xl font-semibold mb-4">Stay Updated!</h2>
                <p className="mb-6">Subscribe to our newsletter to get the latest auction alerts.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        className="px-4 py-2 bg-white rounded-md text-emerald-700 w-full sm:w-64 placeholder:text-gray-400"
                    />
                    <Button className="bg-white text-emerald-700 hover:bg-emerald-100">Subscribe</Button>
                </div>
            </motion.section>

            {/* Bottom Line */}
            <div className="border-t border-gray-300 mt-10 pt-5 text-center text-sm text-gray-300">
                © {new Date().getFullYear()} U-Buy. All rights reserved.
            </div>
        </footer>
    );
}

