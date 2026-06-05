/**
 * Onboarding conversacional con IA REAL. En vez de un wizard scripted con
 * respuestas predefinidas, la IA actúa como un consultor de diseño que
 * conversa con el cliente, hace preguntas con criterio según lo que el
 * cliente responde, y cuando tiene suficiente contexto decide construir.
 *
 * El frontend llama a turn() en cada mensaje del usuario. La IA devuelve:
 *   - { done: false, reply: "siguiente pregunta" }  -> seguir conversando
 *   - { done: true, reply: "mensaje de cierre", brief: {...} } -> construir
 *
 * El `brief` es un objeto estructurado que el orquestador convierte en el
 * prompt rico para el codegen (mismo formato [META] que ya usamos).
 */

import { PROVIDERS, FallbackProvider } from './generation/providers';

export interface OnboardingTurnMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface OnboardingBrief {
  projectType: string; // landing | tienda | restaurante | portfolio | corporativa | otro
  businessName: string;
  description: string; // lo que el negocio hace, diferenciadores, ubicación
  complexity: 'simple' | 'modern' | 'clean' | 'premium';
  hasOwnAssets: boolean;
}

export interface OnboardingTurnResult {
  done: boolean;
  reply: string;
  brief?: OnboardingBrief;
}

export interface OnboardingCapabilitiesHint {
  planName: string;
  isPaid: boolean;
  canUsePremium3D: boolean; // tripo3d habilitado
}

// Si Gemini está desactivado (sin créditos), no lo incluimos en la cadena.
const GEMINI_DISABLED =
  String(process.env.DISABLE_GEMINI || '').toLowerCase() === 'true';
const provider = new FallbackProvider(
  GEMINI_DISABLED
    ? [PROVIDERS.claude, PROVIDERS.openai]
    : [PROVIDERS.claude, PROVIDERS.gemini, PROVIDERS.openai],
);

const MODEL =
  process.env.ONBOARDING_MODEL ||
  process.env.ANTHROPIC_MODEL_SONNET ||
  process.env.ANTHROPIC_MODEL ||
  'claude-sonnet-4-6';

/**
 * Construye el system prompt del consultor de onboarding. Le damos
 * personalidad, objetivo claro, y el contrato JSON de salida.
 */
function buildSystem(caps: OnboardingCapabilitiesHint): string {
  const planContext = caps.canUsePremium3D
    ? `El cliente tiene plan ${caps.planName} que INCLUYE estilos premium 3D/cinematográficos. Podés ofrecerlos.`
    : caps.isPaid
      ? `El cliente tiene plan ${caps.planName} (de pago) pero SIN 3D premium. Ofrecé hasta estilo Apple/Stripe, no menciones 3D cinematográfico como disponible para él.`
      : `El cliente tiene plan ${caps.planName} (gratuito). Ofrecé estilos simple y moderno. Si pide algo premium/3D, comentale amablemente que eso está en planes superiores pero seguí adelante con lo que sí puede.`;

  return `Sos el consultor de diseño de PLIA Studio, una plataforma que crea webs profesionales con IA. Tu trabajo es conversar con el cliente de forma NATURAL e INTELIGENTE para entender su negocio antes de construir su web.

PERSONALIDAD:
- Cálido, profesional, conciso. Español neutro (mercado peruano/latam). NADA de "vos/che" argentinos.
- Hablás como un diseñador experto que de verdad se interesa por el negocio del cliente.
- Una pregunta a la vez. Natural, no robótico. Reaccioná a lo que el cliente dice (ej: si dice "pizzería", podés decir "¡Qué rico! ¿Es más estilo trattoria tradicional o pizzería moderna?").

OBJETIVO: en 3 a 5 intercambios, entender:
1. Tipo de negocio / qué hace.
2. Nombre del negocio o marca.
3. Qué lo hace especial / diferenciador / ubicación / público objetivo.
4. Estilo visual que le gusta (inferí del rubro + preguntá si dudás).
5. Si tiene fotos propias o quiere que generes imágenes con IA.

${planContext}

REGLAS:
- NO hagas las 5 preguntas de golpe. Una por turno, encadenadas con criterio.
- Si el cliente ya te dio info en su primer mensaje, NO la vuelvas a preguntar. Avanzá.
- Si el cliente responde algo vago, repreguntá con inteligencia para sacar más.
- Cuando tengas SUFICIENTE para construir algo bueno (no necesitás todo perfecto), cerrá.
- NUNCA inventes datos del negocio. Si no sabés algo, está bien construir con lo que hay.

FORMATO DE SALIDA — CRÍTICO:
Respondé SIEMPRE con un JSON válido (y NADA fuera de él):
{
  "done": false,
  "reply": "tu siguiente mensaje/pregunta al cliente, en tono natural"
}

Cuando decidas que ya tenés suficiente para construir:
{
  "done": true,
  "reply": "mensaje de cierre entusiasta, ej: '¡Perfecto! Tengo todo lo que necesito. Empiezo a construir tu web ahora mismo...'",
  "brief": {
    "projectType": "landing|tienda|restaurante|portfolio|corporativa|otro",
    "businessName": "nombre exacto que dijo el cliente",
    "description": "resumen rico de qué hace, diferenciadores, ubicación, público — todo lo que junte de la conversación",
    "complexity": "simple|modern|clean|premium",
    "hasOwnAssets": true_o_false
  }
}

Elegí "complexity" según lo que percibís del cliente y su rubro:
- simple: negocios que quieren algo directo y rápido.
- modern: la mayoría — moderno con animaciones suaves.
- clean: si el cliente valora elegancia tipo Apple/Stripe (y su plan lo permite).
- premium: solo si el cliente tiene plan con 3D y pidió algo cinematográfico/lujoso.`;
}

/**
 * Procesa un turno de la conversación. Recibe el historial completo
 * (incluyendo el último mensaje del usuario) y devuelve la respuesta de la
 * IA + si ya está lista para construir.
 */
export async function onboardingTurn(
  messages: OnboardingTurnMessage[],
  caps: OnboardingCapabilitiesHint,
): Promise<OnboardingTurnResult> {
  const system = buildSystem(caps);

  // Mapear a formato del provider. Limitamos a últimos 16 turnos por si
  // alguien conversa mucho (raro, pero defensivo).
  const convo = messages.slice(-16).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let raw: string;
  try {
    raw = await provider.complete(system, convo as any, {
      model: MODEL,
      json: true,
      maxTokens: 1200,
      temperature: 0.7,
    });
  } catch (e: any) {
    // Si la IA falla (rate limit, etc.), devolvemos una pregunta genérica
    // para no romper el flujo. El cliente puede reintentar.
    return {
      done: false,
      reply:
        'Disculpá, tuve un problemita técnico. ¿Me contás un poco más sobre tu negocio para seguir?',
    };
  }

  const parsed = parseTurnJson(raw);
  if (!parsed) {
    // Si no parseó, tratamos el texto crudo como una pregunta (degradación).
    return {
      done: false,
      reply:
        (raw || '').trim().slice(0, 500) ||
        '¿Me contás un poco más sobre lo que buscás?',
    };
  }

  // Validar/normalizar el brief si done.
  if (parsed.done) {
    const b = parsed.brief || ({} as any);
    const brief: OnboardingBrief = {
      projectType: normalizeType(b.projectType),
      businessName: String(b.businessName || 'Mi negocio').slice(0, 80),
      description: String(b.description || '').slice(0, 2000),
      complexity: normalizeComplexity(b.complexity, caps),
      hasOwnAssets: !!b.hasOwnAssets,
    };
    return {
      done: true,
      reply: String(parsed.reply || '¡Perfecto! Empiezo a construir tu web…'),
      brief,
    };
  }

  return {
    done: false,
    reply: String(parsed.reply || '¿Me contás un poco más?'),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

function parseTurnJson(raw: string): {
  done: boolean;
  reply: string;
  brief?: any;
} | null {
  if (!raw) return null;
  let t = raw.trim();
  // Quitar cercas de código.
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a === -1 || b === -1 || b <= a) return null;
  try {
    const obj = JSON.parse(t.slice(a, b + 1));
    if (typeof obj !== 'object' || obj === null) return null;
    return {
      done: !!obj.done,
      reply: typeof obj.reply === 'string' ? obj.reply : '',
      brief: obj.brief,
    };
  } catch {
    return null;
  }
}

function normalizeType(t: any): string {
  const v = String(t || '').toLowerCase();
  const valid = ['landing', 'tienda', 'restaurante', 'portfolio', 'corporativa', 'otro'];
  if (valid.includes(v)) return v;
  // Mapeo heurístico de sinónimos.
  if (/tienda|ecommerce|shop|store/.test(v)) return 'tienda';
  if (/restaurant|pizzer|cafe|bar|food/.test(v)) return 'restaurante';
  if (/portfolio|portafolio/.test(v)) return 'portfolio';
  if (/corp|empresa|institu/.test(v)) return 'corporativa';
  if (/landing/.test(v)) return 'landing';
  return 'otro';
}

function normalizeComplexity(
  c: any,
  caps: OnboardingCapabilitiesHint,
): OnboardingBrief['complexity'] {
  let v = String(c || 'modern').toLowerCase() as OnboardingBrief['complexity'];
  if (!['simple', 'modern', 'clean', 'premium'].includes(v)) v = 'modern';
  // Enforce plan: si pide premium pero no tiene 3D, bajar a clean. Si pide
  // clean pero no es pago, bajar a modern.
  if (v === 'premium' && !caps.canUsePremium3D) v = 'clean';
  if (v === 'clean' && !caps.isPaid) v = 'modern';
  return v;
}

/**
 * Convierte un OnboardingBrief en el prompt rico para el codegen (mismo
 * formato [META] que el flujo viejo).
 */
export function briefToRichPrompt(brief: OnboardingBrief): string {
  const typeLabels: Record<string, string> = {
    landing: 'una landing de servicio',
    tienda: 'una tienda online',
    restaurante: 'una web para restaurante/cafetería',
    portfolio: 'un portfolio personal',
    corporativa: 'una web corporativa',
    otro: 'una web',
  };
  const styleLabels: Record<string, string> = {
    simple: 'estilo simple, directo y limpio, sin efectos pesados.',
    modern: 'estilo moderno con microinteracciones y animaciones suaves.',
    clean: 'estilo Apple/Stripe: tipografía cuidada, espacios amplios, animaciones sutiles muy pulidas.',
    premium: 'estilo PREMIUM con elementos 3D, video hero cinematográfico y scroll-triggered animations nivel agencia top.',
  };
  const assetHint = brief.hasOwnAssets
    ? 'El cliente va a subir sus propias fotos. Dejá slots claros para ellas.'
    : 'No tiene fotos propias — generá imágenes profesionales con IA que encajen con el rubro.';

  return [
    `Quiero ${typeLabels[brief.projectType] || 'una web'} para mi negocio.`,
    `Nombre del negocio: ${brief.businessName}`,
    `Descripción: ${brief.description}`,
    ``,
    `Estilo visual: ${styleLabels[brief.complexity]}`,
    assetHint,
    ``,
    `[META]${JSON.stringify({
      projectType: brief.projectType,
      businessName: brief.businessName,
      complexity: brief.complexity,
      hasOwnAssets: brief.hasOwnAssets,
    })}[/META]`,
  ].join('\n');
}
