import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Minus, Plus, Share2, Truck, Shield, RotateCcw, BadgeCheck, Heart, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../store/catalogStore';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useKosmo } from '../context/KosmoContext';
import { formatInstallment } from '../utils/commerce';
import ProductCard from '../components/ProductCard';
import CountdownTimer from '../components/CountdownTimer';
import Logo from '../components/Logo';
import type { Size, ProductColor } from '../types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isWishlisted, toggleWishlist, getReviews, addReview, canReview } = useKosmo();
  const products = useCatalog();

  const product = products.find((p) => p.slug === slug);

  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product?.colors[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo size="xl" className="mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-cosmos mb-3">
            Produto não encontrado
          </h1>
          <p className="text-cosmos/50 mb-8">
            Esse produto pode ter saído da órbita...
          </p>
          <Link
            to="/catalogo"
            className="px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors"
          >
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const editionPercentage = (product.edition.current / product.edition.total) * 100;
  const remaining = product.edition.total - product.edition.current;
  const wishlisted = isWishlisted(product.id);
  const reviews = getReviews(product.id);
  const userCanReview = user ? canReview(product.id, user.name, user.email) : false;

  const currentImages = selectedColor?.name && product.colorImages?.[selectedColor.name]
    ? product.colorImages[selectedColor.name]
    : product.images;

  const thumbLabels = currentImages.map((_, i) => {
    if (i === 0) return 'Frente';
    if (currentImages.length === 2 && i === 1) return 'Costas';
    if (i === currentImages.length - 1) return 'Detalhe';
    return `Foto ${i + 1}`;
  });

  const goToImage = (dir: 1 | -1) => {
    setImageError(false);
    setActiveImage((prev) => (prev + dir + currentImages.length) % currentImages.length);
  };

  const handleAddToCart = () => {
    if (selectedColor) {
      addItem(product, selectedSize, selectedColor, quantity);
    }
  };

  const handleOneClickBuy = () => {
    if (selectedColor) {
      addItem(product, selectedSize, selectedColor, quantity);
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const result = addReview(product.id, user.name, rating, comment, user.email);
    if (result.ok) {
      setReviewMessage(`Avaliação enviada! Você ganhou +${result.earned} Kosmo Coins. 🪙`);
      setComment('');
    } else {
      setReviewMessage('Avaliação não permitida. Compre a peça e confirme o pagamento para avaliar.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-cosmos/50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 hover:text-kosmo transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-kosmo transition-colors">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-cosmos">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-kosmo/5 via-purple-100/50 to-kosmo/10 mb-4">
              {/* Main image */}
              {currentImages[activeImage] && !imageError ? (
                <img
                  src={currentImages[activeImage]}
                  alt={product.name}
                  loading="eager"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Tentar fallback para a primeira imagem principal antes do placeholder
                    const fallback = product.images[0]
                    if (fallback && e.currentTarget.src !== window.location.origin + fallback) {
                      e.currentTarget.src = fallback
                    } else {
                      setImageError(true)
                    }
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Logo size="xl" className="block mb-3" />
                    <span className="text-sm font-medium text-cosmos/40 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1.5 bg-cosmos text-white text-xs font-bold uppercase tracking-wider rounded-full">
                    Novo
                  </span>
                )}
                {product.edition.isLimited && (
                  <span className="edition-badge">
                    {product.edition.total} peças
                  </span>
                )}
                {product.originalPrice && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Gallery arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() => goToImage(-1)}
                    aria-label="Imagem anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-cosmos shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white hover:text-kosmo transition-all duration-300"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => goToImage(1)}
                    aria-label="Próxima imagem"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-cosmos shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white hover:text-kosmo transition-all duration-300"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-cosmos/70 backdrop-blur text-white text-[11px] font-bold">
                    {activeImage + 1} / {currentImages.length}
                  </span>
                </>
              )}

              {/* Wishlist heart */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                className={`absolute top-4 right-4 w-11 h-11 rounded-full backdrop-blur flex items-center justify-center transition-all duration-300 ${
                  wishlisted
                    ? 'bg-kosmo text-white shadow-lg shadow-kosmo/30 scale-110'
                    : 'bg-white/80 text-cosmos/50 hover:text-kosmo hover:scale-110'
                }`}
              >
                <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="space-y-3">
              <div className="flex gap-3">
                {currentImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImage(i); setImageError(false); }}
                    className={`flex-1 aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                      activeImage === i
                        ? 'ring-2 ring-kosmo ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-kosmo/5 to-purple-100 flex items-center justify-center">
                        <Logo size="sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-cosmos/50">
                  {thumbLabels[activeImage]}
                  {selectedColor?.name && product.colorImages?.[selectedColor.name]
                    ? ` • ${selectedColor.name}`
                    : ''}
                </p>
                {product.lifestyleImages && product.lifestyleImages.length > 0 && (
                  <p className="text-[11px] text-cosmos/40 hidden sm:block">
                    Veja em ação abaixo 👇
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="space-y-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-kosmo/5 text-kosmo text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Name */}
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-cosmos">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-cosmos">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-cosmos/40 line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
              <p className="text-sm text-cosmos/50">
                ou {formatInstallment(product.price)} sem juros no cartão
              </p>

              {/* Short description */}
              <p className="text-cosmos/60 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-cosmos mb-3">
                    Cor: <span className="font-normal text-cosmos/60">{selectedColor?.name}</span>
                  </label>
                  <div className="flex gap-4">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => { setSelectedColor(color); setActiveImage(0); setImageError(false); }}
                        disabled={!color.available}
                        className={`flex flex-col items-center gap-1.5 group ${
                          !color.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                            selectedColor?.name === color.name
                              ? 'border-kosmo ring-2 ring-kosmo/20 scale-110 shadow-lg'
                              : 'border-gray-300 group-hover:border-gray-400 group-hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className={`text-xs font-medium transition-colors ${
                          selectedColor?.name === color.name ? 'text-kosmo' : 'text-cosmos/50'
                        }`}>
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div>
                <label className="block text-sm font-semibold text-cosmos mb-3">
                  Tamanho: <span className="font-normal text-cosmos/60">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 px-4 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${
                        selectedSize === size
                          ? 'border-kosmo bg-kosmo text-white shadow-lg shadow-kosmo/25'
                          : 'border-gray-200 text-cosmos/70 hover:border-kosmo/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-cosmos mb-3">Quantidade</label>
                <div className="inline-flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-display font-bold text-lg text-cosmos">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-kosmo text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-kosmo-dark transition-all duration-300 shadow-xl shadow-kosmo/25 hover:shadow-2xl hover:shadow-kosmo/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag size={18} />
                Adicionar à Sacola — R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
              </button>

              {/* Buy in 1 click */}
              {isAuthenticated ? (
                <button
                  onClick={handleOneClickBuy}
                  className="w-full py-4 bg-cosmos text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-cosmos/90 transition-all duration-300 shadow-xl shadow-cosmos/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap size={18} />
                  Comprar em 1 Clique — R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                </button>
              ) : (
                <Link
                  to={`/login?redirect=/produto/${product.slug}`}
                  className="w-full py-4 bg-cosmos text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-cosmos/90 transition-all duration-300"
                >
                  <Zap size={18} />
                  Entre para comprar em 1 clique
                </Link>
              )}

              {/* Share */}
              <div className="flex justify-center">
                <button className="flex items-center gap-2 text-sm text-cosmos/50 hover:text-kosmo transition-colors">
                  <Share2 size={14} />
                  Compartilhar
                </button>
              </div>

              {/* Edition Info */}
              {product.edition.isLimited && (
                <div className="p-5 rounded-2xl bg-kosmo/5 border border-kosmo/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-cosmos">
                      Edição Limitada #{product.edition.current}/{product.edition.total}
                    </span>
                    <span className="text-xs text-kosmo font-semibold">{remaining} restantes</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-kosmo-gradient rounded-full transition-all duration-700"
                      style={{ width: `${editionPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cosmos/60">
                    <span className="font-semibold shrink-0">A venda por mais:</span>
                    <CountdownTimer endDate={product.saleEndsAt} size="md" />
                  </div>
                  <p className="text-xs text-cosmos/50">
                    ⚡ Quando esgota, acabou. Cada peça vem numerada em laser.
                  </p>
                  <Link
                    to={`/certificado/${product.slug}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border-2 border-kosmo/20 text-kosmo text-sm font-semibold hover:bg-kosmo hover:text-white transition-colors"
                  >
                    <BadgeCheck size={16} />
                    Ver Certificado de Autenticidade
                  </Link>
                </div>
              )}

              {/* Full description */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-display font-semibold text-cosmos mb-3">Sobre o produto</h3>
                <p className="text-sm text-cosmos/60 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Perks */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <Truck size={18} className="text-kosmo mx-auto mb-1.5" />
                  <span className="text-[11px] text-cosmos/50 block">Frete grátis +R$299</span>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <Shield size={18} className="text-kosmo mx-auto mb-1.5" />
                  <span className="text-[11px] text-cosmos/50 block">Compra segura</span>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <RotateCcw size={18} className="text-kosmo mx-auto mb-1.5" />
                  <span className="text-[11px] text-cosmos/50 block">Troca em 30 dias</span>
                </div>
              </div>

              {/* Reviews */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-cosmos">
                    Avaliações ({reviews.length})
                  </h3>
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star size={14} className="fill-current" />
                    {reviews.length > 0
                      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                      : '—'}
                  </span>
                </div>

                {isAuthenticated && userCanReview && (
                  <form onSubmit={handleReviewSubmit} className="mb-5 p-4 rounded-2xl bg-kosmo/5 border border-kosmo/10">
                    <p className="text-xs text-kosmo font-semibold mb-3">
                      Comprou esta peça? Deixe sua avaliação e ganhe Kosmo Coins! 🪙
                    </p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`text-xl transition-transform hover:scale-125 ${n <= rating ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="O que achou da peça?"
                      rows={2}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-kosmo resize-none"
                    />
                    <button
                      type="submit"
                      className="mt-3 w-full py-2.5 rounded-xl bg-kosmo text-white text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                    >
                      Enviar avaliação
                    </button>
                    {reviewMessage && (
                      <p className="mt-2 text-xs text-kosmo text-center font-medium">{reviewMessage}</p>
                    )}
                  </form>
                )}

                {isAuthenticated && !userCanReview && (
                  <p className="text-sm text-cosmos/50 mb-4">
                    Avaliações são liberadas somente para quem comprou esta peça. Faça seu pedido para avaliar e ganhar Kosmo Coins. 🪙
                  </p>
                )}

                {!isAuthenticated && (
                  <p className="text-sm text-cosmos/50 mb-4">
                    <Link to={`/login?redirect=/produto/${product.slug}`} className="text-kosmo font-semibold hover:underline">
                      Entre
                    </Link>{' '}
                    para avaliar esta peça após a compra e ganhar Kosmo Coins.
                  </p>
                )}

                <div className="space-y-3">
                  {reviews.length === 0 && (
                    <p className="text-sm text-cosmos/40">Nenhuma avaliação ainda. Seja o primeiro!</p>
                  )}
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-gray-50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-cosmos">{r.userName}</span>
                        <span className="text-xs text-amber-500">
                          {'★'.repeat(r.rating)}
                          <span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span>
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-cosmos/60 leading-relaxed">{r.comment}</p>}
                      <span className="block mt-2 text-[11px] text-cosmos/40">
                        {new Date(r.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lookbook / Lifestyle gallery */}
      {product.lifestyleImages && product.lifestyleImages.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">Lookbook</span>
              <h2 className="font-display text-2xl font-bold text-cosmos mt-2">
                A peça em ação
              </h2>
              <p className="text-cosmos/50 max-w-md mx-auto mt-2">
                Veja como a estampa se comporta no mundo real — na rua, no rolê, na sua órbita.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {product.lifestyleImages.map((img, index) => (
                <motion.div
                  key={`${img.src}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-kosmo/5 via-purple-100/50 to-kosmo/10 group ${
                    index === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={`${product.name} - ${img.label}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cosmos/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-cosmos opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {img.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-cosmos mb-8 text-center">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
