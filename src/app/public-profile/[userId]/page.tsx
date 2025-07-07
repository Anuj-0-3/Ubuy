"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, LogIn, Gavel, PlusCircle, Trophy } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import {
    WhatsappShareButton,
    WhatsappIcon,
    TelegramShareButton,
    TelegramIcon,
    LinkedinShareButton,
    LinkedinIcon,
} from 'react-share';

interface Stats {
    totalBids: number;
    auctionsCreated: number;
    auctionsWon: number;
}

interface PublicProfile {
    id: string;
    username: string;
    profileImage: string;
    stats: Stats;
    createdAt: string;
}

export default function PublicProfilePage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const userId = params?.userId as string | undefined;
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [publicProfileUrl, setPublicProfileUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPublicProfileUrl(`${window.location.origin}/public-profile/${userId}`);
        }
    }, [userId]);


    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/public-profile/${userId}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch public profile");
                }

                setProfile(data);
            } catch (error) {
                console.error("Error fetching public profile:", error);
                toast.error(
                    error instanceof Error ? error.message : "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

        if (userId && status === "authenticated") {
            fetchProfile();
        }
    }, [userId, status]);

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-600 mb-4">
                    You need to be signed in to view public profiles.
                </p>
                <Button
                    onClick={() => signIn("google")}
                    className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-6 py-2 transition-transform transform hover:scale-105 shadow-md"
                >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in to view Profile
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">No profile found.</p>
            </div>
        );
    }

    const { username, profileImage, stats, createdAt } = profile;
    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex flex-col items-center bg-gray-50 p-6 min-h-screen">
            <Card className="w-full max-w-md bg-white shadow-lg rounded-xl">
                <CardHeader className="flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full overflow-hidden shadow-md">
                        {profileImage ? (
                            <Image
                                src={profileImage}
                                alt={username}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full bg-emerald-400 text-white font-bold text-4xl sm:text-7xl border-4 border-emerald-400 shadow-md">
                                {username ? username.charAt(0).toUpperCase() : "U"}
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{username}</h1>
                    <p className="text-gray-600 text-sm">
                        Member since: <span className="font-semibold">{formattedDate}</span>
                    </p>
                </CardHeader>

                <CardContent className="p-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                        Auction Stats
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-100 p-4 rounded-lg shadow-sm text-center flex flex-col items-center">
                            <Gavel className="w-8 h-8 text-emerald-600 mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                                {stats.totalBids}
                            </p>
                            <p className="text-base sm:text-lg font-semibold text-gray-700">
                                Total Bids
                            </p>
                        </div>

                        <div className="bg-emerald-100 p-4 rounded-lg shadow-sm text-center flex flex-col items-center">
                            <PlusCircle className="w-8 h-8 text-emerald-600 mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                                {stats.auctionsCreated}
                            </p>
                            <p className="text-base sm:text-lg font-semibold text-gray-700">
                                Auctions Created
                            </p>
                        </div>

                        <div className="bg-emerald-100 p-4 rounded-lg shadow-sm text-center flex flex-col items-center">
                            <Trophy className="w-8 h-8 text-emerald-600 mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                                {stats.auctionsWon}
                            </p>
                            <p className="text-base sm:text-lg font-semibold text-gray-700">
                                Auctions Won
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                            Share this Profile
                        </h4>
                        <div className="flex items-center justify-center flex-wrap gap-2 mb-4">
                            <WhatsappShareButton url={publicProfileUrl}>
                                <WhatsappIcon size={32} round />
                            </WhatsappShareButton>
                            <TelegramShareButton url={publicProfileUrl}>
                                <TelegramIcon size={32} round />
                            </TelegramShareButton>
                            <LinkedinShareButton url={publicProfileUrl}>
                                <LinkedinIcon size={32} round />
                            </LinkedinShareButton>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    const publicProfileUrl = `${window.location.origin}/public-profile/${userId}`;
                                    navigator.clipboard.writeText(publicProfileUrl);
                                    toast.success("Public profile link copied to clipboard!");
                                }}
                                className="bg-gray-200 hover:cursor-pointer text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300 transition"
                            >
                                Copy Link
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
