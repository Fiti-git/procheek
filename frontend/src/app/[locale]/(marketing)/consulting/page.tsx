import { GraduationCap, ClipboardCheck, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IMG } from "@/lib/images";

export default async function ConsultingPage() {
  const t = await getTranslations("Consulting");

  const process = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
  ];

  const cases = [
    {
      quote: t("case1Quote"),
      name: t("case1Name"),
      company: t("case1Company"),
      result: t("case1Result"),
    },
    {
      quote: t("case2Quote"),
      name: t("case2Name"),
      company: t("case2Company"),
      result: t("case2Result"),
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="bg-canvas">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <p className="kicker mb-3">{t("kicker")}</p>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.05] tracking-tighter">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-ink-700 leading-relaxed max-w-lg">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link href="/agendar?type=consulting" className="btn-primary">
                {t("ctaBook")}
              </Link>
              <Link href="#casos" className="btn-ghost">
                {t("ctaCases")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="card-enterprise rounded-2xl overflow-hidden relative aspect-[4/3] photo-duotone-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.heroConsulting} alt={t("heroImageAlt")} />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">{t("servicesKicker")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              {t("servicesTitle")}
            </h2>
          </div>

          <div className="bg-ink-900 text-white rounded-2xl p-8 md:p-10 mb-6 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-white">
                {t("bookCardTitle")}
              </h3>
              <p className="mt-3 text-ink-200 leading-relaxed max-w-xl">
                {t("bookCardDesc")}
              </p>
            </div>
            <div className="md:justify-self-end">
              <Link
                href="/agendar?type=consulting"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm bg-coral-500 hover:bg-coral-600 text-white transition-colors"
              >
                {t("bookCardCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: t("service1Title"),
                desc: t("service1Desc"),
              },
              {
                icon: ClipboardCheck,
                title: t("service2Title"),
                desc: t("service2Desc"),
              },
            ].map((s) => (
              <div key={s.title} className="card-enterprise p-7">
                <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center mb-5">
                  <s.icon className="h-5 w-5 text-coral-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">{t("processKicker")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              {t("processTitle")}
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-px bg-line" />
            <div className="grid md:grid-cols-3 gap-8 relative">
              {process.map((p) => (
                <div key={p.step} className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-canvas-2 border border-line text-ink-900 flex items-center justify-center font-display text-lg font-semibold mb-5 relative z-10">
                    {p.step}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink-900 mb-2 tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-sm text-ink-700 max-w-xs mx-auto leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section id="casos" className="py-20 md:py-24 bg-canvas-2 border-y border-line">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="kicker mb-3">{t("casesKicker")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
              {t("casesTitle")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <div key={c.name} className="card-enterprise p-8">
                <div className="font-display text-5xl leading-none text-coral-500 mb-3">
                  &ldquo;
                </div>
                <p className="text-lg text-ink-800 leading-relaxed">{c.quote}</p>
                <div className="mt-6">
                  <div className="font-medium text-ink-900">{c.name}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{c.company}</div>
                  <div className="mt-4">
                    <span className="inline-flex items-center bg-coral-50 text-coral-700 border border-coral-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {c.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-canvas-2 py-20 md:py-24">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
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
