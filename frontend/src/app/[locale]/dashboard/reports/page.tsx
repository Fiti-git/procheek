"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Activity,
  BarChart3,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import ReportsExport from "./ReportsExport";
import { RoleGate } from "@/components/RoleGate";

type Summary = {
  totalUsers: number;
  totalCourses: number;
  totalCertificates: number;
  totalEnrollments: number;
  complianceRate: number;
  recentActivity: Array<{
    id?: string;
    title?: string;
    description?: string;
    at?: string;
  }>;
};

type SalesPoint = { month: string; total: number; count: number };

function ReportsPageInner() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sales, setSales] = useState<SalesPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Summary>("/analytics/summary");
      setSummary(data);
      apiGet<SalesPoint[]>("/analytics/sales-by-month")
        .then((rows) => setSales(rows || []))
        .catch(() => setSales([]));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar";
      if (/403|forbidden/i.test(msg)) {
        setSummary(null);
      } else {
        setError(
          "No pudimos cargar los reportes. Intenta nuevamente en unos momentos.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = [
    {
      label: "Total usuarios",
      value: summary ? summary.totalUsers.toLocaleString("es-MX") : "—",
      icon: Users,
    },
    {
      label: "Cursos activos",
      value: summary ? summary.totalCourses.toLocaleString("es-MX") : "—",
      icon: BookOpen,
    },
    {
      label: "Certificados emitidos",
      value: summary ? summary.totalCertificates.toLocaleString("es-MX") : "—",
      icon: Award,
    },
    {
      label: "Tasa de cumplimiento",
      value: summary ? `${summary.complianceRate}%` : "—",
      icon: CheckCircle2,
    },
  ];

  const activity = summary?.recentActivity ?? [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Reportes</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Reportes.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Métricas de la plataforma y actividad reciente.
          </p>
        </div>
        <ReportsExport />
      </div>

      {error && (
        <div className="bg-white border border-line rounded-xl p-4 mb-6 text-sm text-ink-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white border border-line rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div className="text-xs uppercase tracking-widest text-ink-500 font-medium">
                {k.label}
              </div>
              <k.icon className="h-4 w-4 text-ink-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
                {loading ? (
                  <span className="inline-block h-8 w-16 bg-canvas-2 rounded animate-pulse" />
                ) : (
                  k.value
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales by month */}
      <div className="bg-white border border-line rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-line flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-ink-500" />
          <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
            Ventas por mes (MXN)
          </h3>
        </div>
        <div className="p-6">
          {sales === null ? (
            <div className="text-sm text-ink-500">Cargando ventas…</div>
          ) : sales.length === 0 || sales.every((s) => s.total === 0) ? (
            <div className="text-sm text-ink-500 py-6 text-center">
              Sin ventas registradas en los últimos 12 meses.
            </div>
          ) : (
            <SalesChart data={sales} />
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-line flex items-center gap-2">
          <Activity className="h-4 w-4 text-ink-500" />
          <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
            Actividad reciente
          </h3>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-ink-500">Cargando actividad…</div>
        ) : activity.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Sin actividad reciente.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {activity.map((a, i) => (
              <li
                key={a.id ?? i}
                className="px-6 py-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-medium text-ink-900">
                    {a.title ?? "Actividad"}
                  </div>
                  {a.description && (
                    <div className="text-sm text-ink-500 mt-0.5">
                      {a.description}
                    </div>
                  )}
                </div>
                {a.at && (
                  <div className="text-xs text-ink-500 whitespace-nowrap">
                    {new Date(a.at).toLocaleString("es-MX")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SalesChart({ data }: { data: SalesPoint[] }) {
  const width = 720;
  const height = 220;
  const padX = 32;
  const padY = 28;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const max = Math.max(...data.map((d) => d.total), 1);
  const barW = chartW / data.length - 8;

  const fmtMxn = (n: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(n);

  const monthLabel = (m: string) => {
    const [y, mm] = m.split("-");
    const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${names[Number(mm) - 1] ?? mm}·${y.slice(2)}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Ventas por mes"
      >
        {/* baseline */}
        <line
          x1={padX}
          x2={width - padX}
          y1={height - padY}
          y2={height - padY}
          stroke="#E5E7EB"
        />
        {data.map((d, i) => {
          const h = (d.total / max) * chartH;
          const x = padX + i * (chartW / data.length) + 4;
          const y = height - padY - h;
          return (
            <g key={d.month}>
              <title>{`${monthLabel(d.month)} — ${fmtMxn(d.total)} (${d.count})`}</title>
              <rect
                x={x}
                y={y}
                width={Math.max(barW, 2)}
                height={h}
                rx={3}
                fill="#FBB601"
              />
              <text
                x={x + barW / 2}
                y={height - padY + 14}
                textAnchor="middle"
                fontSize="10"
                fill="#64748B"
              >
                {monthLabel(d.month)}
              </text>
            </g>
          );
        })}
        <text x={padX} y={16} fontSize="10" fill="#64748B">
          Máx: {fmtMxn(max)}
        </text>
      </svg>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RoleGate allow={["principal_admin","client","client_admin","subcontractor","employee"]}>
      <ReportsPageInner />
    </RoleGate>
  );
}
