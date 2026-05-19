export interface Brand {
  id: string;
  nombre: string;
  pais: string;
  descripcion: string;
  imagen: string;
  fundada?: number;
  destacada: boolean;
}

const brands: Brand[] = [
  {
    id: "secret-base",
    nombre: "Secret Base",
    pais: "Japón",
    descripcion: "Pioneros del sofubi underground tokiota. Sus figuras fusionan iconografía kaiju con estética punk japonesa de los 90s.",
    imagen: "https://loremflickr.com/400/400/japan,toy,vinyl",
    fundada: 1996,
    destacada: true,
  },
  {
    id: "medicom-toy",
    nombre: "Medicom Toy",
    pais: "Japón",
    descripcion: "La casa más influyente del coleccionismo vinílico asiático. Creadores del icónico BE@RBRICK y referentes mundiales del designer toy.",
    imagen: "https://loremflickr.com/400/400/medicom,collectible,figure",
    fundada: 1996,
    destacada: true,
  },
  {
    id: "restore",
    nombre: "Restore",
    pais: "Japón",
    descripcion: "Maestros del sofubi artesanal de pequeña tirada. Cada pieza es fundida y pintada a mano en su taller de Osaka.",
    imagen: "https://loremflickr.com/400/400/osaka,vinyl,artisan",
    fundada: 2003,
    destacada: true,
  },
  {
    id: "dream-rocket",
    nombre: "Dream Rocket",
    pais: "Japón",
    descripcion: "Figuras de vinilo soft de edición ultra-limitada inspiradas en los kaiju clásicos de la era Showa. Coleccionismo de alto nivel.",
    imagen: "https://loremflickr.com/400/400/kaiju,monster,sofubi",
    fundada: 2005,
    destacada: true,
  },
  {
    id: "toy-art-gallery",
    nombre: "Toy Art Gallery",
    pais: "Japón",
    descripcion: "Galería y productora de sofubi que colabora con artistas emergentes de todo el mundo. Referente del arte vinílico contemporáneo.",
    imagen: "https://loremflickr.com/400/400/gallery,art,toy",
    fundada: 2008,
    destacada: false,
  },
  {
    id: "marmit",
    nombre: "Marmit",
    pais: "Japón",
    descripcion: "Especialistas en recrear los monstruos de la era dorada tokusatsu con fidelidad absoluta y materiales de vinilo premium.",
    imagen: "https://loremflickr.com/400/400/tokusatsu,monster,vintage",
    fundada: 1994,
    destacada: false,
  },
  {
    id: "wonderwall",
    nombre: "Wonderwall",
    pais: "Japón",
    descripcion: "Boutique sofubi de Tokio conocida por sus colorways neón y colaboraciones con artistas de la escena underground de Harajuku.",
    imagen: "https://loremflickr.com/400/400/harajuku,neon,vinyl",
    fundada: 2010,
    destacada: true,
  },
  {
    id: "instinctoy",
    nombre: "Instinctoy",
    pais: "Japón",
    descripcion: "Arte líquido hecho vinilo. Sus figuras translúcidas con efectos de degradado son consideradas obras de arte coleccionables.",
    imagen: "https://loremflickr.com/400/400/translucent,resin,art",
    fundada: 2009,
    destacada: true,
  },
  {
    id: "3a-toys",
    nombre: "3A Toys",
    pais: "Hong Kong",
    descripcion: "Referente del diseño de juguetes de autor en Asia. Mundos distópicos y personajes de ciencia ficción con acabados impecables.",
    imagen: "https://loremflickr.com/400/400/hongkong,scifi,designer",
    fundada: 2007,
    destacada: false,
  },
  {
    id: "how2work",
    nombre: "How2Work",
    pais: "Hong Kong",
    descripcion: "Plataforma creativa hongkonesa que produce figuras de vinilo en colaboración con ilustradores y artistas urbanos de toda Asia.",
    imagen: "https://loremflickr.com/400/400/hongkong,urban,art",
    fundada: 2011,
    destacada: false,
  },
  {
    id: "monster-worship",
    nombre: "Monster Worship",
    pais: "Japón",
    descripcion: "Culto al kaiju en su máxima expresión. Tiradas de 50 a 100 piezas numeradas a mano, cada una con certificado de autenticidad.",
    imagen: "https://loremflickr.com/400/400/kaiju,worship,limited",
    fundada: 2012,
    destacada: true,
  },
  {
    id: "living-dead-toys",
    nombre: "Living Dead Toys",
    pais: "Corea del Sur",
    descripcion: "La vanguardia del sofubi coreano. Figuras oscuras de edición limitada que mezclan folklore asiático con estética contemporánea.",
    imagen: "https://loremflickr.com/400/400/korea,dark,figure",
    fundada: 2014,
    destacada: false,
  },
];

export default brands;