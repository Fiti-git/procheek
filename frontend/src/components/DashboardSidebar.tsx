"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  Library,
  Users,
  BarChart3,
  LayoutDashboard,
  Target,
  Briefcase,
  Wallet,
  Calendar,
  UserCircle,
  Presentation,
  UserCog,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getCurrentUser, type CurrentUser } from "@/lib/api";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const complianceItems: NavItem[] = [
  { href: "/dashboard/courses", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/certificates", label: "Certificados", icon: Award },
  { href: "/dashboard/library", label: "Biblioteca", icon: Library },
  { href: "/dashboard/team", label: "Equipo", icon: Users },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
];

const salesItems: NavItem[] = [
  { href: "/dashboard/sales", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/sales/leads", label: "Prospectos", icon: Target },
  { href: "/dashboard/sales/deals", label: "Ventas", icon: Briefcase },
  { href: "/dashboard/sales/commissions", label: "Comisiones", icon: Wallet },
  { href: "/dashboard/sales/appointments", label: "Citas", icon: Calendar },
  { href: "/dashboard/sales/profile", label: "Perfil", icon: UserCircle },
];

const adminItems: NavItem[] = [
  { href: "/dashboard/admin/bulk-assign", label: "Asignar cursos en lote", icon: ClipboardCheck },
  { href: "/dashboard/admin/certificates", label: "Gestión de certificados", icon: ShieldCheck },
  { href: "/dashboard/admin/library", label: "Biblioteca", icon: Library },
];

const accountItem: NavItem = {
  href: "/dashboard/account",
  label: "Mi cuenta",
  icon: UserCog,
};

const trainerItems: NavItem[] = [
  { href: "/dashboard/trainer", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/trainer/sessions", label: "Sesiones", icon: Presentation },
  { href: "/dashboard/trainer/appointments", label: "Citas", icon: Calendar },
  { href: "/dashboard/trainer/profile", label: "Perfil", icon: UserCircle },
];

const ROLE_LABEL: Record<string, string> = {
  principal_admin: "Administrador",
  vendedor: "Vendedor",
  capacitador: "Capacitador",
  client: "Cliente",
  client_admin: "Administrador de cliente",
  subcontractor: "Subcontratista",
  employee: "Empleado",
};

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string | null;
}) {
  return (
    <>
      <div className="text-xs uppercase tracking-widest text-ink-400 font-medium px-3 mb-2 mt-4">
        {title}
      </div>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard/sales" &&
            item.href !== "/dashboard/trainer" &&
            pathname?.startsWith(item.href + "/")) ||
          // exact match for panel roots
          ((item.href === "/dashboard/sales" ||
            item.href === "/dashboard/trainer") &&
            pathname === item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative",
              active
                ? "bg-ink-50 text-ink-900 font-medium"
                : "text-ink-700 hover:bg-canvas-2",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-coral-500 rounded-r" />
            )}
            <Icon
              className={cn(
                "h-4 w-4",
                active ? "text-ink-900" : "text-ink-500",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const role = user?.role || "employee";
  const roleLabel = ROLE_LABEL[role] || "Empleado";

  const showSales = role === "vendedor" || role === "principal_admin";
  const showTrainer = role === "capacitador" || role === "principal_admin";
  const showCompliance =
    role === "principal_admin" ||
    role === "client" ||
    role === "client_admin" ||
    role === "subcontractor" ||
    role === "employee" ||
    !user;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-line">
      <div className="h-16 flex items-center px-5 border-b border-line">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg tracking-tight text-ink-900 leading-none">
              PROCHECK
            </span>
            <span className="font-display font-normal text-sm text-coral-500 leading-none">
              Safety
            </span>
          </div>
          <span className="text-xs text-ink-500 mt-1">{roleLabel}</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {showSales && (
          <NavGroup title="Ventas" items={salesItems} pathname={pathname} />
        )}
        {showTrainer && (
          <NavGroup
            title="Capacitación"
            items={trainerItems}
            pathname={pathname}
          />
        )}
        {showCompliance && (
          <NavGroup
            title="Cumplimiento"
            items={complianceItems}
            pathname={pathname}
          />
        )}
        {role === "principal_admin" && (
          <NavGroup
            title="Administración"
            items={adminItems}
            pathname={pathname}
          />
        )}
        <NavGroup title="Cuenta" items={[accountItem]} pathname={pathname} />
      </nav>

      <div className="p-4 border-t border-line">
        <div className="rounded-lg bg-canvas-2 p-3 text-xs text-ink-700">
          <p className="font-semibold text-ink-900 text-sm mb-1">
            ¿Necesitas ayuda?
          </p>
          <p className="text-ink-500">
            Contacta a soporte para acompañamiento en cumplimiento STPS.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
