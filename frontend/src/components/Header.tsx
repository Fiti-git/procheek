"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { CartBadge } from "./CartBadge";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "/courses", label: t("courses") },
    { href: "/consulting", label: t("consulting") },
    { href: "/software", label: t("software") },
    { href: "/certificate-lookup", label: t("certificateLookup") },
    { href: "/help", label: t("resources") },
  ] as const;

  const switchLocale = (next: "es" | "en") => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

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
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo_bg_removed.png"
            alt={t("logoAlt")}
            width={160}
            height={160}
            className={`shrink-0 w-auto transition-all duration-300 ${scrolled ? "h-10 md:h-12" : "h-12 md:h-16"}`}
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

        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center rounded-full border border-line overflow-hidden text-xs font-semibold"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => switchLocale("es")}
              className={`px-2.5 py-1 transition-colors ${
                locale === "es"
                  ? "bg-ink-900 text-white"
                  : "text-ink-500 bg-white hover:text-ink-900"
              }`}
              aria-pressed={locale === "es"}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={`px-2.5 py-1 transition-colors ${
                locale === "en"
                  ? "bg-ink-900 text-white"
                  : "text-ink-500 bg-white hover:text-ink-900"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <CartBadge />
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-5 py-2 transition-all shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
