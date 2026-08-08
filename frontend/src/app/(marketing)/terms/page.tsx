import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Términos de uso · PROCHECK Safety",
  description: "Términos y condiciones de uso de la plataforma PROCHECK Safety.",
};

export default function TermsPage() {
  return (
    <section className="bg-canvas">
      <div className="container-page py-16 md:py-24 max-w-3xl">
        <nav
          aria-label="Migas de pan"
          className="flex items-center gap-1.5 text-xs text-ink-500 mb-6"
        >
          <Link href="/" className="hover:text-ink-900 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink-900">Términos y condiciones</span>
        </nav>

        <p className="kicker mb-3">Términos y condiciones</p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.05] tracking-tighter">
          Términos de uso de PROCHECK Safety.
        </h1>
        <p className="mt-6 text-sm text-ink-500">
          Última actualización: 19 de julio de 2026 · Vigente
        </p>

        <div className="mt-12 space-y-12">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              1. Aceptación de los términos
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Al acceder y utilizar la plataforma PROCHECK Safety aceptas
              plenamente los presentes Términos de uso. Si no estás de acuerdo
              con alguno de ellos, te pedimos abstenerte de utilizar el
              servicio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              2. Descripción del servicio
            </h2>
            <p className="text-ink-700 leading-relaxed">
              PROCHECK Safety es una plataforma LMS y de certificación
              orientada al cumplimiento de las Normas Oficiales Mexicanas (NOM)
              emitidas por la STPS. Actualmente ofrecemos un catálogo de 24
              cursos en línea y nos encontramos en fase de lanzamiento
              controlado, por lo que ciertas funciones pueden estar sujetas a
              cambios sin previo aviso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              3. Cuenta y responsabilidades del usuario
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Al crear una cuenta te comprometes a proporcionar información
              veraz y actualizada, resguardar tu contraseña y no compartir tu
              acceso con terceros. Eres responsable de cualquier actividad
              realizada desde tu cuenta. En caso de sospecha de uso no
              autorizado, notifícanos de inmediato.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              4. Contenido y propiedad intelectual
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Los cursos, videos, materiales descargables, evaluaciones y
              contenidos asociados son propiedad de PROCHECK Safety y están
              protegidos por la legislación mexicana en materia de derechos de
              autor. Los certificados DC-3 son emitidos por nuestro agente
              capacitador externo registrado ante la STPS. Como usuario puedes
              descargar tus propias constancias, pero no está permitido
              redistribuir, revender o reproducir el material del curso sin
              autorización expresa por escrito.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              5. Pagos y facturación
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Los precios se expresan en pesos mexicanos (MXN) más el Impuesto
              al Valor Agregado (IVA) aplicable. La facturación CFDI se emite
              de forma automática a través de un proveedor autorizado por el
              SAT.
            </p>
            <p className="text-ink-700 leading-relaxed">
              Política de cancelación y reembolso: se ofrece reembolso dentro
              de los 7 días naturales posteriores a la compra siempre que el
              curso no haya sido iniciado. Para solicitarlo, escribe a{" "}
              <a
                href="mailto:soporte@procheck.com"
                className="text-coral-600 hover:text-coral-700 underline underline-offset-2"
              >
                soporte@procheck.com
              </a>
              . Esta política es preliminar y será confirmada por el cliente
              final antes del lanzamiento comercial.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              6. Emisión de certificados DC-3
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Las constancias DC-3 son emitidas por nuestro agente capacitador
              externo registrado ante la STPS. Cada constancia cuenta con folio
              único y puede ser verificada en cualquier momento desde{" "}
              <Link
                href="/certificate-lookup"
                className="text-coral-600 hover:text-coral-700 underline underline-offset-2"
              >
                /certificate-lookup
              </Link>
              . La vigencia habitual es de 12 meses, sujeta a los criterios de
              la NOM aplicable a cada curso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              7. Limitación de responsabilidad
            </h2>
            <p className="text-ink-700 leading-relaxed">
              PROCHECK Safety no será responsable por daños indirectos,
              incidentales, especiales o consecuenciales derivados del uso o la
              imposibilidad de uso de la plataforma, incluyendo interrupciones
              de negocio, pérdida de datos o pérdida de utilidades. La
              responsabilidad total se limita al monto efectivamente pagado por
              el usuario en los últimos 12 meses por el servicio contratado.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              8. Modificaciones
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Podremos actualizar estos Términos en el futuro. Cualquier cambio
              material será notificado con al menos 30 días naturales de
              anticipación por medio de correo electrónico o dentro de la
              plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              9. Jurisdicción
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Estos Términos se rigen por las leyes de los Estados Unidos
              Mexicanos. Para la interpretación y cumplimiento del presente
              documento, las partes se someten a la jurisdicción de los
              tribunales competentes de la Ciudad de México, renunciando a
              cualquier otra que pudiera corresponderles por razón de sus
              domicilios presentes o futuros.
            </p>
          </section>
        </div>

        <div className="card-enterprise p-6 md:p-8 mt-16">
          <p className="text-ink-700 leading-relaxed">
            ¿Dudas legales o de facturación? Escríbenos a{" "}
            <a
              href="mailto:contacto@procheck.com"
              className="text-coral-600 hover:text-coral-700 font-medium underline underline-offset-2"
            >
              contacto@procheck.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
