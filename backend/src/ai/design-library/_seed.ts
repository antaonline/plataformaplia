/**
 * Utilidades de selección con SEMILLA para la Design Library.
 * Permite rotar entre arquetipos compatibles de forma reproducible:
 * mismo `seed` (ej. nombre de marca) → misma elección; distintos seeds →
 * elecciones distintas. Si no hay seed, elige aleatorio (máxima variedad).
 */

/** Hash determinista simple (FNV-1a). */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Elige un elemento del pool: por semilla (reproducible) o aleatorio. */
export function pickFrom<T>(pool: T[], seed?: string): T {
  if (!pool.length) throw new Error('pickFrom: pool vacío');
  const idx = seed != null
    ? hashSeed(seed) % pool.length
    : Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/** Variante con offset: para pedir el "2º" compatible distinto al principal. */
export function pickFromOffset<T>(pool: T[], seed: string, offset: number): T {
  if (!pool.length) throw new Error('pickFromOffset: pool vacío');
  return pool[(hashSeed(seed) + offset) % pool.length];
}
