import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HeroLab } from "./HeroLab";

export const metadata: Metadata = {
  title: "Hero Lab — Whole Body Records",
  description:
    "A private comparison of five visual directions for the Whole Body Records homepage hero.",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  if (process.env.NODE_ENV === "production") redirect("/");
  return <HeroLab />;
}
