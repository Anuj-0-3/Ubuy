"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LogOut, LogIn, Mail, User, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const ProfilePage = () => {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the full profile from your DB
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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    };

    fetchProfile();
  }, [session]);

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
          imageBase64: imageBase64 || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update profile");

      toast.success("Profile updated successfully!");

      // Re-fetch updated profile
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

      // Optionally update session data
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
    <div className="flex min-h-[80vh] bg-white relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
        {status === "loading" ? (
          <p className="text-gray-700 text-lg animate-pulse">Loading...</p>
        ) : session ? (
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-emerald-500/40 shadow-lg rounded-2xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <Image
                  src={profile?.image || "/default-profile.png"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover rounded-full border-4 border-emerald-400 shadow-md"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload a new profile image"
                />
                <div className="absolute bottom-0 right-0 bg-emerald-500 p-1 rounded-full shadow cursor-pointer">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="mt-3 text-center font-semibold text-gray-900 bg-transparent border-b border-emerald-400 focus:outline-none focus:border-emerald-600 transition-colors"
              />

              <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span>{session.user?.email}</span>
              </div>
            </CardHeader>

            <CardContent className="mt-4 flex flex-col gap-2">
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-transform transform hover:scale-105"
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>

              <Button
                onClick={() => signOut()}
                variant="destructive"
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform transform hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
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
      </div>
    </div>
  );
};

export default ProfilePage;
