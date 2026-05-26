"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/supabase/types";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

// Decorative background polaroids
function ScatteredBg() {
  const polas: Array<{ left?: string; right?: string; top: string; rotate: number }> = [
    { left: "-4%",  top: "8%",  rotate: -8 },
    { right: "-6%", top: "14%", rotate: 6 },
    { left: "62%",  top: "55%", rotate: -4 },
    { left: "-8%",  top: "62%", rotate: 9 },
    { right: "4%",  top: "78%", rotate: -10 },
    { left: "40%",  top: "92%", rotate: 3 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[-1]" aria-hidden>
      {polas.map((p, i) => (
        <div
          key={i}
          className="absolute w-32 bg-[#fbf6e8] p-2.5 pb-7 shadow-[var(--shadow)] opacity-50"
          style={{ left: p.left, right: p.right, top: p.top, transform: `rotate(${p.rotate}deg)` }}
        >
          <div
            className="w-full aspect-square"
            style={{
              background: `linear-gradient(135deg, #c9b58a 0%, #a18d63 50%, #6e5d3a 100%)`,
              filter: `hue-rotate(${i * 25}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface Props {
  event: Event;
  tokenParam?: string;
}

export function TokenGatePage({ event, tokenParam }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "validating" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function validate(token: string) {
    setStatus("validating");
    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      router.replace(`/e/${event.slug}`);
    } else {
      const { error } = await res.json();
      setErrorMsg(error || "QR Code inválido.");
      setStatus("error");
    }
  }

  // Auto-validate if token came from QR URL
  useEffect(() => {
    if (tokenParam) {
      validate(decodeURIComponent(tokenParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenParam]);

  if (status === "validating") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-6">
        <p className="font-['IBM_Plex_Mono'] text-[12px] tracking-[0.18em] uppercase text-[var(--ink-soft)] mb-3">
          Validando QR Code...
        </p>
        <div className="w-8 h-8 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh flex flex-col justify-center px-7 py-10 text-center max-w-xl mx-auto">
      <ScatteredBg />

      <div className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase text-[var(--ink-soft)] flex items-center gap-3 mb-8 justify-center">
        <span className="flex-1 h-px bg-[var(--ink)] opacity-20 max-w-16" />
        Rolo 01 · {formatDate(event.event_date)}
        <span className="flex-1 h-px bg-[var(--ink)] opacity-20 max-w-16" />
      </div>

      <h1 className="font-['Instrument_Serif'] italic leading-none mb-4 text-left" style={{ fontSize: "clamp(52px,13vw,96px)", color: "var(--ink)" }}>
        <span className="block not-italic font-normal tracking-[0.04em] uppercase text-[0.62em] text-[var(--ink-soft)] mb-1">
          Bem-vindo ao
        </span>
        <span className="font-['Caveat'] not-italic block text-[var(--stamp)]" style={{ fontSize: "1.1em", lineHeight: 0.9 }}>
          {event.name}!
        </span>
      </h1>

      <p className="font-['Instrument_Serif'] italic text-[22px] text-[var(--ink-soft)] mb-10 text-left">
        Toda foto da festa entra aqui. Tire, veja, baixe — depois a gente guarda tudo.
      </p>

      {status === "error" && (
        <div className="mb-6 border border-[var(--stamp)] p-4 text-left">
          <p className="text-[12px] font-['IBM_Plex_Mono'] tracking-wide" style={{ color: "var(--stamp)" }}>
            {errorMsg}
          </p>
          <p className="text-[11px] text-[var(--ink-soft)] mt-1 tracking-wide">
            Peça o QR Code pro organizador da festa.
          </p>
        </div>
      )}

      <div className="bg-[var(--paper-2)] border border-[var(--ink)] p-6 text-left relative">
        <div className="absolute -top-4 left-6 w-16 h-5 bg-[var(--tape)] border-l border-r border-dashed border-[var(--tape-edge)] -rotate-2" />
        <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.06em] text-[var(--ink-soft)] leading-relaxed">
          <span className="text-[var(--stamp)] font-medium">Acesso exclusivo via QR Code.</span>
          <br />
          Escaneie o QR impresso na festa para entrar automaticamente.
          Sem QR, sem acesso.
        </p>
      </div>

      <p className="mt-10 font-['IBM_Plex_Mono'] text-[9px] tracking-[0.3em] uppercase text-[var(--ink-faint)]">
        Privado · só pra família e amigos
      </p>
    </div>
  );
}
