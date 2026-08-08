"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Check,
  ChevronRight,
  Lock,
  Award,
  Download,
} from "lucide-react";
import { courses } from "@/lib/courses";
import { imageForCourse } from "@/lib/images";
import { getModulesForCourse } from "@/lib/course-modules";
import { cn } from "@/lib/cn";

function readProgress(courseId: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(
      `procheck_progress_${courseId}`,
    );
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeProgress(courseId: string, done: Set<number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `procheck_progress_${courseId}`,
    JSON.stringify(Array.from(done)),
  );
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(1);

  // Resolve course by id or code
  const course =
    courses.find((c) => c.id === id) ||
    courses.find((c) => c.code.toLowerCase() === id.toLowerCase()) ||
    courses[0];

  useEffect(() => {
    // Auth gate
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("procheck_token");
      if (!token) {
        router.replace(`/login?returnTo=/dashboard/courses/${id}`);
        return;
      }
    }
    const initial = readProgress(course.id);
    setDone(initial);
    const nextIncomplete = [1, 2, 3, 4, 5].find((n) => !initial.has(n)) || 5;
    setCurrent(nextIncomplete);
    setReady(true);
  }, [course.id, id, router]);

  const modules = getModulesForCourse(course);
  const total = modules.length;
  const progressPct = Math.round((done.size / total) * 100);
  const currentModule = modules.find((m) => m.index === current) || modules[0];
  const examDone = done.has(5);
  const canStartExam = done.has(4) && !done.has(5);

  const markComplete = () => {
    const next = new Set(done);
    next.add(current);
    setDone(next);
    writeProgress(course.id, next);
    if (current < 4) setCurrent(current + 1);
  };

  const src = imageForCourse(course.code);

  if (!ready) {
    return <div className="min-h-[50vh]" />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-4">
        <Link href="/dashboard/courses" className="hover:text-ink-900">
          Mis cursos
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono text-ink-700">{course.code}</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight leading-tight">
          {course.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 max-w-xl">
          <div className="flex-1 h-2 bg-canvas-2 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                examDone ? "bg-success" : "bg-coral-500",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-ink-700 w-16 text-right">
            {progressPct}% completado
          </span>
        </div>
      </div>

      {examDone ? (
        <div className="bg-white border border-line rounded-xl p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
            <Award className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="kicker mb-2">Certificado emitido</p>
          <h2 className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
            ¡Completaste el curso!
          </h2>
          <p className="mt-3 text-sm text-ink-700 max-w-md mx-auto">
            Tu certificado DC-3 ha sido emitido. Puedes descargarlo o
            consultarlo desde tu panel de certificados.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-primary inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Descargar DC-3
            </button>
            <Link href="/dashboard/courses" className="btn-secondary">
              Volver a mis cursos
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Player */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-ink-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="h-16 w-16 rounded-full bg-white/90 border border-white shadow-cardHover flex items-center justify-center">
                  <Play className="h-6 w-6 text-coral-600 fill-coral-600 ml-1" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 font-mono text-xs text-white/90 bg-black/40 px-2 py-1 rounded">
                Módulo {current} · {currentModule.duration}
              </div>
            </div>

            <div className="mt-6 bg-white border border-line rounded-xl p-6">
              <p className="field-mono mb-2">
                Módulo {current} de {total}
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
                {currentModule.title}
              </h2>
              <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                {currentModule.description}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {current === 5 ? (
                  <Link
                    href={`/dashboard/courses/${id}/quiz`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Comenzar examen
                  </Link>
                ) : done.has(current) ? (
                  <button
                    disabled
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Módulo completado
                  </button>
                ) : (
                  <button
                    onClick={markComplete}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Marcar completado
                  </button>
                )}
                {canStartExam && (
                  <Link
                    href={`/dashboard/courses/${id}/quiz`}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    Comenzar examen
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Module list */}
          <aside className="lg:col-span-4">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line">
                <p className="kicker">Contenido</p>
                <h3 className="font-display text-base font-semibold text-ink-900 tracking-tight mt-1">
                  {total} módulos
                </h3>
              </div>
              <ul className="divide-y divide-line">
                {modules.map((m) => {
                  const isDone = done.has(m.index);
                  const isCurrent = current === m.index;
                  const isLocked =
                    m.isExam && !done.has(4);
                  return (
                    <li key={m.index}>
                      <button
                        type="button"
                        onClick={() => !isLocked && setCurrent(m.index)}
                        disabled={isLocked}
                        className={cn(
                          "w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-canvas transition-colors",
                          isCurrent && "bg-canvas",
                          isLocked && "opacity-60 cursor-not-allowed",
                        )}
                      >
                        <span
                          className={cn(
                            "flex-none h-7 w-7 rounded-md flex items-center justify-center font-mono text-xs font-semibold",
                            isDone
                              ? "bg-success text-white"
                              : isCurrent
                              ? "bg-coral-500 text-ink-900"
                              : "bg-canvas-2 text-ink-700",
                          )}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4" />
                          ) : isLocked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            m.index
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink-900 leading-snug">
                            {m.title}
                          </div>
                          <div className="text-[11px] font-mono text-ink-500 mt-0.5">
                            {m.duration}
                            {m.isExam && " · Examen"}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
