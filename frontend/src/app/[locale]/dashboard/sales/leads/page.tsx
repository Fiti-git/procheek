"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/lib/api";
import { Input, Label } from "@/components/ui/Input";

type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  status: string;
  expectedAmount: number;
  industry: string;
  notes: string;
  createdAt: string;
};

const STATUSES = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "propuesta", label: "Propuesta" },
  { id: "cerrado_ganado", label: "Cerrado ganado" },
  { id: "cerrado_perdido", label: "Cerrado perdido" },
];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    nuevo: "bg-canvas-2 text-ink-700",
    contactado: "bg-blue-50 text-blue-700",
    propuesta: "bg-amber-50 text-amber-700",
    cerrado_ganado: "bg-emerald-50 text-emerald-700",
    cerrado_perdido: "bg-red-50 text-red-700",
  };
  const label = STATUSES.find((x) => x.id === s)?.label || s;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        map[s] || "bg-canvas-2 text-ink-700"
      }`}
    >
      {label}
    </span>
  );
}

function mx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [err, setErr] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    industry: "",
    expectedAmount: 0,
    notes: "",
    status: "nuevo",
  });

  const load = async () => {
    try {
      const d = await apiGet<Lead[]>("/sales/leads");
      setLeads(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const create = async () => {
    try {
      await apiPost("/sales/leads", form);
      setOpenForm(false);
      setForm({
        companyName: "",
        contactName: "",
        industry: "",
        expectedAmount: 0,
        notes: "",
        status: "nuevo",
      });
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    await apiPatch(`/sales/leads/${id}`, { status });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar prospecto?")) return;
    await apiDelete(`/sales/leads/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kicker mb-2">Prospectos</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Tu pipeline.
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setOpenForm((v) => !v)}
          className="btn-primary inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Añadir prospecto
        </button>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      {openForm && (
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink-900">Nuevo prospecto</h2>
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="text-ink-500 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Empresa</Label>
              <Input
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contacto</Label>
              <Input
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Industria</Label>
              <Input
                value={form.industry}
                onChange={(e) =>
                  setForm({ ...form, industry: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Monto estimado (MXN)</Label>
              <Input
                type="number"
                value={form.expectedAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expectedAmount: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notas</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpenForm(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={create}
              disabled={!form.companyName || !form.contactName}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-full border ${
            filter === "all"
              ? "border-coral-500 bg-coral-50 text-ink-900"
              : "border-line bg-white text-ink-700"
          }`}
        >
          Todos ({leads.length})
        </button>
        {STATUSES.map((s) => {
          const count = leads.filter((l) => l.status === s.id).length;
          const active = filter === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilter(s.id)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                active
                  ? "border-coral-500 bg-coral-50 text-ink-900"
                  : "border-line bg-white text-ink-700"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="card-enterprise overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas-2">
            <tr className="text-xs uppercase tracking-widest text-ink-500">
              <th className="text-left px-5 py-3 font-medium">Empresa</th>
              <th className="text-left px-5 py-3 font-medium">Contacto</th>
              <th className="text-left px-5 py-3 font-medium">Industria</th>
              <th className="text-right px-5 py-3 font-medium">Monto</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-right px-5 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-ink-500 text-center">
                  Sin prospectos en este filtro.
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink-900">{l.companyName}</td>
                <td className="px-5 py-3 text-ink-700">{l.contactName}</td>
                <td className="px-5 py-3 text-ink-500">{l.industry}</td>
                <td className="px-5 py-3 text-right field-mono text-ink-900">
                  {mx(l.expectedAmount)}
                </td>
                <td className="px-5 py-3">
                  <select
                    value={l.status}
                    onChange={(e) => changeStatus(l.id, e.target.value)}
                    className="text-xs bg-white border border-line rounded-md px-2 py-1"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
