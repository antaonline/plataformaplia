export type CarCategory = 'Supercar' | 'GT' | 'Roadster';

export interface Car {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  potencia: number;
  aceleracion: number;
  velocidad: number;
  imagen: string;
  categoria: CarCategory;
  destacado: boolean;
  descripcion: string;
}

export const cars: Car[] = [
  {
    id: 'lamborghini-revuelto-2024',
    marca: 'Lamborghini',
    modelo: 'Revuelto',
    año: 2024,
    precio: 580000,
    potencia: 1001,
    aceleracion: 2.5,
    velocidad: 350,
    imagen: 'https://images.pexels.com/photos/31565015/pexels-photo-31565015.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Supercar',
    destacado: true,
    descripcion: 'El híbrido más salvaje de Sant\'Agata. Motor V12 atmosférico combinado con tres motores eléctricos para una experiencia sin precedentes.',
  },
  {
    id: 'ferrari-sf90-2024',
    marca: 'Ferrari',
    modelo: 'SF90 Stradale',
    año: 2024,
    precio: 520000,
    potencia: 1000,
    aceleracion: 2.5,
    velocidad: 340,
    imagen: 'https://images.pexels.com/photos/14317474/pexels-photo-14317474.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Supercar',
    destacado: true,
    descripcion: 'La cúspide de la ingeniería de Maranello. Híbrido enchufable con tracción total y aerodinámica activa de Fórmula 1.',
  },
  {
    id: 'bugatti-chiron-2024',
    marca: 'Bugatti',
    modelo: 'Chiron Super Sport',
    año: 2024,
    precio: 3900000,
    potencia: 1600,
    aceleracion: 2.3,
    velocidad: 440,
    imagen: 'https://images.pexels.com/photos/17884221/pexels-photo-17884221.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Supercar',
    destacado: true,
    descripcion: 'El hipercoche definitivo. Motor W16 de 8.0 litros con cuatro turbocompresores y 1.600 CV de potencia absoluta.',
  },
  {
    id: 'mclaren-750s-2024',
    marca: 'McLaren',
    modelo: '750S',
    año: 2024,
    precio: 320000,
    potencia: 750,
    aceleracion: 2.8,
    velocidad: 332,
    imagen: 'https://images.pexels.com/photos/29222192/pexels-photo-29222192.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Supercar',
    destacado: false,
    descripcion: 'Precisión quirúrgica en cada curva. El ADN de las carreras de Woking traducido a la calle con brutalidad refinada.',
  },
  {
    id: 'porsche-911-gt3rs-2024',
    marca: 'Porsche',
    modelo: '911 GT3 RS',
    año: 2024,
    precio: 245000,
    potencia: 525,
    aceleracion: 3.2,
    velocidad: 296,
    imagen: 'https://images.pexels.com/photos/29567118/pexels-photo-29567118.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'GT',
    destacado: true,
    descripcion: 'El GT más extremo de Stuttgart. Aerodinámica de competición activa y motor bóxer de 4.0 litros de pura emoción.',
  },
  {
    id: 'aston-martin-db12-2024',
    marca: 'Aston Martin',
    modelo: 'DB12',
    año: 2024,
    precio: 235000,
    potencia: 680,
    aceleracion: 3.5,
    velocidad: 325,
    imagen: 'https://images.pexels.com/photos/8190663/pexels-photo-8190663.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'GT',
    destacado: false,
    descripcion: 'El Gran Turismo más avanzado en la historia de Aston Martin. Elegancia británica con corazón de superdeportivo.',
  },
  {
    id: 'bentley-continental-gt-2024',
    marca: 'Bentley',
    modelo: 'Continental GT Speed',
    año: 2024,
    precio: 280000,
    potencia: 659,
    aceleracion: 3.6,
    velocidad: 335,
    imagen: 'https://images.pexels.com/photos/17338594/pexels-photo-17338594.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'GT',
    destacado: false,
    descripcion: 'La definición del lujo en movimiento. W12 biturbo con refinamiento incomparable y prestaciones de superdeportivo.',
  },
  {
    id: 'mercedes-amg-gt-black-series-2024',
    marca: 'Mercedes-AMG',
    modelo: 'GT Black Series',
    año: 2024,
    precio: 335000,
    potencia: 730,
    aceleracion: 3.2,
    velocidad: 325,
    imagen: 'https://images.pexels.com/photos/7662135/pexels-photo-7662135.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'GT',
    destacado: true,
    descripcion: 'La bestia de Affalterbach. El GT más extremo jamás construido por AMG, con alerón activo de doble plano.',
  },
  {
    id: 'porsche-718-boxster-spyder-2024',
    marca: 'Porsche',
    modelo: '718 Spyder RS',
    año: 2024,
    precio: 145000,
    potencia: 500,
    aceleracion: 3.4,
    velocidad: 301,
    imagen: 'https://images.pexels.com/photos/30547599/pexels-photo-30547599.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Roadster',
    destacado: false,
    descripcion: 'La pureza de conducir sin techo. Motor central bóxer de 4.0 litros y carrocería ultraligera para máxima agilidad.',
  },
  {
    id: 'ferrari-roma-spider-2024',
    marca: 'Ferrari',
    modelo: 'Roma Spider',
    año: 2024,
    precio: 295000,
    potencia: 620,
    aceleracion: 3.4,
    velocidad: 320,
    imagen: 'https://images.pexels.com/photos/17597363/pexels-photo-17597363.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Roadster',
    destacado: true,
    descripcion: 'La dolce vita sobre cuatro ruedas. Techo retráctil en 14 segundos y el alma más romántica de Maranello.',
  },
  {
    id: 'mclaren-artura-spider-2024',
    marca: 'McLaren',
    modelo: 'Artura Spider',
    año: 2024,
    precio: 275000,
    potencia: 700,
    aceleracion: 3.0,
    velocidad: 330,
    imagen: 'https://images.pexels.com/photos/6891803/pexels-photo-6891803.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Roadster',
    destacado: false,
    descripcion: 'Híbrido descapotable de nueva generación. La tecnología del futuro con la emoción de conducir sin límites.',
  },
  {
    id: 'lamborghini-huracan-evo-spyder-2024',
    marca: 'Lamborghini',
    modelo: 'Huracán EVO Spyder',
    año: 2024,
    precio: 290000,
    potencia: 640,
    aceleracion: 3.1,
    velocidad: 324,
    imagen: 'https://images.pexels.com/photos/16124130/pexels-photo-16124130.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    categoria: 'Roadster',
    destacado: false,
    descripcion: 'El V10 más visceral de Sant\'Agata, ahora al descubierto. Sonido de 8.500 rpm que redefine el placer sensorial.',
  },
];

export const getFeaturedCars = (): Car[] => cars.filter((car) => car.destacado);

export const getCarsByCategory = (categoria: CarCategory): Car[] =>
  cars.filter((car) => car.categoria === categoria);

export const getCarById = (id: string): Car | undefined =>
  cars.find((car) => car.id === id);

export const getAllCategories = (): CarCategory[] => ['Supercar', 'GT', 'Roadster'];