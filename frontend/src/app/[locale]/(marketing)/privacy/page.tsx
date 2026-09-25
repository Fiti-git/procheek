import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("Privacy");
  return {
    title: `${t("breadcrumbCurrent")} Â· PROCHECK Solutions`,
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");
  const s2Items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const s4Items = [1, 2, 3, 4];

  return (
    <section className="bg-canvas">
      <div className="container-page py-16 md:py-24 max-w-3xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-500 mb-6">
          <Link href="/" className="hover:text-ink-900 transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink-900">{t("breadcrumbCurrent")}</span>
        </nav>

        <p className="kicker mb-3">{t("kicker")}</p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-ink-900 leading-[1.08] tracking-tight sm:tracking-tighter [hyphens:none] break-words">
          {t("title")}
        </h1>
        <p className="mt-6 text-sm text-ink-500">{t("lastUpdated")}</p>

        <div className="mt-12 space-y-12">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s1Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">{t("s1Body")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s2Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">{t("s2Intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-ink-700 leading-relaxed">
              {s2Items.map((n) => (
                <li key={n}>{t(`s2Item${n}` as const)}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s3Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">
              <span className="font-medium text-ink-900">{t("s3Primary")}</span>
              {t("s3PrimaryBody")}
            </p>
            <p className="text-ink-700 leading-relaxed">
              <span className="font-medium text-ink-900">{t("s3Secondary")}</span>
              {t("s3SecondaryBody")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s4Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">{t("s4Intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-ink-700 leading-relaxed">
              {s4Items.map((n) => (
                <li key={n}>{t(`s4Item${n}` as const)}</li>
              ))}
            </ul>
            <p className="text-ink-700 leading-relaxed">{t("s4Note")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s5Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">
              {t("s5Body1")}
              <a
                href="mailto:contacto@procheck.mx"
                className="text-coral-600 hover:text-coral-700 underline underline-offset-2"
              >
                contacto@procheck.mx
              </a>
              {t("s5Body2")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s6Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">{t("s6Body")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s7Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">{t("s7Body")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight mb-3">
              {t("s8Title")}
            </h2>
            <p className="text-ink-700 leading-relaxed">
              {t("s8Body1")}
              <a
                href="https://www.inai.org.mx"
                target="_blank"
                rel="noreferrer"
                className="text-coral-600 hover:text-coral-700 underline underline-offset-2 break-all"
              >
                https://www.inai.org.mx
              </a>
              {t("s8Body2")}
            </p>
          </section>
        </div>

        <div className="card-enterprise p-6 md:p-8 mt-16">
          <p className="text-ink-700 leading-relaxed">
            {t("contactBody1")}
            <a
              href="mailto:contacto@procheck.mx"
              className="text-coral-600 hover:text-coral-700 font-medium underline underline-offset-2"
            >
              contacto@procheck.mx
            </a>
            {t("contactBody2")}
          </p>
        </div>
      </div>
    </section>
  );
}
