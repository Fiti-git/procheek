"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Monitor,
  ClipboardCheck,
  GraduationCap,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  ArrowRight,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { IMG } from "@/lib/images";
import { Input, Label, HelperText } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type Purpose = "demo" | "consulting" | "training";

type Specialist = {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  bio?: string;
  slots: string[];
};

const PURPOSES: {
  id: Purpose;
  title: string;
  desc: string;
  icon: typeof Monitor;
}[] = [
  {
    id: "demo",
    title: "Demo del software",
    desc: "Recorrido guiado por la plataforma con un vendedor.",
    icon: Monitor,
  },
  {
    id: "consulting",
    title: "Consultoría STPS",
    desc: "Diagnóstico de cumplimiento y plan de acción.",
    icon: ClipboardCheck,
  },
  {
    id: "training",
    title: "Capacitación presencial",
    desc: "Curso NOM impartido por un capacitador certificado.",
    icon: GraduationCap,
  },
];

const AVATARS = [IMG.avatar1, IMG.avatar2, IMG.avatar3];

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgendarPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("type") as Purpose) || "demo";
  const [purpose, setPurpose] = useState<Purpose>(
    ["demo", "consulting", "training"].includes(initial) ? initial : "demo",
  );

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns `display_name` and `available_slots`; normalize here.
      type RawSpecialist = {
        id: string;
        display_name?: string;
        name?: string;
        role: string;
        specialties: string[];
        bio?: string | null;
        available_slots?: string[];
        slots?: string[];
      };
      const raw = await apiGet<RawSpecialist[]>(
        `/agenda/available?purpose=${purpose}`,
      );
      const normalized: Specialist[] = (Array.isArray(raw) ? raw : []).map(
        (s) => ({
          id: s.id,
          name: s.name || s.display_name || "",
          role: s.role,
          specialties: s.specialties || [],
          bio: s.bio || undefined,
          slots: s.slots || s.available_slots || [],
        }),
      );
      setSpecialists(normalized);
    } catch (e) {
      setError((e as Error).message);
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  }, [purpose]);

  useEffect(() => {
    load();
    setSelectedId(null);
    setSelectedSlot(null);
  }, [load]);

  const onPurposeChange = (p: Purpose) => {
    setPurpose(p);
    const url = new URL(window.location.href);
    url.searchParams.set("type", p);
    router.replace(`/agendar?type=${p}`, { scroll: false });
  };

  const selected = useMemo(
    () => specialists.find((s) => s.id === selectedId) || null,
    [specialists, selectedId],
  );

  const canSubmit =
    !!selected &&
    !!selectedSlot &&
    form.name.trim().length > 1 &&
    /.+@.+\..+/.test(form.email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selected || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/agenda/appointments", {
        requester_kind: "public",
        requester_email: form.email.trim(),
        requester_contact_name: form.name.trim(),
        requester_company_name: form.company.trim() || undefined,
        purpose,
        scheduled_at: selectedSlot,
        assigned_user_id: selected.id,
        notes:
          [form.phone ? `Tel: ${form.phone}` : "", form.notes]
            .filter(Boolean)
            .join("\n") || undefined,
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="py-20 md:py-28 bg-canvas">
        <div className="container-page max-w-2xl">
          <div className="card-enterprise p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-coral-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-coral-500" />
            </div>
            <p className="kicker mt-6">Cita confirmada</p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight">
              Nos pondremos en contacto pronto.
            </h1>
            <p className="mt-4 text-ink-700 leading-relaxed">
              Enviamos una confirmación a{" "}
              <span className="field-mono">{form.email}</span>. Tu especialista
              se comunicará contigo en las próximas horas.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <a href="/" className="btn-secondary">
                Volver al inicio
              </a>
              <a href="/courses" className="btn-ghost">
                Ver cursos <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-canvas">
      <div className="container-page max-w-5xl">
        <p className="kicker mb-3">Agenda una cita</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight leading-tight">
          Habla con un especialista.
        </h1>
        <p className="mt-4 text-ink-700 leading-relaxed max-w-2xl">
          Reserva 20 minutos con nuestro equipo. Sin costo, sin compromiso.
        </p>

        {/* STEP 1 */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-ink-900 text-white text-xs font-medium flex items-center justify-center">
              1
            </span>
            <h2 className="font-display text-xl tracking-tight text-ink-900">
              Selecciona el motivo
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PURPOSES.map((p) => {
              const active = purpose === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPurposeChange(p.id)}
                  className={cn(
                    "text-left card-enterprise p-5 transition-all",
                    active
                      ? "border-coral-500 ring-2 ring-coral-500/20"
                      : "hover:border-ink-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      active
                        ? "bg-coral-500 text-white"
                        : "bg-canvas-2 text-ink-700",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg tracking-tight text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2 */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-ink-900 text-white text-xs font-medium flex items-center justify-center">
              2
            </span>
            <h2 className="font-display text-xl tracking-tight text-ink-900">
              Elige un especialista
            </h2>
          </div>

          {loading && (
            <p className="text-sm text-ink-500">Cargando disponibilidad...</p>
          )}
          {error && !loading && specialists.length === 0 && (
            <div className="card-enterprise p-5 text-sm text-ink-700">
              No pudimos cargar la disponibilidad ({error}). Intenta de nuevo en
              unos segundos.
            </div>
          )}

          {!loading && specialists.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {specialists.map((sp, idx) => {
                const active = selectedId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(sp.id);
                      setSelectedSlot(null);
                    }}
                    className={cn(
                      "text-left card-enterprise p-5 transition-all",
                      active
                        ? "border-coral-500 ring-2 ring-coral-500/20"
                        : "hover:border-ink-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={AVATARS[idx % AVATARS.length]}
                        alt={sp.name}
                        className="w-12 h-12 rounded-full object-cover border border-line"
                      />
                      <div>
                        <div className="font-medium text-ink-900">
                          {sp.name}
                        </div>
                        <div className="text-xs text-ink-500 capitalize">
                          {sp.role === "vendedor" ? "Vendedor" : sp.role === "capacitador" ? "Capacitador" : sp.role}
                        </div>
                      </div>
                    </div>
                    {sp.specialties && sp.specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sp.specialties.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-canvas-2 text-ink-700 border border-line"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-xs text-ink-500">
                      {sp.slots.length} horarios disponibles
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3 */}
        {selected && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-ink-900 text-white text-xs font-medium flex items-center justify-center">
                3
              </span>
              <h2 className="font-display text-xl tracking-tight text-ink-900">
                Confirma tu cita
              </h2>
            </div>

            <div className="card-enterprise p-6">
              <p className="text-xs uppercase tracking-widest text-ink-500 font-medium mb-3">
                Horarios disponibles con {selected.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.slots.map((s) => {
                  const active = selectedSlot === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm border transition-colors",
                        active
                          ? "border-coral-500 bg-coral-50 text-ink-900"
                          : "border-line bg-white text-ink-700 hover:border-ink-300",
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      {formatSlot(s)}
                    </button>
                  );
                })}
              </div>

              <div className="divider-hair my-6" />

              <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <Input
                      className="pl-9"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Nombre y apellidos"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <Input
                      className="pl-9"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="correo@empresa.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Teléfono (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <Input
                      className="pl-9"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="55 0000 0000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Empresa (opcional)</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <Input
                      className="pl-9"
                      value={form.company}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Notas (opcional)</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10"
                    placeholder="Cuéntanos brevemente tu situación."
                  />
                  <HelperText>
                    Compartiremos esta información con tu especialista.
                  </HelperText>
                </div>

                {error && (
                  <div className="md:col-span-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="md:col-span-2 flex items-center justify-between pt-2">
                  <p className="text-xs text-ink-500">
                    Al confirmar aceptas ser contactado por PROCHECK Safety.
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="btn-primary disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? "Confirmando..." : "Confirmar cita"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
