'use client';

import { useRef, useState } from 'react';

type Props = {
  kind: 'pdf' | 'image';
  accept: string;
  onFile: (file: File | null) => void;
  /** Nombre de archivo a mostrar como "cargado" (o un texto tipo "Ya existe…"). */
  fileName?: string | null;
  /** URL de previsualización (para logos/imágenes). */
  previewUrl?: string | null;
  hint?: string;
  title?: string;
};

const IconPdf = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-7 h-7">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
    <path d="M14 2v6h6" strokeLinejoin="round" />
    <path d="M9 13h6M9 17h4" strokeLinecap="round" />
  </svg>
);
const IconImage = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-7 h-7">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function FileDropzone({ kind, accept, onFile, fileName, previewUrl, hint, title }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const has = !!(fileName || previewUrl);

  const pick = () => inputRef.current?.click();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {has ? (
        // Estado: archivo cargado
        <div className="flex items-center gap-3 rounded-2xl border border-cta/40 bg-cta/5 p-3">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-12 w-12 rounded-xl border border-border object-contain bg-white shrink-0" />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-cta/15 text-cta-foreground shrink-0">{IconPdf}</span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-600"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="truncate">{fileName || 'Archivo cargado'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Listo. Puedes reemplazarlo o quitarlo.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={pick} className="text-xs font-semibold text-cta-foreground underline">Cambiar</button>
            <button type="button" onClick={() => onFile(null)} className="text-xs font-semibold text-muted-foreground underline">Quitar</button>
          </div>
        </div>
      ) : (
        // Estado: vacío (dropzone)
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`w-full rounded-2xl border-2 border-dashed p-6 text-center transition ${
            drag ? 'border-cta bg-cta/10' : 'border-border bg-muted/20 hover:border-cta/60 hover:bg-cta/5'
          }`}
        >
          <span className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full transition ${drag ? 'bg-cta/20 text-cta-foreground' : 'bg-foreground/5 text-foreground/60'}`}>
            {kind === 'pdf' ? IconPdf : IconImage}
          </span>
          <p className="text-sm font-semibold text-foreground">{title || 'Arrastra el archivo aquí o haz clic para subir'}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </button>
      )}
    </div>
  );
}
