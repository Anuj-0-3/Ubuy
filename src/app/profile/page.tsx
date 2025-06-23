"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LogOut, LogIn, Mail, User, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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

const ProfilePage = () => {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");  // State for the name
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [auctionStats, setAuctionStats] = useState<AuctionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        setName(data.name || ""); // Initialize name with current profile name
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    };

    fetchProfile();
  }, [session]);

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

  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 items-start bg-gray-50 p-6 min-h-screen">
      <Card className="w-full sm:w-2/3 sm:mt-5 sm:mx-10 bg-white shadow-lg rounded-xl">
        {status === "loading" ? (
          <p className="text-gray-700 text-lg animate-pulse">Loading...</p>
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

              {/* Name change input field */}
              <input
                type="text"
                value=""
                onChange={(e) => setName(e.target.value)} // Update name state
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

      <div className="mt-6 w-full sm:w-1/3 max-w-xl p-4 text-center  sm:p-8 bg-white shadow-lg rounded-xl">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Auction Stats</h3>
        {loading ? (
          <p className="text-gray-700">Loading auction stats...</p>
        ) : auctionStats ? (
          <div className="flex gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <div className="bg-emerald-100 border-1 p-2 sm:p-4 rounded-lg shadow-sm ">
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
        ) : (
          <p className="text-gray-700">No auction stats available.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

