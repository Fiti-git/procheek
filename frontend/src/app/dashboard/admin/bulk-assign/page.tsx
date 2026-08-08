"use client";

import * as React from "react";
import { ClipboardCheck, Users, BookOpen, Building2 } from "lucide-react";
import { apiGet, apiPost, getCurrentUser } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Course = { id: string; slug: string; titleEs: string; title_es?: string };
type Company = { id: string; name: string };
type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  companyId?: string | null;
  company_id?: string | null;
  role?: string;
  roleCode?: string;
  role_code?: string;
  isActive?: boolean;
  is_active?: boolean;
};

const FAKE_COMPANIES: Company[] = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Constructora Demo" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Grupo Industrial Norte" },
  { id: "00000000-0000-0000-0000-000000000003", name: "Servicios Manufactureros MX" },
];

function fullName(u: User) {
  const f = u.firstName ?? u.first_name ?? "";
  const l = u.lastName ?? u.last_name ?? "";
  return `${f} ${l}`.trim() || u.email;
}

function companyOf(u: User): string | null {
  return u.companyId ?? u.company_id ?? null;
}

function roleOf(u: User): string {
  return u.roleCode ?? u.role_code ?? u.role ?? "";
}

export default function BulkAssignPage() {
  const { toast } = useToast();
  const [ready, setReady] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [courseId, setCourseId] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const u = getCurrentUser();
    setAuthorized(u?.role === "principal_admin");
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const c = await apiGet<Course[]>("/courses");
        setCourses(
          (c || []).map((x: any) => ({
            id: x.id,
            slug: x.slug,
            titleEs: x.titleEs ?? x.title_es ?? x.slug,
          })),
        );
      } catch {
        setCourses([]);
      }
      try {
        const cs = await apiGet<any[]>("/companies");
        const list: Company[] = (cs || []).map((x: any) => ({
          id: x.id,
          name: x.name ?? x.legalName ?? x.slug ?? "Empresa",
        }));
        setCompanies(list.length > 0 ? list : FAKE_COMPANIES);
      } catch {
        setCompanies(FAKE_COMPANIES);
      }
      try {
        const us = await apiGet<User[]>("/users");
        setUsers(us || []);
      } catch {
        setUsers([]);
      }
    })();
  }, [authorized]);

  const usersInCompany = React.useMemo(
    () =>
      users.filter(
        (u) =>
          companyOf(u) === companyId &&
          (u.isActive ?? u.is_active ?? true) &&
          !["principal_admin"].includes(roleOf(u)),
      ),
    [users, companyId],
  );

  const allSelected =
    usersInCompany.length > 0 && usersInCompany.every((u) => selected.has(u.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      for (const u of usersInCompany) next.delete(u.id);
      setSelected(next);
    } else {
      const next = new Set(selected);
      for (const u of usersInCompany) next.add(u.id);
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const submit = async () => {
    if (!courseId) {
      toast({ title: "Selecciona un curso", variant: "error" });
      return;
    }
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast({ title: "Selecciona al menos un usuario", variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost<{ enrolled: number; skipped: number }>(
        "/enrollments/bulk",
        { courseId, userIds: ids },
      );
      toast({
        title: "Asignación completada",
        description: `${res.enrolled} inscritos, ${res.skipped} omitidos.`,
        variant: "success",
      });
      setSelected(new Set());
    } catch (e: any) {
      toast({
        title: "No se pudo asignar",
        description: e?.message || "Error desconocido",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="kicker mb-2">Administración</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Asignar cursos en lote.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Inscribe a varios colaboradores en un curso NOM de forma simultánea.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-ink-400" />
            <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
              Paso 1: elige curso
            </p>
          </div>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink"
          >
            <option value="">Selecciona un curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titleEs}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-ink-400" />
            <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
              Paso 2: elige empresa
            </p>
          </div>
          <select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setSelected(new Set());
            }}
            className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink"
          >
            <option value="">Selecciona una empresa</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-ink-400" />
            <h3 className="font-display text-lg font-semibold text-ink-900">
              Paso 3: selecciona usuarios
            </h3>
          </div>
          <span className="text-xs text-ink-500">
            {selected.size} seleccionados
          </span>
        </div>
        {!companyId && (
          <div className="p-8 text-center text-sm text-ink-500">
            Selecciona una empresa para ver a sus usuarios.
          </div>
        )}
        {companyId && usersInCompany.length === 0 && (
          <div className="p-8 text-center text-sm text-ink-500">
            No hay usuarios registrados en esta empresa.
          </div>
        )}
        {companyId && usersInCompany.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-2">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                    Seleccionar todos
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                    Correo
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                    Rol
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersInCompany.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-line hover:bg-canvas-2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleOne(u.id)}
                        aria-label={`Seleccionar ${fullName(u)}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {fullName(u)}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{u.email}</td>
                    <td className="px-4 py-3 text-ink-500 text-xs">
                      {roleOf(u)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          onClick={submit}
          disabled={submitting || selected.size === 0 || !courseId}
        >
          <ClipboardCheck className="h-4 w-4 mr-2 inline" />
          {submitting
            ? "Asignando..."
            : `Asignar curso a ${selected.size} usuarios seleccionados`}
        </Button>
      </div>
    </div>
  );
}
