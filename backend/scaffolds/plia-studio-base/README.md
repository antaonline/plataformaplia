# PLIA Studio Scaffold (plia-studio-base)

Esta carpeta es la **plantilla base** que PLIA Studio (`/experimental/iachatweb`) usa para cada proyecto generado por la IA.

## Stack

- **Vite 7** + **React 19** + **TypeScript**
- **Tailwind CSS** + **tailwindcss-animate**
- **shadcn/ui completo** (~60 componentes) en `src/components/ui/*`
- **React Router** (HashRouter para soportar servir desde subpath)
- **Framer Motion**, **lucide-react** (iconos)
- **@tanstack/react-query**, **react-hook-form** + **zod**, **recharts**

## Setup (UNA sola vez en el servidor)

Cuando despliegas el backend la primera vez, corre:

```bash
cd backend/scaffolds/plia-studio-base
npm install
```

Esto crea `node_modules/` (~500 MB) que será **compartido** por todos los workspaces de proyectos vía symlinks. Cada workspace solo pesa ~1 MB.

## Cómo funciona

Cuando un usuario hace clic en "Publicar" en `iachatweb`:

1. **WorkspaceService.init(chatId)**: crea `backend/workspaces/<chatId>/` clonando los archivos del scaffold + symlink a `node_modules/`.
2. **WorkspaceService.writeFiles(chatId, files)**: vuelca los archivos generados por la IA en `workspaces/<chatId>/src/`.
3. **WorkspaceService.build(chatId)**: corre `npm run build` (Vite). Output a `workspaces/<chatId>/dist/`.
4. **WorkspaceService.deployLocal(chatId)**: copia `dist/*` a `backend/uploads/studio-dist/<chatId>/`. Nest sirve eso como estático.
5. **`previewUrl`**: `https://api.plia.pe/uploads/studio-dist/<chatId>/index.html`.

## Por qué `base: "./"` y HashRouter

- `vite.config.ts` tiene `base: "./"` para que el build emita paths **relativos** (`./assets/...`) en vez de absolutos (`/assets/...`). Así el SPA funciona aunque se sirva desde un subpath como `/uploads/studio-dist/123/`.
- `App.tsx` usa `HashRouter` (aliased a `BrowserRouter` para que la IA siga generando código natural) para que las rutas vivan en el hash y no dependan del path raíz del servidor.

## La IA NO debe modificar

- `package.json`, `tsconfig*.json`, `vite.config.ts`, `tailwind.config.ts`
- Cualquier archivo en `src/components/ui/` (es shadcn base intocable)

`WorkspaceService.writeFiles` solo permite escribir dentro de `src/` y `public/`.

## La IA SÍ puede crear/modificar

- `src/App.tsx` (para registrar rutas nuevas)
- `src/pages/*.tsx`
- `src/components/sections/*.tsx`
- `src/components/<custom>.tsx` (NO sobrescribir nada de `ui/`)
- `src/lib/*.ts`
- `src/data/*.ts`
- `src/hooks/<custom>.ts` (NO sobrescribir `use-toast.ts` o `use-mobile.tsx`)
- `public/*` (imágenes propias del cliente, etc.)
