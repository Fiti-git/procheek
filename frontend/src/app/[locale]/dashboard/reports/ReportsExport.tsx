"use client";

import * as React from "react";
import { Download, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const CSV_OPTIONS = [
  { key: "overview", label: "Resumen", file: "resumen.csv" },
  { key: "courses", label: "Cursos", file: "cursos.csv" },
  { key: "learners", label: "Alumnos", file: "alumnos.csv" },
];

export function ReportsExport() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const downloadCsv = async (key: string, file: string) => {
    setOpen(false);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("procheck_token")
          : null;
      const res = await fetch(`${API_URL}/analytics/${key}.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({
        title: "No se pudo descargar",
        description: e?.message,
        variant: "error",
      });
    }
  };

  const exportPdf = () => {
    toast({ title: "Función próximamente", variant: "info" });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={ref}>
        <Button
          variant="secondary"
          onClick={() => setOpen((v) => !v)}
          className="text-xs"
        >
          <Download className="h-4 w-4 mr-2 inline" />
          Exportar CSV
          <ChevronDown className="h-3 w-3 ml-1 inline" />
        </Button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-line rounded-xl shadow-xl overflow-hidden z-40">
            {CSV_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => downloadCsv(o.key, o.file)}
                className="w-full text-left px-4 py-2.5 text-sm text-ink-800 hover:bg-canvas-2 border-b border-line last:border-b-0"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button variant="secondary" onClick={exportPdf} className="text-xs">
        <FileText className="h-4 w-4 mr-2 inline" />
        Exportar PDF
      </Button>
    </div>
  );
}

export default ReportsExport;
