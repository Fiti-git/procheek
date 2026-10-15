"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { apiPost } from "@/lib/api";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!token) {
      setErr("Enlace inválido. Solicita uno nuevo desde «Recuperar contraseña».");
      return;
    }
    if (password.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await apiPost("/auth/reset-password", { token, newPassword: password });
      setDone(true);
      window.setTimeout(() => router.push("/login?changed=1"), 2500);
    } catch (e) {
      setErr((e as Error).message || "No pudimos restablecer la contraseña.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div>
        <p className="kicker mb-3">Contraseña restablecida</p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08]">
          ¡Listo!
        </h1>
        <p className="mt-4 text-sm text-ink-700">
          Tu contraseña se actualizó. Te llevamos a la pantalla de inicio de
          sesión...
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="kicker mb-3">Nueva contraseña</p>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
        Define tu contraseña.
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        Elige una nueva contraseña para tu cuenta. Al guardarla cerrarás tus
        otras sesiones.
      </p>

      {!token && (
        <div className="mt-6 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          El enlace no incluye un token. Solicita uno nuevo desde{" "}
          <Link href="/forgot-password" className="link-inline">
            Recuperar contraseña
          </Link>
          .
        </div>
      )}

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Nueva contraseña</Label>
          <Input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div>
          <Label>Confirmar contraseña</Label>
          <Input
            type="password"
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          disabled={busy || !token}
          className="btn-primary w-full disabled:opacity-50"
        >
          {busy ? "Guardando..." : "Guardar contraseña"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
