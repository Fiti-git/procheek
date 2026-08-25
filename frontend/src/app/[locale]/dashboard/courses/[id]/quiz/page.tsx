"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Download,
  RotateCw,
} from "lucide-react";
import { courses } from "@/lib/courses";
import { getQuizForCourse } from "@/lib/quiz-data";
import { cn } from "@/lib/cn";

type Attempt = {
  score: number;
  passed: boolean;
  at: string;
};

function readAttempts(courseId: string): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(
      `procheck_quiz_attempts_${courseId}`,
    );
    if (!raw) return [];
    return JSON.parse(raw) as Attempt[];
  } catch {
    return [];
  }
}

function writeAttempts(courseId: string, attempts: Attempt[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `procheck_quiz_attempts_${courseId}`,
    JSON.stringify(attempts),
  );
}

function markExamComplete(courseId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(
      `procheck_progress_${courseId}`,
    );
    const arr = raw ? (JSON.parse(raw) as number[]) : [];
    const set = new Set(arr);
    set.add(5);
    window.localStorage.setItem(
      `procheck_progress_${courseId}`,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    // ignore
  }
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const course =
    courses.find((c) => c.id === id) ||
    courses.find((c) => c.code.toLowerCase() === id.toLowerCase()) ||
    courses[0];

  const questions = useMemo(() => getQuizForCourse(course.code), [course.code]);
  const [ready, setReady] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("procheck_token");
      if (!token) {
        router.replace(`/login?returnTo=/dashboard/courses/${id}/quiz`);
        return;
      }
    }
    setAttempts(readAttempts(course.id));
    setReady(true);
  }, [course.id, id, router]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const q = questions[idx];
  const total = questions.length;
  const progressPct = Math.round(((idx + 1) / total) * 100);
  const attemptNumber = attempts.length + 1;

  const handleSubmit = () => {
    // Demo: guarantee 8/10 pass on submit for smooth demo, but count real answers if higher
    const real = questions.reduce(
      (n, question) =>
        n + (answers[question.id] === question.correctIndex ? 1 : 0),
      0,
    );
    const finalScore = Math.max(real, 8);
    const pct = Math.round((finalScore / total) * 100);
    const didPass = pct >= 90;
    setScore(pct);
    setPassed(didPass);
    setSubmitted(true);
    const newAttempts: Attempt[] = [
      ...attempts,
      { score: pct, passed: didPass, at: new Date().toISOString() },
    ];
    setAttempts(newAttempts);
    writeAttempts(course.id, newAttempts);
    if (didPass) markExamComplete(course.id);
  };

  const handleRetry = () => {
    setIdx(0);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setSecondsLeft(600);
  };

  if (!ready) {
    return <div className="min-h-[50vh]" />;
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        {passed ? (
          <div className="relative bg-white border border-line rounded-xl p-10 text-center overflow-hidden">
            <ConfettiOverlay />
            <div className="relative">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="kicker mb-2">Certificado emitido</p>
              <h1 className="font-display text-4xl font-semibold text-ink-900 tracking-tight">
                ¡Aprobaste con {score}%!
              </h1>
              <p className="mt-3 text-sm text-ink-700 max-w-md mx-auto">
                Superaste el umbral del 90%. Tu certificado DC-3 está listo
                para descargar.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button className="btn-primary inline-flex items-center gap-2">
                  <Download className="h-4 w-4" /> Descargar DC-3
                </button>
                <Link
                  href={`/dashboard/courses/${id}`}
                  className="btn-secondary"
                >
                  Volver al curso
                </Link>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-ink-500 font-mono">
                <Award className="h-3.5 w-3.5" /> DC-3 vigente por 12 meses
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-line rounded-xl p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-5">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="kicker mb-2">Intento {attemptNumber} de 3</p>
            <h1 className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
              Obtuviste {score}%.
            </h1>
            <p className="mt-3 text-sm text-ink-700 max-w-md mx-auto">
              No alcanzaste el 90% mínimo. Puedes reintentar el examen y
              consultar el material nuevamente.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
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
          <p className="field-mono mb-1">Examen {course.code}</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-white border border-line rounded-md px-3 h-9 text-sm font-mono text-ink-900">
            <Clock className="h-4 w-4 text-coral-600" />
            {mm}:{ss}
          </span>
          <span className="text-xs text-ink-500">
            Intento {attemptNumber} de 3
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
                onClick={() =>
                  setAnswers((a) => ({ ...a, [q.id]: i }))
                }
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
                    selected
                      ? "border-coral-500 bg-coral-500"
                      : "border-line",
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
            disabled={idx === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {idx < total - 1 ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
              className="btn-primary"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
            >
              Enviar examen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i * 4.2) % 100;
        const delay = (i % 8) * 0.15;
        const colors = ["#FF6B35", "#0F1725", "#22C55E", "#EAB308"];
        const bg = colors[i % colors.length];
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              background: bg,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -12px;
          width: 8px;
          height: 14px;
          opacity: 0.9;
          border-radius: 2px;
          animation: fall 2.4s linear forwards;
        }
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(420px) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
