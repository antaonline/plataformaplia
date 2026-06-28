"use client";

import React, { useEffect, useRef } from 'react';
import { X, RefreshCw, Box, Type as TypeIcon } from 'lucide-react';

/**
 * Panel de capas (árbol del DOM del sitio), estilo Figma/Framer. El bridge
 * reporta una lista plana con `depth` (para indentar) y `kids`. Al hacer click
 * en una capa, se selecciona ese elemento exacto en el lienzo — resuelve la
 * fricción de "no puedo agarrar el contenedor que quiero".
 */

interface Node {
  path: string;
  label: string;
  depth: number;
  kids: number;
}

interface Props {
  tree: Node[];
  selectedPath?: string;
  onSelect: (path: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}

export const LayersPanel: React.FC<Props> = ({ tree, selectedPath, onSelect, onClose, onRefresh }) => {
  const selRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedPath, tree]);

  return (
    <div className="absolute left-4 top-16 z-40 w-64 max-h-[72vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 bg-gradient-to-r from-violet-50 to-white border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">Capas</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            title="Actualizar árbol"
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Cerrar"
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center p-4 leading-relaxed">
            Sin elementos todavía. Tocá actualizar con el preview cargado.
          </p>
        ) : (
          tree.map((n) => {
            const active = n.path === selectedPath;
            return (
              <button
                key={n.path}
                ref={active ? selRef : undefined}
                onClick={() => onSelect(n.path)}
                style={{ paddingLeft: 8 + n.depth * 11 }}
                className={`w-full flex items-center gap-1.5 pr-2 py-1 text-left text-[11.5px] leading-tight ${
                  active
                    ? 'bg-violet-100 text-violet-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {n.kids > 0 ? (
                  <Box className="h-3 w-3 shrink-0 opacity-60" />
                ) : (
                  <TypeIcon className="h-3 w-3 shrink-0 opacity-40" />
                )}
                <span className="truncate">{n.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
