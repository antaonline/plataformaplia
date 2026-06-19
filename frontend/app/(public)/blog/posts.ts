/**
 * BLOG de PLIA — contenido SEO (plia.pe/blog, subdirectorio para heredar
 * autoridad del dominio). Cada post se redacta en markdown y se renderiza con
 * react-markdown. Posicionamiento: PLIA es una PLATAFORMA peruana (no "estudio"),
 * todo incluido, web lista en 24h. NO mencionar IA todavía.
 *
 * Para agregar un post: añade un objeto a POSTS. El slug forma la URL
 * plia.pe/blog/<slug> y entra automáticamente al sitemap.
 */

export interface BlogPost {
  slug: string;
  title: string;          // <title> y H1 — incluye la keyword principal
  description: string;    // meta description (CTA, ~150-160 chars)
  keywords: string[];     // keywords objetivo
  category: string;
  date: string;           // ISO
  readingMinutes: number;
  cover: string;          // imagen de portada (OG)
  content: string;        // markdown
}

export const POSTS: BlogPost[] = [
  {
    slug: 'cuanto-cuesta-una-pagina-web-en-peru',
    title: '¿Cuánto cuesta una página web en Perú? Precios reales 2026',
    description:
      'Precios reales de una página web en Perú en 2026: rangos por tipo de web, qué influye en el costo y qué debe incluir para que valga la pena. Guía clara y sin letra chica.',
    keywords: [
      'cuánto cuesta una página web en Perú',
      'precio página web Perú',
      'cuánto cuesta hacer una página web',
      'costo de una página web en Lima',
      'precio diseño web Perú',
    ],
    category: 'Precios y guías',
    date: '2026-06-17',
    readingMinutes: 7,
    cover: 'https://images.pexels.com/photos/40185/mac-freelancer-macintosh-macbook-40185.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Si estás buscando **cuánto cuesta una página web en Perú**, seguramente te topaste con precios que van desde S/ 300 hasta S/ 10,000 o más, y terminaste más confundido que al inicio. Es normal: el precio depende de qué tipo de web necesitas y, sobre todo, de **qué está incluido**. En esta guía te damos rangos reales del 2026, sin letra chica, para que sepas exactamente qué esperar.

## Rangos de precios de una página web en Perú (2026)

Estos son los rangos que se manejan hoy en el mercado peruano, según el tipo de web:

| Tipo de web | Precio referencial | Para quién |
|---|---|---|
| **Landing / página de una sola sección** | S/ 300 – S/ 900 | Negocios que quieren presencia rápida y captar contactos |
| **Página web institucional** (varias secciones) | S/ 900 – S/ 2,500 | Empresas que necesitan proyectar profesionalismo |
| **Tienda online / e-commerce** | S/ 2,000 – S/ 6,000 | Negocios que venden productos por internet |
| **Web a medida / con sistemas** | S/ 6,000 a más | Proyectos con funcionalidades especiales |

> Ojo: un precio de S/ 300 *sin* dominio, *sin* hosting y *sin* soporte casi siempre termina costando más. Lo barato sale caro cuando tienes que pagar aparte cada pieza.

## ¿Qué hace que una página web cueste más o menos?

No todas las webs valen lo mismo. Estos son los factores que mueven el precio:

- **Cantidad de páginas y secciones.** Una landing es más económica que una web institucional de 6 páginas.
- **Diseño a medida vs. plantilla.** Un diseño único cuesta más que una plantilla, pero te diferencia de la competencia.
- **Funcionalidades.** Formularios, catálogo, carrito de compras, reservas, blog, integración con WhatsApp, etc.
- **Dominio y hosting.** ¿Están incluidos o los pagas aparte cada año?
- **Soporte y mantenimiento.** ¿Te dejan solo después de entregar, o tienes a quién acudir?
- **Optimización para Google (SEO) y para celulares.** Si tu web no carga rápido ni se ve bien en el celular, no sirve.

## Lo que SÍ debe incluir tu página web

Antes de pagar, asegúrate de que el precio incluya esto. Si no, súmalo al costo real:

1. **Dominio propio** (tudominio.pe o .com).
2. **Hosting** (el alojamiento donde vive tu web) con certificado de seguridad **HTTPS**.
3. **Diseño responsive** (se ve perfecto en celular, tablet y computadora).
4. **Optimización básica para Google** para que te puedan encontrar.
5. **Formulario de contacto** y botón de **WhatsApp**.
6. **Soporte** para cambios y dudas.

## ¿Por qué en PLIA es distinto?

PLIA es una **plataforma peruana** que reúne todo lo que tu página web necesita en un solo lugar, sin que tengas que contratar dominio, hosting y soporte por separado. Tu web queda **lista en 24 horas** (48 para una web institucional), con **dominio, hosting, seguridad y soporte incluidos**, y a un precio accesible pensado para emprendedores y empresas en el Perú.

En vez de armar el rompecabezas tú mismo —comprar dominio en un sitio, hosting en otro, contratar a alguien para el diseño y a otro para el soporte— lo resolvemos completo. Eso es lo que hace que el precio final sea predecible y que no te lleves sorpresas.

## En resumen

- Una **landing** en Perú cuesta entre **S/ 300 y S/ 900**; una **web institucional**, entre **S/ 900 y S/ 2,500**; una **tienda online**, desde **S/ 2,000**.
- El precio sube según páginas, diseño a medida, funcionalidades y lo que esté incluido.
- Lo importante no es el número más bajo, sino **qué incluye**: dominio, hosting, HTTPS, responsive, SEO y soporte.

¿Quieres saber exactamente cuánto te costaría la tuya, con todo incluido? **[Mira nuestros planes](/planes)** o **[escríbenos](/contacto)** y te damos un precio claro hoy mismo.`,
  },
  {
    slug: 'necesito-pagina-web-o-redes-sociales',
    title: '¿Necesito una página web o me bastan las redes sociales?',
    description:
      '¿Página web o solo redes sociales para tu negocio en Perú? Te explicamos qué hace cada una, por qué no compiten y cuándo conviene tener tu propia web.',
    keywords: [
      'página web o redes sociales',
      'para qué sirve una página web',
      'necesito una página web para mi negocio',
      'página web para negocio Perú',
    ],
    category: 'Para tu negocio',
    date: '2026-06-16',
    readingMinutes: 5,
    cover: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `"Si ya tengo Instagram y Facebook, ¿para qué quiero una página web?" Es una de las preguntas más comunes entre negocios en el Perú. La respuesta corta: **no compiten, se complementan** — y dejar todo en redes sociales tiene riesgos que pocos te cuentan.

## Lo que las redes sociales NO te dan

Las redes son excelentes para mostrar tu día a día y conversar con tu público. Pero:

- **No son tuyas.** Si mañana bloquean tu cuenta o cambian las reglas, pierdes todo tu trabajo. Tu página web sí es tuya.
- **No apareces en Google.** Cuando alguien busca "restaurante en Miraflores" o "abogado en Lima", Google muestra **páginas web**, no perfiles de Instagram.
- **Generan menos confianza para vender.** Un negocio con web propia se ve más serio y profesional.
- **Te limitan.** No controlas el diseño, ni el orden de tu información, ni cómo te encuentran.

## Lo que tu página web SÍ te da

- **Apareces en Google** cuando te buscan (esto es enorme para conseguir clientes nuevos).
- **Profesionalismo y confianza:** dominio propio, correo corporativo, diseño a tu medida.
- **Es tu base permanente:** redes, WhatsApp y publicidad apuntan todas a tu web.
- **Vendes 24/7:** catálogo, reservas o tienda online funcionando siempre.

## La combinación ganadora

Las redes sociales **atraen** y tu página web **convierte y da confianza**. Lo ideal es tener ambas: usas redes para llegar a la gente, y tu web para que te encuentren en Google, conozcan tu oferta completa y te contacten.

## ¿Y si recién empiezo?

Aunque estés empezando, una página web sencilla ya marca diferencia: te hace encontrable en Google y te da una imagen profesional desde el día uno. En **PLIA** te dejamos tu web lista en **24 horas**, con dominio, hosting y soporte incluidos, sin que tengas que saber nada técnico.

**[Mira los planes](/planes)** y dale a tu negocio una base que sí sea tuya.`,
  },

  {
    slug: 'como-crear-una-pagina-web-para-tu-negocio-peru',
    title: 'Cómo crear una página web para tu negocio en Perú (paso a paso)',
    description:
      'Guía paso a paso para crear la página web de tu negocio en Perú: desde el dominio y el hosting hasta el diseño y aparecer en Google. Clara y sin tecnicismos.',
    keywords: [
      'cómo crear una página web',
      'cómo hacer una página web en Perú',
      'crear página web para mi negocio',
      'pasos para crear una página web',
      'hacer una página web Perú',
    ],
    category: 'Para tu negocio',
    date: '2026-06-15',
    readingMinutes: 8,
    cover: 'https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Crear una página web para tu negocio en el Perú no tiene por qué ser complicado ni carísimo. Si entiendes los pasos, sabrás qué necesitas, qué evitar y cómo tomar buenas decisiones. Aquí te explicamos **cómo crear una página web** de principio a fin, en orden y sin tecnicismos.

## Paso 1: Define el objetivo de tu web

Antes de pensar en colores o diseño, ten claro **para qué la quieres**:

- **Que te encuentren en Google** y te contacten (la mayoría de negocios).
- **Vender en línea** (necesitas una tienda online).
- **Captar clientes** con un formulario o promoción (una landing).

El objetivo define qué tipo de web necesitas y cuánto invertirás. Si quieres profundizar, lee nuestra guía de **[cuánto cuesta una página web en Perú](/blog/cuanto-cuesta-una-pagina-web-en-peru)**.

## Paso 2: Consigue un dominio

El dominio es la dirección de tu web (ej. *tunegocio.pe* o *tunegocio.com*). Es lo primero que ve tu cliente y le da seriedad a tu marca. En Perú lo más común es **.pe** o **.com**. Te contamos todo en **[cómo registrar un dominio .pe](/blog/como-registrar-un-dominio-pe-en-peru)**.

## Paso 3: Consigue un hosting

El hosting es el "terreno" donde vive tu página web para que esté disponible 24/7. Debe ser **rápido**, tener **certificado de seguridad HTTPS** y soporte. Revisa **[cuánto cuesta el hosting en Perú](/blog/cuanto-cuesta-el-hosting-en-peru)**.

## Paso 4: Diseña y arma el contenido

Aquí defines cómo se verá y qué dirá tu web. Lo esencial:

- **Inicio** con una frase clara de lo que ofreces y un botón de contacto.
- **Servicios o productos** con descripciones reales (nada de "Lorem ipsum").
- **Nosotros** para generar confianza.
- **Contacto** con teléfono, WhatsApp, dirección y un formulario.
- Fotos de buena calidad (las tuyas o de stock).

El diseño debe verse **perfecto en el celular** (la mayoría de peruanos navega desde el teléfono).

## Paso 5: Optimiza para Google y para celulares

De nada sirve una web bonita si nadie la encuentra. Lo mínimo:

- Que cargue **rápido**.
- Que sea **responsive** (se adapte a cualquier pantalla).
- Títulos y textos pensados para lo que la gente busca en Google.
- Certificado **HTTPS**.

## Paso 6: Publica y dale mantenimiento

Publicas tu web, la conectas a tu dominio y la mantienes actualizada. Tener a quién acudir para cambios o dudas es clave para no quedarte varado.

## El atajo: hacerlo todo en un solo lugar

Hacer cada paso por separado —dominio en un sitio, hosting en otro, contratar a alguien para el diseño y a otro para el soporte— es lento y termina costando más. Por eso existe **PLIA**: una **plataforma peruana** donde reúnes todo en uno. Nos cuentas de tu negocio y te entregamos la web **lista en 24 horas** (48 para una web institucional), con **dominio, hosting, seguridad y soporte incluidos**.

Tú te enfocas en tu negocio; nosotros nos encargamos de toda la parte técnica.

## En resumen

Para crear tu página web necesitas: **objetivo claro → dominio → hosting → diseño y contenido → optimización → publicación y mantenimiento.** Puedes armarlo pieza por pieza, o resolverlo completo en un solo lugar.

¿Quieres tu web lista esta semana, con todo incluido? **[Mira los planes](/planes)** o **[escríbenos](/contacto)**.`,
  },

  {
    slug: 'como-registrar-un-dominio-pe-en-peru',
    title: 'Cómo registrar un dominio .pe en Perú (y cuánto cuesta)',
    description:
      'Qué es un dominio .pe, cuánto cuesta, las diferencias entre .pe, .com.pe y .com, y cómo registrar el tuyo paso a paso sin errores. Guía clara para Perú.',
    keywords: [
      'dominio .pe',
      'cómo registrar un dominio .pe',
      'cuánto cuesta un dominio .pe',
      'comprar dominio Perú',
      'registrar dominio Perú',
    ],
    category: 'Hosting y dominios',
    date: '2026-06-14',
    readingMinutes: 6,
    cover: 'https://images.pexels.com/photos/7662061/pexels-photo-7662061.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `El **dominio** es la dirección de tu página web (por ejemplo, *tunegocio.pe*). Es tu nombre en internet y lo primero que ve un cliente, así que elegirlo y registrarlo bien importa. Aquí te explicamos qué es un **dominio .pe**, cuánto cuesta y cómo registrarlo.

## ¿Qué es un dominio y por qué necesitas uno propio?

Un dominio propio (*tunegocio.pe*) te da **seriedad y confianza**, te permite tener **correo corporativo** (contacto@tunegocio.pe) y hace que te recuerden. Tener tu web solo en redes sociales o con una dirección genérica resta profesionalismo.

## .pe, .com.pe o .com: ¿cuál elegir?

| Extensión | Ideal para | Señal que da |
|---|---|---|
| **.pe** | Negocios peruanos modernos | Corto, peruano y fácil de recordar |
| **.com.pe** | Empresas peruanas formales | Tradicional, empresarial |
| **.com** | Marcas con mira internacional | Universal, el más conocido |

Para la mayoría de negocios en Perú, **.pe** es una excelente opción: es corto, claro y deja ver que eres peruano. Si tu marca apunta al extranjero, considera también el **.com**.

## ¿Cuánto cuesta un dominio .pe?

Un dominio **.pe** suele costar entre **S/ 60 y S/ 130 al año** (referencial), según dónde lo registres. Es un pago **anual** que debes renovar para no perderlo. Ojo: el dominio es solo la dirección; aparte necesitas el **[hosting](/blog/cuanto-cuesta-el-hosting-en-peru)** donde vive la web.

## Cómo registrar tu dominio .pe (paso a paso)

1. **Piensa el nombre.** Corto, fácil de escribir y de recordar. Evita guiones y números confusos.
2. **Verifica que esté disponible.** Si ya lo tiene alguien, prueba variantes.
3. **Regístralo** con tus datos (como titular, el dominio queda a tu nombre).
4. **Apúntalo a tu hosting** (configurar los DNS). Este paso es técnico; si no sabes, que lo haga tu proveedor.
5. **Activa la renovación automática** para no perderlo por olvido.

## Errores comunes que debes evitar

- **Registrar el dominio a nombre de un tercero** (que sea tuyo, siempre).
- **Olvidar renovarlo** y perderlo (alguien más podría tomarlo).
- Elegir un nombre largo o difícil de dictar por teléfono.

## La forma fácil: que venga incluido

En **PLIA** no tienes que pelearte con DNS ni registrar el dominio por tu cuenta. Al crear tu página con nosotros, el **dominio viene incluido y configurado**, junto con el hosting, la seguridad y el soporte. Te entregamos todo listo y funcionando.

¿Quieres asegurar el nombre de tu negocio en internet? **[Consigue tu dominio aquí](/consigue-tu-dominio)** o **[mira los planes](/planes)** con dominio incluido.`,
  },

  {
    slug: 'cuanto-cuesta-el-hosting-en-peru',
    title: '¿Cuánto cuesta el hosting en Perú? Precios y qué debe incluir',
    description:
      'Precios del hosting en Perú en 2026, tipos de hosting (compartido, cloud, VPS), qué debe incluir y cómo elegir uno rápido y seguro para tu página web.',
    keywords: [
      'cuánto cuesta el hosting en Perú',
      'hosting Perú precio',
      'precio hosting Perú',
      'cloud hosting Perú',
      'mejor hosting Perú',
    ],
    category: 'Hosting y dominios',
    date: '2026-06-13',
    readingMinutes: 6,
    cover: 'https://images.pexels.com/photos/37730212/pexels-photo-37730212.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `El **hosting** es el servicio que mantiene tu página web disponible en internet las 24 horas. Sin hosting, tu web simplemente no existe en línea. Aquí te explicamos **cuánto cuesta el hosting en Perú**, los tipos que hay y qué debe incluir uno bueno.

## ¿Qué es el hosting (en simple)?

Imagina que tu página web es una tienda: el **dominio** es la dirección y el **hosting** es el local donde está montada. Si el hosting es lento o se cae, tus clientes ven una web lenta o caída — y se van.

## Tipos de hosting y para qué sirve cada uno

| Tipo | Para quién | Característica |
|---|---|---|
| **Compartido** | Negocios y webs que empiezan | Económico; el servidor se comparte con otras webs |
| **Cloud** | Negocios que quieren velocidad y estabilidad | Recursos flexibles, más rápido y confiable |
| **VPS / Dedicado** | Proyectos grandes o con mucho tráfico | Más potencia y control, mayor costo |

Para la mayoría de negocios en Perú, un **hosting compartido o cloud de calidad** es más que suficiente.

## ¿Cuánto cuesta el hosting en Perú?

Estos son rangos referenciales por año en el mercado peruano (2026):

| Tipo de hosting | Precio referencial (al año) |
|---|---|
| **Compartido** | S/ 120 – S/ 350 |
| **Cloud** | S/ 350 – S/ 900 |
| **VPS** | S/ 900 a más |

El precio varía según la **velocidad**, el **espacio**, el **soporte** y si incluye **certificado HTTPS** y **copias de seguridad**.

## Qué debe incluir un buen hosting

Antes de contratar, asegúrate de que tenga:

- **Certificado de seguridad HTTPS** (el candadito) incluido.
- **Buena velocidad de carga** (Google premia las webs rápidas).
- **Copias de seguridad** automáticas.
- **Soporte** en español y a quién acudir si algo falla.
- **Buen tiempo de actividad** (que no se caiga).

## Lo más simple: hosting incluido y sin preocupaciones

Contratar hosting por separado significa configurarlo, renovarlo y resolver tú los problemas técnicos. En **PLIA** te lo damos **incluido** con tu página web: hosting **rápido y seguro**, con HTTPS, copias de seguridad y **soporte**, sin que tengas que administrar nada. Tu web vuela y tú no te preocupas por la parte técnica.

¿Quieres tu página web con hosting, dominio y soporte ya incluidos? **[Mira los planes](/planes)** o conoce nuestro **[Web Hosting](/web-hosting)**.`,
  },

  {
    slug: 'tienda-online-en-peru-como-empezar-a-vender',
    title: 'Tienda online en Perú: cómo empezar a vender por internet',
    description:
      'Cómo crear una tienda online en Perú y empezar a vender por internet: qué necesitas, métodos de pago, envíos y los errores que debes evitar. Guía clara 2026.',
    keywords: [
      'tienda online Perú',
      'cómo crear una tienda virtual',
      'ecommerce Lima',
      'vender por internet Perú',
      'tienda virtual Perú',
    ],
    category: 'Vender online',
    date: '2026-06-12',
    readingMinutes: 7,
    cover: 'https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600',
    content: `Vender por internet dejó de ser opcional para muchos negocios en el Perú. Una **tienda online** te permite vender 24/7, llegar a más clientes y no depender solo del local físico o de un mensaje por redes. Aquí te explicamos **cómo empezar tu tienda online** y qué necesitas de verdad.

## ¿Qué es una tienda online y en qué se diferencia de una web normal?

Una página web normal **muestra** tu negocio; una **tienda online (e-commerce)** además permite **comprar**: catálogo de productos, carrito, métodos de pago y gestión de pedidos. Si tu objetivo es vender productos por internet, necesitas una tienda, no solo una web.

## Qué necesitas para tu tienda online

- **Catálogo de productos** con fotos, precios y descripciones claras.
- **Métodos de pago** (Yape, Plin, tarjetas, transferencia, pago contra entrega).
- **Envíos** definidos (zonas, costos, couriers).
- **Página rápida y para celular** (la mayoría compra desde el teléfono).
- **WhatsApp** para resolver dudas y cerrar ventas.

## Cómo empezar, paso a paso

1. **Elige qué vender y organiza tu catálogo** (categorías claras).
2. **Consigue dominio y hosting** — repasa **[cómo registrar un dominio .pe](/blog/como-registrar-un-dominio-pe-en-peru)**.
3. **Arma la tienda**: producto, carrito, pago y envíos.
4. **Configura los pagos** que usan tus clientes en Perú.
5. **Publica y promociona** (redes, WhatsApp, publicidad apuntando a tu tienda).

## Errores comunes que cuestan ventas

- **Fotos malas o sin precios** → el cliente no compra lo que no ve claro.
- **Proceso de pago complicado** → si es difícil, abandonan el carrito.
- **No verse bien en el celular** → pierdes a la mayoría.
- **No tener WhatsApp visible** → muchas ventas se cierran por chat.

## La forma simple: tu tienda lista y con todo incluido

Montar una tienda online por tu cuenta toma tiempo y conocimientos técnicos. En **PLIA** te entregamos tu **tienda online lista para vender**, con dominio, hosting, seguridad y soporte incluidos, y pensada para el comprador peruano (pagos locales, WhatsApp y diseño para celular). Tú subes tus productos; nosotros resolvemos la parte técnica.

¿Listo para vender por internet? Conoce nuestro **[Ecommerce](/ecommerce)** o **[mira los planes](/planes)**.`,
  },

  {
    slug: 'posicionamiento-web-seo-en-peru-guia',
    title: 'Posicionamiento web (SEO) en Perú: guía para aparecer en Google',
    description:
      'Qué es el posicionamiento web (SEO), por qué tu negocio lo necesita y cómo empezar a aparecer en Google en Perú. Guía clara, sin tecnicismos, para 2026.',
    keywords: [
      'posicionamiento web Perú',
      'SEO Perú',
      'cómo aparecer en Google',
      'posicionamiento en Google Perú',
      'SEO para negocios',
    ],
    category: 'SEO y marketing',
    date: '2026-06-11',
    readingMinutes: 7,
    cover: 'https://images.pexels.com/photos/577195/pexels-photo-577195.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Tener una página web es el primer paso; que la **encuentren en Google** es lo que te trae clientes. A eso se le llama **posicionamiento web** o **SEO** (del inglés *Search Engine Optimization*). Aquí te explicamos qué es y cómo empezar, en simple.

## ¿Qué es el SEO y por qué importa?

El SEO es el conjunto de acciones para que tu web aparezca **arriba en Google** cuando alguien busca lo que ofreces (ej. "restaurante en Miraflores" o "abogado en Lima"). La mayoría de la gente **solo hace clic en los primeros resultados**, así que aparecer arriba = más clientes, sin pagar por cada clic.

## Los 4 pilares del posicionamiento

1. **Contenido relevante.** Tu web debe responder lo que la gente busca, con textos claros y útiles (no solo "somos los mejores").
2. **SEO técnico.** Que cargue **rápido**, se vea bien en **celular** y tenga **HTTPS**. Google premia las webs rápidas y seguras.
3. **Autoridad.** Que otras webs te mencionen o enlacen, y tener buenas **reseñas**.
4. **SEO local.** Para negocios en Perú: tu **ficha de Google (Google Business)**, tu dirección, teléfono y reseñas son clave para aparecer en búsquedas con "Lima" o "Perú".

## Cómo empezar (lo básico que sí mueve la aguja)

- **Crea tu ficha de Google Business** y pide reseñas a tus clientes.
- **Asegúrate de que tu web sea rápida y para celular.**
- **Escribe textos pensados en lo que buscan tus clientes**, no en jerga interna.
- **Usa títulos claros** con la palabra clave + tu ciudad.
- **Sé constante:** el SEO da resultados en **meses**, no en días. Pero es tráfico que no pagas por clic.

## SEO vs publicidad pagada

| | SEO | Publicidad (Ads) |
|---|---|---|
| Costo | Esfuerzo/tiempo, no pagas por clic | Pagas por cada clic |
| Resultados | A mediano plazo, **duraderos** | Inmediatos, se acaban al dejar de pagar |
| Confianza | Alta (resultados "naturales") | Media (la gente sabe que es anuncio) |

Lo ideal es combinarlos: Ads para resultados rápidos y SEO para construir tráfico sostenible.

## Tu web ya nace optimizada con PLIA

En **PLIA** entregamos páginas **rápidas, seguras (HTTPS) y optimizadas para celular y para Google** desde el día uno — la base técnica del SEO ya viene resuelta. Tú te enfocas en tu negocio y en pedir reseñas; nosotros nos encargamos de que tu web esté lista para posicionar.

¿Quieres una web que sí esté lista para Google? **[Mira los planes](/planes)** o **[escríbenos](/contacto)**.`,
  },

  {
    slug: 'pagina-web-para-empresas-web-institucional',
    title: 'Página web para empresas: qué debe tener una web institucional',
    description:
      'Qué es una web institucional, qué secciones debe tener una página web para empresas y por qué proyecta confianza y profesionalismo. Guía para empresas en Perú.',
    keywords: [
      'página web para empresas',
      'web institucional Perú',
      'página web institucional',
      'diseño web empresarial',
      'página web para empresa',
    ],
    category: 'Para tu negocio',
    date: '2026-06-10',
    readingMinutes: 6,
    cover: 'https://images.pexels.com/photos/7698712/pexels-photo-7698712.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Si tu empresa quiere proyectar **seriedad y confianza**, una **página web institucional** es casi obligatoria. Es tu carta de presentación profesional, disponible 24/7 para clientes, socios y proveedores. Aquí te explicamos qué debe tener una buena **página web para empresas**.

## ¿Qué es una web institucional?

Es una página web de **varias secciones** pensada para presentar a tu empresa de forma completa y profesional: quiénes son, qué hacen, sus servicios y cómo contactarlos. A diferencia de una landing (una sola página enfocada en una acción), la web institucional cuenta toda la historia de tu empresa.

## Las secciones que no pueden faltar

- **Inicio:** propuesta de valor clara y una primera impresión profesional.
- **Nosotros:** historia, misión, visión y valores (genera confianza).
- **Servicios o productos:** detallados, con beneficios reales.
- **Casos / clientes / testimonios:** prueba de que cumples.
- **Contacto:** formulario, teléfono, WhatsApp, correo corporativo y ubicación con mapa.
- *Opcional:* equipo, certificaciones, blog y trabajos realizados.

## Por qué tu empresa la necesita

- **Confianza:** una empresa con web propia se ve más seria que una que solo tiene redes.
- **Te encuentran en Google** cuando buscan tus servicios.
- **Correo corporativo** (contacto@tuempresa.pe) y mejor imagen de marca.
- **Está disponible siempre**, aunque tu oficina esté cerrada.

## ¿Cuándo conviene una web institucional (y no solo una landing)?

Si ofreces **varios servicios**, quieres **proyectar trayectoria** o trabajas con **empresas y licitaciones**, necesitas una institucional. Si solo quieres captar contactos para una promoción puntual, una **[landing](/blog/cuanto-cuesta-una-pagina-web-en-peru)** puede bastar.

## Tu web institucional lista en 48 horas

Con **PLIA**, el **Plan Web Institucional** te entrega hasta varias páginas profesionales **listas en 48 horas**, con dominio, hosting, seguridad y soporte incluidos. Nos cuentas de tu empresa y nosotros armamos una web a la altura de tu marca, sin que tengas que preocuparte por nada técnico.

¿Quieres proyectar el profesionalismo que tu empresa merece? **[Mira los planes](/planes)** o **[escríbenos](/contacto)**.`,
  },

  {
    slug: 'pagina-web-economica-en-peru',
    title: 'Página web económica en Perú: opciones reales y qué esperar',
    description:
      'Cuánto cuesta una página web económica en Perú, qué esperar (y qué no) por ese precio, y cómo evitar que lo barato salga caro. Guía honesta para 2026.',
    keywords: [
      'página web económica Perú',
      'página web barata Perú',
      'página web desde S/',
      'web económica para negocio',
      'página web accesible Perú',
    ],
    category: 'Precios y guías',
    date: '2026-06-09',
    readingMinutes: 5,
    cover: 'https://images.pexels.com/photos/7857557/pexels-photo-7857557.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `No necesitas gastar miles de soles para tener una buena página web. Sí existen opciones **económicas** en el Perú, pero hay que saber qué esperar para que el precio bajo no se convierta en un dolor de cabeza. Aquí te lo explicamos con honestidad.

## ¿Qué significa "económica" sin que sea mala?

Una página web económica bien hecha cubre lo esencial: se ve profesional, carga rápido, funciona en el celular y te permite que te encuentren y te contacten. Lo económico **no debería significar** mala calidad — significa enfocarse en lo que tu negocio realmente necesita, sin pagar de más por cosas que no usarás.

## Qué SÍ debes esperar por un precio accesible

- Una **landing** o web sencilla con diseño profesional.
- **Dominio y hosting** (idealmente incluidos).
- **Certificado HTTPS** y diseño para celular.
- **Formulario de contacto** y botón de WhatsApp.

## Cuidado: cuando lo barato sale caro

Un precio sospechosamente bajo a veces esconde costos ocultos:

- Te cobran el **dominio y el hosting aparte** cada año.
- **Sin soporte:** si algo falla, estás solo.
- Diseño con plantilla genérica **sin personalizar** a tu marca.
- Web lenta o que **no se ve bien en el celular**.

Antes de pagar, pregunta siempre **qué está incluido**. Una web de S/ 300 "pelada" puede terminar costando más que una de S/ 700 con todo incluido. Si quieres los rangos completos, lee **[cuánto cuesta una página web en Perú](/blog/cuanto-cuesta-una-pagina-web-en-peru)**.

## Económica y completa: lo mejor de ambos

En **PLIA** creemos que una web accesible no debe sacrificar calidad. Por eso entregamos páginas profesionales a **precio accesible y con todo incluido** —dominio, hosting, seguridad y soporte— listas en 24 horas. Sin sorpresas ni costos ocultos.

¿Quieres una web económica pero bien hecha? **[Mira los planes](/planes)**.`,
  },

  {
    slug: 'plantilla-vs-pagina-web-a-medida',
    title: 'Plantilla vs página web a medida: ¿cuál le conviene a tu negocio?',
    description:
      'Diferencias entre una página web con plantilla y una a medida: ventajas, desventajas, precios y cuándo conviene cada una para tu negocio en Perú.',
    keywords: [
      'plantilla vs página web a medida',
      'página web a medida',
      'plantilla web',
      'diseño web personalizado',
      'página web personalizada Perú',
    ],
    category: 'Para tu negocio',
    date: '2026-06-08',
    readingMinutes: 5,
    cover: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Cuando vas a crear tu página web, te vas a topar con dos caminos: usar una **plantilla** o hacer un diseño **a medida**. Ninguno es "malo"; depende de tu negocio, tu presupuesto y tus objetivos. Te ayudamos a decidir.

## ¿Qué es cada una?

- **Plantilla:** un diseño predefinido que se adapta con tu contenido, colores y logo. Más rápido y económico.
- **A medida:** un diseño creado desde cero, único para tu marca. Más flexible y diferenciador, pero más caro y lento.

## Comparación rápida

| | Plantilla | A medida |
|---|---|---|
| Precio | Más económico | Más alto |
| Tiempo | Rápido | Más lento |
| Personalización | Limitada | Total |
| Te diferencia | Menos | Mucho |
| Ideal para | Empezar, presupuesto ajustado | Marcas que buscan distinguirse |

## Cuándo conviene una plantilla

- Estás **empezando** y quieres presencia profesional ya.
- Tienes **presupuesto ajustado**.
- Tu negocio es similar a otros y una buena base te basta.

## Cuándo conviene a medida

- Quieres una **marca que se distinga** de la competencia.
- Tienes **necesidades específicas** (funcionalidades, integraciones).
- La web es central para tu negocio y vale la inversión.

## El punto medio inteligente

La buena noticia: hoy no tienes que elegir entre "plantilla genérica" y "a medida carísimo". En **PLIA** partimos de bases profesionales y las **adaptamos a tu marca** (colores, contenido real, estructura según tu rubro), para que tu web se vea única sin el costo ni la espera de un proyecto a medida desde cero. Lista en 24 horas, con todo incluido.

¿Quieres una web que se vea hecha para ti? **[Mira los planes](/planes)** o **[escríbenos](/contacto)**.`,
  },

  {
    slug: 'mejores-opciones-para-hacer-tu-pagina-web-peru',
    title: 'Las mejores opciones para hacer tu página web en Perú (2026)',
    description:
      'Constructor por tu cuenta, freelance, agencia o plataforma todo-en-uno: comparamos las formas de hacer tu página web en Perú, con ventajas y desventajas de cada una.',
    keywords: [
      'mejores opciones página web Perú',
      'cómo hacer una página web',
      'formas de hacer una página web',
      'dónde hacer mi página web Perú',
      'empresa de diseño web Perú',
    ],
    category: 'Precios y guías',
    date: '2026-06-07',
    readingMinutes: 7,
    cover: 'https://images.pexels.com/photos/7190932/pexels-photo-7190932.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Existen varias formas de hacer tu página web en el Perú, y cada una tiene sus ventajas. La mejor para ti depende de tu tiempo, tu presupuesto y qué tan técnico te sientas. Comparamos las 4 opciones principales para que decidas con claridad.

## Opción 1: Hacerla tú mismo con un constructor

Plataformas de "arrastrar y soltar" donde armas la web por tu cuenta.

- **A favor:** lo más económico, control total.
- **En contra:** te toma **mucho tiempo**, la curva de aprendizaje es real y suele quedar genérica. Además, dominio, hosting y soporte corren por tu cuenta.

## Opción 2: Contratar a un freelance

Un diseñador o programador independiente hace tu web.

- **A favor:** trato directo, puede ser flexible.
- **En contra:** la **calidad varía** mucho, los plazos a veces se alargan, y si desaparece te quedas sin soporte. El dominio y hosting suelen ir aparte.

## Opción 3: Contratar una agencia

Un equipo se encarga de todo el proyecto.

- **A favor:** resultado profesional y a medida.
- **En contra:** suele ser **lo más caro** y lento; ideal para proyectos grandes, no siempre para un negocio que recién empieza.

## Opción 4: Una plataforma todo-en-uno

Un servicio que reúne diseño, dominio, hosting y soporte en un solo lugar.

- **A favor:** **rápido, con todo incluido y precio claro**; no tienes que coordinar varias partes ni saber nada técnico.
- **En contra:** menos personalización extrema que una agencia (pero suficiente para la mayoría de negocios).

## ¿Cuál elegir?

| Si buscas… | Opción recomendada |
|---|---|
| Lo más barato y tienes tiempo | Constructor por tu cuenta |
| Trato directo y presupuesto medio | Freelance |
| Proyecto grande y a medida | Agencia |
| Rápido, todo incluido y sin complicarte | **Plataforma todo-en-uno** |

## Por qué PLIA encaja para la mayoría de negocios

**PLIA** es una **plataforma peruana todo-en-uno**: nos cuentas de tu negocio y te entregamos la web **lista en 24 horas** (48 para institucional), con **dominio, hosting, seguridad y soporte incluidos**, adaptada a tu marca. Sin coordinar tres proveedores ni aprender nada técnico.

¿Quieres la forma más simple y rápida? **[Mira los planes](/planes)** o **[escríbenos](/contacto)**.`,
  },

  {
    slug: 'checklist-pagina-web-debe-tener-para-vender',
    title: 'Checklist: 10 cosas que tu página web debe tener para vender',
    description:
      'La checklist definitiva de lo que tu página web debe tener para verse profesional y vender: dominio, HTTPS, velocidad, WhatsApp, SEO y más. Revisa la tuya.',
    keywords: [
      'qué debe tener una página web',
      'qué incluye una página web profesional',
      'checklist página web',
      'página web que vende',
      'elementos de una página web',
    ],
    category: 'Para tu negocio',
    date: '2026-06-06',
    readingMinutes: 6,
    cover: 'https://images.pexels.com/photos/131979/pexels-photo-131979.jpeg?auto=compress&cs=tinysrgb&w=1600',
    content: `Tener una página web no basta: tiene que estar bien hecha para **generar confianza y vender**. Usa esta checklist para revisar la tuya (o para saber qué exigir antes de pagar por una).

## La checklist de 10 puntos

1. **Dominio propio.** Una dirección como *tunegocio.pe* — no una genérica. Da seriedad. (Repasa **[cómo registrar un dominio .pe](/blog/como-registrar-un-dominio-pe-en-peru)**.)
2. **Certificado de seguridad HTTPS.** El candadito en el navegador. Sin él, Google y los clientes desconfían.
3. **Se ve perfecta en el celular** (responsive). La mayoría de peruanos navega desde el teléfono.
4. **Carga rápido.** Si tarda más de 3 segundos, pierdes visitantes. Google también premia la velocidad.
5. **Propuesta de valor clara** en los primeros segundos: qué ofreces y por qué elegirte.
6. **Botón de acción (CTA) visible:** "Cotiza", "Reserva", "Compra", "Contáctanos".
7. **WhatsApp a un clic.** En Perú, muchas ventas se cierran por chat.
8. **Contenido real y específico.** Nada de "Lorem ipsum" ni textos genéricos: habla de tu negocio.
9. **Prueba social:** testimonios, reseñas, casos o logos de clientes. Genera confianza.
10. **Optimización básica para Google (SEO)** para que te encuentren cuando te buscan. (Lee **[posicionamiento web en Perú](/blog/posicionamiento-web-seo-en-peru-guia)**.)

## Bonus: lo que la hace aún mejor

- **Correo corporativo** (contacto@tunegocio.pe).
- **Mapa de ubicación** si tienes local.
- **Soporte** para cambios y dudas.

## ¿Tu web cumple? Si no, nosotros la dejamos lista

Si revisaste la lista y a tu web le faltan puntos, no te preocupes. En **PLIA** entregamos páginas que **ya cumplen toda esta checklist** desde el día uno: dominio, HTTPS, velocidad, responsive, WhatsApp, SEO básico y soporte — todo incluido y listo en 24 horas.

¿Quieres una web que cumpla todo y venda? **[Mira los planes](/planes)** o **[escríbenos](/contacto)**.`,
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
