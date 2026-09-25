"use client";

import { useCallback, useEffect, useState } from "react";
import {
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
