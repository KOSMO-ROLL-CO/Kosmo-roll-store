export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colorImages?: Record<string, string[]>;
  category: Category;
  sizes: Size[];
  colors: ProductColor[];
  edition: {
    current: number;
    total: number;
    isLimited: boolean;
  };
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  stock: number;
  saleEndsAt?: string;
  lifestyleImages?: { src: string; label: string }[];
}

export type Category = 'camisetas' | 'bones' | 'calcas' | 'edicoes-limitadas' | 'acessorios';

export type Size = 'P' | 'M' | 'G' | 'GG' | 'XG';

export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  size: Size;
  color: ProductColor;
  quantity: number;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'camisetas', name: 'Camisetas', description: 'Estampas cósmicas pra vestir o universo', icon: '👕' },
  { id: 'bones', name: 'Bonés', description: 'Complete seu look orbital', icon: '🧢' },
  { id: 'calcas', name: 'Calças', description: 'Pra andar fora de órbita', icon: '👖' },
  { id: 'edicoes-limitadas', name: 'Edições Limitadas', description: 'Peças numeradas e exclusivas', icon: '🪐' },
  { id: 'acessorios', name: 'Acessórios', description: 'Detalhes que fazem a diferença', icon: '✨' },
];
