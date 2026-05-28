/**
 * Post-procesa HTML para FORZAR que los <form> de contacto cumplan las
 * reglas de PLIA: action al endpoint correcto, honeypot, mensaje inline,
 * submit AJAX, y nombres de campo en ingles.
 *
 * Idempotente: si el form ya cumple (tiene data-plia-contact), no se toca.
 * Solo se aplica a forms que parecen de contacto (tienen email + textarea).
 */

const fieldAliases: Record<string, string> = {
  nombre: 'name',
  nombres: 'name',
  'nombre-completo': 'name',
  nombre_completo: 'name',
  fullname: 'name',
  'full-name': 'name',
  mensaje: 'message',
  mensajes: 'message',
  comentario: 'message',
  comentarios: 'message',
  consulta: 'message',
  pregunta: 'message',
  correo: 'email',
  'correo-electronico': 'email',
  correo_electronico: 'email',
  'e-mail': 'email',
  mail: 'email',
  telefono: 'phone',
  'telefono-celular': 'phone',
  celular: 'phone',
  whatsapp: 'phone',
  asunto: 'subject',
  motivo: 'subject',
  tema: 'subject',
};

const SUBMIT_SCRIPT = `<script data-plia-contact-handler>
document.querySelectorAll('form[data-plia-contact]').forEach(function(f){
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var msg = f.querySelector('[data-plia-msg]');
    var btn = f.querySelector('button[type="submit"], input[type="submit"]');
    var origBtn = btn ? btn.innerHTML : null;
    if(btn){ btn.disabled = true; btn.innerHTML = 'Enviando...'; }
    try {
      var res = await fetch(f.action, { method:'POST', body:new FormData(f), headers:{'Accept':'application/json'} });
      var data = await res.json().catch(function(){return {};});
      if(msg){ msg.style.display='block'; msg.textContent = data.message || (res.ok?'¡Recibido! Te contactaremos pronto.':'No se pudo enviar.'); msg.style.color = res.ok ? '#16a34a' : '#dc2626'; }
      if(res.ok){ f.reset(); }
    } catch(err){
      if(msg){ msg.style.display='block'; msg.textContent = 'Error de red. Intenta de nuevo.'; msg.style.color = '#dc2626'; }
    } finally {
      if(btn){ btn.disabled = false; btn.innerHTML = origBtn; }
    }
  });
});
</script>`;

export function enforceContactForms(html: string, formEndpoint?: string): string {
  if (!html || !formEndpoint) return html;

  let result = html;
  let touched = false;

  result = result.replace(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi, (match, attrs: string, inner: string) => {
    if (/\bdata-plia-contact\b/.test(attrs)) return match;

    const looksLikeContactForm =
      /type=["']email["']|name=["'](?:email|correo|correo-electronico|e-?mail|mail)["']/i.test(inner) ||
      /<textarea\b/i.test(inner);
    if (!looksLikeContactForm) return match;

    touched = true;

    let newAttrs = attrs
      .replace(/\saction=["'][^"']*["']/gi, '')
      .replace(/\smethod=["'][^"']*["']/gi, '');
    newAttrs = ` action="${formEndpoint}" method="POST" data-plia-contact${newAttrs}`;

    let newInner = inner;
    for (const [es, en] of Object.entries(fieldAliases)) {
      const reName = new RegExp(`(\\sname=["'])${es}(["'])`, 'gi');
      newInner = newInner.replace(reName, `$1${en}$2`);
      const reFor = new RegExp(`(\\sfor=["'])${es}(["'])`, 'gi');
      newInner = newInner.replace(reFor, `$1${en}$2`);
      const reId = new RegExp(`(\\sid=["'])${es}(["'])`, 'gi');
      newInner = newInner.replace(reId, `$1${en}$2`);
    }

    if (!/name=["']_honeypot["']/.test(newInner)) {
      newInner =
        '\n  <input type="text" name="_honeypot" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true">\n' +
        newInner;
    }

    if (!/data-plia-msg/.test(newInner)) {
      newInner += '\n  <p data-plia-msg style="margin-top:12px;font-size:14px;display:none;"></p>\n';
    }

    return `<form${newAttrs}>${newInner}</form>`;
  });

  if (!touched) return result;

  if (!/data-plia-contact-handler/.test(result)) {
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${SUBMIT_SCRIPT}\n</body>`);
    } else {
      result += SUBMIT_SCRIPT;
    }
  }

  return result;
}
