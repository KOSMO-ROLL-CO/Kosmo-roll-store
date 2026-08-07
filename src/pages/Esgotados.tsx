import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Rocket, Sparkles, BadgeCheck } from 'lucide-react';
import { soldOutProducts } from '../data/products';
import { joinRestockAlert } from '../utils/waitlist';
import Logo from '../components/Logo';
import type { Product } from '../types';

function SoldOutCard({ product, index }: { product: Product; index: number }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinRestockAlert(product.id, email);
    setMessage(result.message);
    setError(!result.ok);
    if (result.ok) setEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[30%] group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
        />

        {/* Esgotado overlay */}
        <div className="absolute inset-0 bg-cosmos/40 flex items-center justify-center">
          <div className="text-center px-6">
            <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur text-cosmos text-xs font-bold uppercase tracking-widest rounded-full shadow-xl">
              Esgotado
            </span>
          </div>
        </div>

        {/* Edition badge */}
        {product.edition.isLimited && (
          <span className="absolute top-3 left-3 edition-badge">
            {product.edition.total} peças
          </span>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-semibold text-cosmos">{product.name}</h3>
        <p className="text-sm text-cosmos/50 line-clamp-1">{product.shortDescription}</p>
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
        {product.edition.isLimited && (
          <p className="text-xs text-cosmos/50 flex items-center gap-1">
            <BadgeCheck size={12} className="text-kosmo" />
            Edição #{product.edition.current}/{product.edition.total} vendida
          </p>
        )}

        {/* Me avise quando voltar */}
        <form onSubmit={handleAlert} className="pt-2 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmos/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setMessage(null); }}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos placeholder-cosmos/40 focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                placeholder="seu@email.com"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-cosmos text-white text-sm font-semibold hover:bg-cosmos/90 transition-colors whitespace-nowrap"
            >
              Avisar
            </button>
          </div>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs font-medium flex items-center gap-1.5 ${
                error ? 'text-red-500' : 'text-green-600'
              }`}
            >
              {!error && <CheckCircle2 size={12} />}
              {message}
            </motion.p>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default function Esgotados() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-kosmo/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo/5 border border-kosmo/10 text-kosmo text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            Peças que já saíram de órbita
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cosmos leading-[0.95] mb-6"
          >
            Esgotadas,
            <br />
            <span className="text-gradient">mas não esquecidas</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-cosmos/60 max-w-2xl mx-auto leading-relaxed"
          >
            Quando uma edição esgota, ela vira história. Deixe seu e-mail e seja o primeiro
            a saber se alguma dessas peças voltar — ou garanta a próxima drop antes de todo mundo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <Link
              to="/edicoes"
              className="px-6 py-3.5 bg-kosmo text-white rounded-full font-semibold text-sm hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25 flex items-center gap-2"
            >
              <Rocket size={16} />
              Ver próximas drops
            </Link>
            <Link
              to="/catalogo"
              className="px-6 py-3.5 bg-white text-cosmos border border-gray-200 rounded-full font-semibold text-sm hover:border-kosmo hover:text-kosmo transition-colors"
            >
              Ver o que está à venda
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Sold out products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        {soldOutProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {soldOutProducts.map((product, index) => (
              <SoldOutCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Logo size="xl" className="mx-auto mb-4 opacity-60" />
            <h3 className="font-display font-semibold text-xl text-cosmos mb-2">
              Nenhuma peça esgotada por enquanto
            </h3>
            <p className="text-cosmos/50">
              Tudo ainda está em órbita. Aproveite enquanto pode! 🚀
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
