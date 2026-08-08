import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Hash, Rocket, Clock, CheckCircle2, Mail, Lock, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../store/catalogStore';
import { EDITION_HISTORY } from '../data/editions';
import ProductCard from '../components/ProductCard';
import CountdownTimer from '../components/CountdownTimer';
import Logo from '../components/Logo';
import { joinWaitlist } from '../utils/waitlist';

export default function Edicoes() {
  const limitedProducts = useCatalog().filter((p) => p.edition.isLimited);
  const [email, setEmail] = useState('');
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinWaitlist(email);
    setWaitlistMessage(result.message);
    setWaitlistError(!result.ok);
    if (result.ok) setEmail('');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-kosmo/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo/5 border border-kosmo/10 text-kosmo text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            Edições Numeradas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-cosmos leading-[0.9] mb-6"
          >
            Peças Únicas,
            <br />
            <span className="text-gradient">Numeração Gravada</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-cosmos/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Cada edição limitada vem com numeração exclusiva em laser.
            Quando esgota, acabou. Não tem segunda chance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            <div className="p-5 rounded-2xl bg-white border border-gray-100">
              <Hash size={24} className="text-kosmo mx-auto mb-2" />
              <h3 className="font-display font-bold text-sm text-cosmos">Numeração Única</h3>
              <p className="text-xs text-cosmos/50 mt-1">Cada peça tem seu número gravado em laser</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-gray-100">
              <Sparkles size={24} className="text-kosmo mx-auto mb-2" />
              <h3 className="font-display font-bold text-sm text-cosmos">Produção Limitada</h3>
              <p className="text-xs text-cosmos/50 mt-1">Quantidade fixa por edição</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-gray-100">
              <span className="text-2xl block mb-2">🔥</span>
              <h3 className="font-display font-bold text-sm text-cosmos">Quando Esgota, Acabou</h3>
              <p className="text-xs text-cosmos/50 mt-1">Sem reposição. Sem segunda chance.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pre-venda / Waitlist */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-cosmos text-white p-8 sm:p-12"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-kosmo/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kosmo/20 text-kosmo text-xs font-bold uppercase tracking-wider mb-6">
                  <Rocket size={14} />
                  Pré-venda da próxima drop
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                  Não perca o
                  <br />
                  <span className="text-kosmo">lançamento</span>
                </h2>
                <p className="text-white/60 mb-6 max-w-md">
                  A próxima edição numerada chega em breve. Entre na lista de pré-venda e garanta
                  acesso antecipado antes de abrir pro público.
                </p>

                <div className="mb-6">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock size={12} /> Abertura em
                  </p>
                  <CountdownTimer endDate="2026-08-20T12:00:00-03:00" size="lg" variant="dark" />
                </div>

                <form onSubmit={handleWaitlist} className="space-y-3 max-w-md">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setWaitlistMessage(null); }}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-kosmo/50 focus:border-kosmo transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-kosmo text-white rounded-xl font-semibold text-sm hover:bg-kosmo-light transition-colors shadow-lg shadow-kosmo/30"
                    >
                      Entrar na lista
                    </button>
                  </div>
                  {waitlistMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-medium flex items-center gap-1.5 ${
                        waitlistError ? 'text-red-300' : 'text-green-300'
                      }`}
                    >
                      {!waitlistError && <CheckCircle2 size={14} />}
                      {waitlistMessage}
                    </motion.p>
                  )}
                  <p className="text-xs text-white/40">
                    Sem spam. Aviso só quando a drop abrir.
                  </p>
                </form>
              </div>

              <div className="flex justify-center">
                <div className="text-center">
                  <Logo size="xl" className="mx-auto mb-4 opacity-80" />
                  <p className="font-display font-bold text-2xl text-white/80">DROP 02</p>
                  <p className="text-sm text-white/40">Em produção • 50 peças numeradas</p>
                  <div className="mt-4 px-4 py-2 rounded-full bg-white/10 border border-white/20 inline-flex items-center gap-2 text-xs text-white/70">
                    <Lock size={12} /> Disponível apenas para a lista e Cofre de Membro
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">Disponíveis agora</span>
          <h2 className="font-display text-3xl font-bold text-cosmos mt-2">Edições Ativas</h2>
        </motion.div>

        {limitedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {limitedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Logo size="xl" className="block mb-4" />
            <h3 className="font-display font-semibold text-xl text-cosmos mb-2">
              Nenhuma edição limitada disponível
            </h3>
            <p className="text-cosmos/50 mb-6">
              Fique de olho! Novas edições lançadas em breve.
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold"
            >
              Ver Catálogo <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* Histórico de edições */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-kosmo text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5">
              <History size={14} /> Arquivo da marca
            </span>
            <h2 className="font-display text-3xl font-bold text-cosmos mt-2">Histórico de Edições</h2>
            <p className="text-cosmos/50 max-w-md mx-auto mt-2">
              Cada drop que já aconteceu virou lenda. Todas esgotadas — sem exceção.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-kosmo via-purple-300 to-cosmos/10" />
            <div className="space-y-10">
              {EDITION_HISTORY.map((edition, index) => (
                <motion.div
                  key={`${edition.year}-${edition.name}`}
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
                      <div className="flex items-center gap-2 mb-2 justify-between">
                        <span className="font-display font-bold text-2xl text-cosmos/20">{edition.year}</span>
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: edition.accent }}
                        >
                          Esgotada
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-cosmos mb-1">{edition.name}</h3>
                      <p className="text-xs text-cosmos/50 mb-2">{edition.pieces} peças numeradas</p>
                      <p className="text-sm text-cosmos/60">{edition.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cofre de Membro CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center p-8 sm:p-12 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-kosmo/5"
          >
            <span className="text-5xl block mb-4">🔐</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-cosmos mb-3">
              Cofre de Membro
            </h2>
            <p className="text-cosmos/50 max-w-lg mx-auto mb-8">
              Quem tem peça numerada entra pra tripulação. Acesso antecipado às drops,
              numeração reservada e brindes exclusivos.
            </p>
            <Link
              to="/minha-conta"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cosmos text-white rounded-full font-semibold hover:bg-cosmos-light transition-all duration-300 shadow-xl hover:scale-105"
            >
              Ativar meu Cofre <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
