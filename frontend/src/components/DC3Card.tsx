import { ShieldCheck } from "lucide-react";

type Props = {
  folio: string;
  holder: string;
  courseCode: string;
  courseName: string;
  validUntil: string;
  className?: string;
};

export function DC3Card({
  folio,
  holder,
  courseCode,
  courseName,
  validUntil,
  className = "",
}: Props) {
  return (
    <div
      className={`relative rounded-lg border border-line shadow-cardHover overflow-hidden ${className}`}
      style={{
        backgroundColor: "#F9F5EA",
        backgroundImage:
          "radial-gradient(circle at 90% 10%, rgba(255,107,53,0.06), transparent 60%)",
      }}
    >
      {/* Header stripe */}
      <div className="h-1.5 bg-ink" />
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="field-mono text-[0.6rem]">
              CONSTANCIA DE COMPETENCIAS · DC-3
            </div>
            <div className="mt-0.5 font-mono text-[0.72rem] font-semibold text-ink-800">
              FOLIO {folio}
            </div>
          </div>
          {/* STPS-style seal */}
          <div className="shrink-0 relative w-11 h-11 rounded-full border-2 border-ink flex items-center justify-center bg-white">
            <div className="absolute inset-0.5 rounded-full border border-ink/30" />
            <ShieldCheck className="w-5 h-5 text-ink" strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div>
            <div className="text-[0.6rem] uppercase tracking-widest text-ink-500 font-medium">
              Trabajador
            </div>
            <div className="text-sm font-semibold text-ink-900 leading-tight">
              {holder}
            </div>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-widest text-ink-500 font-medium">
              Curso
            </div>
            <div className="text-[0.78rem] font-medium text-ink-800 leading-tight">
              <span className="font-mono text-coral font-semibold">
                {courseCode}
              </span>
              <span className="mx-1.5 text-ink-300">·</span>
              {courseName}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2.5">
          <div className="badge-status-success">
            <ShieldCheck className="w-3 h-3" />
            <span>VIGENTE HASTA {validUntil}</span>
          </div>
          <div className="field-mono text-[0.58rem]">STPS · ACE-2025-0142</div>
        </div>
      </div>
    </div>
  );
}

export default DC3Card;
