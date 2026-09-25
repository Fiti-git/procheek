"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Check,
  GraduationCap,
  Play,
  Calendar,
  BarChart3,
  Users,
  ClipboardCheck,
  TrendingUp,
  Gift,
  Star,
} from "lucide-react";
import { IMG } from "@/lib/images";
import { DC3Card } from "@/components/DC3Card";

function ProductPreview({
  imageAlt,
  checklistTitle,
  checklist,
  stampApproved,
}: {
  imageAlt: string;
  checklistTitle: string;
  checklist: string[];
  stampApproved: string;
}) {
  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden shadow-cardHover aspect-[16/10] bg-ink-900">
        <Image
          src={IMG.heroMain}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          quality={95}
          priority
        />
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl border border-line p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <span className="font-display font-bold text-ink-900 tracking-tight">
            {checklistTitle}
          </span>
          <ClipboardCheck className="h-5 w-5 text-[#FBB601]" />
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shrink-0">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-ink-800 font-medium">{item}</span>
            </li>
          ))}
        </ul>
        <div
          className="absolute -bottom-3 -right-3 border-2 border-emerald-600 text-emerald-600 font-display font-bold text-xs tracking-widest px-3 py-1 rounded bg-white"
          style={{ transform: "rotate(-6deg)" }}
        >
          {stampApproved}
        </div>
      </div>
    </div>
  );
}

function CoursePlayerMock({
  playerAlt,
  modules,
  modulesLabel,
  moduleProgress,
  liveLabel,
}: {
  playerAlt: string;
  modules: { n: number; title: string; state: "done" | "active" | "pending" }[];
  modulesLabel: string;
  moduleProgress: string;
  liveLabel: string;
}) {
  return (
    <div className="bg-ink-900 text-white rounded-2xl border border-ink-800 shadow-cardHover overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3 bg-ink-800">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="font-mono text-xs text-ink-300 bg-ink-900 border border-ink-700 rounded-md px-3 py-1">
            app.procheck.mx/cursos/nom-009/modulo-2
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-0">
        <div className="md:col-span-2 p-4">
          <div className="relative aspect-video rounded-lg overflow-hidden photo-duotone">
            <Image
              src={IMG.course_altura}
              alt={playerAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              quality={90}
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#FBB601] shadow-cardHover flex items-center justify-center">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
              <div
                className="h-full bg-[#FBB601] rounded-full"
                style={{ width: "68%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ink-300">
              <span>{moduleProgress}</span>
              <span>12:34 / 18:45</span>
            </div>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-ink-800 p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-400 font-medium mb-3">
            {modulesLabel}
          </div>
          <ul className="space-y-2">
            {modules.map((m) => (
              <li
                key={m.n}
                className={`flex items-center gap-2 text-xs leading-tight ${
                  m.state === "active"
                    ? "text-[#FBB601] font-medium"
                    : m.state === "done"
                      ? "text-emerald-400"
                      : "text-ink-300"
                }`}
              >
                <span className="font-mono text-[10px] w-4 shrink-0">
                  {m.n}.
                </span>
                <span className="flex-1">{m.title}</span>
                {m.state === "done" && (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                )}
                {m.state === "active" && (
                  <span className="text-[9px] font-mono uppercase tracking-wider bg-[#FBB601]/20 border border-[#FBB601]/40 px-1.5 py-0.5 rounded shrink-0">
                    {liveLabel}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const t = useTranslations("Landing");

  const heroChecklist = [
    t("hero.checklist1"),
    t("hero.checklist2"),
    t("hero.checklist3"),
    t("hero.checklist4"),
    t("hero.checklist5"),
    t("hero.checklist6"),
  ];

  const heroFeatures = [
    { icon: GraduationCap, text: t("hero.feature1") },
    { icon: BadgeCheck, text: t("hero.feature2") },
    { icon: BarChart3, text: t("hero.feature3") },
    { icon: Users, text: t("hero.feature4") },
  ];

  const heroStats = [
    { icon: ShieldCheck, label: t("hero.footerStat1") },
    { icon: ClipboardCheck, label: t("hero.footerStat2") },
    { icon: Users, label: t("hero.footerStat3") },
    { icon: TrendingUp, label: t("hero.footerStat4") },
  ];

  const featureBlocks = [
    {
      heading: t("features.block1Heading"),
      text: t("features.block1Text"),
      image: IMG.chemical,
      alt: t("features.block1Alt"),
      imageLeft: true,
    },
    {
      heading: t("features.block2Heading"),
      text: t("features.block2Text"),
      image: IMG.metalmech,
      alt: t("features.block2Alt"),
      imageLeft: false,
    },
    {
      heading: t("features.block3Heading"),
      text: t("features.block3Text"),
      image: IMG.heroConsulting,
      alt: t("features.block3Alt"),
      imageLeft: true,
    },
  ];

  const coursePlayerModules: {
    n: number;
    title: string;
    state: "done" | "active" | "pending";
  }[] = [
    { n: 1, title: t("player.module1Title"), state: "done" },
    { n: 2, title: t("player.module2Title"), state: "active" },
    { n: 3, title: t("player.module3Title"), state: "pending" },
    { n: 4, title: t("player.module4Title"), state: "pending" },
    { n: 5, title: t("player.module5Title"), state: "pending" },
  ];

  const playerItems = [
    { title: t("player.item1Title"), text: t("player.item1Text") },
    { title: t("player.item2Title"), text: t("player.item2Text") },
    { title: t("player.item3Title"), text: t("player.item3Text") },
    { title: t("player.item4Title"), text: t("player.item4Text") },
  ];

  const pricingTiers = [
    {
      name: t("pricing.tierBasicName"),
      monthly: "$2,490" as string | null,
      annual: "$24,900" as string | null,
      features: [
        t("pricing.tierBasicFeature1"),
        t("pricing.tierBasicFeature2"),
        t("pricing.tierBasicFeature3"),
        t("pricing.tierBasicFeature4"),
        t("pricing.tierBasicFeature5"),
      ],
      ctaLabel: t("pricing.tierBasicCta"),
      highlighted: false,
      outlined: false,
    },
    {
      name: t("pricing.tierEnterpriseName"),
      monthly: "$4,990" as string | null,
      annual: "$49,900" as string | null,
      features: [
        t("pricing.tierEnterpriseFeature1"),
        t("pricing.tierEnterpriseFeature2"),
        t("pricing.tierEnterpriseFeature3"),
        t("pricing.tierEnterpriseFeature4"),
        t("pricing.tierEnterpriseFeature5"),
      ],
      ctaLabel: t("pricing.tierEnterpriseCta"),
      highlighted: true,
      outlined: false,
    },
    {
      name: t("pricing.tierUnlimitedName"),
      monthly: null as string | null,
      annual: null as string | null,
      features: [
        t("pricing.tierUnlimitedFeature1"),
        t("pricing.tierUnlimitedFeature2"),
        t("pricing.tierUnlimitedFeature3"),
        t("pricing.tierUnlimitedFeature4"),
        t("pricing.tierUnlimitedFeature5"),
      ],
      ctaLabel: t("pricing.tierUnlimitedCta"),
      highlighted: false,
      outlined: true,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0F1E3D] text-white overflow-hidden">
        <div className="container-page pt-16 pb-14 md:pt-20 md:pb-16 grid md:grid-cols-12 gap-12 md:gap-10 items-center">
          <div className="md:col-span-6 order-2 md:order-1">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-[#FBB601] mb-5">
              {t("hero.badge")}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.05] tracking-tighter font-bold [hyphens:none] break-words">
              <span className="block text-white">{t("hero.titleLine1")}</span>
              <span className="block text-[#FBB601]">{t("hero.titleLine2")}</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-xl">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {heroFeatures.map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FBB601]/60 text-[#FBB601]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-[13px] leading-snug text-white/85">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3 items-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-5 py-3 shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
              >
                {t("hero.ctaCourses")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/agendar"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-5 py-3 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                {t("hero.ctaDemo")}
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 order-1 md:order-2">
            <ProductPreview
              imageAlt={t("hero.productImageAlt")}
              checklistTitle={t("hero.checklistTitle")}
              checklist={heroChecklist}
              stampApproved={t("hero.stampApproved")}
            />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {heroStats.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBB601]/15 text-[#FBB601] shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-semibold text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO */}
      <section className="bg-canvas py-10 md:py-14" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="rounded-2xl md:rounded-full bg-[#0F1E3D] border border-white/10 px-6 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-cardHover">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FBB601]/15 text-[#FBB601]">
              <Gift className="h-6 w-6" />
            </span>
            <div className="flex-1 text-center md:text-left">
              <p className="font-display text-lg md:text-xl font-semibold text-white tracking-tight">
                {t("promo.title")}
              </p>
              <p className="text-sm text-white/70 leading-snug mt-0.5">
                {t("promo.subtitle")}
              </p>
            </div>
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 rounded-full bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-6 py-3 transition-colors whitespace-nowrap"
            >
              {t("promo.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-canvas py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.08] [hyphens:none] break-words">
            {t("intro.title")}
          </h2>
          <p className="mt-6 text-lg text-ink-700 leading-relaxed">
            {t("intro.subtitle")}
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white py-16 md:py-28 lg:py-36">
        <div className="container-page space-y-20 md:space-y-28">
          {featureBlocks.map((block) => (
            <div
              key={block.heading}
              className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
            >
              <div className={block.imageLeft ? "md:order-1" : "md:order-2"}>
                <div className="relative">
                  <div aria-hidden className="absolute -inset-8 -z-10 rounded-[48px] bg-procheck-orange/20 blur-3xl" />
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-cardHover">
                    <Image
                      src={block.image}
                      alt={block.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      quality={95}
                    />
                  </div>
                </div>
              </div>
              <div className={block.imageLeft ? "md:order-2" : "md:order-1"}>
                <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white tracking-tighter leading-[1.08] [hyphens:none] break-words">
                  {block.heading}
                </h3>
                <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed">
                  {block.text}
                </p>
              </div>
            </div>
          ))}

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="md:order-2">
              <div className="relative">
                <div aria-hidden className="absolute -inset-8 -z-10 rounded-[48px] bg-procheck-orange/20 blur-3xl" />
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-cardHover">
                  <Image
                    src={IMG.certificateShowcase}
                    alt="Trabajador con certificado DC-3 en planta"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    quality={95}
                  />
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white tracking-tighter leading-[1.08] [hyphens:none] break-words">
                {t("features.dc3Heading")}
              </h3>
              <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed">
                {t("features.dc3Text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GET STARTED CTA */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white border-t border-white/10 py-16 md:py-28 lg:py-36">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white tracking-tighter leading-[1.08] [hyphens:none] break-words">
            {t("getStarted.title")}
          </h2>
          <p className="mt-5 text-lg text-white/75 leading-relaxed">
            {t("getStarted.subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FBB601] hover:bg-[#D99A00] text-white font-semibold text-sm px-6 py-3 shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
            >
              {t("getStarted.ctaPlans")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 text-white font-semibold text-sm px-6 py-3 hover:bg-white/10 transition-colors"
            >
              {t("getStarted.ctaCourses")}
            </Link>
          </div>
        </div>
      </section>

      {/* PLAYER + LIST */}
      <section className="bg-canvas py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-line shadow-cardHover">
                <Image
                  src={IMG.coursePlayerShowcase}
                  alt={t("player.playerAlt")}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  quality={95}
                />
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.08] [hyphens:none] break-words">
                {t("player.heading")}
              </h2>
              <ul className="mt-8 space-y-6">
                {playerItems.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FBB601]/15 text-[#FBB601] mt-0.5">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-ink-900 tracking-tight leading-snug">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-canvas-2 border-y border-line py-16 md:py-28 lg:py-36" style={{backgroundImage:"linear-gradient(rgba(248,249,250,0.97),rgba(248,249,250,0.97)),url('/images/pattern_bg_procheek.png')",backgroundSize:"auto,320px",backgroundRepeat:"repeat"}}>
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink-900 tracking-tighter leading-[1.08] [hyphens:none] break-words">
              {t("pricing.title")}
            </h2>
            <p className="mt-5 text-lg text-ink-700 leading-relaxed">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 rounded-full bg-white border border-line p-1 shadow-subtle">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  billing === "monthly"
                    ? "bg-[#0F1E3D] text-white"
                    : "text-ink-700 hover:text-ink-900"
                }`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  billing === "annual"
                    ? "bg-[#0F1E3D] text-white"
                    : "text-ink-700 hover:text-ink-900"
                }`}
              >
                {t("pricing.annual")}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => {
              const isEnterprise = tier.monthly === null;
              const price = isEnterprise
                ? t("pricing.customQuote")
                : billing === "monthly"
                  ? tier.monthly!
                  : tier.annual!;
              const priceSuffix = isEnterprise
                ? ""
                : billing === "monthly"
                  ? t("pricing.perMonth")
                  : t("pricing.perYear");
              const altPrice = isEnterprise
                ? t("pricing.contactTeam")
                : billing === "monthly"
                  ? t("pricing.orAnnual", { price: tier.annual! })
                  : t("pricing.orMonthly", { price: tier.monthly! });

              return (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    tier.highlighted
                      ? "bg-[#0F1E3D] text-white border-2 border-[#FBB601] shadow-orangeGlowXl md:-mt-4 md:mb-0 ring-2 ring-procheck-orange ring-offset-4 ring-offset-canvas"
                      : "bg-white border border-line shadow-card"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-[#FBB601] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                        {t("pricing.mostPopular")}
                      </span>
                    </div>
                  )}

                  <p
                    className={`font-display text-xl font-semibold tracking-tight ${
                      tier.highlighted ? "text-white" : "text-ink-900"
                    }`}
                  >
                    {tier.name}
                  </p>

                  <div className="mt-5 min-h-[92px]">
                    {isEnterprise ? (
                      <p
                        className={`font-display text-3xl font-semibold tracking-tighter ${
                          tier.highlighted ? "text-white" : "text-ink-900"
                        }`}
                      >
                        {price}
                      </p>
                    ) : (
                      <p className="flex items-baseline gap-1">
                        <span
                          className={`font-display text-5xl font-bold tracking-tighter ${
                            tier.highlighted ? "text-white" : "text-ink-900"
                          }`}
                        >
                          {price}
                        </span>
                        <span
                          className={`text-sm ${
                            tier.highlighted ? "text-white/70" : "text-ink-500"
                          }`}
                        >
                          {priceSuffix}
                        </span>
                      </p>
                    )}
                    <p
                      className={`mt-2 text-xs ${
                        tier.highlighted ? "text-white/70" : "text-ink-500"
                      }`}
                    >
                      {altPrice}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 bg-[#FBB601]/15 text-[#FBB601]">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span
                          className={`text-sm leading-snug ${
                            tier.highlighted ? "text-white/85" : "text-ink-700"
                          }`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/agendar"
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm px-6 py-3 transition-colors ${
                      tier.outlined
                        ? "border border-ink-300 text-ink-900 hover:bg-ink-50"
                        : tier.highlighted
                          ? "bg-[#FBB601] hover:bg-[#D99A00] text-white shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
                          : "bg-[#FBB601] hover:bg-[#D99A00] text-white shadow-orangeGlow hover:shadow-orangeGlowLg hover:-translate-y-0.5 transition-all duration-300"
                    }`}
                  >
                    {tier.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
