"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "@/lib/api";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { RoleGate } from "@/components/RoleGate";

type Deal = {
  id: string;
  vendedorId?: string;
  leadId?: string | null;
  buyerName: string;
  package: string;
  amount: number;
  commissionPct: number;
  commissionAmount: number;
  closedAt: string;
  paidAt: string | null;
};

type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  expectedAmount?: number;
};

const PACKAGES = [
  { id: "basico", label: "Básico" },
  { id: "plus", label: "Plus" },
  { id: "enterprise", label: "Enterprise" },
  { id: "custom", label: "Custom" },
];

function mx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

type FormState = {
  leadId: string;
  buyerName: string;
  package: string;
  amount: number;
};

const EMPTY_FORM: FormState = {
  leadId: "",
  buyerName: "",
  package: "basico",
  amount: 0,
};

function DealsPageInner() {
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Deal | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiGet<Deal[]>("/sales/deals");
      setDeals(Array.isArray(d) ? d : []);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const d = await apiGet<Lead[]>("/sales/leads");
      setLeads(Array.isArray(d) ? d : []);
    } catch {
      setLeads([]);
    }
  }, []);

  useEffect(() => {
    load();
    loadLeads();
  }, [load, loadLeads]);

  const leadsById = useMemo(() => {
    const m: Record<string, Lead> = {};
    for (const l of leads) m[l.id] = l;
    return m;
  }, [leads]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!form.buyerName.trim()) {
      toast({ title: "Cliente requerido", variant: "error" });
      return;
    }
    if (!form.amount || form.amount <= 0) {
      toast({ title: "Monto inválido", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        buyerName: form.buyerName.trim(),
        package: form.package,
        amount: Number(form.amount),
      };
      if (form.leadId) payload.leadId = form.leadId;
      await apiPost("/sales/deals", payload);
      toast({ title: "Venta registrada", variant: "success" });
      setCreateOpen(false);
      load();
    } catch (e) {
      toast({
        title: "No se pudo registrar la venta",
        description: (e as Error).message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setEditForm({
      leadId: d.leadId || "",
      buyerName: d.buyerName,
      package: d.package,
      amount: Number(d.amount) || 0,
    });
  };

  const submitEdit = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        buyerName: editForm.buyerName.trim(),
        package: editForm.package,
        amount: Number(editForm.amount),
      };
      if (editForm.leadId) payload.leadId = editForm.leadId;
      await apiPatch(`/sales/deals/${editing.id}`, payload);
      toast({ title: "Venta actualizada", variant: "success" });
      setEditing(null);
      load();
    } catch (e) {
      toast({
        title: "No se pudo actualizar",
        description: (e as Error).message,
        variant: "error",
      });
    } finally {
      setEditSaving(false);
    }
  };

  const remove = async (d: Deal) => {
    if (
      !confirm(
        `¿Eliminar la venta de "${d.buyerName}" por ${mx(Number(d.amount))}?`,
      )
    )
      return;
    try {
      await apiDelete(`/sales/deals/${d.id}`);
      toast({ title: "Venta eliminada", variant: "success" });
      load();
    } catch (e) {
      toast({
        title: "No se pudo eliminar",
        description: (e as Error).message,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kicker mb-2">Ventas</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Ventas cerradas.
          </h1>
        </div>
        <button className="btn-primary inline-flex items-center gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nueva venta
        </button>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      {loading ? (
        <div className="card-enterprise p-6 text-sm text-ink-500">Cargando…</div>
      ) : (
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
                <th className="text-right px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-ink-500 text-center">
                    Aún no hay ventas. Crea la primera.
                  </td>
                </tr>
              )}
              {deals.map((d) => {
                const lead = d.leadId ? leadsById[d.leadId] : null;
                return (
                  <tr key={d.id} className="border-t border-line">
                    <td className="px-5 py-3 text-ink-900">
                      <div>{d.buyerName}</div>
                      {lead && (
                        <div className="text-xs text-ink-500 mt-0.5">
                          Lead: {lead.companyName}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-700">
                      {PACKAGES.find((p) => p.id === d.package)?.label || d.package}
                    </td>
                    <td className="px-5 py-3 text-right field-mono text-ink-900">
                      {mx(Number(d.amount))}
                    </td>
                    <td className="px-5 py-3 text-right field-mono text-ink-700">
                      {Number(d.commissionPct)}%
                    </td>
                    <td className="px-5 py-3 text-right field-mono text-coral-600">
                      {mx(Number(d.commissionAmount))}
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
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(d)}
                          className="p-1.5 rounded-lg text-ink-700 hover:bg-ink-100"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(d)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Registrar venta"
        size="md"
      >
        <div className="space-y-3">
          <div>
            <Label>Prospecto (opcional)</Label>
            <select
              value={form.leadId}
              onChange={(e) => {
                const l = leadsById[e.target.value];
                setForm((f) => ({
                  ...f,
                  leadId: e.target.value,
                  buyerName: l ? l.companyName : f.buyerName,
                  amount: l?.expectedAmount ? Number(l.expectedAmount) : f.amount,
                }));
              }}
              className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
            >
              <option value="">— Sin prospecto —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.companyName} · {l.contactName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Cliente *</Label>
            <Input
              value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
            />
          </div>
          <div>
            <Label>Paquete *</Label>
            <select
              value={form.package}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
              className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
            >
              {PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Monto (MXN) *</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="btn-secondary"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={submitCreate}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Registrar venta"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar venta"
        size="md"
      >
        {editing && (
          <div className="space-y-3">
            <div>
              <Label>Prospecto</Label>
              <select
                value={editForm.leadId}
                onChange={(e) =>
                  setEditForm({ ...editForm, leadId: e.target.value })
                }
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
              >
                <option value="">— Sin prospecto —</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.companyName} · {l.contactName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Cliente</Label>
              <Input
                value={editForm.buyerName}
                onChange={(e) =>
                  setEditForm({ ...editForm, buyerName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Paquete</Label>
              <select
                value={editForm.package}
                onChange={(e) =>
                  setEditForm({ ...editForm, package: e.target.value })
                }
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
              >
                {PACKAGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Monto (MXN)</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    amount: Number(e.target.value) || 0,
                  })
                }
              />
              <p className="mt-1 text-xs text-ink-500">
                Al modificar el monto se recalculará la comisión.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="btn-secondary"
                onClick={() => setEditing(null)}
                disabled={editSaving}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={submitEdit}
                disabled={editSaving}
              >
                {editSaving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function DealsPage() {
  return (
    <RoleGate allow={["principal_admin", "vendedor"]}>
      <DealsPageInner />
    </RoleGate>
  );
}
