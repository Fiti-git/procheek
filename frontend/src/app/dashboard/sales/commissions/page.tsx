"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

type Commission = {
  id: string;
  dealId: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "void";
  periodMonth: string;
  paidAt: string | null;
};

function mx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

function statusPill(s: Commission["status"]) {
  const map: Record<Commission["status"], { label: string; cls: string }> = {
    pending: { label: "Pendiente", cls: "bg-amber-50 text-amber-700" },
    approved: { label: "Aprobada", cls: "bg-blue-50 text-blue-700" },
    paid: { label: "Pagada", cls: "bg-emerald-50 text-emerald-700" },
    void: { label: "Cancelada", cls: "bg-red-50 text-red-700" },
  };
  const { label, cls } = map[s] || { label: s, cls: "bg-canvas-2 text-ink-700" };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

export default function CommissionsPage() {
  const [items, setItems] = useState<Commission[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const d = await apiGet<Commission[]>("/sales/commissions");
        setItems(Array.isArray(d) ? d : []);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const periods = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.periodMonth && set.add(i.periodMonth));
    return Array.from(set).sort().reverse();
  }, [items]);

  const filtered = period === "all" ? items : items.filter((i) => i.periodMonth === period);

  const total = filtered.reduce((a, b) => a + (Number(b.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Comisiones</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Historial de comisiones.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-widest text-ink-500 font-medium">
          Periodo
        </label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-line rounded-lg px-3 py-1.5 text-sm text-ink-800"
        >
          <option value="all">Todos</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm text-ink-700">
          Total: <span className="field-mono text-ink-900">{mx(total)}</span>
        </div>
      </div>

      <div className="card-enterprise overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas-2">
            <tr className="text-xs uppercase tracking-widest text-ink-500">
              <th className="text-left px-5 py-3 font-medium">Periodo</th>
              <th className="text-left px-5 py-3 font-medium">Venta</th>
              <th className="text-right px-5 py-3 font-medium">Monto</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-left px-5 py-3 font-medium">Pagada</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-ink-500 text-center">
                  Sin comisiones en este periodo.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink-900">{c.periodMonth}</td>
                <td className="px-5 py-3 text-ink-700 field-mono text-xs">
                  {c.dealId.slice(0, 8)}
                </td>
                <td className="px-5 py-3 text-right field-mono text-ink-900">
                  {mx(c.amount)}
                </td>
                <td className="px-5 py-3">{statusPill(c.status)}</td>
                <td className="px-5 py-3 text-ink-500">
                  {c.paidAt
                    ? new Date(c.paidAt).toLocaleDateString("es-MX")
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
