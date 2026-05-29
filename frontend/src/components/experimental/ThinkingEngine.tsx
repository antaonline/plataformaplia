"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AgentState = 
  | "thinking" 
  | "planning" 
  | "coding" 
  | "debugging" 
  | "rendering" 
  | "done"
  | "error";

interface ThinkingEngineProps {
  state: AgentState;
  completedTasks: string[];
  currentTask?: string;
}

const ALL_TASKS = {
  thinking: "Analizando requerimientos de usuario...",
  planning: "Diseñando arquitectura de componentes TSX...",
  coding: "Generando lógica de negocio y estilos...",
  debugging: "Refinando responsividad y accesibilidad...",
  rendering: "Compilando vista previa en el Canvas...",
};

export const ThinkingEngine: React.FC<ThinkingEngineProps> = ({ state, completedTasks, currentTask }) => {
  return (
    <div className="space-y-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          {state === 'done' ? (
            <span className="text-blue-500">✓ Ejecución Completada</span>
          ) : state === 'error' ? (
            <span className="text-destructive">✕ Error en la ejecución</span>
          ) : (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-cta" /> Orquestación en curso
            </span>
          )}
        </h4>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {completedTasks.map((task, idx) => (
            <motion.div
              key={task}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-[11px] font-bold text-slate-500"
            >
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span>{task}</span>
            </motion.div>
          ))}
          
          {currentTask && state !== 'done' && state !== 'error' && (
            <motion.div
              key={currentTask}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-[11px] font-black text-slate-900"
            >
              <div className="h-4 w-4 flex items-center justify-center shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-cta animate-ping" />
              </div>
              <span className="italic">{currentTask}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state !== 'done' && state !== 'error' && (
        <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cta"
            initial={{ width: "0%" }}
            animate={{ 
              width: state === 'thinking' ? "20%" : 
                     state === 'planning' ? "40%" : 
                     state === 'coding' ? "70%" : "90%" 
            }}
            transition={{ duration: 1 }}
          />
        </div>
      )}
    </div>
  );
};
