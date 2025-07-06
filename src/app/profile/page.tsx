"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LogOut, LogIn, Mail, User, Upload, Plus, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';

type Profile = {
  image?: string;
  username?: string;
  name?: string;
};

type AuctionStats = {
  totalBids: number;
  auctionsCreated: number;
  auctionsWon: number;
};

interface NotificationData {
  id: string;
  type: "create-bid" | "win" | string;
  message: string;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationData[];
}


const ProfilePage = () => {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [auctionStats, setAuctionStats] = useState<AuctionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [createdAtFormatted, setCreatedAtFormatted] = useState<string>("");
  const userId = session?.user?.id;
  const [publicProfileUrl, setPublicProfileUrl] = useState("");
  const [recentActivities, setRecentActivities] = useState<NotificationData[]>([]);

  // Fetch auction stats when the component mounts
  useEffect(() => {
    const fetchAuctionStats = async () => {
      try {
        setLoading(true);
        const auctionStatsRes = await fetch("/api/auction/bidstats");
        const auctionStatsData = await auctionStatsRes.json();

        if (!auctionStatsRes.ok) {
          throw new Error(auctionStatsData.error || "Failed to load auction stats");
        }

        setAuctionStats({
          totalBids: auctionStatsData.totalBids || 0,
          auctionsCreated: auctionStatsData.auctionsCreated || 0,
          auctionsWon: auctionStatsData.auctionsWon || 0,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionStats();
  }, []);

  // Fetch user profile when the session is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            userModel: session.user.authProvider === "credentials" ? "User" : "AuthUser",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        setProfile(data);
        setUsername(data.username || data.name || "");
        setName(data.name || "");

        const formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });
        setCreatedAtFormatted(formattedDate);

      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    };

    fetchProfile();
  }, [session]);

  // Fetch recent activities when the component mounts
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const res = await fetch("/api/notification");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load notifications");

        const filtered: NotificationData[] = (data as NotificationsResponse).notifications
          .filter((n: NotificationData) => ["create-bid", "win"].includes(n.type))
          .sort((a: NotificationData, b: NotificationData) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        setRecentActivities(filtered);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error loading activity");
      }
    };

    fetchRecentActivities();
  }, []);

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    if (!session) {
      toast.error("You must be signed in to update your profile.");
      return;
    }

    try {
      setIsUpdating(true);

      let imageBase64 = "";
      if (fileInputRef.current && fileInputRef.current.files?.length) {
        const file = fileInputRef.current.files[0];
        imageBase64 = await toBase64(file);
      }

      const res = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          userModel: session.user.authProvider === "credentials" ? "User" : "AuthUser",
          username,
          name,  // Send the updated name along with username
          imageBase64: imageBase64 || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update profile");

      toast.success("Profile updated successfully!");

      const refreshedProfile = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          userModel: session.user.authProvider === "credentials" ? "User" : "AuthUser",
        }),
      });
      const updatedProfile = await refreshedProfile.json();
      setProfile(updatedProfile);

      await update();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // Generate public profile URL when userId changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicProfileUrl(`${window.location.origin}/public-profile/${userId}`);
    }
  }, [userId]);

  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 bg-gray-50 p-6 min-h-screen">
      <div className="flex flex-col gap-6 w-full sm:w-2/3 ">
        <Card className="bg-white shadow-lg rounded-xl">
          {status === "loading" ? (
            <p className="text-gray-700 text-lg animate-pulse p-6">Loading...</p>
          ) : session ? (
            <>
              <CardHeader className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt="Profile"
                      width={240}
                      height={240}
                      className="object-cover relative w-32 h-32 sm:w-40 sm:h-40 mb-4 overflow-hidden rounded-full border-4 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full bg-emerald-400 text-white font-bold text-4xl sm:text-7xl border-4 border-emerald-400 shadow-md">
                      {session?.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Upload a new profile image"
                  />
                  <div className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full shadow cursor-pointer">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="text-lg font-semibold text-gray-900">{name}</div>
                <div className=" text-gray-600 text-sm">
                  <p>Member since: <span className="font-semibold">{createdAtFormatted}</span></p>
                </div>

                {/* Name change input field */}
                <input
                  type="text"
                  value=""
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Change your username"
                  className="mt-3 text-base sm:text-lg  text-gray-900 bg-transparent border-b border-emerald-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />

                <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <span>{session.user?.email}</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 flex justify-center flex-row gap-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-5/12 sm:w-1/3  flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>

                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="w-5/12 sm:w-1/3 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <User className="w-20 h-20 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
              <p className="text-gray-600">Sign in to access your profile</p>
              <Button
                onClick={() => signIn("google")}
                className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-6 py-2 transition-transform transform hover:scale-105 shadow-md"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
            </div>
          )}
        </Card>

        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <p className="text-gray-600">No recent activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((activity, index) => {
                const isWin = activity.type === "win";
                const isCreate = activity.type === "create";
                const auctionTitle = activity.message?.match(/"(.+?)"/)?.[1]; 

                return (
                  <li
                    key={index}
                    className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm hover:shadow transition"
                  >
                    <div className="flex items-center space-x-2">
                      {isWin && (
                        <div className="flex items-center text-green-600">
                          <Check className="h-5 border-2 border-green-600 rounded-full w-5 mr-1" />
                          <p className="text-sm font-medium">
                            <span className="font-semibold">Won</span> {auctionTitle && <>on {auctionTitle}</>}
                          </p>
                        </div>
                      )}

                      {isCreate && (
                        <div className="flex items-center text-blue-600">
                          <Plus className="h-5 border-2 border-blue-600 rounded-full w-5 mr-1" />
                          <p className="text-sm font-medium">
                            <span className="font-semibold">Auction Created</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className=" flex flex-col gap-6 h-full w-full sm:w-1/3 max-w-xl p-4 text-center sm:p-8 bg-white shadow-lg rounded-xl">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Auction Stats</h3>
        {loading ? (
          <p className="text-gray-700">Loading auction stats...</p>
        ) : auctionStats ? (
          <div className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <div className="bg-emerald-100 border-1 p-2 sm:p-4 rounded-lg shadow-sm">
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">{auctionStats.totalBids}</p>
                <h4 className="text-base sm:text-lg font-semibold text-gray-700">Total Bids</h4>
              </div>

              <div className="bg-emerald-100 border-1 p-2 sm:p-4 rounded-lg shadow-sm">
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">{auctionStats.auctionsCreated}</p>
                <h4 className="text-base sm:text-lg font-semibold text-gray-700">Auctions Created</h4>
              </div>

              <div className="bg-emerald-100 border-1 p-2 sm:p-4 rounded-lg shadow-sm">
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">{auctionStats.auctionsWon}</p>
                <h4 className="text-base sm:text-lg font-semibold text-gray-700">Auctions Won</h4>
              </div>
            </div>

            <Link
              href={`/public-profile/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 mt-4 text-white px-4 py-2 rounded-full hover:bg-emerald-600 transition"
            >
              View Public Profile
            </Link>

            {/* Share Public Profile */}
            <div className=" w-full">
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Share your Public Profile</h4>
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
          </div>
        ) : (
          <p className="text-gray-700">No auction stats available.</p>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;
