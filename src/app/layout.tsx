import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ubuy",
  description: "Compete and win amazing deals. The auction game just got better!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
