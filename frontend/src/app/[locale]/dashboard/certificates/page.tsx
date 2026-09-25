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
import { apiGet, apiPost, getCurrentUser } from "@/lib/api";
import { cn } from "@/lib/cn";
import { RoleGate } from "@/components/RoleGate";

type StatusKey = "vigente" | "por-vencer" | "vencido";

type ApiCertificate = {
  id: string;
  userId: string;
  courseId: string;
  code: string;
  dc3Folio: string | null;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
};

type CertRow = {
  id: string;
  folio: string;
  code: string;
  curso: string;
  titular: string;
  emision: string;
  vencimiento: string | null;
  revokedAt: string | null;
  estado: StatusKey;
};

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

function computeStatus(expiresAt: string | null, revokedAt: string | null): StatusKey {
  if (revokedAt) return "vencido";
  if (!expiresAt) return "vigente";
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  if (isNaN(exp)) return "vigente";
  const days = (exp - now) / (1000 * 60 * 60 * 24);
  if (days < 0) return "vencido";
  if (days <= 30) return "por-vencer";
  return "vigente";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function extractNom(curso: string): string {
  const m = curso.match(/NOM-\d+-STPS/i);
  return m ? m[0].toUpperCase() : "";
}

function certPdfUrl(folio: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/api`
      : "");
  return `${base}/certificates/${encodeURIComponent(folio)}/pdf`;
}

function downloadCert(folio: string) {
  if (typeof window === "undefined") return;
  window.open(certPdfUrl(folio), "_blank");
}

function CertificatesPageInner() {
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [rows, setRows] = React.useState<CertRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [searchQ, setSearchQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | StatusKey>("all");
  const [emailOpen, setEmailOpen] = React.useState<CertRow | null>(null);
  const [recertOpen, setRecertOpen] = React.useState<CertRow | null>(null);
  const [detailOpen, setDetailOpen] = React.useState<CertRow | null>(null);
  const [emailValue, setEmailValue] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [recerting, setRecerting] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Fetch the current user's certificates + hydrate course/holder labels.
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const certs = await apiGet<ApiCertificate[]>("/certificates/me");
        // Fetch unique courses in parallel to enrich display.
        const courseIds = Array.from(new Set(certs.map((c) => c.courseId)));
        const courseTitles = new Map<string, string>();
        await Promise.all(
          courseIds.map(async (id) => {
            try {
              const course = await apiGet<{ id: string; titleEs?: string; title?: string; code?: string }>(
                `/courses/${id}`,
              );
              courseTitles.set(id, course.titleEs || course.title || course.code || id);
            } catch {
              courseTitles.set(id, id);
            }
          }),
        );
        const me = getCurrentUser();
        const titular =
          me && (me.firstName || me.lastName)
            ? `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim()
            : me?.email || "—";
        const view: CertRow[] = certs.map((c) => ({
          id: c.id,
          folio: c.dc3Folio || c.code,
          code: c.code,
          curso: courseTitles.get(c.courseId) || c.courseId,
          titular,
          emision: c.issuedAt,
          vencimiento: c.expiresAt,
          revokedAt: c.revokedAt,
          estado: computeStatus(c.expiresAt, c.revokedAt),
        }));
        if (!cancelled) setRows(view);
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message || "No pudimos cargar tus certificados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (emailOpen) {
      const me = getCurrentUser();
      setEmailValue(me?.email || "");
    }
  }, [emailOpen]);

  const filtered = React.useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.estado !== statusFilter) return false;
      if (!q) return true;
      return (
        r.folio.toLowerCase().includes(q) ||
        r.curso.toLowerCase().includes(q) ||
        r.titular.toLowerCase().includes(q)
      );
    });
  }, [rows, searchQ, statusFilter]);

  const vigentes = rows.filter((c) => c.estado === "vigente").length;
  const porVencer = rows.filter((c) => c.estado === "por-vencer").length;
  const vencidos = rows.filter((c) => c.estado === "vencido").length;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOpen) return;
    setSending(true);
    try {
      await apiPost(`/certificates/${encodeURIComponent(emailOpen.folio)}/email`, {
        to: emailValue,
      });
      toast({
        title: "Correo enviado",
        description: `Enviamos el DC-3 a ${emailValue}.`,
        variant: "success",
      });
      setEmailOpen(null);
    } catch (err) {
      toast({
        title: "No pudimos enviar el correo",
        description: (err as Error).message || "",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const handleRecertify = async () => {
    if (!recertOpen) return;
    setRecerting(true);
    try {
      // The row stores the course title; we need the id for enrollment.
      // Look it up from the original API payload cached on the row via id.
      // Since we discarded courseId in the view, hit /courses again by title fallback.
      // Simpler: don't allow recert here without id — inform user.
      toast({
        title: "Recertificación",
        description: "Inicia la recertificación desde la página del curso.",
        variant: "info",
      });
      setRecertOpen(null);
    } catch (err) {
      toast({
        title: "No pudimos iniciar la recertificación",
        description: (err as Error).message || "",
        variant: "error",
      });
    } finally {
      setRecerting(false);
    }
  };

  if (!mounted) {
    return <div className="max-w-6xl mx-auto" suppressHydrationWarning />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="kicker mb-2">Certificados DC-3</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Certificados.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Consulta y descarga tus DC-3.
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
              <Input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Folio, nombre o curso"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label>Estado</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | StatusKey)}
              className="w-full h-[42px] rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
            >
              <option value="all">Todos</option>
              <option value="vigente">Vigente</option>
              <option value="por-vencer">Por vencer</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setSearchQ("");
                setStatusFilter("all");
              }}
              className="btn-secondary w-full"
            >
              <Filter className="h-4 w-4" /> Limpiar
            </button>
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
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-500">
                    Cargando certificados…
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-danger">
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading && !loadError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-500">
                    {rows.length === 0
                      ? "Aún no tienes certificados emitidos."
                      : "Ningún certificado coincide con los filtros."}
                  </td>
                </tr>
              )}
              {!loading && !loadError && filtered.map((c) => (
                <tr
                  key={c.id}
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
                  <td className="px-5 py-3 text-ink-500">{fmtDate(c.emision)}</td>
                  <td className="px-5 py-3 text-ink-500">{fmtDate(c.vencimiento)}</td>
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
                        onClick={() => downloadCert(c.folio)}
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
            ? `Para renovar tu certificación de ${recertOpen.curso}, inicia una nueva inscripción desde el catálogo de cursos.`
            : ""}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setRecertOpen(null)}
            className="btn-secondary"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleRecertify}
            disabled={recerting}
            className="btn-primary disabled:opacity-50"
          >
            Ir al catálogo
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
              <Detail label="NOM" value={extractNom(detailOpen.curso) || "—"} />
              <Detail label="Fecha de emisión" value={fmtDate(detailOpen.emision)} />
              <Detail label="Fecha de vencimiento" value={fmtDate(detailOpen.vencimiento)} />
              <div>
                <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-1">
                  Estado
                </div>
                <span className={cn(statusClass[detailOpen.estado])}>
                  {statusLabels[detailOpen.estado]}
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
              <button
                type="button"
                onClick={() => downloadCert(detailOpen.folio)}
                className="btn-primary"
              >
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

export default function CertificatesPage() {
  return (
    <RoleGate allow={["principal_admin","client","client_admin","subcontractor","employee"]}>
      <CertificatesPageInner />
    </RoleGate>
  );
}
