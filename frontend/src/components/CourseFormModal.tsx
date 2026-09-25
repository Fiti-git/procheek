"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { industries, type Industry, type Course } from "@/lib/courses";
import { cn } from "@/lib/cn";

export type CourseFormValues = {
  code: string;
  title: string;
  description: string;
  hours: number;
  price: number;
  industry: Industry;
  tier: "basico" | "complementario";
  imageUrl: string;
};

const empty: CourseFormValues = {
  code: "",
  title: "",
  description: "",
  hours: 0,
  price: 0,
  industry: "general",
  tier: "basico",
  imageUrl: "",
};

export function CourseFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  mode,
  submitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CourseFormValues) => void | Promise<void>;
  initial?: Partial<Course> | null;
  mode: "create" | "edit";
  submitting?: boolean;
  error?: string | null;
}) {
  const [values, setValues] = useState<CourseFormValues>(empty);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        code: initial.code || "",
        title: initial.title || "",
        description: initial.description || "",
        hours: Number(initial.hours ?? 0),
        price: Number(initial.price ?? 0),
        industry: (initial.industry as Industry) || "general",
        tier: (initial.tier as "basico" | "complementario") || "basico",
        imageUrl:
          (initial as unknown as { imageUrl?: string }).imageUrl ||
          initial.image ||
          "",
      });
    } else {
      setValues(empty);
    }
  }, [open, initial]);

  if (!open) return null;

  const set = <K extends keyof CourseFormValues>(k: K, v: CourseFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {mode === "create" ? "Nuevo curso" : "Editar curso"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-500 hover:bg-canvas-2 hover:text-ink-900 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Código" required>
              <input
                type="text"
                required
                value={values.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="NOM-009"
                className={inputCls}
              />
            </Field>
            <Field label="Horas" required>
              <input
                type="number"
                required
                min={0}
                value={values.hours}
                onChange={(e) => set("hours", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Título" required>
            <input
              type="text"
              required
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="NOM-009-STPS Trabajos en altura"
              className={inputCls}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={cn(inputCls, "resize-none py-2")}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Precio (MXN)" required>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={values.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Industria" required>
              <select
                value={values.industry}
                onChange={(e) => set("industry", e.target.value as Industry)}
                className={inputCls}
              >
                {industries.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nivel" required>
              <select
                value={values.tier}
                onChange={(e) =>
                  set("tier", e.target.value as "basico" | "complementario")
                }
                className={inputCls}
              >
                <option value="basico">Básico</option>
                <option value="complementario">Complementario</option>
              </select>
            </Field>
          </div>

          <Field label="Imagen (URL o ruta)">
            <input
              type="text"
              value={values.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="/images/courses/NOM-009.jpg"
              className={inputCls}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-10 rounded-lg text-sm text-ink-700 hover:bg-canvas-2 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting
                ? "Guardando..."
                : mode === "create"
                  ? "Crear curso"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-ink-500 font-medium mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
