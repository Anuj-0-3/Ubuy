"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Bidder {
  _id: string;
  amount: number;
  bidTime: string;
  bidderName: string;
}

export default function BiddersTable({ bidders }: { bidders: Bidder[] }) {
  const [sortedBidders, setSortedBidders] = useState<Bidder[]>([]);

  useEffect(() => {
    const sorted = [...bidders].sort((a, b) => {
      if (b.amount === a.amount) {
        return new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime();
      }
      return b.amount - a.amount;
    });
    setSortedBidders(sorted.slice(0, 5));
  }, [bidders]);

  return (
    <table className="w-full">
      <tbody>
        {sortedBidders.length > 0 ? (
          sortedBidders.map((bid, index) => (
            <motion.tr
              key={bid._id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }} // Delay for a staggered effect
            >
              <td className="p-2 ml-3 flex items-center gap-2">
                {bid.bidderName || "Anonymous"}
              </td>
              <td className="p-2">₹{bid.amount}</td>
              <td className="p-2">{new Date(bid.bidTime).toLocaleString()}</td>
            </motion.tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} className="p-2 text-center text-gray-500">
              No bids yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
