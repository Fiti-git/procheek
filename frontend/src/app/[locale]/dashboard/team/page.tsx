"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  UserPlus,
  MoreHorizontal,
  Users,
  CheckCircle2,
  TrendingUp,
  Trash2,
  Mail,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { IMG } from "@/lib/images";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { RoleGate } from "@/components/RoleGate";

type ApiMember = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleCode: string;
  isActive: boolean;
  createdAt: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleCode: string;
  last: string;
  avatar: string;
};

const ROLE_LABELS: Record<string, string> = {
  vendedor: "Vendedor",
  capacitador: "Capacitador",
  client_admin: "Admin de cliente",
  client: "Cliente",
  subcontractor: "Subcontratista",
  employee: "Empleado",
  principal_admin: "Administrador",
};

const INVITE_ROLES: { value: string; label: string }[] = [
  { value: "employee", label: "Empleado" },
  { value: "subcontractor", label: "Subcontratista" },
  { value: "vendedor", label: "Vendedor" },
  { value: "capacitador", label: "Capacitador" },
  { value: "client_admin", label: "Admin de cliente" },
];

const AVATARS = [IMG.avatar1, IMG.avatar2, IMG.avatar3];

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `Registrado: ${dd}/${mm}/${yyyy}`;
  } catch {
    return "—";
  }
}

function mapMember(m: ApiMember, idx: number): Member {
  const name =
    [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || m.email;
  return {
    id: m.id,
    name,
    email: m.email,
    role: ROLE_LABELS[m.roleCode] || m.roleCode,
    roleCode: m.roleCode,
    last: formatCreatedAt(m.createdAt),
    avatar: AVATARS[idx % AVATARS.length],
  };
}

function TeamPageInner() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"directos" | "subs">("directos");
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(INVITE_ROLES[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiGet<ApiMember[]>("/companies/my/members");
      setMembers((data || []).map(mapMember));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar el equipo";
      if (/403|forbidden/i.test(msg)) {
        setMembers([]);
      } else {
        setLoadError(
          "No pudimos cargar el equipo. Intenta nuevamente en unos momentos.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast({
        title: "Completa los campos",
        description: "Nombre y correo son obligatorios.",
        variant: "error",
      });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      toast({
        title: "Correo inválido",
        description: "Revisa el formato del correo electrónico.",
        variant: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/users/invite", {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        roleCode: role,
      });
      toast({
        title: "Invitación enviada",
        description: `${firstName.trim()} recibirá un correo para activar su cuenta.`,
        variant: "success",
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole(INVITE_ROLES[0].value);
      setShowInvite(false);
      await load();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo enviar la invitación";
      toast({ title: "Error al invitar", description: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = (id: string) => {
    setOpenMenu(null);
    const m = members.find((x) => x.id === id);
    toast({
      title: "Función en desarrollo",
      description: m
        ? `Eliminar a ${m.name} estará disponible pronto.`
        : "La eliminación de miembros estará disponible pronto.",
    });
  };

  const onResend = (id: string) => {
    const m = members.find((x) => x.id === id);
    setOpenMenu(null);
    if (m) {
      toast({
        title: "Función en desarrollo",
        description: `El reenvío de invitación a ${m.email} estará disponible pronto.`,
      });
    }
  };

  const activos = members.length;
  const cupos = Math.max(0, 30 - members.length);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="kicker mb-2">Gestión de equipo</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Equipo.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Gestiona empleados directos y equipos de subcontratistas.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowInvite((v) => !v)}
        >
          <UserPlus className="h-4 w-4" /> Invitar miembro
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Miembros activos", value: `${activos}`, icon: Users },
          { label: "Cupos disponibles", value: `${cupos}`, icon: UserPlus },
          { label: "Cumplimiento promedio", value: "—", icon: TrendingUp },
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
            <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center">
              <k.icon className="h-5 w-5 text-coral-600" />
            </div>
          </div>
        ))}
      </div>

      {showInvite && (
        <form
          onSubmit={onInvite}
          className="bg-white border border-line rounded-xl p-5 mb-6"
        >
          <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight mb-4">
            Invitar nuevo miembro
          </h3>
          <div className="grid sm:grid-cols-4 gap-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
              placeholder="Nombre"
              required
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
              placeholder="Apellido"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
              placeholder="Correo electrónico"
              type="email"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
            >
              {INVITE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary text-sm py-2 px-4"
              onClick={() => setShowInvite(false)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary text-sm py-2 px-4"
              disabled={submitting}
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Enviando…" : "Enviar invitación"}
            </button>
          </div>
        </form>
      )}

      <div className="inline-flex rounded-lg border border-line p-1 mb-4 bg-white">
        {(
          [
            { key: "directos", label: "Empleados directos" },
            { key: "subs", label: "Subcontratistas" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 h-9 rounded-md text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-ink-900 text-white"
                : "text-ink-700 hover:bg-canvas-2",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas-2">
              <tr>
                {["Miembro", "Rol", "Cursos", "Puntuación", "Última actividad"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-sm text-ink-500"
                  >
                    Cargando equipo…
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-sm text-ink-500"
                  >
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading && !loadError && members.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-sm text-ink-500"
                  >
                    Aún no hay miembros en tu equipo. Invita al primero.
                  </td>
                </tr>
              )}
              {!loading &&
                !loadError &&
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-line hover:bg-canvas-2 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={m.avatar}
                          alt={m.name}
                          width={36}
                          height={36}
                          sizes="36px"
                          className="h-9 w-9 rounded-full object-cover border border-line"
                          quality={80}
                        />
                        <div>
                          <div className="font-medium text-ink-900">
                            {m.name}
                          </div>
                          <div className="text-xs text-ink-500">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge-compliance">{m.role}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">
                      —
                    </td>
                    <td className="px-5 py-3 font-display text-lg font-semibold text-ink-900">
                      —
                    </td>
                    <td className="px-5 py-3 text-ink-500">{m.last}</td>
                    <td className="px-5 py-3 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenu((cur) => (cur === m.id ? null : m.id))
                        }
                        className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors"
                        aria-label={`Acciones para ${m.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === m.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-full z-20 mt-1 w-52 bg-white border border-line rounded-lg shadow-cardHover overflow-hidden"
                        >
                          <button
                            onClick={() => onResend(m.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-800 hover:bg-canvas-2 text-left"
                          >
                            <Mail className="h-4 w-4 text-ink-500" /> Reenviar
                            invitación
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              toast({
                                title: "Función en desarrollo",
                                description:
                                  "La edición de miembros estará disponible pronto.",
                              });
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-800 hover:bg-canvas-2 text-left"
                          >
                            <Pencil className="h-4 w-4 text-ink-500" /> Editar
                            miembro
                          </button>
                          <div className="h-px bg-line" />
                          <button
                            onClick={() => onRemove(m.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg text-left"
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar del equipo
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <RoleGate allow={["principal_admin","client","client_admin","subcontractor","employee"]}>
      <TeamPageInner />
    </RoleGate>
  );
}
