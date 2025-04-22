'use client'
import Navbar from "@/components/navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up") || false;
  
  return (
    <html lang="en">
      <body>
      <SessionProvider>
      {!isAuthPage && <Navbar/>}
      {children}
      <Toaster />
      {!isAuthPage && <Footer />}
      </SessionProvider>
      </body>
    </html>
  );
}
