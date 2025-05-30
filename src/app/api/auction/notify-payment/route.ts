import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Auction from "@/models/Auction";
import Notification from "@/models/Notification";
import "@/models/User";
import "@/models/AuthUser";
import axios from "axios";


interface Bidder {
    bidder: {
        _id: string;
        username: string;
        email?: string;
        provider?: string;
    };
    bidderModel?: string;
    amount: number;
}

interface PopulatedAuction {
    _id: string;
    title: string;
    status: string;
    currentPrice?: number;
    startingPrice?: number;
    createdBy: {
        _id: string;
        username: string;
        email?: string;
        provider?: string;
    };
    bidders: Bidder[];
}

export async function POST(req: Request) {

    try {
        const { auctionId } = await req.json();

        if (!auctionId) {
            return NextResponse.json({ error: "Auction ID is required" }, { status: 400 });
        }

        await dbConnect();

        const auction = await Auction.findById(auctionId).populate([
            {
                path: "createdBy",
                select: "username email provider",
            },
            {
                path: "bidders.bidder",
                select: "username email provider",
            },
        ]);

        if (!auction) {
            return NextResponse.json({ error: "Auction not found" }, { status: 404 });
        }

        if (auction.status !== "closed") {
            return NextResponse.json({ error: "Auction is not closed yet" }, { status: 400 });
        }

        if (!auction.bidders || auction.bidders.length === 0) {
            return NextResponse.json({ error: "No bidders in this auction" }, { status: 400 });
        }

        const sortedBidders: Bidder[] = (auction as PopulatedAuction).bidders.sort((a, b) => b.amount - a.amount);
        const winner = sortedBidders[0];

        if (!winner || !winner.bidder?._id) {
            return NextResponse.json({ error: "No winner found" }, { status: 400 });
        }

        // Create a payment order with Cashfree
        const orderPayload = {
            order_id: `auction_${auction._id}`,
            order_amount: auction.currentPrice || auction.startingPrice || 100, // fallback amount
            order_currency: "INR",
            customer_details: {
                customer_id: winner.bidder._id.toString(),
                customer_name: winner.bidder.username || "Unknown User",
                customer_email: winner.bidder.email || "noemail@example.com",
                customer_phone: "9999999999", // fallback phone if you don't store it
            },
        };

        const cashfreeResponse = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            orderPayload,
            {
                headers: {
                    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
                    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
                    "x-api-version": "2023-08-01",
                    "Content-Type": "application/json",
                },
            }
        );

        const { payment_link } = cashfreeResponse.data;

        // Create a new notification for payment
        await Notification.create({
            recipient: winner.bidder._id,
            recipientModel: winner.bidderModel,
            type: "payment",
            message: `🪙 Please complete your payment for winning the auction: "${auction.title}". Pay here: ${payment_link}`,
            relatedAuction: auction._id,
        });

        return NextResponse.json(
            {
                message: "Payment link sent to winner!",
                payment_link,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to notify payment", details: (error as Error).message },
            { status: 500 }
        );
    }
}
