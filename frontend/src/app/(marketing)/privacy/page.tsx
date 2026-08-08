import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Aviso de Privacidad · PROCHECK Safety",
  description:
    "Aviso de Privacidad de PROCHECK Safety conforme a la LFPDPPP.",
};

export default function PrivacyPage() {
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
          <span className="text-ink-900">Aviso de Privacidad</span>
        </nav>

        <p className="kicker mb-3">Cumplimiento LFPDPPP</p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.05] tracking-tighter">
          Aviso de Privacidad.
        </h1>
        <p className="mt-6 text-sm text-ink-500">
          Última actualización: 19 de julio de 2026 · Vigente
        </p>

        <div className="mt-12 space-y-12">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              1. Identidad y domicilio del responsable
            </h2>
            <p className="text-ink-700 leading-relaxed">
              PROCHECK Safety, S.A.P.I. de C.V. (en constitución), con domicilio
              en la Ciudad de México, es la responsable del tratamiento de tus
              datos personales. Actualmente nos encontramos en proceso de
              registro legal, por lo que el RFC y los datos societarios
              definitivos se actualizarán en este Aviso una vez concluida la
              incorporación. Cualquier duda puede dirigirse al correo indicado
              al final de este documento.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              2. Datos personales que recabamos
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Para operar la plataforma podemos recabar y tratar las siguientes
              categorías de datos personales:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-ink-700 leading-relaxed">
              <li>Nombre completo.</li>
              <li>Correo electrónico.</li>
              <li>Número telefónico.</li>
              <li>RFC.</li>
              <li>Domicilio fiscal o de contacto.</li>
              <li>Puesto o rol laboral.</li>
              <li>Empresa o afiliación laboral.</li>
              <li>Avance y actividad en los cursos.</li>
              <li>Respuestas a evaluaciones y exámenes.</li>
              <li>Historial de certificados emitidos.</li>
              <li>
                Metadatos del método de pago (no almacenamos números de tarjeta
                completos).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              3. Finalidades del tratamiento
            </h2>
            <p className="text-ink-700 leading-relaxed">
              <span className="font-medium text-ink-900">
                Finalidades primarias:
              </span>{" "}
              impartir capacitación en línea, emitir constancias DC-3, dar
              seguimiento al cumplimiento normativo y facturar los servicios
              mediante CFDI.
            </p>
            <p className="text-ink-700 leading-relaxed">
              <span className="font-medium text-ink-900">
                Finalidades secundarias:
              </span>{" "}
              mejorar la plataforma, generar analítica agregada y anónima, y
              comunicar novedades del servicio. Puedes oponerte a estas
              finalidades sin que afecte la prestación del servicio principal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              4. Transferencias
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Podemos transferir tus datos personales a los siguientes terceros
              únicamente para las finalidades descritas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-ink-700 leading-relaxed">
              <li>
                Secretaría del Trabajo y Previsión Social (STPS) para el
                registro de constancias DC-3.
              </li>
              <li>
                Servicio de Administración Tributaria (SAT) para la emisión de
                CFDI.
              </li>
              <li>
                Procesadores de pago (Conekta o Mercado Pago, una vez
                seleccionado el proveedor) para gestionar cobros.
              </li>
              <li>Proveedor de hosting para el almacenamiento seguro de datos.</li>
            </ul>
            <p className="text-ink-700 leading-relaxed">
              Tus datos personales no son vendidos a terceros bajo ninguna
              circunstancia.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              5. Derechos ARCO
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al
              tratamiento de tus datos personales, así como a revocar el
              consentimiento otorgado. Para ejercer cualquiera de estos
              derechos, envía una solicitud al correo{" "}
              <a
                href="mailto:contacto@procheck.com"
                className="text-coral-600 hover:text-coral-700 underline underline-offset-2"
              >
                contacto@procheck.com
              </a>{" "}
              indicando tu nombre, medio de contacto y la acción que deseas
              realizar. Responderemos dentro de los plazos establecidos por la
              LFPDPPP.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              6. Uso de cookies y tecnologías similares
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Utilizamos cookies de sesión para mantener tu inicio de sesión
              activo, almacenamiento local (localStorage) para preservar el
              carrito de compras y el avance de tus cursos, y cookies analíticas
              para entender de forma agregada el uso de la plataforma. En tu
              primera visita mostramos un aviso de cookies para que puedas
              conocer y aceptar este uso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              7. Modificaciones al Aviso
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Este Aviso de Privacidad puede ser actualizado en el futuro para
              reflejar cambios legales, operativos o del servicio. Cuando exista
              una modificación material te notificaremos por correo electrónico
              y publicaremos la versión vigente en esta misma página con su
              fecha de actualización.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              8. Autoridad de control
            </h2>
            <p className="text-ink-700 leading-relaxed">
              Si consideras que tus derechos no han sido atendidos
              adecuadamente, puedes presentar una queja o denuncia ante el
              Instituto Nacional de Transparencia, Acceso a la Información y
              Protección de Datos Personales (INAI). Consulta más información en{" "}
              <a
                href="https://www.inai.org.mx"
                target="_blank"
                rel="noreferrer"
                className="text-coral-600 hover:text-coral-700 underline underline-offset-2"
              >
                https://www.inai.org.mx
              </a>
              .
            </p>
          </section>
        </div>

        <div className="card-enterprise p-6 md:p-8 mt-16">
          <p className="text-ink-700 leading-relaxed">
            ¿Preguntas sobre datos personales? Escríbenos a{" "}
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
