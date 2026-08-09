import type { Metadata } from "next";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { CartExperience } from "@/components/whole-body-records/commerce/CartExperience";
import { sandabadoStoreCatalog } from "@/lib/commerce/catalog";
import { getCommerceReadiness } from "@/lib/commerce/readiness";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Cart — Whole Body Records",
  description:
    "Review selected records, wear, and objects from Whole Body Records.",
  alternates: { canonical: "/cart" },
  robots: { follow: false, index: false },
};

export const revalidate = 30;

export default async function CartPage() {
  const commerce = getCommerceReadiness();
  const { products, source } = await getPublicSiteData();
  const collection = products.length
    ? products
    : source === "curated-fallback"
      ? sandabadoStoreCatalog
      : [];

  return (
    <RecordsPageShell activeNav="cart" route="cart">
      <MuseumPageHero
        description="Your selected records, wear, and objects move together in one current."
        eyebrow="Whole Body store"
        title={
          <>
            Your
            <br />
            <em>cart.</em>
          </>
        }
      />

      <RecordsGeometryDivider tone="deep" />

      <CartExperience
        checkoutEnabled={commerce.checkoutEnabled}
        products={collection}
      />

      <RecordsGeometryDivider />
    </RecordsPageShell>
  );
}
