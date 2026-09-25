"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X, AlertCircle, Search, Pencil, Eye, Trash2 } from "lucide-react";
import { apiGet, apiPatch, apiPost, apiDelete, getCurrentUser } from "@/lib/api";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { RoleGate } from "@/components/RoleGate";

type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
  expectedAmount: number;
  industry: string;
  notes: string;
  createdAt: string;
};

type Vendor = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
};

const STATUSES = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "propuesta", label: "Propuesta" },
  { id: "cerrado_ganado", label: "Cerrado ganado" },
  { id: "cerrado_perdido", label: "Cerrado perdido" },
];

function mx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

type FormState = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  expectedAmount: number;
  notes: string;
  status: string;
  vendedorId: string;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  industry: "",
  expectedAmount: 0,
  notes: "",
  status: "nuevo",
  vendedorId: "",
};

function LeadsPageInner() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isAdmin = currentUser?.role === "principal_admin";
  const { toast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({});
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [detail, setDetail] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    try {
      const d = await apiGet<Lead[]>("/sales/leads");
      setLeads(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const loadVendors = async () => {
    if (!isAdmin) return;
    try {
      // Backend GET /users returns all users for principal_admin.
      // Filter client-side to vendedor role since there is no ?role= query param.
      const users = await apiGet<Vendor[]>("/users");
      const list = Array.isArray(users) ? users : [];
      setVendors(list.filter((u) => u.role === "vendedor"));
    } catch (e) {
      // Non-fatal — admin will just see an empty dropdown and inline error.
      console.error("[leads] failed to load vendors:", (e as Error).message);
    }
  };

  useEffect(() => {
    load();
    loadVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const ql = search.trim().toLowerCase();
    return leads
      .filter((l) => (filter === "all" ? true : l.status === filter))
      .filter((l) => {
        if (!ql) return true;
        return (
          l.companyName.toLowerCase().includes(ql) ||
          l.contactName.toLowerCase().includes(ql) ||
          (l.contactEmail || "").toLowerCase().includes(ql)
        );
      });
  }, [leads, filter, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormErr(null);
    setFieldErrs({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = "Requerido";
    if (!form.contactName.trim()) errs.contactName = "Requerido";
    if (
      form.contactEmail.trim() &&
      !/.+@.+\..+/.test(form.contactEmail.trim())
    ) {
      errs.contactEmail = "Correo inválido";
    }
    if (isAdmin && !form.vendedorId) {
      errs.vendedorId = "Selecciona un vendedor";
    }
    setFieldErrs(errs);
    return Object.keys(errs).length === 0;
  };

  const create = async () => {
    setFormErr(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        industry: form.industry.trim() || undefined,
        expectedAmount: form.expectedAmount || undefined,
        notes: form.notes.trim() || undefined,
        status: form.status,
      };
      if (form.contactEmail.trim()) payload.contactEmail = form.contactEmail.trim();
      if (form.contactPhone.trim()) payload.contactPhone = form.contactPhone.trim();
      if (isAdmin) {
        payload.vendedorId = form.vendedorId;
      }
      await apiPost("/sales/leads", payload);
      setOpenForm(false);
      resetForm();
      load();
    } catch (e) {
      const msg = (e as Error).message || "No se pudo crear el prospecto";
      setFormErr(msg);
      // Surface known backend validation to the right field.
      if (/vendedorId/i.test(msg)) {
        setFieldErrs((f) => ({ ...f, vendedorId: msg }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    await apiPatch(`/sales/leads/${id}`, { status });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar prospecto? Esta acción no se puede deshacer.")) return;
    try {
      await apiDelete(`/sales/leads/${id}`);
      toast({ title: "Prospecto eliminado", variant: "success" });
      load();
    } catch (e) {
      toast({
        title: "Error al eliminar",
        description: (e as Error).message,
        variant: "error",
      });
    }
  };

  const openEdit = (l: Lead) => {
    setEditing(l);
    setEditForm({
      companyName: l.companyName,
      contactName: l.contactName,
      contactEmail: l.contactEmail || "",
      contactPhone: l.contactPhone || "",
      industry: l.industry || "",
      expectedAmount: Number(l.expectedAmount) || 0,
      notes: l.notes || "",
      status: l.status,
      vendedorId: "",
    });
  };

  const submitEdit = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        companyName: editForm.companyName.trim(),
        contactName: editForm.contactName.trim(),
        contactEmail: editForm.contactEmail.trim() || undefined,
        contactPhone: editForm.contactPhone.trim() || undefined,
        industry: editForm.industry.trim() || undefined,
        expectedAmount: editForm.expectedAmount || undefined,
        notes: editForm.notes.trim() || undefined,
        status: editForm.status,
      };
      await apiPatch(`/sales/leads/${editing.id}`, payload);
      toast({ title: "Prospecto actualizado", variant: "success" });
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
          onClick={() => {
            setOpenForm((v) => !v);
            if (!openForm) resetForm();
          }}
          className="btn-primary inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Añadir prospecto
        </button>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {openForm && (
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink-900">Nuevo prospecto</h2>
            <button
              type="button"
              onClick={() => {
                setOpenForm(false);
                resetForm();
              }}
              className="text-ink-500 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formErr && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{formErr}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {isAdmin && (
              <div className="md:col-span-2">
                <Label>Vendedor asignado *</Label>
                <select
                  value={form.vendedorId}
                  onChange={(e) =>
                    setForm({ ...form, vendedorId: e.target.value })
                  }
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10 ${
                    fieldErrs.vendedorId ? "border-red-400" : "border-line"
                  }`}
                >
                  <option value="">— Selecciona un vendedor —</option>
                  {vendors.map((v) => {
                    const name =
                      [v.firstName, v.lastName].filter(Boolean).join(" ") ||
                      v.email;
                    return (
                      <option key={v.id} value={v.id}>
                        {name} ({v.email})
                      </option>
                    );
                  })}
                </select>
                {fieldErrs.vendedorId && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrs.vendedorId}
                  </p>
                )}
                {vendors.length === 0 && (
                  <p className="mt-1 text-xs text-ink-500">
                    No hay vendedores registrados. Invita uno desde Equipo.
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Empresa *</Label>
              <Input
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                aria-invalid={!!fieldErrs.companyName}
              />
              {fieldErrs.companyName && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrs.companyName}
                </p>
              )}
            </div>
            <div>
              <Label>Nombre del contacto *</Label>
              <Input
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
                placeholder="p. ej. María López"
                aria-invalid={!!fieldErrs.contactName}
              />
              {fieldErrs.contactName && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrs.contactName}
                </p>
              )}
            </div>
            <div>
              <Label>Correo del contacto</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
                placeholder="contacto@empresa.com"
                aria-invalid={!!fieldErrs.contactEmail}
              />
              {fieldErrs.contactEmail && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrs.contactEmail}
                </p>
              )}
            </div>
            <div>
              <Label>Teléfono del contacto</Label>
              <Input
                type="tel"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
                placeholder="+52 55 1234 5678"
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
              onClick={() => {
                setOpenForm(false);
                resetForm();
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={create}
              disabled={
                submitting ||
                !form.companyName ||
                !form.contactName ||
                (isAdmin && !form.vendedorId)
              }
            >
              {submitting ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div className="card-enterprise p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por empresa, contacto o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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
                <td className="px-5 py-3 text-ink-700">
                  <div>{l.contactName}</div>
                  {(l.contactEmail || l.contactPhone) && (
                    <div className="text-xs text-ink-500 mt-0.5">
                      {l.contactEmail}
                      {l.contactEmail && l.contactPhone ? " · " : ""}
                      {l.contactPhone}
                    </div>
                  )}
                </td>
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
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setDetail(l)}
                      className="p-1.5 rounded-lg text-ink-700 hover:bg-ink-100"
                      aria-label="Ver detalle"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(l)}
                      className="p-1.5 rounded-lg text-ink-700 hover:bg-ink-100"
                      aria-label="Editar"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      aria-label="Eliminar"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar prospecto"
        size="lg"
      >
        {editing && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Empresa</Label>
                <Input
                  value={editForm.companyName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, companyName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Contacto</Label>
                <Input
                  value={editForm.contactName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Correo</Label>
                <Input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactPhone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Industria</Label>
                <Input
                  value={editForm.industry}
                  onChange={(e) =>
                    setEditForm({ ...editForm, industry: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Monto estimado</Label>
                <Input
                  type="number"
                  value={editForm.expectedAmount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      expectedAmount: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Estado</Label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Notas</Label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
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

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detalle del prospecto"
        size="md"
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Empresa" value={detail.companyName} />
            <DetailRow label="Contacto" value={detail.contactName} />
            <DetailRow label="Correo" value={detail.contactEmail || "Sin dato"} />
            <DetailRow label="Teléfono" value={detail.contactPhone || "Sin dato"} />
            <DetailRow label="Industria" value={detail.industry || "Sin dato"} />
            <DetailRow
              label="Monto estimado"
              value={mx(Number(detail.expectedAmount) || 0)}
            />
            <DetailRow
              label="Estado"
              value={
                STATUSES.find((s) => s.id === detail.status)?.label ||
                detail.status
              }
            />
            <DetailRow
              label="Creado"
              value={
                detail.createdAt
                  ? new Date(detail.createdAt).toLocaleDateString("es-MX")
                  : "-"
              }
            />
            {detail.notes && (
              <div className="pt-2">
                <p className="text-ink-500 text-xs uppercase tracking-widest mb-1">
                  Notas
                </p>
                <p className="text-ink-800 whitespace-pre-wrap">{detail.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button className="btn-secondary" onClick={() => setDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <span className="text-ink-500 text-xs uppercase tracking-widest">{label}</span>
      <span className="text-ink-900 text-right">{value}</span>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <RoleGate allow={["principal_admin","vendedor"]}>
      <LeadsPageInner />
    </RoleGate>
  );
}
