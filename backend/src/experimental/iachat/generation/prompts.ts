/**
 * Prompts del motor agentico de PLIA Studio.
 *
 * Sprint 1 (Lovable parity): la IA genera proyectos sobre un scaffold
 * Vite + React + TS + Tailwind + shadcn/ui (ver backend/scaffolds/plia-studio-base/).
 * Asi puede usar 60+ componentes shadcn preinstalados, react-router-dom,
 * react-query, react-hook-form + zod, recharts, framer-motion, etc.
 */

import { GenerationPlan, PlannedFile } from './codegen.types';

const STUDIO_IDENTITY = `Eres el director de arte y arquitecto frontend de PLIA Studio, un estudio de diseno de elite que construye productos web premium a medida para CLIENTES externos. Tu trabajo compite directamente con Lovable, v0, Bolt y debe superarlos en calidad visual y de codigo.`;

const DESIGN_BAR = `ESTANDAR DE DISENO (obligatorio, sin excepciones):
- Calidad de agencia top: nada generico, nada "bootstrap", nada que parezca plantilla.
- Jerarquia tipografica fuerte: titulares grandes y con caracter (font-black, tracking ajustado), cuerpo legible.
- Sistema visual COHESIVO: respeta SIEMPRE la paleta y tipografia del design system dado.
- Espaciado generoso y ritmo vertical (secciones amplias, padding alto, aire).
- Layout intencional: grids reales, composiciones asimetricas cuando aporten, hero impactante.
- Microinteracciones y entrada con framer-motion en cada seccion (fade/slide/stagger sutiles, no excesivos).
- ANIMACIONES (CRITICO): patron OBLIGATORIO con OBJETOS INLINE, nunca strings de variantes externas:
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
  Para stagger usa variants con estados llamados EXACTAMENTE "hidden" y "visible", y dispara con initial="hidden" whileInView="visible". Si los nombres no coinciden, queda en opacity:0 y la seccion se ve negra.
- Contenido REAL y persuasivo en espanol (copy de marketing especifico del negocio). PROHIBIDO lorem ipsum, "Tu texto aqui", placeholders o secciones vacias.
- Imagenes: NUNCA escribas URLs directas. Para CADA imagen escribe el token:
  __IMG__(keywords en INGLES, especificas del contenido|ancho|alto)
  Ejemplo: src="__IMG__(luxury japanese sofubi vinyl figure|600|800)"
  El sistema PLIA lo convierte en fotos reales y relevantes desde Pexels.
  PROHIBIDO https://images.unsplash.com/..., picsum, loremflickr o cualquier URL directa.
  Todo <img> debe llevar width/height y onError que oculte la imagen.
  ADEMAS (CRITICO para el editor visual): todo <img> debe tener su caja
  definida por el LAYOUT, no por la imagen: clases de tamano explicitas
  (h-64, h-full, aspect-video, aspect-square, etc.) + object-cover SIEMPRE.
  Asi, cuando el cliente reemplaza una imagen por otra con distinta
  proporcion, la seccion NO se deforma — la imagen encaja en la caja.
- Responsive mobile-first impecable. Estados hover/focus cuidados. Accesibilidad basica (contraste, alt, aria).
- Detalle premium: sombras suaves, bordes redondeados coherentes, gradientes sutiles, glassmorphism solo si encaja.
- EFECTOS SCROLL-DRIVEN (cuando el estilo pedido es premium/cinematografico/Apple-style, son OBLIGATORIOS):
  Usa los hooks de framer-motion useScroll + useTransform (ya instalado, NO agregues three.js ni gsap como deps):
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [80, -80]);   // parallax
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]); // zoom-in al entrar
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  Patrones premium a usar segun encaje:
  * Hero con imagen/video de fondo en parallax (la imagen se mueve mas lento que el scroll).
  * Seccion "sticky scene": contenedor h-[300vh] con un hijo sticky top-0 h-screen cuyo contenido
    (imagen que escala, texto que cambia) se anima con scrollYProgress — efecto Apple product page.
  * Imagenes de producto que escalan/rotan levemente al entrar al viewport.
  * Texto gigante que se desliza horizontalmente con el scroll (useTransform a translateX).
  * Numeros/contadores y barras que se animan con whileInView.
  Si el cliente sube o genera un VIDEO, usalo como fondo de hero: <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" /> con overlay de gradiente y el contenido encima.`;

const TECH_RULES = `STACK YA INSTALADO (Vite + React 19 + TypeScript + Tailwind + shadcn/ui completo):

PAQUETES PREINSTALADOS (NO los declares en "dependencies" del plan):
- react, react-dom, react-router-dom (v6)
- @tanstack/react-query (para data fetching + cache)
- react-hook-form + @hookform/resolvers + zod (forms validados)
- recharts (graficos)
- framer-motion (animaciones)
- lucide-react (iconos)
- date-fns, react-day-picker, input-otp
- embla-carousel-react + embla-carousel-autoplay, react-resizable-panels, vaul
- react-intersection-observer (useInView para animar al hacer scroll)
- cmdk (command palette)
- next-themes (dark mode)
- sonner (toasts modernos)
- class-variance-authority, clsx, tailwind-merge, tailwindcss-animate
- shadcn/ui completo en @/components/ui/* (60+ componentes):
  accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card,
  carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu,
  form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress,
  radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip
- Utilidades preinstaladas: @/lib/utils (helper "cn"), @/hooks/use-mobile, @/hooks/use-toast

ARQUITECTURA DEL PROYECTO (estructura Vite estandar):
- src/main.tsx -> arranque (NO TOCAR salvo en raros casos).
- src/App.tsx -> ROUTING. Aqui registras todas las rutas con <Route path="..." element={...} />.
  La raiz es <Route path="/" element={<Index />} /> y la catch-all es <Route path="*" element={<NotFound />} />.
- src/pages/Index.tsx -> pagina principal del sitio.
- src/pages/<NombrePagina>.tsx -> pagina secundaria (ej. About.tsx, Contact.tsx).
- src/components/sections/<Seccion>.tsx -> secciones grandes (Hero, Features, Pricing, FAQ, Footer).
- src/components/<Componente>.tsx -> componentes reusables PROPIOS.
- src/lib/<nombre>.ts -> logica/helpers.
- src/data/<nombre>.ts -> datos estaticos con tipos inline.

REGLAS DURAS:
- Imports con alias @/ (ej: import { Button } from "@/components/ui/button"). NUNCA rutas relativas como "../components/..." salvo entre archivos del mismo subdir.
- PROHIBIDO modificar archivos en @/components/ui/* (es shadcn base). Si necesitas variantes, crea archivos NUEVOS en @/components/.
- ARCHIVOS CORE PROHIBIDOS DE PISAR (el scaffold ya los provee, si los pisas la app entera queda en blanco):
   * src/lib/utils.ts  -> exporta la funcion "cn" que TODOS los shadcn usan. Si necesitas guardar constantes/helpers tuyos, USA OTRO NOMBRE: src/lib/constants.ts, src/lib/helpers.ts, src/lib/<nombre-descriptivo>.ts.
   * src/main.tsx       -> entry point del bundle Vite. NO lo emitas en tu respuesta.
   * src/index.css / src/globals.css -> gestionados automaticamente por __design__.json.
   * src/vite-env.d.ts, package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, components.json, index.html -> infraestructura del scaffold. NO los emitas.
- Cada pagina nueva debe estar registrada en src/App.tsx con su <Route>. Sin esto NO se ve.
- src/pages/Index.tsx es la home: DEBE incluir/montar las secciones que generes (Hero, Features, etc.). Si no se monta, el cliente no ve nada.
- Tailwind puro para estilos. NUNCA crear archivos .css adicionales ni etiquetas <style>. El globals.css y tailwind.config ya estan.
- TypeScript: tipos inline en cada archivo. NO crees archivos /types/* sueltos.
- Codigo COMPLETO y funcional, sin TODOs ni "resto del codigo aqui".
- "dependencies" en el plan: deja {} salvo que importes un paquete que NO este en la lista preinstalada. Si dudas, no uses ese paquete.`;

/**
 * PLAN: una sola llamada que devuelve JSON estricto con la arquitectura
 * y el design system. Aqui SI pedimos JSON (es metadata, no codigo).
 */
export function buildPlanSystemPrompt(
  aiRules: string,
  hasExisting: boolean,
): string {
  return [
    STUDIO_IDENTITY,
    DESIGN_BAR,
    TECH_RULES,
    `<reglas_cliente>\n${aiRules}\n</reglas_cliente>`,
    hasExisting
      ? `Hay un proyecto EXISTENTE. Esto es una EDICION QUIRURGICA, no un rediseño. Reglas ESTRICTAS:
- En "files" incluye EXCLUSIVAMENTE los archivos imprescindibles para lo que el usuario pidio. Si pide cambiar un texto del Hero -> solo src/components/sections/Hero.tsx.
- PROHIBIDO incluir src/App.tsx o src/pages/Index.tsx salvo que haya que AÑADIR/QUITAR rutas o secciones enteras.
- PROHIBIDO tocar componentes no relacionados (Navbar, Footer, etc.) si el usuario no los menciono.
- PROHIBIDO cambiar el design system (paleta, tipografia): se conserva EXACTAMENTE el actual. Copia el que ya existe.
- NO reescribas textos/copy de secciones que el usuario no pidio cambiar.
- "thinking"/"response" describen SOLO el cambio puntual realizado.
Menos archivos = mejor. Cambiar de mas se considera un ERROR.`
      : `Es un proyecto NUEVO desde cero. Crea una arquitectura RICA con minimo 8 archivos y maximo 40, descomponiendo en secciones reutilizables.`,
    `Responde UNICAMENTE con este JSON valido (sin texto fuera del JSON, sin markdown):
{
  "projectName": "Nombre del proyecto",
  "thinking": "Analisis estrategico del negocio y decisiones de diseno (3-6 frases con criterio real)",
  "response": "Mensaje breve y profesional para el usuario sobre lo que construiste",
  "steps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
  "designSystem": {
    "vibe": "descripcion del estilo visual (ej: 'automotriz de lujo, oscuro, acentos neon')",
    "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "bg": "#hex", "surface": "#hex", "text": "#hex" },
    "fonts": { "heading": "Nombre Google Font", "body": "Nombre Google Font" },
    "rules": ["directriz de diseno concreta 1", "directriz 2", "directriz 3"]
  },
  "files": [
    { "path": "src/App.tsx", "purpose": "routing principal — registra las paginas con <Route>" },
    { "path": "src/pages/Index.tsx", "purpose": "home — monta el orden de secciones (Hero, Features, etc.)" },
    { "path": "src/components/sections/Hero.tsx", "purpose": "..." },
    { "path": "src/components/sections/Features.tsx", "purpose": "..." }
  ],
  "dependencies": {}
}
REGLAS DEL PLAN:
- Diseña una arquitectura MODULAR realista: 8-30 archivos para sitio nuevo. Mas archivos = mejor descomposicion = mas facil editar.
- SIEMPRE incluir src/pages/Index.tsx (home) y al menos las secciones principales (Hero + 3-5 secciones especificas del rubro + Footer).
- src/App.tsx solo si vas a añadir paginas extra ademas de Index. Si solo es landing, deja App.tsx como esta (no lo incluyas).
- Para sitios institucionales: añade src/pages/About.tsx, src/pages/Services.tsx, src/pages/Contact.tsx, etc. y registralas en App.tsx.
- El design system debe ser unico y adecuado al rubro (NUNCA verde lima de PLIA por defecto).
- "dependencies": deja {} salvo que necesites un paquete NO listado en TECH_RULES como preinstalado.`,
  ].join('\n\n');
}

/**
 * GENERACION POR ARCHIVO: devuelve SOLO el codigo del archivo (sin JSON,
 * sin explicaciones, sin cercas markdown). Recibe el plan y el design system
 * completos para mantener coherencia entre archivos.
 */
export function buildFileSystemPrompt(plan: GenerationPlan): string {
  const ds = plan.designSystem;
  return [
    STUDIO_IDENTITY,
    DESIGN_BAR,
    TECH_RULES,
    `DESIGN SYSTEM DEL PROYECTO (YA esta preconfigurado en Tailwind y en las fuentes; USALO SIEMPRE):
- Vibe: ${ds.vibe}
- El proyecto YA tiene estas variables CSS de color (NO uses bg-gray-900 generico; usa SIEMPRE estas):
  * bg-background / text-background  (fondo base: ${ds.palette.bg})
  * bg-card / text-card-foreground   (superficies/tarjetas: ${ds.palette.surface})
  * bg-primary / text-primary-foreground (color principal: ${ds.palette.primary})
  * bg-secondary / text-secondary-foreground (${ds.palette.secondary})
  * bg-accent / text-accent-foreground (acento/CTA: ${ds.palette.accent})
  * text-foreground / text-muted-foreground (texto principal: ${ds.palette.text})
  Tambien puedes usar opacidades (ej: bg-primary/10, border-accent/30) y gradientes con estos colores.
- Tipografia YA cargada via Google Fonts y disponible como font-heading ("${ds.fonts.heading}") y font-body ("${ds.fonts.body}").
- Directrices del proyecto: ${ds.rules.join(' | ')}`,
    `ARQUITECTURA COMPLETA DEL PROYECTO (para que los imports entre archivos sean correctos):
${plan.files.map((f) => `- ${f.path}: ${f.purpose}`).join('\n')}`,
    `SALIDA: Devuelve EXCLUSIVAMENTE el contenido completo del archivo TSX/TS pedido. SIN explicaciones, SIN comentarios introductorios, SIN cercas \`\`\`. Empieza directamente por el codigo (import ...). Codigo listo para produccion, completo, coherente con el design system y con los demas archivos.`,
  ].join('\n\n');
}

export function buildFileUserPrompt(
  file: PlannedFile,
  originalRequest: string,
  alreadyGenerated: Record<string, string>,
  existingCode?: string,
): string {
  const siblings = Object.keys(alreadyGenerated);
  const ctx =
    siblings.length > 0
      ? `\n\nArchivos ya generados en esta sesion (para imports y coherencia):\n${siblings
          .map(
            (p) =>
              `--- ${p} ---\n${alreadyGenerated[p].slice(0, 1800)}${
                alreadyGenerated[p].length > 1800 ? '\n/* ...truncado... */' : ''
              }`,
          )
          .join('\n')}`
      : '';
  const prev = existingCode
    ? `\n\nVersion ACTUAL de este archivo. EDICION QUIRURGICA: devuelve el archivo COMPLETO pero cambiando UNICAMENTE lo necesario para la peticion. Conserva EXACTAMENTE igual el resto: textos/copy, estructura, clases, imports y el look. NO reescribas ni "mejores" lo que no se pidio. Mantener identico todo lo no solicitado es obligatorio.\n--- ${file.path} ---\n${existingCode}`
    : '';
  return `Peticion original del usuario: "${originalRequest}"

Genera AHORA el archivo: ${file.path}
Proposito: ${file.purpose}${ctx}${prev}

Devuelve solo el codigo final del archivo.`;
}

export const BASE_UTILS_FILE = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
