'use client';

import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Code as CodeIcon,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: Record<string, string>;
  onAskAiAboutFile?: (path: string) => void;
}

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
};

function buildTree(files: Record<string, string>): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '',
    isDir: true,
    children: [],
  };

  const sortedPaths = Object.keys(files).sort();
  for (const fullPath of sortedPaths) {
    const cleaned = fullPath.replace(/^\/+/, '');
    if (!cleaned) continue;
    const parts = cleaned.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');
      let next = current.children.find((c) => c.name === name);
      if (!next) {
        next = {
          name,
          path,
          isDir: !isLast,
          children: [],
        };
        current.children.push(next);
      }
      current = next;
    }
  }

  // Ordenar: dirs primero, luego archivos, alfabético.
  const sortNode = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  };
  sortNode(root);
  return root;
}

function detectLanguage(path: string): string {
  if (/\.(tsx|jsx)$/.test(path)) return 'tsx';
  if (/\.(ts|js)$/.test(path)) return 'ts';
  if (/\.json$/.test(path)) return 'json';
  if (/\.(css|scss|less)$/.test(path)) return 'css';
  if (/\.html?$/.test(path)) return 'html';
  if (/\.md$/.test(path)) return 'md';
  return 'text';
}

function fileIcon(path: string) {
  if (/\.(tsx|jsx|ts|js)$/.test(path)) return FileCode;
  return FileText;
}

interface TreeRowProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  expanded: Set<string>;
  onToggleDir: (path: string) => void;
  onSelectFile: (path: string) => void;
}

function TreeRow({
  node,
  depth,
  selectedPath,
  expanded,
  onToggleDir,
  onSelectFile,
}: TreeRowProps) {
  const isOpen = expanded.has(node.path);
  const Icon = node.isDir ? (isOpen ? FolderOpen : Folder) : fileIcon(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <>
      <button
        type="button"
        onClick={() =>
          node.isDir ? onToggleDir(node.path) : onSelectFile(node.path)
        }
        className={cn(
          'w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] hover:bg-slate-100 transition-colors',
          isSelected && 'bg-indigo-50 text-indigo-700 font-medium',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.isDir ? (
          <ChevronRight
            className={cn(
              'h-3 w-3 text-slate-400 transition-transform shrink-0',
              isOpen && 'rotate-90',
            )}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            node.isDir ? 'text-amber-500' : 'text-slate-400',
          )}
        />
        <span className="truncate">{node.name}</span>
      </button>
      {node.isDir && isOpen && (
        <>
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expanded={expanded}
              onToggleDir={onToggleDir}
              onSelectFile={onSelectFile}
            />
          ))}
        </>
      )}
    </>
  );
}

export default function FileExplorer({
  files,
  onAskAiAboutFile,
}: FileExplorerProps) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Por defecto: expandir src y src/components.
    const e = new Set<string>();
    e.add('src');
    e.add('src/components');
    e.add('src/components/sections');
    e.add('src/pages');
    return e;
  });

  const toggleDir = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const totalFiles = Object.keys(files).length;
  const selectedContent = selectedPath
    ? files[selectedPath] || files[`/${selectedPath}`] || ''
    : '';

  return (
    <div className="w-full h-full flex bg-white rounded-3xl overflow-hidden">
      {/* Sidebar arbol */}
      <aside className="w-64 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="px-3 py-3 border-b border-slate-100 bg-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Archivos
          </p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">
            {totalFiles} archivo{totalFiles === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {tree.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={0}
              selectedPath={selectedPath}
              expanded={expanded}
              onToggleDir={toggleDir}
              onSelectFile={setSelectedPath}
            />
          ))}
        </div>
      </aside>

      {/* Viewer */}
      <section className="flex-1 flex flex-col min-w-0">
        {selectedPath ? (
          <>
            <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <CodeIcon className="h-4 w-4 text-slate-400 shrink-0" />
                <p className="text-xs font-mono text-slate-700 truncate">
                  {selectedPath}
                </p>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {detectLanguage(selectedPath)}
                </span>
              </div>
              {onAskAiAboutFile && (
                <button
                  type="button"
                  onClick={() => onAskAiAboutFile(selectedPath)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Pedir cambio aqui
                </button>
              )}
            </header>
            <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed font-mono bg-slate-950 text-slate-100">
              <code>{selectedContent || '/* archivo vacio */'}</code>
            </pre>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8 bg-slate-950 text-slate-400">
            <div>
              <FileCode className="h-12 w-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm font-medium">
                Selecciona un archivo a la izquierda
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tu proyecto tiene {totalFiles} archivo
                {totalFiles === 1 ? '' : 's'} generado
                {totalFiles === 1 ? '' : 's'} por la IA.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
