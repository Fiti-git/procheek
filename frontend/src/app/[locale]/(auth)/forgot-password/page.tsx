"use client";

import Link from "next/link";
import { useState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { apiPost } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!EMAIL_RE.test(email.trim())) {
      setErr("Ingresa un correo válido.");
      return;
    }
    setBusy(true);
    try {
      // Backend always returns 201 { ok: true } regardless of whether the
      // email exists — don't leak account existence. The success screen is
      // generic for the same reason.
      await apiPost("/auth/forgot-password", { email: email.trim() });
      setDone(true);
    } catch (e) {
      setErr((e as Error).message || "No pudimos procesar tu solicitud.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div>
        <p className="kicker mb-3">Recuperar acceso</p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
          Revisa tu correo.
        </h1>
        <p className="mt-4 text-ink-700 text-sm leading-relaxed">
          Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un
          enlace para restablecer tu contraseña en los próximos minutos.
        </p>
        <p className="mt-3 text-ink-500 text-sm">
          Revisa tu bandeja de entrada y la carpeta de correo no deseado.
        </p>
        <div className="mt-8">
          <Link href="/login" className="btn-primary">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="kicker mb-3">Recuperar acceso</p>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
        Recuperar contraseña.
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        Te enviaremos un enlace para restablecer tu contraseña al correo
        asociado a tu cuenta.
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-50"
        >
          {busy ? "Enviando..." : "Enviar enlace"}
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
