import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ødin Management — Artist Management & Booking",
  description: "Artist management and booking infrastructure for independent artists with lasting work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
