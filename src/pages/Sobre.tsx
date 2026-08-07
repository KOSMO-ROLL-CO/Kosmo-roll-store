import { motion } from 'framer-motion';
import { Heart, Palette, Globe, Star, Hash, Rocket, Target, Compass, History } from 'lucide-react';
import { Instagram, Satellite } from '../components/Icons';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

const pillars = [
  {
    icon: Rocket,
    title: 'Missão',
    description:
      'Conectar a energia da rua com a vastidão do cosmos, entregando streetwear artístico, exclusivo e feito sob demanda — sem estoque parado, sem desperdício.',
  },
  {
    icon: Target,
    title: 'Visão',
    description:
      'Ser referência em moda urbana autoral no Brasil: cada peça numerada como uma cápsula do tempo e cada drop como um evento.',
  },
  {
    icon: Compass,
    title: 'Propósito',
    description:
      'Você não compra uma camiseta, você entra pra tripulação. Construir uma comunidade que se identifica com o céu, o asfalto e o futuro.',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'A faísca',
    description:
      'Tudo começou com sketches rabiscados entre o concreto e o céu: estampas que misturavam planetas, satélites e o caos urbano.',
  },
  {
    year: '2024',
    title: 'Primeira órbita',
    description:
      'Lançamos o primeiro lote experimental. Cada peça impressa sob demanda, à mão. O retorno? A tripulação pediu mais.',
  },
  {
    year: '2025',
    title: 'Edições numeradas',
    description:
      'Nascem as edições limitadas com numeração a laser e certificado de autenticidade digital. Cada peça vira uma cápsula do tempo.',
  },
  {
    year: '2026',
    title: 'Fora de órbita',
    description:
      'A marca expande: catálogo completo, drops, cofre de membro e uma comunidade que veste o universo. E isso é só o começo.',
  },
];

const values = [
  {
    icon: Palette,
    title: 'Estampado Sob Demanda',
    description: 'Cada peça é produzida especialmente pra você. Sem estoque parado, sem desperdício.',
  },
  {
    icon: Hash,
    title: 'Edições Numeradas',
    description: 'Nossas edições limitadas vêm com numeração exclusiva em laser. Únicas e irrepetíveis.',
  },
  {
    icon: Globe,
    title: 'Conexão Urbana',
    description: 'Nascemos da rua, do asfalto, do concreto. Mas nosso olhar sempre foi pro céu.',
  },
  {
    icon: Heart,
    title: 'Feito com Amor',
    description: 'Cada estampa é uma obra de arte. Cada peça carrega a essência da Kosmo Roll.',
  },
];

export default function Sobre() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-kosmo/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo/5 border border-kosmo/10 text-kosmo text-sm font-medium mb-8"
          >
            <Logo size="sm" />
            Nossa História
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-cosmos leading-[0.9] mb-6"
          >
            Conexão Urbana
            <br />
            <span className="text-gradient">Fora de Órbita</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-cosmos/60 max-w-2xl mx-auto leading-relaxed"
          >
            A Kosmo Roll nasceu da vontade de criar streetwear com identidade.
            Cada estampa conta uma história, cada edição é uma cápsula do tempo.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-kosmo/10 via-purple-100/50 to-kosmo/5 flex items-center justify-center">
              <Logo size="xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">
              Quem Somos
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos">
              Uma marca nascida do universo
            </h2>
            <div className="space-y-4 text-cosmos/60 leading-relaxed">
              <p>
                A Kosmo Roll® \ CO. nasceu com uma missão simples: criar peças que conectam
                a energia urbana com a vastidão do cosmos. Não somos apenas uma marca de roupa —
                somos uma experiência.
              </p>
              <p>
                Nossas estampas são criadas com cuidado artístico e estampadas sob demanda,
                garantindo que cada peça seja única. As edições limitadas vêm numeradas em laser,
                transformando cada item em uma cápsula do tempo.
              </p>
              <p>
                Nosso lema é "Conexão Urbana Fora de Órbita" — e não é à toa. Acreditamos que
                o streetwear pode ser arte, pode ser exclusivo, pode ser cósmico.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision / Purpose */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">
              Missão, Visão & Propósito
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos mt-2">
              Pra onde estamos apontando
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-kosmo/20 hover:shadow-xl hover:shadow-kosmo/5 transition-all duration-500 hover-lift"
              >
                <div className="w-14 h-14 rounded-2xl bg-kosmo/10 flex items-center justify-center mb-5">
                  <pillar.icon size={24} className="text-kosmo" />
                </div>
                <h3 className="font-display text-xl font-bold text-cosmos mb-3">{pillar.title}</h3>
                <p className="text-cosmos/60 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">
              Nossos Valores
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos mt-2">
              O que nos move
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-kosmo/20 hover:shadow-xl hover:shadow-kosmo/5 transition-all duration-500 text-center hover-lift"
              >
                <div className="w-14 h-14 rounded-2xl bg-kosmo/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon size={24} className="text-kosmo" />
                </div>
                <h3 className="font-display font-bold text-cosmos mb-2">{value.title}</h3>
                <p className="text-sm text-cosmos/50 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '100%', label: 'Estampado sob demanda' },
              { value: '🇧🇷', label: 'Feito no Brasil' },
              { value: '#FF0082', label: 'Nossa cor' },
              { value: '∞', label: 'Possibilidades cósmicas' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white border border-gray-100"
              >
                <div className="font-display text-3xl font-bold text-kosmo mb-2">{stat.value}</div>
                <div className="text-sm text-cosmos/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-kosmo text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5">
              <History size={14} /> Linha do tempo
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmos mt-2">
              Nossa trajetória
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-kosmo via-purple-300 to-cosmos/10" />
            <div className="space-y-10">
              {milestones.map((item, index) => (
                <motion.div
                  key={`${item.year}-${item.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center gap-6 ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-kosmo ring-4 ring-white shadow-lg" />
                  <div className={`flex-1 lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-kosmo/5 transition-all duration-300">
                      <span className="font-display font-bold text-2xl text-kosmo">{item.year}</span>
                      <h3 className="font-display font-bold text-cosmos mb-1 mt-1">{item.title}</h3>
                      <p className="text-sm text-cosmos/60 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-cosmos text-white overflow-hidden">
        {/* Starfield */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 70% 15%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 40% 80%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 10% 70%, rgba(255,255,255,0.35), transparent)',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-kosmo/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 mb-6">
                <span className="w-2 h-2 rounded-full bg-kosmo animate-pulse" />
                Comunicados oficiais
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] mb-6">
                Fazendo história
                <br />
                <span className="text-gradient">no Instagram</span>
              </h2>
              <p className="text-white/60 max-w-md leading-relaxed mb-8">
                Acompanhe nosso universo pelo @kosmoroll.co. Lançamentos, bastidores,
                bastidores e muito cosmos — tudo em tempo real, direto da órbita.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href="https://instagram.com/kosmoroll.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-kosmo text-white rounded-full font-semibold hover:bg-kosmo-light transition-all duration-300 shadow-xl shadow-kosmo/25 hover:scale-105 hover:shadow-kosmo/40"
                >
                  <Instagram size={18} />
                  @kosmoroll.co
                </a>
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Star size={18} />
                  Ver Catálogo
                </Link>
              </div>
            </motion.div>

            {/* Floating mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[420px] sm:h-[480px] flex items-center justify-center"
            >
              {/* Orbit rings */}
              <div className="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full border border-white/10" />
              <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-white/10" />
              <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full border border-kosmo/20" />

              {/* Orbiting satellite */}
              <div className="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] animate-spin-slow pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Satellite size={22} className="text-white drop-shadow-[0_0_8px_rgba(255,0,130,0.6)]" />
                </div>
              </div>

              {/* Profile card */}
              <div className="relative w-[240px] sm:w-[280px] rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 text-center shadow-2xl shadow-black/40 animate-float">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-kosmo to-purple-600 text-[10px] font-bold uppercase tracking-wider">
                  Tripulação
                </div>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-kosmo to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-kosmo/40">
                  <Logo size="xl" className="!w-20 !h-20" />
                </div>
                <div className="font-display font-bold text-lg mb-1">@kosmoroll.co</div>
                <div className="text-xs text-white/50 mb-5">Fora de órbita desde 2024</div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { n: '1.2k', l: 'Posts' },
                    { n: '8.4k', l: 'Seguidores' },
                    { n: '∞', l: 'Cosmos' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 py-2">
                      <div className="font-display font-bold text-white">{s.n}</div>
                      <div className="text-[10px] text-white/40">{s.l}</div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://instagram.com/kosmoroll.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold rounded-full py-2.5 bg-kosmo text-white hover:bg-kosmo-light shadow-lg shadow-kosmo/25 transition-all duration-300"
                >
                  <Instagram size={15} />
                  Seguir
                </a>
              </div>

              {/* Floating stickers */}
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-6 right-2 sm:top-10 sm:right-10 w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-2xl shadow-lg"
              >
                🛸
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0], rotate: [4, -4, 4] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-10 left-0 sm:bottom-16 sm:left-6 w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-2xl shadow-lg"
              >
                🌌
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-2 right-4 sm:bottom-6 sm:right-0 w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-xl shadow-lg"
              >
                🔭
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
