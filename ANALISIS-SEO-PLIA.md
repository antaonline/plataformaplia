# Análisis SEO de PLIA + Estrategia para llegar al puesto 1

**Fecha:** 2 de julio de 2026 · **Alcance:** análisis del frontend (repo `frontend/`), del sitio en producción (plia.pe) y de los 9 competidores de la primera página de Google para "hosting en Perú". **No se modificó nada.**

---

## 1. Resumen ejecutivo

El problema de PLIA **no es principalmente el código**. El frontend está técnicamente bien hecho para SEO (Next.js con SSR, metadata correcta, sitemap, robots, JSON-LD, canonicals). El problema es triple:

1. **Autoridad de dominio cero.** plia.pe tiene **Domain Rating 0 en Ahrefs** (prácticamente sin backlinks). Los competidores de la primera página tienen DR entre 13 y 81, dominios exact-match ("hosting" en el nombre) y 15–19 años de antigüedad. Google no tiene ninguna razón todavía para confiar en plia.pe para una keyword comercial competida.
2. **Bug crítico en producción:** la página `/web-hosting` — la ÚNICA página que apunta a "hosting en Perú" — se sirve en vivo con título **"Plia"** y descripción genérica "Plataforma de soluciones web sin complicaciones" (metadata del layout `(auth)`), NO con el metadata SEO que existe en el repo. Tu página de dinero para esa keyword está invisible para Google tal como está desplegada.
3. **Landings SEO huérfanas:** `/web-hosting`, `/diseno-de-paginas-web-peru`, `/tienda-online-peru`, etc. no están enlazadas desde el header ni el footer. Solo existen en el sitemap. Para Google, una página sin enlaces internos vale casi nada.

Conclusión honesta: con DR 0 y un dominio joven, **ninguna optimización on-page va a meter a PLIA en el top 10 de "hosting en Perú" en el corto plazo**. La ruta realista es: corregir lo crítico (semanas), construir profundidad de contenido (1–3 meses), construir autoridad/backlinks (3–12 meses), y atacar primero keywords long-tail donde sí se puede ganar ya.

---

## 2. Diagnóstico detallado

### 2.1 Lo que está BIEN en el frontend (no tocar)

- SSR real: el HTML llega completo a Google (verificado en producción).
- `app/layout.tsx`: Metadata API bien usada (title template, OG, Twitter, robots, metadataBase, canonical).
- `app/sitemap.ts` y `app/robots.ts` dinámicos y correctos; los posts del blog entran solos al sitemap.
- JSON-LD: Organization, WebSite, Service (web-hosting) y BlogPosting por artículo.
- Blog `/blog` bien implementado: 12 posts con keyword en title/H1, meta description con CTA, canonical, `generateStaticParams`, categorías, interlinking hacia /planes y /contacto.
- Landings SEO dedicadas ya desplegadas y con buen on-page: `/diseno-de-paginas-web-peru`, `/tienda-online-peru`, `/pagina-web-institucional-peru`, `/pagina-web-economica-peru`.
- `lang="es-PE"`, locale es_PE, foco geográfico correcto.

### 2.2 Hallazgos críticos

| # | Hallazgo | Impacto |
|---|----------|---------|
| 1 | **DR 0 en Ahrefs** — sin backlinks relevantes | Es la causa #1 de no aparecer ni en el top 100 |
| 2 | **`/web-hosting` en producción sirve metadata del layout `(auth)`**: title "Plia", description genérica. El metadata correcto existe en `app/(public)/web-hosting/layout.tsx` pero producción no lo refleja (build desactualizado o la ruta desplegada vive en otro grupo) | La página objetivo de "hosting en Perú" no le dice a Google de qué trata |
| 3 | **Páginas huérfanas**: ni el header ni el footer enlazan a `/web-hosting` ni a las 4 landings SEO. El homepage tampoco | Google les asigna importancia mínima; PageRank interno no fluye |
| 4 | **Profundidad de contenido hosting: 1 página vs. un silo completo de la competencia.** hosting.com.pe tiene páginas dedicadas para hosting web, hosting WordPress, VPS, reseller, dominios y páginas web, con ~16 FAQs y miles de palabras solo en el home | Para Google, PLIA "no es un sitio de hosting"; es un sitio de diseño web con una página de hosting |
| 5 | **Inconsistencia de señales**: `/web-hosting` dice "4.9/5 por más de 10,000 clientes"; el homepage dice "500+ webs creadas". Testimonios sin fuente verificable | Riesgo E-E-A-T; la competencia exhibe años de operación, teléfonos fijos, datacenter, RUC |
| 6 | **Blog recién nacido** (posts fechados 6–17 junio 2026) y ningún post ataca "hosting en Perú" transaccional; solo "cuánto cuesta el hosting en Perú" (informacional) | Aún sin tiempo de maduración; Google tarda 3–6 meses en rankear contenido nuevo de dominios sin autoridad |

### 2.3 Observaciones menores (para la fase de cambios)

- El H1 del homepage ("Tu web lista, sin complicaciones") no contiene ninguna keyword; el title sí.
- `meta keywords` se usa en todo el sitio: Google la ignora desde 2009. Inofensiva, pero es esfuerzo mal dirigido.
- Covers del blog servidos desde pexels.com (dominio externo): mejor autohospedar y optimizar (WebP/AVIF, alt descriptivo).
- El JSON-LD `SearchAction` apunta a `/?q=` que no existe como búsqueda real.
- No hay página 404 personalizada visible ni breadcrumbs con schema BreadcrumbList.
- No se detectó meta de verificación de Google Search Console en el HTML (si está verificado por DNS, ignorar).
- El footer de algunas páginas omite enlaces que otras sí tienen (inconsistente).

### 2.4 Nota sobre datos

El plan actual de Ahrefs conectado solo permitió el Domain Rating gratuito (los endpoints de backlinks/keywords devolvieron "Insufficient plan"). Con acceso a Google Search Console se puede confirmar indexación e impresiones reales — es el primer dato a revisar.

---

## 3. La competencia: qué tienen ellos que PLIA no

| Competidor | DR | Qué lo sostiene en la primera página |
|---|---|---|
| hosting.com.pe | 55 | Dominio exact-match, 19 años, silo completo (WordPress/VPS/reseller/dominios), 16+ FAQs, teléfono fijo Lima, contenido masivo por página |
| hostingperu.com.pe | 52 | Exact-match, 15 años, "20 mil clientes", prueba 30 días gratis, facturación electrónica SUNAT (ángulo local único), guías para empresas |
| punto.pe | 63 | Es el registro oficial del dominio .pe — autoridad institucional (no es competidor real de venta) |
| donweb.com | 81 | Gigante latinoamericano, 20+ años, página país es-pe dedicada |
| wnpower.com | 73 | Rankea con un ARTÍCULO: "Mejor hosting de Perú 2026: comparativa" — contenido, no producto |
| godaddy.com | ~90 | Igual: rankea con un artículo listicle |
| latinoamericahosting.com.pe | 39 | Exact-match parcial, .com.pe, años de operación |
| hosting-peru.pe | 21 | Exact-match, "desde 2009", "únicos con IP en Perú" (diferenciador claro) |
| bluehosting.pe | 13 | La prueba de que NO se necesita DR alto: gana con marca, contenido segmentado (emprendedores/negocios/empresas), datacenter propio y antigüedad |

**Lecturas clave:**

1. Dos de los diez resultados son **artículos comparativos** ("mejor hosting Perú"), no páginas de venta → hay un camino por contenido y por aparecer EN esas comparativas.
2. bluehosting (DR 13) y hosting-peru.pe (DR 21) demuestran que con DR ~15–25 + contenido profundo + señales locales ya se compite. Ese es el objetivo intermedio alcanzable para PLIA en 6–12 meses.
3. Todos exhiben señales de confianza pesadas: años, clientes, datacenter, teléfonos, medios de pago locales (Yape, BCP), migración gratis. PLIA debe competir con sus diferenciadores reales: web lista en 24h + todo incluido + precio en soles + soporte directo por WhatsApp.

---

## 4. Estrategia: plan por fases (sin tocar nada todavía)

### Fase 0 — Correcciones críticas (semana 1–2) · costo casi cero, impacto alto

1. **Arreglar `/web-hosting` en producción**: que sirva el metadata del repo (title "Hosting Web en Perú con dominio y SSL incluidos"). Verificar por qué producción usa el layout `(auth)`: probablemente basta un redeploy o mover la ruta al grupo `(public)` en el build desplegado.
2. **Enlazar internamente las landings SEO**: agregar al footer una columna "Servicios" con /web-hosting, /diseno-de-paginas-web-peru, /tienda-online-peru, /pagina-web-institucional-peru, /consigue-tu-dominio. Añadir enlaces contextuales desde el homepage y desde los posts del blog relacionados.
3. **Google Search Console**: verificar propiedad, enviar sitemap, revisar cobertura de indexación e inspeccionar las URLs clave. Sin esto estamos ciegos.
4. **Unificar claims**: decidir el número real (500+ webs, no "10,000 clientes") y usarlo consistentemente. Google y los usuarios detectan la contradicción.
5. **Google Business Profile** para PLIA (Lima) + empezar a juntar reseñas reales. Señal local fuerte y gratis.

### Fase 1 — Profundidad de contenido hosting (mes 1–3)

Construir el **silo de hosting** que hoy no existe. `/web-hosting` como página pilar (expandirla: más texto útil, FAQs con schema FAQPage, tabla comparativa vs. competidores, medios de pago peruanos) y subpáginas:

- `/web-hosting/wordpress` — "Hosting WordPress en Perú" (keyword con volumen propio)
- `/web-hosting/hosting-con-dominio-gratis`
- `/web-hosting/migracion` — "migramos tu web gratis" (todos los competidores lo explotan)
- Posts de apoyo en el blog que enlacen al pilar: "Mejor hosting en Perú 2026: comparativa honesta" (así como WNPower y GoDaddy rankean con listicles, PLIA puede tener el suyo), "Hosting compartido vs VPS", "Cómo elegir hosting para tu negocio".

Regla de oro: cada post del blog debe enlazar a su landing transaccional con anchor text descriptivo ("hosting en Perú con dominio incluido"), no "clic aquí".

### Fase 2 — Autoridad y backlinks (mes 2–12, continuo) · la palanca decisiva

Con DR 0, esto es lo que más mueve la aguja:

1. **Comparativas y listicles**: outreach a WNPower, GoDaddy resources, blogs de marketing peruanos y rankings "mejor hosting Perú" para que incluyan a PLIA. Dos de los 10 resultados del top son justamente esos artículos.
2. **Prensa y PR local**: notas en medios de emprendimiento peruanos (Gestión, PQS, Emprende UP, medios de startups) con el ángulo "plataforma peruana que entrega webs en 24 horas".
3. **Directorios y ecosistema**: cámaras de comercio, directorios de empresas peruanas, perfiles en Clutch/Sortlist, comunidades de emprendedores.
4. **Clientes como fuente de enlaces**: un badge discreto "Web creada por PLIA" con enlace en el footer de las webs de clientes (con su permiso) genera decenas de backlinks .pe naturales y temáticamente relevantes. Es la ventaja estructural de PLIA que ningún competidor de hosting puro tiene.
5. **Contenido enlazable**: un estudio anual tipo "Estado de la presencia digital de las pymes peruanas" (datos propios + encuesta) es el tipo de pieza que prensa y blogs citan.
6. **Reseñas externas**: Trustpilot / Google Reviews con volumen real.

Meta: DR 15–25 en 9–12 meses (el nivel de bluehosting/hosting-peru.pe que ya compite en primera página).

### Fase 3 — Escalar y medir (mes 3–12)

- Atacar primero **long-tail alcanzable**: "hosting con dominio gratis perú", "hosting barato perú", "hosting para wordpress perú", "cuánto cuesta el hosting en perú" (este post ya existe — monitorearlo). Ganar top 10 ahí construye el historial que luego empuja "hosting en Perú".
- 2–4 posts/mes sostenidos; actualizar los existentes cada 6 meses (los títulos "2026" deben mantenerse frescos).
- Revisión mensual en GSC: impresiones, posición media, páginas indexadas, CTR. Ajustar titles con CTR bajo.
- Core Web Vitals: los videos mp4 del homepage y las animaciones pesadas merecen auditoría con PageSpeed Insights.

### Expectativas realistas

"Hosting en Perú" está dominada por dominios exact-match con 15–19 años y DR 50+. Prometer puesto 1 en 3 meses sería mentirte. Ruta razonable con ejecución disciplinada: **mes 1–3** aparecer indexado y rankear long-tail; **mes 4–6** top 20–30 en la keyword principal; **mes 6–12** top 10; **año 2** pelear top 3. El atajo real es el flanco que la competencia descuida: ellos venden hosting a gente técnica; PLIA vende "tu web lista en 24h con hosting incluido" a emprendedores. Dominar primero "página web perú" y sus variantes (donde la competencia es más débil y el intent encaja mejor con el producto) financia y acelera la batalla de hosting.

---

## 5. Quick wins priorizados

| Prioridad | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 🔴 1 | Redeploy/arreglo de metadata de `/web-hosting` en producción | Bajo | Alto |
| 🔴 2 | Enlazar landings SEO desde footer/header/homepage | Bajo | Alto |
| 🔴 3 | Verificar GSC + enviar sitemap + revisar indexación | Bajo | Alto |
| 🟠 4 | Google Business Profile + reseñas | Bajo | Medio-alto |
| 🟠 5 | Unificar claims (500+ vs 10,000) | Bajo | Medio |
| 🟠 6 | Post comparativo "Mejor hosting en Perú 2026" | Medio | Alto |
| 🟡 7 | Silo de hosting (subpáginas WordPress/migración/dominio) | Medio | Alto |
| 🟡 8 | Badge "Web creada por PLIA" en webs de clientes | Medio | Alto (largo plazo) |
| 🟡 9 | Outreach a listicles y prensa | Alto | Muy alto |

---

## 6. Cambios ejecutados (2 de julio de 2026)

**Fase 0:** noindex en layout `(auth)` (páginas privadas); columna "Servicios" en el footer con las 6 landings SEO (deja de haber páginas huérfanas); mega-menú del header ampliado con las landings; claims diferenciados: "10,000 clientes de hosting" en /web-hosting y "500+ webs" para diseño, con `hasOfferCatalog` en el Organization JSON-LD declarando ambos servicios por separado; H1 del homepage ahora "Tu página web lista en 24h" y subtítulo con "diseño de páginas web y hosting en Perú"; H1 de /web-hosting ahora "Hosting Web en Perú".

**Fase 1:** FAQPage + BreadcrumbList + Service JSON-LD en /web-hosting (movidos a `schema.ts` y renderizados desde page.tsx para no duplicarse en subpáginas); silo de hosting creado: `/web-hosting/wordpress` y `/web-hosting/migracion` (server components con metadata, FAQPage, Breadcrumb y Service schema, interlinking al pilar), ambas en el sitemap; nuevo post "Mejor hosting en Perú 2026: comparativa honesta" enlazando a todo el clúster.

**Corrección de veracidad (dominio):** los planes puros de hosting incluyen SUBDOMINIO gratis, nunca dominio propio. Se corrigió el hero ("Subdominio gratis"), la FAQ, el schema FAQPage, el title/OG del layout (antes prometía "dominio incluido") y los precios del AggregateOffer (S/16–112, antes S/19–199 desactualizado). Se agregó además una FAQ visible + en schema explicando la diferencia entre el hosting incluido en los planes web (gratis 1 año, se renueva desde el panel) y el servicio puro de hosting con su propio panel — refuerza ante Google que son servicios distintos.

**Auditoría de veracidad "dominio incluido" (completada):** PLIA no vende dominios en ningún plan — solo subdominio gratis y vinculación gratuita del dominio propio del cliente. Se corrigieron TODAS las promesas falsas de "dominio incluido/registrado/gratis" en: layout raíz (metadata + Organization schema), las 4 landings SEO (metadata, copy, FAQs visibles y schemas FAQPage/Service), /como-funciona (metadata, lista "nos encargamos de", FAQ schema), /planes (metadata + Product schema, y precios corregidos de S/19–299 a los reales S/390–690 pago único), /consigue-tu-dominio (metadata que prometía "registro con activación inmediata" siendo una página "próximamente"), el CTA global del blog, 11 pasajes en los posts del blog, y la sección 5 de los Términos y Condiciones (que afirmaba que PLIA registraba el dominio y regalaba el primer año). Mensaje unificado: "hosting, seguridad y soporte incluidos + subdominio gratis + conectamos tu dominio sin costo".

**Pendiente que requiere acción manual:** (1) **redeploy a producción** — sin esto /web-hosting sigue sirviendo el metadata viejo; (2) correr `npm run build` local antes de desplegar; (3) verificar Google Search Console y enviar sitemap; (4) Google Business Profile; (5) revisar la sección 5 de los Términos con un abogado si es posible (fue corregida para reflejar la realidad, pero es un documento legal); (6) el checkout (/checkout) tiene un buscador de dominios que sugiere "agregar dominio al pedido" — si PLIA no vende dominios, ese flujo también debería ajustarse (no lo toqué por ser funcional, no SEO).
