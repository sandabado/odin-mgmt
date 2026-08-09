"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { RECORDS_PUBLIC_ROUTES } from "@/lib/records-public-routes";
import { useCart } from "./commerce/CartProvider";

export interface RecordsCartLinkProps {
  active?: boolean;
}

export function RecordsCartLink({ active = false }: RecordsCartLinkProps) {
  const { itemCount } = useCart();

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className="records-cart-link"
      href={RECORDS_PUBLIC_ROUTES.cart.href}
    >
      <ShoppingBag aria-hidden="true" size={16} strokeWidth={1.5} />
      <span className="records-cart-link__label">Cart</span>
      <span aria-hidden="true" className="records-cart-link__count">
        {itemCount}
      </span>
    </Link>
  );
}
