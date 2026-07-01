"""
Generador de creativos para Facebook Ads de Plia
Requiere: pip install openai pillow requests
Usar en el VPS: python3 generar_ads.py
"""

import os
import sys
import requests
from pathlib import Path
from io import BytesIO

try:
    from openai import OpenAI
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Instalando dependencias...")
    os.system("pip install openai pillow requests --break-system-packages -q")
    from openai import OpenAI
    from PIL import Image, ImageDraw, ImageFont

# ─── Cargar API key desde .env ───────────────────────────────────────────────
def load_env(env_path=".env"):
    env = {}
    try:
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env

env = load_env("/home/plia.pe/backend/.env")
api_key = env.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")

if not api_key:
    print("ERROR: No se encontró OPENAI_API_KEY")
    sys.exit(1)

client = OpenAI(api_key=api_key)

# ─── Colores de marca Plia ────────────────────────────────────────────────────
DARK       = (20, 24, 31)
LIME       = (191, 255, 0)
WHITE      = (255, 255, 255)
GRAY       = (138, 143, 168)
DARK_GRAY  = (42, 47, 62)

# ─── Prompts DALL-E para fondos ───────────────────────────────────────────────
PROMPTS = {
    "feed": (
        "Abstract dark tech background for a Peruvian web design agency ad. "
        "Deep dark navy blue (#14181F) background with subtle glowing lime-green (#BFFF00) "
        "geometric grid lines fading into darkness. Clean, modern, minimal. "
        "No text, no people, no logos. Professional B2B aesthetic. "
        "Slight bokeh depth effect with floating translucent rectangles. "
        "High contrast. 1:1 square format.",
        (1080, 1080)
    ),
    "story": (
        "Abstract dark vertical background for Instagram Story ad. "
        "Deep dark navy (#14181F) with vertical flowing lime-green (#BFFF00) light streaks "
        "going upward from the bottom. Minimal geometric shapes. "
        "No text, no people, no logos. Ultra-clean modern fintech aesthetic. "
        "9:16 vertical format.",
        (1080, 1920)
    ),
    "banner": (
        "Abstract dark horizontal background for Facebook link ad banner. "
        "Deep dark navy (#14181F) background, right side has a subtle lime-green (#BFFF00) "
        "glowing diagonal accent line. Left side darker and cleaner. "
        "No text, no people, no logos. Professional SaaS product aesthetic. "
        "1.91:1 horizontal format.",
        (1200, 628)
    )
}

# ─── Descarga imagen generada por DALL-E ─────────────────────────────────────
def generate_background(prompt, size):
    w, h = size
    dalle_size = "1024x1024" if w == h else ("1024x1792" if h > w else "1792x1024")
    print(f"  Generando fondo con DALL-E 3 ({dalle_size})...")
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size=dalle_size,
        quality="hd",
        n=1,
    )
    img_url = response.data[0].url
    img_data = requests.get(img_url).content
    img = Image.open(BytesIO(img_data)).convert("RGB")
    return img.resize(size, Image.LANCZOS)

# ─── Intenta cargar fuente del sistema ───────────────────────────────────────
def get_font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

# ─── Overlay para Feed 1:1 ───────────────────────────────────────────────────
def overlay_feed(img):
    draw = ImageDraw.Draw(img)
    W, H = 1080, 1080

    # Overlay oscuro semi-transparente en la parte inferior
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.rectangle([0, H//2, W, H], fill=(20, 24, 31, 210))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Tag
    draw.rounded_rectangle([72, 72, 430, 130], radius=29, fill=(*LIME, 40))
    tag_font = get_font(28, bold=True)
    draw.text((251, 95), "PRESENCIA DIGITAL", font=tag_font, fill=LIME, anchor="mm")

    # Headline
    h1 = get_font(100, bold=True)
    draw.text((72, 580), "Tu web lista", font=h1, fill=WHITE)
    draw.text((72, 690), "en horas.", font=h1, fill=WHITE)

    sub = get_font(40)
    draw.text((72, 810), "Sin código. Sin complicaciones.", font=sub, fill=GRAY)

    # Línea divisora
    draw.line([72, 860, 1008, 860], fill=DARK_GRAY, width=2)

    # Features
    feat_font = get_font(36)
    features = ["Diseño profesional personalizado", "Dominio .pe incluido", "Entrega garantizada en 48 horas"]
    for i, feat in enumerate(features):
        y = 900 + i * 58
        draw.ellipse([72, y+4, 100, y+32], fill=LIME)
        draw.text((120, y), feat, font=feat_font, fill=WHITE)

    # Precio
    price_label = get_font(32)
    price_num = get_font(96, bold=True)
    draw.text((1008, 880), "desde", font=price_label, fill=GRAY, anchor="rs")
    draw.text((1008, 960), "S/ 390", font=price_num, fill=LIME, anchor="rs")

    # CTA button
    draw.rounded_rectangle([72, 980, 560, 1050], radius=39, fill=LIME)
    cta_font = get_font(42, bold=True)
    draw.text((316, 1015), "Ver más en plia.pe →", font=cta_font, fill=DARK, anchor="mm")

    return img

# ─── Overlay para Story 9:16 ─────────────────────────────────────────────────
def overlay_story(img):
    W, H = 1080, 1920
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.rectangle([0, 0, W, H], fill=(20, 24, 31, 180))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Barra superior
    draw.rectangle([0, 0, W, 10], fill=LIME)

    # Plan label
    label_font = get_font(48)
    draw.text((W//2, 420), "PLAN LANDING", font=label_font, fill=GRAY, anchor="mm")

    # Precio grande
    price_font = get_font(220, bold=True)
    draw.text((W//2, 660), "S/390", font=price_font, fill=LIME, anchor="mm")

    sub_font = get_font(44)
    draw.text((W//2, 760), "pago único · sin mensualidades", font=sub_font, fill=(*LIME, 150), anchor="mm")

    # Divisor
    draw.line([200, 840, 880, 840], fill=DARK_GRAY, width=2)

    # Headline
    h1 = get_font(88, bold=True)
    draw.text((W//2, 950), "Tu web profesional", font=h1, fill=WHITE, anchor="mm")
    draw.text((W//2, 1050), "lista en 48 horas", font=h1, fill=WHITE, anchor="mm")

    # Features
    feat_font = get_font(48)
    features = ["Diseño personalizado", "Dominio .pe incluido", "Soporte post-entrega"]
    for i, feat in enumerate(features):
        y = 1150 + i * 90
        draw.ellipse([240, y+10, 276, y+46], fill=LIME)
        draw.text((296, y), feat, font=feat_font, fill=WHITE)

    # CTA
    draw.rounded_rectangle([190, 1460, 890, 1580], radius=60, fill=LIME)
    cta_font = get_font(56, bold=True)
    draw.text((W//2, 1520), "Empieza en plia.pe →", font=cta_font, fill=DARK, anchor="mm")

    return img

# ─── Overlay para Banner 1.91:1 ──────────────────────────────────────────────
def overlay_banner(img):
    W, H = 1200, 628
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.rectangle([0, 0, W, H], fill=(20, 24, 31, 185))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Barra izquierda
    draw.rectangle([0, 0, 12, H], fill=LIME)

    # Headline izquierda
    h1 = get_font(80, bold=True)
    draw.text((60, 220), "Tu web lista", font=h1, fill=WHITE)
    draw.text((60, 310), "en 48 horas.", font=h1, fill=WHITE)

    sub_font = get_font(32)
    draw.text((60, 410), "Diseño profesional · Sin código", font=sub_font, fill=GRAY)

    # Features
    feat_font = get_font(30)
    features = ["Dominio .pe incluido", "Diseño personalizado", "Soporte incluido"]
    for i, feat in enumerate(features):
        y = 460 + i * 46
        draw.ellipse([60, y+6, 84, y+30], fill=LIME)
        draw.text((100, y), feat, font=feat_font, fill=WHITE)

    # Divisor vertical
    draw.line([668, 48, 668, 580], fill=DARK_GRAY, width=2)

    # Derecha: precio + CTA
    plan_font = get_font(34)
    draw.text((940, 180), "PLAN LANDING", font=plan_font, fill=GRAY, anchor="mm")
    price_font = get_font(148, bold=True)
    draw.text((940, 370), "S/390", font=price_font, fill=LIME, anchor="mm")
    draw.text((940, 440), "pago único", font=sub_font, fill=GRAY, anchor="mm")

    draw.rounded_rectangle([710, 478, 1165, 570], radius=46, fill=LIME)
    cta_font = get_font(42, bold=True)
    draw.text((937, 524), "Ver en plia.pe →", font=cta_font, fill=DARK, anchor="mm")

    return img

# ─── Main ─────────────────────────────────────────────────────────────────────
output_dir = Path(__file__).parent
formats = [
    ("feed",   overlay_feed,   (1080, 1080)),
    ("story",  overlay_story,  (1080, 1920)),
    ("banner", overlay_banner, (1200, 628)),
]

print("\n🎨 Generando creativos para Facebook Ads de Plia...\n")

for name, overlay_fn, size in formats:
    print(f"[{name.upper()}] {size[0]}x{size[1]}px")
    prompt, _ = PROMPTS[name]
    try:
        bg = generate_background(prompt, size)
        final = overlay_fn(bg)
        out_path = output_dir / f"plia_ad_{name}.png"
        final.save(out_path, "PNG", optimize=True)
        print(f"  ✓ Guardado: {out_path}\n")
    except Exception as e:
        print(f"  ✗ Error: {e}\n")

print("✅ Listo. Sube los PNG a Facebook Ads Manager.")
