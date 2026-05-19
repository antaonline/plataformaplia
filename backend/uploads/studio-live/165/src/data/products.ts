export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  tag: string;
  image: string;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 'p01',
    name: 'Oversized Cargo Jacket',
    price: 189,
    category: 'Outerwear',
    tag: 'NEW DROP',
    image: 'https://images.pexels.com/photos/16323485/pexels-photo-16323485.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: true,
  },
  {
    id: 'p02',
    name: 'Washed Black Hoodie',
    price: 124,
    category: 'Tops',
    tag: 'BESTSELLER',
    image: 'https://images.pexels.com/photos/24499685/pexels-photo-24499685.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: true,
  },
  {
    id: 'p03',
    name: 'Technical Cargo Pants',
    price: 156,
    category: 'Bottoms',
    tag: 'LIMITED',
    image: 'https://images.pexels.com/photos/18393526/pexels-photo-18393526.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: true,
  },
  {
    id: 'p04',
    name: 'Distressed Graphic Tee',
    price: 79,
    category: 'Tops',
    tag: 'ESSENTIALS',
    image: 'https://images.pexels.com/photos/17474390/pexels-photo-17474390.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: true,
  },
  {
    id: 'p05',
    name: 'Utility Vest Jacket',
    price: 145,
    category: 'Outerwear',
    tag: 'NEW DROP',
    image: 'https://images.pexels.com/photos/2767617/pexels-photo-2767617.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: false,
  },
  {
    id: 'p06',
    name: 'Relaxed Wide Leg Denim',
    price: 138,
    category: 'Bottoms',
    tag: 'ESSENTIALS',
    image: 'https://images.pexels.com/photos/34442288/pexels-photo-34442288.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: false,
  },
  {
    id: 'p07',
    name: 'Reflective Track Jacket',
    price: 167,
    category: 'Outerwear',
    tag: 'LIMITED',
    image: 'https://images.pexels.com/photos/10378769/pexels-photo-10378769.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: false,
  },
  {
    id: 'p08',
    name: 'Heavyweight Crewneck',
    price: 112,
    category: 'Tops',
    tag: 'BESTSELLER',
    image: 'https://images.pexels.com/photos/16145962/pexels-photo-16145962.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    featured: false,
  },
];