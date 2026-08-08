import { Search, Download, Mail, ShieldCheck, Award } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { DC3Card } from "@/components/DC3Card";

export default function CertificateLookupPage() {
  return (
    <section className="bg-canvas noise-bg min-h-[80vh]">
      <div className="container-page py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="kicker mb-3">Validación oficial</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              Verifica un certificado DC-3.
            </h1>
            <p className="mt-3 text-ink-700 leading-relaxed">
              Ingresa el folio o el CURP para confirmar la validez de un
              certificado.
            </p>
          </div>

          <div className="bg-white border border-line rounded-xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <Input placeholder="Folio o CURP. Ej. PCH-2026-000101" className="pl-9 h-12" />
              </div>
              <button className="btn-primary h-12 px-6">
                <Search className="h-4 w-4" /> Buscar
              </button>
            </div>
            <p className="font-mono text-xs text-ink-500 mt-3">
              Ejemplo: PCH-2026-000101
            </p>
          </div>

          {/* Result */}
          <div className="mt-10 relative">
            <div className="absolute -top-3 right-4 z-10">
              <span className="inline-flex items-center bg-coral-50 text-coral-700 border border-coral-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                Vista de ejemplo
              </span>
            </div>
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="p-6 flex items-center gap-4 border-b border-line">
                <div className="h-11 w-11 rounded-lg bg-coral-50 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5 text-coral-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-semibold text-ink-900 tracking-tight">
                    Certificado válido
                  </h2>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Verificado ante el registro STPS
                  </p>
                </div>
                <span className="badge-status-success">Vigente</span>
              </div>

              <div className="p-6">
                <DC3Card
                  folio="PCH-2026-000101"
                  holder="JOSÉ ANTONIO RAMÍREZ LÓPEZ"
                  courseCode="NOM-009"
                  courseName="TRABAJOS EN ALTURA"
                  validUntil="14/05/2028"
                  className="mb-6"
                />
              </div>

              <div className="p-6 pt-0 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                {[
                  { label: "Folio", value: "PCH-2026-000101" },
                  { label: "Titular", value: "José Antonio Ramírez López" },
                  { label: "Curso", value: "NOM-009-STPS Trabajos en altura" },
                  { label: "NOM", value: "NOM-009-STPS-2011" },
                  { label: "Fecha de emisión", value: "14/05/2026" },
                  { label: "Fecha de vencimiento", value: "14/05/2028" },
                ].map((field) => (
                  <div key={field.label}>
                    <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-1">
                      {field.label}
                    </div>
                    <div className="text-sm font-semibold text-ink-800">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider-hair" />

              <div className="px-6 py-5 flex flex-wrap items-center gap-3">
                <button className="btn-secondary">
                  <Download className="h-4 w-4" /> Descargar PDF DC-3
                </button>
                <button className="btn-ghost">
                  <Mail className="h-4 w-4" /> Enviar por correo
                </button>
              </div>

              <div className="border-t border-line px-6 py-3 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-coral-500" />
                <p className="field-mono">
                  Emitido por Agente Capacitador Externo registrado ante la STPS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
