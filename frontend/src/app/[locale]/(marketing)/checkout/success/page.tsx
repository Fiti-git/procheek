"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("paymentId") || "";

  return (
    <div className="bg-canvas min-h-screen">
      <div className="container-page py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="kicker mb-3">Confirmación</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            ¡Pedido confirmado!
          </h1>
          <p className="mt-4 text-sm text-ink-700 leading-relaxed">
            En breve recibirás tu factura por correo. Tu inscripción a los
            cursos comprados se activa de forma automática, así que puedes
            comenzar de inmediato desde tu panel.
          </p>

          {paymentId && (
            <div className="mt-8 bg-white border border-line rounded-xl p-5 text-left">
              <div className="text-[10px] uppercase tracking-widest text-ink-500 font-medium mb-1.5">
                ID de pago
              </div>
              <div className="font-mono text-sm text-ink-900 break-all">
                {paymentId}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/courses" className="btn-primary w-full sm:w-auto">
              Ver mis cursos
            </Link>
            <Link href="/courses" className="btn-secondary w-full sm:w-auto">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="bg-canvas min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  );
}
