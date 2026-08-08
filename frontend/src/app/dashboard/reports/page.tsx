import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BadgeCheck,
  ArrowUp,
} from "lucide-react";
import { IMG } from "@/lib/images";
import ReportsExport from "./ReportsExport";

const salesByRep = [
  { rep: "Ana Sofía Gutiérrez", ventas: 128500, comision: 12850, paquetes: 14, avatar: IMG.avatar3 },
  { rep: "Luis Fernando Ríos", ventas: 96200, comision: 9620, paquetes: 10, avatar: IMG.avatar2 },
  { rep: "Paola Herrera", ventas: 74300, comision: 7430, paquetes: 8, avatar: IMG.avatar1 },
  { rep: "Miguel Ángel Torres", ventas: 51100, comision: 5110, paquetes: 6, avatar: IMG.avatar2 },
];

function MiniSpark({ points }: { points: string }) {
  return (
    <svg viewBox="0 0 60 20" width="60" height="20">
      <polyline
        fill="none"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

const sparks = [
  "0,16 10,12 20,14 30,8 40,10 50,4 60,6",
  "0,14 10,16 20,10 30,12 40,8 50,10 60,6",
  "0,10 10,12 20,8 30,10 40,6 50,8 60,4",
  "0,18 10,14 20,16 30,10 40,12 50,8 60,10",
];

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Reportes</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
            Reportes.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Cumplimiento, capacitación y desempeño comercial.
          </p>
        </div>
        <ReportsExport />
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Cumplimiento global", value: "89%", icon: Target, delta: "+3%" },
          { label: "Cursos completados", value: "312", icon: BadgeCheck, delta: "+18" },
          { label: "Cursos por vencer", value: "18", icon: Clock, delta: "-2" },
          { label: "Score promedio", value: "91", icon: Award, delta: "+1" },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white border border-line rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div className="text-xs uppercase tracking-widest text-ink-500 font-medium">
                {k.label}
              </div>
              <k.icon className="h-4 w-4 text-ink-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="font-display text-3xl font-semibold text-ink-900 tracking-tight">
                {k.value}
              </div>
              <span className="inline-flex items-center text-xs font-medium text-success gap-0.5">
                <ArrowUp className="h-3 w-3" /> {k.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-white border border-line rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
              Completadas por mes (12 meses)
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              Certificaciones emitidas por periodo
            </p>
          </div>
          <span className="badge-status-success">
            <TrendingUp className="h-3 w-3" /> +18% vs. año anterior
          </span>
        </div>
        <div className="relative h-64 rounded-lg bg-canvas-2 overflow-hidden">
          <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
            {[40, 80, 120, 160].map((y) => (
              <line
                key={y}
                x1="0"
                x2="600"
                y1={y}
                y2={y}
                stroke="#0F1725"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}
            <polyline
              fill="rgba(255,107,53,0.10)"
              stroke="none"
              points="0,160 50,140 100,150 150,120 200,110 250,90 300,95 350,70 400,80 450,55 500,45 550,30 600,20 600,200 0,200"
            />
            <polyline
              fill="none"
              stroke="#0F1725"
              strokeWidth="2"
              points="0,160 50,140 100,150 150,120 200,110 250,90 300,95 350,70 400,80 450,55 500,45 550,30 600,20"
            />
            {[
              [0, 160], [100, 150], [200, 110], [300, 95], [400, 80], [500, 45], [600, 20],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#FF6B35" stroke="#FFFFFF" strokeWidth="2" />
            ))}
          </svg>
        </div>
      </div>

      {/* Sales by rep */}
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h3 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
            Ventas por vendedor
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Comisión al 10% de ventas totales
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas-2">
              <tr>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Vendedor
                </th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Tendencia
                </th>
                <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Ventas totales
                </th>
                <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Comisión
                </th>
                <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-ink-500 font-medium">
                  Paquetes
                </th>
              </tr>
            </thead>
            <tbody>
              {salesByRep.map((s, i) => (
                <tr
                  key={s.rep}
                  className="border-t border-line hover:bg-canvas-2 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.avatar}
                        alt={s.rep}
                        className="h-9 w-9 rounded-full object-cover border border-line"
                      />
                      <span className="font-medium text-ink-900">{s.rep}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <MiniSpark points={sparks[i]} />
                  </td>
                  <td className="px-6 py-3 text-right font-display font-semibold text-ink-900">
                    ${s.ventas.toLocaleString("es-MX")}
                  </td>
                  <td className="px-6 py-3 text-right font-display font-semibold text-coral-600">
                    ${s.comision.toLocaleString("es-MX")}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-ink-700">
                    {s.paquetes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
