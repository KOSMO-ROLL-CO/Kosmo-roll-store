import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-cosmos text-white p-8 sm:p-14 text-center"
      >
        {/* Stars */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          {['top-10 left-12', 'top-16 right-20', 'bottom-24 left-1/4', 'bottom-12 right-16', 'top-1/2 left-6'].map((pos, i) => (
            <motion.span
              key={i}
              className={`absolute ${pos} text-xs`}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            >
              ✨
            </motion.span>
          ))}
          <motion.span
            className="absolute top-8 right-8 text-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            🪐
          </motion.span>
        </div>

        <div className="relative">
          <span className="edition-badge">Erro 404</span>

          <motion.div
            className="text-7xl sm:text-8xl my-8"
            animate={{ y: [-12, 12, -12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧑‍🚀
          </motion.div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Você saiu da <span className="text-kosmo">órbita</span>
          </h1>
          <p className="text-white/60 max-w-md mx-auto mb-10 leading-relaxed">
            Essa página não existe nesse quadrante do universo. Pode ter sido engolida por um
            buraco negro — ou digitada errado. Volta pra base que a tripulação te espera.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-kosmo text-white rounded-full font-semibold text-sm hover:bg-kosmo-light transition-all duration-300 shadow-xl shadow-kosmo/25 hover:scale-105"
            >
              <Home size={16} /> Voltar ao início
            </Link>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white rounded-full font-semibold text-sm border border-white/15 hover:bg-white/20 transition-all duration-300"
            >
              <Compass size={16} /> Explorar catálogo
            </Link>
            <button
              onClick={() => history.back()}
              className="inline-flex items-center gap-2 px-4 py-3.5 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
