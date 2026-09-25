"use client";

import { useState, FormEvent } from "react";
import {
  Search,
  Download,
  Mail,
  ShieldCheck,
  Award,
  AlertTriangle,
  Calendar,
  User,
  Hash,
  BookOpen,
  BadgeCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { certificates, type Certificate } from "@/lib/certificates";
import { useToast } from "@/components/ui/Toast";

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function nomCodeFromCourse(courseText: string) {
  const match = courseText.match(/^([A-Z]+-\d+)/);
  return match ? match[1] : courseText.slice(0, 8);
}

export default function CertificateLookupPage() {
  const t = useTranslations("Lookup");
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const found = certificates.find(
      (c) =>
        c.folio.toLowerCase() === q.toLowerCase() ||
        (c.curp && c.curp.toLowerCase() === q.toLowerCase()),
    );
    setResult(found ?? null);
    setSubmitted(true);
    setLoading(false);
  };

  const onDownload = () => {
    if (!result) return;
    const base =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:5000/api`
        : "");
    window.open(
      `${base}/certificates/${encodeURIComponent(result.folio)}/pdf`,
      "_blank",
    );
  };

  const onReset = () => {
    setQuery("");
    setResult(null);
    setSubmitted(false);
  };

  const displayCert = result;
  const statusMap = {
    vigente: {
      label: t("statusActive"),
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeIcon: BadgeCheck,
    },
    "por-vencer": {
      label: "Por vencer",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      badgeIcon: AlertTriangle,
    },
    vencido: {
      label: "Vencido",
      className: "bg-red-50 text-red-700 border-red-200",
      badgeIcon: AlertTriangle,
    },
  } as const;

  return (
    <section className="min-h-[80vh] bg-gradient-to-b from-canvas via-white to-canvas">
      {/* HERO */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white">
        <div className="container-page py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FBB601] mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("kicker")}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] [hyphens:none] break-words text-white">
              {t("title")}
            </h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
              {t("subtitle")}
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-10 bg-white rounded-2xl p-3 shadow-2xl border border-white/20"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("placeholder")}
                    className="pl-12 h-14 text-base border-0 focus:ring-0 focus:border-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="h-14 px-8 rounded-xl bg-[#FBB601] hover:bg-[#D99A00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> {t("search")}
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-ink-500 mt-3 px-2 font-mono">
                {t("example")}
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* RESULT */}
      <div className="container-page py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {!submitted && (
            <div className="text-center py-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-canvas-2 border border-line flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-ink-400" />
              </div>
              <p className="text-sm text-ink-500">
                Ingresa un folio o CURP para verificar la validez de un certificado
                DC-3 emitido por PROCHECK.
              </p>
            </div>
          )}

          {submitted && !displayCert && (
            <div className="bg-white border border-line rounded-2xl p-10 md:p-14 text-center shadow-card">
              <div className="mx-auto h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-5">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
                Certificado no encontrado
              </h2>
              <p className="mt-3 text-sm text-ink-700 max-w-md mx-auto leading-relaxed">
                No encontramos un certificado con el folio o CURP{" "}
                <span className="font-mono font-semibold text-ink-900 break-all">
                  &ldquo;{query}&rdquo;
                </span>
                . Verifica que los datos sean correctos e intenta de nuevo.
              </p>
              <button
                onClick={onReset}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D99A00] hover:text-[#FBB601]"
              >
                Nueva búsqueda
              </button>
            </div>
          )}

          {submitted && displayCert && (
            <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-card">
              {/* Status bar */}
              <div
                className={`px-6 py-4 flex items-center gap-3 border-b border-line ${statusMap[displayCert.estado].className}`}
              >
                {(() => {
                  const Icon = statusMap[displayCert.estado].badgeIcon;
                  return <Icon className="h-5 w-5 shrink-0" />;
                })()}
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {displayCert.estado === "vigente"
                      ? "Certificado válido y vigente"
                      : displayCert.estado === "por-vencer"
                        ? "Certificado próximo a vencer"
                        : "Certificado vencido"}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    Verificado ante el registro STPS
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/60 border border-current">
                  {statusMap[displayCert.estado].label}
                </span>
              </div>

              {/* Certificate header */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-canvas via-white to-canvas-2 border-b border-line">
                <div className="flex items-start gap-5">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#FBB601] to-[#D99A00] flex items-center justify-center shrink-0 shadow-md">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-ink-500 font-mono">
                      Constancia de Competencias · DC-3
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight mt-1 break-words">
                      {displayCert.titular.toUpperCase()}
                    </h2>
                    <div className="mt-1 text-sm text-ink-600">
                      Folio{" "}
                      <span className="font-mono font-semibold text-ink-900 break-all">
                        {displayCert.folio}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="p-6 md:p-8 grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  {
                    icon: BookOpen,
                    label: "Curso",
                    value: displayCert.curso,
                  },
                  {
                    icon: Hash,
                    label: "Norma",
                    value: nomCodeFromCourse(displayCert.curso),
                  },
                  {
                    icon: User,
                    label: "Titular",
                    value: displayCert.titular,
                  },
                  {
                    icon: Hash,
                    label: "Folio",
                    value: displayCert.folio,
                    mono: true,
                  },
                  {
                    icon: Calendar,
                    label: "Fecha de emisión",
                    value: fmtDate(displayCert.emision),
                  },
                  {
                    icon: Calendar,
                    label: "Vigente hasta",
                    value: fmtDate(displayCert.vencimiento),
                  },
                ].map((field) => (
                  <div key={field.label} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-canvas-2 border border-line flex items-center justify-center shrink-0 mt-0.5">
                      <field.icon className="h-4 w-4 text-ink-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-medium mb-1">
                        {field.label}
                      </div>
                      <div
                        className={`text-sm font-semibold text-ink-900 ${field.mono ? "font-mono break-all" : "break-words"}`}
                      >
                        {field.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-6 md:px-8 py-5 border-t border-line bg-canvas-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onDownload}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm transition-colors"
                >
                  <Download className="h-4 w-4" /> Descargar PDF DC-3
                </button>
                <button
                  onClick={() =>
                    toast({
                      title: "Enlace enviado",
                      description: `Certificado enviado al correo del titular.`,
                      variant: "success",
                    })
                  }
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-line hover:bg-canvas text-ink-800 font-medium text-sm transition-colors"
                >
                  <Mail className="h-4 w-4" /> Enviar por correo
                </button>
                <button
                  onClick={onReset}
                  className="ml-auto text-sm font-semibold text-[#D99A00] hover:text-[#FBB601]"
                >
                  Nueva búsqueda
                </button>
              </div>

              {/* Footer note */}
              <div className="px-6 md:px-8 py-3 border-t border-line bg-white flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#D99A00] shrink-0" />
                <p className="text-xs text-ink-500 font-mono">
                  Emitido por Agente Capacitador Externo registrado ante la STPS ·
                  Formato oficial DC-3
                </p>
              </div>
            </div>
          )}

          {/* Sample folios helper */}
          {!submitted && (
            <div className="mt-10 bg-white border border-line rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-4">
                Folios de ejemplo para probar
              </div>
              <div className="flex flex-wrap gap-2">
                {certificates.slice(0, 6).map((c) => (
                  <button
                    key={c.folio}
                    type="button"
                    onClick={() => setQuery(c.folio)}
                    className="font-mono text-xs bg-canvas-2 hover:bg-canvas border border-line hover:border-line-strong text-ink-800 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {c.folio}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
