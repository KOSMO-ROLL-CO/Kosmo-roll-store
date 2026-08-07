import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Star, Clock, Lock } from 'lucide-react';
import { useCatalog } from '../store/catalogStore';
import { CATEGORIES } from '../types';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Logo from '../components/Logo';
import CountdownTimer from '../components/CountdownTimer';

const heroStats = [
  { icon: Sparkles, value: 'Estampado', label: 'Sob demanda' },
  { icon: Zap, value: 'Numeradas', label: 'Edições limitadas' },
  { icon: Star, value: 'KOSMO10', label: '10% OFF primeira compra' },
];

function LimitedEditionCard({ product, index }: { product: Product; index: number }) {
  const [imageError, setImageError] = useState(false);
  const image = product.colorImages?.[product.colors[0]?.name]?.[0] ?? product.images[0];
  const remaining = product.edition.total - product.edition.current;
  const progress = (product.edition.current / product.edition.total) * 100;
  const soldOut = remaining <= 0;

  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const zoomRef = useRef<HTMLDivElement>(null);

  const handleZoomMove = (e: React.MouseEvent) => {
    const rect = zoomRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: index === 0 ? -3 : 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-kosmo/30 to-purple-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Link
        to={`/produto/${product.slug}`}
        className="relative block p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-kosmo/40 transition-all duration-300 overflow-hidden"
      >
        <div
          ref={zoomRef}
          onMouseMove={handleZoomMove}
          className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-kosmo/20 to-purple-500/20 mb-3 cursor-zoom-in"
        >
          {image && !imageError ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.8]"
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Logo size="lg" className="group-hover:scale-110 transition-transform" />
            </div>
          )}

          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
            {soldOut ? (
              <span className="inline-flex items-center gap-1 bg-white/90 text-cosmos px-2 py-0.5 rounded-full">
                <Lock size={9} /> Esgotada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-kosmo text-white px-2 py-0.5 rounded-full animate-pulse">
                <Clock size={9} /> {remaining} restantes
              </span>
            )}
          </span>
        </div>

        <h4 className="font-display font-semibold text-sm text-white mb-1 line-clamp-1">{product.name}</h4>

        <div className="flex items-center justify-between mb-2">
          <span className="text-kosmo font-bold text-sm">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <span className="edition-badge text-[0.6rem]">{product.edition.total} peças</span>
        </div>

        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 + index * 0.15 }}
            className="h-full bg-kosmo-gradient rounded-full"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/40">
          <span>Edição #{product.edition.current}/{product.edition.total}</span>
          <CountdownTimer endDate={product.saleEndsAt} size="sm" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const products = useCatalog();
  const featuredProducts = products.filter((p) => p.isFeatured);
  const newProducts = products.filter((p) => p.isNew);
  const limitedProducts = products.filter((p) => p.edition.isLimited);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          {/* Video background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* White vignette overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 75% at 50% 45%, transparent 35%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.92) 100%)',
            }}
          />
          <div className="absolute top-20 left-10 w-72 h-72 bg-kosmo/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kosmo/3 rounded-full blur-3xl" />

          {/* Floating planets */}
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-32 right-20 text-6xl opacity-20 hidden lg:block"
          >
            🪐
          </motion.div>
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-40 left-20 text-4xl opacity-15 hidden lg:block"
          >
            🛸
          </motion.div>
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-60 left-1/4 text-3xl opacity-10 hidden lg:block"
          >
            ⭐
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo/5 border border-kosmo/10 text-kosmo text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kosmo opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kosmo" />
              </span>
              Novas edições disponíveis
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold text-cosmos leading-[0.9] mb-6"
            >
              Conexão
              <br />
              <span className="text-gradient">Urbana</span>
              <br />
              <span className="text-cosmos/30">Fora de Órbita</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-cosmos/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Streetwear com estampas sob demanda e edições numeradas.
              Cada peça é única. Cada edição é especial. Vestindo o universo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/catalogo"
                className="px-8 py-4 bg-kosmo text-white rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-kosmo-dark transition-all duration-300 shadow-xl shadow-kosmo/25 hover:shadow-2xl hover:shadow-kosmo/30 hover:scale-105"
              >
                Explorar Catálogo
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/edicoes"
                className="px-8 py-4 bg-cosmos/5 text-cosmos rounded-full font-semibold text-sm border border-cosmos/10 hover:bg-cosmos/10 transition-all duration-300 hover:scale-105"
              >
                Edições Limitadas
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
                <stat.icon size={20} className="text-kosmo mx-auto mb-2" />
                <div className="font-display font-bold text-sm text-cosmos">{stat.value}</div>
                <div className="text-xs text-cosmos/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos mb-4">
            Explore o Universo
          </h2>
          <p className="text-cosmos/50 max-w-lg mx-auto">
            Cada peça é uma estrela no nosso catálogo. Encontre a sua constelação.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.08}>
              <Link
                to={category.id === 'edicoes-limitadas' ? '/edicoes' : `/catalogo?categoria=${category.id}`}
                className="group block p-6 rounded-2xl bg-white border border-gray-100 hover:border-kosmo/20 hover:shadow-xl hover:shadow-kosmo/5 transition-all duration-500 text-center hover-lift"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </span>
                <h3 className="font-display font-semibold text-cosmos text-sm mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-cosmos/40">{category.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-12">
            <div>
              <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">Destaques</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos mt-2">
                Em Órbita Agora
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-cosmos/60 hover:text-kosmo transition-colors"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Limited Editions Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal scale>
            <div className="relative overflow-hidden rounded-3xl bg-cosmos p-8 sm:p-16 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-kosmo/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-kosmo/20 text-kosmo text-xs font-bold tracking-wider uppercase mb-6">
                  ⚡ Edições Numeradas
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Peças Únicas,
                  <br />
                  <span className="text-kosmo">Numeração Gravada</span>
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-md">
                  Cada edição limitada vem com numeração exclusiva em laser.
                  Quando esgota, acabou. Não tem segunda chance.
                </p>
                <Link
                  to="/edicoes"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-kosmo text-white rounded-full font-semibold hover:bg-kosmo-light transition-all duration-300 shadow-xl shadow-kosmo/25 hover:scale-105"
                >
                  Ver Edições <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {limitedProducts.slice(0, 2).map((product, index) => (
                  <LimitedEditionCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">Acabou de chegar</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos mt-2">
                Novidades do Espaço
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {newProducts.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter / Coupon */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal className="p-8 sm:p-12 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-kosmo/5">
            <span className="text-5xl block mb-4">🛸</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-cosmos mb-3">
              Primeira Compra?
            </h2>
            <p className="text-cosmos/50 mb-6">
              Use o cupom abaixo e ganhe <span className="text-kosmo font-bold">10% OFF</span> em qualquer produto!
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-kosmo/5 border-2 border-dashed border-kosmo/20">
              <span className="font-display font-bold text-2xl text-kosmo tracking-wider">
                KOSMO10
              </span>
            </div>
            <p className="text-xs text-cosmos/40 mt-4">
              Válido para primeira compra. Não acumula com outras promoções.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
