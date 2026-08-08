"use client";

import * as React from "react";
import { Input, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { apiGet, apiPatch } from "@/lib/api";

type RfcData = {
  rfc?: string;
  razonSocial?: string;
  codigoPostal?: string;
  regimenFiscal?: string;
  usoCfdi?: string;
  siempreFacturar?: boolean;
  contribuyenteIeps?: boolean;
};

const REGIMENES_FISCALES = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { value: "611", label: "611 - Ingresos por Dividendos (socios y accionistas)" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { value: "614", label: "614 - Ingresos por intereses" },
  { value: "615", label: "615 - Régimen de los ingresos por obtención de premios" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "620", label: "620 - Sociedades Cooperativas de Producción" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
];

const USOS_CFDI = [
  { value: "G01", label: "G01 - Adquisición de mercancías" },
  { value: "G02", label: "G02 - Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 - Gastos en general" },
  { value: "I01", label: "I01 - Construcciones" },
  { value: "I02", label: "I02 - Mobiliario y equipo de oficina por inversiones" },
  { value: "I03", label: "I03 - Equipo de transporte" },
  { value: "I04", label: "I04 - Equipo de cómputo y accesorios" },
  { value: "I05", label: "I05 - Dados, troqueles, moldes, matrices y herramental" },
  { value: "I06", label: "I06 - Comunicaciones telefónicas" },
  { value: "I07", label: "I07 - Comunicaciones satelitales" },
  { value: "I08", label: "I08 - Otra maquinaria y equipo" },
  { value: "D01", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "D02", label: "D02 - Gastos médicos por incapacidad o discapacidad" },
  { value: "D03", label: "D03 - Gastos funerales" },
  { value: "D04", label: "D04 - Donativos" },
  { value: "D05", label: "D05 - Intereses reales efectivamente pagados por créditos hipotecarios" },
  { value: "D06", label: "D06 - Aportaciones voluntarias al SAR" },
  { value: "D07", label: "D07 - Primas por seguros de gastos médicos" },
  { value: "D08", label: "D08 - Gastos de transportación escolar obligatoria" },
  { value: "D09", label: "D09 - Depósitos en cuentas para el ahorro, primas de pensiones" },
  { value: "D10", label: "D10 - Pagos por servicios educativos (colegiaturas)" },
  { value: "S01", label: "S01 - Sin efectos fiscales" },
  { value: "CP01", label: "CP01 - Pagos" },
  { value: "CN01", label: "CN01 - Nómina" },
];

const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

function normalize(raw: Record<string, unknown>): RfcData {
  const asString = (v: unknown) => (typeof v === "string" ? v : undefined);
  const asBool = (v: unknown) => (typeof v === "boolean" ? v : undefined);
  return {
    rfc: asString(raw.rfc),
    razonSocial: asString(raw.razonSocial) || asString(raw.razon_social),
    codigoPostal: asString(raw.codigoPostal) || asString(raw.codigo_postal),
    regimenFiscal: asString(raw.regimenFiscal) || asString(raw.regimen_fiscal),
    usoCfdi: asString(raw.usoCfdi) || asString(raw.uso_cfdi),
    siempreFacturar: asBool(raw.siempreFacturar) ?? asBool(raw.siempre_facturar),
    contribuyenteIeps:
      asBool(raw.contribuyenteIeps) ?? asBool(raw.contribuyente_ieps),
  };
}

async function fetchRfc(): Promise<RfcData> {
  try {
    const data = (await apiGet<Record<string, unknown>>("/users/me/rfc")) || {};
    return normalize(data);
  } catch {
    return {};
  }
}

async function saveRfc(body: RfcData): Promise<void> {
  await apiPatch("/users/me/rfc", body);
}

export function RfcForm() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [data, setData] = React.useState<RfcData>({});

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const rfc = await fetchRfc();
      if (alive) {
        setData(rfc);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = <K extends keyof RfcData>(key: K, value: RfcData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    !!data.rfc &&
    RFC_REGEX.test((data.rfc || "").toUpperCase()) &&
    !!data.razonSocial &&
    !!data.codigoPostal &&
    /^\d{5}$/.test(data.codigoPostal || "") &&
    !!data.regimenFiscal &&
    !!data.usoCfdi;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast({
        title: "Revisa tus datos fiscales",
        description: "Completa todos los campos requeridos.",
        variant: "error",
      });
      return;
    }
    setSaving(true);
    try {
      await saveRfc({
        ...data,
        rfc: (data.rfc || "").toUpperCase(),
      });
      toast({
        title: "Datos fiscales guardados",
        description: "Tu RFC se registró correctamente.",
        variant: "success",
      });
    } catch (e) {
      const msg = (e as Error).message || "";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        toast({
          title: "Función próximamente disponible",
          description: "El registro de RFC aún no está listo en el servidor.",
          variant: "info",
        });
      } else {
        toast({
          title: "No pudimos guardar tus datos fiscales",
          description: msg,
          variant: "error",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card-enterprise p-6 text-sm text-ink-500">
        Cargando tus datos fiscales...
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <section className="card-enterprise p-6">
        <h2 className="font-display text-lg tracking-tight text-ink-900 mb-1">
          Agrega o edita tu Registro Federal de Contribuyentes (RFC)
        </h2>
        <p className="text-sm text-ink-500 mb-4">
          El RFC y los demás datos fiscales solicitados en esta sección son
          necesarios para poder emitir una factura (CFDI). Puedes solicitar la
          factura electrónica (CFDI) desde Mis Pedidos, en los detalles del
          pedido.
        </p>
        <p className="text-xs text-ink-500 mb-6 rounded-md bg-canvas-2 border border-line p-3">
          <span className="font-medium text-ink-700">Nota:</span> Los datos
          fiscales deben coincidir con la información registrada ante el
          Servicio de Administración Tributaria (SAT), incluida en tu
          Constancia de Situación Fiscal (CSF).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>RFC</Label>
            <Input
              value={data.rfc || ""}
              onChange={(e) =>
                update("rfc", e.target.value.toUpperCase().slice(0, 13))
              }
              placeholder="XXXXXXXXXXX(X)"
              maxLength={13}
              autoComplete="off"
            />
          </div>
          <div>
            <Label>Nombre o Razón Social</Label>
            <Input
              value={data.razonSocial || ""}
              onChange={(e) => update("razonSocial", e.target.value)}
              placeholder="Ingrese Nombre o Razón Social"
            />
          </div>
          <div>
            <Label>Código Postal</Label>
            <Input
              value={data.codigoPostal || ""}
              onChange={(e) =>
                update("codigoPostal", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="XXXXX"
              inputMode="numeric"
              maxLength={5}
            />
          </div>
          <div>
            <Label>Régimen Fiscal</Label>
            <select
              value={data.regimenFiscal || ""}
              onChange={(e) => update("regimenFiscal", e.target.value)}
              className="w-full h-[42px] rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
            >
              <option value="">Seleccione una Opción</option>
              {REGIMENES_FISCALES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Uso del CFDI</Label>
            <select
              value={data.usoCfdi || ""}
              onChange={(e) => update("usoCfdi", e.target.value)}
              className="w-full h-[42px] rounded-lg border border-line bg-white px-3 text-sm text-ink-800 focus:outline-none focus:border-ink"
            >
              <option value="">Seleccione una Opción</option>
              {USOS_CFDI.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.siempreFacturar}
            onChange={(e) => update("siempreFacturar", e.target.checked)}
            className="h-4 w-4 rounded border-line text-ink-900 focus:ring-ink/20"
          />
          Solicitar siempre la factura electrónica
        </label>

        <div className="mt-4 rounded-lg border border-line bg-canvas-2 p-4">
          <p className="text-xs font-medium text-ink-700 mb-2">
            Exclusivo para Clientes contribuyentes del Impuesto sobre Producción
            y Servicios (IEPS):
          </p>
          <label className="flex items-start gap-3 text-xs text-ink-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.contribuyenteIeps}
              onChange={(e) => update("contribuyenteIeps", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line text-ink-900 focus:ring-ink/20"
            />
            <span>
              Manifiesto que soy contribuyente del Impuesto Especial sobre
              Producción y Servicios (IEPS) en términos de las disposiciones
              fiscales aplicables, por lo que requiero que sea emitido el
              Comprobante Fiscal Digital por Internet que corresponda en el que
              se traslade expresamente y por separado del mismo.
            </span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving || !canSubmit}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </section>
    </form>
  );
}

export default RfcForm;
