/**
 * Template 3D "Product Showcase" — inspirado en Adidas Drip, Foot Locker
 * Hot Streets, y los webs producto de Apple. Una landing scroll-driven con
 * un modelo 3D que cambia de posicion / iluminacion / escala mientras el
 * cliente hace scroll.
 *
 * Estructura visual:
 *   Section 1 (hero):    producto centrado, rota lento, titulo huge al lado
 *   Section 2 (detail):  camara hace zoom-in al detalle del producto
 *   Section 3 (features): producto rota 360 + chips de features alrededor
 *   Section 4 (cta):     producto en miniatura + boton CTA full-width
 *
 * Implementacion:
 *  - HTML semantico con 4 <section min-h-screen>, cada una con id distinto
 *    para los triggers del scroll.
 *  - <canvas id="scene3d"> position:fixed cubriendo todo el viewport,
 *    siempre visible. El contenido HTML va position:relative encima.
 *  - GSAP ScrollTrigger conecta cada section a un keyframe de la Scene3D.
 */

import type {
  ProductShowcaseInput,
  Scene3D,
  PrimitiveObject,
  GltfObject,
} from './scene-3d.types';
import { injectScene3DIntoHtml } from './scene-3d.renderer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Construye la Scene3D segun el input
// ---------------------------------------------------------------------------

function buildScene(input: ProductShowcaseInput): Scene3D {
  // Decidir el objeto principal segun model.kind.
  const productObject: GltfObject | PrimitiveObject =
    input.model.kind === 'gltf'
      ? {
          kind: 'gltf',
          id: 'product',
          url: input.model.url,
          position: { x: 0, y: 0, z: 0 },
          scale: 1.4,
          castShadow: true,
          receiveShadow: false,
        }
      : {
          kind: 'primitive',
          id: 'product',
          shape: input.model.shape,
          dims:
            input.model.shape === 'box'
              ? [1.4, 1.4, 1.4]
              : input.model.shape === 'sphere'
              ? [0.9]
              : input.model.shape === 'torus'
              ? [0.7, 0.25]
              : [0.6, 0.2], // torusKnot
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0.15, y: 0, z: 0 },
          material: {
            color: input.model.primaryColor,
            metalness: 0.9,
            roughness: 0.18,
            emissive: input.model.accentColor || input.palette.accent,
            emissiveIntensity: 0.15,
            shader: 'iridescent',
          },
          castShadow: true,
        };

  // Plano del piso para recibir sombras y dar sensacion de espacio.
  const ground: PrimitiveObject = {
    kind: 'primitive',
    id: 'ground',
    shape: 'plane',
    dims: [40, 40],
    position: { x: 0, y: -1.6, z: 0 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    material: {
      color: input.palette.bg,
      metalness: 0,
      roughness: 0.85,
    },
    receiveShadow: true,
  };

  const scene: Scene3D = {
    version: 1,
    container: '#scene3d',
    camera: {
      position: { x: 0, y: 1.2, z: 4.5 },
      lookAt: { x: 0, y: 0, z: 0 },
      fov: 38,
    },
    environment: {
      background: 'transparent', // el HTML pone su propio fondo gradient
      preset: 'studio',
    },
    lights: [
      { kind: 'ambient', color: '#ffffff', intensity: 0.35 },
      {
        kind: 'directional',
        color: '#ffffff',
        intensity: 1.4,
        position: { x: 3, y: 5, z: 4 },
        castShadow: true,
      },
      {
        kind: 'point',
        color: input.palette.accent,
        intensity: 12,
        position: { x: -3, y: 1.5, z: 2 },
        distance: 12,
        decay: 2,
      },
      {
        kind: 'point',
        color: input.palette.primary,
        intensity: 8,
        position: { x: 3, y: -0.5, z: 2 },
        distance: 10,
        decay: 2,
      },
    ],
    objects: [productObject, ground],
    scrollScenes: [
      // Section 2: zoom-in
      {
        label: 'detail-zoom',
        trigger: '#scene-detail',
        start: 'top bottom',
        end: 'bottom top',
        to: {
          camera: {
            position: { x: 1.2, y: 0.4, z: 2.6 },
            lookAt: { x: 0, y: 0, z: 0 },
          },
          objects: {
            product: {
              rotation: { x: 0.2, y: Math.PI * 0.5, z: 0 },
            },
          },
        },
      },
      // Section 3: rotacion 360
      {
        label: 'features-spin',
        trigger: '#scene-features',
        start: 'top bottom',
        end: 'bottom top',
        to: {
          camera: {
            position: { x: 0, y: 1.0, z: 4.0 },
          },
          objects: {
            product: {
              rotation: { x: 0.1, y: Math.PI * 2.5, z: 0 },
            },
          },
          lights: {
            2: { intensity: 18, color: input.palette.accent },
            3: { intensity: 12, color: input.palette.primary },
          },
        },
      },
      // Section 4: producto se reduce y se mueve a la derecha
      {
        label: 'cta-shrink',
        trigger: '#scene-cta',
        start: 'top bottom',
        end: 'bottom top',
        to: {
          camera: {
            position: { x: 0, y: 1.2, z: 5.5 },
          },
          objects: {
            product: {
              position: { x: 1.6, y: 0, z: 0 },
              scale: 0.7,
              rotation: { x: 0.1, y: Math.PI * 3, z: 0 },
            },
          },
        },
      },
    ],
    autoRotate: { objectId: 'product', speedDegPerSec: 10 },
    postFX: {
      bloom: { strength: 0.4, radius: 0.6, threshold: 0.85 },
      toneMapping: 'aces',
    },
    performance: {
      maxPixelRatio: 2,
      pauseOffScreen: true,
      mobileQuality: 'medium',
    },
  };

  return scene;
}

// ---------------------------------------------------------------------------
// Construye el HTML del template
// ---------------------------------------------------------------------------

function buildHtml(input: ProductShowcaseInput, scene: Scene3D): string {
  const featureChips = (input.features || [])
    .slice(0, 6)
    .map(
      (f) =>
        `<span class="chip">${f.icon ? `<span class="chip-icon">${esc(f.icon)}</span>` : ''}<span>${esc(f.label)}</span></span>`,
    )
    .join('\n          ');

  const headingFont = input.fonts.heading || 'Inter';
  const bodyFont = input.fonts.body || 'Inter';
  const fontsParam = encodeURIComponent(`${headingFont}:wght@400;700;900`) +
    (bodyFont !== headingFont
      ? '&family=' + encodeURIComponent(`${bodyFont}:wght@300;400;600`)
      : '');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(input.productName)} — ${esc(input.tagline)}</title>
  <meta name="description" content="${esc(input.description.slice(0, 160))}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${fontsParam}&display=swap" rel="stylesheet" />
  <style>
    :root {
      --primary: ${input.palette.primary};
      --secondary: ${input.palette.secondary};
      --accent: ${input.palette.accent};
      --bg: ${input.palette.bg};
      --text: ${input.palette.text};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { scroll-behavior: smooth; }
    body {
      font-family: '${bodyFont}', sans-serif;
      color: var(--text);
      background:
        radial-gradient(ellipse at top left, ${input.palette.accent}22 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, ${input.palette.primary}33 0%, transparent 55%),
        var(--bg);
      overflow-x: hidden;
    }
    h1, h2, h3 {
      font-family: '${headingFont}', sans-serif;
      font-weight: 900;
      letter-spacing: -0.02em;
      line-height: 0.95;
    }
    #scene3d {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
    }
    main {
      position: relative;
      z-index: 1;
    }
    section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: clamp(40px, 8vw, 120px);
      position: relative;
    }
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px clamp(20px, 4vw, 60px);
      backdrop-filter: blur(12px);
      background: ${input.palette.bg}cc;
      border-bottom: 1px solid ${input.palette.text}11;
    }
    .nav-brand {
      font-family: '${headingFont}', sans-serif;
      font-weight: 900;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text);
    }
    .nav-cta {
      padding: 10px 20px;
      background: var(--text);
      color: var(--bg);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-radius: 999px;
      transition: transform 0.2s, background 0.2s;
    }
    .nav-cta:hover { transform: translateY(-2px); background: var(--accent); color: var(--text); }

    /* HERO */
    #scene-hero { padding-top: 120px; }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      align-items: center;
    }
    .hero-text { max-width: 560px; }
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent);
      padding: 8px 16px;
      border: 1px solid var(--accent);
      border-radius: 999px;
      margin-bottom: 24px;
    }
    .hero-eyebrow::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.4); }
    }
    .hero-title {
      font-size: clamp(3rem, 8vw, 7rem);
      margin-bottom: 24px;
      background: linear-gradient(135deg, var(--text) 0%, var(--primary) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: clamp(1rem, 1.5vw, 1.25rem);
      line-height: 1.6;
      opacity: 0.75;
      margin-bottom: 36px;
    }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn-primary, .btn-secondary {
      padding: 16px 32px;
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-decoration: none;
      border-radius: 999px;
      transition: transform 0.2s, box-shadow 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .btn-primary {
      background: var(--text);
      color: var(--bg);
      box-shadow: 0 8px 24px ${input.palette.text}33;
    }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 32px ${input.palette.accent}66; }
    .btn-secondary {
      border: 2px solid var(--text);
      color: var(--text);
    }
    .btn-secondary:hover { background: var(--text); color: var(--bg); }

    /* DETAIL */
    #scene-detail {
      grid-template-columns: 1fr;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
    }
    .detail-text {
      max-width: 480px;
      padding: 40px;
      background: ${input.palette.bg}f2;
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid ${input.palette.text}11;
      box-shadow: 0 24px 80px ${input.palette.text}22;
    }
    .section-eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--primary);
      margin-bottom: 16px;
      display: block;
    }
    .detail-title {
      font-size: clamp(2rem, 4vw, 3.5rem);
      margin-bottom: 20px;
    }
    .detail-body {
      font-size: 1.05rem;
      line-height: 1.7;
      opacity: 0.78;
    }

    /* FEATURES */
    #scene-features {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .features-title {
      font-size: clamp(2.5rem, 5vw, 5rem);
      margin-bottom: 60px;
      max-width: 800px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      max-width: 900px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 22px;
      background: ${input.palette.text}0a;
      backdrop-filter: blur(8px);
      border: 1px solid ${input.palette.text}22;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.95rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .chip:hover { transform: translateY(-3px); border-color: var(--accent); }
    .chip-icon { font-size: 1.2rem; }

    /* CTA */
    #scene-cta {
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      max-width: 800px;
    }
    .cta-title {
      font-size: clamp(3rem, 7vw, 6rem);
      margin-bottom: 30px;
    }
    .cta-sub {
      font-size: 1.25rem;
      opacity: 0.75;
      margin-bottom: 40px;
      max-width: 560px;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .hero-grid { grid-template-columns: 1fr; gap: 30px; }
      #scene-detail { align-items: center; }
      #scene-cta { align-items: center; text-align: center; }
      .detail-text { padding: 28px; }
    }
  </style>
</head>
<body>
  <canvas id="scene3d"></canvas>

  <nav class="nav">
    <span class="nav-brand">${esc(input.productName)}</span>
    <a class="nav-cta" href="${esc(input.ctaHref)}">${esc(input.ctaText)}</a>
  </nav>

  <main>
    <section id="scene-hero">
      <div class="hero-grid">
        <div class="hero-text">
          <span class="hero-eyebrow">NUEVO LANZAMIENTO</span>
          <h1 class="hero-title">${esc(input.productName)}</h1>
          <p class="hero-sub">${esc(input.tagline)}</p>
          <div class="hero-actions">
            <a class="btn-primary" href="${esc(input.ctaHref)}">${esc(input.ctaText)} →</a>
            <a class="btn-secondary" href="#scene-detail">Conoce mas</a>
          </div>
        </div>
        <div></div>
      </div>
    </section>

    <section id="scene-detail">
      <div class="detail-text">
        <span class="section-eyebrow">EL DETALLE IMPORTA</span>
        <h2 class="detail-title">Disenado para destacar</h2>
        <p class="detail-body">${esc(input.description)}</p>
      </div>
    </section>

    <section id="scene-features">
      <h2 class="features-title">Lo que lo hace unico</h2>
      <div class="chips">
          ${featureChips}
      </div>
    </section>

    <section id="scene-cta">
      <span class="section-eyebrow">LISTO PARA COMENZAR</span>
      <h2 class="cta-title">Tu turno.</h2>
      <p class="cta-sub">No esperes mas. ${esc(input.productName)} esta esperandote.</p>
      <a class="btn-primary" href="${esc(input.ctaHref)}">${esc(input.ctaText)} →</a>
    </section>
  </main>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Entry point del template
// ---------------------------------------------------------------------------

export function renderProductShowcase(input: ProductShowcaseInput): string {
  const scene = buildScene(input);
  const html = buildHtml(input, scene);
  return injectScene3DIntoHtml(html, scene);
}

// Metadata para el catalogo de templates.
export const productShowcaseMeta = {
  slug: 'product-showcase',
  name: 'Product Showcase 3D',
  description:
    'Landing scroll-driven con producto 3D rotando. Inspirado en Adidas Drip y Apple. Camara hace zoom y rota mientras el cliente scrollea.',
  minPlan: 'pro' as const,
  tags: ['producto', '3d', 'scroll', 'premium', 'fashion', 'tech'],
};
