"use client";

import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  price: number;
  image?: string;
  qty: number;
};

const STORAGE_KEY = "procheck_cart";
const EVENT_NAME = "procheck-cart-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitChange();
}

export function addToCart(item: Omit<CartItem, "qty">): void {
  if (!isBrowser()) return;
  const items = getCart();
  const idx = items.findIndex((i) => i.courseId === item.courseId);
  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
  } else {
    items.push({ ...item, qty: 1 });
  }
  writeCart(items);
}

export function updateQty(courseId: string, qty: number): void {
  if (!isBrowser()) return;
  const items = getCart();
  const idx = items.findIndex((i) => i.courseId === courseId);
  if (idx < 0) return;
  if (qty <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx] = { ...items[idx], qty };
  }
  writeCart(items);
}

export function removeFromCart(courseId: string): void {
  if (!isBrowser()) return;
  const items = getCart().filter((i) => i.courseId !== courseId);
  writeCart(items);
}

export function clearCart(): void {
  if (!isBrowser()) return;
  writeCart([]);
}

export function cartTotal(items: CartItem[]): {
  subtotal: number;
  iva: number;
  total: number;
} {
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const iva = Math.round(subtotal * 0.16);
  const total = subtotal + iva;
  return { subtotal, iva, total };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const sync = useCallback(() => {
    setItems(getCart());
  }, []);

  useEffect(() => {
    sync();
    setHydrated(true);
    const handler = () => sync();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, [sync]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    addToCart(item);
  }, []);

  const remove = useCallback((courseId: string) => {
    removeFromCart(courseId);
  }, []);

  const setQty = useCallback((courseId: string, qty: number) => {
    updateQty(courseId, qty);
  }, []);

  const clear = useCallback(() => {
    clearCart();
  }, []);

  const totals = cartTotal(items);

  return {
    items,
    hydrated,
    add,
    remove,
    updateQty: setQty,
    clear,
    totals,
  };
}
