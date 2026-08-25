"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { login, type CurrentUser } from "@/lib/api";

function redirectFor(role: CurrentUser["role"]): string {
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

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setErr("Ingresa un correo válido.");
      return;
    }
    setEmail(value);
    setStep(2);
  };

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { user } = await login(email.trim(), password);
      if (returnTo && returnTo.startsWith("/")) {
        router.push(returnTo);
      } else {
        router.push(redirectFor(user.role));
      }
    } catch (e) {
      setErr((e as Error).message || "Credenciales inválidas.");
    } finally {
      setBusy(false);
    }
  };

  const changeEmail = () => {
    setStep(1);
    setPassword("");
    setErr(null);
  };

  return (
    <div>
      <p className="kicker mb-3">Iniciar sesión</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
        Bienvenido de nuevo.
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        {step === 1
          ? "Ingresa tu correo para acceder a tu cuenta."
          : "Ingresa tu contraseña para continuar."}
      </p>

      {step === 1 && (
        <form className="mt-8 space-y-4" onSubmit={onSubmitEmail}>
          <div>
            <Label>Correo electrónico</Label>
            <Input
              type="email"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {err}
            </div>
          )}
          <button type="submit" className="btn-primary w-full">
            Continuar
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="mt-8 space-y-4" onSubmit={onSubmitPassword}>
          <div>
            <Label>Correo electrónico</Label>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas-2 px-3.5 py-2.5">
              <span className="text-sm text-ink-800 font-mono truncate">
                {email}
              </span>
              <button
                type="button"
                onClick={changeEmail}
                className="text-xs text-coral-500 hover:underline shrink-0"
              >
                Cambiar correo
              </button>
            </div>
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
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
            {busy ? "Ingresando..." : "Continuar"}
          </button>
        </form>
      )}

      <div className="mt-5 text-sm">
        <Link href="/forgot-password" className="link-inline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <p className="text-sm text-ink-700 mt-6">
        ¿Nuevo aquí?{" "}
        <Link href="/agendar?type=demo" className="link-inline">
          Agenda una demo con nuestro equipo
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginInner />
    </Suspense>
  );
}
