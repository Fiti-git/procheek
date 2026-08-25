"use client";

import * as React from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  Eye,
  Ban,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { apiGet, apiPost, apiPatch, getCurrentUser } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

type Cert = {
  id: string;
  code: string;
  userId: string;
  courseId: string;
  dc3Folio: string | null;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
};

type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
};

type Course = { id: string; slug: string; titleEs: string };

type CertState = "vigente" | "por_vencer" | "vencido" | "revocado";

function stateOf(c: Cert): CertState {
  if (c.revokedAt) return "revocado";
  if (!c.expiresAt) return "vigente";
  const exp = new Date(c.expiresAt).getTime();
  const now = Date.now();
  if (exp < now) return "vencido";
  const days = (exp - now) / 86400000;
  if (days <= 30) return "por_vencer";
  return "vigente";
}

const STATE_LABEL: Record<CertState, string> = {
  vigente: "Vigente",
  por_vencer: "Por vencer",
  vencido: "Vencido",
  revocado: "Revocado",
};

function StateBadge({ state }: { state: CertState }) {
  const map = {
    vigente: {
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    por_vencer: {
      icon: Clock,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    vencido: {
      icon: AlertTriangle,
      cls: "bg-red-50 text-red-700 border-red-200",
    },
    revocado: {
      icon: XCircle,
      cls: "bg-ink-100 text-ink-700 border-line",
    },
  } as const;
  const { icon: Icon, cls } = map[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <Icon className="h-3 w-3" /> {STATE_LABEL[state]}
    </span>
  );
}

function fmtDate(iso?: string | null) {
  if (!iso) return "Sin dato";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function userName(u?: User) {
  if (!u) return "Sin dato";
  const f = u.firstName ?? u.first_name ?? "";
  const l = u.lastName ?? u.last_name ?? "";
  return `${f} ${l}`.trim() || u.email;
}

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const [ready, setReady] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);
  const [certs, setCerts] = React.useState<Cert[]>([]);
  const [users, setUsers] = React.useState<Record<string, User>>({});
  const [courses, setCourses] = React.useState<Record<string, Course>>({});
  const [q, setQ] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<CertState | "">("");
  const [issueOpen, setIssueOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<Cert | null>(null);
  const [revoke, setRevoke] = React.useState<Cert | null>(null);
  const [edit, setEdit] = React.useState<Cert | null>(null);

  const load = React.useCallback(async () => {
    try {
      const data = await apiGet<any[]>("/certificates/admin/all");
      const mapped: Cert[] = (data || []).map((c: any) => ({
        id: c.id,
        code: c.code,
        userId: c.userId ?? c.user_id,
        courseId: c.courseId ?? c.course_id,
        dc3Folio: c.dc3Folio ?? c.dc3_folio ?? null,
        issuedAt: c.issuedAt ?? c.issued_at,
        expiresAt: c.expiresAt ?? c.expires_at ?? null,
        revokedAt: c.revokedAt ?? c.revoked_at ?? null,
        revokedReason: c.revokedReason ?? c.revoked_reason ?? null,
      }));
      setCerts(mapped);
    } catch {
      setCerts([]);
    }
  }, []);

  React.useEffect(() => {
    const u = getCurrentUser();
    setAuthorized(u?.role === "principal_admin");
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!authorized) return;
    load();
    (async () => {
      try {
        const us = await apiGet<any[]>("/users");
        const map: Record<string, User> = {};
        for (const u of us || []) map[u.id] = u;
        setUsers(map);
      } catch {
        // ignore
      }
      try {
        const cs = await apiGet<any[]>("/courses");
        const map: Record<string, Course> = {};
        for (const c of cs || [])
          map[c.id] = { id: c.id, slug: c.slug, titleEs: c.titleEs ?? c.title_es };
        setCourses(map);
      } catch {
        // ignore
      }
    })();
  }, [authorized, load]);

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return certs.filter((c) => {
      const holder = userName(users[c.userId]).toLowerCase();
      if (ql) {
        if (
          !c.code.toLowerCase().includes(ql) &&
          !holder.includes(ql) &&
          !(c.dc3Folio || "").toLowerCase().includes(ql)
        )
          return false;
      }
      if (courseFilter && c.courseId !== courseFilter) return false;
      if (stateFilter && stateOf(c) !== stateFilter) return false;
      return true;
    });
  }, [certs, users, q, courseFilter, stateFilter]);

  if (!ready) return null;
  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="font-display text-2xl text-ink-900">Acceso restringido</h1>
        <p className="mt-2 text-sm text-ink-500">
          Solo el administrador principal puede acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="kicker mb-2">Administración</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Gestión de certificados.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Emisión, edición y revocación de certificados DC-3 en toda la plataforma.
          </p>
        </div>
        <Button onClick={() => setIssueOpen(true)}>
          <Plus className="h-4 w-4 mr-2 inline" />
          Emitir certificado manualmente
        </Button>
      </div>

      <div className="bg-white border border-line rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[240px]">
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <Input
              className="pl-9"
              placeholder="Folio, titular o DC-3..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="min-w-[220px]">
          <Label>Curso</Label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink"
          >
            <option value="">Todos los cursos</option>
            {Object.values(courses).map((c) => (
              <option key={c.id} value={c.id}>
                {c.titleEs}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px]">
          <Label>Estado</Label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as any)}
            className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink"
          >
            <option value="">Todos</option>
            <option value="vigente">Vigente</option>
            <option value="por_vencer">Por vencer</option>
            <option value="vencido">Vencido</option>
            <option value="revocado">Revocado</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas-2">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Folio
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Titular
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Curso
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Emisión
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Vigencia
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-ink-500">
                    <ShieldCheck className="h-8 w-8 mx-auto text-ink-300 mb-2" />
                    No hay certificados que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const st = stateOf(c);
                return (
                  <tr
                    key={c.id}
                    className="border-t border-line hover:bg-canvas-2 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink-800">
                      {c.code}
                      {c.dc3Folio && (
                        <div className="text-[10px] text-ink-500 mt-0.5">
                          DC-3: {c.dc3Folio}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-900 font-medium">
                      {userName(users[c.userId])}
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      {courses[c.courseId]?.titleEs ?? "Sin dato"}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{fmtDate(c.issuedAt)}</td>
                    <td className="px-4 py-3 text-ink-700">{fmtDate(c.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <StateBadge state={st} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDetail(c)}
                          className="p-1.5 rounded-lg text-ink-700 hover:bg-ink-100"
                          aria-label="Ver detalle"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEdit(c)}
                          className="p-1.5 rounded-lg text-ink-700 hover:bg-ink-100"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRevoke(c)}
                          disabled={!!c.revokedAt}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label="Revocar"
                          title="Revocar"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <IssueModal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        users={Object.values(users)}
        courses={Object.values(courses)}
        onIssued={() => {
          setIssueOpen(false);
          load();
        }}
      />

      <DetailModal
        cert={detail}
        onClose={() => setDetail(null)}
        holder={detail ? userName(users[detail.userId]) : ""}
        course={detail ? courses[detail.courseId]?.titleEs ?? "Sin dato" : ""}
      />

      <RevokeModal
        cert={revoke}
        onClose={() => setRevoke(null)}
        onDone={() => {
          setRevoke(null);
          load();
        }}
      />

      <EditModal
        cert={edit}
        onClose={() => setEdit(null)}
        onDone={() => {
          setEdit(null);
          load();
        }}
      />
    </div>
  );
}

function IssueModal({
  open,
  onClose,
  users,
  courses,
  onIssued,
}: {
  open: boolean;
  onClose: () => void;
  users: User[];
  courses: Course[];
  onIssued: () => void;
}) {
  const { toast } = useToast();
  const [userId, setUserId] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [folio, setFolio] = React.useState("");
  const [expires, setExpires] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setUserId("");
      setCourseId("");
      setFolio("");
      setExpires("");
    }
  }, [open]);

  const submit = async () => {
    if (!userId || !courseId) {
      toast({ title: "Selecciona titular y curso", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      await apiPost("/certificates/admin/issue", {
        userId,
        courseId,
        dc3Folio: folio || undefined,
        expiresAt: expires ? new Date(expires).toISOString() : undefined,
      });
      toast({ title: "Certificado emitido", variant: "success" });
      onIssued();
    } catch (e: any) {
      toast({
        title: "No se pudo emitir",
        description: e?.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Emitir certificado manualmente"
      description="Genera un DC-3 sin requerir avance en curso."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <Label>Titular</Label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
          >
            <option value="">Selecciona usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {userName(u)} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Curso</Label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm"
          >
            <option value="">Selecciona curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titleEs}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Folio DC-3 (opcional)</Label>
          <Input value={folio} onChange={(e) => setFolio(e.target.value)} />
        </div>
        <div>
          <Label>Fecha de vigencia (opcional)</Label>
          <Input
            type="date"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Emitiendo..." : "Emitir"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DetailModal({
  cert,
  onClose,
  holder,
  course,
}: {
  cert: Cert | null;
  onClose: () => void;
  holder: string;
  course: string;
}) {
  return (
    <Modal
      open={!!cert}
      onClose={onClose}
      title="Detalle del certificado"
      size="md"
    >
      {cert && (
        <div className="space-y-3 text-sm">
          <Row label="Folio" value={cert.code} mono />
          <Row label="DC-3" value={cert.dc3Folio || "Sin dato"} />
          <Row label="Titular" value={holder} />
          <Row label="Curso" value={course} />
          <Row label="Emitido" value={fmtDate(cert.issuedAt)} />
          <Row label="Vigencia" value={fmtDate(cert.expiresAt)} />
          <Row label="Estado" value={STATE_LABEL[stateOf(cert)]} />
          {cert.revokedAt && (
            <>
              <Row label="Revocado" value={fmtDate(cert.revokedAt)} />
              <Row label="Motivo" value={cert.revokedReason || "Sin dato"} />
            </>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <span className="text-ink-500 text-xs uppercase tracking-widest">{label}</span>
      <span
        className={`text-ink-900 ${mono ? "font-mono text-xs" : ""} text-right`}
      >
        {value}
      </span>
    </div>
  );
}

function RevokeModal({
  cert,
  onClose,
  onDone,
}: {
  cert: Cert | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (cert) setReason("");
  }, [cert]);

  const submit = async () => {
    if (!cert) return;
    setSaving(true);
    try {
      await apiPost(`/certificates/${cert.id}/revoke`, { reason });
      toast({ title: "Certificado revocado", variant: "success" });
      onDone();
    } catch (e: any) {
      toast({
        title: "No se pudo revocar",
        description: e?.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!cert} onClose={onClose} title="Revocar certificado" size="sm">
      {cert && (
        <div className="space-y-4">
          <p className="text-sm text-ink-700">
            Estás por revocar el folio{" "}
            <span className="font-mono text-xs">{cert.code}</span>. Esta acción no
            se puede deshacer.
          </p>
          <div>
            <Label>Motivo</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. curso no aprobado, error de emisión..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Revocando..." : "Confirmar revocación"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function EditModal({
  cert,
  onClose,
  onDone,
}: {
  cert: Cert | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [expires, setExpires] = React.useState("");
  const [folio, setFolio] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (cert) {
      setExpires(cert.expiresAt ? cert.expiresAt.slice(0, 10) : "");
      setFolio(cert.dc3Folio || "");
    }
  }, [cert]);

  const submit = async () => {
    if (!cert) return;
    setSaving(true);
    try {
      await apiPatch(`/certificates/${cert.id}`, {
        expiresAt: expires ? new Date(expires).toISOString() : null,
        dc3Folio: folio || null,
      });
      toast({ title: "Certificado actualizado", variant: "success" });
      onDone();
    } catch (e: any) {
      toast({
        title: "No se pudo actualizar",
        description: e?.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!cert} onClose={onClose} title="Editar certificado" size="sm">
      {cert && (
        <div className="space-y-4">
          <div>
            <Label>Folio DC-3</Label>
            <Input value={folio} onChange={(e) => setFolio(e.target.value)} />
          </div>
          <div>
            <Label>Fecha de vigencia</Label>
            <Input
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
