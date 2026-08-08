"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  Wallet,
  TrendingUp,
  Briefcase,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import KpiCard from "@/components/KpiCard";

type Summary = {
  quota_mtd: number;
  sold_mtd: number;
  pipeline_value: number;
  active_leads: number;
  commission_pending: number;
  commission_paid_ytd: number;
};

type Deal = {
  id: string;
  buyerName: string;
  package: string;
  amount: number;
  commissionAmount: number;
  closedAt: string;
};

function mx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export default function SalesDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, d] = await Promise.all([
          apiGet<Summary>("/sales/dashboard/summary"),
          apiGet<Deal[]>("/sales/deals"),
        ]);
        setSummary(s);
        setDeals(Array.isArray(d) ? d.slice(0, 5) : []);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const pct =
    summary && summary.quota_mtd > 0
      ? Math.min(100, Math.round((summary.sold_mtd / summary.quota_mtd) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Panel de ventas</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Buenas, aquí tu resumen.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">
          No pudimos cargar el resumen ({err}). Inicia sesión con un vendedor
          desde /login.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <KpiCard
          label="Cuota mensual"
          value={mx(summary?.quota_mtd ?? 0)}
          icon={Target}
          hint={`Vendido ${mx(summary?.sold_mtd ?? 0)}`}
        />
        <KpiCard
          label="Pipeline activo"
          value={mx(summary?.pipeline_value ?? 0)}
          icon={Briefcase}
          hint={`${summary?.active_leads ?? 0} prospectos`}
        />
        <KpiCard
          label="Comisión pendiente"
          value={mx(summary?.commission_pending ?? 0)}
          icon={Wallet}
          tone="coral"
          hint={`Pagado YTD ${mx(summary?.commission_paid_ytd ?? 0)}`}
        />
      </div>

      <div className="card-enterprise p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
              Avance de cuota
            </p>
            <p className="font-display text-2xl text-ink-900 mt-1">
              {pct}% del mes
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-coral-500" />
        </div>
        <div className="w-full h-2 bg-canvas-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-coral-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="card-enterprise overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
              Últimas ventas cerradas
            </p>
            <h2 className="font-display text-xl tracking-tight text-ink-900 mt-1">
              Actividad reciente
            </h2>
          </div>
          <Link
            href="/dashboard/sales/deals"
            className="text-sm link-inline inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-canvas-2">
            <tr className="text-xs uppercase tracking-widest text-ink-500">
              <th className="text-left px-5 py-3 font-medium">Cliente</th>
              <th className="text-left px-5 py-3 font-medium">Paquete</th>
              <th className="text-right px-5 py-3 font-medium">Monto</th>
              <th className="text-right px-5 py-3 font-medium">Comisión</th>
              <th className="text-left px-5 py-3 font-medium">Cerrada</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-ink-500 text-center">
                  Sin ventas registradas todavía.
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
                <td className="px-5 py-3 text-right field-mono text-coral-600">
                  {mx(d.commissionAmount)}
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
