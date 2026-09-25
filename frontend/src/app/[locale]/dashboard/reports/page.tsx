"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Activity,
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

function ReportsPageInner() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Summary>("/analytics/summary");
      setSummary(data);
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

      {/* Line chart — sample data */}
      <div className="bg-white border border-line rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
              Ventas por mes (12 meses)
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              Monto facturado por periodo
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 border border-line text-ink-500 text-[11px] px-2 py-0.5">
            <TrendingUp className="h-3 w-3" /> Datos de muestra
          </span>
        </div>
        <div className="relative h-64 rounded-lg bg-canvas-2 overflow-hidden">
          <svg
            viewBox="0 0 600 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {[40, 80, 120, 160].map((y) => (
              <line
                key={y}
                x1="0"
                x2="600"
                y1={y}
                y2={y}
                stroke="#0F1725"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}
            <polyline
              fill="rgba(251,182,1,0.15)"
              stroke="none"
              points="0,160 50,140 100,150 150,120 200,110 250,90 300,95 350,70 400,80 450,55 500,45 550,30 600,20 600,200 0,200"
            />
            <polyline
              fill="none"
              stroke="#0F1725"
              strokeWidth="2"
              points="0,160 50,140 100,150 150,120 200,110 250,90 300,95 350,70 400,80 450,55 500,45 550,30 600,20"
            />
            {[
              [0, 160],
              [100, 150],
              [200, 110],
              [300, 95],
              [400, 80],
              [500, 45],
              [600, 20],
            ].map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="4"
                fill="#FBB601"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            ))}
          </svg>
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

export default function ReportsPage() {
  return (
    <RoleGate allow={["principal_admin","client","client_admin","subcontractor","employee"]}>
      <ReportsPageInner />
    </RoleGate>
  );
}
