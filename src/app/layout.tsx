import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import HelpPopup from "@/components/HelpPopup";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";
import Providers from "@/components/Providers";

export const metadata = {
  title: {
    default: 'U-Buy - Online Auction Platform',
    template: '%s | U-Buy',
  },
  description: 'Join live auctions and bid on unique items across categories with U-Buy.',
};

import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Providers>
          <SpeedInsights />
          <ClientNavbarWrapper>
            {children}
          </ClientNavbarWrapper>
          <Toaster />
          <HelpPopup />
        </Providers>
      </body>
    </html>
  );
}
