# PLIA Studio — Reglas para la IA

Este scaffold es un proyecto **Vite + React 19 + TypeScript + Tailwind + shadcn/ui** listo. La IA solo genera archivos dentro de `src/`. La estructura base **NO se toca**.

## Stack disponible (no instalar nada nuevo)

- **react 19**, **react-dom 19**, **react-router-dom 6**
- **tailwindcss** + **tailwindcss-animate** + **tailwind-merge**, **clsx**, **class-variance-authority**
- **lucide-react** (iconos)
- **framer-motion** (animaciones)
- **shadcn/ui completo** en `@/components/ui/*` (60+ componentes Radix-based):
  accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card,
  carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu,
  form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress,
  radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip
- **@tanstack/react-query** (data fetching + cache)
- **react-hook-form** + **@hookform/resolvers** + **zod** (forms validados)
- **recharts** (graficos)
- **embla-carousel-react**, **react-resizable-panels**, **vaul** (carruseles, splits, drawers)
- **date-fns**, **react-day-picker**, **input-otp**
- **next-themes** (dark/light mode)
- **sonner** (toasts)
- **cmdk** (command palette)
- Utilidades: `@/lib/utils` (`cn` helper), `@/hooks/use-mobile`, `@/hooks/use-toast`

## Reglas duras

1. **Imports**: usar siempre el alias `@/...` que apunta a `src/`. Ej: `import { Button } from "@/components/ui/button"`.
2. **NUNCA editar archivos en `src/components/ui/`** (son shadcn/ui base). Si necesitas variantes, crea NUEVOS archivos en `src/components/`.
3. **Paginas** van en `src/pages/<Nombre>.tsx`. La principal es `src/pages/Index.tsx`.
4. **Routing**: SIEMPRE actualizar `src/App.tsx` para registrar las rutas nuevas que crees. Sin esto, las paginas no se ven.
5. **Componentes de seccion** (Hero, Features, Pricing, FAQ, Footer, etc.) van en `src/components/sections/`.
6. **Componentes reusables propios** van en `src/components/` (no en `ui/`).
7. **Lógica/datos** en `src/lib/` o `src/data/`. Tipos TypeScript inline en el archivo donde se usan.
8. **Tailwind puro** para estilos. NO crear archivos CSS adicionales. La paleta se define en `tailwind.config.ts` con CSS variables (background, foreground, primary, etc.).
9. **Imagenes**: usar el token `__IMG__(keywords en ingles|width|height)` como valor del `src`. El sistema PLIA lo resuelve a fotos reales de Pexels.
10. **Animaciones** con framer-motion usando el patron inline:
    ```tsx
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
    ```
    Nunca strings de variantes externas si no se definen en el mismo archivo.
11. **Codigo completo y funcional**: nada de `// TODO` ni `// resto del codigo aqui`.
12. **Contenido REAL en espanol** (copy de marketing del negocio especifico). Sin lorem ipsum.
13. **No declarar dependencias nuevas** salvo casos extraordinarios. Todo lo necesario ya esta en `package.json`.

## Cuando hay un proyecto existente (edicion)

- Solo incluye en `files` los archivos imprescindibles para el cambio pedido.
- NO toques componentes que el cliente no mencione.
- Conserva paleta, fuentes y design system al pie de la letra.
- Si la modificacion no aplica a un archivo, no lo incluyas en el output.
