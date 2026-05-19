export interface SofubiPiece {
  id: string;
  nombre: string;
  origen: string;
  precio: number;
  precioFormateado: string;
  edicionLimitada: boolean;
  unidadesDisponibles?: number;
  descripcion: string;
  artista: string;
  año: number;
  categoria: string;
  imagen: string;
  imagenAlt: string;
}

export const collection: SofubiPiece[] = [
  {
    id: "zl-001",
    nombre: "Oni Kuroi Ryū",
    origen: "Tokio, Japón",
    precio: 1850,
    precioFormateado: "S/ 1,850",
    edicionLimitada: true,
    unidadesDisponibles: 3,
    descripcion:
      "Figura de vinilo sofubi de edición ultra limitada inspirada en el dragón negro del folclore japonés. Moldeada a mano en Nakano, Tokio, por el maestro artesano Kenji Mori. Acabado en negro lacado con detalles nacarados y ojos de resina epoxi carmesí. Pieza de colección certificada con número de serie grabado en la base.",
    artista: "Kenji Mori",
    año: 2023,
    categoria: "Dragones y Criaturas Míticas",
    imagen: "https://images.pexels.com/photos/16075339/pexels-photo-16075339.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Oni Kuroi Ryū - Figura sofubi dragón negro de Tokio",
  },
  {
    id: "zl-002",
    nombre: "Kaiju Akane Umi",
    origen: "Osaka, Japón",
    precio: 2400,
    precioFormateado: "S/ 2,400",
    edicionLimitada: true,
    unidadesDisponibles: 2,
    descripcion:
      "Imponente kaiju de vinilo sofubi inspirado en las criaturas del mar profundo japonés. Creado por el colectivo Osaka Kaiju Lab en una tirada de solo 12 unidades mundiales. Colorway en degradado carmesí y azul abismo con detalles dorados en escamas. Incluye certificado de autenticidad firmado y caja de madera lacada.",
    artista: "Osaka Kaiju Lab",
    año: 2024,
    categoria: "Kaiju Clásico",
    imagen: "https://images.pexels.com/photos/11829409/pexels-photo-11829409.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Kaiju Akane Umi - Figura sofubi kaiju de Osaka",
  },
  {
    id: "zl-003",
    nombre: "Gargantua Retro 1984",
    origen: "Yokohama, Japón",
    precio: 4200,
    precioFormateado: "S/ 4,200",
    edicionLimitada: true,
    unidadesDisponibles: 1,
    descripcion:
      "Pieza vintage original de 1984 del fabricante Marusan Toys, uno de los pioneros del sofubi japonés. Kaiju de gran formato (42cm) con colorway naranja y verde característico de la era Showa. Conservado en estado near-mint con caja original parcial. Una reliquia auténtica del coleccionismo sofubi de los años 80, prácticamente imposible de encontrar.",
    artista: "Marusan Toys (vintage 1984)",
    año: 1984,
    categoria: "Kaiju Vintage 80s",
    imagen: "https://images.pexels.com/photos/34573694/pexels-photo-34573694.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Gargantua Retro 1984 - Kaiju sofubi vintage Marusan Toys",
  },
  {
    id: "zl-004",
    nombre: "Bullmark Zandolla Showa",
    origen: "Tokio, Japón",
    precio: 3600,
    precioFormateado: "S/ 3,600",
    edicionLimitada: true,
    unidadesDisponibles: 1,
    descripcion:
      "Figura original de Bullmark de finales de los 70s-80s, el fabricante legendario que definió la estética kaiju sofubi de la era Showa. Vinilo de 28cm con el característico colorway azul metalizado y detalles pintados a mano de época. Pieza de museo con desgaste natural de colección. Incluye documentación de procedencia y certificado de autenticidad del coleccionista anterior.",
    artista: "Bullmark (vintage ~1979)",
    año: 1979,
    categoria: "Kaiju Vintage 80s",
    imagen: "https://images.pexels.com/photos/25067981/pexels-photo-25067981.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Bullmark Zandolla Showa - Kaiju sofubi vintage era Showa",
  },
  {
    id: "zl-005",
    nombre: "Samurai Mugen",
    origen: "Sapporo, Japón",
    precio: 3200,
    precioFormateado: "S/ 3,200",
    edicionLimitada: true,
    unidadesDisponibles: 1,
    descripcion:
      "La pieza más exclusiva de nuestra colección actual. Samurai Mugen es una figura sofubi de gran formato (45cm) creada por el legendario artista Hiroshi Nakamura en una tirada de solo 5 unidades mundiales. Armadura detallada con 47 piezas de vinilo ensambladas a mano, katana intercambiable y peana de madera de cerezo. La cima del coleccionismo sofubi contemporáneo.",
    artista: "Hiroshi Nakamura",
    año: 2024,
    categoria: "Guerreros y Samurai",
    imagen: "https://images.pexels.com/photos/27573828/pexels-photo-27573828.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Samurai Mugen - Figura sofubi samurai premium de Sapporo",
  },
  {
    id: "zl-006",
    nombre: "Longwei Bahuang",
    origen: "Shanghái, China",
    precio: 1680,
    precioFormateado: "S/ 1,680",
    edicionLimitada: true,
    unidadesDisponibles: 4,
    descripcion:
      "Dragón imperial chino de ocho desolaciones, producido por el colectivo de arte sofubi shanghainés Dragon Vinyl Collective. Esta figura de 32cm fusiona la tradición del dragón celestial chino con la estética sofubi japonesa en un colorway rojo imperial, dorado y jade. Tirada de 18 unidades con sello de autenticidad en tinta de lacre rojo.",
    artista: "Dragon Vinyl Collective",
    año: 2024,
    categoria: "Sofubi Chino Contemporáneo",
    imagen: "https://images.pexels.com/photos/16075339/pexels-photo-16075339.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Longwei Bahuang - Figura sofubi dragón imperial chino de Shanghái",
  },
  {
    id: "zl-007",
    nombre: "Nian Guai Chunxi",
    origen: "Pekín, China",
    precio: 1290,
    precioFormateado: "S/ 1,290",
    edicionLimitada: true,
    unidadesDisponibles: 5,
    descripcion:
      "El Nian, bestia mítica del folclore chino que emerge cada año nuevo, reinterpretado en sofubi premium por el estudio independiente Beijing Toy Art Studio. Figura de 26cm en colorway carmesí y negro con detalles en oro y ojos de cristal artesanal. Edición especial Año Nuevo Chino con caja conmemorativa de seda bordada. Solo 25 unidades numeradas a nivel mundial.",
    artista: "Beijing Toy Art Studio",
    año: 2024,
    categoria: "Sofubi Chino Contemporáneo",
    imagen: "https://images.pexels.com/photos/30281354/pexels-photo-30281354.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Nian Guai Chunxi - Figura sofubi bestia Nian de Pekín",
  },
  {
    id: "zl-008",
    nombre: "Oni Beni Tsuno",
    origen: "Tokio, Japón",
    precio: 1150,
    precioFormateado: "S/ 1,150",
    edicionLimitada: true,
    unidadesDisponibles: 5,
    descripcion:
      "Oni de cuernos carmesí, el demonio guardián de las puertas del inframundo japonés. Esta figura sofubi de 28cm fue esculpida por el dúo artístico Akuma Studio en el barrio de Shimokitazawa, Tokio. Acabado en rojo profundo con cuernos dorados, tatuajes tribales pintados a mano y expresión feroz inconfundible. Tirada de 30 unidades con número grabado en la planta del pie.",
    artista: "Akuma Studio",
    año: 2023,
    categoria: "Oni y Demonios",
    imagen: "https://images.pexels.com/photos/2186980/pexels-photo-2186980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Oni Beni Tsuno - Figura sofubi oni carmesí de Tokio",
  },
  {
    id: "zl-009",
    nombre: "Kappa Neo Midori",
    origen: "Kyoto, Japón",
    precio: 890,
    precioFormateado: "S/ 890",
    edicionLimitada: false,
    descripcion:
      "El espíritu acuático kappa reinterpretado en clave neo-kaiju por el artista emergente Sota Yamashiro, referente de la nueva escena sofubi independiente de Kyoto. Figura de 22cm en vinilo verde esmeralda con detalles turquesa y plato de agua pintado en plata. Sota fusiona la iconografía yokai tradicional con influencias del arte urbano contemporáneo. Disponibilidad continua, numerada por lotes.",
    artista: "Sota Yamashiro",
    año: 2024,
    categoria: "Yokai y Espíritus",
    imagen: "https://images.pexels.com/photos/33327474/pexels-photo-33327474.png?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    imagenAlt: "Kappa Neo Midori - Figura sofubi kappa de Kyoto por Sota Yamashiro",
  },
];

export const categorias: string[] = [
  "Todos",
  "Kaiju Clásico",
  "Kaiju Vintage 80s",
  "Dragones y Criaturas Míticas",
  "Yokai y Espíritus",
  "Oni y Demonios",
  "Figuras Celestiales",
  "Guerreros y Samurai",
  "Sofubi Chino Contemporáneo",
];

export const tiposColeccionista: string[] = [
  "Coleccionista principiante (0-5 piezas)",
  "Coleccionista intermedio (6-20 piezas)",
  "Coleccionista avanzado (21-50 piezas)",
  "Coleccionista experto (+50 piezas)",
  "Inversor en arte sofubi",
  "Galería o espacio cultural",
];

export const interesesSofubi: string[] = [
  "Kaiju clásico y neo-kaiju",
  "Kaiju vintage años 70-80 (Marusan, Bullmark, Popy)",
  "Dragones y criaturas míticas",
  "Yokai y espíritus japoneses",
  "Oni y figuras demoníacas",
  "Figuras celestiales y divinas",
  "Guerreros, samurai y ninjas",
  "Ediciones artista independiente",
  "Colaboraciones internacionales",
  "Arte sofubi chino contemporáneo",
];