import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
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
            Plataforma de cumplimiento STPS para constructoras, industriales y
            sus subcontratistas en México.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-300 font-medium mb-4">
            PROCHECK
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/courses" className="text-ink-200 hover:text-white transition-colors">
                Cursos en línea
              </Link>
            </li>
            <li>
              <Link href="/consulting" className="text-ink-200 hover:text-white transition-colors">
                Consultoría
              </Link>
            </li>
            <li>
              <Link href="/software" className="text-ink-200 hover:text-white transition-colors">
                Software
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-300 font-medium mb-4">
            Recursos
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/help" className="text-ink-200 hover:text-white transition-colors">
                Centro de ayuda
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-ink-200 hover:text-white transition-colors">
                Aviso de privacidad
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-ink-200 hover:text-white transition-colors">
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-300 font-medium mb-4">
            Contacto
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="mailto:contacto@procheck.com"
                className="text-ink-200 hover:text-white transition-colors"
              >
                contacto@procheck.com
              </a>
            </li>
            <li className="text-ink-200">Ciudad de México</li>
          </ul>
        </div>
      </div>

      <div className="h-px bg-ink-800" />

      <div className="container-page py-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center text-xs">
        <p className="text-ink-300">© 2026 PROCHECK Safety</p>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {["STPS Registrado", "DC-3 Verificado", "LFPDPPP"].map((b) => (
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
