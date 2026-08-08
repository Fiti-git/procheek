"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  CheckCircle,
  Video,
  FileText,
  Award,
  RefreshCw,
  Mail,
  Lock,
  ShieldCheck,
  BadgeCheck,
  Scale,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { courses } from "@/lib/courses";
import { imageForCourse, IMG } from "@/lib/images";
import { getModulesForCourse, getLearningOutcomes } from "@/lib/course-modules";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import CourseCard from "@/components/CourseCard";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { add } = useCart();
  const { toast } = useToast();

  const course =
    courses.find((c) => c.code.toLowerCase() === slug.toLowerCase()) ||
    courses.find((c) => c.id === slug);

  if (!course) {
    return (
      <div className="bg-canvas min-h-screen">
        <div className="container-page py-24 text-center">
          <div className="mx-auto h-14 w-14 rounded-full border border-line flex items-center justify-center text-ink-400 mb-5">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <p className="kicker mb-3">Sin resultados</p>
          <h1 className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
            Curso no encontrado.
          </h1>
          <p className="mt-3 text-sm text-ink-700">
            El curso que buscas no existe o fue movido.
          </p>
          <Link href="/courses" className="btn-primary mt-6 inline-flex">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const src = imageForCourse(course.code);
  const modules = getModulesForCourse(course);
  const outcomes = getLearningOutcomes(course);
  const related = courses
    .filter((c) => c.industry === course.industry && c.id !== course.id)
    .slice(0, 3);

  const handleAdd = () => {
    add({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      price: course.price,
      image: src,
    });
    toast({
      title: "Añadido al carrito",
      description: course.title,
      variant: "success",
    });
  };

  const handleBuy = () => {
    add({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      price: course.price,
      image: src,
    });
    router.push("/cart");
  };

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="container-page py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6">
            <Link href="/courses" className="hover:text-ink-900">
              Cursos
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-mono text-ink-700">{course.code}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <p className="field-mono mb-3">
                {course.code} · STPS 2011 · {course.hours} horas
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="mt-4 text-base text-ink-700 leading-relaxed max-w-xl">
                {course.description ||
                  "Programa de capacitación alineado a la norma vigente STPS con evaluación y emisión de certificado DC-3."}{" "}
                Formación práctica y evaluación con 90% mínimo aprobatorio.
              </p>

              {/* Instructor */}
              <div className="mt-6 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.avatar3}
                  alt="Instructor"
                  className="h-10 w-10 rounded-full object-cover border border-line"
                />
                <div>
                  <div className="text-sm text-ink-900 font-medium">
                    Impartido por Ing. Fernando Reyes Ortega
                  </div>
                  <div className="text-xs font-mono text-ink-500">
                    STPS · ACE-2025-0142
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-coral-500 text-coral-500"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink-900">4.9</span>
                <span className="text-sm text-ink-500">· 127 opiniones</span>
              </div>

              {/* Includes */}
              <div className="mt-8">
                <p className="kicker mb-3">Este curso incluye</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { icon: Video, text: `Video HD narrado (${course.hours} horas)` },
                    { icon: FileText, text: "5 módulos con materiales descargables" },
                    { icon: Award, text: "Examen final con 90% mínimo" },
                    { icon: BadgeCheck, text: "Certificado DC-3 emitido en 24 horas" },
                    { icon: RefreshCw, text: "Recertificación anual automática" },
                    { icon: Mail, text: "Soporte por correo con tu instructor" },
                  ].map((it) => (
                    <li key={it.text} className="flex items-start gap-2">
                      <it.icon className="h-4 w-4 text-coral-600 mt-0.5 flex-none" />
                      <span className="text-ink-700">{it.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Purchase card */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white border border-line rounded-xl overflow-hidden shadow-cardHover">
                <div className="relative aspect-video bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={course.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center bg-white text-ink-900 border border-line rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase">
                    {course.code}
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="font-display text-4xl font-semibold text-ink-900 tracking-tight">
                      ${course.price.toLocaleString("es-MX")}
                    </span>
                    <span className="text-sm text-ink-500 ml-2">MXN + IVA</span>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="btn-primary w-full"
                    >
                      Añadir al carrito
                    </button>
                    <button
                      type="button"
                      onClick={handleBuy}
                      className="btn-secondary w-full"
                    >
                      Comprar ahora
                    </button>
                  </div>
                  <p className="mt-4 font-mono text-[11px] text-ink-500">
                    Certificado STPS · Válido 12 meses · Envío digital
                  </p>

                  <div className="mt-5 pt-5 border-t border-line grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-ink-700" />
                      <span className="text-[10px] text-ink-500 leading-tight">
                        STPS Registrado
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <BadgeCheck className="h-4 w-4 text-ink-700" />
                      <span className="text-[10px] text-ink-500 leading-tight">
                        DC-3 Verificado
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Scale className="h-4 w-4 text-ink-700" />
                      <span className="text-[10px] text-ink-500 leading-tight">
                        LFPDPPP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="border-b border-line">
        <div className="container-page py-14 md:py-20">
          <p className="kicker mb-3">Contenido del curso</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight max-w-2xl">
            Los 5 módulos que cubre este curso.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {modules.map((m) => (
              <div
                key={m.index}
                className="bg-white border border-line rounded-xl p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-coral-500 text-ink-900 font-mono text-sm font-semibold">
                    {m.index}
                  </span>
                  {m.isExam && (
                    <Lock className="h-4 w-4 text-ink-500" />
                  )}
                </div>
                <h3 className="font-display text-base font-semibold text-ink-900 tracking-tight leading-snug mb-3 flex-1">
                  {m.title}
                </h3>
                <div className="text-xs font-mono text-ink-500">
                  {m.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning outcomes */}
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 md:py-20">
          <p className="kicker mb-3">Al completar este curso</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight max-w-2xl">
            Podrás demostrar competencia en...
          </h2>

          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {outcomes.map((o) => (
              <li
                key={o}
                className="flex items-start gap-3 p-4 border border-line rounded-lg bg-canvas"
              >
                <CheckCircle className="h-5 w-5 text-coral-600 flex-none mt-0.5" />
                <span className="text-sm text-ink-700 leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-line">
        <div className="container-page py-14 md:py-20">
          <p className="kicker mb-3">Testimonios</p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight max-w-2xl mb-8">
            Lo que dicen quienes ya se certificaron.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: "Laura Méndez",
                role: "Coord. de SST · Grupo Industrial Sonora",
                quote:
                  "Contenido claro y práctico. El examen realmente evalúa lo aprendido y el DC-3 llegó al día siguiente.",
                img: IMG.avatar1,
              },
              {
                name: "Rubén Ortiz",
                role: "Supervisor de obra · Constructora del Bajío",
                quote:
                  "Nos permitió certificar a 22 trabajadores en dos semanas. La plataforma es directa y sin trámites extra.",
                img: IMG.avatar2,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white border border-line rounded-xl p-6"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-coral-500 text-coral-500"
                    />
                  ))}
                </div>
                <p className="text-ink-700 leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover border border-line"
                  />
                  <div>
                    <div className="text-sm font-medium text-ink-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-ink-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-b border-line bg-white">
          <div className="container-page py-14 md:py-20">
            <p className="kicker mb-3">También te podría interesar</p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight max-w-2xl mb-8">
              Cursos relacionados de tu industria.
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <CourseCard key={r.id} course={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-canvas-2">
        <div className="container-page py-16 md:py-20 text-center">
          <p className="kicker mb-3">Empieza hoy</p>
          <h3 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight max-w-2xl mx-auto">
            Empieza hoy y certifícate en {course.hours} horas.
          </h3>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary w-full sm:w-auto"
            >
              Añadir al carrito
            </button>
            <button
              type="button"
              onClick={handleBuy}
              className="btn-secondary w-full sm:w-auto"
            >
              Comprar ahora
            </button>
          </div>
          <p className="mt-4 font-mono text-[11px] text-ink-500">
            Certificado STPS · Válido 12 meses · Envío digital
          </p>
        </div>
      </section>
    </div>
  );
}
