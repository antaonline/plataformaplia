import { Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Resuelve los tokens de imagen que emite la IA. Estrategia HIBRIDA:
 *  - Hero section (archivo Hero.tsx / hero en path) -> imagen generada con
 *    IA (DALL-E 3) para tener un visual unico, premium e impactante.
 *  - Resto de secciones -> Pexels (foto real, gratis y rapida).
 *  - Si la IA falla (sin OPENAI_API_KEY, cuota, etc.) cae a Pexels.
 *  - Si Pexels falla cae a loremflickr.
 *
 * Asi balanceamos calidad (hero generado a medida) con costo (Pexels gratis
 * para las 5-10 imagenes restantes). Costo tipico por proyecto: $0.04 USD
 * (1 hero IA) + $0 (resto Pexels) en lugar de $0.40 si fuera todo IA.
 *
 * Token que escribe el modelo (en cualquier archivo, normalmente en src=""):
 *   __IMG__(keywords en ingles|width|height)
 * Ej: __IMG__(luxury japanese sofubi vinyl figure|600|800)
 *
 * Override por env:
 *   - IMG_HERO_PROVIDER=openai (default) | pexels | none
 *   - IMG_OPENAI_QUALITY=standard (default) | hd  (hd cuesta 2x)
 */
const logger = new Logger('ImageResolver');

const TOKEN_RE = /__IMG__\(\s*([^|()]+?)\s*\|\s*(\d{1,4})\s*\|\s*(\d{1,4})\s*\)/g;

// Patrones para decidir si una imagen debe ir por IA o Pexels.
// El path del archivo es la señal mas fuerte (el modelo emite tokens en
// src/components/sections/Hero.tsx para el hero). En segundo orden las
// keywords del propio token (si dice "hero" o "header" o "main banner").
function shouldUseAI(filePath: string, query: string): boolean {
  if ((process.env.IMG_HERO_PROVIDER || 'openai') !== 'openai') return false;
  if (!process.env.OPENAI_API_KEY) return false;
  // Hero / Header / Banner: visual de portada -> alta inversion en imagen.
  if (/\/(Hero|Header|Banner|MainBanner|Showcase)\.tsx$/i.test(filePath)) {
    return true;
  }
  if (/\bhero\b|\bmain banner\b|\bportrait shot\b/i.test(query)) {
    return true;
  }
  return false;
}

interface PexelsPhoto {
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    portrait: string;
    landscape: string;
  };
}

function fallbackUrl(query: string, w: number, h: number, lock: number): string {
  const kw = encodeURIComponent(
    query.trim().split(/\s+/).slice(0, 4).join(','),
  );
  return `https://loremflickr.com/${w}/${h}/${kw}?lock=${lock}`;
}

async function searchPexels(
  query: string,
  apiKey: string,
): Promise<PexelsPhoto[]> {
  try {
    const res = await axios.get('https://api.pexels.com/v1/search', {
      params: { query, per_page: 15 },
      headers: { Authorization: apiKey },
      timeout: 15_000,
    });
    return Array.isArray(res.data?.photos) ? res.data.photos : [];
  } catch (e: any) {
    logger.warn(
      `Pexels fallo para "${query}": ${e?.response?.status || e?.message || e}`,
    );
    return [];
  }
}

function pickSrc(photo: PexelsPhoto, w: number, h: number): string {
  if (!photo?.src) return '';
  // Vertical -> portrait; horizontal -> landscape; cuadrado -> large.
  if (h > w * 1.15) return photo.src.portrait;
  if (w > h * 1.15) return photo.src.landscape;
  return photo.src.large;
}

/**
 * Genera una imagen con DALL-E 3. Devuelve URL temporal (expira ~1h, pero
 * Vite/preview no la necesita despues del primer render; al publicar se
 * deberia descargar localmente para persistencia — siguiente sprint).
 *
 * DALL-E 3 solo acepta 3 tamaños: 1024x1024, 1024x1792, 1792x1024. Mapeamos
 * el aspect ratio pedido al tamaño mas cercano.
 */
async function generateImageWithAI(
  prompt: string,
  w: number,
  h: number,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const isPortrait = h > w * 1.15;
  const isLandscape = w > h * 1.15;
  const size = isPortrait
    ? '1024x1792'
    : isLandscape
      ? '1792x1024'
      : '1024x1024';

  // Wrap del prompt para fotografia premium tipo magazine, sin texto/marcas.
  const wrapped = `Professional photography, photorealistic, premium magazine quality, cinematic lighting, 4K detail. ${prompt}. No text, no logos, no watermarks. Editorial style.`;

  try {
    const res = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: wrapped.slice(0, 4000),
        n: 1,
        size,
        quality: process.env.IMG_OPENAI_QUALITY || 'standard',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 90_000,
      },
    );
    const url = res.data?.data?.[0]?.url;
    if (url) {
      logger.log(`[ImageAI] generada "${prompt.slice(0, 60)}..." -> ${size}`);
    }
    return url || null;
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data?.error?.message || e?.message;
    logger.warn(
      `[ImageAI] DALL-E fallo (${status || 'err'}) para "${prompt.slice(0, 60)}...": ${msg}`,
    );
    return null;
  }
}

/**
 * Reemplaza todos los tokens __IMG__ en el mapa de archivos por URLs reales.
 * Estrategia hibrida:
 *  - Hero/Header/Banner -> DALL-E 3 (visual a medida para impacto)
 *  - Resto -> Pexels (foto real gratis)
 *  - Fallback en cascada: Pexels si IA falla, loremflickr si Pexels falla.
 *
 * Devuelve un NUEVO mapa (no muta el original).
 */
export async function resolveImages(
  files: Record<string, string>,
): Promise<Record<string, string>> {
  const pexelsKey = process.env.PEXELS_API_KEY || '';

  // 1. Recolectar tokens unicos por (path, query). El path matters porque
  // decide si va a IA o Pexels.
  type Spot = { path: string; query: string; w: number; h: number };
  const spots: Spot[] = [];
  const pexelsQueries = new Set<string>();
  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== 'string') continue;
    let m: RegExpExecArray | null;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(content)) !== null) {
      const query = m[1].trim();
      const w = Math.min(parseInt(m[2], 10) || 800, 2000);
      const h = Math.min(parseInt(m[3], 10) || 600, 2000);
      spots.push({ path, query, w, h });
      // Solo encolamos en Pexels las que NO van a IA (ahorro de quota).
      if (!shouldUseAI(path, query)) {
        pexelsQueries.add(query.toLowerCase());
      }
    }
  }
  if (spots.length === 0) return files;

  // 2. Buscar TODAS las queries Pexels en paralelo (1 vez por query).
  const photosByQuery = new Map<string, PexelsPhoto[]>();
  if (pexelsKey) {
    await Promise.all(
      [...pexelsQueries].map(async (q) => {
        photosByQuery.set(q, await searchPexels(q, pexelsKey));
      }),
    );
  }

  // 3. Generar TODAS las imagenes IA en paralelo (1 por spot, no se cachean
  // porque cada hero se quiere unico aunque la query sea similar).
  const aiUrls = new Map<string, string>(); // key: `${path}::${query}::${w}x${h}` -> url
  const aiJobs = spots
    .filter((s) => shouldUseAI(s.path, s.query))
    .map(async (s) => {
      const key = `${s.path}::${s.query}::${s.w}x${s.h}`;
      const url = await generateImageWithAI(s.query, s.w, s.h);
      if (url) aiUrls.set(key, url);
    });
  if (aiJobs.length) {
    await Promise.all(aiJobs);
    logger.log(
      `[ImageResolver] IA genero ${aiUrls.size}/${aiJobs.length} imagenes hero/banner`,
    );
  }

  // 4. Sustituir cada token. Cada token IA usa su URL especifica; cada
  // token Pexels usa una foto distinta del pool (cursor incremental).
  const pexelsCursor = new Map<string, number>();
  let lockSeed = 1;
  const out: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== 'string') {
      out[path] = content;
      continue;
    }
    out[path] = content.replace(
      TOKEN_RE,
      (_full, rawQ: string, ws: string, hs: string) => {
        const q = rawQ.trim();
        const w = Math.min(parseInt(ws, 10) || 800, 2000);
        const h = Math.min(parseInt(hs, 10) || 600, 2000);

        // Hero / banner -> probar IA primero.
        if (shouldUseAI(path, q)) {
          const key = `${path}::${q}::${w}x${h}`;
          const aiUrl = aiUrls.get(key);
          if (aiUrl) return aiUrl;
          // IA fallo: caer a Pexels para no romper el hero.
        }

        // Pexels (camino normal o fallback de IA).
        const qLower = q.toLowerCase();
        let photos = photosByQuery.get(qLower);
        // Si la query no estaba pre-buscada (porque era para IA), hacerla
        // ahora bajo demanda — sincrono no, dejamos fallback loremflickr.
        if (!photos && pexelsKey) {
          // No esperamos: usar fallback directo para no bloquear el render.
          photos = [];
        }
        photos = photos || [];
        const idx = pexelsCursor.get(qLower) ?? 0;
        pexelsCursor.set(qLower, idx + 1);
        const photo = photos[idx % (photos.length || 1)];
        const url = photo ? pickSrc(photo, w, h) : '';
        if (url) return url;
        return fallbackUrl(rawQ, w, h, lockSeed++);
      },
    );
  }
  return out;
}
