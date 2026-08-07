import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Flame, Heart, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useKosmo } from '../context/KosmoContext';
import { formatInstallment } from '../utils/commerce';
import type { Product, ProductColor } from '../types';
import Logo from './Logo';
import CountdownTimer from './CountdownTimer';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useKosmo();
  const [imageError, setImageError] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const wishlisted = isWishlisted(product.id);

  const handleZoomMove = (e: React.MouseEvent) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.colors.length > 0 && product.sizes.length > 0) {
      addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleColorHover = (color: ProductColor | null) => {
    if (color && product.colorImages?.[color.name]) {
      setHoveredColor(color.name);
    } else {
      setHoveredColor(null);
    }
  };

  const displayImage = hoveredColor && product.colorImages?.[hoveredColor]
    ? product.colorImages[hoveredColor][0]
    : product.images[0];

  const editionPercentage = (product.edition.current / product.edition.total) * 100;
  const editionRemaining = product.edition.total - product.edition.current;
  const almostGone =
    product.edition.isLimited ? editionRemaining <= 15 : product.stock <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/produto/${product.slug}`}
        className="group block"
      >
        <div
          ref={imageRef}
          onMouseMove={handleZoomMove}
          className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] mb-4 hover-lift"
        >
          {/* Product image */}
          {displayImage && !imageError ? (
            <img
              src={displayImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.8] cursor-zoom-in"
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-kosmo/5 via-purple-100/50 to-kosmo/10 flex items-center justify-center">
              <div className="text-center">
                <Logo size="xl" className="block mb-2" />
                <span className="text-xs font-medium text-cosmos/40 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2.5 py-1 bg-cosmos text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                Novo
              </span>
            )}
            {product.edition.isLimited && (
              <span className="edition-badge">
                {product.edition.total} peças
              </span>
            )}
            {almostGone && (
              <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 animate-pulse">
                <Flame size={10} />
                Quase esgotando
              </span>
            )}
            {product.originalPrice && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-all duration-300 ${
              wishlisted
                ? 'bg-kosmo text-white shadow-lg shadow-kosmo/30 scale-110'
                : 'bg-white/80 text-cosmos/50 hover:text-kosmo hover:scale-110'
            }`}
          >
            <Heart size={16} className={wishlisted ? 'fill-current' : ''} />
          </button>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-cosmos/0 group-hover:bg-cosmos/40 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="px-5 py-2.5 bg-white text-cosmos rounded-full text-sm font-semibold flex items-center gap-2 shadow-xl hover:bg-kosmo hover:text-white transition-colors">
                <Eye size={14} />
                Ver Produto
              </div>
              <button
                onClick={handleQuickAdd}
                className="w-10 h-10 bg-kosmo text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
              >
                <ShoppingBag size={14} />
              </button>
            </div>
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-cosmos/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <ZoomIn size={16} />
          </div>

          {/* Magnifier lens */}
          {displayImage && !imageError && (
            <div
              className="absolute w-32 h-32 rounded-full border-2 border-kosmo/70 shadow-2xl pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-no-repeat bg-white"
              style={{
                left: `calc(${zoomPos.x}% - 4rem)`,
                top: `calc(${zoomPos.y}% - 4rem)`,
                backgroundImage: `url(${displayImage})`,
                backgroundSize: '320%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}
        </div>

        {/* Product info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-cosmos group-hover:text-kosmo transition-colors">
              {product.name}
            </h3>
          </div>

          <p className="text-sm text-cosmos/50 line-clamp-1">
            {product.shortDescription}
          </p>

          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-cosmos">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-cosmos/40 line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <p className="text-xs text-cosmos/40">
            ou {formatInstallment(product.price)} sem juros
          </p>

          {/* Edition progress */}
          {product.edition.isLimited && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-cosmos/50">
                <span>Edição #{product.edition.current}/{product.edition.total}</span>
                <span className="text-kosmo font-medium">
                  {editionRemaining} restantes
                </span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kosmo-gradient rounded-full transition-all duration-500"
                  style={{ width: `${editionPercentage}%` }}
                />
              </div>
              <div className="pt-0.5">
                <CountdownTimer endDate={product.saleEndsAt} size="sm" />
              </div>
            </div>
          )}

          {/* Colors with hover preview */}
          {product.colors.length > 1 && (
            <div className="flex gap-2 pt-1 items-center">
              {product.colors.map((color) => (
                <div
                  key={color.name}
                  className="flex items-center gap-1"
                  onMouseEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorHover(color);
                  }}
                  onMouseLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorHover(null);
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-sm border-2 transition-all duration-200 cursor-pointer ${
                      hoveredColor === color.name
                        ? 'border-kosmo scale-125 shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                  <span className={`text-[10px] transition-colors ${
                    hoveredColor === color.name ? 'text-kosmo font-medium' : 'text-cosmos/40'
                  }`}>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
