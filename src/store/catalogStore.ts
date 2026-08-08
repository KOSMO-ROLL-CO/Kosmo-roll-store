import { useSyncExternalStore } from 'react';
import type { Product, Category, Size, ProductColor } from '../types';
import { products as seedProducts } from '../data/products';

const STORAGE_KEY = 'kosmo-admin-catalog-v1';

const listeners = new Set<() => void>();
let version = 0;

function deepClone(p: Product): Product {
  return {
    ...p,
    images: [...p.images],
    colors: p.colors.map((c) => ({ ...c })),
    colorImages: p.colorImages ? Object.fromEntries(Object.entries(p.colorImages).map(([k, v]) => [k, [...v]])) : undefined,
    lifestyleImages: p.lifestyleImages?.map((l) => ({ ...l })),
  };
}

function load(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: Product) => {
          const seed = seedProducts.find((s) => s.id === p.id);

          // Restaurar imagens principais do seed se estiverem ausentes/vazias no cache
          const validImages =
            p.images && p.images.length > 0 && p.images[0]
              ? p.images
              : (seed?.images ?? []);

          // Restaurar colorImages do seed se estiverem ausentes no cache
          const validColorImages =
            p.colorImages && Object.keys(p.colorImages).length > 0
              ? p.colorImages
              : seed?.colorImages;

          // Restaurar lifestyleImages do seed se estiverem ausentes no cache
          const validLifestyleImages =
            p.lifestyleImages && p.lifestyleImages.length > 0
              ? p.lifestyleImages
              : seed?.lifestyleImages;

          return {
            ...p,
            images: validImages,
            colorImages: validColorImages,
            lifestyleImages: validLifestyleImages,
          };
        });
      }
    }
  } catch {
    // fallback to seed
  }
  return seedProducts.map(deepClone);
}

let live: Product[] = load();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(live));
  } catch {
    // storage may be unavailable
  }
}

function notify() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return version;
}

export function useCatalog(): Product[] {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return live;
}

export function getCatalogProducts(): Product[] {
  return live;
}

export function getProductBySlug(slug: string): Product | undefined {
  return live.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return live.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return live.filter((p) => p.isFeatured);
}

export function getNewProducts(): Product[] {
  return live.filter((p) => p.isNew);
}

export function getLimitedProducts(): Product[] {
  return live.filter((p) => p.edition.isLimited);
}

export function getSoldOutProducts(): Product[] {
  return live.filter((p) => p.stock === 0 || p.edition.current >= p.edition.total);
}

export function adminAddProduct(product: Product): void {
  live = [...live, product];
  persist();
  notify();
}

export function adminUpdateProduct(id: string, patch: Partial<Product>): void {
  live = live.map((p) => (p.id === id ? { ...p, ...patch } : p));
  persist();
  notify();
}

export function adminRemoveProduct(id: string): void {
  live = live.filter((p) => p.id !== id);
  persist();
  notify();
}

export function adminResetCatalog(): void {
  live = seedProducts.map(deepClone);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  notify();
}

export function emptyProduct(): Product {
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    images: [],
    category: 'camisetas',
    sizes: ['M'] as Size[],
    colors: [{ name: 'Preto', hex: '#0A0A0A', available: true } as ProductColor],
    edition: { current: 1, total: 100, isLimited: false },
    tags: [],
    isNew: true,
    isFeatured: false,
    stock: 10,
  };
}

export const CATEGORY_IDS: Category[] = ['camisetas', 'bones', 'calcas', 'edicoes-limitadas', 'acessorios'];
