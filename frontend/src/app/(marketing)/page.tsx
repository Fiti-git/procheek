"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Check,
  PlayCircle,
  FileText,
  GraduationCap,
  RefreshCw,
  Play,
  Calendar,
  BarChart3,
  Users,
  ClipboardCheck,
  TrendingUp,
  Gift,
  Star,
  X,
} from "lucide-react";
import { IMG } from "@/lib/images";
import { DC3Card } from "@/components/DC3Card";

function ProductPreview() {
  const checklist = [
    "Capacitación al día",
    "Equipos de protección",
    "Señalización correcta",
    "Procedimientos seguros",
    "Documentación completa",
    "Cumplimiento STPS",
  ];
  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden shadow-cardHover aspect-[4/5] sm:aspect-[4/3] bg-ink-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG.heroMain}
          alt="Trabajador de construcción con casco y chaleco de seguridad usando una tableta en obra"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent" />
      </div>

      <div
        className="absolute top-6 right-2 sm:-right-6 w-[240px] sm:w-[280px] bg-white rounded-2xl shadow-2xl border border-line p-5"
        style={{ transform: "rotate(2deg)" }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <span className="font-display font-bold text-ink-900 tracking-tight">
            CHECK LIST
          </span>
          <ClipboardCheck className="h-5 w-5 text-[#F97316]" />
        </div>
        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shrink-0">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-ink-800 font-medium">{item}</span>
            </li>
          ))}
        </ul>
        <div
          className="absolute -bottom-3 -right-3 border-2 border-emerald-600 text-emerald-600 font-display font-bold text-sm tracking-widest px-3 py-1 rounded bg-white"
          style={{ transform: "rotate(-10deg)" }}
        >
          APROBADO
        </div>
      </div>
    </div>
  );
}

const coursePlayerModules = [
  { n: 1, title: "Introducción a NOM-009", state: "done" },
  { n: 2, title: "Sistemas de restricción", state: "active" },
  { n: 3, title: "Anclajes y conexiones", state: "pending" },
  { n: 4, title: "Rescate en altura", state: "pending" },
  { n: 5, title: "Examen final · 90% mínimo", state: "pending" },
];

function CoursePlayerMock() {
  return (
    <div className="bg-ink-900 text-white rounded-2xl border border-ink-800 shadow-cardHover overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3 bg-ink-800">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="font-mono text-xs text-ink-300 bg-ink-900 border border-ink-700 rounded-md px-3 py-1">
            app.procheck.mx/cursos/nom-009/modulo-2
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-0">
        <div className="md:col-span-2 p-4">
          <div className="relative aspect-video rounded-lg overflow-hidden photo-duotone">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.course_altura} alt="Reproductor de curso" />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#F97316] shadow-cardHover flex items-center justify-center">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
              <div
                className="h-full bg-[#F97316] rounded-full"
                style={{ width: "68%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ink-300">
              <span>Módulo 2 de 5 · Sistemas de restricción</span>
              <span>12:34 / 18:45</span>
            </div>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-ink-800 p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-400 font-medium mb-3">
            Módulos del curso
          </div>
          <ul className="space-y-2">
            {coursePlayerModules.map((m) => (
              <li
                key={m.n}
                className={`flex items-center gap-2 text-xs leading-tight ${
                  m.state === "active"
                    ? "text-[#F97316] font-medium"
                    : m.state === "done"
                      ? "text-emerald-400"
                      : "text-ink-300"
                }`}
              >
                <span className="font-mono text-[10px] w-4 shrink-0">
                  {m.n}.
                </span>
                <span className="flex-1">{m.title}</span>
                {m.state === "done" && (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                )}
                {m.state === "active" && (
                  <span className="text-[9px] font-mono uppercase tracking-wider bg-[#F97316]/20 border border-[#F97316]/40 px-1.5 py-0.5 rounded shrink-0">
                    En vivo
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const featureBlocks = [
  {
    heading: "Aprende a tu propio ritmo con cursos NOM completos",
    text: "Accede a más de 24 cursos NOM-STPS diseñados por capacitadores certificados. Cada curso incluye módulos, evaluaciones y material descargable para revisar cuando quieras.",
    image: IMG.chemical,
    alt: "Trabajadores tomando capacitación NOM en planta industrial",
    imageLeft: true,
  },
  {
    heading: "Estudia desde cualquier lugar con conexión a internet",
    text: "Plataforma 100% en la nube. Tus empleados pueden completar su capacitación desde una computadora, tableta o teléfono, en la obra, oficina o casa.",
    image: IMG.heroSoftware,
    alt: "Trabajador industrial revisando capacitación desde tableta en obra",
    imageLeft: false,
  },
  {
    heading: "Recibe soporte 1:1 de nuestros capacitadores",
    text: "Nuestro equipo de capacitadores registrados ante la STPS está disponible para resolver dudas técnicas, sesiones grupales por videollamada y auditorías de cumplimiento.",
    image: IMG.avatar3,
    alt: "Capacitador STPS certificado con casco y equipo de protección",
    imageLeft: true,
  },
];

const pricingTiers = [
  {
    name: "Básico",
    monthly: "$2,490",
    annual: "$24,900",
    features: [
      { text: "Hasta 25 empleados", included: true },
      { text: "Acceso a 10 cursos NOM", included: true },
      { text: "Certificados DC-3 automáticos", included: true },
      { text: "Reportes básicos", included: true },
      { text: "Soporte por correo", included: true },
    ],
    ctaLabel: "Comenzar",
    highlighted: false,
    outlined: false,
  },
  {
    name: "Empresa",
    monthly: "$4,990",
    annual: "$49,900",
    features: [
      { text: "Hasta 100 empleados", included: true },
      { text: "Acceso a los 24 cursos NOM", included: true },
      { text: "Certificados DC-3 automáticos", included: true },
      { text: "Reportes avanzados + dashboards", included: true },
      { text: "Soporte prioritario + capacitador asignado", included: true },
    ],
    ctaLabel: "Comenzar",
    highlighted: true,
    outlined: false,
  },
  {
    name: "Enterprise",
    monthly: null,
    annual: null,
    features: [
      { text: "Empleados ilimitados", included: true },
      { text: "Cursos NOM personalizados a tu industria", included: true },
      { text: "API + integraciones (SAP, HR systems)", included: true },
      { text: "Auditoría STPS incluida", included: true },
      { text: "Gerente de cuenta dedicado", included: true },
    ],
    ctaLabel: "Agendar demo",
    highlighted: false,
    outlined: true,
  },
];

export default function HomePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0F1E3D] text-white overflow-hidden">
        <div className="container-page pt-16 pb-14 md:pt-20 md:pb-16 grid md:grid-cols-12 gap-12 md:gap-10 items-center">
          <div className="md:col-span-6 order-2 md:order-1">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-[#F97316] mb-5">
              Plataforma de capacitación STPS
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-tighter font-bold">
              <span className="block text-white">Capacita a tu equipo.</span>
              <span className="block text-[#F97316]">Cumple con la STPS.</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-xl">
              Plataforma todo en uno para la capacitación, certificación y
              seguimiento de cumplimiento en seguridad y salud en el trabajo.
            </p>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: GraduationCap, text: "Cursos en línea 100% actualizados con NOM-STPS" },
                { icon: BadgeCheck, text: "Certificados DC-3 válidos ante la STPS" },
                { icon: BarChart3, text: "Seguimiento y reportes de cumplimiento" },
                { icon: Users, text: "Gestiona a todo tu equipo y subcontratistas" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F97316]/60 text-[#F97316]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-[13px] leading-snug text-white/85">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3 items-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm px-5 py-3 shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
              >
                Ver cursos <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/agendar"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-5 py-3 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Agenda una demo
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 order-1 md:order-2">
            <ProductPreview />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: "Menos riesgos" },
              { icon: ClipboardCheck, label: "Cumple la ley" },
              { icon: Users, label: "Equipos más seguros" },
              { icon: TrendingUp, label: "Mejores resultados" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316] shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-semibold text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 · PROMO BANNER */}
      <section className="bg-canvas py-10 md:py-14" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="rounded-2xl md:rounded-full bg-[#0F1E3D] border border-white/10 px-6 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-cardHover">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316]">
              <Gift className="h-6 w-6" />
            </span>
            <div className="flex-1 text-center md:text-left">
              <p className="font-display text-lg md:text-xl font-semibold text-white tracking-tight">
                Promoción de lanzamiento
              </p>
              <p className="text-sm text-white/70 leading-snug mt-0.5">
                Obtén 20% de descuento en los primeros 6 meses al contratar cualquier paquete anual.
              </p>
            </div>
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm px-6 py-3 transition-colors whitespace-nowrap"
            >
              Aprovechar oferta <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3 · INTRO HEADING */}
      <section className="bg-canvas py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.05]">
            Todo lo que tu empresa necesita para cumplir con la STPS
          </h2>
          <p className="mt-6 text-lg text-ink-700 leading-relaxed">
            PROCHECK es una plataforma integral para capacitación, certificación y seguimiento del cumplimiento normativo en seguridad y salud en el trabajo. Adminístra a tu equipo completo desde un solo sistema.
          </p>
        </div>
      </section>

      {/* SECTION 4 · ALTERNATING FEATURE BLOCKS */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white py-16 md:py-28 lg:py-36">
        <div className="container-page space-y-20 md:space-y-28">
          {featureBlocks.map((block) => (
            <div
              key={block.heading}
              className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
            >
              <div className={block.imageLeft ? "md:order-1" : "md:order-2"}>
                <div className="relative">
                  <div aria-hidden className="absolute -inset-8 -z-10 rounded-[48px] bg-procheck-orange/20 blur-3xl" />
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-cardHover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.image}
                      alt={block.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className={block.imageLeft ? "md:order-2" : "md:order-1"}>
                <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white tracking-tighter leading-[1.05]">
                  {block.heading}
                </h3>
                <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed">
                  {block.text}
                </p>
              </div>
            </div>
          ))}

          {/* Block D · DC-3 with component */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="md:order-2">
              <div className="relative">
                <div aria-hidden className="absolute -inset-8 -z-10 rounded-[48px] bg-procheck-orange/20 blur-3xl" />
                <div className="rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/10 p-8 md:p-10 flex items-center justify-center">
                  <DC3Card
                    folio="PCH-2026-000101"
                    holder="José Antonio Ramírez"
                    courseCode="NOM-009"
                    courseName="Trabajos en altura"
                    validUntil="14/05/2028"
                    className="w-full max-w-sm"
                  />
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <h3 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter leading-[1.05]">
                Certificados DC-3 emitidos automáticamente
              </h3>
              <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed">
                Al aprobar cada curso, PROCHECK emite el certificado DC-3 con folio verificable en línea, cumpliendo con el formato oficial de la STPS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 · GET STARTED CTA */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white border-t border-white/10 py-16 md:py-28 lg:py-36">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white tracking-tighter leading-[1.05]">
            Empieza hoy mismo
          </h2>
          <p className="mt-5 text-lg text-white/75 leading-relaxed">
            Únete a las empresas mexicanas que ya cumplen con la STPS con PROCHECK. Sin contratos anuales obligatorios, cancela cuando quieras.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm px-6 py-3 shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
            >
              Ver planes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 text-white font-semibold text-sm px-6 py-3 hover:bg-white/10 transition-colors"
            >
              Explorar cursos
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6 · 2-COL FEATURE LIST */}
      <section className="bg-canvas py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <CoursePlayerMock />
            </div>
            <div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.05]">
                Cursos diseñados para llevarte del riesgo al cumplimiento
              </h2>
              <ul className="mt-8 space-y-6">
                {[
                  {
                    title: "Ejercicios prácticos aplicables",
                    text: "Cada módulo incluye casos reales tomados de inspecciones STPS para practicar lo aprendido.",
                  },
                  {
                    title: "Enseñanza paso a paso",
                    text: "Contenido dividido en módulos cortos con evaluaciones intermedias que aseguran retención.",
                  },
                  {
                    title: "Soporte de instructor y comunidad",
                    text: "Foro de preguntas moderado por capacitadores STPS certificados.",
                  },
                  {
                    title: "Confiado por las mejores",
                    text: "Constructoras, mineras y químicas líderes ya usan PROCHECK para su cumplimiento.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316] mt-0.5">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-ink-900 tracking-tight leading-snug">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 · FEATURED TESTIMONIAL */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white py-16 md:py-28 lg:py-36">
        <div className="container-page">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-cardHover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.avatar1}
                  alt="Luis Ramírez, Director de EHS en Constructora Monterrey"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-7">
              <div className="flex gap-1 mb-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-[#F97316] fill-[#F97316]"
                  />
                ))}
              </div>
              <div className="text-6xl md:text-8xl text-procheck-orange font-display leading-none mb-4">“</div>
              <blockquote className="text-2xl md:text-3xl font-display italic leading-relaxed text-white">
                &ldquo;PROCHECK nos ahorró 40 horas al mes en administración de capacitaciones y certificados. Ahora las auditorías STPS son un trámite, no un dolor de cabeza.&rdquo;
              </blockquote>
              <div className="mt-8">
                <p className="font-display text-lg font-semibold text-white">
                  Luis Ramírez
                </p>
                <p className="text-sm text-white/70 mt-1">
                  Director de EHS · Constructora Monterrey
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 · RATINGS */}
      <section className="bg-canvas py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.05]">
              A las empresas les encanta cumplir con PROCHECK
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-line rounded-3xl shadow-card p-8 text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-[#F97316] fill-[#F97316]"
                  />
                ))}
              </div>
              <p className="font-display text-xl font-semibold text-ink-900 tracking-tight">
                Trustpilot
              </p>
              <p className="text-sm text-ink-500 mt-1">230+ reseñas</p>
            </div>

            <div className="bg-white border border-line rounded-3xl shadow-card p-8 text-center flex flex-col items-center justify-center">
              <p className="font-display text-lg text-ink-800 tracking-tight leading-snug italic">
                &ldquo;...La forma más práctica de capacitar en NOM-STPS.&rdquo;
              </p>
              <p className="text-sm text-ink-500 mt-4">
                Revista Construcción MX
              </p>
            </div>

            <div className="bg-white border border-line rounded-3xl shadow-card p-8 text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-[#F97316] fill-[#F97316]"
                  />
                ))}
              </div>
              <p className="font-display text-xl font-semibold text-ink-900 tracking-tight">
                Google Reviews
              </p>
              <p className="text-sm text-ink-500 mt-1">180+ reseñas</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 · PRICING */}
      <section className="bg-canvas-2 border-y border-line py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.05]">
              Precios simples y transparentes
            </h2>
            <p className="mt-5 text-lg text-ink-700 leading-relaxed">
              Suscríbete hoy y obtén nuestro mejor precio.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 rounded-full bg-white border border-line p-1 shadow-subtle">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  billing === "monthly"
                    ? "bg-[#0F1E3D] text-white"
                    : "text-ink-700 hover:text-ink-900"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  billing === "annual"
                    ? "bg-[#0F1E3D] text-white"
                    : "text-ink-700 hover:text-ink-900"
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => {
              const isEnterprise = tier.monthly === null;
              const price = isEnterprise
                ? "Cotización personalizada"
                : billing === "monthly"
                  ? tier.monthly!
                  : tier.annual!;
              const priceSuffix = isEnterprise
                ? ""
                : billing === "monthly"
                  ? " MXN/mes"
                  : " MXN/año";
              const altPrice = isEnterprise
                ? "Contacta al equipo"
                : billing === "monthly"
                  ? `o ${tier.annual} MXN anual`
                  : `o ${tier.monthly} MXN mensual`;

              return (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    tier.highlighted
                      ? "bg-[#0F1E3D] text-white border-2 border-[#F97316] shadow-orangeGlowXl md:-mt-4 md:mb-0 ring-2 ring-procheck-orange ring-offset-4 ring-offset-canvas"
                      : "bg-white border border-line shadow-card"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                        Más popular
                      </span>
                    </div>
                  )}

                  <p
                    className={`font-display text-xl font-semibold tracking-tight ${
                      tier.highlighted ? "text-white" : "text-ink-900"
                    }`}
                  >
                    {tier.name}
                  </p>

                  <div className="mt-5 min-h-[92px]">
                    {isEnterprise ? (
                      <p
                        className={`font-display text-3xl font-semibold tracking-tighter ${
                          tier.highlighted ? "text-white" : "text-ink-900"
                        }`}
                      >
                        {price}
                      </p>
                    ) : (
                      <p className="flex items-baseline gap-1">
                        <span
                          className={`font-display text-5xl font-bold tracking-tighter ${
                            tier.highlighted ? "text-white" : "text-ink-900"
                          }`}
                        >
                          {price}
                        </span>
                        <span
                          className={`text-sm ${
                            tier.highlighted ? "text-white/70" : "text-ink-500"
                          }`}
                        >
                          {priceSuffix}
                        </span>
                      </p>
                    )}
                    <p
                      className={`mt-2 text-xs ${
                        tier.highlighted ? "text-white/70" : "text-ink-500"
                      }`}
                    >
                      {altPrice}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-3">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                            f.included
                              ? "bg-[#F97316]/15 text-[#F97316]"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {f.included ? (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          ) : (
                            <X className="h-3 w-3" strokeWidth={3} />
                          )}
                        </span>
                        <span
                          className={`text-sm leading-snug ${
                            tier.highlighted ? "text-white/85" : "text-ink-700"
                          }`}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/agendar"
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm px-6 py-3 transition-colors ${
                      tier.outlined
                        ? "border border-ink-300 text-ink-900 hover:bg-ink-50"
                        : tier.highlighted
                          ? "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
                          : "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
                    }`}
                  >
                    {tier.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
