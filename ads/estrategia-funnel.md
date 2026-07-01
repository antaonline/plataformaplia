# Estrategia de Funnel + Retargeting — Plia

## El problema actual

Los ads están funcionando (generando leads), pero el funnel después del click no convierte porque:
- El bot lanza el precio y el checkout link demasiado rápido
- Los leads no tienen suficiente confianza para pagar S/390 sin ver ningún resultado
- No hay retargeting para la gente que se fue sin comprar

---

## La nueva estrategia: 3 capas

```
CAPA 1 — FRÍO (nunca te conocen)
  ↓  Ad "Prueba gratis 30 días" → WhatsApp
  ↓  Bot califica → muestra demo → explica trial
  ↓  Tú construyes el demo en 24h
  ↓  Lead ve SU web → paga S/390 para conservarla

CAPA 2 — TIBIO (te vieron, no compraron)
  ↓  Pixel trackea: visitó plia.pe pero no hizo checkout
  ↓  Retargeting Ad → "¿Tu demo ya está esperándote?" → WhatsApp
  ↓  Bot retoma con contexto → cierre

CAPA 3 — CALIENTE (ya habló, no cerró)
  ↓  Seguimiento manual de leads que preguntaron pero no compraron
  ↓  Mensaje personalizado en WhatsApp a las 48h
```

---

## CAPA 1: Tráfico Frío

### Campaña A — Objetivo: Mensajes (WhatsApp)

**Budget:** S/70 de S/100 total  
**Duración:** 10 días  
**Horario:** 8am–10pm  
**Plataformas:** Facebook Feed + Instagram Feed + Stories

#### Audiencia
- **Edad:** 25–45 años
- **Sexo:** Todos
- **Ubicación:** Lima Metropolitana (expandible a Arequipa, Trujillo)
- **Intereses:** emprendimiento, negocios, marketing digital, redes sociales para negocios, e-commerce
- **Comportamiento:** propietarios de negocios pequeños
- **Excluir:** personas que ya interactuaron con tu página de Facebook/Instagram (esas van a retargeting)

#### 3 variaciones de anuncio a testear

**Variación 1 — Free Trial (Principal)**
- **Imagen:** Ad Feed (plia_ad_feed.png)
- **Headline:** Tu página web lista en 24 horas — pruébala gratis
- **Texto principal:**
  ```
  ¿Todavía sin web para tu negocio? 🤔

  Te la armamos en 24 horas.
  La ves lista, con tu nombre y tu rubro.
  Solo pagas si te convence. Si no, sin costo.

  S/390 pago único. Sin mensualidades. Sin técnicos.

  👇 Escríbenos y empieza gratis
  ```
- **CTA:** Enviar mensaje

**Variación 2 — Velocidad + Sin Riesgo**
- **Imagen:** Ad Banner (plia_ad_banner.png)
- **Headline:** Web profesional sin pagar por adelantado
- **Texto principal:**
  ```
  Cada día sin web es un cliente que se va con tu competencia.

  En Plia tenemos tu página lista en 48 horas:
  → Diseño profesional y adaptado a tu negocio
  → Hosting gratis el primer año
  → Dominio .pe incluido

  Y lo mejor: no pagas hasta verla.

  Precio fijo S/390. Sin sorpresas. 👇
  ```
- **CTA:** Enviar mensaje

**Variación 3 — Contraste precio (Story)**
- **Imagen:** Ad Story (plia_ad_story.png)
- **Headline:** Las agencias cobran S/2000+. Nosotros te la mostramos gratis primero.
- **Texto principal:**
  ```
  Una agencia tradicional te cobra entre S/2000 y S/8000 por una web.
  Y la ves 30 días después.

  Con Plia:
  → La ves en 24 horas
  → Solo pagas si te convence
  → S/390 pago único

  Para restaurantes, tiendas, consultoras, servicios...
  ```
- **CTA:** Enviar mensaje

### ¿Cuál testear primero?
Lanza las 3 con S/20 cada una los primeros 3 días. La que tenga más CTR y mensajes iniciados, escálala con S/40 adicionales.

---

## CAPA 2: Retargeting (requiere Meta Pixel)

### Qué necesitas instalar

El Meta Pixel es un script de seguimiento que pones en tu web (plia.pe). Registra quién visitó, qué páginas vio, y si llegó al checkout. Con eso puedes mostrarle ads SOLO a esa gente (que ya sabe que existes).

Ver archivo: `frontend/lib/meta-pixel.ts` + `frontend/components/MetaPixel.tsx`

### Audiencias de retargeting a crear en Ads Manager

Una vez instalado el pixel, crea estas Custom Audiences en Meta Ads Manager:

**Audiencia 1 — Visitantes del sitio (30 días)**
- Todos los que visitaron plia.pe en los últimos 30 días
- Excluir: los que llegaron a `/checkout` (esos ya saben el precio)

**Audiencia 2 — Checkout abandonado (14 días)**
- Los que visitaron `plia.pe/checkout` pero no llegaron a la página de confirmación de pago
- Estos son los más hot — casi compraron

**Audiencia 3 — Engagement en Facebook/Instagram (sin pixel)**
- Puedes crear esta sin pixel: personas que interactuaron con tu página de FB/IG en los últimos 60 días
- En Ads Manager → Audiencias → Crear → Audiencia personalizada → Cuenta de Instagram o Página de Facebook → Personas que interactuaron

### Campaña de Retargeting

**Budget:** S/30 de S/100 total  
**Duración:** running permanente  
**Audiencia:** Audiencias 1 + 2 + 3 (combinar en un ad set)

**Variación Retargeting 1 — Urgencia suave**
```
¿Viste nuestra web y se te fue del radar? 😅

Tu demo todavía puede estar lista mañana.
Escribenos y en 24 horas ves tu negocio en línea.

Sin pagar nada por adelantado.
```

**Variación Retargeting 2 — Prueba social**
```
Más de 50 negocios en Lima ya lanzaron su web con Plia.

Restaurantes, consultoras, tiendas, servicios...
todos en menos de 48 horas.

¿Cuándo arrancas tú?
```

---

## CAPA 3: Seguimiento manual (sin costo)

Los leads que mandaron mensaje pero no compraron: son los más valiosos.

**A las 24h de su primer mensaje (sin respuesta al bot):**
```
Hola [nombre], ¿llegaste a ver los planes de Plia? 
Si tienes alguna duda o quieres que te armemos 
la demo de tu negocio, solo dime y lo hacemos hoy.
```

**A las 72h:**
```
[Nombre], te dejo esto por si acaso:
la demo es gratis — la construimos, la ves, 
y solo pagas si te convence. Sin riesgo.
```

Hazlo manualmente los primeros meses hasta validar que convierte, luego lo automatizas.

---

## Distribución del presupuesto recomendada (S/100)

| Campaña | Budget | Objetivo |
|---------|--------|----------|
| Frío — Var 1 (Free Trial) | S/40 | Más mensajes iniciados |
| Frío — Var 2 (Velocidad) | S/20 | Testeo |
| Frío — Var 3 (Contraste) | S/10 | Story testeo |
| Retargeting | S/30 | Recuperar visitantes |

---

## Métricas a revisar cada 3 días

| Métrica | Bueno | Preocupante |
|---------|-------|-------------|
| CPM (costo por 1000 impresiones) | < S/10 | > S/20 |
| CTR (click-through rate) | > 1.5% | < 0.8% |
| Costo por mensaje iniciado | < S/8 | > S/15 |
| Tasa de conversión (mensaje → pago) | > 10% | < 5% |

Con S/100 en 10 días, el objetivo es: 10–15 mensajes iniciados, 2–3 ventas cerradas.
Eso equivale a S/780–S/1170 en ingresos con S/100 invertido → ROI de 7x–11x.
