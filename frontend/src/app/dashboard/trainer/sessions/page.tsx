"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Session = {
  id: string;
  title: string;
  scheduledAt: string;
  deliveredAt: string | null;
  attendeeCount: number;
  location: string;
  status: string;
};

function statusPill(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    scheduled: { label: "Agendada", cls: "bg-blue-50 text-blue-700" },
    delivered: { label: "Impartida", cls: "bg-emerald-50 text-emerald-700" },
    cancelled: { label: "Cancelada", cls: "bg-red-50 text-red-700" },
    in_progress: { label: "En curso", cls: "bg-amber-50 text-amber-700" },
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

export default function SessionsPage() {
  const [items, setItems] = useState<Session[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiGet<Session[]>("/training/sessions");
        setItems(Array.isArray(d) ? d : []);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const sorted = [...items].sort((a, b) =>
    (b.scheduledAt || "").localeCompare(a.scheduledAt || ""),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Sesiones</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Sesiones programadas e impartidas.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      <div className="card-enterprise overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas-2">
            <tr className="text-xs uppercase tracking-widest text-ink-500">
              <th className="text-left px-5 py-3 font-medium">Sesión</th>
              <th className="text-left px-5 py-3 font-medium">Agendada</th>
              <th className="text-left px-5 py-3 font-medium">Impartida</th>
              <th className="text-left px-5 py-3 font-medium">Ubicación</th>
              <th className="text-right px-5 py-3 font-medium">Asistentes</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-ink-500 text-center">
                  Sin sesiones registradas.
                </td>
              </tr>
            )}
            {sorted.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink-900">{s.title}</td>
                <td className="px-5 py-3 text-ink-700">
                  {new Date(s.scheduledAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {s.deliveredAt
                    ? new Date(s.deliveredAt).toLocaleDateString("es-MX")
                    : "-"}
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {s.location || "Por definir"}
                </td>
                <td className="px-5 py-3 text-right field-mono text-ink-900">
                  {s.attendeeCount}
                </td>
                <td className="px-5 py-3">{statusPill(s.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
