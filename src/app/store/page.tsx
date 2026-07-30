import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { Storefront } from "@/components/whole-body-records/commerce/Storefront";
import { sandabadoStoreCatalog } from "@/lib/commerce/catalog";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Store — Whole Body Records",
  description:
    "Artist records, editions, wear, and objects from Whole Body Records.",
  alternates: { canonical: "/store" },
};

export const revalidate = 30;

export default async function StorePage() {
  const { products, source } = await getPublicSiteData();
  const collection = products.length
    ? products
    : source === "curated-fallback"
      ? sandabadoStoreCatalog
      : [];
  const hasPublishedCollection = collection.length > 0;

  return (
    <RecordsPageShell activeNav="store" route="store">
      <section className="records-store-hero">
        <Image
          alt="Sandābādo ∞ LOVE artist collection"
          fill
          priority
          sizes="100vw"
          src="/images/store/sandabado/sandabado-merch-collection-v1.png"
        />
        <div aria-hidden="true" className="records-store-hero__current" />
        <div className="records-store-hero__copy">
          <p className="records-kicker">
            Whole Body Records · Artist collection 001
          </p>
          <h1>
            Carry
            <br />
            <em>the signal.</em>
          </h1>
          <p>
            {hasPublishedCollection
              ? "Artist-approved editions from Sandābādo and ∞ LOVE: records, wear, and desert-made objects for the road ahead."
              : "The artist collection is not on public display right now."}
          </p>
          <div className="records-actions">
            {hasPublishedCollection ? (
              <a
                className="records-button records-button--solid"
                href="#collection"
              >
                View the collection <span aria-hidden="true">↓</span>
              </a>
            ) : null}
            <Link className="records-catalog-link" href="/catalog#infinity-love">
              Hear ∞ LOVE <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {hasPublishedCollection ? (
        <section
          className="records-store-principles"
          aria-label="Collection notes"
        >
          <p>Artist-led editions</p>
          <p>One collection · one cart</p>
          <p>Selections held safely on this device</p>
        </section>
      ) : null}

      <section className="records-store-collection" id="collection">
        <div className="records-store-collection__heading" data-records-reveal="">
          <p className="records-index">The first collection</p>
          <h2>
            ∞ LOVE,
            <br />
            <em>in your hands.</em>
          </h2>
          <p>
            {hasPublishedCollection
              ? "The Sandābādo collection now lives inside Whole Body Records. Choose what calls to you; this cart holds your selection while secure payment is being verified."
              : "No products are published through the Whole Body Records mirror at this time."}
          </p>
        </div>
        {hasPublishedCollection ? (
          <Storefront products={collection} />
        ) : null}
      </section>

      {hasPublishedCollection ? (
        <section className="records-store-categories">
          <article>
            <span>01</span>
            <h2>Records</h2>
            <p>
              Vinyl, compact disc, and digital editions from the debut release.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>Wear</h2>
            <p>Heavyweight garments made to pick up a little desert dust.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Objects</h2>
            <p>Prints, stickers, and release-world pieces for wall and case.</p>
          </article>
        </section>
      ) : null}
    </RecordsPageShell>
  );
}
