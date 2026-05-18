'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileCode, Edit3, Trash2, Search, Play, CheckCircle } from 'lucide-react';

interface ToolResultItemProps {
  action: 'Edited' | 'Created' | 'Read' | 'Deleted' | 'Generated' | 'Searched' | 'Executed';
  filePath: string;
  content?: string;
}

export default function ToolResultItem({
  action,
  filePath,
  content,
}: ToolResultItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasContent = Boolean(content);

  const getIcon = () => {
    switch (action) {
      case 'Created': return <FileCode className="h-3 w-3 text-green-500" />;
      case 'Edited': return <Edit3 className="h-3 w-3 text-blue-500" />;
      case 'Deleted': return <Trash2 className="h-3 w-3 text-red-500" />;
      case 'Searched': return <Search className="h-3 w-3 text-slate-500" />;
      case 'Executed': return <Play className="h-3 w-3 text-purple-500" />;
      case 'Generated': return <CheckCircle className="h-3 w-3 text-indigo-500" />;
      default: return <FileCode className="h-3 w-3 text-slate-500" />;
    }
  };

  return (
    <div className="mb-1.5 last:mb-0">
      <div
        onClick={() => hasContent && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-all ${hasContent ? 'cursor-pointer' : ''} group`}
      >
        <div className="flex items-center justify-center w-5 h-5">
           {getIcon()}
        </div>
        
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter w-14">
          {action}
        </span>

        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[140px]">
          {filePath.replace(/^\//, '')}
        </span>

        {hasContent && (
           <ChevronRight className={`h-3 w-3 text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-7 p-2 bg-slate-900 rounded-lg border border-slate-800 shadow-inner">
               <pre className="text-[9px] font-mono text-slate-300 leading-tight whitespace-pre-wrap">
                 {content}
               </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
