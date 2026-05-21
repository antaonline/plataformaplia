/**
 * Tipos del motor de generacion agentico de PLIA Studio.
 * Reemplaza la generacion one-shot JSON por un pipeline multi-paso
 * (plan -> generacion archivo por archivo) provider-agnostico.
 */

export type UserTier = 'free' | 'paid';

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export interface DesignSystem {
  vibe: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
  };
  fonts: { heading: string; body: string };
  rules: string[];
}

export interface PlannedFile {
  path: string;
  purpose: string;
}

export interface GenerationPlan {
  projectName: string;
  thinking: string;
  response: string;
  steps: string[];
  designSystem: DesignSystem;
  files: PlannedFile[];
  dependencies: Record<string, string>;
}

export interface GeneratedProject {
  meta: {
    thinking: string;
    conceptName: string;
    steps: string[];
    chatMode: string;
    [key: string]: any;
  };
  response: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
}

export interface CompleteOptions {
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  /** Modelo a usar en esta llamada (override del default del proveedor). */
  model?: string;
  /** Imagenes (data URL o http URL) para entrada multimodal (solo Claude). */
  images?: string[];
  /** Callback con el costo USD real de la llamada (para medir creditos). */
  onUsage?: (costUsd: number) => void;
}

/**
 * Contrato unico que implementa cada proveedor (Gemini, Claude, OpenAI).
 * `complete` recibe un system prompt + historial y devuelve texto crudo.
 */
export interface CodegenProvider {
  readonly id: string;
  isAvailable(): boolean;
  complete(
    system: string,
    messages: ChatMsg[],
    opts?: CompleteOptions,
  ): Promise<string>;
}
