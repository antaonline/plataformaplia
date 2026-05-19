import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as Entry from './AppMain';

const App: React.ComponentType =
  (Entry as any).default ||
  (Entry as any).AppMain ||
  (Entry as any).App ||
  (() => React.createElement('div', { style: { padding: 32, fontFamily: 'sans-serif' } }, 'No se encontro un componente exportado en AppMain.tsx'));

createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null, React.createElement(App)),
);

// Capturador de thumbnail: el Studio (parent) envia { type: 'PLIA_CAPTURE' }
// y respondemos con la imagen del DOM (estilo Dyad). Cross-origin OK.
window.addEventListener('message', async (e: MessageEvent) => {
  if (!e.data || e.data.type !== 'PLIA_CAPTURE') return;
  try {
    const { toPng } = await import('html-to-image');
    const target = (document.getElementById('root') as HTMLElement) || document.body;
    const dataUrl = await toPng(target, {
      cacheBust: true,
      pixelRatio: 0.6,
      backgroundColor:
        getComputedStyle(document.body).backgroundColor || '#0a0a0a',
      filter: (n: any) =>
        !(n && n.tagName === 'IFRAME'),
    });
    window.parent.postMessage({ type: 'PLIA_SHOT', dataUrl }, '*');
  } catch (err) {
    window.parent.postMessage({ type: 'PLIA_SHOT_ERROR' }, '*');
  }
});
