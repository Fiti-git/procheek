"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/api";
import { imageForCourse } from "@/lib/images";

export default function CartPage() {
  const router = useRouter();
  const { items, hydrated, updateQty, remove, totals } = useCart();
  const { subtotal, iva, total } = totals;

  const onCheckout = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login?returnTo=/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="bg-canvas min-h-screen">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-canvas-2 border border-line mb-6">
              <ShoppingBag className="h-7 w-7 text-ink-500" />
            </div>
            <p className="kicker mb-3">Carrito</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight">
              Tu carrito está vacío.
            </h1>
            <p className="mt-3 text-sm text-ink-500">
              Explora nuestro catálogo y añade cursos NOM para inscribir a tu equipo.
            </p>
            <div className="mt-8">
              <Link href="/courses" className="btn-primary inline-flex items-center gap-2">
                Ver cursos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen">
      <div className="container-page py-12 md:py-16">
        <div className="mb-8">
          <p className="kicker mb-3">Carrito</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            Tu carrito.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {items.length} {items.length === 1 ? "curso listo" : "cursos listos"} para inscribir
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((i) => {
              const src = i.image || imageForCourse(i.courseCode);
              const lineTotal = i.price * i.qty;
              return (
                <div
                  key={i.courseId}
                  className="card-enterprise p-4 flex items-center gap-4"
                >
                  <div className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={i.courseTitle}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center bg-ink-50 text-ink-900 border border-line rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                        {i.courseCode}
                      </span>
                    </div>
                    <div className="font-medium text-ink-900 truncate">
                      {i.courseTitle}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-500">
                      <ShieldCheck className="h-3 w-3 text-coral-500" />
                      Incluye certificado DC-3
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-0 rounded-lg border border-line overflow-hidden">
                    <button
                      type="button"
                      aria-label="Reducir cantidad"
                      onClick={() => updateQty(i.courseId, i.qty - 1)}
                      className="h-8 w-8 inline-flex items-center justify-center text-ink-700 hover:bg-canvas-2"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-ink-900">
                      {i.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      onClick={() => updateQty(i.courseId, i.qty + 1)}
                      className="h-8 w-8 inline-flex items-center justify-center text-ink-700 hover:bg-canvas-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-right w-24">
                    <div className="font-display text-lg font-semibold text-ink-900">
                      ${lineTotal.toLocaleString("es-MX")}
                    </div>
                    <div className="text-[10px] text-ink-500">MXN</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i.courseId)}
                    className="p-2 rounded-lg text-ink-500 hover:bg-danger-bg hover:text-danger transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="bg-ink-900 text-white p-7 h-fit rounded-xl border border-ink-900 lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-semibold text-white tracking-tight mb-5">
              Resumen del pedido
            </h3>
            <dl className="space-y-2.5 text-sm text-ink-200">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>${subtotal.toLocaleString("es-MX")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>IVA (16%)</dt>
                <dd>${iva.toLocaleString("es-MX")}</dd>
              </div>
              <div className="h-px bg-ink-700 my-3" />
              <div className="flex justify-between items-baseline">
                <dt className="text-white text-base">Total</dt>
                <dd className="font-display text-3xl font-semibold text-white">
                  ${total.toLocaleString("es-MX")}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg font-medium text-sm bg-coral-500 hover:bg-coral-600 text-white transition-colors mt-6"
            >
              Proceder al pago <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-5 pt-5 border-t border-ink-700">
              <div className="text-[10px] uppercase tracking-widest text-ink-300 mb-2 font-medium">
                Métodos de pago
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-ink-300">
                {["VISA", "MASTERCARD", "AMEX", "OXXO", "SPEI"].map((m) => (
                  <span
                    key={m}
                    className="border border-ink-700 rounded-md px-1.5 py-0.5"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
