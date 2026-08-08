"use client";

import * as React from "react";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "procheck_cookies_ack";

export function CookieBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const ack = window.localStorage.getItem(STORAGE_KEY);
      if (!ack) setVisible(true);
    } catch {
      // ignore storage errors
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 md:p-6 pointer-events-none">
      <div className="mx-auto w-full md:max-w-3xl bg-white border border-line rounded-xl shadow-xl p-4 md:p-5 pointer-events-auto flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="shrink-0 h-10 w-10 rounded-lg bg-canvas-2 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-coral-500" />
          </div>
          <p className="text-sm text-ink-700 leading-snug">
            Usamos cookies para mejorar tu experiencia y cumplir con la LFPDPPP.
            Al continuar aceptas nuestro Aviso de Privacidad.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/privacy"
            className="btn-ghost text-xs px-3 py-2"
          >
            Ver Aviso de Privacidad
          </a>
          <button
            type="button"
            onClick={accept}
            className="btn-primary text-xs px-4 py-2"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
