"use client";

import { useEffect, useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";

type Appt = {
  id: string;
  requesterContactName: string;
  requesterEmail: string;
  requesterCompanyName?: string;
  purpose: string;
  scheduledAt: string;
  status: string;
  notes?: string;
};

const PURPOSE_LABEL: Record<string, string> = {
  demo: "Demo",
  consulting: "Consultoría",
  training: "Capacitación",
};

function statusPill(s: string) {
  const map: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    completed: "bg-canvas-2 text-ink-700",
    pending: "bg-amber-50 text-amber-700",
  };
  const label: Record<string, string> = {
    scheduled: "Agendada",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
    pending: "Pendiente",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        map[s] || "bg-canvas-2 text-ink-700"
      }`}
    >
      {label[s] || s}
    </span>
  );
}

export function AppointmentsList({
  endpoint,
  title,
  kicker,
}: {
  endpoint: string;
  title: string;
  kicker: string;
}) {
  const [items, setItems] = useState<Appt[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const d = await apiGet<Appt[]>(endpoint);
      setItems(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const setStatus = async (id: string, status: string) => {
    await apiPatch(`${endpoint}/${id}`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">{kicker}</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          {title}
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      <div className="space-y-3">
        {items.length === 0 && !err && (
          <div className="card-enterprise p-6 text-center text-ink-500 text-sm">
            Sin citas por ahora.
          </div>
        )}
        {items.map((a) => (
          <div key={a.id} className="card-enterprise p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(a.scheduledAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <h3 className="font-display text-lg text-ink-900 mt-1">
                  {a.requesterContactName}
                </h3>
                <p className="text-sm text-ink-700">
                  {a.requesterCompanyName || "Sin empresa"} ·{" "}
                  <span className="field-mono text-xs">{a.requesterEmail}</span>
                </p>
                {a.notes && (
                  <p className="text-xs text-ink-500 mt-2 whitespace-pre-wrap">
                    {a.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-canvas-2 text-ink-700 border border-line">
                    {PURPOSE_LABEL[a.purpose] || a.purpose}
                  </span>
                  {statusPill(a.status)}
                </div>
                {a.status !== "confirmed" && a.status !== "cancelled" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(a.id, "confirmed")}
                      className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Check className="h-3 w-3" /> Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(a.id, "cancelled")}
                      className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <X className="h-3 w-3" /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsList;
