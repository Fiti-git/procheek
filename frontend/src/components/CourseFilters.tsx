"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { industries as allIndustries, type Industry } from "@/lib/course-types";

const durationBuckets = [
  { key: "lt2", label: "Menos de 2 h" },
  { key: "2-4", label: "2 a 4 h" },
  { key: "4-8", label: "4 a 8 h" },
  { key: "gt8", label: "Más de 8 h" },
];

export function CourseFilters({ industries }: { industries?: Industry[] }) {
  const [price, setPrice] = useState(1000);

  // When the parent passes the industries present in the current catalog,
  // filter the full list to only those keys so empty sections disappear.
  const visibleIndustries =
    industries && industries.length > 0
      ? allIndustries.filter((i) => industries.includes(i.key))
      : allIndustries;

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white border border-line rounded-xl p-6 space-y-7 h-fit sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
          Filtros
        </h3>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
          Nivel
        </h4>
        <ul className="space-y-1.5">
          {[
            { key: "basico", label: "Básico" },
            { key: "complementario", label: "Complementario" },
          ].map((t) => (
            <li key={t.key}>
              <label className="flex items-center gap-2.5 text-sm text-ink-700 hover:text-ink-900 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line accent-ink"
                />
                {t.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
          Precio
        </h4>
        <input
          type="range"
          min={0}
          max={1200}
          step={50}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-ink"
        />
        <div className="flex items-center justify-between text-xs text-ink-500 mt-1">
          <span>$0</span>
          <span>${price} MXN</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
          Duración
        </h4>
        <ul className="space-y-1.5">
          {durationBuckets.map((d) => (
            <li key={d.key}>
              <label className="flex items-center gap-2.5 text-sm text-ink-700 hover:text-ink-900 py-1 cursor-pointer">
                <input
                  type="radio"
                  name="duration"
                  className="h-4 w-4 border-line accent-ink"
                />
                {d.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
          Industria
        </h4>
        <ul className="space-y-1.5">
          {visibleIndustries.map((i) => (
            <li key={i.key}>
              <label className="flex items-center gap-2.5 text-sm text-ink-700 hover:text-ink-900 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line accent-ink"
                />
                {i.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <button className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-ink-700 hover:text-coral-500 transition-colors">
        <X className="h-3.5 w-3.5" /> Limpiar filtros
      </button>
    </aside>
  );
}

export default CourseFilters;
