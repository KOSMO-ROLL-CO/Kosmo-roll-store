import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, LayoutList } from 'lucide-react';
import { useCatalog } from '../store/catalogStore';
import { CATEGORIES, type Category, type Product } from '../types';
import ProductCard from '../components/ProductCard';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'almost-gone' | 'limited';

const remainingUnits = (p: Product) =>
  p.edition.isLimited ? Math.max(0, p.edition.total - p.edition.current) : p.stock;

export default function Catalog() {
  const products = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    (searchParams.get('categoria') as Category | 'all') || 'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  const query = (searchParams.get('busca') || '').trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (query) {
      result = result.filter((p) => {
        const haystack = [
          p.name,
          p.shortDescription,
          p.description,
          p.category,
          ...p.tags,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'best-selling':
        result.sort((a, b) => b.edition.current - a.edition.current);
        break;
      case 'almost-gone':
        result.sort((a, b) => remainingUnits(a) - remainingUnits(b));
        break;
      case 'limited':
        result.sort((a, b) => (b.edition.isLimited ? 1 : 0) - (a.edition.isLimited ? 1 : 0));
        break;
    }

    return result;
  }, [selectedCategory, sortBy, query, products]);

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('categoria');
    } else {
      searchParams.set('categoria', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-cosmos mb-4">
              Catálogo
            </h1>
            <p className="text-cosmos/50 max-w-lg mx-auto">
              Explore todas as peças da Kosmo Roll. Do básico ao exclusivo.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-kosmo text-white shadow-lg shadow-kosmo/25'
                  : 'bg-gray-100 text-cosmos/60 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-kosmo text-white shadow-lg shadow-kosmo/25'
                    : 'bg-gray-100 text-cosmos/60 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Grid */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-cosmos/40" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm text-cosmos/60 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="newest">Mais novos</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="best-selling">Mais vendidos</option>
                <option value="almost-gone">Quase esgotando</option>
                <option value="limited">Edições limitadas</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1 border-l pl-3 border-gray-200">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-lg transition-colors ${gridCols === 3 ? 'bg-kosmo/10 text-kosmo' : 'text-cosmos/30'}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 rounded-lg transition-colors ${gridCols === 2 ? 'bg-kosmo/10 text-kosmo' : 'text-cosmos/30'}`}
              >
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-cosmos/40 mb-6">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          {query && (
            <>
              {' '}para <span className="text-kosmo font-medium">"{query}"</span>
            </>
          )}
        </p>

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div
            className={`grid gap-6 lg:gap-8 ${
              gridCols === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🔭</span>
            <h3 className="font-display font-semibold text-xl text-cosmos mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-cosmos/50">
              {query
                ? `Nada encontrado para "${query}". Tente outra busca ou explore o catálogo completo.`
                : 'Tente outra categoria ou volte ao catálogo completo.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
