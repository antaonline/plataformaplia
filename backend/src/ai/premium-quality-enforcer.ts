/**
 * Post-procesa HTML generado por Claude para forzar que los sitios de los
 * planes LANDING/WEB cumplan el estandar de calidad PREMIUM (S/390+).
 *
 * Resuelve problemas concretos detectados en produccion (mipernito.plia.pe,
 * jun 2026):
 *  1. JSX literal: Claude a veces escribe `{[...].map(...)}` en el DOM como
 *     texto plano. Se elimina y se preserva el script de rendering si lo hay.
 *  2. Fallback `mailto:`: si quedo un `window.location.href = mailtoLink` o
 *     un `<a href="mailto:">` como CTA principal, se reemplaza por el
 *     endpoint correcto.
 *  3. Sin GSAP / ScrollTrigger / AOS: si el sitio no carga librerias de
 *     scroll-reveal/parallax, las inyectamos via CDN al final del body para
 *     que las animaciones funcionen aun cuando Claude las olvido.
 *  4. Google Maps con Place ID inventado: si el embed tiene un Place ID que
 *     no existe (`0x...%3A0x0`), lo reemplazamos por el formato `q=` que es
 *     keyless y siempre funciona si tenemos la direccion.
 *
 * Idempotente: ejecutarlo dos veces sobre el mismo HTML produce el mismo
 * resultado (no duplica scripts ni libs).
 */

const GSAP_BUNDLE_SCRIPT = `<script data-plia-premium-libs>
// Cargar GSAP + ScrollTrigger si no estan presentes (idempotente).
(function(){
  if (window.gsap) return;
  var loadScript = function(src){
    return new Promise(function(resolve){
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = resolve;
      document.head.appendChild(s);
    });
  };
  Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
  ]).then(function(){
    return loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
  }).then(function(){
    if (!window.gsap || !window.gsap.registerPlugin) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    // Reveal-on-scroll SOLO para elementos que OPTARON explicitamente con
    // [data-reveal]. NO aplicamos opacity:0 masivo a "section > *" porque si
    // el trigger no dispara (elementos sobre el fold, layout shift) las
    // secciones quedan invisibles y superpuestas. La animacion principal del
    // sitio es la clase .reveal con IntersectionObserver (segura, con fallback).
    document.querySelectorAll('[data-reveal]:not([data-no-reveal])').forEach(function(el, i){
      if (el.dataset.pliaRevealed) return;
      el.dataset.pliaRevealed = '1';
      window.gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        delay: (i % 6) * 0.04,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
    // Parallax leve para imagenes con [data-parallax].
    document.querySelectorAll('[data-parallax]').forEach(function(el){
      window.gsap.to(el, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    // Counters animados para [data-counter]
    document.querySelectorAll('[data-counter]').forEach(function(el){
      var target = parseFloat(el.dataset.counter || el.textContent || '0');
      var obj = { val: 0 };
      window.gsap.to(obj, {
        val: target, duration: 2, ease: 'power1.out',
        onUpdate: function(){ el.textContent = Math.round(obj.val).toLocaleString('es-PE'); },
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
  });
})();
</script>`;

/**
 * Elimina codigo JSX literal que se haya colado en el HTML como texto plano.
 * Patrones tipicos:
 *   {["A", "B"].map(item => `<span>${item}</span>`).join('')}
 *   {items.map(x => `...`)}
 * Si va seguido de un <script> que hace innerHTML del mismo contenedor, ese
 * script se preserva — el script hace el render real.
 */
function stripJsxLiterals(html: string): string {
  // Patrones de bloques de codigo JSX que se renderizan como texto.
  // Buscamos `{[` o `{algo.map(` que estan en posicion de contenido HTML
  // (entre tags). Conservador: solo eliminamos si parece JSX inequivoco.
  let out = html;

  // Caso 1: {[...].map(...).join('')} con backticks adentro.
  out = out.replace(
    /\{\s*\[[^\[\]]{0,2000}\]\s*\.map\s*\([^)]{0,400}=>\s*`[\s\S]*?`\s*\)\s*\.join\([^)]*\)\s*\}/g,
    '',
  );

  // Caso 2: {items.map(...)} estilo JSX puro.
  out = out.replace(
    /\{\s*[a-zA-Z_]\w*\s*\.map\s*\([^)]{0,400}=>\s*[`(][\s\S]*?[`)]\s*\)\s*\}/g,
    '',
  );

  // Caso 3: bloque `${...}` huerfano fuera de un template literal (cuando
  // Claude confunde JS con HTML).
  out = out.replace(/(^|\s)\$\{[a-zA-Z_]\w*\}(?=\s|<)/g, '$1');

  return out;
}

/**
 * Reemplaza los handlers de form que usan `mailto:` como fallback por una
 * version que envia POST al endpoint propio. Solo actua si encuentra el
 * patron `window.location.href = mailtoLink` o similares — el resto del
 * handler se preserva.
 */
function neutralizeMailtoFallback(html: string, formEndpoint?: string): string {
  if (!formEndpoint) return html;
  let out = html;

  // 1. Reemplazar la asignacion `window.location.href = mailtoLink` (o
  //    una variante con literal `mailto:...`) por un fetch al endpoint
  //    propio. Conservamos el resto del handler.
  //  a) variable simple terminada en "mailtoLink" / "mailtoUrl" / "mailto"
  out = out.replace(
    /window\.location\.href\s*=\s*\w*[Mm]ailto(?:[Ll]ink|[Uu]rl)?\s*;?/g,
    `fetch('${formEndpoint}', { method:'POST', body:new FormData(form), headers:{'Accept':'application/json'} }).catch(function(){});`,
  );
  //  b) string literal directo: window.location.href = \`mailto:foo@bar.com\`
  out = out.replace(
    /window\.location\.href\s*=\s*[`'"]mailto:[^`'"]*[`'"]\s*;?/g,
    `fetch('${formEndpoint}', { method:'POST', body:new FormData(form), headers:{'Accept':'application/json'} }).catch(function(){});`,
  );

  // 2. Reemplazar la declaracion de la variable mailtoLink por null para
  //    que no quede codigo huerfano. Cubre const, let y var.
  out = out.replace(
    /(const|let|var)\s+mailtoLink\s*=\s*`mailto:[\s\S]*?`\s*;?/g,
    '$1 mailtoLink = null;',
  );
  out = out.replace(
    /(const|let|var)\s+mailtoLink\s*=\s*["']mailto:[^"']*["']\s*;?/g,
    '$1 mailtoLink = null;',
  );

  // 3. CTAs directos <a href="mailto:..."> en el header/hero: los dejamos
  //    como mailto pero los marcamos. El CTA principal (whatsapp / form)
  //    deberia ser otro, asi que aqui no rompemos nada.
  // (No-op: solo el handler era el problema critico.)

  return out;
}

/**
 * Inyecta GSAP + ScrollTrigger via CDN al final del body si no estan ya
 * presentes. Esto rescata sitios donde Claude olvido pedir scroll-reveal
 * pero los necesita para verse premium.
 */
function ensurePremiumLibraries(html: string): string {
  if (/data-plia-premium-libs/.test(html)) return html; // ya inyectado
  if (/gsap\.min\.js|gsap\.js"|GSAP|window\.gsap/i.test(html)) return html; // Claude ya lo metio
  if (!/<\/body>/i.test(html)) return html + '\n' + GSAP_BUNDLE_SCRIPT;
  return html.replace(/<\/body>/i, `${GSAP_BUNDLE_SCRIPT}\n</body>`);
}

/**
 * Detecta embeds de Google Maps con Place ID claramente inventado (patron
 * repetitivo tipo `0x9105c8f7b2b7b7b7%3A0x0`) y los reemplaza por una URL
 * keyless que busca por direccion (`maps?q=<addr>&output=embed`).
 *
 * Si no logramos extraer una direccion del propio embed, dejamos el HTML
 * tal cual (mejor que romperlo).
 */
function fixBrokenMapEmbed(html: string): string {
  let out = html;

  out = out.replace(
    /<iframe([^>]*?)src=["']https:\/\/www\.google\.com\/maps\/embed\?pb=([^"']*)["']([^>]*?)>/gi,
    (match, pre, pbContent, post) => {
      // Heuristica de "Place ID inventado":
      //  - Hex repetitivo (b7b7b7, a1a1a1, 000000)
      //  - termina en `%3A0x0` (suffix tipico de fakes)
      const looksFake =
        /([0-9a-f])\1{3,}/i.test(pbContent) ||
        /%3A0x0(?:!|$|"|')/.test(pbContent);
      if (!looksFake) return match;

      // Extraer direccion del propio pb si esta como `2s<DIRECCION>!`
      const addrMatch = pbContent.match(/!2s([^!]+)!/);
      const address = addrMatch ? decodeURIComponent(addrMatch[1]) : '';
      if (!address) return match; // no podemos arreglarlo: preservar

      const safeQ = encodeURIComponent(address);
      const newSrc = `https://www.google.com/maps?q=${safeQ}&output=embed`;
      return `<iframe${pre}src="${newSrc}"${post}>`;
    },
  );

  return out;
}

/**
 * Aplica TODOS los enforcers de calidad premium en orden seguro.
 *
 * @param html        HTML generado por Claude.
 * @param formEndpoint Endpoint propio para formularios (opcional).
 */
export function enforcePremiumQuality(
  html: string,
  formEndpoint?: string,
): string {
  if (!html) return html;
  let out = html;
  out = stripJsxLiterals(out);
  out = neutralizeMailtoFallback(out, formEndpoint);
  out = fixBrokenMapEmbed(out);
  // NO inyectamos GSAP (ensurePremiumLibraries): aplicaba opacity:0 y conflictúa
  // con el sistema .reveal seguro que ya incluye el head. Dejaba secciones invisibles.
  return out;
}

// Exports nombrados para tests/uso granular si hace falta.
export {
  stripJsxLiterals,
  neutralizeMailtoFallback,
  ensurePremiumLibraries,
  fixBrokenMapEmbed,
};
