"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { Event } from "@/lib/supabase/types";

// ── helpers ──────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Login screen ──────────────────────────────────────────────────
function LoginScreen({ onAuthed }: { onAuthed: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password: pass }),
    });
    if (res.ok) {
      onAuthed();
    } else {
      const { error: msg } = await res.json();
      setError(msg || "Credenciais inválidas.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* brand */}
        <div className="flex items-baseline gap-3 mb-8 text-[11px] tracking-[0.18em] uppercase text-[var(--ink-soft)]">
          <span className="flex-1 h-px bg-[var(--ink)] opacity-20" />
          <span>Admin · Event Photos</span>
          <span className="flex-1 h-px bg-[var(--ink)] opacity-20" />
        </div>

        <h1 className="font-['Instrument_Serif'] italic text-5xl leading-none mb-8" style={{ color: "var(--ink)" }}>
          <span className="block not-italic font-normal text-[0.62em] tracking-[0.04em] uppercase text-[var(--ink-soft)] mb-1">Acesso</span>
          Admin.
        </h1>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-[0.22em] uppercase text-[var(--ink-soft)]">Usuário</label>
            <input
              value={user}
              onChange={e => setUser(e.target.value)}
              className="bg-transparent border border-[var(--ink)] px-4 py-3 text-[18px] tracking-wide outline-none focus:border-[var(--stamp)] font-['IBM_Plex_Mono']"
              style={{ color: "var(--ink)" }}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-[0.22em] uppercase text-[var(--ink-soft)]">Senha</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="bg-transparent border border-[var(--ink)] px-4 py-3 text-[18px] tracking-wide outline-none focus:border-[var(--stamp)] font-['IBM_Plex_Mono']"
              style={{ color: "var(--ink)" }}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-[12px] tracking-wide" style={{ color: "var(--stamp)" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] text-[12px] tracking-[0.18em] uppercase px-5 py-4 cursor-pointer disabled:opacity-50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────
function QRModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const eventUrl = typeof window !== "undefined"
    ? `${window.location.origin}/e/${event.slug}?t=${encodeURIComponent(event.access_token)}`
    : "";

  useEffect(() => {
    if (!eventUrl) return;
    QRCode.toDataURL(eventUrl, { width: 256, margin: 2, color: { dark: "#1f1812", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [eventUrl]);

  function copyLink() {
    navigator.clipboard?.writeText(eventUrl);
  }

  function printQR() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(20,14,8,0.85)] flex items-center justify-center p-6 fadein">
      <div className="bg-[var(--paper)] max-w-lg w-full relative p-8 shadow-2xl">
        {/* tape decoration */}
        <div className="absolute -top-4 left-8 w-20 h-6 bg-[var(--tape)] border-l border-r border-dashed border-[var(--tape-edge)] -rotate-[4deg]" />

        <h2 className="font-['Instrument_Serif'] italic text-3xl mb-1" style={{ color: "var(--ink)" }}>
          {event.name}
        </h2>
        <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--ink-soft)] mb-6">
          {formatDate(event.event_date)} · {event.slug}
        </p>

        {/* QR polaroid */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 pb-14 shadow-[var(--shadow-deep)] -rotate-2 relative">
            {qrDataUrl
              ? <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" style={{ imageRendering: "pixelated" }} />
              : <div className="w-56 h-56 bg-gray-100 animate-pulse" />
            }
            <p className="font-['Caveat'] text-2xl text-center mt-3 -rotate-1" style={{ color: "var(--ink)" }}>
              aponte e entre na festa
            </p>
            <span className="absolute right-2 bottom-3 font-['IBM_Plex_Mono'] text-[9px] tracking-[0.22em] border border-[var(--stamp)] px-2 py-1 rotate-[6deg]" style={{ color: "var(--stamp)", background: "var(--paper)" }}>
              VIP
            </span>
          </div>
        </div>

        {/* meta */}
        <div className="border-t border-b border-dashed border-[rgba(31,24,18,0.2)] py-2 mb-6 text-[12px] text-[var(--ink-soft)]">
          <div className="flex justify-between py-2 border-b border-dashed border-[rgba(31,24,18,0.2)]">
            <span className="text-[10px] tracking-[0.2em] uppercase">Link</span>
            <span className="text-[var(--ink)] text-[10px] break-all max-w-xs text-right">{eventUrl}</span>
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={copyLink} className="border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-[11px] tracking-[0.18em] uppercase px-4 py-3 cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            Copiar link
          </button>
          <button onClick={printQR} className="border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-[11px] tracking-[0.18em] uppercase px-4 py-3 cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            Imprimir QR
          </button>
          <button onClick={onClose} className="ml-auto border border-[var(--stamp)] bg-[var(--stamp)] text-[var(--paper)] text-[11px] tracking-[0.18em] uppercase px-4 py-3 cursor-pointer">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Event Form ─────────────────────────────────────────────
function CreateEventForm({ onCreated }: { onCreated: (e: Event) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleName(v: string) {
    setName(v);
    if (!slug || slug === slugify(name)) setSlug(slugify(v));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, event_date: date || null }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao criar evento.");
    } else {
      onCreated(json.event);
      setName(""); setSlug(""); setDate("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="bg-[var(--paper-2)] border border-[var(--ink)] p-7 relative mb-10">
      {/* tape */}
      <div className="absolute -top-4 left-8 w-20 h-6 bg-[var(--tape)] border-l border-r border-dashed border-[var(--tape-edge)] -rotate-[4deg]" />
      <h2 className="font-['Instrument_Serif'] italic text-3xl mb-1" style={{ color: "var(--ink)" }}>Novo evento</h2>
      <p className="text-[11px] text-[var(--ink-soft)] tracking-wide mb-6 leading-relaxed">
        Preencha os dados. O QR Code é gerado automaticamente com um token único.
      </p>

      <div className="grid gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[0.22em] uppercase text-[var(--ink-soft)]">Nome do evento</label>
          <input
            value={name}
            onChange={e => handleName(e.target.value)}
            placeholder="ex: Vinte e Um do Vitão"
            className="bg-transparent border border-[var(--ink)] px-4 py-3 text-[16px] outline-none focus:border-[var(--stamp)] font-['IBM_Plex_Mono']"
            style={{ color: "var(--ink)" }}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[0.22em] uppercase text-[var(--ink-soft)]">Slug (URL)</label>
          <input
            value={slug}
            onChange={e => setSlug(slugify(e.target.value))}
            placeholder="ex: vitao-21"
            className="bg-transparent border border-[var(--ink)] px-4 py-3 text-[16px] outline-none focus:border-[var(--stamp)] font-['IBM_Plex_Mono']"
            style={{ color: "var(--ink)" }}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[0.22em] uppercase text-[var(--ink-soft)]">Data da festa</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent border border-[var(--ink)] px-4 py-3 text-[16px] outline-none focus:border-[var(--stamp)] font-['IBM_Plex_Mono']"
            style={{ color: "var(--ink)" }}
          />
        </div>
        {error && <p className="text-[12px]" style={{ color: "var(--stamp)" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] text-[12px] tracking-[0.18em] uppercase px-5 py-4 cursor-pointer disabled:opacity-50 w-fit"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {loading ? "Criando..." : "Gerar QR Code"}
        </button>
      </div>
    </form>
  );
}

// ── Events list ───────────────────────────────────────────────────
function EventsList({ events, onShowQR }: { events: Event[]; onShowQR: (e: Event) => void }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--ink-soft)] text-[12px] tracking-wide">
        <p className="font-['Instrument_Serif'] italic text-3xl text-[var(--ink)] mb-2">Nenhum evento ainda.</p>
        Crie o primeiro acima.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] tracking-[0.22em] uppercase text-[var(--ink-soft)] mb-1">Eventos criados</h3>
      {events.map(ev => (
        <div key={ev.id} className="flex items-center justify-between border border-[rgba(31,24,18,0.2)] p-4 bg-[var(--paper)]">
          <div>
            <p className="font-['Instrument_Serif'] italic text-xl" style={{ color: "var(--ink)" }}>{ev.name}</p>
            <p className="text-[11px] text-[var(--ink-soft)] tracking-wide mt-0.5">
              /{ev.slug} · {formatDate(ev.event_date)}
            </p>
          </div>
          <button
            onClick={() => onShowQR(ev)}
            className="border border-[var(--stamp)] text-[var(--stamp)] text-[10px] tracking-[0.18em] uppercase px-4 py-2 cursor-pointer hover:bg-[var(--stamp)] hover:text-[var(--paper)]"
          >
            Ver QR
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────
function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch("/api/admin/events")
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  function handleCreated(ev: Event) {
    setEvents(prev => [ev, ...prev]);
    setSelectedEvent(ev);
  }

  return (
    <div className="min-h-dvh px-6 py-10 max-w-2xl mx-auto">
      {/* header */}
      <div className="flex items-baseline gap-3 mb-6 text-[11px] tracking-[0.18em] uppercase text-[var(--ink-soft)]">
        <span className="flex-1 h-px bg-[var(--ink)] opacity-20" />
        <span>Filme 35MM · Admin</span>
        <span className="flex-1 h-px bg-[var(--ink)] opacity-20" />
      </div>

      <h1 className="font-['Instrument_Serif'] italic text-6xl leading-none mb-10" style={{ color: "var(--ink)" }}>
        <span className="block not-italic font-normal text-[0.62em] tracking-[0.04em] uppercase text-[var(--ink-soft)] mb-1">Painel</span>
        Admin.
      </h1>

      <CreateEventForm onCreated={handleCreated} />
      <EventsList events={events} onShowQR={setSelectedEvent} />

      {selectedEvent && (
        <QRModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if already logged in by hitting a protected endpoint
    fetch("/api/admin/events")
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-[var(--ink-soft)] text-[12px] tracking-wide">
        Carregando...
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onAuthed={() => setAuthed(true)} />;
  }

  return <AdminDashboard />;
}
