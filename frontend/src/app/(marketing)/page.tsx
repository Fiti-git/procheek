import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  BookOpen,
  BadgeCheck,
  Bell,
  Check,
  HardHat,
  FlaskConical,
  Wrench,
  Mountain,
  PlayCircle,
  FileText,
  GraduationCap,
  RefreshCw,
  Play,
} from "lucide-react";
import { IMG } from "@/lib/images";
import { DC3Card } from "@/components/DC3Card";

function ProductPreview() {
  return (
    <div className="relative">
      <div
        className="rounded-2xl overflow-hidden border border-line shadow-cardHover bg-ink-900 aspect-[4/5] sm:aspect-[4/3]"
        style={{ transform: "perspective(1200px) rotateY(-2deg) rotateX(1deg)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG.heroMain}
          alt="Trabajadores de construcción con equipo de protección personal en obra"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Floating DC-3 mini certificate */}
      <div className="absolute -bottom-6 -left-6 w-64 hidden sm:block">
        <DC3Card
          folio="PCH-2026-000101"
          holder="JUAN PÉREZ GARCÍA"
          courseCode="NOM-009"
          courseName="TRABAJOS EN ALTURA"
          validUntil="2027"
        />
      </div>
    </div>
  );
}

function MiniDashboard() {
  return (
    <div className="bg-white rounded-2xl border border-line shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-ink-500 font-medium">
          Panel en vivo
        </span>
        <span className="badge-status-success">En línea</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border border-line rounded-lg p-3">
          <div className="text-[10px] uppercase text-ink-500 tracking-wide">
            Cumplimiento
          </div>
          <div className="font-display text-2xl font-semibold text-ink-900 mt-1">
            94%
          </div>
        </div>
        <div className="border border-line rounded-lg p-3">
          <div className="text-[10px] uppercase text-ink-500 tracking-wide">
            Vigentes
          </div>
          <div className="font-display text-2xl font-semibold text-ink-900 mt-1">
            218
          </div>
        </div>
      </div>
      <div className="border border-line rounded-lg p-3">
        <div className="text-[10px] uppercase text-ink-500 tracking-wide mb-2">
          Emitidos por semana
        </div>
        <div className="flex items-end gap-1 h-14">
          {[30, 40, 55, 45, 62, 70, 82].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-ink-700"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniCertificate() {
  return (
    <div className="bg-white rounded-2xl border border-line shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-ink-500 font-medium">
          Certificado DC-3
        </span>
        <span className="badge-status-success">
          <Check className="h-3 w-3" /> Vigente
        </span>
      </div>
      <div className="font-mono text-xs text-ink-500 mb-2">
        PCH-2026-000101
      </div>
      <div className="font-display text-lg font-semibold text-ink-900 tracking-tight leading-snug">
        José Antonio Ramírez López
      </div>
      <div className="text-sm text-ink-700 mt-1">
        NOM-009-STPS Trabajos en altura
      </div>
      <div className="divider-hair my-4" />
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-ink-500 uppercase tracking-wide text-[10px]">
            Emisión
          </div>
          <div className="text-ink-800 font-medium mt-0.5">14/05/2026</div>
        </div>
        <div>
          <div className="text-ink-500 uppercase tracking-wide text-[10px]">
            Vigencia
          </div>
          <div className="text-ink-800 font-medium mt-0.5">14/05/2028</div>
        </div>
      </div>
    </div>
  );
}

const industries = [
  {
    label: "Construcción",
    img: IMG.construction,
    count: "12 cursos aplicables",
    Icon: HardHat,
    // STPS: la industria de la construcción concentra el mayor número de
    // accidentes laborales reportados anualmente en México.
    stat: "Sector con más accidentes en México",
  },
  {
    label: "Química",
    img: IMG.chemical,
    count: "8 cursos aplicables",
    Icon: FlaskConical,
    // NOM-005-STPS, NOM-010-STPS, NOM-018-STPS, NOM-028-STPS, entre otras
    // aplican al manejo de sustancias químicas y agentes peligrosos.
    stat: "8 NOMs sobre agentes químicos",
  },
  {
    label: "Metal-mecánica",
    img: IMG.metalmech,
    count: "9 cursos aplicables",
    Icon: Wrench,
    // NOM-027-STPS (soldadura y corte) y NOM-004-STPS son obligatorias
    // para operaciones metal-mecánicas.
    stat: "Soldadura requiere NOM-027",
  },
  {
    label: "Minería",
    img: IMG.mining,
    count: "6 cursos aplicables",
    Icon: Mountain,
    // NOM-023-STPS establece la recertificación periódica del personal
    // que labora en minas subterráneas y a cielo abierto.
    stat: "NOM-023 recertifica cada año",
  },
];

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
      {/* Browser chrome */}
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
          {/* Video frame */}
          <div className="relative aspect-video rounded-lg overflow-hidden photo-duotone">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.course_altura} alt="Reproductor de curso" />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-coral-500 shadow-cardHover flex items-center justify-center">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
              <div
                className="h-full bg-coral-500 rounded-full"
                style={{ width: "68%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ink-300">
              <span>Módulo 2 de 5 · Sistemas de restricción</span>
              <span>12:34 / 18:45</span>
            </div>
          </div>
        </div>

        {/* Modules sidebar */}
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
                    ? "text-coral-400 font-medium"
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
                  <span className="text-[9px] font-mono uppercase tracking-wider bg-coral-500/20 border border-coral-500/40 px-1.5 py-0.5 rounded shrink-0">
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

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-canvas">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <p className="kicker mb-4">
              Plataforma de cumplimiento STPS
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-[4.25rem] text-ink-900 leading-[1.05] tracking-tighter font-semibold">
              La forma moderna de mantener a tu equipo certificado ante la STPS.
            </h1>
            <p className="mt-6 text-lg text-ink-700 leading-relaxed max-w-lg">
              Cursos NOM, certificados DC-3 vigentes y control de vencimientos,
              en una sola plataforma diseñada para constructoras, industriales
              y sus subcontratistas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link href="/agendar?type=demo" className="btn-primary">
                Solicitar demo
              </Link>
              <Link href="/courses" className="btn-ghost">
                Ver cursos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {[
                "STPS Registrado",
                "DC-3 Verificado",
                "LFPDPPP",
                "Cursos NOM Vigentes",
              ].map((b) => (
                <span key={b} className="badge-compliance">
                  <ShieldCheck className="h-3 w-3 text-coral-500" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-6">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-canvas-2 border-y border-line py-12">
        <div className="container-page">
          <p className="text-xs uppercase tracking-widest text-ink-500 text-center mb-6">
            Utilizada por equipos de cumplimiento en:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "Grupo Constructor Norte",
              "Cemtec México",
              "Delta Minería",
              "Bravo Industrial",
              "Química Veracruz",
              "Peninsular Obras",
            ].map((c) => (
              <span
                key={c}
                className="font-display font-semibold text-lg lowercase tracking-tight text-ink-400"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-20 md:py-28 bg-canvas">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-3">Cómo funciona</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Todo lo que necesitas para pasar una auditoría STPS, en un solo
              sistema.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Capacita */}
            <div className="card-enterprise p-7">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                <BookOpen className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                Capacita
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-5">
                Accede a 24 cursos NOM vigentes, con contenido diseñado por
                capacitadores registrados ante la STPS.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["NOM-009", "NOM-017", "NOM-002", "NOM-019", "NOM-036"].map(
                  (c) => (
                    <span
                      key={c}
                      className="inline-flex items-center bg-ink-50 text-ink-700 border border-line rounded-md px-2 py-0.5 font-mono text-[11px] font-medium"
                    >
                      {c}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Certifica */}
            <div className="card-enterprise p-7 flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                <BadgeCheck className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                Certifica
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-5">
                Emitimos certificados DC-3 automáticamente al aprobar la
                evaluación, con folio verificable en línea.
              </p>
              <div className="mt-auto max-w-full">
                <DC3Card
                  folio="PCH-2026-000101"
                  holder="José Antonio Ramírez"
                  courseCode="NOM-009"
                  courseName="Trabajos en altura"
                  validUntil="14/05/2028"
                  className="w-full"
                />
              </div>
            </div>

            {/* Recuerda */}
            <div className="card-enterprise p-7">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                <Bell className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                Recuerda
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-5">
                Recibe alertas automáticas de recertificación para que ningún
                DC-3 se venza sin aviso.
              </p>
              <div className="border border-line rounded-lg p-3 bg-canvas flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-warn-bg border border-warn-border flex items-center justify-center shrink-0">
                  <Bell className="h-3.5 w-3.5 text-warn" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink-900">
                    Faltan 15 días para renovar NOM-009
                  </div>
                  <div className="text-[11px] text-ink-500 mt-0.5">
                    3 personas en tu equipo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE DEEP DIVE */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="kicker mb-3">Cumplimiento en vivo</p>
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight mb-4">
                Panel de cumplimiento en vivo.
              </h3>
              <p className="text-ink-700 leading-relaxed">
                Visualiza el estado de cada certificado, cada curso y cada
                subcontratista en un solo tablero. Filtra por obra, industria
                o rango de vigencia, y exporta a PDF para tu comité de
                seguridad.
              </p>
            </div>
            <MiniDashboard />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="kicker mb-3">Certificados verificables</p>
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight mb-4">
                Certificados DC-3 con folio verificable.
              </h3>
              <p className="text-ink-700 leading-relaxed">
                Cada certificado emitido genera un folio único, verificable en
                línea por cualquier auditor. Cumple con los formatos oficiales
                y con los requisitos de la STPS.
              </p>
            </div>
            <div className="md:order-1">
              <MiniCertificate />
            </div>
          </div>
        </div>
      </section>

      {/* COURSE PREVIEW SECTION */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-3">Formato del curso</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Así es tomar un curso PROCHECK.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                {[
                  {
                    Icon: PlayCircle,
                    text: "Video HD con instructor certificado",
                  },
                  { Icon: FileText, text: "Materiales descargables" },
                  { Icon: GraduationCap, text: "Examen final 90% mínimo" },
                  {
                    Icon: BadgeCheck,
                    text: "Certificado DC-3 emitido en 24 horas",
                  },
                  { Icon: RefreshCw, text: "Recertificación anual automática" },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-coral-50 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-coral-600" />
                    </div>
                    <span className="text-ink-800 font-medium leading-snug pt-1.5">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <CoursePlayerMock />
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line relative">
        {/* Section anchor: subtle caution stripe as construction-industry visual cue.
            Only above the section title, not between cards. */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #0F1725 0 14px, #FF6B35 14px 28px)",
            opacity: 0.85,
          }}
        />
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-3">Industrias que servimos</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Diseñado para los oficios de alto riesgo.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {industries.map(({ label, img, count, Icon, stat }) => (
              <div
                key={label}
                className="card-enterprise overflow-hidden relative group"
              >
                {/* Photo panel. Name overlay is the ONLY thing over the image. */}
                <div className="relative aspect-[4/5] bg-ink-100 photo-duotone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={label} />
                  {/* Icon badge top-right */}
                  <div className="absolute top-3 right-3 z-10 bg-white/95 border border-line rounded-full p-1.5 shadow-subtle">
                    <Icon className="h-4 w-4 text-ink" />
                  </div>
                  {/* Name overlay bottom-left, gradient scrim underneath for legibility */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 z-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(15,23,37,0) 0%, rgba(15,23,37,0.75) 100%)",
                    }}
                  />
                  <div
                    className="absolute bottom-3 left-4 right-4 z-10 font-display font-semibold text-2xl text-white leading-tight tracking-tight"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}
                  >
                    {label}
                  </div>
                </div>
                {/* Body panel below the photo. Stat + count live here, no more overlap. */}
                <div className="p-4 space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-coral-50 text-coral-700 text-[0.65rem] font-semibold rounded uppercase tracking-wider leading-tight">
                    {stat}
                  </div>
                  <div className="text-xs text-ink-500">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATE LOOKUP CTA */}
      <section className="bg-ink-900 text-white py-20">
        <div className="container-page max-w-2xl text-center">
          <p className="kicker mb-3">Validación pública</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-white">
            Verifica un certificado DC-3 en segundos.
          </h2>
          <p className="mt-4 text-ink-200 leading-relaxed">
            Ingresa el folio y confirma la validez de cualquier certificado
            emitido por PROCHECK.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              placeholder="Folio o CURP"
              className="flex-1 h-12 rounded-lg bg-white text-ink-800 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-white/20"
            />
            <button className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg font-medium text-sm bg-coral-500 hover:bg-coral-600 text-white transition-colors">
              Verificar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="font-mono text-xs text-ink-300 mt-4">
            Ejemplo de folio: PCH-2026-000101
          </p>
        </div>
      </section>

      {/* AGENTE CAPACITADOR TRUST SECTION */}
      <section className="bg-canvas-2 py-20">
        <div className="container-page">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden photo-duotone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.documentaryFallProtection}
                  alt="Agente Capacitador Externo certificado ante la STPS"
                />
              </div>
            </div>
            <div className="md:col-span-7">
              <p className="kicker mb-3">Agente Capacitador Externo</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
                Registrado ante la STPS. Emisor autorizado de DC-3.
              </h2>
              <p className="mt-5 text-lg text-ink-700 leading-relaxed max-w-xl">
                Cada certificado que emitimos cuenta con folio verificable, sello
                del agente capacitador y validez legal completa ante auditorías
                laborales.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="badge-compliance">
                  <ShieldCheck className="h-3 w-3 text-coral-500" />
                  STPS · Agente #ACE-2025-0142
                </span>
                <span className="badge-compliance">
                  <ShieldCheck className="h-3 w-3 text-coral-500" />
                  Emisión electrónica DC-3
                </span>
                <span className="badge-compliance">
                  <ShieldCheck className="h-3 w-3 text-coral-500" />
                  Cumple NOM-STPS 2011
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  "Registro STPS renovado anualmente. Verificable en el portal oficial.",
                  "Instructores con perfil publicado. RFC y CURP validados por SAT.",
                  "Auditoría interna trimestral. Cumplimiento LFPDPPP en datos personales.",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-ink-700 leading-relaxed"
                  >
                    <Check className="h-5 w-5 text-coral-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-3">Casos de éxito</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Contratistas mexicanos que ya cumplen sin sudar.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote:
                  "Redujimos incidentes 40% en 6 meses. La trazabilidad DC-3 es lo que buscábamos.",
                name: "María Fernanda López",
                role: "Gerente EHS",
                company: "Constructora Polaris",
                avatar: IMG.avatar1,
                stat: "40% menos incidentes",
              },
              {
                quote:
                  "Certificar a 300 subcontratistas era un dolor. Ahora es un dashboard, y llegamos a auditoría con todo listo.",
                name: "Carlos Ramírez",
                role: "Director de Operaciones",
                company: "Grupo Acero MX",
                avatar: IMG.avatar2,
                stat: "100% certificado antes de auditoría STPS",
              },
            ].map((t) => (
              <figure
                key={t.name}
                data-testid="testimonial"
                className="card-enterprise p-7"
              >
                <blockquote className="text-lg text-ink-700 leading-relaxed">
                  {t.quote}
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-11 w-11 rounded-full overflow-hidden border border-line photo-duotone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.avatar} alt={t.name} />
                  </div>
                  <div>
                    <div className="font-medium text-ink-900 text-sm">
                      {t.name}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <span className="inline-flex items-center bg-coral-50 text-coral-700 border border-coral-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {t.stat}
                  </span>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-canvas-2 border-t border-line py-20 md:py-24">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            ¿Listo para digitalizar tu cumplimiento?
          </h2>
          <p className="mt-4 text-ink-700 leading-relaxed">
            Un asesor te acompaña para migrar tus expedientes de capacitación
            a la plataforma en semanas, no meses.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/agendar?type=demo" className="btn-primary">
              Solicitar demo
            </Link>
            <Link href="/agendar?type=consulting" className="btn-secondary">
              Hablar con un vendedor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
