import Link from "next/link";
import {
  GraduationCap,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { IMG } from "@/lib/images";

const process = [
  {
    step: "1",
    title: "Propuesta",
    desc: "Presentamos alcance, cronograma e inversión.",
  },
  {
    step: "2",
    title: "Implementación",
    desc: "Ejecutamos cursos, certificaciones y adecuaciones.",
  },
  {
    step: "3",
    title: "Seguimiento",
    desc: "Monitoreo continuo del cumplimiento en la plataforma.",
  },
];

const cases = [
  {
    quote:
      "Cerramos 3 auditorías consecutivas sin observaciones mayores gracias al acompañamiento.",
    name: "Roberto Cárdenas",
    company: "Cementos Orión, Planta Norte",
    result: "0 observaciones críticas en 12 meses",
  },
  {
    quote:
      "Migramos 480 expedientes de capacitación en 6 semanas. La consultoría fue clave.",
    name: "Patricia Núñez",
    company: "Minera del Valle",
    result: "480 expedientes migrados",
  },
];

export default function ConsultingPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-canvas">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <p className="kicker mb-3">Consultoría</p>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.05] tracking-tighter">
              Lleva tu operación al cumplimiento total.
            </h1>
            <p className="mt-6 text-lg text-ink-700 leading-relaxed max-w-lg">
              Implementación y seguimiento de seguridad laboral con
              especialistas que conocen la normativa mexicana a fondo.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link href="/agendar?type=consulting" className="btn-primary">
                Agendar cita con vendedor
              </Link>
              <Link href="#casos" className="btn-ghost">
                Ver casos de éxito <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="card-enterprise rounded-2xl overflow-hidden relative aspect-[4/3] photo-duotone-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.heroConsulting}
                alt="Sesión de consultoría"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">Nuestros servicios</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Servicios para tu operación.
            </h2>
          </div>

          <div className="bg-ink-900 text-white rounded-2xl p-8 md:p-10 mb-6 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-white">
                Agendar cita con vendedor
              </h3>
              <p className="mt-3 text-ink-200 leading-relaxed max-w-xl">
                Un asesor se pone en contacto contigo para entender tu
                operación, tus subcontratistas y las NOM aplicables. Salimos
                con un plan concreto y una cotización personalizada.
              </p>
            </div>
            <div className="md:justify-self-end">
              <Link
                href="/agendar?type=consulting"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm bg-coral-500 hover:bg-coral-600 text-white transition-colors"
              >
                Agendar cita <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Desarrollo de capacitación",
                desc: "Diseñamos y entregamos programas ajustados a tu operación y a las NOM aplicables.",
              },
              {
                icon: ClipboardCheck,
                title: "Auditoría de cumplimiento",
                desc: "Verificamos brechas frente a la STPS y entregamos un plan de acción priorizado.",
              },
            ].map((s) => (
              <div key={s.title} className="card-enterprise p-7">
                <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                  <s.icon className="h-5 w-5 text-coral-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">Nuestro proceso</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              De propuesta a auditoría.
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-px bg-line" />
            <div className="grid md:grid-cols-3 gap-8 relative">
              {process.map((p) => (
                <div key={p.step} className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-canvas-2 border border-line text-ink-900 flex items-center justify-center font-display text-lg font-semibold mb-5 relative z-10">
                    {p.step}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-sm text-ink-700 max-w-xs mx-auto leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section id="casos" className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">Casos de éxito</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Auditorías cerradas sin observaciones.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <div key={c.name} className="card-enterprise p-8">
                <div className="font-display text-5xl leading-none text-coral-500 mb-3">
                  &ldquo;
                </div>
                <p className="text-lg text-ink-800 leading-relaxed">
                  {c.quote}
                </p>
                <div className="mt-6">
                  <div className="font-medium text-ink-900">{c.name}</div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {c.company}
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center bg-coral-50 text-coral-700 border border-coral-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {c.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-canvas-2 py-20 md:py-24">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            Hablemos de tu plan de cumplimiento.
          </h2>
          <p className="mt-4 text-ink-700 leading-relaxed">
            Agenda 20 minutos con un asesor. Sin costo, sin compromiso.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/agendar?type=consulting" className="btn-primary">
              Agendar cita
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
