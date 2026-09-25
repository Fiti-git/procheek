"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  Package,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  type Course,
  industries,
  type Industry,
  fetchCourses,
  normalizeCourse,
  type ApiCourse,
} from "@/lib/courses";
import { imageForCourse } from "@/lib/images";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";
import { RoleGate } from "@/components/RoleGate";
import { CourseFormModal, type CourseFormValues } from "@/components/CourseFormModal";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";

function AdminCoursesPageInner() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<Industry | "all">("all");
  const [tier, setTier] = useState<"all" | "basico" | "complementario">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchCourses();
      setItems(data);
    } catch (err) {
      setFetchError((err as Error).message || "No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((c) => {
        if (industry !== "all" && c.industry !== industry) return false;
        if (tier !== "all" && c.tier !== tier) return false;
        if (search) {
          const s = search.toLowerCase();
          if (
            !c.title.toLowerCase().includes(s) &&
            !c.code.toLowerCase().includes(s)
          )
            return false;
        }
        return true;
      }),
    [items, industry, tier, search],
  );

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setModalMode("edit");
    setEditing(c);
    setModalError(null);
    setModalOpen(true);
  };

  const buildPayload = (v: CourseFormValues) => ({
    code: v.code.trim(),
    title: v.title.trim(),
    description: v.description.trim() || undefined,
    hours: Number(v.hours) || 0,
    price: Number(v.price) || 0,
    industry: v.industry,
    tier: v.tier,
    imageUrl: v.imageUrl.trim() || undefined,
  });

  const handleSubmit = async (v: CourseFormValues) => {
    setSubmitting(true);
    setModalError(null);
    try {
      if (modalMode === "create") {
        const created = await apiPost<ApiCourse>("/courses", buildPayload(v));
        setItems((prev) => [normalizeCourse(created), ...prev]);
        toast({
          title: "Curso creado",
          description: `${created.code || v.code} se agregó al catálogo.`,
          variant: "success",
        });
      } else if (editing) {
        const updated = await apiPatch<ApiCourse>(
          `/courses/${editing.id}`,
          buildPayload(v),
        );
        const norm = normalizeCourse(updated);
        setItems((prev) => prev.map((c) => (c.id === editing.id ? norm : c)));
        toast({
          title: "Curso actualizado",
          description: `${norm.code} se guardó correctamente.`,
          variant: "success",
        });
      }
      setModalOpen(false);
    } catch (err) {
      setModalError((err as Error).message || "No se pudo guardar el curso");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Course) => {
    if (!window.confirm(`¿Eliminar el curso ${c.code}? Esta acción es reversible desde base de datos.`)) {
      return;
    }
    try {
      await apiDelete(`/courses/${c.id}`);
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      toast({
        title: "Curso eliminado",
        description: `${c.code} se retiró del catálogo.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: (err as Error).message || "Intenta de nuevo.",
        variant: "error",
      });
    }
  };

  const handleDuplicate = async (c: Course) => {
    try {
      const created = await apiPost<ApiCourse>("/courses", {
        code: `${c.code}-copia`,
        title: `${c.title} (copia)`,
        description: c.description,
        hours: c.hours,
        price: c.price,
        industry: c.industry,
        tier: c.tier,
        imageUrl: c.imageUrl,
      });
      setItems((prev) => [normalizeCourse(created), ...prev]);
      toast({
        title: "Curso duplicado",
        description: `Se creó ${created.code || c.code + "-copia"}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error al duplicar",
        description: (err as Error).message || "Intenta de nuevo.",
        variant: "error",
      });
    }
  };

  const totalHours = items.reduce((s, c) => s + c.hours, 0);
  const avgPrice = items.length
    ? Math.round(items.reduce((s, c) => s + c.price, 0) / items.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Administración</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Catálogo de cursos.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Gestiona los {items.length} cursos NOM disponibles en la plataforma.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo curso
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Cursos totales", value: `${items.length}`, icon: Package },
          { label: "Duración total", value: `${totalHours} h`, icon: Clock },
          {
            label: "Ingreso promedio",
            value: `$${avgPrice.toLocaleString("es-MX")} MXN`,
            icon: DollarSign,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white border border-line rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-2">
                {k.label}
              </div>
              <div className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
                {k.value}
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center">
              <k.icon className="h-5 w-5 text-coral-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-xl p-5 mb-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código"
              className="w-full pl-9 h-11 rounded-lg border border-line px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink"
            />
          </div>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as Industry | "all")}
            className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
          >
            <option value="all">Toda la industria</option>
            {industries.map((i) => (
              <option key={i.key} value={i.key}>
                {i.label}
              </option>
            ))}
          </select>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as typeof tier)}
            className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
          >
            <option value="all">Todos los niveles</option>
            <option value="basico">Básicos</option>
            <option value="complementario">Complementarios</option>
          </select>
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 rounded-lg border border-danger bg-danger-bg px-4 py-3 text-sm text-danger flex items-center justify-between">
          <span>{fetchError}</span>
          <button
            onClick={load}
            className="underline text-sm hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas-2">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Curso
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Industria
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Nivel
                </th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Duración
                </th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Precio
                </th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 rounded-md bg-canvas-2 animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-48 bg-canvas-2 animate-pulse rounded" />
                            <div className="h-2 w-20 bg-canvas-2 animate-pulse rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-3 w-20 bg-canvas-2 animate-pulse rounded" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-3 w-16 bg-canvas-2 animate-pulse rounded" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-3 w-10 bg-canvas-2 animate-pulse rounded ml-auto" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-3 w-16 bg-canvas-2 animate-pulse rounded ml-auto" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-3 w-20 bg-canvas-2 animate-pulse rounded ml-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-sm text-ink-500"
                  >
                    {items.length === 0
                      ? "Todavía no hay cursos. Crea el primero con Nuevo curso."
                      : "No hay cursos que coincidan con los filtros."}
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((c: Course) => (
                  <tr
                    key={c.id}
                    className="border-t border-line hover:bg-canvas-2 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 rounded-md overflow-hidden bg-ink-100 shrink-0 border border-line">
                          <Image
                            src={c.imageUrl || imageForCourse(c.code)}
                            alt={c.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                            quality={70}
                            unoptimized={
                              !!c.imageUrl && c.imageUrl.startsWith("http")
                            }
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink-900 line-clamp-1">
                            {c.title}
                          </div>
                          <div className="text-xs font-mono text-ink-500 mt-0.5">
                            {c.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge-compliance capitalize">
                        {industries.find((i) => i.key === c.industry)?.label ||
                          c.industry}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex text-xs font-semibold px-2 py-0.5 rounded",
                          c.tier === "basico"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100",
                        )}
                      >
                        {c.tier === "basico" ? "Básico" : "Complementario"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink-700">
                      {c.hours} h
                    </td>
                    <td className="px-5 py-3 text-right font-display font-semibold text-ink-900">
                      ${c.price.toLocaleString("es-MX")}
                    </td>
                    <td className="px-5 py-3 text-right relative">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/courses/${c.code}`}
                          title="Ver curso público"
                          className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-ink-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openEdit(c)}
                          title="Editar"
                          className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setOpenMenu((cur) => (cur === c.id ? null : c.id))
                          }
                          className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      {openMenu === c.id && (
                        <div className="absolute right-4 top-full z-20 mt-1 w-52 bg-white border border-line rounded-lg shadow-cardHover overflow-hidden text-left">
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              handleDuplicate(c);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-800 hover:bg-canvas-2"
                          >
                            <Plus className="h-4 w-4 text-ink-500" /> Duplicar
                            curso
                          </button>
                          <div className="h-px bg-line" />
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              handleDelete(c);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-line text-xs text-ink-500 flex items-center gap-2">
          {loading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" />
          )}
          Mostrando {filtered.length} de {items.length} cursos
        </div>
      </div>

      <CourseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        mode={modalMode}
        submitting={submitting}
        error={modalError}
      />
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <RoleGate allow={["principal_admin"]}>
      <AdminCoursesPageInner />
    </RoleGate>
  );
}
