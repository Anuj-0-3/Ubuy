'use client'
import Navbar from "@/components/navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react";
import Footer from "@/components/Footer";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <SessionProvider>
      <Navbar/>{children}</SessionProvider>
      <Toaster />
      <Footer/>
      </body>
    </html>
  );
}
