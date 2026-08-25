"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Deal = {
  id: string;
  buyerName: string;
  package: string;
  amount: number;
  commissionPct: number;
  commissionAmount: number;
  closedAt: string;
  paidAt: string | null;
};

function mx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiGet<Deal[]>("/sales/deals");
        setDeals(Array.isArray(d) ? d : []);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Ventas</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Ventas cerradas.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      <div className="card-enterprise overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas-2">
            <tr className="text-xs uppercase tracking-widest text-ink-500">
              <th className="text-left px-5 py-3 font-medium">Cliente</th>
              <th className="text-left px-5 py-3 font-medium">Paquete</th>
              <th className="text-right px-5 py-3 font-medium">Monto</th>
              <th className="text-right px-5 py-3 font-medium">Comisión %</th>
              <th className="text-right px-5 py-3 font-medium">Comisión</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-left px-5 py-3 font-medium">Cerrada</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-ink-500 text-center">
                  Sin ventas registradas.
                </td>
              </tr>
            )}
            {deals.map((d) => (
              <tr key={d.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink-900">{d.buyerName}</td>
                <td className="px-5 py-3 text-ink-700">{d.package}</td>
                <td className="px-5 py-3 text-right field-mono text-ink-900">
                  {mx(d.amount)}
                </td>
                <td className="px-5 py-3 text-right field-mono text-ink-700">
                  {d.commissionPct}%
                </td>
                <td className="px-5 py-3 text-right field-mono text-coral-600">
                  {mx(d.commissionAmount)}
                </td>
                <td className="px-5 py-3">
                  {d.paidAt ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      Pagada
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {d.closedAt
                    ? new Date(d.closedAt).toLocaleDateString("es-MX")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
