import Link from "next/link";
import { Input, Label } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="kicker mb-3">Recuperar acceso</p>
      <h1 className="font-display text-4xl font-semibold text-ink-900 tracking-tight leading-tight">
        Recuperar contraseña.
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        Te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <form className="mt-8 space-y-4">
        <div>
          <Label>Correo electrónico</Label>
          <Input type="email" placeholder="correo@empresa.com" />
        </div>
        <button type="button" className="btn-primary w-full mt-2">
          Enviar enlace
        </button>
      </form>
      <div className="mt-6 text-sm">
        <Link href="/login" className="link-inline">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
