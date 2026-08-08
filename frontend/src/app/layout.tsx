import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "PROCHECK Safety | Capacitación STPS y certificados DC-3",
  description:
    "Plataforma de capacitación en seguridad laboral: cursos NOM, certificados DC-3 y seguimiento de cumplimiento para empresas en México.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans bg-canvas text-ink-700">
        <ToastProvider>
          {children}
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
