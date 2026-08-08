"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { apiGet, apiPatch, apiPost } from "@/lib/api";

type AccountData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phone?: string;
  language?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  timezone?: string;
};

const LANGUAGES = [
  { value: "es-MX", label: "Español (México)" },
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
];

const TIMEZONES = [
  "America/Mexico_City",
  "America/Tijuana",
  "America/Cancun",
  "America/Monterrey",
  "America/Chihuahua",
  "America/Hermosillo",
];

async function fetchMe(): Promise<AccountData> {
  // Try /users/me first, then /auth/me.
  try {
    const data = (await apiGet<Record<string, unknown>>("/users/me")) || {};
    return normalize(data);
  } catch {
    try {
      const data = (await apiGet<Record<string, unknown>>("/auth/me")) || {};
      return normalize(data);
    } catch {
      return {};
    }
  }
}

function normalize(raw: Record<string, unknown>): AccountData {
  const asString = (v: unknown) => (typeof v === "string" ? v : undefined);
  return {
    firstName: asString(raw.firstName) || asString(raw.first_name),
    lastName: asString(raw.lastName) || asString(raw.last_name),
    email: asString(raw.email),
    username: asString(raw.username),
    phone: asString(raw.phone) || asString(raw.phoneNumber),
    language: asString(raw.language) || asString(raw.locale),
    address: asString(raw.address),
    city: asString(raw.city),
    state: asString(raw.state),
    zip: asString(raw.zip) || asString(raw.postalCode),
    timezone: asString(raw.timezone) || asString(raw.timeZone),
  };
}

async function patchMe(body: Partial<AccountData>): Promise<void> {
  try {
    await apiPatch("/users/me", body);
    return;
  } catch (e) {
    // Try fallback endpoint.
    const msg = (e as Error).message || "";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      await apiPatch("/auth/me", body);
      return;
    }
    throw e;
  }
}

export function AccountForm() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [data, setData] = React.useState<AccountData>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwSaving, setPwSaving] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const me = await fetchMe();
      if (alive) {
        setData(me);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = (key: keyof AccountData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patchMe(data);
      toast({
        title: "Cambios guardados",
        description: "Tu perfil se actualizó correctamente.",
        variant: "success",
      });
    } catch (e) {
      const msg = (e as Error).message || "";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        toast({
          title: "Función próximamente disponible",
          description: "El endpoint de perfil aún no está listo.",
          variant: "info",
        });
      } else {
        toast({
          title: "No pudimos guardar",
          description: msg,
          variant: "error",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "Usa al menos 8 caracteres.",
        variant: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        variant: "error",
      });
      return;
    }
    setPwSaving(true);
    try {
      await apiPost("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      toast({
        title: "Contraseña actualizada",
        variant: "success",
      });
    } catch (e) {
      const msg = (e as Error).message || "";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        toast({
          title: "Función próximamente disponible",
          description: "El cambio de contraseña aún no está disponible.",
          variant: "info",
        });
      } else {
        toast({
          title: "No pudimos cambiar la contraseña",
          description: msg,
          variant: "error",
        });
      }
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card-enterprise p-6 text-sm text-ink-500">
        Cargando tu información...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSave} className="space-y-6">
        {/* Personal */}
        <section className="card-enterprise p-6">
          <h2 className="font-display text-lg tracking-tight text-ink-900 mb-1">
            Datos personales
          </h2>
          <p className="text-sm text-ink-500 mb-5">
            Información básica de tu cuenta.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre(s)</Label>
              <Input
                value={data.firstName || ""}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input
                value={data.lastName || ""}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Tus apellidos"
              />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input
                type="email"
                value={data.email || ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="correo@empresa.com"
              />
            </div>
            <div>
              <Label>Nombre de usuario</Label>
              <Input
                value={data.username || ""}
                onChange={(e) => update("username", e.target.value)}
                placeholder="usuario"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                type="tel"
                value={data.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div>
              <Label>Idioma</Label>
              <select
                value={data.language || "es-MX"}
                onChange={(e) => update("language", e.target.value)}
                className="w-full h-[42px] rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="card-enterprise p-6">
          <h2 className="font-display text-lg tracking-tight text-ink-900 mb-1">
            Dirección
          </h2>
          <p className="text-sm text-ink-500 mb-5">
            Datos de facturación y contacto.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Dirección</Label>
              <Input
                value={data.address || ""}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Calle y número"
              />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input
                value={data.city || ""}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Ciudad"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Input
                value={data.state || ""}
                onChange={(e) => update("state", e.target.value)}
                placeholder="Estado"
              />
            </div>
            <div>
              <Label>Código postal</Label>
              <Input
                value={data.zip || ""}
                onChange={(e) => update("zip", e.target.value)}
                placeholder="00000"
              />
            </div>
            <div>
              <Label>Zona horaria</Label>
              <select
                value={data.timezone || "America/Mexico_City"}
                onChange={(e) => update("timezone", e.target.value)}
                className="w-full h-[42px] rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Security */}
      <section className="card-enterprise p-6">
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-canvas-2 flex items-center justify-center">
              <Lock className="h-4 w-4 text-ink-700" />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-tight text-ink-900">
                Seguridad
              </h2>
              <p className="text-sm text-ink-500">
                Cambia tu contraseña de acceso.
              </p>
            </div>
          </div>
          {showPassword ? (
            <ChevronUp className="h-4 w-4 text-ink-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-500" />
          )}
        </button>

        {showPassword && (
          <form onSubmit={onChangePassword} className="mt-5 space-y-4">
            <div>
              <Label>Contraseña actual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nueva contraseña</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <Label>Confirmar nueva contraseña</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={pwSaving}
                className="btn-primary disabled:opacity-50"
              >
                {pwSaving ? "Actualizando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default AccountForm;
