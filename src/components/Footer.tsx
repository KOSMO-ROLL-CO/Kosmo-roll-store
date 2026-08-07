import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { Instagram } from './Icons';
import Logo from './Logo';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Footer() {
  return (
    <footer className="bg-cosmos text-white/80">
      {/* Top wave */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#0A0A1A"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* Brand */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo size="lg" />
              <div>
                <h3 className="font-display text-xl font-bold tracking-wider text-white">
                  KOSMO ROLL
                </h3>
                <span className="text-[0.6rem] font-medium tracking-[0.3em] text-kosmo">
                  \ CO.
                </span>
              </div>
            </div>
            <p className="text-white/60 max-w-md leading-relaxed mb-6">
              Conexão urbana fora de órbita. Streetwear com estampas sob demanda e
              edições numeradas. Cada peça é única, cada edição é especial.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/kosmoroll.co"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-kosmo hover:text-white hover:scale-110 hover:rotate-6 transition-all duration-300"
              >
                <Instagram size={18} className="group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a
                href="mailto:contato@kosmoroll.co"
                className="group w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-kosmo hover:text-white hover:scale-110 hover:-rotate-6 transition-all duration-300"
              >
                <Mail size={18} className="group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeUp}>
            <h4 className="font-display text-sm font-bold tracking-widest text-white uppercase mb-4">
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/catalogo', label: 'Catálogo' },
                { to: '/edicoes', label: 'Edições Limitadas' },
                { to: '/vale-presente', label: 'Vale-Presente' },
                { to: '/cupons', label: 'Cupons & Regulamento' },
                { to: '/esgotados', label: 'Esgotados' },
                { to: '/validar', label: 'Validar Peça' },
                { to: '/sobre', label: 'Sobre a Marca' },
                { to: '/contato', label: 'Contato' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-white/50 hover:text-kosmo transition-all duration-300 text-sm"
                  >
                    <span>{link.label}</span>
                    <span className="inline-block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-kosmo">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info */}
          <motion.div variants={fadeUp}>
            <h4 className="font-display text-sm font-bold tracking-widest text-white uppercase mb-4">
              Informações
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-kosmo shrink-0" />
                <span>Estampado sob demanda no Brasil 🇧🇷</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 text-kosmo shrink-0" />
                <span>contato@kosmoroll.co</span>
              </li>
              <li className="relative mt-4 p-3 rounded-xl bg-gradient-to-r from-kosmo/10 to-purple-500/10 border border-kosmo/30 hover:border-kosmo/50 hover:shadow-lg hover:shadow-kosmo/10 transition-all duration-300 group cursor-pointer overflow-hidden" style={{ animation: 'couponGlow 2s ease-in-out infinite' }}>
                <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 20px rgba(255, 0, 130, 0.1)', animation: 'couponPulse 2s ease-in-out infinite' }} />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-kosmo font-bold text-lg tracking-wider">KOSMO10</span>
                    <span className="text-white/60 block text-xs mt-1">
                      10% OFF na primeira compra
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-kosmo text-white text-xs font-semibold rounded-lg hover:bg-kosmo-dark transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText('KOSMO10');
                      alert('Cupom copiado! Aplique no checkout.');
                    }}
                  >
                    Copiar
                  </motion.button>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-white/40 text-xs">
            © 2026 KOSMO ROLL® \ CO. Todos os direitos reservados.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1">
            Feito por{' '}
            <a
              href="https://capybaraholding.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative text-kosmo hover:text-kosmo-light transition-colors font-medium"
            >
              Capybara Holding
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-kosmo-light group-hover:w-full transition-all duration-300" />
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
