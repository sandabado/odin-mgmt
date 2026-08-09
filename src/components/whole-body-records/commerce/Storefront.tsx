"use client";

import { useMemo, useState } from "react";
import {
  STORE_CATEGORIES,
  type PublicStoreProduct,
  type StoreCategory,
} from "@/lib/commerce/catalog";
import { StoreProductCard } from "./StoreProductCard";

type StoreFilter = "all" | StoreCategory;

export interface StorefrontProps {
  products: readonly PublicStoreProduct[];
}

export function Storefront({ products }: StorefrontProps) {
  const [filter, setFilter] = useState<StoreFilter>("all");
  const visible = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((product) => product.category === filter),
    [filter, products],
  );

  return (
    <div className="records-storefront">
      <div aria-label="Filter collection" className="records-store-filters">
        {(["all", ...STORE_CATEGORIES] as const).map((category) => (
          <button
            aria-pressed={filter === category}
            key={category}
            onClick={() => setFilter(category)}
            type="button"
          >
            {category === "all" ? "Everything" : category}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="records-store-count">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"} in this
        collection
      </p>
      <div className="records-store-grid">
        {visible.map((product, index) => (
          <StoreProductCard
            key={product.slug}
            priority={index < 2}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
