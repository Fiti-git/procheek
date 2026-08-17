"use client";

import Link from "next/link";
import { CartBadge } from "./CartBadge";

const nav = [
  { href: "/courses", label: "Cursos" },
  { href: "/consulting", label: "Consultoría" },
  { href: "/software", label: "Software" },
  { href: "/certificate-lookup", label: "Verificar certificado" },
  { href: "/help", label: "Recursos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-md text-white font-display font-bold text-sm tracking-tight shrink-0"
            style={{ background: "linear-gradient(135deg, #0F1E3D 0%, #F97316 100%)" }}
            aria-hidden
          >
            PC
          </span>
          <span className="flex flex-col leading-none">
            <span className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight text-ink-900">
                PROCHECK
              </span>
              <span className="font-display font-light text-base text-ink-600 tracking-wide">
                SAFETY
              </span>
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500 hidden sm:block">
              Plataforma de capacitación STPS
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center rounded-md border border-line overflow-hidden text-xs font-semibold">
            <span className="px-2.5 py-1 bg-ink-900 text-white">ES</span>
            <span className="px-2.5 py-1 text-ink-500 bg-white">EN</span>
          </div>
          <CartBadge />
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm px-5 py-2.5 transition-colors shadow-sm"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
