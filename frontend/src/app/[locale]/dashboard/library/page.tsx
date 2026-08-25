"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FileText,
  BookOpen,
  File,
  PlayCircle,
  Download,
  ShoppingCart,
  CheckCircle2,
  Library as LibraryIcon,
  RefreshCw,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type LibraryDoc = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileType: string;
  fileUrl: string;
  fileSizeBytes: string | number | null;
  thumbnailUrl: string | null;
  nomReference: string | null;
  industry: string | null;
  isFree: boolean;
  price: string | number | null;
  isPublished: boolean;
  downloadCount: number;
};

type Purchase = {
  document_id: string;
};

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todas las categorías" },
  { value: "nom_009", label: "NOM-009" },
  { value: "nom_017", label: "NOM-017" },
  { value: "nom_002", label: "NOM-002" },
  { value: "nom_019", label: "NOM-019" },
  { value: "nom_036", label: "NOM-036" },
  { value: "other", label: "Otros" },
];

const INDUSTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todas las industrias" },
  { value: "construccion", label: "Construcción" },
  { value: "quimica", label: "Química" },
  { value: "metalmecanica", label: "Metal-mecánica" },
  { value: "mineria", label: "Minería" },
  { value: "general", label: "General" },
];

const PRICE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "free", label: "Gratis" },
  { value: "paid", label: "De pago" },
];

function TypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === "epub") return <BookOpen className="h-4 w-4" />;
  if (t === "docx") return <File className="h-4 w-4" />;
  if (t === "mp4") return <PlayCircle className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function formatSize(bytes: string | number | null | undefined): string {
  if (!bytes) return "";
  const b = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!Number.isFinite(b) || b <= 0) return "";
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`;
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b >= 1_000) return `${(b / 1_000).toFixed(0)} KB`;
  return `${b} B`;
}

function industryLabel(v: string | null): string {
  if (!v) return "";
  const m = INDUSTRY_OPTIONS.find((o) => o.value === v);
  return m ? m.label : v;
}

export default function LibraryPage() {
  const { toast } = useToast();
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [priceMode, setPriceMode] = useState("");

  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [thumbFail, setThumbFail] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<LibraryDoc[]>("/library/documents");
      setDocs(data);
      // Try to fetch purchases (silent fail if not logged in)
      try {
        const p = await apiGet<Purchase[]>("/library/purchases/me");
        setPurchases(new Set(p.map((x) => x.document_id)));
      } catch {
        setPurchases(new Set());
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar la biblioteca";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (category && d.category !== category) return false;
      if (industry && d.industry !== industry) return false;
      if (priceMode === "free" && !d.isFree) return false;
      if (priceMode === "paid" && d.isFree) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const inTitle = d.title.toLowerCase().includes(q);
        const inDesc = (d.description || "").toLowerCase().includes(q);
        const inNom = (d.nomReference || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inNom) return false;
      }
      return true;
    });
  }, [docs, category, industry, priceMode, debouncedSearch]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setIndustry("");
    setPriceMode("");
  };

  const handleDownload = async (doc: LibraryDoc) => {
    setDownloadingId(doc.id);
    try {
      const res = await apiPost<{ file_url: string }>(
        `/library/documents/${doc.id}/download`,
      );
      if (typeof window !== "undefined") {
        window.open(res.file_url, "_blank", "noopener,noreferrer");
      }
      // bump local download count
      setDocs((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, downloadCount: d.downloadCount + 1 } : d,
        ),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo descargar";
      toast({ title: "Descarga rechazada", description: msg, variant: "error" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePurchase = async (doc: LibraryDoc) => {
    setBuyingId(doc.id);
    try {
      await apiPost(`/library/documents/${doc.id}/purchase`);
      setPurchases((prev) => {
        const next = new Set(prev);
        next.add(doc.id);
        return next;
      });
      toast({
        title: "Compra confirmada",
        description: `${doc.title} ya está disponible en tu biblioteca.`,
        variant: "success",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo completar la compra";
      toast({ title: "Compra no realizada", description: msg, variant: "error" });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="kicker mb-2">Biblioteca</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Biblioteca.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Manuales, guías, libros y videos de referencia sobre seguridad laboral.
        </p>
      </div>

      <div className="card-enterprise p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, NOM o descripción"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-coral-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-coral-500"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-coral-500"
        >
          {INDUSTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={priceMode}
          onChange={(e) => setPriceMode(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-coral-500"
        >
          {PRICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card-enterprise p-4 animate-pulse flex flex-col gap-3"
            >
              <div className="aspect-video bg-ink-50 rounded-lg" />
              <div className="h-4 bg-ink-50 rounded w-3/4" />
              <div className="h-3 bg-ink-50 rounded w-1/2" />
              <div className="h-9 bg-ink-50 rounded mt-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card-enterprise p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <p className="font-display text-lg text-ink-900">
              No pudimos cargar la biblioteca.
            </p>
            <p className="text-sm text-ink-500 mt-1">{error}</p>
          </div>
          <button className="btn-secondary" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card-enterprise p-8 text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-ink-50 flex items-center justify-center">
            <LibraryIcon className="h-6 w-6 text-ink-500" />
          </div>
          <p className="font-display text-lg text-ink-900">
            No encontramos documentos con esos filtros.
          </p>
          <p className="text-sm text-ink-500">
            Prueba con otra combinación o limpia los filtros.
          </p>
          <button className="btn-ghost text-sm" onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => {
            const purchased = purchases.has(d.id);
            const priceNum =
              d.price != null
                ? typeof d.price === "string"
                  ? Number(d.price)
                  : d.price
                : 0;
            const size = formatSize(d.fileSizeBytes);
            const industryStr = industryLabel(d.industry);
            const showThumb = d.thumbnailUrl && !thumbFail.has(d.id);
            return (
              <article
                key={d.id}
                className="card-enterprise p-0 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-video bg-ink-50">
                  {showThumb ? (
                    <Image
                      src={d.thumbnailUrl as string}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      onError={() =>
                        setThumbFail((prev) => {
                          const next = new Set(prev);
                          next.add(d.id);
                          return next;
                        })
                      }
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LibraryIcon className="h-10 w-10 text-ink-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="badge-compliance bg-white/95 border border-line text-ink-700 gap-1">
                      <TypeIcon type={d.fileType} />
                      <span className="font-mono text-[10px] uppercase">
                        {d.fileType}
                      </span>
                    </span>
                  </div>
                  {purchased && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Comprado
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {d.nomReference && (
                    <span className="inline-flex self-start items-center bg-ink-50 text-ink-700 border border-line rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold mb-2">
                      {d.nomReference}
                    </span>
                  )}
                  <h3 className="font-display text-base font-semibold text-ink-900 tracking-tight line-clamp-2">
                    {d.title}
                  </h3>
                  {d.description && (
                    <p className="text-xs text-ink-500 mt-1 line-clamp-2">
                      {d.description}
                    </p>
                  )}
                  <div className="field-mono text-ink-500 mt-2 flex items-center gap-2 flex-wrap">
                    {size && <span>{size}</span>}
                    {size && industryStr && <span>·</span>}
                    {industryStr && <span>{industryStr}</span>}
                  </div>

                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    {d.isFree || purchased ? (
                      <button
                        className="btn-primary w-full text-sm py-2"
                        onClick={() => handleDownload(d)}
                        disabled={downloadingId === d.id}
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === d.id ? "Descargando…" : "Descargar"}
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn-secondary w-full text-sm py-2"
                          onClick={() => handleDownload(d)}
                          disabled={downloadingId === d.id}
                        >
                          Vista previa
                        </button>
                        <button
                          className="btn-primary w-full text-sm py-2"
                          onClick={() => handlePurchase(d)}
                          disabled={buyingId === d.id}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {buyingId === d.id
                            ? "Procesando…"
                            : `Comprar $${priceNum.toLocaleString("es-MX")} MXN`}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
