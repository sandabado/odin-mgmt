"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  formatStoreCurrency,
  type PublicStoreProduct,
} from "@/lib/commerce/catalog";
import { useCart } from "./CartProvider";

export interface CartExperienceProps {
  checkoutEnabled: boolean;
  products: readonly PublicStoreProduct[];
}

export function CartExperience({
  checkoutEnabled,
  products,
}: CartExperienceProps) {
  const { clearCart, items, removeItem, updateQuantity } = useCart();
  const productBySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  );

  useEffect(() => {
    items
      .filter((item) => !productBySlug.has(item.productSlug))
      .forEach((item) => removeItem(item.productSlug));
  }, [items, productBySlug, removeItem]);

  const resolved = items.flatMap((item) => {
    const product = productBySlug.get(item.productSlug);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = resolved.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const subtotalCurrency = resolved[0]?.product.currency ?? "USD";
  const hasMixedCurrencies = resolved.some(
    (item) => item.product.currency !== subtotalCurrency,
  );
  const inquiryHref = `mailto:records@wholebody.earth?subject=${encodeURIComponent(
    "∞ LOVE collection inquiry",
  )}&body=${encodeURIComponent(
    [
      "I’m interested in this Whole Body Records collection:",
      "",
      ...resolved.map(
        ({ product, quantity }) =>
          `${quantity} × ${product.name} — ${formatStoreCurrency(
            product.priceCents * quantity,
            product.currency,
          )}`,
      ),
      "",
      hasMixedCurrencies
        ? "Selection subtotal: multiple currencies"
        : `Selection subtotal: ${formatStoreCurrency(
            subtotal,
            subtotalCurrency,
          )}`,
    ].join("\n"),
  )}`;

  if (!resolved.length) {
    return (
      <section className="records-cart-empty">
        <ShoppingBag aria-hidden="true" size={34} strokeWidth={1.25} />
        <p className="records-kicker">The current is open</p>
        <h2>Your cart is waiting.</h2>
        <p>Records, wear, and objects from the artist collection live here.</p>
        <Link className="records-button records-button--solid" href="/store">
          Enter the store <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="records-cart-experience">
      <div className="records-cart-lines">
        {resolved.map(({ product, productSlug, quantity }) => (
          <article key={productSlug}>
            <div className="records-cart-lines__image">
              <Image alt="" fill sizes="110px" src={product.image} />
            </div>
            <div className="records-cart-lines__copy">
              <p className="records-index">{product.artistName}</p>
              <h2>{product.name}</h2>
              <p>{formatStoreCurrency(product.priceCents, product.currency)}</p>
            </div>
            <div
              aria-label={`Quantity for ${product.name}`}
              className="records-cart-quantity"
              role="group"
            >
              <button
                aria-label={`Remove one ${product.name}`}
                onClick={() => updateQuantity(productSlug, quantity - 1)}
                type="button"
              >
                <Minus aria-hidden="true" size={14} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label={`Add one ${product.name}`}
                onClick={() => updateQuantity(productSlug, quantity + 1)}
                type="button"
              >
                <Plus aria-hidden="true" size={14} />
              </button>
            </div>
            <strong>
              {formatStoreCurrency(
                product.priceCents * quantity,
                product.currency,
              )}
            </strong>
            <button
              aria-label={`Remove ${product.name} from cart`}
              className="records-cart-remove"
              onClick={() => removeItem(productSlug)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={15} />
            </button>
          </article>
        ))}
        <button
          className="records-cart-clear"
          onClick={clearCart}
          type="button"
        >
          Clear cart
        </button>
      </div>
      <aside className="records-cart-summary">
        <p className="records-index">Order summary</p>
        <div>
          <span>Subtotal</span>
          <strong>
            {hasMixedCurrencies
              ? "Multiple currencies"
              : formatStoreCurrency(subtotal, subtotalCurrency)}
          </strong>
        </div>
        <p>Shipping and tax are confirmed only in secure checkout.</p>
        {checkoutEnabled ? (
          <button type="button">Checkout securely →</button>
        ) : (
          <>
            <button disabled type="button">
              Secure checkout is held
            </button>
            <p className="records-cart-summary__transfer">
              Payment is not configured on WBR or the source artist store yet.
              Your selection remains saved on this device while Stripe,
              inventory, and fulfillment are verified.
            </p>
            <a href={inquiryHref}>
              Ask about this collection <span aria-hidden="true">↗</span>
            </a>
          </>
        )}
      </aside>
    </section>
  );
}
