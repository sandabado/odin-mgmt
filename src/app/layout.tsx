import type { Metadata } from "next";
import { Fraunces, Schibsted_Grotesk } from "next/font/google";
import { FoundationInviteRedirect } from "@/components/foundation/FoundationInviteRedirect";
import { CartProvider } from "@/components/whole-body-records/commerce/CartProvider";
import { TurntableProvider } from "@/components/whole-body-records/turntable/TurntableProvider";
import { getPublicSiteData } from "@/lib/public-mirror";
import { getPublicSiteOrigin } from "@/lib/public-site-url";
import "./globals.css";
import "./records-brand.css";

const recordsHeader = Fraunces({
  axes: ["opsz"],
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-records-display",
  weight: "variable",
});

const recordsBody = Schibsted_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-records-body",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteOrigin()),
  title: {
    default: "Whole Body Records — Many voices. One whole body.",
    template: "%s",
  },
  description:
    "A self-sustaining creative economy for artists who own their work and fans who seek the source.",
  applicationName: "Whole Body Records",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Whole Body Records",
    title: "Whole Body Records — Many voices. One whole body.",
    description:
      "A self-sustaining creative economy for artists who own their work and fans who seek the source.",
    images: [
      {
        url: "/whole-body-records-social-record-watershed.png",
        width: 1200,
        height: 630,
        alt: "Blue tributaries flowing through a black vinyl record watershed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Whole Body Records — Many voices. One whole body.",
    description:
      "A self-sustaining creative economy for artists who own their work and fans who seek the source.",
    images: ["/whole-body-records-social-record-watershed.png"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { playableReleases } = await getPublicSiteData();
  return (
    <html lang="en">
      <body className={`${recordsHeader.variable} ${recordsBody.variable}`}>
        <FoundationInviteRedirect />
        <CartProvider>
          <TurntableProvider
            enabled={
              process.env.NEXT_PUBLIC_INLINE_TURNTABLE_ENABLED !== "false"
            }
            persistentPlayerEnabled={
              process.env.NEXT_PUBLIC_TURNTABLE_ENABLED === "true"
            }
            releases={playableReleases}
          >
            {children}
          </TurntableProvider>
        </CartProvider>
      </body>
    </html>
  );
}
