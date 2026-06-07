"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CameraScreen } from "./CameraScreen";
import { GalleryScreen } from "./GalleryScreen";
import type { Event } from "@/lib/supabase/types";

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const idRef = useRef(0);
  const show = useCallback((text: string) => {
    const id = ++idRef.current;
    setMsg(text);
    setTimeout(() => setMsg(m => (m === text ? null : m)), 2400);
    void id;
  }, []);
  return { msg, show };
}

interface Props {
  event: Event;
}

export function PartyApp({ event }: Props) {
  const [tab, setTab] = useState<"camera" | "gallery">("camera");
  const [refreshKey, setRefreshKey] = useState(0);
  const [count, setCount] = useState(0);
  const { msg: toastMsg, show: toast } = useToast();

  useEffect(() => {
    fetch("/api/photos")
      .then(r => r.json())
      .then(d => setCount((d.photos || []).length))
      .catch(() => {});
  }, [refreshKey]);

  function handleSaved() {
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="relative min-h-dvh">
      {/* header */}
      <header className="flex items-center justify-between px-5 py-4 max-w-[980px] mx-auto">
        <div className="font-['Instrument_Serif'] italic text-[22px] leading-none" style={{ color: "var(--ink)" }}>
          <small className="block font-['IBM_Plex_Mono'] not-italic text-[9px] tracking-[0.22em] uppercase text-[var(--ink-soft)] mb-0.5">
            Rolo 01
          </small>
          {event.name}<span style={{ color: "var(--stamp)" }}>.</span>
        </div>
        <div className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase text-[var(--ink-soft)] flex items-center gap-2">
          <span>Fotos</span>
          <b className="text-[var(--ink)] font-medium text-sm">{String(count).padStart(3, "0")}</b>
        </div>
      </header>

      {/* content */}
      {tab === "camera" ? (
        <CameraScreen onSaved={handleSaved} toast={toast} />
      ) : (
        <GalleryScreen refreshKey={refreshKey} toast={toast} onUploaded={handleSaved} />
      )}

      {/* bottom nav */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 flex bg-[var(--ink)] text-[var(--paper)] p-1.5 z-50 shadow-[0_8px_22px_rgba(31,24,18,0.35)]">
        {(["camera","gallery"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.22em] uppercase px-5 py-3 transition-all ${
              tab === t
                ? "bg-[var(--paper)] text-[var(--ink)] opacity-100"
                : "opacity-55 hover:opacity-85"
            }`}
          >
            {t === "camera" ? "📷 Câmera" : "▦ Galeria"}
          </button>
        ))}
      </nav>

      {/* toast */}
      {toastMsg && (
        <div
          key={toastMsg}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-[var(--paper)] font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase px-5 py-3 z-[400] toast-anim whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
