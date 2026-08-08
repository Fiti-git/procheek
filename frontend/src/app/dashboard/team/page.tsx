"use client";

import { useState } from "react";
import { UserPlus, MoreHorizontal, Users, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { IMG } from "@/lib/images";

const members = [
  { name: "María Fernanda López", role: "Supervisor", completed: 6, assigned: 8, score: 92, last: "Hace 2 días", avatar: IMG.avatar1 },
  { name: "Carlos Ramírez Ortega", role: "Operador", completed: 4, assigned: 5, score: 88, last: "Hoy", avatar: IMG.avatar2 },
  { name: "Ana Sofía Gutiérrez", role: "Vendedor", completed: 7, assigned: 7, score: 95, last: "Ayer", avatar: IMG.avatar3 },
  { name: "José Luis Hernández", role: "Capacitador", completed: 10, assigned: 10, score: 98, last: "Hace 3 días", avatar: IMG.avatar2 },
];

const roles = ["Administrador", "Supervisor", "Operador", "Vendedor", "Capacitador"];

export default function TeamPage() {
  const [tab, setTab] = useState<"directos" | "subs">("directos");
  const [showInvite, setShowInvite] = useState(false);

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

      {/* KPI */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Miembros activos", value: "24", icon: Users },
          { label: "Cupos disponibles", value: "6", icon: UserPlus },
          { label: "Cumplimiento promedio", value: "92%", icon: TrendingUp },
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
        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight mb-4">
            Invitar nuevo miembro
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
              placeholder="Nombre completo"
            />
            <input
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
              placeholder="Correo electrónico"
              type="email"
            />
            <select className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink">
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="btn-secondary text-sm py-2 px-4"
              onClick={() => setShowInvite(false)}
            >
              Cancelar
            </button>
            <button className="btn-primary text-sm py-2 px-4">
              <CheckCircle2 className="h-4 w-4" /> Enviar invitación
            </button>
          </div>
        </div>
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
              {members.map((m) => (
                <tr
                  key={m.name}
                  className="border-t border-line hover:bg-canvas-2 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="h-9 w-9 rounded-full object-cover border border-line"
                      />
                      <span className="font-medium text-ink-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge-compliance">{m.role}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-700">
                    {m.completed}/{m.assigned}
                  </td>
                  <td className="px-5 py-3 font-display text-lg font-semibold text-ink-900">
                    {m.score}
                  </td>
                  <td className="px-5 py-3 text-ink-500">{m.last}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-2 rounded-lg text-ink-700 hover:bg-canvas-2 hover:text-coral-500 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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
