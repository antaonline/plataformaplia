import { Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Resuelve los tokens de imagen que emite la IA a fotos reales y relevantes
 * de Pexels (busqueda por keywords). Cada token recibe una foto DISTINTA.
 *
 * Token que escribe el modelo (en cualquier archivo, normalmente en src=""):
 *   __IMG__(keywords en ingles|width|height)
 * Ej: __IMG__(luxury japanese sofubi vinyl figure|600|800)
 *
 * Sin PEXELS_API_KEY (o si la busqueda falla) cae a loremflickr con un lock
 * unico, para que la web nunca quede con imagenes rotas.
 */
const logger = new Logger('ImageResolver');

const TOKEN_RE = /__IMG__\(\s*([^|()]+?)\s*\|\s*(\d{1,4})\s*\|\s*(\d{1,4})\s*\)/g;

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
 * Reemplaza todos los tokens __IMG__ en el mapa de archivos por URLs reales.
 * Devuelve un NUEVO mapa (no muta el original).
 */
export async function resolveImages(
  files: Record<string, string>,
): Promise<Record<string, string>> {
  const apiKey = process.env.PEXELS_API_KEY || '';

  // 1. Recolectar todas las queries unicas presentes en cualquier archivo.
  const queries = new Set<string>();
  for (const content of Object.values(files)) {
    if (typeof content !== 'string') continue;
    let m: RegExpExecArray | null;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(content)) !== null) {
      queries.add(m[1].trim().toLowerCase());
    }
  }
  if (queries.size === 0) return files;

  // 2. Buscar en Pexels una sola vez por query (si hay API key).
  const photosByQuery = new Map<string, PexelsPhoto[]>();
  if (apiKey) {
    await Promise.all(
      [...queries].map(async (q) => {
        photosByQuery.set(q, await searchPexels(q, apiKey));
      }),
    );
  }

  // 3. Sustituir cada token por una foto DISTINTA (indice incremental por query).
  const cursor = new Map<string, number>();
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
        const q = rawQ.trim().toLowerCase();
        const w = Math.min(parseInt(ws, 10) || 800, 2000);
        const h = Math.min(parseInt(hs, 10) || 600, 2000);
        const photos = photosByQuery.get(q) || [];
        const idx = cursor.get(q) ?? 0;
        cursor.set(q, idx + 1);
        const photo = photos[idx % photos.length || 0];
        const url = photo ? pickSrc(photo, w, h) : '';
        if (url) return url;
        return fallbackUrl(rawQ, w, h, lockSeed++);
      },
    );
  }
  return out;
}
