"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartBadge() {
  const { items, hydrated } = useCart();
  const count = hydrated ? items.length : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-canvas-2 transition-colors"
      aria-label="Carrito"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-coral-500 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-canvas">
          {count}
        </span>
      )}
    </Link>
  );
}

export default CartBadge;
