"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartBadge } from "./CartBadge";

const nav = [
  { href: "/courses", label: "Cursos" },
  { href: "/consulting", label: "Consultoría" },
  { href: "/software", label: "Software" },
  { href: "/certificate-lookup", label: "Verificar certificado" },
  { href: "/help", label: "Recursos" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky z-40 w-full transition-all duration-300 ease-out ${
        scrolled ? "top-4 px-4" : "top-0 px-0"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between gap-6 transition-all duration-300 ease-out ${
          scrolled
            ? "max-w-7xl h-16 rounded-full border border-line/80 bg-white/90 pl-4 pr-3 shadow-[0_10px_40px_-10px_rgba(15,23,37,0.15)] backdrop-blur-md"
            : "container-page h-20 rounded-none border-b border-line bg-white pl-0 pr-0"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center rounded-lg text-white font-display font-bold tracking-tight shrink-0 transition-all duration-300 ${
              scrolled ? "h-10 w-10 text-sm" : "h-11 w-11 text-sm"
            }`}
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
            <span
              className={`mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500 transition-all duration-300 ${
                scrolled ? "hidden xl:block" : "hidden sm:block"
              }`}
            >
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
          <div className="hidden md:flex items-center rounded-full border border-line overflow-hidden text-xs font-semibold">
            <span className="px-2.5 py-1 bg-ink-900 text-white">ES</span>
            <span className="px-2.5 py-1 text-ink-500 bg-white">EN</span>
          </div>
          <CartBadge />
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm px-5 py-2 transition-all shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
