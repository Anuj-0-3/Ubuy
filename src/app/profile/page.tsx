"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  LogOut,
  LogIn,
  Mail,
  User,
  Upload,
  Gavel,
  Trophy,
  PlusCircle,
  Pencil,
  ClipboardCheckIcon,
} from "lucide-react";
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
} from "react-share";
import RecentActivity from "@/components/RecentActivity";
import ProfilePageSkeleton from "@/components/Skeleton/ProfilePageSkeleton";

type Profile = {
  image?: string;
  username?: string;
  name?: string;
  createdAt?: string;
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
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [auctionStats, setAuctionStats] = useState<AuctionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [createdAtFormatted, setCreatedAtFormatted] = useState<string>("");
  const [publicProfileUrl, setPublicProfileUrl] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    const fetchAuctionStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auction/bidstats");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch stats");

        setAuctionStats({
          totalBids: data.totalBids || 0,
          auctionsCreated: data.auctionsCreated || 0,
          auctionsWon: data.auctionsWon || 0,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionStats();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

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
        if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

        setProfile(data);
        setUsername(data.username || data.name || "");
        setName(data.name || "");

        if (data.createdAt) {
          const formatted = new Date(data.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
          setCreatedAtFormatted(formatted);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    if (typeof window !== "undefined" && userId) {
      setPublicProfileUrl(`${window.location.origin}/public-profile/${userId}`);
    }
  }, [userId]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleUpdateProfile = async () => {
    if (!session?.user) return toast.error("You must be signed in.");

    try {
      setIsUpdating(true);

      let imageBase64 = "";
      const file = fileInputRef.current?.files?.[0];
      if (file) imageBase64 = await toBase64(file);

      const res = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          userModel: session.user.authProvider === "credentials" ? "User" : "AuthUser",
          username,
          name,
          imageBase64: imageBase64 || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");

      toast.success("Profile updated!");
      await update();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  // Conditionally render skeleton while loading
  if (status === "loading" || loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 bg-gray-50 p-6 min-h-screen">
      <div className="flex flex-col gap-6 w-full lg:w-2/3 h-full">
        <Card className="bg-white shadow-lg rounded-xl">
          {session ? (
            <>
              <CardHeader className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 hover:scale-105 transition-transform duration-300 ease-in-out">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt="Profile"
                      width={240}
                      height={240}
                      className="object-cover w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-emerald-400 text-white font-bold text-4xl sm:text-7xl border-4 border-emerald-400 shadow-md">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Upload a new profile image"
                  />
                  <div className="absolute bottom-0 right-4 bg-emerald-600 px-3 py-1 rounded-full shadow-md cursor-pointer flex items-center gap-1">
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-xs text-white hidden sm:inline">Upload Photo</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Joined: <span className="font-semibold">{createdAtFormatted}</span>
                </p>

                <div className="flex items-center justify-center gap-2 mt-2">
                  {!isEditingName ? (
                    <>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{name || "Your Name"}</h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-gray-500 cursor-pointer hover:text-emerald-600 transition-transform transform hover:scale-110 duration-300"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      className="text-base font-semibold text-center border-b border-emerald-400 bg-transparent focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <span>{session.user.email}</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex justify-center gap-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-5/12 cursor-pointer sm:w-1/3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transform transition-all duration-200 hover:scale-105"
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>

                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="w-5/12 cursor-pointer sm:w-1/3 rounded-full transform transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6">
              <User className="w-20 h-20 text-gray-400" />
              <h2 className="text-2xl font-bold">Welcome!</h2>
              <p className="text-gray-600">Sign in to access your profile</p>
              <Button
                onClick={() => signIn("google")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 py-2 shadow-md"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </div>
          )}
        </Card>
        <div className="flex-grow overflow-auto scrollbar-hidden">
          <div className="scroll-smooth">
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/3 max-w-xl">
        <div className="flex flex-col justify-between h-full p-6 bg-white border-2 border-gray-200 shadow-lg rounded-xl">
          {auctionStats ? (
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-xl mt-10 sm:text-3xl font-bold text-gray-900 text-center">Auction Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <StatCard
                  icon={<Gavel className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
                  value={auctionStats.totalBids}
                  label="Total Bids"
                />
                <StatCard
                  icon={<PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
                  value={auctionStats.auctionsCreated}
                  label="Auctions Created"
                />
                <StatCard
                  icon={<Trophy className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
                  value={auctionStats.auctionsWon}
                  label="Auctions Won"
                />
              </div>
              <Link
                href={`/public-profile/${userId}`}
                target="_blank"
                className="bg-emerald-500 text-white px-6 py-1 rounded-full hover:bg-emerald-600 transition"
              >
                View Public Profile
              </Link>
              <div className="w-full px-2 overflow-x-hidden">
                <h4 className="text-lg font-semibold text-center mb-2">Share your Public Profile</h4>

                <div className="flex justify-center flex-wrap gap-3 mb-3">
                  <WhatsappShareButton url={publicProfileUrl}><WhatsappIcon size={32} round /></WhatsappShareButton>
                  <TelegramShareButton url={publicProfileUrl}><TelegramIcon size={32} round /></TelegramShareButton>
                  <LinkedinShareButton url={publicProfileUrl}><LinkedinIcon size={32} round /></LinkedinShareButton>
                </div>

                <div className="flex flex-col items-center w-full overflow-hidden">
                  <div className="relative w-full max-w-[92vw] sm:max-w-[80vw]">
                    <div
                      className="hidden sm:block w-full bg-gray-100 border-2 border-dotted border-emerald-400 rounded-full px-4 py-2 text-xs text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis"
                      title={publicProfileUrl}
                    >
                      {publicProfileUrl}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(publicProfileUrl);
                      toast.success("Public profile link copied!");
                    }}
                    className="mt-2 rounded-3xl bg-emerald-100 flex items-center gap-2 text-sm"
                  >
                    <ClipboardCheckIcon className="w-4 h-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    Copy Link
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-gray-700 text-center">No auction stats available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// 💡 Helper Component for Stat Cards
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="bg-emerald-100 p-4 rounded-lg shadow-sm flex flex-col items-center">
    <div className="text-emerald-600 mb-2">{icon}</div>
    <p className="text-lg sm:text-2xl font-bold text-emerald-600">{value}</p>
    <h4 className="text-lg font-semibold text-gray-700">{label}</h4>
  </div>
);

export default ProfilePage;
