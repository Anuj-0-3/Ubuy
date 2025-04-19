'use client'

import Navbar from "@/components/navbar";
import { SessionProvider } from "next-auth/react";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
      <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
