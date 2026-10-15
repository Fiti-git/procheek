"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { apiPost, getCurrentUser, logout } from "@/lib/api";

function ChangePasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstTime = searchParams.get("first") === "1";
  const returnTo = searchParams.get("returnTo") || "/dashboard/courses";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (newPassword.length < 8) {
      setErr("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await apiPost("/auth/change-password", { currentPassword, newPassword });
      // change-password revokes the current token, so we have to log out
      // and get a fresh one via the normal /login flow with the new password.
      logout();
      router.push(
        `/login?returnTo=${encodeURIComponent(returnTo)}&changed=1`,
      );
    } catch (e) {
      setErr((e as Error).message || "No se pudo actualizar la contraseña.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="kicker mb-3">
        {isFirstTime ? "Primer ingreso" : "Cambiar contraseña"}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.08] [hyphens:none] break-words">
        {isFirstTime ? "Define tu contraseña." : "Actualiza tu contraseña."}
      </h1>
      <p className="mt-3 text-ink-700 text-sm leading-relaxed">
        {isFirstTime
          ? "Por tu seguridad, cambia la contraseña temporal que recibiste por correo antes de continuar."
          : "Ingresa tu contraseña actual y define una nueva."}
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>
            {isFirstTime ? "Contraseña temporal" : "Contraseña actual"}
          </Label>
          <Input
            type="password"
            placeholder="********"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div>
          <Label>Nueva contraseña</Label>
          <Input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Confirmar nueva contraseña</Label>
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
          disabled={busy}
          className="btn-primary w-full disabled:opacity-50"
        >
          {busy ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>

      {!isFirstTime && (
        <div className="mt-6 text-sm">
          <Link href="/dashboard/account" className="link-inline">
            Volver a mi cuenta
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ChangePasswordInner />
    </Suspense>
  );
}
