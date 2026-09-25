import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  const badges = [t("badgeStps"), t("badgeDc3"), t("badgeLfpdppp")];

  return (
    <footer className="bg-ink-900 text-ink-100">
      <div className="container-page py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
              PROCHECK
            </span>
            <span className="font-display font-normal text-base text-coral-500 leading-none">
              Safety
            </span>
          </div>
          <p className="text-sm text-ink-200 max-w-xs leading-relaxed">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-300 font-medium mb-4">
            {t("colProcheck")}
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/courses" className="text-ink-200 hover:text-white transition-colors">
                {t("coursesOnline")}
              </Link>
            </li>
            <li>
              <Link href="/consulting" className="text-ink-200 hover:text-white transition-colors">
                {t("consulting")}
              </Link>
            </li>
            <li>
              <Link href="/software" className="text-ink-200 hover:text-white transition-colors">
                {t("software")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-300 font-medium mb-4">
            {t("colResources")}
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/help" className="text-ink-200 hover:text-white transition-colors">
                {t("helpCenter")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-ink-200 hover:text-white transition-colors">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-ink-200 hover:text-white transition-colors">
                {t("terms")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-300 font-medium mb-4">
            {t("colContact")}
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="mailto:contacto@procheck.mx"
                className="text-ink-200 hover:text-white transition-colors"
              >
                contacto@procheck.mx
              </a>
            </li>
            <li className="text-ink-200">{t("location")}</li>
          </ul>
        </div>
      </div>

      <div className="h-px bg-ink-800" />

      <div className="container-page py-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center text-xs">
        <p className="text-ink-300">{t("copyright")}</p>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 bg-ink-800 border border-ink-700 text-ink-100 text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full"
            >
              <ShieldCheck className="h-3 w-3 text-coral-500" />
              {b}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
