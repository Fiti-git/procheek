"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Download,
  Award,
  AlertTriangle,
  XCircle,
  Eye,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { certificates, type Certificate } from "@/lib/certificates";
import { apiPost, getCurrentUser } from "@/lib/api";
import { cn } from "@/lib/cn";

type StatusKey = "vigente" | "por-vencer" | "vencido";

const statusClass: Record<StatusKey, string> = {
  vigente: "badge-status-success",
  "por-vencer": "badge-status-warn",
  vencido: "badge-status-danger",
};

const statusLabels: Record<StatusKey, string> = {
  vigente: "Vigente",
  "por-vencer": "Por vencer",
  vencido: "Vencido",
};

function computeStatus(vencimiento: string): StatusKey {
  const now = Date.now();
  const exp = new Date(vencimiento).getTime();
  if (isNaN(exp)) return "vigente";
  const days = (exp - now) / (1000 * 60 * 60 * 24);
  if (days < 0) return "vencido";
  if (days <= 30) return "por-vencer";
  return "vigente";
}

// NOM code extraction if course string contains it.
function extractNom(curso: string): string {
  const m = curso.match(/NOM-\d+-STPS/i);
  return m ? m[0].toUpperCase() : "";
}

// Fake id from folio for endpoint calls (real backend would provide id).
function certId(c: Certificate): string {
  return c.folio;
}

export default function CertificatesPage() {
  const { toast } = useToast();
  const [rows] = React.useState<Certificate[]>(certificates);
  const [emailOpen, setEmailOpen] = React.useState<Certificate | null>(null);
  const [recertOpen, setRecertOpen] = React.useState<Certificate | null>(null);
  const [detailOpen, setDetailOpen] = React.useState<Certificate | null>(null);
  const [emailValue, setEmailValue] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [recerting, setRecerting] = React.useState(false);

  React.useEffect(() => {
    if (emailOpen) {
      const me = getCurrentUser();
      setEmailValue(me?.email || "");
    }
  }, [emailOpen]);

  const derived = React.useMemo(
    () => rows.map((r) => ({ ...r, estado: computeStatus(r.vencimiento) })),
    [rows],
  );

  const vigentes = derived.filter((c) => c.estado === "vigente").length;
  const porVencer = derived.filter((c) => c.estado === "por-vencer").length;
  const vencidos = derived.filter((c) => c.estado === "vencido").length;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOpen) return;
    setSending(true);
    try {
      await apiPost(`/certificates/${certId(emailOpen)}/email`, {
        to: emailValue,
      });
      toast({
        title: "Correo enviado",
        description: `Enviamos el DC-3 a ${emailValue}.`,
        variant: "success",
      });
      setEmailOpen(null);
    } catch (err) {
      const msg = (err as Error).message || "";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        toast({
          title: "Función próximamente disponible",
          description: "El envío por correo aún no está listo.",
          variant: "info",
        });
        setEmailOpen(null);
      } else {
        toast({
          title: "No pudimos enviar el correo",
          description: msg,
          variant: "error",
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleRecertify = async () => {
    if (!recertOpen) return;
    setRecerting(true);
    try {
      await apiPost(`/enrollments`, { courseId: recertOpen.curso });
      toast({
        title: "Recertificación iniciada",
        description: "Se creó una nueva inscripción al curso.",
        variant: "success",
      });
      setRecertOpen(null);
    } catch (err) {
      const msg = (err as Error).message || "";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        toast({
          title: "Función próximamente disponible",
          description: "La recertificación aún no está lista.",
          variant: "info",
        });
        setRecertOpen(null);
      } else {
        toast({
          title: "No pudimos iniciar la recertificación",
          description: msg,
          variant: "error",
        });
      }
    } finally {
      setRecerting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="kicker mb-2">Certificados DC-3</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Certificados.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Consulta y descarga los DC-3 de tu organización.
        </p>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total vigentes", value: vigentes, icon: Award, tone: "success" },
          { label: "Por vencer", value: porVencer, icon: AlertTriangle, tone: "warn" },
          { label: "Vencidos", value: vencidos, icon: XCircle, tone: "danger" },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white border border-line rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-2">
                {k.label}
              </div>
              <div className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
                {k.value}
              </div>
            </div>
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                k.tone === "success" && "bg-success-bg text-success",
                k.tone === "warn" && "bg-warn-bg text-warn",
                k.tone === "danger" && "bg-danger-bg text-danger",
              )}
            >
              <k.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <Input placeholder="Folio, nombre o curso" className="pl-9" />
            </div>
          </div>
          <div>
            <Label>Estado</Label>
            <select className="w-full h-[42px] rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink">
              <option>Todos</option>
              <option>Vigente</option>
              <option>Por vencer</option>
              <option>Vencido</option>
            </select>
          </div>
          <div>
            <button className="btn-primary w-full">
              <Filter className="h-4 w-4" /> Aplicar
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-line">
          <h3 className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
            VIGENCIA
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <Label>Desde</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Hasta</Label>
              <Input type="date" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas-2">
              <tr>
                {[
                  "Certificado",
                  "Folio",
                  "Fecha emisión",
                  "Fecha vencimiento",
                  "Estado",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium"
                  >
                    {h}
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {derived.map((c) => (
                <tr
                  key={c.folio}
                  className="border-t border-line hover:bg-canvas-2 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink-900">{c.curso}</div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {c.titular}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-700">
                    {c.folio}
                  </td>
                  <td className="px-5 py-3 text-ink-500">{c.emision}</td>
                  <td className="px-5 py-3 text-ink-500">{c.vencimiento}</td>
                  <td className="px-5 py-3">
                    <span className={cn(statusClass[c.estado])}>
                      {statusLabels[c.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailOpen(c)}
                        title="Ver detalle"
                        className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailOpen(c)}
                        title="Enviar por correo"
                        className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecertOpen(c)}
                        title="Recertificar"
                        className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Descargar PDF"
                        className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email modal */}
      <Modal
        open={!!emailOpen}
        onClose={() => setEmailOpen(null)}
        title="Enviar DC-3 por correo"
        description={
          emailOpen
            ? `Se enviará el certificado ${emailOpen.folio}.`
            : undefined
        }
        size="sm"
      >
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <Label>Correo destinatario</Label>
            <Input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="correo@empresa.com"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEmailOpen(null)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary disabled:opacity-50"
            >
              {sending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recert modal */}
      <Modal
        open={!!recertOpen}
        onClose={() => setRecertOpen(null)}
        title="Recertificar"
        size="sm"
      >
        <p className="text-sm text-ink-700">
          {recertOpen
            ? `¿Renovar tu certificación de ${recertOpen.curso}? Se creará una nueva inscripción al mismo curso.`
            : ""}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setRecertOpen(null)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRecertify}
            disabled={recerting}
            className="btn-primary disabled:opacity-50"
          >
            {recerting ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detailOpen}
        onClose={() => setDetailOpen(null)}
        title="Detalle del certificado"
        size="lg"
      >
        {detailOpen && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Detail label="Certificado" value={detailOpen.curso} />
              <Detail label="Folio" value={detailOpen.folio} mono />
              <Detail label="Titular" value={detailOpen.titular} />
              <Detail label="NOM" value={extractNom(detailOpen.curso) || "-"} />
              <Detail label="Fecha de emisión" value={detailOpen.emision} />
              <Detail
                label="Fecha de vencimiento"
                value={detailOpen.vencimiento}
              />
              <Detail label="Calificación final" value="-" />
              <div>
                <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-1">
                  Estado
                </div>
                <span
                  className={cn(
                    statusClass[computeStatus(detailOpen.vencimiento)],
                  )}
                >
                  {statusLabels[computeStatus(detailOpen.vencimiento)]}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  const c = detailOpen;
                  setDetailOpen(null);
                  setEmailOpen(c);
                }}
                className="btn-secondary"
              >
                <Mail className="h-4 w-4" /> Enviar por correo
              </button>
              <button type="button" className="btn-primary">
                <Download className="h-4 w-4" /> Descargar PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-1">
        {label}
      </div>
      <div
        className={cn(
          "text-ink-900",
          mono && "font-mono text-xs text-ink-700",
        )}
      >
        {value}
      </div>
    </div>
  );
}
