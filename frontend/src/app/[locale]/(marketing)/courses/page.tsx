import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import CourseCard from "@/components/CourseCard";
import CourseFilters from "@/components/CourseFilters";
import { courses, type Industry } from "@/lib/courses";

const industryOrder: Industry[] = [
  "construccion",
  "quimica",
  "metalmecanica",
  "mineria",
  "general",
];

export default async function CoursesPage() {
  const t = await getTranslations("Courses");

  const grouped = industryOrder
    .map((industry) => {
      const items = courses
        .filter((c) => c.industry === industry)
        .sort((a, b) => {
          if (a.tier === b.tier) return a.code.localeCompare(b.code);
          return a.tier === "basico" ? -1 : 1;
        });
      return { industry, items };
    })
    .filter((g) => g.items.length > 0);

  const industryLabel = (i: Industry) =>
    ({
      construccion: t("industryConstruccion"),
      quimica: t("industryQuimica"),
      metalmecanica: t("industryMetalmecanica"),
      mineria: t("industryMineria"),
      general: t("industryGeneral"),
    })[i];

  const industryDesc = (i: Industry) =>
    ({
      construccion: t("industryConstruccionDesc"),
      quimica: t("industryQuimicaDesc"),
      metalmecanica: t("industryMetalmecanicaDesc"),
      mineria: t("industryMineriaDesc"),
      general: t("industryGeneralDesc"),
    })[i];

  return (
    <div className="bg-canvas min-h-screen">
      {/* NAVY HERO BAND */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-[#0A1628] text-white">
        <div className="container-page py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-[#FBB601] mb-3">
              {t("kicker")}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.08] [hyphens:none] break-words">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FBB601]/15 border border-[#FBB601]/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FBB601]">
                STPS · NOM
              </span>
              <span className="text-xs text-white/60">
                DC-3 · {t("showing", { count: courses.length })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-12 md:py-16">

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "todos", label: t("tabAll"), active: true },
            { key: "basicos", label: t("tabBasic"), active: false },
            { key: "compl", label: t("tabComplementary"), active: false },
          ].map((tab) => (
            <button
              key={tab.key}
              className={
                tab.active
                  ? "px-4 h-9 rounded-full font-medium text-sm bg-ink-900 text-white"
                  : "px-4 h-9 rounded-full font-medium text-sm bg-white border border-line text-ink-700 hover:border-line-strong"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <CourseFilters />
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-500">
                {t("showing", { count: courses.length })}
              </span>
              <select className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink">
                <option>{t("sortRelevance")}</option>
                <option>{t("sortPriceAsc")}</option>
                <option>{t("sortPriceDesc")}</option>
                <option>{t("sortDuration")}</option>
              </select>
            </div>

            {grouped.length === 0 ? (
              <div className="bg-white border border-line rounded-xl p-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full border border-line flex items-center justify-center text-ink-400 mb-4">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900 tracking-tight">
                  {t("noResults")}
                </h3>
                <p className="mt-2 text-sm text-ink-700">{t("noResultsHint")}</p>
                <button className="btn-ghost mt-4">{t("clearFilters")}</button>
              </div>
            ) : (
              <div className="space-y-12">
                {grouped.map(({ industry, items }) => (
                  <section key={industry}>
                    <div className="mb-5 pb-4 border-b border-line">
                      <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight leading-tight">
                        {industryLabel(industry)}
                      </h2>
                      <p className="mt-1 text-sm text-ink-500">
                        {industryDesc(industry)} ·{" "}
                        {t("coursesCount", { count: items.length })}
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {items.map((c) => (
                        <CourseCard key={c.id} course={c} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
