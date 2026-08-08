import { AccountForm } from "@/components/AccountForm";
import { InvoiceHistory } from "@/components/InvoiceHistory";
import { RfcForm } from "@/components/RfcForm";

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <div className="mb-6">
          <p className="kicker mb-2">Perfil</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Mi cuenta.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Actualiza tu información personal, dirección y ajustes de seguridad.
          </p>
        </div>
        <AccountForm />
      </div>

      <div>
        <div className="mb-6">
          <p className="kicker mb-2">Datos fiscales</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight">
            Registro Federal de Contribuyentes.
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Registra tu RFC para poder emitir facturas electrónicas (CFDI) de
            tus pedidos.
          </p>
        </div>
        <RfcForm />
      </div>

      <InvoiceHistory />
    </div>
  );
}
