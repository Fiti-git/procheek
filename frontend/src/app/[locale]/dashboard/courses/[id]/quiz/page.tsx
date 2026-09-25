"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

type ApiCourse = {
  id: string;
  code: string | null;
  title: string | null;
};

type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
};

type QuizPayload = { questions: QuizQuestion[] };

type SubmitResult = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  wrongQuestions: string[];
};

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [error, setError] = useState<string | null>(null);

  // Auth guard + initial fetch.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("procheck_token");
      if (!token) {
        router.replace(`/login?returnTo=/dashboard/courses/${id}/quiz`);
        return;
      }
    }
    let cancelled = false;
    (async () => {
      try {
        // Resolve course by id (uuid) or code.
        let c: ApiCourse | null = null;
        try {
          c = await apiGet<ApiCourse>(`/courses/${id}`);
        } catch {
          try {
            c = await apiGet<ApiCourse>(`/courses/code/${id}`);
          } catch {
            c = null;
          }
        }
        if (!c) throw new Error("Curso no encontrado");
        if (cancelled) return;
        setCourse(c);
        const q = await apiGet<QuizPayload>(`/courses/${c.id}/quiz`);
        if (cancelled) return;
        setQuestions(q.questions || []);
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || "No se pudo cargar el examen");
          setReady(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  // Countdown timer — only while quiz is in progress.
  useEffect(() => {
    if (result || !ready || questions.length === 0) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [result, ready, questions.length]);

  const total = questions.length;
  const q = questions[idx];
  const progressPct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const handleSubmit = async () => {
    if (!course) return;
    setSubmitting(true);
    try {
      const res = await apiPost<SubmitResult>(
        `/courses/${course.id}/quiz/submit`,
        { answers },
      );
      setResult(res);
      setAttempts((a) => a + 1);
      if (res.passed) {
        toast({
          title: "¡Aprobaste el examen!",
          description: "Tu certificado se está emitiendo.",
          variant: "success",
        });
        // Redirect to certificates after 3s per spec.
        window.setTimeout(() => {
          router.push(`/dashboard/certificates`);
        }, 3000);
      } else {
        toast({
          title: "No alcanzaste el 90%",
          description: `Puntaje: ${res.score}%. Puedes reintentar.`,
          variant: "error",
        });
      }
    } catch (err) {
      toast({
        title: "No se pudo enviar el examen",
        description: (err as Error).message,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setIdx(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(600);
  };

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        Cargando examen…
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          No se pudo cargar el examen
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          {error || "No hay preguntas disponibles para este curso."}
        </p>
        <Link
          href={`/dashboard/courses/${id}`}
          className="btn-primary mt-6 inline-flex"
        >
          Volver al curso
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        {result.passed ? (
          <div className="bg-white border border-line rounded-xl p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="kicker mb-2">Examen aprobado</p>
            <h1 className="font-display text-4xl font-semibold text-ink-900 tracking-tight">
              ¡Aprobaste con {result.score}%!
            </h1>
            <p className="mt-3 text-sm text-ink-700 max-w-md mx-auto">
              Respondiste correctamente {result.correct} de {result.total}.
              Tu certificado se emitirá automáticamente. Redirigiendo…
            </p>
            <div className="mt-8 flex items-center justify-center text-ink-500 text-xs">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Preparando tu DC-3…
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/certificates" className="btn-primary">
                Ir a mis certificados
              </Link>
              <Link
                href={`/dashboard/courses/${id}`}
                className="btn-secondary"
              >
                Volver al curso
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-line rounded-xl p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-5">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="kicker mb-2">Intento {attempts}</p>
            <h1 className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
              Obtuviste {result.score}%
            </h1>
            <p className="mt-3 text-sm text-ink-700 max-w-md mx-auto">
              Necesitas al menos 90% para aprobar. Respondiste correctamente{" "}
              {result.correct} de {result.total}.
            </p>
            {result.wrongQuestions.length > 0 && (
              <div className="mt-6 text-left max-w-md mx-auto">
                <p className="text-xs font-mono text-ink-500 mb-2">
                  Preguntas incorrectas:
                </p>
                <ul className="space-y-1 text-sm text-ink-700">
                  {result.wrongQuestions.map((qid) => {
                    const question = questions.find((qq) => qq.id === qid);
                    return (
                      <li
                        key={qid}
                        className="flex items-start gap-2 border border-line rounded-md px-3 py-2"
                      >
                        <XCircle className="h-4 w-4 text-red-500 flex-none mt-0.5" />
                        <span>{question?.text ?? qid}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetry}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" /> Reintentar examen
              </button>
              <Link
                href={`/dashboard/courses/${id}`}
                className="btn-secondary"
              >
                Repasar contenido
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="field-mono mb-1">
            Examen {course?.code ?? ""}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight">
            {course?.title ?? "Evaluación final"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-white border border-line rounded-md px-3 h-9 text-sm font-mono text-ink-900">
            <Clock className="h-4 w-4 text-coral-600" />
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 h-2 bg-canvas-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-coral-500 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-ink-700 w-24 text-right">
          Pregunta {idx + 1} de {total}
        </span>
      </div>

      <div className="bg-white border border-line rounded-xl p-6 md:p-8">
        <p className="field-mono mb-3">Pregunta {idx + 1}</p>
        <h2 className="font-display text-xl md:text-2xl font-semibold text-ink-900 tracking-tight leading-snug">
          {q.text}
        </h2>

        <div className="mt-6 space-y-2">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3",
                  selected
                    ? "border-ink-900 bg-canvas"
                    : "border-line bg-white hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex-none flex items-center justify-center",
                    selected ? "border-coral-500 bg-coral-500" : "border-line",
                  )}
                >
                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm text-ink-900">{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0 || submitting}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {idx < total - 1 ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
              className="btn-primary"
              disabled={submitting}
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar examen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
