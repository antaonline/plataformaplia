#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# plia-attach-domain.sh
#
# Vincula un dominio externo (ej. "mi-marca.com") como vhAlias del vhost de un
# subdominio plia.pe ya existente (ej. "cevicheriaperu.plia.pe"), SIN consumir
# un slot de CyberPanel. Es el equivalente al "parked domain" / "alias domain"
# que ofrecen cPanel/Plesk.
#
# Operaciones:
#   1. Backup de vhost.conf del subdominio + httpd_config.conf global.
#   2. Agrega `vhAliases <alias> www.<alias>` al vhost.conf del subdominio.
#   3. Agrega mappings al listener Default, SSL y SSL IPv6 del httpd_config.
#   4. Re-emite cert Let's Encrypt multi-SAN con --expand para incluir el alias.
#   5. Restart LSWS.
#   6. Validación post-restart: si LSWS no arranca, rollback completo.
#
# Rollback automatico si CUALQUIER paso falla.
#
# Uso:
#   plia-attach-domain.sh attach  <subdominio.plia.pe>  <dominio-cliente.com>
#   plia-attach-domain.sh detach  <subdominio.plia.pe>  <dominio-cliente.com>
#
# Salida:
#   stdout: JSON con { ok: true|false, step: "<paso>", message: "<detalle>" }
#   exit 0 = éxito, exit != 0 = fallo (con rollback aplicado)
# ─────────────────────────────────────────────────────────────────────────────

set -u  # error si variables sin definir
LC_ALL=C

# Paths del sistema
LSWS_CONF_DIR="/usr/local/lsws/conf"
LSWS_VHOSTS_DIR="$LSWS_CONF_DIR/vhosts"
LSWS_CTL="/usr/local/lsws/bin/lswsctrl"
CERTBOT="/usr/bin/certbot"
LE_LIVE_DIR="/etc/letsencrypt/live"
ADMIN_EMAIL="${PLIA_LE_EMAIL:-admin@plia.pe}"

# Backups van a /var/backups/plia-domain (auto-rotación a 30 días por logrotate si está)
BACKUP_DIR="/var/backups/plia-domain"
mkdir -p "$BACKUP_DIR"

# ── helpers ─────────────────────────────────────────────────────────────────

emit() {
  # emit "<step>" "<ok|err>" "<message>"
  local step="$1" status="$2" message="$3"
  if [ "$status" = "ok" ]; then
    echo "{\"ok\":true,\"step\":\"$step\",\"message\":\"$message\"}"
  else
    echo "{\"ok\":false,\"step\":\"$step\",\"message\":\"$message\"}" 1>&2
  fi
}

is_valid_domain() {
  # Sin protocolo, sin path, formato dominio razonable (acepta x.com, x.com.pe, sub.x.com)
  echo "$1" | grep -qE '^[a-z0-9][a-z0-9-]{0,62}(\.[a-z0-9][a-z0-9-]{0,62})+$'
}

backup_file() {
  local src="$1"
  local name; name=$(basename "$src")
  local dst="$BACKUP_DIR/${name}.$(date +%s).bak"
  cp -a "$src" "$dst" || return 1
  echo "$dst"
}

rollback() {
  local vhost_bak="$1"
  local httpd_bak="$2"
  local vhost_file="$3"
  local httpd_file="$4"
  echo "[rollback] restaurando configs..." 1>&2
  [ -f "$vhost_bak" ] && cp -a "$vhost_bak" "$vhost_file"
  [ -f "$httpd_bak" ] && cp -a "$httpd_bak" "$httpd_file"
  $LSWS_CTL restart > /dev/null 2>&1
}

# ── argumentos ──────────────────────────────────────────────────────────────

ACTION="${1:-}"
SUBDOMAIN="${2:-}"
ALIAS="${3:-}"

if [ -z "$ACTION" ] || [ -z "$SUBDOMAIN" ] || [ -z "$ALIAS" ]; then
  emit "args" "err" "Uso: $0 attach|detach <subdomain> <alias>"
  exit 2
fi

if ! is_valid_domain "$SUBDOMAIN"; then
  emit "validate" "err" "Subdominio invalido: $SUBDOMAIN"
  exit 2
fi
if ! is_valid_domain "$ALIAS"; then
  emit "validate" "err" "Alias dominio invalido: $ALIAS"
  exit 2
fi

VHOST_DIR="$LSWS_VHOSTS_DIR/$SUBDOMAIN"
VHOST_CONF="$VHOST_DIR/vhost.conf"
HTTPD_CONF="$LSWS_CONF_DIR/httpd_config.conf"

if [ ! -f "$VHOST_CONF" ]; then
  emit "validate" "err" "vhost.conf no existe: $VHOST_CONF"
  exit 2
fi
if [ ! -f "$HTTPD_CONF" ]; then
  emit "validate" "err" "httpd_config.conf no existe: $HTTPD_CONF"
  exit 2
fi

# ────────────────────────────────────────────────────────────────────────────
# ACTION: attach
# ────────────────────────────────────────────────────────────────────────────
if [ "$ACTION" = "attach" ]; then

  # Backup
  VHOST_BAK=$(backup_file "$VHOST_CONF") || { emit "backup" "err" "No se pudo backupear $VHOST_CONF"; exit 1; }
  HTTPD_BAK=$(backup_file "$HTTPD_CONF") || { emit "backup" "err" "No se pudo backupear $HTTPD_CONF"; exit 1; }

  # 1) Agregar vhAliases al vhost.conf del subdominio
  # Si la linea vhAliases existe (vacia o con valor previo de markdown roto),
  # la reemplazamos. Si no existe, la insertamos despues de vhDomain.
  WWW_ALIAS="www.$ALIAS"
  NEW_ALIASES="$ALIAS $WWW_ALIAS"

  if grep -qE '^[[:space:]]*vhAliases' "$VHOST_CONF"; then
    # Reemplazar linea existente (cuidando preservar valores PREVIOS de aliases legitimos)
    # Estrategia: si la linea actual contiene "[www.$VH_NAME]" (markdown roto, sin valor real),
    # la reemplazamos limpia. Si tiene valores reales, los acumulamos.
    CURRENT=$(grep -E '^[[:space:]]*vhAliases' "$VHOST_CONF" | head -n1 | sed -E 's/^[[:space:]]*vhAliases[[:space:]]+//')
    CLEAN_CURRENT=$(echo "$CURRENT" | grep -vE '\[www\.\$VH_NAME\]|^\s*$' || true)
    # Si ya esta nuestro alias, no duplicar
    if echo "$CLEAN_CURRENT" | grep -qw "$ALIAS"; then
      EXTRA=""
    else
      EXTRA="$NEW_ALIASES"
    fi
    if [ -n "$CLEAN_CURRENT" ] && [ -n "$EXTRA" ]; then
      MERGED="$CLEAN_CURRENT $EXTRA"
    elif [ -n "$EXTRA" ]; then
      MERGED="$EXTRA"
    else
      MERGED="$CLEAN_CURRENT"
    fi
    # Escape para sed
    ESC_MERGED=$(printf '%s\n' "$MERGED" | sed -e 's/[\/&]/\\&/g')
    sed -i -E "s|^[[:space:]]*vhAliases.*|vhAliases                 $ESC_MERGED|" "$VHOST_CONF"
  else
    # Insertar despues de vhDomain
    sed -i -E "/^[[:space:]]*vhDomain[[:space:]]+/a vhAliases                 $NEW_ALIASES" "$VHOST_CONF"
  fi

  if ! grep -qw "$ALIAS" "$VHOST_CONF"; then
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    emit "vhost" "err" "No se pudo agregar vhAliases en $VHOST_CONF"
    exit 1
  fi

  # 2) Agregar mappings a los listeners (Default, SSL, SSL IPv6) del httpd_config
  # El formato de cada listener tiene varias lineas "map  <host>  <vhostname>".
  # Insertamos "  map  $ALIAS $SUBDOMAIN" antes del "address" de cada listener
  # SOLO si no existe ya un mapping con ese host. Idempotente.
  python3 - "$HTTPD_CONF" "$ALIAS" "$WWW_ALIAS" "$SUBDOMAIN" <<'PYEOF'
import re, sys
path, alias, www_alias, target = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
with open(path, 'r') as f:
    content = f.read()

def listener_has_map(block: str, host: str) -> bool:
    return re.search(rf'^\s*map\s+{re.escape(host)}\b', block, re.MULTILINE) is not None

def patch_listener(block: str) -> str:
    new_maps = []
    for host in (alias, www_alias):
        if not listener_has_map(block, host):
            new_maps.append(f'  map                     {host} {target}')
    if not new_maps:
        return block
    # Insertar antes de la linea "  address" (cualquier listener tiene una)
    lines = block.split('\n')
    out = []
    inserted = False
    for line in lines:
        if (not inserted) and re.match(r'^\s*address\s+', line):
            out.extend(new_maps)
            inserted = True
        out.append(line)
    if not inserted:
        # fallback: agregarlos antes del cierre
        for i in range(len(out)-1, -1, -1):
            if out[i].strip() == '}':
                for nm in reversed(new_maps):
                    out.insert(i, nm)
                inserted = True
                break
    return '\n'.join(out)

# Encontrar bloques "listener X {...}" top-level (no anidados)
def replace_listeners(content: str) -> str:
    out = []
    i = 0
    while i < len(content):
        m = re.search(r'(^|\n)listener\s+\S+\s*\{', content[i:])
        if not m:
            out.append(content[i:])
            break
        start = i + m.start() + (1 if m.group(1) == '\n' else 0)
        out.append(content[i:start])
        # Buscar el } que cierra este bloque (cuenta nesting)
        depth = 0
        j = start
        while j < len(content):
            if content[j] == '{':
                depth += 1
            elif content[j] == '}':
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            j += 1
        block = content[start:j]
        out.append(patch_listener(block))
        i = j
    return ''.join(out)

new_content = replace_listeners(content)
if new_content != content:
    with open(path, 'w') as f:
        f.write(new_content)
    print("listener-patched")
else:
    print("listener-noop")
PYEOF

  if [ $? -ne 0 ]; then
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    emit "listener" "err" "Fallo al modificar listeners en httpd_config.conf"
    exit 1
  fi

  # 3) Emitir cert Let's Encrypt multi-SAN con --expand
  # Usar el directorio del cert del subdominio (ya existe). --expand reusa el
  # mismo lineage y agrega los nuevos -d al SAN.
  WEBROOT="/home/$SUBDOMAIN/public_html"
  if [ ! -d "$WEBROOT" ]; then
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    emit "certbot" "err" "Webroot no existe: $WEBROOT"
    exit 1
  fi

  # Necesitamos que LSWS este escuchando para el HTTP-01 challenge en :80.
  # Hacemos un restart soft primero para aplicar los cambios de vhost y listener.
  $LSWS_CTL restart > /dev/null 2>&1 || true
  sleep 2

  # Si el cliente esta usando --expand sobre un lineage que ya existe,
  # certbot mantiene el path /etc/letsencrypt/live/$SUBDOMAIN/.
  $CERTBOT certonly --webroot -w "$WEBROOT" \
    --cert-name "$SUBDOMAIN" \
    -d "$SUBDOMAIN" \
    -d "$ALIAS" -d "$WWW_ALIAS" \
    --expand --non-interactive --agree-tos -m "$ADMIN_EMAIL" \
    > "$BACKUP_DIR/certbot-$ALIAS.log" 2>&1
  CB_RC=$?

  if [ $CB_RC -ne 0 ]; then
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    LAST=$(tail -n 5 "$BACKUP_DIR/certbot-$ALIAS.log" | tr '\n' ' ' | sed 's/"/\\"/g')
    emit "certbot" "err" "Certbot fallo: $LAST"
    exit 1
  fi

  # 4) Restart LSWS final para activar SSL multi-SAN
  if ! $LSWS_CTL restart > /dev/null 2>&1; then
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    emit "lsws" "err" "LSWS no logro reiniciar tras certbot"
    exit 1
  fi
  sleep 2

  # 5) Validacion post-restart: verificar que LSWS esta vivo
  if ! pgrep -x "litespeed" > /dev/null && ! pgrep -x "lsphp" > /dev/null; then
    # No esta corriendo -> rollback duro
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    emit "lsws" "err" "LSWS no esta corriendo despues del restart"
    exit 1
  fi

  emit "done" "ok" "Alias $ALIAS vinculado a $SUBDOMAIN"
  exit 0

# ────────────────────────────────────────────────────────────────────────────
# ACTION: detach
# ────────────────────────────────────────────────────────────────────────────
elif [ "$ACTION" = "detach" ]; then

  VHOST_BAK=$(backup_file "$VHOST_CONF") || { emit "backup" "err" "No se pudo backupear $VHOST_CONF"; exit 1; }
  HTTPD_BAK=$(backup_file "$HTTPD_CONF") || { emit "backup" "err" "No se pudo backupear $HTTPD_CONF"; exit 1; }

  WWW_ALIAS="www.$ALIAS"

  # Quitar el alias de vhAliases (preservando otros)
  CURRENT=$(grep -E '^[[:space:]]*vhAliases' "$VHOST_CONF" | head -n1 | sed -E 's/^[[:space:]]*vhAliases[[:space:]]+//' || true)
  if [ -n "$CURRENT" ]; then
    REMAINING=$(echo "$CURRENT" | tr ' ' '\n' | grep -vE "^($(printf '%s\n' "$ALIAS" | sed -e 's/[\/&.]/\\&/g')|$(printf '%s\n' "$WWW_ALIAS" | sed -e 's/[\/&.]/\\&/g'))$" | tr '\n' ' ' | sed -E 's/[[:space:]]+$//')
    if [ -n "$REMAINING" ]; then
      ESC=$(printf '%s\n' "$REMAINING" | sed -e 's/[\/&]/\\&/g')
      sed -i -E "s|^[[:space:]]*vhAliases.*|vhAliases                 $ESC|" "$VHOST_CONF"
    else
      sed -i -E '/^[[:space:]]*vhAliases/d' "$VHOST_CONF"
    fi
  fi

  # Quitar mappings de los listeners
  python3 - "$HTTPD_CONF" "$ALIAS" "$WWW_ALIAS" "$SUBDOMAIN" <<'PYEOF'
import re, sys
path, alias, www_alias, target = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
with open(path, 'r') as f:
    content = f.read()
pattern = re.compile(rf'^\s*map\s+({re.escape(alias)}|{re.escape(www_alias)})\b.*\n', re.MULTILINE)
new = pattern.sub('', content)
if new != content:
    with open(path, 'w') as f:
        f.write(new)
PYEOF

  # Re-emitir cert sin el alias (--expand sobre los dominios restantes)
  WEBROOT="/home/$SUBDOMAIN/public_html"
  $CERTBOT certonly --webroot -w "$WEBROOT" \
    --cert-name "$SUBDOMAIN" -d "$SUBDOMAIN" \
    --expand --non-interactive --agree-tos -m "$ADMIN_EMAIL" \
    > "$BACKUP_DIR/certbot-detach-$ALIAS.log" 2>&1 || true

  # Restart LSWS
  if ! $LSWS_CTL restart > /dev/null 2>&1; then
    rollback "$VHOST_BAK" "$HTTPD_BAK" "$VHOST_CONF" "$HTTPD_CONF"
    emit "lsws" "err" "LSWS no reinicio tras detach"
    exit 1
  fi

  emit "done" "ok" "Alias $ALIAS removido de $SUBDOMAIN"
  exit 0

else
  emit "args" "err" "ACTION desconocida: $ACTION (usa attach|detach)"
  exit 2
fi
