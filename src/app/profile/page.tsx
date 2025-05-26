"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LogOut, LogIn, Mail, User } from "lucide-react";
import Image from "next/image";


const ProfilePage = () => {
  const { data: session, status } = useSession();
  return (
    <div className="flex min-h-[80vh] bg-white relative overflow-hidden">

      {/* Profile Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        {status === "loading" ? (
          <p className="text-gray-700 text-lg animate-pulse">Loading...</p>
        ) : session ? (
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-emerald-500/40 shadow-lg rounded-2xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <Image
                  src={session.user?.image || "/default-profile.png"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover rounded-full border-4 border-emerald-400 shadow-md"
                />
              </div>
              <h2 className="text-2xl font-bold mt-3 text-gray-900">
                {session.user?.name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span>{session.user?.email}</span>
              </div>
            </CardHeader>

            <CardContent className="mt-4 flex flex-col gap-2">
              <Button
                onClick={() => signOut()}
                variant="destructive"
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform transform hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>

              <p className="text-sm text-gray-600 mt-2">
                Logged in via: <strong>Google</strong>
              </p>
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
}

export default ProfilePage;