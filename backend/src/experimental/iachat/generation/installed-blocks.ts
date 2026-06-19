/**
 * Bloques premium 21st YA pre-instalados en el scaffold (src/components/blocks/*).
 * Lee el manifest generado por scripts/install-21st-blocks.js y arma el bloque
 * de prompt que le dice al LLM qué bloques puede importar y usar.
 *
 * Robusto: si el manifest no existe (o está vacío), devuelve '' y el prompt
 * funciona igual que antes.
 */
import * as fs from 'fs';
import { join } from 'path';

interface InstalledBlock {
  block: string;
  type: string;
  desc?: string;
  export: string;
  isDefault: boolean;
  import: string;
}

let cache: string | null = null;

export function installedBlocksPrompt(): string {
  if (cache !== null) return cache;
  try {
    const p = join(process.cwd(), 'design-library-source', '_installed-blocks.json');
    const blocks: InstalledBlock[] = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (!Array.isArray(blocks) || !blocks.length) { cache = ''; return cache; }
    const lines = blocks
      .map((b) => {
        const imp = b.isDefault
          ? `import ${b.export} from "${b.import}"`
          : `import { ${b.export} } from "${b.import}"`;
        return `- ${b.export} (${b.type}): ${b.desc || ''}  →  ${imp}`;
      })
      .join('\n');
    cache = `\n\n<premium_blocks_21st>
BLOQUES PREMIUM 21st YA INSTALADOS en @/components/blocks/* (alta calidad, listos para usar).
Cuando encajen con la sección que vas a construir, IMPÓRTALOS y úsalos (adaptando su contenido/colores al negocio) en vez de reinventar desde cero. Si no encajan, ignóralos.
${lines}
Estos imports YA resuelven (están en el scaffold). No los declares en dependencies.
</premium_blocks_21st>`;
    return cache;
  } catch {
    cache = '';
    return cache;
  }
}
