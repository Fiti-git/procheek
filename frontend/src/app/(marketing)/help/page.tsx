"use client";

import Link from "next/link";
import {
  Search,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  BookOpen,
  BadgeCheck,
  Receipt,
  Users,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const faqs = [
  {
    q: "¿Qué es un certificado DC-3?",
    a: "La DC-3 es la Constancia de Competencias y Habilidades emitida por la STPS. Es el documento oficial que acredita que un trabajador recibió capacitación conforme a una Norma Oficial Mexicana aplicable. En PROCHECK Safety, al aprobar el examen final con 90% o más, nuestro agente capacitador externo emite la constancia con folio único, la firma y la registra ante la STPS.",
  },
  {
    q: "¿Cuánto tarda en llegar mi certificado?",
    a: "Emitimos la constancia DC-3 dentro de las 24 horas siguientes a la aprobación del examen final. La recibirás en tu correo y quedará disponible para descarga en tu panel de usuario.",
  },
  {
    q: "¿Cuánto dura la vigencia de mi DC-3?",
    a: "La vigencia habitual es de 12 meses para la mayoría de las NOM aplicables. Enviamos recordatorios automáticos de recertificación a los 30, 15 y 1 días previos al vencimiento para que puedas renovar sin interrupciones.",
  },
  {
    q: "¿Puedo reintentar el examen si repruebo?",
    a: "Sí. Cuentas con 3 intentos por examen. Hay un tiempo de espera de 24 horas entre un intento y el siguiente para reforzar los temas.",
  },
  {
    q: "¿Cómo pago los cursos?",
    a: "Aceptamos tarjetas de crédito y débito, pagos en efectivo por OXXO y transferencias SPEI. El CFDI se emite automáticamente al confirmar el pago.",
  },
  {
    q: "¿Los cursos incluyen video?",
    a: "Sí. Cada curso incluye video HD narrado por especialistas, materiales descargables complementarios, evaluaciones interactivas y la constancia DC-3 al aprobar.",
  },
  {
    q: "¿Cómo agrego a mi equipo?",
    a: "Como Client Admin puedes ir a /dashboard/team y usar el botón 'Añadir miembro' para invitar a tus colaboradores. La documentación completa de gestión de equipo está disponible en esa misma sección.",
  },
  {
    q: "¿Ofrecen capacitación presencial?",
    a: "Sí. Coordinamos sesiones presenciales con capacitadores certificados. Agenda una cita en /agendar para revisar alcance, sedes y calendario.",
  },
];

const categories = [
  {
    icon: BookOpen,
    title: "Cursos y capacitación",
    desc: "Catálogo, requisitos previos y cómo avanzar en tu ruta de aprendizaje dentro de la plataforma.",
  },
  {
    icon: BadgeCheck,
    title: "Certificados DC-3",
    desc: "Emisión, descarga, verificación y renovación de tus constancias ante la STPS.",
  },
  {
    icon: Receipt,
    title: "Facturación y pagos",
    desc: "Métodos de pago aceptados, emisión de CFDI, cambios de RFC y política de reembolso.",
  },
  {
    icon: Users,
    title: "Cuenta y equipo",
    desc: "Gestión de tu cuenta, invitación de miembros, roles y control de accesos de tu organización.",
  },
];

export default function HelpPage() {
  const { toast } = useToast();

  return (
    <>
      {/* SUPPORT HERO */}
      <section className="bg-canvas">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="kicker mb-3">Centro de ayuda</p>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.05] tracking-tighter">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="mt-6 text-lg text-ink-700 leading-relaxed">
              Encuentra respuestas rápidas o contáctanos directamente.
            </p>

            <div className="mt-10 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-500" />
              <input
                type="text"
                placeholder="Buscar en la ayuda..."
                className="w-full pl-12 pr-4 py-4 text-base bg-white border border-line rounded-xl text-ink-900 placeholder:text-ink-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-shadow"
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <a
              href="mailto:contacto@procheck.com"
              className="card-enterprise p-6 hover:border-coral-200 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                Correo
              </h3>
              <p className="text-sm text-ink-700 mt-1">contacto@procheck.com</p>
            </a>

            <a
              href="tel:+525555555555"
              className="card-enterprise p-6 hover:border-coral-200 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                Teléfono
              </h3>
              <p className="text-sm text-ink-700 mt-1">55 5555 5555</p>
            </a>

            <div className="card-enterprise p-6">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                Chat en vivo
              </h3>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Función próximamente disponible",
                    description: "El chat en vivo se activará muy pronto.",
                    variant: "info",
                  })
                }
                className="mt-2 text-sm font-medium text-coral-600 hover:text-coral-700 inline-flex items-center gap-1"
              >
                Iniciar chat <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page max-w-3xl">
          <div className="mb-12">
            <p className="kicker mb-3">Preguntas frecuentes</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Respuestas rápidas.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group card-enterprise bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4">
                  <span className="font-display text-base md:text-lg font-semibold text-ink-900 tracking-tight">
                    {f.q}
                  </span>
                  <ChevronDown className="h-5 w-5 text-coral-500 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 -mt-1 text-ink-700 leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">Explora por tema</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Documentación por área.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((c) => (
              <div key={c.title} className="card-enterprise p-7 group">
                <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                  <c.icon className="h-5 w-5 text-coral-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed">
                  {c.desc}
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-coral-600 hover:text-coral-700 transition-colors"
                >
                  Ver más{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-canvas-2 py-16">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
            ¿Necesitas ayuda personalizada?
          </h2>
          <p className="mt-4 text-ink-700 leading-relaxed">
            Un especialista puede acompañarte en tu proceso de cumplimiento.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/agendar?type=consulting" className="btn-primary">
              Agendar llamada
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
