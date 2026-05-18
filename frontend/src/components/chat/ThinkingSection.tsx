'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface ThinkingSectionProps {
  content: string;
  isExpanded?: boolean;
}

export default function ThinkingSection({ 
  content, 
  isExpanded: initialExpanded = false
}: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  // Get first line as title
  const lines = content.split('\n').filter(line => line.trim());
  const firstLine = lines[0] || content.substring(0, 100);
  const restContent = lines.slice(1).join('\n');
  const hasMoreContent = lines.length > 1;
  
  // Parse content for special formatting
  const formatThinkingContent = (text: string) => {
    // Split by double asterisks for emphasis
    const parts = text.split(/\*\*(.*?)\*\*/g);
    
    return parts.map((part, index) => {
      // Odd indices are the emphasized text
      if (index % 2 === 1) {
        return (
          <span key={index} className="font-bold text-slate-700 ">
            {part}
          </span>
        );
      }
      
      // Format regular text with proper line breaks
      return part.split('\n').map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    });
  };

  return (
    <div className="my-3 text-[11px] text-slate-500 bg-slate-50/50 border border-slate-100 rounded-2xl p-3 transition-all hover:bg-slate-50">
      {/* Always visible first line */}
      <div 
        onClick={() => hasMoreContent && setIsExpanded(!isExpanded)}
        className={`flex items-start gap-2 ${hasMoreContent ? 'cursor-pointer' : ''}`}
      >
        <div className="mt-0.5">
           {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3 w-3 text-lime-600" />
                <span className="font-black uppercase tracking-tighter text-[9px] text-slate-400">Pensamiento Crítico</span>
            </div>
            <span className="italic leading-relaxed">
                {formatThinkingContent(firstLine.replace(/^\*\*/, '').replace(/\*\*$/, ''))}
            </span>
        </div>
      </div>
      
      {/* Expanded content - rest of the thinking */}
      {hasMoreContent && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="mt-2 pl-5 italic text-slate-400 leading-relaxed whitespace-pre-wrap border-l-2 border-slate-200">
                {formatThinkingContent(restContent)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
