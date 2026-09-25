"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { CartBadge } from "./CartBadge";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Header");
  const pathname = usePathname();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll + Escape to close + focus mgmt
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Focus close button when opened
    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      // Return focus to opener
      openBtnRef.current?.focus();
    };
  }, [menuOpen]);

  const nav = [
    { href: "/courses", label: t("courses") },
    { href: "/consulting", label: t("consulting") },
    { href: "/software", label: t("software") },
    { href: "/certificate-lookup", label: t("certificateLookup") },
    { href: "/help", label: t("resources") },
  ] as const;

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header
        className={`sticky z-40 w-full transition-all duration-300 ease-out ${
          scrolled ? "top-4 px-4" : "top-0 px-0"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 md:gap-6 transition-all duration-300 ease-out ${
            scrolled
              ? "max-w-7xl h-20 rounded-2xl border border-line/80 bg-white/95 pl-5 pr-4 shadow-[0_10px_40px_-10px_rgba(15,23,37,0.15)] backdrop-blur-md"
              : "container-page h-24 rounded-none border-b border-line bg-white"
          }`}
        >
          <Link href="/" className="flex items-center min-w-0">
            <Image
              src="/images/logo_hires.png"
              alt={t("logoAlt")}
              width={1254}
              height={1254}
              className={`shrink-0 w-auto transition-all duration-300 ${scrolled ? "h-12 md:h-16" : "h-14 md:h-20"}`}
              priority
            />
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

          <div className="flex items-center gap-2 md:gap-3">
            <CartBadge />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-full bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-5 py-2 transition-all shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5"
            >
              {t("signIn")}
            </Link>
            <button
              ref={openBtnRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-line text-ink-900 hover:bg-canvas-2 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label={t("closeMenu")}
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        />

        {/* Panel */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-20 border-b border-line">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center">
              <Image
                src="/images/logo_hires.png"
                alt={t("logoAlt")}
                width={1254}
                height={1254}
                className="h-12 w-auto"
              />
            </Link>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("closeMenu")}
              className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-line text-ink-900 hover:bg-canvas-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {nav.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 min-h-[48px] text-base font-medium transition-colors ${
                        active
                          ? "bg-[#FBB601]/10 text-ink-900"
                          : "text-ink-800 hover:bg-canvas-2 hover:text-ink-900"
                      }`}
                    >
                      <span>{n.label}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FBB601]" aria-hidden />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-5 py-5 border-t border-line space-y-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-5 py-3 shadow-orangeGlow transition-all"
            >
              {t("signIn")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
