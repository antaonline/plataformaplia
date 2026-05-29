/**
 * PLIA Studio - Analizador de Intención de Edición
 * Adaptado de Open-Lovable (lib/edit-intent-analyzer.ts)
 *
 * Analiza el prompt del usuario para determinar qué tipo de cambio quiere hacer,
 * permitiendo al sistema prompt ser más específico y preciso.
 */

export enum EditType {
  ADD_FEATURE = 'ADD_FEATURE',           // Añadir nueva sección/componente
  UPDATE_COMPONENT = 'UPDATE_COMPONENT', // Modificar elemento existente
  UPDATE_STYLE = 'UPDATE_STYLE',         // Cambiar colores/tipografía/layout
  FIX_ISSUE = 'FIX_ISSUE',             // Corregir un error
  FULL_REBUILD = 'FULL_REBUILD',         // Reconstruir todo desde cero
  ADD_DEPENDENCY = 'ADD_DEPENDENCY',     // Añadir librería
  GENERAL = 'GENERAL',                   // Petición general
}

export interface EditIntent {
  type: EditType;
  confidence: number;          // 0.0 - 1.0
  description: string;         // Descripción legible
  targetSection?: string;      // Sección objetivo (ej: "hero", "footer")
  contextHint: string;         // Hint para el system prompt
}

interface IntentPattern {
  patterns: RegExp[];
  type: EditType;
  contextHint: string;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // --- AÑADIR FEATURE ---
  {
    patterns: [
      /añade?|agrega?|incluye?|pon|crea?|implementa?|necesito\s+(?:un|una)/i,
      /add|create|implement|include|insert/i,
      /nueva?\s+(?:sección|página|componente|funcionalidad|característica)/i,
    ],
    type: EditType.ADD_FEATURE,
    contextHint: 'El usuario quiere añadir un nuevo elemento o funcionalidad. Genera el nuevo componente en src/components/sections/ y actualiza src/pages/Index.tsx (o la pagina relevante) para montarlo. Si es una pagina nueva, registra la ruta en src/App.tsx.',
  },

  // --- ACTUALIZAR ESTILO ---
  {
    patterns: [
      /cambia?\s+(?:el\s+)?(?:color|colores|fondo|tipografía|fuente|estilo|tema)/i,
      /más\s+(?:oscuro|claro|moderno|elegante|colorido|minimalista)/i,
      /quiero\s+(?:un\s+)?(?:diseño|estilo|look)/i,
      /change\s+(?:the\s+)?(?:color|style|theme|font|background)/i,
      /haz(?:lo|la)?\s+(?:más\s+)?(?:oscuro|claro|moderno|bonito|elegante)/i,
    ],
    type: EditType.UPDATE_STYLE,
    contextHint: 'El usuario quiere cambios visuales/estéticos. Actualiza los estilos Tailwind, la paleta de colores o la tipografía según lo pedido.',
  },

  // --- CORREGIR ERROR ---
  {
    patterns: [
      /error|bug|fallo|roto|no\s+funciona|no\s+se\s+ve|pantalla\s+negra/i,
      /arregla?|corrige?|soluciona?|fix|repair|debug/i,
      /está\s+(?:roto|fallando|mal)|no\s+carga/i,
    ],
    type: EditType.FIX_ISSUE,
    contextHint: 'El usuario está reportando un error. Analiza el código actual, identifica el problema y genera la corrección completa.',
  },

  // --- RECONSTRUIR TODO ---
  {
    patterns: [
      /empieza?\s+de\s+(?:nuevo|cero|scratch)/i,
      /rehaz|reconstruye?|rediseña?/i,
      /start\s+over|rebuild|from\s+scratch/i,
      /todo\s+de\s+nuevo|completamente\s+diferente/i,
    ],
    type: EditType.FULL_REBUILD,
    contextHint: 'El usuario quiere un rediseño completo. Genera todos los archivos desde cero con un enfoque completamente nuevo.',
  },

  // --- MODIFICAR COMPONENTE ESPECÍFICO ---
  {
    patterns: [
      /modifica?|actualiza?|cambia?\s+el|edita?|update|modify|change\s+the/i,
      /el\s+(?:hero|header|footer|navbar|menú|sección|botón|título|texto)/i,
      /la\s+(?:sección|barra|imagen|tipografía|letra)/i,
    ],
    type: EditType.UPDATE_COMPONENT,
    contextHint: 'El usuario quiere modificar un elemento específico. Actualiza solo el componente mencionado, dejando el resto intacto.',
  },
];

// Detecta la sección objetivo mencionada en el prompt
function detectTargetSection(prompt: string): string | undefined {
  const sectionKeywords: Record<string, string[]> = {
    'hero': ['hero', 'encabezado principal', 'banner principal', 'portada'],
    'navbar': ['navbar', 'menú', 'navegación', 'header', 'barra de navegación'],
    'footer': ['footer', 'pie de página', 'pie'],
    'services': ['servicios', 'services', 'características', 'features', 'beneficios'],
    'testimonials': ['testimonios', 'reseñas', 'opiniones', 'clientes'],
    'contact': ['contacto', 'formulario', 'contact', 'form'],
    'pricing': ['precios', 'pricing', 'planes', 'tarifas'],
    'about': ['nosotros', 'about', 'equipo', 'empresa'],
    'gallery': ['galería', 'gallery', 'portafolio', 'portfolio'],
    'cta': ['cta', 'call to action', 'llamada a la acción', 'botón principal'],
  };

  const lowerPrompt = prompt.toLowerCase();
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    if (keywords.some(kw => lowerPrompt.includes(kw))) {
      return section;
    }
  }
  return undefined;
}

/**
 * Función principal: analiza la intención del mensaje del usuario.
 * Retorna un EditIntent con el tipo de cambio y un hint para el system prompt.
 */
export function analyzeEditIntent(prompt: string): EditIntent {
  const lowerPrompt = prompt.toLowerCase();
  const targetSection = detectTargetSection(prompt);

  // Buscar coincidencia en patrones
  for (const intentPattern of INTENT_PATTERNS) {
    for (const regex of intentPattern.patterns) {
      if (regex.test(lowerPrompt)) {
        const confidence = calculateConfidence(prompt, intentPattern);
        return {
          type: intentPattern.type,
          confidence,
          description: getDescription(intentPattern.type, targetSection),
          targetSection,
          contextHint: intentPattern.contextHint,
        };
      }
    }
  }

  // Default: petición general
  return {
    type: EditType.GENERAL,
    confidence: 0.5,
    description: 'Petición general de construcción/modificación',
    targetSection,
    contextHint: 'Analiza el requerimiento del usuario y genera el código más apropiado.',
  };
}

function calculateConfidence(prompt: string, pattern: IntentPattern): number {
  let confidence = 0.6; // Base
  // Mayor confianza si el prompt es específico (más palabras)
  if (prompt.split(' ').length > 8) confidence += 0.15;
  // Mayor confianza si hay múltiples patrones que coinciden
  const matchCount = pattern.patterns.filter(r => r.test(prompt)).length;
  if (matchCount > 1) confidence += 0.1;
  return Math.min(confidence, 0.95);
}

function getDescription(type: EditType, targetSection?: string): string {
  const section = targetSection ? ` en sección "${targetSection}"` : '';
  switch (type) {
    case EditType.ADD_FEATURE: return `Añadir nueva funcionalidad${section}`;
    case EditType.UPDATE_STYLE: return `Actualizar estilos visuales${section}`;
    case EditType.FIX_ISSUE: return `Corregir error${section}`;
    case EditType.FULL_REBUILD: return 'Reconstrucción completa del proyecto';
    case EditType.UPDATE_COMPONENT: return `Modificar componente${section}`;
    default: return 'Petición general';
  }
}
