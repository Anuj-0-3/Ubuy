"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LogOut, LogIn, Mail, User } from "lucide-react";
import Navbar from "@/components/navbar";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  return (<>
    <Navbar/>
    <div className="min-h-[80vh] flex  justify-center items-center bg-white">
      {/* Navbar */}
      

      {/* Profile Section */}
      <div className="flex flex-col items-center justify-center w-full px-4 py-10">
        {status === "loading" ? (
          <p className="text-gray-700 text-lg animate-pulse">Loading...</p>
        ) : session ? (
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-emerald-500/40 shadow-lg rounded-2xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <Image
                src={session.user?.image || "/default-profile.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-emerald-400 shadow-md"
              />
              <h2 className="text-2xl font-bold mt-3 text-gray-900">{session.user?.name}</h2>

              {/* Email with Lucide Icon */}
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span>{session.user?.email}</span>
              </div>
            </CardHeader>

            <CardContent className="mt-4">
              <Button
                onClick={() => signOut()}
                variant="destructive"
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 transition-transform transform hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center">
            <User className="w-20 h-20 text-gray-400" />
            <h2 className="text-2xl font-bold mt-3 text-gray-900">Welcome!</h2>
            <p className="text-gray-600 mb-4">Sign in to access your profile</p>
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
    </>
  );
}

