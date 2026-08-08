"use client";

import * as React from "react";
import {
  Bell,
  Search,
  BadgeCheck,
  BellRing,
  Trophy,
  AlertCircle,
  Info,
} from "lucide-react";
import { apiGet, apiPatch, getCurrentUser } from "@/lib/api";
import { cn } from "@/lib/cn";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  link?: string | null;
  readAt: string | null;
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
  principal_admin: "Administrador",
  vendedor: "Vendedor",
  capacitador: "Capacitador",
  client: "Cliente",
  client_admin: "Administrador de cliente",
  subcontractor: "Subcontratista",
  employee: "Empleado",
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} d`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

function kindIcon(kind: string) {
  if (kind.includes("certificate_issued") || kind === "quiz_passed") return Trophy;
  if (kind.includes("expiring") || kind.includes("revoked") || kind === "quiz_failed") return AlertCircle;
  if (kind === "invite" || kind === "enrolled") return BellRing;
  return Info;
}

export function DashboardTopbar() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Notif[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState<ReturnType<typeof getCurrentUser>>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<any[]>("/notifications");
      const mapped: Notif[] = (data || []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        kind: n.kind,
        link: n.link,
        readAt: n.readAt ?? n.read_at ?? null,
        createdAt: n.createdAt ?? n.created_at,
      }));
      setItems(mapped);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const t = window.setInterval(load, 60000);
    return () => window.clearInterval(t);
  }, [load]);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const unreadCount = items.filter((n) => !n.readAt).length;

  const markAll = async () => {
    try {
      await apiPatch("/notifications/read-all");
      setItems((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })),
      );
    } catch {
      // ignore
    }
  };

  const markOne = async (id: string) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) =>
          n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
    } catch {
      // ignore
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MP";
  const displayName = user?.name || "María Pérez";
  const roleLabel = user ? ROLE_LABEL[user.role] || "Empleado" : "Constructora Demo";

  const shown = items.slice(0, 8);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="flex h-full items-center gap-4 px-6">
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              placeholder="Buscar cursos, certificados, equipo..."
              className="w-full h-10 rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10 transition-colors"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="badge-compliance">
            <BadgeCheck className="h-3.5 w-3.5 text-coral-500" />
            Rol de prueba
          </span>
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-canvas-2 transition-colors"
              aria-label="Notificaciones"
              aria-expanded={open}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-coral-500 ring-2 ring-canvas" />
              )}
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-line rounded-xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                  <p className="font-display text-sm font-semibold text-ink-900">
                    Notificaciones
                  </p>
                  <span className="text-xs text-ink-500">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading && items.length === 0 && (
                    <div className="p-6 text-center text-xs text-ink-500">
                      Cargando...
                    </div>
                  )}
                  {!loading && shown.length === 0 && (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 mx-auto text-ink-300 mb-2" />
                      <p className="text-sm text-ink-700 font-medium">
                        Todo al día
                      </p>
                      <p className="text-xs text-ink-500 mt-1">
                        No tienes notificaciones nuevas.
                      </p>
                    </div>
                  )}
                  {shown.map((n) => {
                    const Icon = kindIcon(n.kind);
                    const unread = !n.readAt;
                    return (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => markOne(n.id)}
                        className={cn(
                          "w-full text-left flex items-start gap-3 px-4 py-3 border-b border-line last:border-b-0 hover:bg-canvas-2 transition-colors",
                          unread && "bg-canvas-2/50",
                        )}
                      >
                        <div className="mt-0.5 shrink-0 h-8 w-8 rounded-lg bg-canvas-2 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-coral-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "text-sm truncate",
                                unread
                                  ? "font-semibold text-ink-900"
                                  : "text-ink-800",
                              )}
                            >
                              {n.title}
                            </p>
                            {unread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-coral-500 shrink-0" />
                            )}
                          </div>
                          {n.body && (
                            <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                              {n.body}
                            </p>
                          )}
                          <p className="text-[11px] text-ink-400 mt-1">
                            {relativeTime(n.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {items.length > 0 && (
                  <div className="border-t border-line px-4 py-2.5">
                    <button
                      type="button"
                      onClick={markAll}
                      className="text-xs text-coral-600 hover:text-coral-700 font-medium"
                    >
                      Marcar todas como leídas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-line">
            <div className="h-9 w-9 rounded-full bg-ink-100 text-ink-900 border border-line flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-sm">
              <div className="font-medium text-ink-900 leading-tight">
                {displayName}
              </div>
              <div className="text-xs text-ink-500 leading-tight mt-0.5">
                {roleLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;
