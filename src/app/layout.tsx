'use client'
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <SessionProvider>{children}</SessionProvider>
      <Toaster />
      </body>
    </html>
  );
}
