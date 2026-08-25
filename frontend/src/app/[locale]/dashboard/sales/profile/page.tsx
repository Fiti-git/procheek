"use client";

import { useEffect, useState } from "react";
import { apiGet, getCurrentUser } from "@/lib/api";
import CommissionCalculator, {
  type CommissionRule,
} from "@/components/CommissionCalculator";
import { Input, Label } from "@/components/ui/Input";

type VendorProfile = {
  userId: string;
  quotaMonthly: number;
  commissionRule: CommissionRule | null;
  bio: string;
  specialties: string[];
};

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const user = typeof window !== "undefined" ? getCurrentUser() : null;

  useEffect(() => {
    (async () => {
      try {
        const d = await apiGet<VendorProfile>("/sales/vendor-profile/me");
        setProfile(d);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const isAdmin = user?.role === "principal_admin";
  const isSelf = !!user && !!profile && user.id === profile.userId;

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Perfil de vendedor</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Tu configuración.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">{err}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-enterprise p-6">
          <h2 className="font-display text-xl text-ink-900 mb-4">Datos</h2>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={user?.name || user?.email || ""} disabled />
            </div>
            <div>
              <Label>Cuota mensual (MXN)</Label>
              <Input
                type="number"
                value={profile?.quotaMonthly ?? 0}
                onChange={() => {}}
                disabled
              />
            </div>
            <div>
              <Label>Bio</Label>
              <textarea
                value={profile?.bio || ""}
                onChange={() => {}}
                rows={3}
                disabled
                className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 opacity-70"
              />
            </div>
            <div>
              <Label>Especialidades</Label>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.specialties || []).map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded-full bg-canvas-2 border border-line text-ink-700"
                  >
                    {s}
                  </span>
                ))}
                {(!profile?.specialties || profile.specialties.length === 0) && (
                  <span className="text-xs text-ink-500">
                    Sin especialidades configuradas.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          {profile && (
            <CommissionCalculator
              userId={profile.userId}
              initialRule={profile.commissionRule}
              isAdmin={isAdmin}
              isSelf={isSelf}
            />
          )}
          {!profile && !err && (
            <div className="card-enterprise p-6 text-sm text-ink-500">
              Cargando calculadora...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
