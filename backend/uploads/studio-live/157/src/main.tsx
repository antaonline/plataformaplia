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
