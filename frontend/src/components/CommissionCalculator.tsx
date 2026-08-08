"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { apiPatch, apiPost } from "@/lib/api";
import { Input, Label, HelperText } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

export type CommissionRule =
  | { type: "flat"; pct: number }
  | {
      type: "package_tier";
      tiers: { package: string; pct: number }[];
    }
  | {
      type: "volume_tier";
      tiers: { up_to: number | null; pct: number }[];
    }
  | { type: "custom"; formula: string };

type RuleType = "flat" | "package_tier" | "volume_tier" | "custom";

const RULE_OPTIONS: { id: RuleType; label: string; desc: string }[] = [
  {
    id: "flat",
    label: "Porcentaje fijo",
    desc: "Un solo porcentaje aplicado a toda venta.",
  },
  {
    id: "package_tier",
    label: "Por paquete",
    desc: "Porcentaje distinto según el paquete vendido.",
  },
  {
    id: "volume_tier",
    label: "Por volumen mensual",
    desc: "Escalonado según el volumen acumulado del mes.",
  },
  {
    id: "custom",
    label: "Personalizado",
    desc: "Fórmula libre para casos especiales.",
  },
];

// Normalize whatever the backend sends into the component's expected shape.
// Backend returns package_tiers / volume_tiers for tiered rules; this
// component uses a single `tiers` field regardless of type.
function coerceRule(rule: unknown): CommissionRule {
  if (!rule || typeof rule !== "object") {
    return { type: "flat", pct: 10 };
  }
  const r = rule as Record<string, unknown>;
  const type = r.type as string | undefined;
  if (type === "package_tier") {
    const tiers =
      (r.tiers as unknown) || (r.package_tiers as unknown) || [];
    return { type: "package_tier", tiers: tiers as never };
  }
  if (type === "volume_tier") {
    const tiers =
      (r.tiers as unknown) || (r.volume_tiers as unknown) || [];
    return { type: "volume_tier", tiers: tiers as never };
  }
  if (type === "custom") {
    return { type: "custom", formula: (r.formula as string) || "amount * 0.1" };
  }
  // flat (default)
  const pct =
    typeof r.pct === "number"
      ? r.pct
      : typeof r.flat_pct === "number"
        ? r.flat_pct
        : 10;
  return { type: "flat", pct };
}

function moneyMx(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

// Serialize the component's internal rule shape to what the backend expects:
// package_tier / volume_tier use their own field names, flat uses flat_pct.
function serializeRule(r: CommissionRule): Record<string, unknown> {
  if (r.type === "flat") return { type: "flat", flat_pct: r.pct };
  if (r.type === "package_tier")
    return { type: "package_tier", package_tiers: r.tiers };
  if (r.type === "volume_tier")
    return { type: "volume_tier", volume_tiers: r.tiers };
  return { type: "custom", formula: r.formula };
}

export function CommissionCalculator({
  userId,
  initialRule,
  isAdmin,
  isSelf,
}: {
  userId: string;
  initialRule?: CommissionRule | null;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const [rule, setRule] = useState<CommissionRule>(coerceRule(initialRule));
  const [amount, setAmount] = useState<number>(50000);
  const [pkg, setPkg] = useState<string>("basico");
  const [preview, setPreview] = useState<{
    pct: number;
    amount: number;
  } | null>(null);
  const [previewErr, setPreviewErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const packageOptions = useMemo(() => {
    if (rule.type === "package_tier") {
      return rule.tiers.map((t) => t.package).filter(Boolean);
    }
    return [];
  }, [rule]);

  useEffect(() => {
    if (rule.type === "package_tier" && packageOptions.length > 0) {
      if (!packageOptions.includes(pkg)) setPkg(packageOptions[0]);
    }
  }, [rule.type, packageOptions, pkg]);

  // Debounced preview. Backend expects flat_pct / package_tiers / volume_tiers,
  // so serialize the component's internal rule shape on every request.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setPreviewErr(null);
        const body: Record<string, unknown> = {
          rule: serializeRule(rule),
          amount,
        };
        if (rule.type === "package_tier") body.package = pkg;
        const res = await apiPost<{ pct: number; amount: number }>(
          "/sales/commissions/preview",
          body,
        );
        setPreview(res);
      } catch (e) {
        setPreviewErr((e as Error).message);
        setPreview(null);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rule, amount, pkg]);

  const changeType = (t: RuleType) => {
    if (t === rule.type) return;
    if (t === "flat") setRule({ type: "flat", pct: 10 });
    else if (t === "package_tier")
      setRule({
        type: "package_tier",
        tiers: [
          { package: "basico", pct: 8 },
          { package: "plus", pct: 12 },
          { package: "enterprise", pct: 15 },
        ],
      });
    else if (t === "volume_tier")
      setRule({
        type: "volume_tier",
        tiers: [
          { up_to: 100000, pct: 8 },
          { up_to: 500000, pct: 12 },
          { up_to: null, pct: 15 },
        ],
      });
    else setRule({ type: "custom", formula: "amount * 0.1" });
  };

  const onSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      await apiPatch(`/sales/vendor-profile/${userId}`, {
        commissionRule: serializeRule(rule),
      });
      setToast("Regla de comisión guardada.");
    } catch (e) {
      setToast(`Error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const canSave = isAdmin || isSelf;

  return (
    <div className="card-enterprise p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-coral-50 text-coral-500 flex items-center justify-center">
          <Calculator className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-xl tracking-tight text-ink-900">
            Calculadora de comisiones
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Configura tu regla y visualiza cuánto ganarías.
          </p>
        </div>
      </div>

      <div className="divider-hair my-5" />

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {RULE_OPTIONS.map((o) => {
          const active = rule.type === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => changeType(o.id)}
              className={cn(
                "text-left border rounded-lg p-3 transition-all",
                active
                  ? "border-coral-500 bg-coral-50/40"
                  : "border-line bg-white hover:border-ink-300",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    active ? "border-coral-500" : "border-ink-300",
                  )}
                >
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-coral-500" />
                  )}
                </span>
                <span className="font-medium text-sm text-ink-900">
                  {o.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-500 pl-6">{o.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Rule config */}
        <div>
          {rule.type === "flat" && (
            <div>
              <Label>Porcentaje (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={rule.pct}
                onChange={(e) =>
                  setRule({ type: "flat", pct: Number(e.target.value) || 0 })
                }
              />
              <HelperText>
                Se aplica a todas las ventas por igual.
              </HelperText>
            </div>
          )}

          {rule.type === "package_tier" && (
            <div>
              <Label>Paquetes y porcentajes</Label>
              <div className="space-y-2">
                {rule.tiers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={t.package}
                      onChange={(e) => {
                        const tiers = [...rule.tiers];
                        tiers[i] = { ...tiers[i], package: e.target.value };
                        setRule({ type: "package_tier", tiers });
                      }}
                      placeholder="Nombre del paquete"
                    />
                    <div className="relative w-28 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={t.pct}
                        onChange={(e) => {
                          const tiers = [...rule.tiers];
                          tiers[i] = {
                            ...tiers[i],
                            pct: Number(e.target.value) || 0,
                          };
                          setRule({ type: "package_tier", tiers });
                        }}
                        className="pr-7"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">
                        %
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const tiers = rule.tiers.filter((_, j) => j !== i);
                        setRule({ type: "package_tier", tiers });
                      }}
                      className="p-2 text-ink-500 hover:text-red-600"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setRule({
                    type: "package_tier",
                    tiers: [...rule.tiers, { package: "nuevo", pct: 10 }],
                  })
                }
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar paquete
              </button>
            </div>
          )}

          {rule.type === "volume_tier" && (
            <div>
              <Label>Tramos por volumen mensual</Label>
              <div className="space-y-2">
                {rule.tiers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">
                        Hasta
                      </span>
                      <Input
                        type="number"
                        value={t.up_to === null ? "" : t.up_to}
                        placeholder="Sin límite"
                        onChange={(e) => {
                          const tiers = [...rule.tiers];
                          const v = e.target.value;
                          tiers[i] = {
                            ...tiers[i],
                            up_to: v === "" ? null : Number(v),
                          };
                          setRule({ type: "volume_tier", tiers });
                        }}
                        className="pl-14"
                      />
                    </div>
                    <div className="relative w-28 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={t.pct}
                        onChange={(e) => {
                          const tiers = [...rule.tiers];
                          tiers[i] = {
                            ...tiers[i],
                            pct: Number(e.target.value) || 0,
                          };
                          setRule({ type: "volume_tier", tiers });
                        }}
                        className="pr-7"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">
                        %
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const tiers = rule.tiers.filter((_, j) => j !== i);
                        setRule({ type: "volume_tier", tiers });
                      }}
                      className="p-2 text-ink-500 hover:text-red-600"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setRule({
                    type: "volume_tier",
                    tiers: [...rule.tiers, { up_to: 0, pct: 10 }],
                  })
                }
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar tramo
              </button>
              <HelperText>
                Deja el campo vacío para indicar &quot;sin límite superior&quot;.
              </HelperText>
            </div>
          )}

          {rule.type === "custom" && (
            <div>
              <Label>Fórmula</Label>
              <Input
                value={rule.formula}
                onChange={(e) =>
                  setRule({ type: "custom", formula: e.target.value })
                }
                placeholder="amount * 0.12 + bonus"
                className="field-mono"
              />
              <HelperText>
                Variables: amount, bonus. Operadores: + - * / % ( )
              </HelperText>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-canvas-2 border border-line rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-4">
            Simulación
          </p>
          <div className="space-y-3">
            <div>
              <Label>Monto del ejemplo (MXN)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            {rule.type === "package_tier" && packageOptions.length > 0 && (
              <div>
                <Label>Paquete</Label>
                <select
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
                >
                  {packageOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-line">
            <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
              Comisión
            </p>
            <p className="font-display text-4xl font-semibold text-ink-900 tracking-tight mt-1">
              {preview ? moneyMx(preview.amount) : "-"}
            </p>
            <p className="text-sm text-ink-500 mt-1">
              Porcentaje: {preview ? `${preview.pct}%` : "-"}
            </p>
            {previewErr && (
              <p className="text-xs text-red-600 mt-2">{previewErr}</p>
            )}
          </div>
        </div>
      </div>

      <div className="divider-hair my-6" />
      <div className="flex items-center justify-between">
        <div className="text-xs text-ink-500">
          {toast && <span>{toast}</span>}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar regla"}
        </button>
      </div>
    </div>
  );
}

export default CommissionCalculator;
