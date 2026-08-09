"use client";

import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import {
  formatStoreCurrency,
  type PublicStoreProduct,
} from "@/lib/commerce/catalog";
import { useCart } from "./CartProvider";

export interface StoreProductCardProps {
  priority?: boolean;
  product: PublicStoreProduct;
}

export function StoreProductCard({
  priority = false,
  product,
}: StoreProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function add() {
    addItem(product.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1_500);
  }

  return (
    <article className="records-store-product">
      <div className="records-store-product__image">
        <Image
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          src={product.image}
        />
        {product.badge ? <span>{product.badge}</span> : null}
      </div>
      <div className="records-store-product__copy">
        <p className="records-index">
          {product.artistName} · {product.category}
        </p>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div>
          <strong>
            {formatStoreCurrency(product.priceCents, product.currency)}
          </strong>
          <button onClick={add} type="button">
            {added ? (
              <Check aria-hidden="true" size={15} />
            ) : (
              <ShoppingBag aria-hidden="true" size={15} />
            )}
            {added ? "Added" : "Add"}
          </button>
          <span
            aria-atomic="true"
            aria-live="polite"
            className="sr-only"
            role="status"
          >
            {added ? `${product.name} added to cart.` : ""}
          </span>
        </div>
      </div>
    </article>
  );
}
