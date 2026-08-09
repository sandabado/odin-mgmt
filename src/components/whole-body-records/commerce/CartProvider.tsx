"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartLine {
  productSlug: string;
  quantity: number;
}

export interface CartProviderProps {
  children: ReactNode;
}

export interface CartContextValue {
  addItem: (productSlug: string, quantity?: number) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartLine[];
  removeItem: (productSlug: string) => void;
  updateQuantity: (productSlug: string, quantity: number) => void;
}

const CART_STORAGE_KEY = "wbr-cart-v1";
const MAX_CART_LINES = 50;
const MAX_PRODUCT_SLUG_LENGTH = 120;
const MAX_QUANTITY = 10;
const CartContext = createContext<CartContextValue | null>(null);

function validCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const quantities = new Map<string, number>();
  value.slice(0, MAX_CART_LINES).forEach((candidate) => {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      typeof (candidate as CartLine).productSlug !== "string" ||
      !Number.isInteger((candidate as CartLine).quantity)
    ) {
      return;
    }
    const slug = (candidate as CartLine).productSlug.trim();
    const quantity = Math.min(
      Math.max((candidate as CartLine).quantity, 1),
      MAX_QUANTITY,
    );
    if (
      !slug ||
      slug.length > MAX_PRODUCT_SLUG_LENGTH ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      return;
    }
    quantities.set(
      slug,
      Math.min((quantities.get(slug) ?? 0) + quantity, MAX_QUANTITY),
    );
  });
  return Array.from(quantities, ([productSlug, quantity]) => ({
    productSlug,
    quantity,
  }));
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      setItems(stored ? validCartLines(JSON.parse(stored)) : []);
    } catch {
      try {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // Storage can be unavailable in privacy-constrained browser contexts.
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The in-memory cart remains usable when persistent storage is blocked.
    }
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      addItem(productSlug, quantity = 1) {
        const candidate = validCartLines([{ productSlug, quantity }])[0];
        if (!candidate) return;
        setItems((current) => {
          const existing = current.find(
            (item) => item.productSlug === candidate.productSlug,
          );
          return existing
            ? current.map((item) =>
                item.productSlug === candidate.productSlug
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + candidate.quantity,
                        MAX_QUANTITY,
                      ),
                    }
                  : item,
              )
            : [candidate, ...current].slice(0, MAX_CART_LINES);
        });
      },
      clearCart() {
        setItems([]);
      },
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      items,
      removeItem(productSlug) {
        setItems((current) =>
          current.filter((item) => item.productSlug !== productSlug),
        );
      },
      updateQuantity(productSlug, quantity) {
        if (!Number.isFinite(quantity)) return;
        const normalizedQuantity = Math.trunc(quantity);
        setItems((current) =>
          normalizedQuantity < 1
            ? current.filter((item) => item.productSlug !== productSlug)
            : current.map((item) =>
                item.productSlug === productSlug
                  ? {
                      ...item,
                      quantity: Math.min(normalizedQuantity, MAX_QUANTITY),
                    }
                  : item,
              ),
        );
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
