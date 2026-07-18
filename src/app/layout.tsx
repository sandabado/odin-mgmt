import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "øDIN Management — Artist Management & Booking",
  description: "Artist management and booking infrastructure for independent artists with lasting work.",
  applicationName: "øDIN Management",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
