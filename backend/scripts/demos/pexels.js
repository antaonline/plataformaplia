/**
 * Pexels helper para los DEMOS de plia.pe/ejemplos.
 * Busca fotos reales por query y devuelve URLs (hotlinking directo a Pexels).
 * Robusto ante rate-limit (429): reintenta con backoff, reintenta sin
 * orientación si sale vacío, y NUNCA cachea resultados vacíos (para que un
 * rebuild posterior los resuelva). Cache en _pexels-cache.json.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY = process.env.PEXELS_API_KEY || 'nS2NPvGQsIrdDjMjVLslZb1gy8yo9nHegsB5U7NZeALW6PMmnAh1N8sZ';
const CACHE_PATH = path.join(__dirname, '_pexels-cache.json');
// Respaldo NEUTRAL (fondo abstracto suave) — inofensivo en cualquier rubro.
const NEUTRAL = '7135053';

let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')); } catch { cache = {}; }
// Limpia entradas vacías heredadas (rate-limit previo) para que se reintenten.
let cleaned = false;
for (const k of Object.keys(cache)) { if (!Array.isArray(cache[k]) || cache[k].length === 0) { delete cache[k]; cleaned = true; } }

function saveCache() { fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2)); }
if (cleaned) saveCache();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET a la API. Resuelve {status, json}; nunca rechaza (status lo indica). */
function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { Authorization: KEY } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(d); } catch { /* respuesta no-JSON (error/limit) */ }
        resolve({ status: res.statusCode, json });
      });
    }).on('error', () => resolve({ status: 0, json: null }));
  });
}

async function search(query, orientation, perPage) {
  const o = orientation ? `&orientation=${orientation}` : '';
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}${o}`;
  // Reintentos ante 429 / fallo transitorio.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { status, json } = await get(url);
    if (status === 200 && json) return json.photos || [];
    if (status === 429) { await sleep(1500 * (attempt + 1)); continue; } // rate-limit: backoff
    await sleep(400);
  }
  return null; // no se pudo (lo señala distinto de [])
}

/**
 * Devuelve URLs de fotos para un query (resuelve a la imagen original con compresión).
 * Reintenta sin orientación si la búsqueda con orientación sale vacía.
 */
async function photos(query, count = 4, orientation = 'landscape', width = 1600) {
  const cacheKey = `${query}|${orientation}|${width}`;
  if (Array.isArray(cache[cacheKey]) && cache[cacheKey].length) return cache[cacheKey].slice(0, count);

  const perPage = Math.max(count + 4, 10);
  let pics = await search(query, orientation, perPage);
  if ((!pics || !pics.length) && orientation) pics = await search(query, '', perPage); // sin orientación
  await sleep(300); // cortesía con el rate-limit

  if (pics && pics.length) {
    const urls = pics.map((p) => `${p.src.original}?auto=compress&cs=tinysrgb&w=${width}`);
    cache[cacheKey] = urls; // SOLO cachear resultados reales
    saveCache();
    return urls.slice(0, count);
  }
  return []; // no cachear vacío → se reintenta en el próximo build
}

/** Una sola foto (la mejor para el query); respaldo neutral si no hay. */
async function photo(query, orientation = 'landscape', width = 1600) {
  const arr = await photos(query, 1, orientation, width);
  return arr[0] || `https://images.pexels.com/photos/${NEUTRAL}/pexels-photo-${NEUTRAL}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

module.exports = { photos, photo };
