"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, getCurrentUser } from "@/lib/api";
import { Input, Label, HelperText } from "@/components/ui/Input";

type TrainerProfile = {
  userId: string;
  stpsRegistration: string;
  rfc: string;
  hourlyRate: number;
  bio: string;
  specialties: string[];
};

export default function TrainerProfilePage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const user = typeof window !== "undefined" ? getCurrentUser() : null;

  useEffect(() => {
    (async () => {
      try {
        const d = await apiGet<TrainerProfile>("/training/trainer-profile/me");
        setProfile(d);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const set = <K extends keyof TrainerProfile>(k: K, v: TrainerProfile[K]) => {
    if (!profile) return;
    setProfile({ ...profile, [k]: v });
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setToast(null);
    try {
      await apiPatch(`/training/trainer-profile/${profile.userId}`, {
        stpsRegistration: profile.stpsRegistration,
        rfc: profile.rfc,
        hourlyRate: profile.hourlyRate,
        bio: profile.bio,
        specialties: profile.specialties,
      });
      setToast("Perfil actualizado.");
    } catch (e) {
      setToast(`Error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const addSpecialty = () => {
    if (!profile || !specialtyInput.trim()) return;
    if (profile.specialties.includes(specialtyInput.trim())) return;
    set("specialties", [...profile.specialties, specialtyInput.trim()]);
    setSpecialtyInput("");
  };

  const removeSpecialty = (s: string) => {
    if (!profile) return;
    set(
      "specialties",
      profile.specialties.filter((x) => x !== s),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Perfil de capacitador</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Tu registro STPS.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      {profile && (
        <div className="card-enterprise p-6 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={user?.name || user?.email || ""} disabled />
            </div>
            <div>
              <Label>Registro STPS</Label>
              <Input
                value={profile.stpsRegistration || ""}
                onChange={(e) => set("stpsRegistration", e.target.value)}
                placeholder="STPS-XXXX-XXXXXX"
              />
              <HelperText>Constancia como Agente Capacitador Externo.</HelperText>
            </div>
            <div>
              <Label>RFC</Label>
              <Input
                value={profile.rfc || ""}
                onChange={(e) => set("rfc", e.target.value.toUpperCase())}
                placeholder="XAXX010101000"
                className="field-mono"
              />
            </div>
            <div>
              <Label>Tarifa por hora (MXN)</Label>
              <Input
                type="number"
                value={profile.hourlyRate || 0}
                onChange={(e) =>
                  set("hourlyRate", Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Bio</Label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => set("bio", e.target.value)}
                rows={4}
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
                placeholder="Experiencia, industrias, NOM que dominas."
              />
            </div>
            <div className="md:col-span-2">
              <Label>Especialidades</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-canvas-2 border border-line text-ink-700"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(s)}
                      className="text-ink-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                  placeholder="Ej. NOM-009 trabajos en altura"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="btn-secondary shrink-0"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <div className="divider-hair my-6" />
          <div className="flex items-center justify-between">
            <div className="text-xs text-ink-500">{toast}</div>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
