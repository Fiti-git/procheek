import Link from "next/link";
import { CartBadge } from "./CartBadge";

const nav = [
  { href: "/courses", label: "Cursos" },
  { href: "/consulting", label: "Consultoría" },
  { href: "/software", label: "Software" },
  { href: "/certificate-lookup", label: "Verificar certificado" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-xl tracking-tight text-ink-900 leading-none">
            PROCHECK
          </span>
          <span className="font-display font-normal text-base text-coral-500 leading-none">
            Safety
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
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
          <CartBadge />
          <Link href="/login" className="btn-primary text-sm py-2 px-4">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
