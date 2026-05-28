/**
 * Genera el contenido del PHP de contacto para sitios de DOMINIO PROPIO.
 *
 * Se deposita en `<public_html>/_plia/contact.php` al publicar. El form
 * de contacto apunta a `/_plia/contact.php` (relativo al dominio del
 * cliente), de modo que el sitio queda 100% autosuficiente: si el
 * cliente algun dia se lleva los archivos a otro hosting con PHP +
 * capacidad de enviar correo, el form sigue funcionando sin modificacion.
 *
 * El correo se manda via PHP mail() — en este servidor mail() usa el
 * Postfix local que ya tiene DKIM/SPF/DMARC/PTR configurados, asi que
 * la entrega sale bien autenticada con el dominio del propio cliente.
 *
 * Para subdominios .plia.pe seguimos usando el endpoint central
 * api.plia.pe/api/site-contact/<id> — el sitio ya depende de PLIA en
 * todos los demas aspectos (DNS, hosting, dominio).
 */

export interface LocalContactPhpInputs {
  recipientEmail: string;
  businessName: string;
  senderDomain: string; // ej. "credimotors.pe"
  sourceUrl: string; // ej. "https://credimotors.pe"
}

function phpEscape(value: string): string {
  // Solo necesitamos escapar comillas simples y backslash para
  // incrustrar en strings single-quoted de PHP.
  return (value || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

export function buildLocalContactPhp(inputs: LocalContactPhpInputs): string {
  const recipient = phpEscape(inputs.recipientEmail);
  const business = phpEscape(inputs.businessName);
  const domain = phpEscape(inputs.senderDomain);
  const source = phpEscape(inputs.sourceUrl || `https://${inputs.senderDomain}`);

  return `<?php
/**
 * PLIA contact form handler (local).
 * Generado automaticamente en el publish del sitio. No editar a mano.
 */
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

// Honeypot anti-spam: silencio total si caen los bots.
if (!empty($_POST['_honeypot'])) {
    echo json_encode(['ok' => true, 'message' => 'Recibido']);
    exit;
}

function plia_pick(array $keys): string {
    foreach ($keys as $k) {
        if (isset($_POST[$k]) && is_string($_POST[$k]) && trim($_POST[$k]) !== '') {
            return trim($_POST[$k]);
        }
    }
    return '';
}

$name = substr(plia_pick([
    'name', 'nombre', 'nombres', 'nombre-completo', 'nombre_completo', 'fullname', 'full-name'
]), 0, 200);
$email = substr(plia_pick([
    'email', 'correo', 'correo-electronico', 'correo_electronico', 'e-mail', 'mail'
]), 0, 320);
$message = substr(plia_pick([
    'message', 'mensaje', 'comentario', 'comentarios', 'consulta', 'pregunta'
]), 0, 5000);

if ($name === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'El nombre es requerido.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Correo electronico no valido.']);
    exit;
}
if ($message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'El mensaje no puede estar vacio.']);
    exit;
}

// ─── CONFIGURACION EMBEBIDA AL PUBLICAR ───────────────────────────
$recipientEmail = '${recipient}';
$businessName   = '${business}';
$senderDomain   = '${domain}';
$sourceUrl      = '${source}';
// ──────────────────────────────────────────────────────────────────

// Campos extra (telefono, asunto, fecha, etc.)
$reserved = [
    '_honeypot', '_next',
    'name', 'nombre', 'nombres', 'nombre-completo', 'nombre_completo', 'fullname', 'full-name',
    'email', 'correo', 'correo-electronico', 'correo_electronico', 'e-mail', 'mail',
    'message', 'mensaje', 'comentario', 'comentarios', 'consulta', 'pregunta'
];
$extras = '';
foreach ($_POST as $k => $v) {
    if (in_array($k, $reserved, true)) continue;
    if (!is_string($v)) continue;
    $vt = trim($v);
    if ($vt === '') continue;
    $label = ucfirst(str_replace(['_', '-'], ' ', $k));
    $extras .= "\\n" . $label . ": " . substr($vt, 0, 2000);
}

$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

$subject = "Nuevo mensaje desde " . $businessName;
$body  = "Hola,\\n\\n";
$body .= "Tienes un nuevo mensaje desde tu sitio web (" . $sourceUrl . "):\\n\\n";
$body .= "Nombre: " . $name . "\\n";
$body .= "Correo: " . $email;
if ($extras !== '') $body .= $extras;
$body .= "\\n\\nMensaje:\\n" . $message . "\\n\\n";
$body .= "— Enviado automaticamente por el formulario de tu sitio web.";

$fromAddr = "notificacion@" . $senderDomain;
$headers  = "From: " . $businessName . " <" . $fromAddr . ">\\r\\n";
$headers .= "Reply-To: " . $safeName . " <" . $safeEmail . ">\\r\\n";
$headers .= "MIME-Version: 1.0\\r\\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\\r\\n";
$headers .= "X-Mailer: PLIA-LocalContact/1.0\\r\\n";

$sent = @mail($recipientEmail, $subject, $body, $headers, "-f" . $fromAddr);

if ($sent) {
    echo json_encode(['ok' => true, 'message' => '¡Recibido! Te contactaremos pronto.']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'No se pudo enviar el mensaje. Intenta de nuevo en unos minutos.']);
}
`;
}

export function isCustomDomain(domain: string, baseDomain = 'plia.pe'): boolean {
  if (!domain) return false;
  const d = domain.toLowerCase().trim();
  const base = baseDomain.toLowerCase().trim();
  return !d.endsWith(`.${base}`) && d !== base;
}
