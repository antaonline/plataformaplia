/**
 * Scene 3D declarativa — JSON schema que describe una escena 3D scroll-driven
 * sin que el AI (Claude/GPT) tenga que escribir Three.js a mano.
 *
 * Filosofia: que Claude rellene un JSON con la *intencion visual* (que objeto,
 * que material, que animacion al scrollear) y nuestro renderer lo convierte
 * en HTML+Three.js+GSAP listo para servir. Esto evita los errores tipicos
 * cuando un LLM intenta escribir Three.js puro: shaders rotos, materiales
 * que no compilan, llamadas a APIs que no existen en la version cargada.
 *
 * El renderer (scene-3d.renderer.ts) carga Three.js + GSAP + ScrollTrigger
 * via CDN y monta la escena. Soporta:
 *  - GLTF/GLB del cliente (subido a uploads/) o generado por Tripo3D
 *  - Primitivas geometricas (box, sphere, plane, torus, knot) como fallback
 *  - HDR environment maps para iluminacion realista
 *  - Scroll-triggered timelines (camara orbita, objeto rota, luces cambian)
 *  - Post-processing (bloom, vignette) cuando el plan lo permite
 */

// ---------------------------------------------------------------------------
// Tipos base
// ---------------------------------------------------------------------------

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ColorHex {
  /** Color en formato hex (#RRGGBB) */
  hex: string;
}

// ---------------------------------------------------------------------------
// Objetos 3D
// ---------------------------------------------------------------------------

export type Scene3DObject =
  | GltfObject
  | PrimitiveObject
  | Text3DObject;

export interface GltfObject {
  kind: 'gltf';
  /** ID unico dentro de la escena (para targets de animacion). */
  id: string;
  /** URL absoluta del .glb/.gltf. */
  url: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
  /** Si el GLTF trae animaciones, cual reproducir por default. */
  defaultAnimation?: string;
  /** Sombras. */
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface PrimitiveObject {
  kind: 'primitive';
  id: string;
  shape: 'box' | 'sphere' | 'plane' | 'torus' | 'torusKnot' | 'cone' | 'cylinder';
  /** Dimensiones segun shape (box: width/height/depth; sphere: radius; etc). */
  dims?: number[];
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
  material: {
    color: string; // hex
    metalness?: number; // 0..1
    roughness?: number; // 0..1
    emissive?: string; // hex
    emissiveIntensity?: number;
    /** Para vidrio/cristal. */
    transmission?: number; // 0..1
    /** Si el material debe ser shader procedural ("iridescent", "carbon"...). */
    shader?: 'iridescent' | 'carbon' | 'holographic' | 'matte';
  };
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface Text3DObject {
  kind: 'text3d';
  id: string;
  text: string;
  /** Fuente Google Fonts (default: Inter Black). */
  font?: string;
  size?: number;
  depth?: number; // extrude
  position?: Vec3;
  rotation?: Vec3;
  color: string;
  metalness?: number;
  roughness?: number;
}

// ---------------------------------------------------------------------------
// Iluminacion
// ---------------------------------------------------------------------------

export type Scene3DLight =
  | { kind: 'ambient'; color: string; intensity: number }
  | {
      kind: 'directional';
      color: string;
      intensity: number;
      position: Vec3;
      castShadow?: boolean;
    }
  | {
      kind: 'point';
      color: string;
      intensity: number;
      position: Vec3;
      distance?: number;
      decay?: number;
    }
  | {
      kind: 'spot';
      color: string;
      intensity: number;
      position: Vec3;
      target?: Vec3;
      angle?: number;
      penumbra?: number;
    };

// ---------------------------------------------------------------------------
// Camara y entorno
// ---------------------------------------------------------------------------

export interface Scene3DCamera {
  position: Vec3;
  /** Hacia donde mira (default 0,0,0). */
  lookAt?: Vec3;
  /** Field of view en grados (default 50). */
  fov?: number;
}

export interface Scene3DEnvironment {
  /** Color o gradient de fondo del canvas (default transparent). */
  background?: string | 'transparent';
  /** URL de HDR (.hdr/.exr) para iluminacion realista IBL. */
  hdrUrl?: string;
  /** Preset interno si no hay HDR (studio, sunset, night, warehouse). */
  preset?: 'studio' | 'sunset' | 'night' | 'warehouse' | 'dawn' | 'forest';
  /** Niebla (color + densidad). */
  fog?: { color: string; near: number; far: number };
}

// ---------------------------------------------------------------------------
// Scroll-driven timeline
// ---------------------------------------------------------------------------

/**
 * Un "scrollScene" es un tramo del scroll (de startPercent a endPercent) en
 * el que la camara y los objetos transitan a un estado dado. El renderer
 * usa GSAP ScrollTrigger con scrub: true para que sea reversible y suave.
 */
export interface Scene3DScrollScene {
  /** Etiqueta humana (para debugging). */
  label: string;
  /** Selector CSS del trigger en el DOM (ej: "#scene-1"). */
  trigger: string;
  start?: string; // GSAP ScrollTrigger format, ej "top top"
  end?: string;
  /** Cambios al final de este scene. */
  to: {
    camera?: { position?: Vec3; lookAt?: Vec3; fov?: number };
    /** Cambios sobre objetos por id. */
    objects?: Record<
      string,
      {
        position?: Vec3;
        rotation?: Vec3;
        scale?: Vec3 | number;
        opacity?: number;
        /** Override de material (color, emissive). */
        material?: Partial<PrimitiveObject['material']>;
      }
    >;
    /** Cambios sobre luces por indice (0-based). */
    lights?: Record<number, { intensity?: number; color?: string }>;
  };
}

// ---------------------------------------------------------------------------
// Post-processing
// ---------------------------------------------------------------------------

export interface Scene3DPostFX {
  bloom?: { strength: number; radius: number; threshold: number };
  vignette?: { darkness: number };
  /** Solo planes Pro/Studio. */
  filmGrain?: boolean;
  /** Color grading rapido. */
  toneMapping?: 'aces' | 'reinhard' | 'cineon' | 'neutral';
}

// ---------------------------------------------------------------------------
// La escena completa
// ---------------------------------------------------------------------------

export interface Scene3D {
  /** Version del schema (para migraciones futuras). */
  version: 1;
  /** Selector del contenedor donde montar el canvas (default #scene3d). */
  container?: string;
  camera: Scene3DCamera;
  environment?: Scene3DEnvironment;
  lights: Scene3DLight[];
  objects: Scene3DObject[];
  /** Tramos del scroll timeline. Si vacio, escena estatica que solo rota auto. */
  scrollScenes?: Scene3DScrollScene[];
  /** Auto-rotacion del primer objeto cuando no hay scrollScenes. */
  autoRotate?: { objectId: string; speedDegPerSec: number };
  postFX?: Scene3DPostFX;
  /** Rendimiento: limita pixel ratio en mobiles para no quemar bateria. */
  performance?: {
    maxPixelRatio?: number; // default 2
    /** Apagar la escena si el viewport esta fuera (intersection observer). */
    pauseOffScreen?: boolean;
    /** Reducir calidad en mobile (< 768px). */
    mobileQuality?: 'high' | 'medium' | 'low';
  };
}

// ---------------------------------------------------------------------------
// Templates pre-armados
// ---------------------------------------------------------------------------

/**
 * Input del template "Product Showcase" (Adidas Drip-style).
 * Lo que el cliente / Claude tiene que rellenar para instanciar el template.
 */
export interface ProductShowcaseInput {
  /** Nombre del producto / brand (titulo grande del hero). */
  productName: string;
  /** Tagline corto (subtitulo). */
  tagline: string;
  /** Descripcion mas larga para la seccion 2. */
  description: string;
  /** Texto del CTA final. */
  ctaText: string;
  /** URL del CTA (anchor o link externo). */
  ctaHref: string;
  /**
   * Modelo 3D del producto:
   *  - Si hay url GLTF/GLB -> se usa.
   *  - Si no, se genera una primitiva (box/sphere/torusKnot) como placeholder
   *    con material premium (cromado/iridiscente).
   */
  model:
    | { kind: 'gltf'; url: string }
    | {
        kind: 'placeholder';
        shape: 'box' | 'sphere' | 'torusKnot' | 'torus';
        primaryColor: string;
        accentColor?: string;
      };
  /** Paleta del sitio (debe coincidir con el resto del web). */
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
  };
  /** Tipografias Google Fonts. */
  fonts: { heading: string; body: string };
  /** 3-5 features destacados del producto (para chips). */
  features: { icon?: string; label: string }[];
}

/**
 * Metadata publica de un template, para mostrarlo en el catalogo del editor.
 */
export interface Template3DMeta {
  slug: string;
  name: string;
  description: string;
  /** Que planes lo pueden usar. */
  minPlan: 'free' | 'starter' | 'pro' | 'studio';
  /** URL del thumbnail / video preview. */
  previewUrl?: string;
  /** Tags para filtrar (producto, automotor, fashion, tech...). */
  tags: string[];
}
