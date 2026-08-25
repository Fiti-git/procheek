"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Building, Store, ShieldCheck, Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { imageForCourse } from "@/lib/images";
import { useCart } from "@/lib/cart";
import { apiGet, apiPost, getCurrentUser, type CurrentUser } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const methods = [
  { key: "visa", label: "Visa", icon: CreditCard },
  { key: "master", label: "Mastercard", icon: CreditCard },
  { key: "amex", label: "Amex", icon: CreditCard },
  { key: "oxxo", label: "OXXO", icon: Store },
  { key: "spei", label: "SPEI", icon: Building },
];

type BackendCourse = {
  id: string;
  code?: string;
  title?: string;
};

const RFC_KEY = "procheck_billing_rfc";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, hydrated, totals, clear } = useCart();
  const { subtotal, iva, total } = totals;
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [rfc, setRfc] = useState("");
  const [method, setMethod] = useState<string>("visa");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/login?returnTo=/checkout");
      return;
    }
    setUser(u);
    const savedRfc = window.localStorage.getItem(RFC_KEY);
    if (savedRfc) setRfc(savedRfc);
  }, [router]);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  const onConfirm = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      window.localStorage.setItem(RFC_KEY, rfc.trim());

      // Resolve local course IDs to real backend UUIDs by matching code.
      const backendCourses = await apiGet<BackendCourse[] | { data: BackendCourse[] }>("/courses");
      const list: BackendCourse[] = Array.isArray(backendCourses)
        ? backendCourses
        : Array.isArray((backendCourses as { data?: BackendCourse[] }).data)
          ? (backendCourses as { data: BackendCourse[] }).data
          : [];
      const byCode = new Map<string, string>();
      for (const c of list) {
        if (c.code && c.id) byCode.set(c.code.toUpperCase(), c.id);
      }

      const payload = items.map((i) => {
        const resolved = byCode.get(i.courseCode.toUpperCase()) || i.courseId;
        return { courseId: resolved, qty: i.qty };
      });

      const result = await apiPost<{ id: string }>("/payments/checkout", {
        items: payload,
      });

      if (!result?.id) {
        throw new Error("Respuesta inválida del servidor.");
      }

      clear();
      router.push(`/checkout/success?paymentId=${encodeURIComponent(result.id)}`);
    } catch (e) {
      const msg = (e as Error).message || "No pudimos procesar tu pedido.";
      setError(msg);
      toast({
        title: "Error al confirmar pedido",
        description: msg,
        variant: "error",
      });
      setSubmitting(false);
    }
  };

  if (!user || !hydrated || items.length === 0) {
    return (
      <div className="bg-canvas min-h-screen">
        <div className="container-page py-24 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen">
      <div className="container-page py-12 md:py-16">
        <div className="mb-8">
          <p className="kicker mb-3">Checkout</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            Finalizar compra.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Un solo paso para inscribir a tu equipo
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-line rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold text-ink-900 mb-5 tracking-tight">
                Datos de facturación
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre completo</Label>
                  <div className="rounded-lg border border-line bg-canvas-2 px-3.5 py-2.5 text-sm text-ink-800">
                    {user.name || user.email}
                  </div>
                </div>
                <div>
                  <Label>Correo electrónico</Label>
                  <div className="rounded-lg border border-line bg-canvas-2 px-3.5 py-2.5 text-sm text-ink-800 font-mono">
                    {user.email}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label>RFC (opcional)</Label>
                  <Input
                    placeholder="XAXX010101000"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-line rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold text-ink-900 mb-5 tracking-tight">
                Método de pago
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {methods.map((m) => {
                  const active = method === m.key;
                  return (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      className={
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors " +
                        (active
                          ? "border-coral-500 bg-coral-50 text-ink-900"
                          : "border-line bg-white text-ink-700 hover:border-line-strong")
                      }
                    >
                      <m.icon className="h-5 w-5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-ink-500">
                Nos pondremos en contacto para confirmar el pago según el método seleccionado.
              </p>
            </div>
          </div>

          <aside className="bg-ink-900 text-white p-7 h-fit rounded-xl lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-semibold text-white tracking-tight mb-5">
              Resumen del pedido
            </h3>
            <ul className="space-y-3 mb-5">
              {items.map((i) => (
                <li key={i.courseId} className="flex items-center gap-3">
                  <div className="relative h-11 w-14 rounded-md overflow-hidden shrink-0 border border-ink-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i.image || imageForCourse(i.courseCode)}
                      alt={i.courseTitle}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">
                      {i.courseTitle}
                    </div>
                    <div className="font-mono text-[10px] text-ink-300 mt-0.5">
                      {i.courseCode} · x{i.qty}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-white">
                    ${(i.price * i.qty).toLocaleString("es-MX")}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm text-ink-200 border-t border-ink-700 pt-4">
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
                <dd className="font-display text-2xl font-semibold text-white">
                  ${total.toLocaleString("es-MX")}
                </dd>
              </div>
            </dl>
            {error && (
              <div className="mt-4 text-xs bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg font-medium text-sm bg-coral-500 hover:bg-coral-600 disabled:opacity-60 text-white transition-colors mt-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>Confirmar pedido</>
              )}
            </button>
            <div className="mt-4 text-xs text-ink-300 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-coral-500" />
              Pago seguro
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
