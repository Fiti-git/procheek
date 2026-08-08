import Link from "next/link";
import { Input, Label } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  return (
    <div>
      <p className="kicker mb-3">Nueva contraseña</p>
      <h1 className="font-display text-4xl font-semibold text-ink-900 tracking-tight leading-tight">
        Define tu contraseña.
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        Define una nueva contraseña para tu cuenta.
      </p>
      <form className="mt-8 space-y-4">
        <div>
          <Label>Nueva contraseña</Label>
          <Input type="password" placeholder="********" />
        </div>
        <div>
          <Label>Confirmar contraseña</Label>
          <Input type="password" placeholder="********" />
        </div>
        <button type="button" className="btn-primary w-full mt-2">
          Guardar contraseña
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
