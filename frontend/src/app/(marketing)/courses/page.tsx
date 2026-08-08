import { ShieldAlert } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import CourseFilters from "@/components/CourseFilters";
import { courses } from "@/lib/courses";

export default function CoursesPage() {
  const sorted = [...courses].sort((a, b) => {
    if (a.tier === b.tier) return a.code.localeCompare(b.code);
    return a.tier === "basico" ? -1 : 1;
  });

  return (
    <div className="bg-canvas min-h-screen">
      <div className="container-page py-12 md:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="kicker mb-3">Catálogo NOM</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            Catálogo de cursos NOM.
          </h1>
          <p className="mt-3 text-ink-700 leading-relaxed">
            Cursos alineados a las NOM de la STPS. Emitimos certificado DC-3
            al aprobar la evaluación.
          </p>
        </div>

        {/* Tier tab bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "todos", label: "Todos", active: true },
            { key: "basicos", label: "Básicos", active: false },
            { key: "compl", label: "Complementarios", active: false },
          ].map((t) => (
            <button
              key={t.key}
              className={
                t.active
                  ? "px-4 h-9 rounded-full font-medium text-sm bg-ink-900 text-white"
                  : "px-4 h-9 rounded-full font-medium text-sm bg-white border border-line text-ink-700 hover:border-line-strong"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <CourseFilters />
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-500">
                Mostrando {sorted.length} cursos
              </span>
              <select className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink">
                <option>Ordenar por: Relevancia</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
                <option>Duración</option>
              </select>
            </div>
            {sorted.length === 0 ? (
              <div className="bg-white border border-line rounded-xl p-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full border border-line flex items-center justify-center text-ink-400 mb-4">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900 tracking-tight">
                  Sin resultados
                </h3>
                <p className="mt-2 text-sm text-ink-700">
                  Ajusta los filtros para ver más cursos.
                </p>
                <button className="btn-ghost mt-4">Limpiar filtros</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
