import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Hammer, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamingLoadingAnimation } from '../chat/StreamingLoadingAnimation';

export type AgentState = 'thinking' | 'planning' | 'coding' | 'rendering' | 'done' | 'error';

interface ThinkingEngineProps {
  state: AgentState;
  currentTask?: string;
  completedTasks?: string[];
}

export const ThinkingEngine: React.FC<ThinkingEngineProps> = ({ state, currentTask, completedTasks = [] }) => {
  const getIcon = () => {
    switch (state) {
      case 'thinking': return <Brain className="h-5 w-5 text-purple-500 animate-pulse" />;
      case 'planning': return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'coding': return <Hammer className="h-5 w-5 text-indigo-500 animate-bounce" />;
      case 'rendering': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'done': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Brain className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'thinking': return 'Analizando Requerimientos...';
      case 'planning': return 'Diseñando Plan de Ejecución...';
      case 'coding': return 'Generando Código y Estilos...';
      case 'rendering': return 'Compilando Proyecto...';
      case 'done': return 'Tarea Finalizada';
      case 'error': return 'Error en el Proceso';
      default: return 'Iniciando...';
    }
  };

  const isLivingState = state === 'coding' || state === 'rendering';

  return (
    <div className="mr-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50 overflow-hidden relative">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-inner">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight tracking-wide">
                AI Engine <span className="text-slate-300 font-normal ml-1">v2.0</span>
              </h4>
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
            </div>
            <p className="text-[13px] text-slate-500 font-medium leading-tight mb-4">
              {getStateText()}
            </p>

            <AnimatePresence mode="wait">
              {isLivingState ? (
                <motion.div
                  key="living"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <StreamingLoadingAnimation isVisible={true} text={currentTask} />
                </motion.div>
              ) : (
                <motion.div 
                  key="static"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map((task, idx) => (
                      <motion.div 
                        key={task + idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-[11px] text-slate-400"
                      >
                        <CheckCircle2 className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{task}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {currentTask && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[11px] text-slate-700 font-bold bg-slate-50 p-2 rounded-xl border border-dashed border-slate-200"
                    >
                      <Loader2 className="h-3 w-3 animate-spin text-indigo-500 shrink-0" />
                      <span className="truncate">{currentTask}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

