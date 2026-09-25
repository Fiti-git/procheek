import {
  Users,
  BarChart3,
  ShieldCheck,
  FileText,
  Lock,
  MessageCircle,
  Check,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IMG } from "@/lib/images";

async function TeamPreview() {
  const t = await getTranslations("Software");
  const rows = [
    { name: "María López", role: t("roleSupervisor"), status: "success" },
    { name: "Carlos Ramírez", role: t("roleOperator"), status: "success" },
    { name: "Ana Gutiérrez", role: t("roleSales"), status: "warn" },
    { name: "José Hernández", role: t("roleTrainer"), status: "success" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-line shadow-cardHover overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 bg-canvas-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.55)" }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(245,158,11,0.55)" }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(16,185,129,0.55)" }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="font-mono text-xs text-ink-500 bg-white border border-line rounded-md px-3 py-1">
            app.procheck.mx/dashboard/team
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h4 className="font-display font-semibold text-ink-900 text-base tracking-tight">
            {t("teamTitle")}
          </h4>
          <span className="text-[10px] text-ink-500 font-mono">{t("teamActive")}</span>
        </div>
        <div className="border border-line rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 px-3 py-2 bg-canvas-2 border-b border-line text-[10px] uppercase tracking-wider text-ink-500 font-medium">
            <span>{t("colMember")}</span>
            <span>{t("colRole")}</span>
            <span className="text-right">{t("colCompliance")}</span>
          </div>
          {rows.map((r, idx) => (
            <div
              key={r.name}
              className={`grid grid-cols-3 items-center px-3 py-2.5 text-xs ${
                idx > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="text-ink-800 font-medium">{r.name}</span>
              <span className="text-ink-700">{r.role}</span>
              <span className="text-right">
                <span
                  className={
                    r.status === "warn" ? "badge-status-warn" : "badge-status-success"
                  }
                >
                  {r.status === "warn" ? t("statusExpiring") : t("statusUpToDate")}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function SoftwarePage() {
  const t = await getTranslations("Software");

  const tiers = [
    {
      name: t("starterName"),
      price: t("starterPrice"),
      per: t("starterPer"),
      desc: t("starterDesc"),
      features: {
        [t("featUsersUpTo25")]: true,
        [t("featNomCatalog")]: true,
        [t("featDc3")]: true,
        [t("featBasicReports")]: true,
        [t("featSubcontractors")]: false,
        [t("featPrioritySupport")]: false,
        [t("featSso")]: false,
      },
      highlight: false,
      cta: t("starterCta"),
      variant: "secondary" as const,
    },
    {
      name: t("businessName"),
      price: t("businessPrice"),
      per: t("businessPer"),
      desc: t("businessDesc"),
      features: {
        [t("featUsersUpTo150")]: true,
        [t("featNomCatalog")]: true,
        [t("featDc3")]: true,
        [t("featBasicReports")]: true,
        [t("featSubcontractors")]: true,
        [t("featPrioritySupport")]: true,
        [t("featSso")]: false,
      },
      highlight: true,
      cta: t("businessCta"),
      variant: "primary" as const,
    },
    {
      name: t("enterpriseName"),
      price: t("enterprisePrice"),
      per: t("enterprisePer"),
      desc: t("enterpriseDesc"),
      features: {
        [t("featUsersUpTo25")]: false,
        [t("featNomCatalog")]: true,
        [t("featDc3")]: true,
        [t("featBasicReports")]: true,
        [t("featSubcontractors")]: true,
        [t("featPrioritySupport")]: true,
        [t("featSso")]: true,
      },
      highlight: false,
      cta: t("enterpriseCta"),
      variant: "secondary" as const,
    },
  ];

  const badges = [t("badgeStps"), t("badgeDc3"), t("badgeLfpdppp")];

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-[#FBB601] mb-3">
              {t("kicker")}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.08] tracking-tighter [hyphens:none] break-words">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link
                href="#planes"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-5 py-3 shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
              >
                {t("ctaPlans")}
              </Link>
              <Link
                href="/consulting"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-[#FBB601] transition-colors"
              >
                {t("ctaDemo")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {badges.map((b) => (
                <span key={b} className="badge-compliance">
                  <ShieldCheck className="h-3 w-3 text-coral-500" />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-cardHover aspect-[4/3] border border-line">
              <Image
                src={IMG.softwareShowcase}
                alt="Software PROCHECK en planta industrial"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                quality={95}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">{t("featuresKicker")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              {t("featuresTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BarChart3, title: t("reportsTitle"), desc: t("reportsDesc") },
              { icon: ShieldCheck, title: t("auditTitle"), desc: t("auditDesc") },
              { icon: Users, title: t("smallCard1Title"), desc: t("smallCard1Desc") },
              { icon: FileText, title: t("smallCard2Title"), desc: t("smallCard2Desc") },
              { icon: Lock, title: t("smallCard3Title"), desc: t("smallCard3Desc") },
              { icon: MessageCircle, title: t("supportTitle"), desc: t("supportDesc") },
            ].map((f) => (
              <div key={f.title} className="card-enterprise p-7 flex flex-col">
                <div className="h-11 w-11 rounded-lg bg-coral-50 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-coral-600" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planes" className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">{t("plansKicker")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              {t("plansTitle")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  "relative bg-white rounded-xl p-7 flex flex-col " +
                  (tier.highlight
                    ? "border border-coral-500 shadow-cardHover"
                    : "border border-line")
                }
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center bg-coral-50 text-coral-700 border border-coral-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {t("recommended")}
                    </span>
                  </div>
                )}
                <div className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-display text-4xl font-semibold text-ink-900 tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-ink-500">{tier.per}</span>
                </div>
                <p className="text-sm text-ink-700 mb-6 leading-relaxed">{tier.desc}</p>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {Object.entries(tier.features).map(([f, on]) => (
                    <li
                      key={f}
                      className={
                        "flex items-center gap-2.5 text-sm " +
                        (on ? "text-ink-800" : "text-ink-300")
                      }
                    >
                      {on ? (
                        <Check className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <span className="h-4 w-4 flex items-center justify-center text-ink-300">
                          -
                        </span>
                      )}
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/consulting"
                  className={
                    (tier.variant === "primary" ? "btn-primary" : "btn-secondary") +
                    " w-full"
                  }
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
