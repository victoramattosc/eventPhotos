"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface Props {
  onSaved: () => void;
  toast: (msg: string) => void;
}

export function CameraScreen({ onSaved, toast }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [flashing, setFlashing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [camError, setCamError] = useState(false);

  function flipCamera() {
    setFacingMode(m => m === "environment" ? "user" : "environment");
  }

  const capture = useCallback(async () => {
    const cam = webcamRef.current;
    if (!cam) return;
    const img = cam.getScreenshot({ width: 1080, height: 1080 });
    if (!img) return;

    // flash
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);

    setPreview(img);
  }, []);

  async function save() {
    if (!preview) return;
    setUploading(true);

    // convert dataURL to blob
    const res = await fetch(preview);
    const blob = await res.blob();
    const form = new FormData();
    form.append("photo", blob, "photo.jpg");

    const r = await fetch("/api/photos", { method: "POST", body: form });
    if (r.ok) {
      toast("Foto salva!");
      onSaved();
    } else {
      toast("Erro ao salvar foto.");
    }
    setUploading(false);
    setPreview(null);
  }

  return (
    <>
      <div className="relative max-w-[520px] mx-auto px-4 pt-2 pb-36">
        <div className="relative bg-[#1a140f] p-4 pb-5 border border-[var(--ink)] shadow-[var(--shadow-deep)] text-[var(--paper)]">
          {/* badge */}
          <div className="absolute -top-px left-4 bg-[var(--stamp)] text-[var(--paper)] font-['IBM_Plex_Mono'] text-[9px] tracking-[0.3em] px-2 py-0.5 -translate-y-1/2">
            FESTA · 21
          </div>

          {/* filmstrip header */}
          <div className="flex justify-between mb-3 font-['IBM_Plex_Mono'] text-[9px] tracking-[0.22em] opacity-75">
            <span>
              <span className="blink inline-block w-1.5 h-1.5 rounded-full bg-[var(--stamp)] mr-1.5 align-middle" />
              REC
            </span>
            <span>ROLO 01</span>
          </div>

          {/* viewfinder */}
          <div className="relative w-full aspect-square bg-black overflow-hidden">
            {camError ? (
              <div className="absolute inset-0 grid place-items-center bg-[#2a1d12] text-[var(--paper)] text-center p-6 font-['IBM_Plex_Mono'] text-[12px] tracking-wide leading-loose">
                <div>
                  Câmera não disponível.
                  <br />
                  <button
                    className="mt-4 border border-[var(--paper)] px-4 py-2 text-[10px] tracking-[0.18em] uppercase"
                    onClick={() => setCamError(false)}
                  >
                    Tentar de novo
                  </button>
                </div>
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                videoConstraints={{ facingMode, aspectRatio: 1 }}
                onUserMediaError={() => setCamError(true)}
                className="w-full h-full object-cover"
              />
            )}

            {/* reticle */}
            <div className="absolute inset-3.5 border border-white/35 pointer-events-none">
              <div className="absolute left-1/2 top-2 bottom-2 w-px bg-white/50 -translate-x-px" />
              <div className="absolute top-1/2 left-2 right-2 h-px bg-white/50 -translate-y-px" />
            </div>
            {/* corners */}
            {[["top-1.5 left-1.5","border-b-0 border-r-0"],["top-1.5 right-1.5","border-b-0 border-l-0"],["bottom-1.5 left-1.5","border-t-0 border-r-0"],["bottom-1.5 right-1.5","border-t-0 border-l-0"]].map(([pos,cl],i) => (
              <div key={i} className={`absolute ${pos} w-4 h-4 border-2 border-white ${cl} pointer-events-none`} />
            ))}

            {/* flash overlay */}
            {flashing && <div className="absolute inset-0 bg-white flash-fire pointer-events-none" />}
          </div>

          {/* controls */}
          <div className="mt-5 grid grid-cols-3 items-center gap-4">
            {/* flip */}
            <button
              onClick={flipCamera}
              className="justify-self-start w-11 h-11 border border-white/40 text-[var(--paper)] grid place-items-center text-lg"
              title="Virar câmera"
            >
              ↺
            </button>

            {/* shutter */}
            <button
              onClick={capture}
              disabled={camError}
              className="justify-self-center w-[78px] h-[78px] rounded-full border-4 border-[var(--paper)] bg-[var(--paper)] relative disabled:opacity-50 cursor-pointer active:scale-95 transition-transform"
              style={{ boxShadow: "0 0 0 2px #1a140f" }}
            >
              <span className="absolute inset-2 rounded-full bg-[var(--stamp)]" />
            </button>

            {/* placeholder right */}
            <div />
          </div>
        </div>
      </div>

      {/* Polaroid developing preview */}
      {preview && (
        <div className="fixed inset-0 z-[200] bg-[rgba(31,24,18,0.7)] grid place-items-center p-7 fadein">
          <div className="bg-[#fbf6e8] p-3.5 pb-14 shadow-[var(--shadow-deep)] w-[min(320px,80vw)] -rotate-3 pola-drop relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full aspect-square object-cover photo-develop"
            />
            <p className="font-['Caveat'] text-[22px] text-center mt-3 -rotate-1" style={{ color: "var(--ink)" }}>
              revelando...
            </p>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 whitespace-nowrap">
              <button
                onClick={() => setPreview(null)}
                className="border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.18em] uppercase px-3 py-2"
              >
                Descartar
              </button>
              <button
                onClick={save}
                disabled={uploading}
                className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.18em] uppercase px-3 py-2 disabled:opacity-50"
              >
                {uploading ? "Salvando..." : "Guardar foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
