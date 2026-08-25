"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost, getCurrentUser } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

type LibraryDoc = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileType: string;
  fileUrl: string;
  fileSizeBytes: string | number | null;
  thumbnailUrl: string | null;
  nomReference: string | null;
  industry: string | null;
  isFree: boolean;
  price: string | number | null;
  isPublished: boolean;
  downloadCount: number;
};

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "nom_009", label: "NOM-009" },
  { value: "nom_017", label: "NOM-017" },
  { value: "nom_002", label: "NOM-002" },
  { value: "nom_019", label: "NOM-019" },
  { value: "nom_036", label: "NOM-036" },
  { value: "other", label: "Otros" },
];

const INDUSTRIES = [
  { value: "general", label: "General" },
  { value: "construccion", label: "Construcción" },
  { value: "quimica", label: "Química" },
  { value: "metalmecanica", label: "Metal-mecánica" },
  { value: "mineria", label: "Minería" },
];

const FILE_TYPES = ["pdf", "epub", "docx", "mp4", "other"];

type FormState = {
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileUrl: string;
  thumbnailUrl: string;
  nomReference: string;
  industry: string;
  isFree: boolean;
  price: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "general",
  fileType: "pdf",
  fileUrl: "",
  thumbnailUrl: "",
  nomReference: "",
  industry: "general",
  isFree: true,
  price: "",
};

export default function AdminLibraryPage() {
  const { toast } = useToast();
  const [role, setRole] = useState<string | null>(null);
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setRole(u?.role || null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<LibraryDoc[]>(
        "/library/documents?includeUnpublished=true",
      );
      setDocs(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "principal_admin") load();
  }, [role, load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (d: LibraryDoc) => {
    setEditingId(d.id);
    setForm({
      title: d.title,
      description: d.description ?? "",
      category: d.category,
      fileType: d.fileType,
      fileUrl: d.fileUrl,
      thumbnailUrl: d.thumbnailUrl ?? "",
      nomReference: d.nomReference ?? "",
      industry: d.industry ?? "general",
      isFree: d.isFree,
      price:
        d.price != null
          ? typeof d.price === "string"
            ? d.price
            : String(d.price)
          : "",
    });
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        fileType: form.fileType,
        fileUrl: form.fileUrl,
        thumbnailUrl: form.thumbnailUrl || undefined,
        nomReference: form.nomReference || undefined,
        industry: form.industry || undefined,
        isFree: form.isFree,
        price: form.isFree ? undefined : Number(form.price) || 0,
      };
      if (editingId) {
        await apiPatch(`/library/documents/${editingId}`, payload);
        toast({ title: "Documento actualizado", variant: "success" });
      } else {
        await apiPost("/library/documents", payload);
        toast({ title: "Documento creado", variant: "success" });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar";
      toast({ title: "Error al guardar", description: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (d: LibraryDoc) => {
    try {
      await apiPatch(`/library/documents/${d.id}`, {
        isPublished: !d.isPublished,
      });
      toast({
        title: d.isPublished ? "Documento despublicado" : "Documento publicado",
        variant: "success",
      });
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo actualizar";
      toast({ title: "Error", description: msg, variant: "error" });
    }
  };

  const remove = async (d: LibraryDoc) => {
    if (!window.confirm(`¿Eliminar el documento "${d.title}"?`)) return;
    try {
      await apiDelete(`/library/documents/${d.id}`);
      toast({ title: "Documento eliminado", variant: "success" });
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo eliminar";
      toast({ title: "Error", description: msg, variant: "error" });
    }
  };

  const totalRevenue = useMemo(
    () =>
      docs
        .filter((d) => !d.isFree)
        .reduce(
          (acc, d) =>
            acc + (typeof d.price === "string" ? Number(d.price) : d.price || 0),
          0,
        ),
    [docs],
  );

  if (role && role !== "principal_admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-enterprise p-8 text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-ink-50 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-ink-500" />
          </div>
          <p className="font-display text-lg text-ink-900">
            Solo administradores.
          </p>
          <p className="text-sm text-ink-500">
            Esta sección está reservada al equipo principal de PROCHECK.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="kicker mb-2">Administración</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Biblioteca.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Alta, edición y publicación de documentos, manuales y libros.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo documento
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card-enterprise p-4">
          <p className="field-mono text-ink-500">Documentos</p>
          <p className="font-display text-2xl text-ink-900 mt-1">
            {docs.length}
          </p>
        </div>
        <div className="card-enterprise p-4">
          <p className="field-mono text-ink-500">Publicados</p>
          <p className="font-display text-2xl text-ink-900 mt-1">
            {docs.filter((d) => d.isPublished).length}
          </p>
        </div>
        <div className="card-enterprise p-4">
          <p className="field-mono text-ink-500">Descargas totales</p>
          <p className="font-display text-2xl text-ink-900 mt-1">
            {docs.reduce((a, d) => a + (d.downloadCount || 0), 0)}
          </p>
        </div>
        <div className="card-enterprise p-4">
          <p className="field-mono text-ink-500">Ingresos potenciales</p>
          <p className="font-display text-2xl text-ink-900 mt-1">
            ${totalRevenue.toLocaleString("es-MX")}
          </p>
        </div>
      </div>

      {loading && (
        <div className="card-enterprise p-6 text-sm text-ink-500">
          Cargando documentos…
        </div>
      )}

      {!loading && error && (
        <div className="card-enterprise p-6 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-700">{error}</p>
          <button className="btn-secondary" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="card-enterprise overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-2 text-ink-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Título</th>
                  <th className="text-left px-4 py-3 font-medium">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Precio</th>
                  <th className="text-left px-4 py-3 font-medium">Descargas</th>
                  <th className="text-left px-4 py-3 font-medium">Publicado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const catLabel =
                    CATEGORIES.find((c) => c.value === d.category)?.label ||
                    d.category;
                  const priceLabel = d.isFree
                    ? "Gratis"
                    : `$${Number(d.price || 0).toLocaleString("es-MX")}`;
                  return (
                    <tr
                      key={d.id}
                      className="border-t border-line hover:bg-canvas-2/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink-900 line-clamp-1">
                          {d.title}
                        </div>
                        {d.nomReference && (
                          <div className="field-mono text-ink-500 mt-0.5">
                            {d.nomReference}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{catLabel}</td>
                      <td className="px-4 py-3 font-mono text-xs uppercase text-ink-700">
                        {d.fileType}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{priceLabel}</td>
                      <td className="px-4 py-3 text-ink-700">
                        {d.downloadCount}
                      </td>
                      <td className="px-4 py-3">
                        {d.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] px-2 py-0.5">
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 border border-line text-ink-500 text-[11px] px-2 py-0.5">
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 rounded-lg text-ink-500 hover:bg-canvas-2"
                            aria-label={
                              d.isPublished ? "Despublicar" : "Publicar"
                            }
                            title={d.isPublished ? "Despublicar" : "Publicar"}
                            onClick={() => togglePublish(d)}
                          >
                            {d.isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-ink-500 hover:bg-canvas-2"
                            aria-label="Editar"
                            title="Editar"
                            onClick={() => openEdit(d)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                            aria-label="Eliminar"
                            title="Eliminar"
                            onClick={() => remove(d)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {docs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-ink-500 text-sm"
                    >
                      Aún no hay documentos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar documento" : "Nuevo documento"}
        description="Los campos marcados son obligatorios."
        size="lg"
      >
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="md:col-span-2 text-sm">
            <span className="block mb-1 text-ink-700">Título</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="block mb-1 text-ink-700">Descripción</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-ink-700">Categoría</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-ink-700">Industria</span>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            >
              {INDUSTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-ink-700">Tipo de archivo</span>
            <select
              value={form.fileType}
              onChange={(e) => setForm({ ...form, fileType: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            >
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-ink-700">Referencia NOM</span>
            <input
              value={form.nomReference}
              onChange={(e) => setForm({ ...form, nomReference: e.target.value })}
              placeholder="NOM-009-STPS-2011"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="block mb-1 text-ink-700">URL del archivo</span>
            <input
              required
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://cdn.procheck.mx/library/archivo.pdf"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="block mb-1 text-ink-700">URL de miniatura</span>
            <input
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm({ ...form, thumbnailUrl: e.target.value })
              }
              placeholder="https://…"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500"
            />
          </label>
          <label className="text-sm flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
            />
            <span className="text-ink-700">Documento gratuito</span>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-ink-700">Precio (MXN)</span>
            <input
              type="number"
              min="0"
              step="1"
              disabled={form.isFree}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 focus:outline-none focus:border-coral-500 disabled:bg-canvas-2 disabled:text-ink-400"
            />
          </label>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
