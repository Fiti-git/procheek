"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, XCircle } from "lucide-react";
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

type Session = {
  id: string;
  title: string;
  scheduledAt: string;
  deliveredAt: string | null;
  attendeeCount: number;
  location: string | null;
  durationHours: number | null;
  status: string;
  notes?: string | null;
  courseId?: string | null;
};

type Course = { id: string; slug: string; titleEs: string };

function statusPill(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    scheduled: { label: "Agendada", cls: "bg-blue-50 text-blue-700" },
    delivered: { label: "Impartida", cls: "bg-emerald-50 text-emerald-700" },
    canceled: { label: "Cancelada", cls: "bg-red-50 text-red-700" },
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

type FormState = {
  title: string;
  scheduledAt: string;
  attendeeCount: number;
  location: string;
  durationHours: number;
  courseId: string;
  notes: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  scheduledAt: "",
  attendeeCount: 0,
  location: "",
  durationHours: 4,
  courseId: "",
  notes: "",
  status: "scheduled",
};

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function SessionsPageInner() {
  const { toast } = useToast();
  const [items, setItems] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Session | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiGet<Session[]>("/training/sessions");
      setItems(Array.isArray(d) ? d : []);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    (async () => {
      try {
        const c = await apiGet<any[]>("/courses");
        setCourses(
          (c || []).map((x: any) => ({
            id: x.id,
            slug: x.slug,
            titleEs: x.titleEs ?? x.title_es ?? x.slug,
          })),
        );
      } catch {
        setCourses([]);
      }
    })();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!form.title.trim()) {
      toast({ title: "Título requerido", variant: "error" });
      return;
    }
    if (!form.scheduledAt) {
      toast({ title: "Fecha requerida", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        attendeeCount: form.attendeeCount || 0,
        location: form.location.trim() || undefined,
        durationHours: form.durationHours || undefined,
        notes: form.notes.trim() || undefined,
      };
      if (form.courseId) payload.courseId = form.courseId;
      await apiPost("/training/sessions", payload);
      toast({ title: "Sesión creada", variant: "success" });
      setCreateOpen(false);
      load();
    } catch (e) {
      toast({
        title: "No se pudo crear la sesión",
        description: (e as Error).message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s: Session) => {
    setEditing(s);
    setEditForm({
      title: s.title,
      scheduledAt: s.scheduledAt ? toDatetimeLocal(s.scheduledAt) : "",
      attendeeCount: Number(s.attendeeCount) || 0,
      location: s.location || "",
      durationHours: Number(s.durationHours) || 4,
      courseId: s.courseId || "",
      notes: s.notes || "",
      status: s.status || "scheduled",
    });
  };

  const submitEdit = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: editForm.title.trim(),
        scheduledAt: editForm.scheduledAt
          ? new Date(editForm.scheduledAt).toISOString()
          : undefined,
        attendeeCount: editForm.attendeeCount,
        location: editForm.location.trim() || undefined,
        durationHours: editForm.durationHours,
        notes: editForm.notes.trim() || undefined,
        status: editForm.status,
      };
      await apiPatch(`/training/sessions/${editing.id}`, payload);
      toast({ title: "Sesión actualizada", variant: "success" });
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

  const cancelSession = async (s: Session) => {
    if (!confirm(`¿Cancelar la sesión "${s.title}"?`)) return;
    try {
      await apiPatch(`/training/sessions/${s.id}`, { status: "canceled" });
      toast({ title: "Sesión cancelada", variant: "success" });
      load();
    } catch (e) {
      toast({
        title: "No se pudo cancelar",
        description: (e as Error).message,
        variant: "error",
      });
    }
  };

  const remove = async (s: Session) => {
    if (
      !confirm(
        `¿Eliminar la sesión "${s.title}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      await apiDelete(`/training/sessions/${s.id}`);
      toast({ title: "Sesión eliminada", variant: "success" });
      load();
    } catch (e) {
      toast({
        title: "No se pudo eliminar",
        description: (e as Error).message,
        variant: "error",
      });
    }
  };

  const sorted = [...items].sort((a, b) =>
    (b.scheduledAt || "").localeCompare(a.scheduledAt || ""),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kicker mb-2">Sesiones</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Sesiones programadas e impartidas.
          </h1>
        </div>
        <button className="btn-primary inline-flex items-center gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nueva sesión
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
                <th className="text-left px-5 py-3 font-medium">Sesión</th>
                <th className="text-left px-5 py-3 font-medium">Agendada</th>
                <th className="text-left px-5 py-3 font-medium">Impartida</th>
                <th className="text-left px-5 py-3 font-medium">Ubicación</th>
                <th className="text-right px-5 py-3 font-medium">Asistentes</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-right px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-ink-500 text-center">
                    Aún no hay sesiones. Crea la primera.
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
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg text-ink-700 hover:bg-ink-100"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {s.status !== "canceled" && s.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => cancelSession(s)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                          aria-label="Cancelar"
                          title="Cancelar sesión"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(s)}
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
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nueva sesión de capacitación"
        size="md"
      >
        <div className="space-y-3">
          <div>
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. NOM-009 en obra – turno matutino"
            />
          </div>
          <div>
            <Label>Fecha y hora *</Label>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duración (horas)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={form.durationHours}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationHours: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Asistentes</Label>
              <Input
                type="number"
                min="0"
                value={form.attendeeCount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendeeCount: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div>
            <Label>Curso</Label>
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
            >
              <option value="">— Sin curso vinculado —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titleEs}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Ubicación</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ej. Planta industrial Naucalpan"
            />
          </div>
          <div>
            <Label>Notas</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
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
              {saving ? "Creando…" : "Crear sesión"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar sesión"
        size="md"
      >
        {editing && (
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Fecha y hora</Label>
              <Input
                type="datetime-local"
                value={editForm.scheduledAt}
                onChange={(e) =>
                  setEditForm({ ...editForm, scheduledAt: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duración (horas)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.durationHours}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      durationHours: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Asistentes</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.attendeeCount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      attendeeCount: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Estado</Label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
              >
                <option value="scheduled">Agendada</option>
                <option value="delivered">Impartida</option>
                <option value="canceled">Cancelada</option>
              </select>
            </div>
            <div>
              <Label>Notas</Label>
              <textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                rows={2}
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
              />
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

export default function SessionsPage() {
  return (
    <RoleGate allow={["principal_admin", "capacitador"]}>
      <SessionsPageInner />
    </RoleGate>
  );
}
