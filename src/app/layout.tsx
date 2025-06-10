'use client'
import Navbar from "@/components/navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next"
import HelpPopup from "@/components/HelpPopup";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up") || pathname?.startsWith("/forgot-password") ||  pathname?.startsWith("/verify") || pathname?.startsWith("/reset-password") || false;
  
  return (
    <html lang="en">
      <body>
      <SessionProvider>
        <SpeedInsights/>
      {!isAuthPage && <Navbar/>}
       {!isAuthPage && <div className="h-20"></div>}
      {children}
      <Toaster />
      {!isAuthPage && <Footer />}
      <HelpPopup />
      </SessionProvider>
      </body>
    </html>
  );
}
