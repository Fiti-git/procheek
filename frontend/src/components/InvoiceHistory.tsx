"use client";

import * as React from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/cn";

type CfdiStatus = "PENDING" | "STAMPED" | "CANCELED";

type Invoice = {
  id: string;
  paymentId: string;
  number: string;
  cfdiUuid: string | null;
  cfdiXmlUrl: string | null;
  pdfUrl: string | null;
  subtotalMxn: number;
  taxMxn: number;
  totalMxn: number;
  issuedAt: string;
  stampedAt: string | null;
  cfdiCanceledAt: string | null;
  cfdiReason: string | null;
  cfdiStatus: CfdiStatus;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const currencyFmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: CfdiStatus }) {
  const label =
    status === "STAMPED"
      ? "Timbrada"
      : status === "PENDING"
        ? "Pendiente"
        : "Cancelada";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        status === "STAMPED" &&
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        status === "PENDING" &&
          "bg-amber-50 text-amber-700 border-amber-200",
        status === "CANCELED" && "bg-red-50 text-red-700 border-red-200",
      )}
    >
      {label}
    </span>
  );
}

export function InvoiceHistory() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGet<Invoice[]>("/payments/me/invoices");
        if (alive) {
          setInvoices(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (e) {
        if (alive) {
          setError((e as Error).message || "Error al cargar facturas");
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const download = async (inv: Invoice) => {
    setDownloadingId(inv.id);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("procheck_token")
          : null;
      const res = await fetch(
        `${API_URL}/payments/invoices/${inv.id}/pdf`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        if (res.status === 404) {
          toast({
            title: "PDF aún no disponible",
            description:
              "Se genera cuando el CFDI está timbrado.",
            variant: "info",
          });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${inv.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Descarga iniciada", variant: "success" });
    } catch {
      toast({
        title: "No se pudo descargar la factura",
        variant: "error",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="kicker mb-2">Facturación</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tracking-tight">
          Mis facturas.
        </h2>
        <p className="mt-2 text-sm text-ink-700">
          Descarga tus facturas CFDI. Se generan automáticamente al pagar.
        </p>
      </div>

      {loading ? (
        <div className="card-enterprise p-6">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-10 rounded-md bg-canvas-2 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="card-enterprise p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            No pudimos cargar tus facturas. {error}
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="card-enterprise p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-canvas-2 flex items-center justify-center mb-3">
            <FileText className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm text-ink-700">
            Aún no tienes facturas. Se generan automáticamente al comprar un curso.
          </p>
        </div>
      ) : (
        <div className="card-enterprise overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-2">
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500">
                  <th className="px-4 py-3 font-medium">Número</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                  <th className="px-4 py-3 font-medium text-right">IVA</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Estado CFDI</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-line align-middle">
                    <td className="px-4 py-3 font-mono text-xs text-ink-900">
                      {inv.number}
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      {formatDate(inv.issuedAt)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-700">
                      {currencyFmt.format(inv.subtotalMxn)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-700">
                      {currencyFmt.format(inv.taxMxn)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-900 text-base">
                      {currencyFmt.format(inv.totalMxn)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.cfdiStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {inv.cfdiStatus === "STAMPED" && inv.cfdiXmlUrl && (
                          <a
                            href={inv.cfdiXmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-ink-700 hover:bg-canvas-2 border border-line"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver XML
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => download(inv)}
                          disabled={downloadingId === inv.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-ink-900 hover:bg-canvas-2 border border-line disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingId === inv.id
                            ? "Descargando..."
                            : "Descargar PDF"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default InvoiceHistory;
