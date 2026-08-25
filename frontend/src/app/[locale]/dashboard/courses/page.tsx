"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { courses, type Course } from "@/lib/courses";
import { cn } from "@/lib/cn";
import { imageForCourse } from "@/lib/images";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type EnrollmentRow = {
  id: string;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  progress?: number;
  status?: string;
};

function readLocalProgress(courseId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(
      `procheck_progress_${courseId}`,
    );
    if (!raw) return 0;
    const arr = JSON.parse(raw) as number[];
    return Math.round((arr.length / 5) * 100);
  } catch {
    return 0;
  }
}

export default function MyCoursesPage() {
  const [tab, setTab] = useState<"mis" | "disponibles">("mis");
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set(),
  );
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiGet<EnrollmentRow[] | { data: EnrollmentRow[] }>(
          "/enrollments/me",
        );
        const list = Array.isArray(res)
          ? res
          : Array.isArray((res as { data?: EnrollmentRow[] }).data)
          ? (res as { data: EnrollmentRow[] }).data
          : [];
        if (cancelled) return;
        setEnrollments(list);
        setEnrolledCourseIds(
          new Set(list.map((e) => e.courseId || "").filter(Boolean)),
        );
      } catch {
        // graceful fallback
        if (!cancelled) {
          setEnrollments([]);
          setEnrolledCourseIds(new Set());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const enrollFree = async (course: Course) => {
    try {
      await apiPost("/enrollments", { courseId: course.id });
      toast({
        title: "Inscripción exitosa",
        description: course.title,
        variant: "success",
      });
      router.push(`/dashboard/courses/${course.id}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo completar la inscripción";
      toast({
        title: "Error",
        description: msg,
        variant: "error",
      });
    }
  };

  const mineList =
    enrollments.length > 0
      ? enrollments.map((e) => {
          const course =
            courses.find((c) => c.id === e.courseId) ||
            courses.find((c) => c.code === e.courseCode);
          return { enrollment: e, course };
        })
      : [];

  const available = courses.filter(
    (c) => !enrolledCourseIds.has(c.id),
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="kicker mb-2">Mi capacitación</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Mis cursos.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Consulta tu avance y descarga certificados DC-3.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-line p-1 mb-6 bg-white">
        {(
          [
            { key: "mis", label: "Mis cursos" },
            { key: "disponibles", label: "Cursos disponibles" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 h-9 rounded-md text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-ink-900 text-white"
                : "text-ink-700 hover:bg-canvas-2",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mis" ? (
        loading ? (
          <div className="text-sm text-ink-500">Cargando tus cursos...</div>
        ) : mineList.length === 0 ? (
          <div className="bg-white border border-line rounded-xl p-10 text-center">
            <p className="kicker mb-2">Sin inscripciones</p>
            <h3 className="font-display text-xl font-semibold text-ink-900 tracking-tight">
              Aún no tienes cursos.
            </h3>
            <p className="mt-2 text-sm text-ink-700">
              Explora el catálogo y comienza tu certificación STPS.
            </p>
            <button
              onClick={() => setTab("disponibles")}
              className="btn-primary mt-5"
            >
              Ver cursos disponibles
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mineList.map(({ enrollment, course }) => {
              if (!course) return null;
              const localPct = readLocalProgress(course.id);
              const backendPct =
                typeof enrollment.progress === "number"
                  ? enrollment.progress
                  : 0;
              const progress = Math.max(localPct, backendPct);
              const isDone = progress >= 100;
              return (
                <Link
                  key={enrollment.id || course.id}
                  href={`/dashboard/courses/${enrollment.id || course.id}`}
                  className="bg-white border border-line rounded-xl overflow-hidden hover:border-line-strong transition-colors"
                >
                  <div className="relative aspect-video overflow-hidden bg-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageForCourse(course.code)}
                      alt={course.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center bg-white text-ink-900 border border-line rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase">
                      {course.code}
                    </span>
                    {isDone && (
                      <span className="absolute top-3 right-3 badge-status-success">
                        <CheckCircle2 className="h-3 w-3" /> Completado
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-ink-900 tracking-tight line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-ink-500 mb-4">
                      <Clock className="h-3.5 w-3.5" /> {course.hours} h
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-canvas-2 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            isDone ? "bg-success" : "bg-coral-500",
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-ink-500">
                        Progreso {progress}% ·{" "}
                        {isDone ? "Aprobado" : "En curso"}
                      </div>
                      <div className="pt-2 inline-flex items-center gap-2 text-sm font-medium text-coral-600">
                        <PlayCircle className="h-4 w-4" />
                        {isDone ? "Ver certificado" : "Continuar"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {available.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-line rounded-xl overflow-hidden"
            >
              <Link
                href={`/courses/${c.code}`}
                className="relative aspect-video overflow-hidden bg-ink-100 block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageForCourse(c.code)}
                  alt={c.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 inline-flex items-center bg-white text-ink-900 border border-line rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase">
                  {c.code}
                </span>
              </Link>
              <div className="p-4">
                <Link
                  href={`/courses/${c.code}`}
                  className="font-display text-base font-semibold text-ink-900 tracking-tight line-clamp-2 mb-2 hover:text-coral-600"
                >
                  <h3 className="inline">{c.title}</h3>
                </Link>
                <div className="flex items-center gap-2 text-xs text-ink-500 mb-4">
                  <Clock className="h-3.5 w-3.5" /> {c.hours} h
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-display text-xl font-semibold text-ink-900">
                    ${c.price.toLocaleString("es-MX")}
                  </span>
                  {c.tier === "basico" ? (
                    <button
                      className="btn-primary text-xs py-2 px-3"
                      onClick={() => enrollFree(c)}
                    >
                      Enrolarme gratis
                    </button>
                  ) : (
                    <Link
                      href={`/courses/${c.code}`}
                      className="btn-primary text-xs py-2 px-3"
                    >
                      Comprar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
