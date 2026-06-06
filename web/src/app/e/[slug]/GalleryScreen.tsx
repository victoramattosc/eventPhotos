"use client";

import { useEffect, useState } from "react";

interface PhotoWithUrl {
  id: string;
  storage_path: string;
  created_at: string;
  url: string;
}

function formatTs(iso: string) {
  const d = new Date(iso);
  const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(2);
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} · ${hh}h${mn}`;
}

// ── Lightbox ──────────────────────────────────────────────────────
function Lightbox({
  photo,
  onClose,
  onDelete,
}: {
  photo: PhotoWithUrl;
  onClose: () => void;
  onDelete: () => void;
}) {
  async function download() {
    const res = await fetch(photo.url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `foto-${photo.id.slice(0, 8)}.jpg`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div
      className="fixed inset-0 z-[300] bg-[rgba(20,14,8,0.92)] grid place-items-center p-7 fadein"
      onClick={onClose}
    >
      <div
        className="bg-[#fbf6e8] p-4 pb-14 max-w-[560px] w-full relative shadow-[var(--shadow-deep)]"
        onClick={e => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt="Foto"
          className="w-full max-h-[70vh] object-contain bg-black block"
        />
        <p className="font-['IBM_Plex_Mono'] text-[10px] tracking-[0.2em] uppercase text-[var(--ink-faint)] absolute bottom-4 left-4">
          {formatTs(photo.created_at)}
        </p>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={download}
            className="bg-[var(--paper)] border border-[var(--ink)] text-[var(--ink)] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.22em] uppercase px-3 py-2 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            Baixar
          </button>
          <button
            onClick={onDelete}
            className="bg-[var(--paper)] border border-[var(--stamp)] text-[var(--stamp)] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.22em] uppercase px-3 py-2 hover:bg-[var(--stamp)] hover:text-[var(--paper)]"
          >
            Apagar
          </button>
          <button
            onClick={onClose}
            className="bg-[var(--paper)] border border-[var(--ink)] text-[var(--ink)] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.22em] uppercase px-3 py-2 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Layout: Scattered polaroids ───────────────────────────────────
function ScatteredLayout({ photos, onOpen }: { photos: PhotoWithUrl[]; onOpen: (p: PhotoWithUrl) => void }) {
  const rots = [-6, 3, -2, 5, -4, 2, -7, 4, -1, 6];
  return (
    <div className="flex flex-wrap justify-center">
      {photos.map((p, i) => (
        <div
          key={p.id}
          className="relative inline-block bg-[#fbf6e8] p-3 pb-10 m-3.5 cursor-pointer shadow-[var(--shadow)] hover:scale-[1.04] hover:z-10 transition-transform"
          style={{ transform: `rotate(${rots[i % rots.length]}deg)` }}
          onClick={() => onOpen(p)}
        >
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-[var(--tape)] border-l border-r border-dashed border-[var(--tape-edge)] -rotate-3" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" className="w-44 h-44 object-cover block" />
          <p className="font-['Caveat'] text-base text-center mt-1.5 text-[var(--ink)] truncate w-44">
            {formatTs(p.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Layout: Wall mural ────────────────────────────────────────────
function WallLayout({ photos, onOpen }: { photos: PhotoWithUrl[]; onOpen: (p: PhotoWithUrl) => void }) {
  const variants = ["","tall","wide","","","tall"];
  return (
    <div className="grid gap-3.5 p-4 border border-[rgba(31,24,18,0.15)] bg-[var(--paper-2)]"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gridAutoFlow: "dense" }}>
      {photos.map((p, i) => {
        const v = variants[i % variants.length];
        const style: React.CSSProperties = {};
        if (v === "tall") style.gridRow = "span 2";
        if (v === "wide") style.gridColumn = "span 2";
        return (
          <div
            key={p.id}
            className="relative bg-[#fbf6e8] overflow-hidden cursor-pointer shadow-[var(--shadow)] hover:scale-[1.05] hover:z-10 transition-transform"
            style={style}
            onClick={() => onOpen(p)}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
              style={{ background: "radial-gradient(circle at 30% 30%, #d24e35, #7a2418)", boxShadow: "0 2px 3px rgba(0,0,0,0.4)" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full h-full object-cover block" />
          </div>
        );
      })}
    </div>
  );
}

// ── Layout: Feed ──────────────────────────────────────────────────
function FeedLayout({ photos, onOpen }: { photos: PhotoWithUrl[]; onOpen: (p: PhotoWithUrl) => void }) {
  return (
    <div className="flex flex-col gap-7 items-center py-2">
      {photos.map((p, i) => (
        <div
          key={p.id}
          className="bg-[#fbf6e8] p-4 pb-14 shadow-[var(--shadow)] w-[min(420px,100%)] relative cursor-pointer"
          style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.3}deg)` }}
          onClick={() => onOpen(p)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" className="w-full aspect-square object-cover block" />
          <p className="font-['Caveat'] text-[22px] text-center mt-3 text-[var(--ink)]">
            {formatTs(p.created_at)}
          </p>
          <p className="font-['IBM_Plex_Mono'] text-[9px] tracking-[0.2em] uppercase text-[var(--ink-faint)] absolute bottom-3.5 left-4">
            ROLO 01
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Layout: Mosaic ────────────────────────────────────────────────
function MosaicLayout({ photos, onOpen }: { photos: PhotoWithUrl[]; onOpen: (p: PhotoWithUrl) => void }) {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 gap-2.5">
      {photos.map(p => (
        <div
          key={p.id}
          className="break-inside-avoid mb-2.5 block bg-[#fbf6e8] shadow-[var(--shadow)] overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform"
          onClick={() => onOpen(p)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" className="w-full h-auto block" />
        </div>
      ))}
    </div>
  );
}

type Layout = "scattered" | "wall" | "feed" | "mosaic";

// ── GalleryScreen ─────────────────────────────────────────────────
interface Props {
  refreshKey: number;
  toast: (msg: string) => void;
}

export function GalleryScreen({ refreshKey, toast }: Props) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [layout, setLayout] = useState<Layout>("scattered");
  const [lightbox, setLightbox] = useState<PhotoWithUrl | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/photos")
      .then(r => r.json())
      .then(d => setPhotos(d.photos || []))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleDelete() {
    if (!lightbox) return;
    if (!confirm("Apagar essa foto?")) return;
    const r = await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: lightbox.id }),
    });
    if (r.ok) {
      toast("Foto apagada.");
      setPhotos(prev => prev.filter(p => p.id !== lightbox.id));
      setLightbox(null);
    } else {
      toast("Erro ao apagar.");
    }
  }

  async function downloadAll() {
    for (const p of photos) {
      const res = await fetch(p.url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `foto-${p.id.slice(0, 8)}.jpg`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  const layouts: { key: Layout; label: string }[] = [
    { key: "scattered", label: "Espalhadas" },
    { key: "wall", label: "Mural" },
    { key: "feed", label: "Feed" },
    { key: "mosaic", label: "Mosaico" },
  ];

  return (
    <>
      <div className="max-w-[1080px] mx-auto px-4 pb-36">
        {/* layout switcher */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-b border-[rgba(31,24,18,0.18)] py-2 mb-5 mt-0">
          <span className="font-['IBM_Plex_Mono'] text-[9px] tracking-[0.22em] uppercase text-[var(--ink-faint)] mr-1.5">
            Layout
          </span>
          {layouts.map(l => (
            <button
              key={l.key}
              onClick={() => setLayout(l.key)}
              className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.16em] uppercase px-2.5 py-1.5 border transition-colors ${
                layout === l.key
                  ? "border-[var(--ink)] text-[var(--ink)] bg-[var(--paper)]"
                  : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {l.label}
            </button>
          ))}
          <span className="flex-1" />
          <button
            onClick={downloadAll}
            disabled={photos.length === 0}
            className="font-['IBM_Plex_Mono'] text-[10px] tracking-[0.2em] uppercase px-3 py-2 bg-[var(--ink)] text-[var(--paper)] disabled:opacity-40 hover:bg-[var(--stamp)]"
          >
            Baixar tudo ({photos.length})
          </button>
        </div>

        {/* content */}
        {loading ? (
          <div className="text-center py-20 font-['IBM_Plex_Mono'] text-[12px] tracking-wide text-[var(--ink-soft)]">
            Carregando fotos...
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-['Instrument_Serif'] italic text-3xl text-[var(--ink)] mb-2">Rolo vazio.</p>
            <p className="font-['IBM_Plex_Mono'] text-[12px] text-[var(--ink-soft)] tracking-wide leading-loose">
              Vá pra câmera e tire a primeira foto!
            </p>
          </div>
        ) : layout === "scattered" ? (
          <ScatteredLayout photos={photos} onOpen={setLightbox} />
        ) : layout === "wall" ? (
          <WallLayout photos={photos} onOpen={setLightbox} />
        ) : layout === "feed" ? (
          <FeedLayout photos={photos} onOpen={setLightbox} />
        ) : (
          <MosaicLayout photos={photos} onOpen={setLightbox} />
        )}
      </div>

      {lightbox && (
        <Lightbox photo={lightbox} onClose={() => setLightbox(null)} onDelete={handleDelete} />
      )}
    </>
  );
}
