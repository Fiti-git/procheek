import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 text-white p-12 relative">
        <Link href="/" className="relative flex items-baseline gap-1.5">
          <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
            PROCHECK
          </span>
          <span className="font-display font-normal text-base text-coral-500 leading-none">
            Safety
          </span>
        </Link>

        <div className="max-w-md">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.05]">
            Capacita a tu equipo. Cumple con la STPS.
          </h2>
          <p className="mt-4 text-ink-200 leading-relaxed">
            La plataforma que usan constructoras, industriales y sus
            subcontratistas para mantener a su equipo certificado.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Certificados DC-3 emitidos en 24 horas",
              "24 cursos NOM vigentes",
              "Recertificación automática",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-3 text-sm text-ink-100"
              >
                <ShieldCheck className="h-4 w-4 text-coral-500 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-300">
          © 2026 PROCHECK Safety
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-canvas">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight text-ink-900 leading-none">
                PROCHECK
              </span>
              <span className="font-display font-normal text-base text-coral-500 leading-none">
                Safety
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
