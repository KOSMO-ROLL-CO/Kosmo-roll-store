import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Tag, CheckCircle2, Lock, XCircle, ArrowRight } from 'lucide-react';
import { COUPON_INFO, getCouponInfo, type CouponInfo } from '../utils/commerce';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import Logo from '../components/Logo';

export default function Cupons() {
  const { user, isAuthenticated } = useAuth();
  const { orders } = useOrders();

  const coupons = Object.keys(COUPON_INFO)
    .map((code) => getCouponInfo(code))
    .filter((c): c is CouponInfo => c !== null);

  const userHasOrders = !!user && orders.some((o) => o.userEmail === user.email);

  const getStatus = (coupon: CouponInfo) => {
    if (coupon.active === false) {
      return {
        tone: 'text-red-500',
        badge: 'bg-red-50 text-red-500',
        text: 'Pausado — volte em breve',
        available: false,
      };
    }
    if (coupon.type === 'primeira-compra') {
      if (!isAuthenticated) {
        return {
          tone: 'text-kosmo',
          badge: 'bg-kosmo/10 text-kosmo',
          text: 'Crie uma conta ou faça login para usar',
          available: false,
        };
      }
      if (userHasOrders) {
        return {
          tone: 'text-red-500',
          badge: 'bg-red-50 text-red-500',
          text: 'Não disponível — você já fez uma compra',
          available: false,
        };
      }
      return {
        tone: 'text-green-600',
        badge: 'bg-green-50 text-green-600',
        text: 'Disponível para a sua primeira compra',
        available: true,
      };
    }
    return {
      tone: 'text-green-600',
      badge: 'bg-green-50 text-green-600',
      text: 'Disponível para qualquer cliente',
      available: true,
    };
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-kosmo/10 mb-4">
            <Tag size={28} className="text-kosmo" />
          </div>
          <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">Kosmo Roll</span>
          <h1 className="font-display text-4xl font-bold text-cosmos mt-2">
            Cupons & Regulamento
          </h1>
          <p className="text-cosmos/50 max-w-lg mx-auto mt-3">
            Tudo o que você precisa saber antes de aplicar um cupom na sua compra.
            Leia o regulamento de cada um para não ser surpreendido. 🚀
          </p>
        </motion.div>

        <div className="space-y-6">
          {coupons.map((coupon, index) => {
            const status = getStatus(coupon);
            return (
              <motion.div
                key={coupon.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-cosmos/5 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kosmo to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-kosmo/25">
                        <Tag size={26} className="text-white" />
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold tracking-wider text-cosmos">
                          {coupon.code}
                        </p>
                        <p className="text-sm font-semibold text-kosmo">{coupon.title}</p>
                      </div>
                    </div>
                    <span className="text-3xl font-display font-bold text-cosmos">
                      {coupon.discount * 100}% OFF
                    </span>
                  </div>

                  <p className="text-sm text-cosmos/60 mt-4 leading-relaxed">{coupon.description}</p>

                  {/* Status */}
                  <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.badge}`}>
                    {status.available ? <CheckCircle2 size={14} /> : <Lock size={14} />}
                    {status.text}
                  </div>

                  {/* Rules */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-display font-bold text-sm text-cosmos mb-3">
                      Regulamento
                    </h3>
                    <ul className="space-y-2">
                      {coupon.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-cosmos/60">
                          <span className="text-kosmo font-bold mt-0.5 shrink-0">{i + 1}.</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    {status.available ? (
                      <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
                      >
                        Aproveitar agora <ArrowRight size={14} />
                      </Link>
                    ) : coupon.type === 'primeira-compra' && !isAuthenticated ? (
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to="/cadastro"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
                        >
                          Criar conta <ArrowRight size={14} />
                        </Link>
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-cosmos/5 text-cosmos rounded-full text-sm font-semibold hover:bg-cosmos/10 transition-colors"
                        >
                          Fazer login
                        </Link>
                      </div>
                    ) : (
                      <p className="flex items-center gap-1.5 text-sm text-cosmos/40">
                        <XCircle size={14} /> Este benefício não está mais disponível para a sua conta.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* General rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-3xl bg-cosmos text-white"
        >
          <h3 className="font-display font-bold text-lg mb-4">Regras gerais da loja</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Cupons não são cumulativos entre si — use um por pedido.</li>
            <li>• Cupons não se aplicam à compra de vale-presentes.</li>
            <li>• Compras só podem ser finalizadas por clientes logados.</li>
            <li>• Descontos são calculados sobre o subtotal, antes do frete.</li>
            <li>• A Kosmo Roll pode alterar ou encerrar promoções a qualquer momento.</li>
          </ul>
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-sm text-cosmos/50 hover:text-kosmo transition-colors"
          >
            <Logo size="sm" />
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
