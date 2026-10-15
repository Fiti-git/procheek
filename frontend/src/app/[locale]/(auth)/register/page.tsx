"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { registerPublic, type CurrentUser } from "@/lib/api";

function defaultDestination(role: CurrentUser["role"]): string {
  switch (role) {
    case "vendedor":
      return "/dashboard/sales";
    case "capacitador":
      return "/dashboard/trainer";
    case "principal_admin":
      return "/dashboard/reports";
    case "client":
    case "client_admin":
    case "subcontractor":
      return "/dashboard/team";
    default:
      return "/dashboard/courses";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErr("Ingresa tu nombre y apellido.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErr("Ingresa un correo válido.");
      return;
    }
    if (password.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setBusy(true);
    try {
      const { user } = await registerPublic({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyName: companyName.trim() || undefined,
      });
      if (returnTo && returnTo.startsWith("/")) {
        router.push(returnTo);
      } else {
        router.push(defaultDestination(user.role));
      }
    } catch (e) {
      setErr((e as Error).message || "No pudimos crear tu cuenta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="kicker mb-3">Crear cuenta</p>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
        Empieza en PROCHECK.
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        Regístrate en menos de un minuto y accede a nuestros cursos STPS +
        emisión de certificado DC-3.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nombre(s)</Label>
            <Input
              name="firstName"
              placeholder="Rodrigo"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <Label>Apellidos</Label>
            <Input
              name="lastName"
              placeholder="Hernández López"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label>Empresa (opcional)</Label>
          <Input
            name="companyName"
            placeholder="Constructora Monterrey SA"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div>
          <Label>Correo electrónico</Label>
          <Input
            type="email"
            placeholder="correo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {err && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-50"
        >
          {busy ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-xs text-ink-500 mt-4">
        Al crear tu cuenta aceptas nuestros{" "}
        <Link href="/terminos" className="link-inline">
          Términos
        </Link>{" "}
        y{" "}
        <Link href="/privacidad" className="link-inline">
          Aviso de privacidad
        </Link>
        .
      </p>

      <p className="text-sm text-ink-700 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
          className="link-inline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterInner />
    </Suspense>
  );
}
