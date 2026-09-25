"use client";

import {
  Search,
  Mail,
  MessageCircle,
  ChevronDown,
  BookOpen,
  BadgeCheck,
  Receipt,
  Users,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";

export default function HelpPage() {
  const { toast } = useToast();
  const t = useTranslations("Help");

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
    { q: t("faq6Q"), a: t("faq6A") },
    { q: t("faq7Q"), a: t("faq7A") },
    { q: t("faq8Q"), a: t("faq8A") },
  ];

  const categories = [
    { icon: BookOpen, title: t("cat1Title"), desc: t("cat1Desc") },
    { icon: BadgeCheck, title: t("cat2Title"), desc: t("cat2Desc") },
    { icon: Receipt, title: t("cat3Title"), desc: t("cat3Desc") },
    { icon: Users, title: t("cat4Title"), desc: t("cat4Desc") },
  ];

  return (
    <>
      {/* SUPPORT HERO */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-[#FBB601] mb-3">
              {t("kicker")}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.08] tracking-tight sm:tracking-tighter [hyphens:none] break-words">
              {t("title")}
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              {t("subtitle")}
            </p>

            <div className="mt-10 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-500" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 text-base bg-white border border-line rounded-xl text-ink-900 placeholder:text-ink-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBB601] focus:border-[#FBB601] transition-shadow"
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <a
              href="mailto:contacto@procheck.mx"
              className="card-enterprise p-6 hover:border-coral-200 transition-colors flex flex-col"
            >
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                {t("emailTitle")}
              </h3>
              <p className="text-sm text-ink-700 mt-1">contacto@procheck.mx</p>
            </a>

            <div className="card-enterprise p-6 flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-coral-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                {t("chatTitle")}
              </h3>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: t("chatToastTitle"),
                    description: t("chatToastDesc"),
                    variant: "info",
                  })
                }
                className="mt-2 text-sm font-medium text-coral-600 hover:text-coral-700 inline-flex items-center gap-1 self-start"
              >
                {t("chatStart")} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page max-w-3xl">
          <div className="mb-12">
            <p className="kicker mb-3">{t("faqKicker")}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group card-enterprise bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4">
                  <span className="font-display text-base md:text-lg font-semibold text-ink-900 tracking-tight">
                    {f.q}
                  </span>
                  <ChevronDown className="h-5 w-5 text-coral-500 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 -mt-1 text-ink-700 leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">{t("categoriesKicker")}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
              {t("categoriesTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((c) => (
              <div key={c.title} className="card-enterprise p-7 group">
                <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                  <c.icon className="h-5 w-5 text-coral-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed">{c.desc}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-coral-600 hover:text-coral-700 transition-colors"
                >
                  {t("seeMore")}{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-canvas-2 py-16">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
            {t("finalTitle")}
          </h2>
          <p className="mt-4 text-ink-700 leading-relaxed">{t("finalSubtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/agendar?type=consulting" className="btn-primary">
              {t("finalCta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
