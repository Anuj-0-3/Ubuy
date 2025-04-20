"use client"

import React, { useEffect, useState } from "react";

interface Bidder {
  _id: string;
  bidder: { name?: string; image?: string };
  amount: number;
  bidTime: string;
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
        {sortedBidders.map((bid, index) => (
          <tr
            key={bid._id}
            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            <td className="p-2 flex items-center gap-2">
              {bid.bidder?.image ? (
                <img
                  src={bid.bidder.image}
                  alt={bid.bidder.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                  {bid.bidder?.name ? bid.bidder.name[0] : "A"}
                </div>
              )}
              {bid.bidder?.name || "Anonymous"}
            </td>
            <td className="p-2">₹{bid.amount}</td>
            <td className="p-2">{new Date(bid.bidTime).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
