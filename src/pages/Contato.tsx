import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MessageCircle, MapPin, Clock } from 'lucide-react';
import { Instagram } from '../components/Icons';

export default function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the form data to a backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-kosmo/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo/5 border border-kosmo/10 text-kosmo text-sm font-medium mb-8"
          >
            <MessageCircle size={14} />
            Fale Conosco
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-cosmos leading-[0.9] mb-6"
          >
            Vamos
            <br />
            <span className="text-gradient">Conversar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-cosmos/60 max-w-xl mx-auto"
          >
            Dúvidas, sugestões, parcerias? Estamos aqui pra ouvir. Manda uma mensagem!
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-cosmos mb-6">
                Canais de Contato
              </h2>
              <div className="space-y-4">
                <a
                  href="https://instagram.com/kosmoroll.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-kosmo/20 hover:shadow-lg hover:shadow-kosmo/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-kosmo/10 flex items-center justify-center group-hover:bg-kosmo group-hover:text-white transition-all">
                    <Instagram size={20} className="text-kosmo group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-cosmos text-sm">Instagram</h3>
                    <p className="text-xs text-cosmos/50">@kosmoroll.co</p>
                  </div>
                </a>

                <a
                  href="mailto:contato@kosmoroll.co"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-kosmo/20 hover:shadow-lg hover:shadow-kosmo/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-kosmo/10 flex items-center justify-center group-hover:bg-kosmo group-hover:text-white transition-all">
                    <Mail size={20} className="text-kosmo group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-cosmos text-sm">E-mail</h3>
                    <p className="text-xs text-cosmos/50">contato@kosmoroll.co</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-kosmo/10 flex items-center justify-center">
                    <MapPin size={20} className="text-kosmo" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-cosmos text-sm">Localização</h3>
                    <p className="text-xs text-cosmos/50">Brasil 🇧🇷 — Estampado sob demanda</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-kosmo/10 flex items-center justify-center">
                    <Clock size={20} className="text-kosmo" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-cosmos text-sm">Horário</h3>
                    <p className="text-xs text-cosmos/50">Seg-Sex: 9h às 18h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-6 rounded-2xl bg-kosmo/5 border border-kosmo/10">
              <h3 className="font-display font-bold text-cosmos text-sm mb-3">
                Cupom de Boas-vindas
              </h3>
              <p className="text-sm text-cosmos/60 mb-3">
                Use <span className="font-bold text-kosmo">KOSMO10</span> na sua primeira compra e ganhe 10% OFF!
              </p>
              <p className="text-xs text-cosmos/40">
                Válido para primeira compra. Não acumula com outras promoções.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-kosmo/5">
              <h2 className="font-display text-xl font-bold text-cosmos mb-6">
                Envie uma mensagem
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <span className="text-5xl block mb-4">🛸</span>
                  <h3 className="font-display font-bold text-xl text-cosmos mb-2">
                    Mensagem enviada!
                  </h3>
                  <p className="text-cosmos/50">
                    Obrigado! Vamos responder o mais rápido possível.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-cosmos mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos placeholder:text-cosmos/30 focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-cosmos mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos placeholder:text-cosmos/30 focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cosmos mb-2">
                      Assunto
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                    >
                      <option value="">Selecione...</option>
                      <option value="duvida">Dúvida sobre produto</option>
                      <option value="pedido">Acompanhar pedido</option>
                      <option value="troca">Troca / Devolução</option>
                      <option value="parceria">Parceria / Colaboração</option>
                      <option value="outro">Outro assunto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cosmos mb-2">
                      Mensagem
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos placeholder:text-cosmos/30 focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all resize-none"
                      placeholder="Como podemos ajudar?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-kosmo text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-kosmo-dark transition-all duration-300 shadow-xl shadow-kosmo/25 hover:shadow-2xl hover:shadow-kosmo/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send size={16} />
                    Enviar Mensagem
                  </button>

                  <p className="text-xs text-cosmos/40 text-center">
                    Respondemos em até 24h durante dias úteis.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
