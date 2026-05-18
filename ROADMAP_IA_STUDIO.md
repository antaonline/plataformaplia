
## 🚀 PLIA AI Studio - Roadmap & Master Instructions

Este documento es la fuente de verdad para el desarrollo del Studio Conversacional de PLIA. El asistente de IA debe consultar este archivo antes de realizar cambios estructurales.

## 🎯 Visión
Construir una plataforma de desarrollo web asistida por IA que permita a emprendedores crear, editar y publicar aplicaciones profesionales (TSX/React) mediante lenguaje natural, superando la experiencia de usuario de plataformas como Lovable.

## 🏗️ Pilares Técnicos (Actualizados)
1. **The Brain (IA)**: Orquestación multi-agente con soporte para corrección de errores en tiempo real y cumplimiento de Design Tokens.
2. **The Canvas (Preview)**: Motor de renderizado modular (Virtual Bundler) con soporte para imports/exports y navegación multi-página.
3. **The Credits (Monetización)**: Sistema de tokens diario/mensual.

## 🎨 ADN Visual & Reglas de Estilo
- **Tipografía**: Sansation (Global).
- **Paleta**: Fondo oscuro profundo (#0A0A0A), acentos Verde Lima (#D9FF00) y Azul Eléctrico para elementos de IA.
- **Componentes**: Uso estricto de Tailwind CSS v3 y animaciones suaves con Framer Motion.
- **Interactividad**: Efectos de "Glow", bordes sutiles y transiciones premium.

## 💎 Lovable-Tier Standards (Nuestra Meta)
Para superar a Lovable, el Studio debe generar un ecosistema de desarrollo completo, no solo archivos TSX:
- **Estructura Pro**: Generar archivos de configuración (`tsconfig.json`, `package.json`, `vite.config.ts`) automáticamente.
- **Entorno de Ejecución**: Soporte para `Bun` o `Vite` en el despliegue para una carga instantánea.
- **Edge Deployment**: Integración con Workers (`wrangler.jsonc`) para latencia cero global.
- **Project Tree Avanzado**: Sidebar con búsqueda de archivos, estados de Git simulados y previsualización de assets (imágenes/fuentes).

## 🛠️ Roadmap de Desarrollo
- [x] Infraestructura Base (Backend NestJS + Prisma).
- [x] Sistema de Créditos y Autenticación.
- [x] Interfaz de Chat Studio (3 columnas).
- [x] Motor de Renderizado Multi-Archivo (Virtual Bundler).
- [x] Modo Inspección Visual (Click-to-Edit).
- [ ] **PRÓXIMO**: Implementar generación automática de archivos de configuración (`package.json`, `vite.config.ts`).
- [ ] **PRÓXIMO**: Integrar búsqueda de archivos y previsualización de imágenes en el Sidebar.
- [ ] **PRÓXIMO**: Pipeline de despliegue a Edge (Cloudflare/Vercel style).

## 📜 Reglas de Oro para la IA
- Siempre verifica el estado de los créditos antes de procesar una petición.
- Extrae el código usando bloques delimitados (```tsx) o el formato [FILES] JSON.
- Si una generación falla por cuota o saturación, informa al usuario y ofrece el botón de reintento.

### 1. El Agent Loop (Orquestación Reali-Time)
- **Planner Agent**: Descompone cada prompt en tareas atómicas.
- **Execution Engine**: No envía todo el código de golpe; emite estados de progreso.
- **Auto-Correction**: Si el código generado tiene errores de sintaxis o runtime, la IA lo detecta y lo arregla.

### 2. Estados Cinematográficos (UX Psicológica)
Implementaremos el `AgentState` para que el chat nunca esté estático:
- `thinking`: Analizando requerimientos...
- `planning`: Diseñando arquitectura de componentes...
- `coding`: Escribiendo lógica de negocio...
- `debugging`: Refinando estilos y responsividad...
- `building`: Compilando vista previa...
- `done`: ¡Listo! Proyecto actualizado.

### 3. Design System AI-Aware (El Cerebro Visual)
- La IA no inventa CSS; usa nuestros **Design Tokens**.
- Aplicar **Layout Recipes**: Si detecta "Landing", aplica Hero + Social Proof + CTA. Si detecta "Dashboard", aplica Sidebar + Stats + Table.

## 📜 Reglas de Oro Actualizadas
- **Dopamina Visual**: Jamás dejar al usuario viendo texto estático. Si la IA está trabajando, el chat debe mostrar una línea de tiempo animada de tareas (Visible Chain-of-Work).
- **Transiciones Suaves**: Todo cambio de estado en el chat debe usar `AnimatePresence`.
- **Optimistic UI**: El chat debe reaccionar instantáneamente a la intención del usuario.

---

## 🔬 Análisis Competitivo (Mayo 2026)
> Basado en el estudio de los repositorios open-source más populares del ecosistema: Claudable, Open-Lovable y Dyad.

### El Descubrimiento Crítico: El Problema del Sandbox en Browser
Nuestro sistema actual intenta compilar TSX/React **dentro del browser** usando Babel Standalone vía CDN. Esto es la causa raíz de todos los problemas de pantalla negra y "Cargando motor...". **Ninguno de los competidores exitosos hace esto.**

| Herramienta | ⭐ Stars | Dónde compilan el código | ¿Pantalla negra? |
|---|---|---|---|
| Open-Lovable (Firecrawl) | 26.3k | Servidor Vercel / E2B Sandbox | ❌ Nunca |
| Claudable (opactorai) | 4k | CLI local + Next.js dev server real | ❌ Nunca |
| Dyad (dyad-sh) | 20.3k | Vite Worker en Electron (local) | ❌ Nunca |
| **PLIA AI Studio (actual)** | — | Babel CDN en el browser (iframe) | ✅ Frecuente |

---

### 📚 Lecciones por Proyecto

#### 🔵 Claudable (github.com/opactorai/Claudable)
- **Modelo**: Orquesta **agentes CLI locales** (Claude Code, Codex, Gemini CLI, Cursor CLI) que generan archivos reales en disco.
- **Preview**: Un servidor Next.js real corriendo localmente con hot-reload, no un iframe con Babel.
- **Deploy**: Integración directa con Vercel con un clic.
- **Base de datos**: SQLite local con Prisma.
- **App de escritorio**: Electron (Mac, Windows, Linux).
- **Multi-agente**: Soporta Claude Code, OpenAI Codex, Cursor CLI, Qwen Code, Z.AI GLM-4.6.
- 🎯 **Lección para PLIA**: El código nunca se compila en el browser. Se ejecuta como servidor real. Esto elimina 100% el problema de pantalla negra. En el futuro, PLIA podría tener un modo "dev server local" para poder preview con servidor real.

#### 🟢 Open-Lovable (github.com/firecrawl/open-lovable)
- **Modelo**: Chat con IA → genera React → ejecuta en sandbox de servidor.
- **Sandbox Providers**: Soporta dos proveedores, **Vercel Sandbox** (por defecto) y **E2B Sandbox** (alternativa cloud con tier gratuito).
- **Fast Apply**: Usa **MorphLLM** para aplicar ediciones de código más rápido y con mayor precisión.
- **Multi-modelo IA**: Soporta Gemini, Claude, OpenAI y Groq de forma intercambiable.
- **Feature estrella**: Puede **clonar y recrear cualquier web existente** como app React (usa Firecrawl para scraping).
- **Estado global**: Usa **Jotai** (atoms) para estado del editor.
- 🎯 **Lecciones para PLIA**:
  - Integrar **E2B Sandbox** eliminaría nuestra pantalla negra de raíz (tiene plan gratuito generoso).
  - La función de **clonar webs existentes** es un diferenciador brutal que podemos implementar con nuestra API de OpenAI + scraping.
  - Implementar soporte para **múltiples proveedores de IA** (no solo OpenAI).

#### 🟣 Dyad (github.com/dyad-sh/dyad)
- **Modelo**: App de escritorio Electron con IA local + cloud.
- **Sandbox**: Usa un `vite.sandbox-worker.config.mts` — un **Vite Worker dedicado** para compilar el código. No usa Babel CDN.
- **TypeScript real**: Tiene `workers/tsc` — un **Web Worker con el compilador TypeScript real (tsc)** que valida el código antes de renderizarlo. Nunca muestra código inválido al usuario.
- **Base de datos**: Drizzle ORM.
- **Modelos soportados**: Ollama (local), OpenAI, Anthropic, Gemini, Qwen, DeepSeek — total privacidad posible.
- **Madurez**: 101 releases, el más activo y maduro de los 3.
- 🎯 **Lecciones para PLIA**:
  - Implementar un **Web Worker con esbuild-wasm** que compile el TSX antes de mostrarlo, igual que Dyad hace con tsc.
  - Validar el código antes de intentar renderizarlo elimina los errores silenciosos.
  - Soporte para modelos alternativos (Ollama, DeepSeek) puede ser un diferenciador de privacidad.

---

## 🛠️ Opciones de Implementación para Resolver la Pantalla Negra

### Opción A: esbuild en el Backend *(Recomendada — Máximo Impacto)*
Crear un endpoint en el backend NestJS que:
1. Reciba el código TSX del frontend.
2. Lo compile con **esbuild** (ultra-rápido, <5ms).
3. Devuelva el bundle JS ya compilado y listo.
4. El frontend solo hace `iframe` con JS pre-compilado — sin dependencias CDN.

```
Frontend → POST /api/sandbox/compile { code: "tsx..." }
Backend NestJS → esbuild.transform(code) → { js: "compiled..." }
Frontend → iframe con srcdoc = JS compilado ✅
```

- ✅ Elimina 100% el problema de pantalla negra
- ✅ No depende de CDNs externos
- ✅ Usa infraestructura que ya tenemos (NestJS)
- ⚠️ Requiere instalar `esbuild` en el backend

### Opción B: E2B Sandbox Cloud *(La más robusta)*
Usar la API de **E2B** (sandbox en la nube) igual que Open-Lovable:
1. Crear un sandbox E2B con Node.js/React preinstalado.
2. Enviar el código generado por la IA.
3. E2B ejecuta `npm run dev` y devuelve una URL preview real.
4. Mostramos esa URL en el iframe.

- ✅ La web generada es 100% funcional con todas las librerías reales
- ✅ Soporta multi-archivo, npm packages, cualquier dependencia
- ✅ Tier gratuito disponible en e2b.dev
- ⚠️ Requiere integración con API de E2B y gestión de sandboxes

### Opción C: esbuild-wasm en Web Worker *(Sin cambios de backend)*
Usar **esbuild-wasm** (WebAssembly) en un Web Worker del frontend:
1. Cargar esbuild compilado a WASM en un Worker (no bloquea la UI).
2. El Worker compila el TSX con esbuild real (no Babel CDN).
3. El resultado JS se inyecta en el iframe via `srcDoc`.

- ✅ Solución puramente frontend, no necesita cambios en el backend
- ✅ No depende de CDNs externos ni de internet
- ✅ Compilación real con soporte completo de TypeScript
- ⚠️ esbuild-wasm pesa ~8MB (se cachea después de la primera carga)

---

## 🗓️ Nuevos Items para el Roadmap

- [ ] **CRÍTICO**: Implementar Opción A (esbuild en backend) para resolver la pantalla negra definitivamente.
- [ ] **ALTO**: Añadir endpoint `/api/sandbox/compile` en el backend NestJS con esbuild.
- [ ] **ALTO**: Implementar soporte para **múltiples modelos de IA** (no solo OpenAI): Claude, Gemini, Groq.
- [ ] **MEDIO**: Integrar **E2B Sandbox** como modo "preview avanzado" para webs multi-archivo.
- [ ] **MEDIO**: Feature de **"Clonar web existente"** — el usuario pega una URL y la IA la recrea como React.
- [ ] **MEDIO**: Implementar **MorphLLM** o similar para aplicar ediciones de código de forma más precisa (Fast Apply).
- [ ] **FUTURO**: Soporte para modelos locales con **Ollama** para usuarios que quieren privacidad total.
- [ ] **FUTURO**: App de escritorio con **Electron** (igual que Claudable y Dyad) para experiencia local completa.
- [ ] **FUTURO**: Integración con **Vercel** para deploy con un clic desde el Studio.

---

## 🏆 Visión a Largo Plazo: Superar a Lovable

Para superar a Lovable y posicionarnos como la herramienta líder en LATAM:

1. **Sandbox Real** (Opción A o B) — Eliminar la pantalla negra es el paso 1 no negociable.
2. **Multi-Modelo IA** — No depender de un solo proveedor reduce costos y aumenta resiliencia.
3. **Clonar Webs** — Feature único y viral que Lovable no tiene de forma gratuita.
4. **Deploy con 1 Clic** — Integración con Vercel/Netlify para que el usuario publique sin salir de PLIA.
5. **Contexto de Marca** — La IA de PLIA debe "conocer" el negocio del usuario para generar webs coherentes con su identidad (colores, tipografías, tono de voz).
6. **Precios en S/.** — Ventaja competitiva directa vs. Lovable (precios en USD) para el mercado peruano y latinoamericano.

