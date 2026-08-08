import Link from "next/link";
import {
  Users,
  BarChart3,
  ShieldCheck,
  FileText,
  Lock,
  MessageCircle,
  Check,
  ArrowRight,
} from "lucide-react";
import { IMG } from "@/lib/images";

const tiers = [
  {
    name: "Starter",
    price: "$2,900",
    per: "MXN / mes",
    desc: "Para pymes que empiezan a formalizar su cumplimiento.",
    features: {
      "Hasta 25 usuarios": true,
      "Catálogo NOM básico": true,
      "Certificados DC-3": true,
      "Reportes esenciales": true,
      "Subcontratistas": false,
      "Soporte prioritario": false,
      "SSO y controles avanzados": false,
    },
    highlight: false,
    cta: "Empezar",
    variant: "secondary" as const,
  },
  {
    name: "Business",
    price: "$7,900",
    per: "MXN / mes",
    desc: "Para empresas con subcontratistas y múltiples obras.",
    features: {
      "Hasta 150 usuarios": true,
      "Catálogo NOM básico": true,
      "Certificados DC-3": true,
      "Reportes esenciales": true,
      "Subcontratistas": true,
      "Soporte prioritario": true,
      "SSO y controles avanzados": false,
    },
    highlight: true,
    cta: "Empezar",
    variant: "primary" as const,
  },
  {
    name: "Enterprise",
    price: "A medida",
    per: "",
    desc: "Corporativos multi-planta y grupos industriales.",
    features: {
      "Hasta 25 usuarios": false,
      "Catálogo NOM básico": true,
      "Certificados DC-3": true,
      "Reportes esenciales": true,
      "Subcontratistas": true,
      "Soporte prioritario": true,
      "SSO y controles avanzados": true,
    },
    highlight: false,
    cta: "Hablar con ventas",
    variant: "secondary" as const,
  },
];

function TeamPreview() {
  const rows = [
    { name: "María López", role: "Supervisor", status: "success" },
    { name: "Carlos Ramírez", role: "Operador", status: "success" },
    { name: "Ana Gutiérrez", role: "Vendedor", status: "warn" },
    { name: "José Hernández", role: "Capacitador", status: "success" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-line shadow-cardHover overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 bg-canvas-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.55)" }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(245,158,11,0.55)" }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(16,185,129,0.55)" }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="font-mono text-xs text-ink-500 bg-white border border-line rounded-md px-3 py-1">
            app.procheck.mx/dashboard/team
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h4 className="font-display font-semibold text-ink-900 text-base tracking-tight">
            Equipo y roles
          </h4>
          <span className="text-[10px] text-ink-500 font-mono">
            24 miembros activos
          </span>
        </div>
        <div className="border border-line rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 px-3 py-2 bg-canvas-2 border-b border-line text-[10px] uppercase tracking-wider text-ink-500 font-medium">
            <span>Miembro</span>
            <span>Rol</span>
            <span className="text-right">Cumplimiento</span>
          </div>
          {rows.map((r, idx) => (
            <div
              key={r.name}
              className={`grid grid-cols-3 items-center px-3 py-2.5 text-xs ${
                idx > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="text-ink-800 font-medium">{r.name}</span>
              <span className="text-ink-700">{r.role}</span>
              <span className="text-right">
                <span
                  className={
                    r.status === "warn"
                      ? "badge-status-warn"
                      : "badge-status-success"
                  }
                >
                  {r.status === "warn" ? "Por vencer" : "Al día"}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SoftwarePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-canvas">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <p className="kicker mb-3">Software</p>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.05] tracking-tighter">
              Una plataforma, todo tu equipo certificado.
            </h1>
            <p className="mt-6 text-lg text-ink-700 leading-relaxed max-w-lg">
              Administra usuarios, cursos y certificados de toda tu
              organización, incluidos subcontratistas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link href="#planes" className="btn-primary">
                Ver planes
              </Link>
              <Link href="/consulting" className="btn-ghost">
                Solicitar demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {[
                "STPS Registrado",
                "DC-3 Verificado",
                "LFPDPPP",
              ].map((b) => (
                <span key={b} className="badge-compliance">
                  <ShieldCheck className="h-3 w-3 text-coral-500" />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-6">
            <TeamPreview />
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">Funcionalidades</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Diseñado para EHS y operaciones.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)]">
            {/* Wide with mini chart */}
            <div className="md:col-span-2 card-enterprise p-7">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                Reportes de cumplimiento
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-4">
                KPIs por empresa, obra y subcontratista. Filtra, exporta a
                PDF o Excel.
              </p>
              <div className="flex items-end gap-1 h-12">
                {[30, 45, 40, 55, 62, 58, 72, 68, 80].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${i >= 6 ? "bg-coral-500" : "bg-ink-700"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Tall with product shot */}
            <div className="md:col-span-2 md:row-span-2 card-enterprise p-7 flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                Bitácora auditable
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-5">
                Cada evaluación, firma y cambio queda registrado con
                timestamp y usuario responsable.
              </p>
              <ul className="space-y-2.5 text-sm text-ink-700 mb-5">
                {[
                  "Registro inmutable de evaluaciones",
                  "Historial completo por trabajador",
                  "Exportación para auditorías STPS",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border border-line rounded-lg p-4 bg-canvas">
                <div className="font-mono text-[10px] text-ink-500 mb-2">
                  BITÁCORA · 2026-05-14 09:14
                </div>
                <ul className="space-y-2 text-xs text-ink-700">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Evaluación aprobada · NOM-009
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
                    Certificado emitido · PCH-2026-000101
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                    Recordatorio programado a 30 días
                  </li>
                </ul>
              </div>
            </div>

            {/* Small cards */}
            {[
              { icon: Users, title: "Usuarios y roles", desc: "Empleados, subcontratistas, vendedores y capacitadores." },
              { icon: FileText, title: "Certificados DC-3", desc: "Emisión, verificación y renovación en un clic." },
              { icon: Lock, title: "Seguridad y control", desc: "Datos cifrados, SSO y control por rol." },
            ].map((f) => (
              <div key={f.title} className="card-enterprise p-6">
                <div className="h-9 w-9 rounded-lg bg-coral-50 flex items-center justify-center mb-3">
                  <f.icon className="h-4.5 w-4.5 text-coral-600" />
                </div>
                <h3 className="font-display text-base font-semibold text-ink-900 mb-1.5 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}

            {/* Wide bottom */}
            <div className="md:col-span-2 card-enterprise p-7">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                Soporte especializado
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed">
                Acompañamiento humano de expertos que conocen la normativa
                STPS y te ayudan en cada implementación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planes" className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">Planes</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Precios simples, sin sorpresas.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={
                  "relative bg-white rounded-xl p-7 flex flex-col " +
                  (t.highlight
                    ? "border border-coral-500 shadow-cardHover"
                    : "border border-line")
                }
              >
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center bg-coral-50 text-coral-700 border border-coral-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Recomendado
                    </span>
                  </div>
                )}
                <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
                  {t.name}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-display text-4xl font-semibold text-ink-900 tracking-tight">
                    {t.price}
                  </span>
                  <span className="text-sm text-ink-500">{t.per}</span>
                </div>
                <p className="text-sm text-ink-700 mb-6 leading-relaxed">
                  {t.desc}
                </p>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {Object.entries(t.features).map(([f, on]) => (
                    <li
                      key={f}
                      className={
                        "flex items-center gap-2.5 text-sm " +
                        (on ? "text-ink-800" : "text-ink-300")
                      }
                    >
                      {on ? (
                        <Check className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <span className="h-4 w-4 flex items-center justify-center text-ink-300">
                          -
                        </span>
                      )}
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/consulting"
                  className={
                    (t.variant === "primary" ? "btn-primary" : "btn-secondary") +
                    " w-full"
                  }
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-16 md:py-20 bg-canvas-2 border-t border-line">
        <div className="container-page max-w-3xl">
          <div className="card-enterprise p-8 md:p-10">
            <p className="text-lg text-ink-800 leading-relaxed">
              El módulo de subcontratistas nos ahorró literalmente semanas de
              trabajo por auditoría. Los reportes salen en un clic.
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.avatar1}
                alt="Cliente"
                className="h-11 w-11 rounded-full object-cover border border-line"
              />
              <div>
                <div className="font-medium text-ink-900 text-sm">
                  María Fernanda López
                </div>
                <div className="text-xs text-ink-500 mt-0.5">
                  Gerente EHS, Constructora Polaris
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
