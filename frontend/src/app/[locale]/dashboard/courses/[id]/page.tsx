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
import { CourseImage } from "@/components/CourseImage";
import { apiGet, apiPatch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";

type ApiModule = {
  id: string;
  courseId: string;
  position: number;
  titleEs: string;
  titleEn?: string | null;
  contentType: "text" | "video" | "url" | "file";
  contentUrl: string | null;
  contentBody: string | null;
  durationMin: number | null;
};

type ApiCourse = {
  id: string;
  code: string | null;
  title: string | null;
  titleEs?: string | null;
  hours?: number;
  price?: number;
};

type ApiEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progressPct: number;
};

type ApiCertificate = {
  id: string;
  code: string;
  dc3Folio: string | null;
  courseId: string;
  userId: string;
  issuedAt: string;
  expiresAt: string | null;
};

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

function certPdfUrl(folio: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:5000/api`
      : "");
  return `${base}/certificates/${encodeURIComponent(folio)}/pdf`;
}

function fmtDuration(min: number | null): string {
  if (!min) return "";
  if (min >= 60) return `${Math.floor(min / 60)} h ${min % 60}m`;
  return `${min} min`;
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(1);
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [apiCourse, setApiCourse] = useState<ApiCourse | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [certificate, setCertificate] = useState<ApiCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fallback static course (used if API call fails or params id is a code)
  const fallbackCourse =
    courses.find((c) => c.id === id) ||
    courses.find((c) => c.code.toLowerCase() === id.toLowerCase()) ||
    courses[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("procheck_token");
      if (!token) {
        router.replace(`/login?returnTo=/dashboard/courses/${id}`);
        return;
      }
    }
    let cancelled = false;
    (async () => {
      try {
        // Try to fetch by id first, then by code
        let course: ApiCourse | null = null;
        try {
          course = await apiGet<ApiCourse>(`/courses/${id}`);
        } catch {
          try {
            course = await apiGet<ApiCourse>(`/courses/code/${id}`);
          } catch {
            course = null;
          }
        }
        if (!course) {
          // Use fallback so page still renders
          course = { id: fallbackCourse.id, code: fallbackCourse.code, title: fallbackCourse.title };
        }
        if (cancelled) return;
        setApiCourse(course);
        const mods = await apiGet<ApiModule[]>(`/courses/${course.id}/modules`);
        if (cancelled) return;
        setModules(Array.isArray(mods) ? mods : []);

        // Fetch enrollments and match by courseId.
        let backendPct = 0;
        try {
          const enrollments = await apiGet<ApiEnrollment[]>(`/enrollments/me`);
          const match = Array.isArray(enrollments)
            ? enrollments.find((e) => e.courseId === course!.id)
            : null;
          if (match) {
            setEnrollmentId(match.id);
            backendPct = match.progressPct || 0;
          }
        } catch {
          // No enrollment yet — user might be previewing. Silently ignore.
        }

        // If a cert already exists for this course, load it up-front so the
        // "Descargar DC-3" link resolves without waiting for a re-fetch.
        try {
          const certs = await apiGet<ApiCertificate[]>(`/certificates/me`);
          const cert = Array.isArray(certs) ? certs.find((c) => c.courseId === course!.id) : null;
          if (cert) setCertificate(cert);
        } catch {
          // Non-fatal.
        }

        const positions = mods.map((m) => m.position).sort((a, b) => a - b);
        const total = positions.length;
        const local = readProgress(course.id);

        // Merge backend as source of truth: derive N completed positions from pct.
        const backendCount = total > 0 ? Math.floor((backendPct / 100) * total) : 0;
        let merged: Set<number>;
        if (backendCount > local.size) {
          merged = new Set(positions.slice(0, backendCount));
          writeProgress(course.id, merged);
        } else {
          merged = local;
        }
        setDone(merged);
        const nextIncomplete = positions.find((p) => !merged.has(p)) || positions[positions.length - 1] || 1;
        setCurrent(nextIncomplete);
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || "No se pudo cargar el curso");
          setReady(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id, router, fallbackCourse.id, fallbackCourse.code, fallbackCourse.title]);

  const course = apiCourse || { id: fallbackCourse.id, code: fallbackCourse.code, title: fallbackCourse.title };
  const total = modules.length;
  const progressPct = total ? Math.round((done.size / total) * 100) : 0;
  const currentModule = modules.find((m) => m.position === current) || modules[0];
  const examPosition = modules.length > 0 ? modules[modules.length - 1].position : 5;
  const examDone = done.has(examPosition);
  const preExamPositions = modules.filter((m) => m.position < examPosition).map((m) => m.position);
  const canStartExam = preExamPositions.every((p) => done.has(p)) && !examDone;
  const isExamModule = currentModule?.position === examPosition;

  const syncProgress = async (pct: number) => {
    if (!enrollmentId) return;
    setSyncing(true);
    try {
      await apiPatch(`/enrollments/${enrollmentId}/progress`, { progressPct: pct });
      // If we just hit 100, refetch certificates to grab the freshly-issued one.
      if (pct >= 100) {
        try {
          const certs = await apiGet<ApiCertificate[]>(`/certificates/me`);
          const cert = Array.isArray(certs) ? certs.find((c) => c.courseId === course.id) : null;
          if (cert) setCertificate(cert);
        } catch {
          // Non-fatal — user can also open the certificates panel.
        }
      }
    } catch (err) {
      toast({
        title: "No se pudo sincronizar el avance",
        description: (err as Error).message,
        variant: "error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const markComplete = () => {
    if (!currentModule) return;
    const next = new Set(done);
    next.add(currentModule.position);
    setDone(next);
    writeProgress(course.id, next);
    const pct = total > 0 ? Math.round((next.size / total) * 100) : 0;
    // Fire-and-forget backend sync — never block UI on network.
    void syncProgress(pct);
    const nextPos = modules.find((m) => m.position > currentModule.position && !next.has(m.position))?.position;
    if (nextPos && nextPos < examPosition) setCurrent(nextPos);
  };

  const src = imageForCourse(course.code || fallbackCourse.code);

  if (!ready) {
    return <div className="min-h-[50vh] flex items-center justify-center text-ink-500">Cargando curso...</div>;
  }
  if (error && modules.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900">No se pudo cargar el curso</h1>
        <p className="mt-2 text-sm text-ink-700">{error}</p>
        <Link href="/dashboard/courses" className="btn-primary mt-6 inline-flex">
          Volver a mis cursos
        </Link>
      </div>
    );
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
          {course.title || course.code}
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
          {syncing && (
            <span className="text-[11px] font-mono text-ink-500 whitespace-nowrap">
              Sincronizando…
            </span>
          )}
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
            {certificate ? (
              <a
                href={certPdfUrl(certificate.dc3Folio || certificate.code)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Descargar DC-3
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="btn-primary inline-flex items-center gap-2 opacity-70 cursor-not-allowed"
                title="El certificado se está emitiendo…"
              >
                <Download className="h-4 w-4" /> Emitiendo certificado…
              </button>
            )}
            <Link href="/dashboard/certificates" className="btn-secondary">
              Ver mis certificados
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-ink-900">
              <CourseImage
                src={(course as { imageUrl?: string | null }).imageUrl || src}
                code={course.code || fallbackCourse.code}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover opacity-50"
                quality={90}
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="h-16 w-16 rounded-full bg-white/90 border border-white shadow-cardHover flex items-center justify-center">
                  <Play className="h-6 w-6 text-coral-600 fill-coral-600 ml-1" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 font-mono text-xs text-white/90 bg-black/40 px-2 py-1 rounded">
                Módulo {current} · {fmtDuration(currentModule?.durationMin ?? null)}
              </div>
            </div>

            <div className="mt-6 bg-white border border-line rounded-xl p-6">
              <p className="field-mono mb-2">
                Módulo {current} de {total}
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
                {currentModule?.titleEs}
              </h2>
              {currentModule?.contentBody && (
                <div className="mt-4 text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                  {currentModule.contentBody}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {isExamModule ? (
                  <Link
                    href={`/dashboard/courses/${id}/quiz`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Comenzar examen
                  </Link>
                ) : done.has(currentModule?.position ?? 0) ? (
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
                {canStartExam && !isExamModule && (
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
                  const isDone = done.has(m.position);
                  const isCurrent = current === m.position;
                  const isExam = m.position === examPosition;
                  const isLocked = isExam && !preExamPositions.every((p) => done.has(p));
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => !isLocked && setCurrent(m.position)}
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
                            m.position
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink-900 leading-snug">
                            {m.titleEs}
                          </div>
                          <div className="text-[11px] font-mono text-ink-500 mt-0.5">
                            {fmtDuration(m.durationMin)}
                            {isExam && " · Examen"}
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
