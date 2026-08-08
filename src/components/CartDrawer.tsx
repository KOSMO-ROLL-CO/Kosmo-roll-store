import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag, Truck, CheckCircle2, XCircle, Loader2, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useKosmo } from '../context/KosmoContext';
import { formatCurrency, formatCEP, FREE_SHIPPING_THRESHOLD } from '../utils/commerce';
import { assetUrl } from '../utils/asset';

export default function CartDrawer() {
  const {
    state, closeCart, removeItem, updateQuantity, totalItems,
    subtotal, couponCode, couponApplied, couponDiscount,
    applyCoupon, removeCoupon, calculateShipping,
    shippingPrice, shippingDays, shippingCalculated, freeShipping,
    applyGiftCard, removeGiftCard, giftCardDiscount, total,
  } = useCart();
  const { coins, getCoinsDiscount } = useKosmo();
  const coinsDiscount = getCoinsDiscount(subtotal);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponErrorReason, setCouponErrorReason] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [giftError, setGiftError] = useState(false);

  const handleApplyCoupon = () => {
    const res = applyCoupon(couponInput);
    setCouponError(!res.ok);
    setCouponErrorReason(res.ok ? '' : res.reason ?? 'Cupom inválido.');
    if (res.ok) setCouponInput('');
  };

  const handleCalculateShipping = () => {
    if (cepInput.replace(/\D/g, '').length !== 8) return;
    setShippingLoading(true);
    setTimeout(() => {
      calculateShipping(cepInput);
      setShippingLoading(false);
    }, 600);
  };

  const handleApplyGiftCode = () => {
    const ok = applyGiftCard(giftCodeInput);
    setGiftError(!ok);
    if (ok) setGiftCodeInput('');
  };

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-kosmo/10 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-kosmo" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-cosmos">Sacola</h2>
                  <p className="text-xs text-cosmos/50">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                aria-label="Fechar carrinho"
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Logo size="xl" className="mb-4" />
                  <h3 className="font-display font-semibold text-cosmos mb-2">
                    Sua sacola está vazia
                  </h3>
                  <p className="text-sm text-cosmos/50 mb-6">
                    Adicione produtos pra começar sua jornada cósmica
                  </p>
                  <Link
                    to="/catalogo"
                    onClick={closeCart}
                    className="px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                  >
                    Explorar Catálogo
                  </Link>
                </div>
              ) : (
                <>
                  {/* Free shipping progress */}
                  <div className="p-4 rounded-xl bg-kosmo/5 border border-kosmo/10">
                    {freeShipping ? (
                      <p className="text-xs font-semibold text-kosmo flex items-center gap-1.5">
                        <Truck size={14} /> Você ganhou frete grátis! 🎉
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-cosmos/60 mb-2">
                          Faltam <span className="font-bold text-kosmo">{formatCurrency(freeShippingRemaining)}</span> para frete grátis
                        </p>
                        <div className="h-1.5 bg-white rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-kosmo-gradient rounded-full"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <AnimatePresence>
                    {state.items.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.size}-${item.color.name}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 p-4 rounded-xl bg-gray-50"
                      >
                        <div className="w-20 h-24 rounded-lg bg-gradient-to-br from-kosmo/5 to-purple-100 overflow-hidden shrink-0">
                          <img
                            src={assetUrl(item.product.colorImages?.[item.color.name]?.[0] ?? item.product.images[0])}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-semibold text-sm text-cosmos truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.product.id, item.size, item.color.name)}
                              aria-label={`Remover ${item.product.name}`}
                              className="text-cosmos/30 hover:text-red-500 transition-colors shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <p className="text-xs text-cosmos/50 mt-0.5">
                            {item.size} • {item.color.name}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-white rounded-full px-1 py-0.5 shadow-sm">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.color.name,
                                    item.quantity - 1
                                  )
                                }
                                aria-label={`Diminuir quantidade de ${item.product.name}`}
                                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-semibold w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.color.name,
                                    item.quantity + 1
                                  )
                                }
                                aria-label={`Aumentar quantidade de ${item.product.name}`}
                                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <span className="font-display font-bold text-sm text-cosmos">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Shipping calc */}
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck size={16} className="text-kosmo" />
                      <span className="font-display font-semibold text-sm text-cosmos">Calcular Frete</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cepInput}
                        onChange={(e) => setCepInput(formatCEP(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <button
                        onClick={handleCalculateShipping}
                        disabled={cepInput.replace(/\D/g, '').length !== 8 || shippingLoading}
                        className="px-4 py-2.5 rounded-xl bg-cosmos text-white text-sm font-semibold hover:bg-cosmos-light transition-colors disabled:opacity-40 shrink-0"
                      >
                        {shippingLoading ? <Loader2 size={16} className="animate-spin" /> : 'OK'}
                      </button>
                    </div>
                    {shippingCalculated && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center justify-between text-sm"
                      >
                        <span className="text-cosmos/60">
                          {shippingPrice === 0 ? (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={14} /> Frete grátis
                            </span>
                          ) : (
                            <>Entrega em até {shippingDays} {shippingDays === 1 ? 'dia' : 'dias'}</>
                          )}
                        </span>
                        {shippingPrice > 0 && (
                          <span className="font-bold text-cosmos">{formatCurrency(shippingPrice)}</span>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Coupon */}
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={16} className="text-kosmo" />
                      <span className="font-display font-semibold text-sm text-cosmos">Cupom de Desconto</span>
                    </div>
                    {couponApplied ? (
                      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-green-50 border border-green-100">
                        <span className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> {couponCode} aplicado
                        </span>
                        <button
                          onClick={removeCoupon}
                          className="text-xs text-cosmos/50 hover:text-red-500 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value); setCouponError(false); }}
                            className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-cosmos focus:outline-none focus:ring-2 transition-all uppercase ${
                              couponError
                                ? 'border-red-300 focus:ring-red-200'
                                : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
                            }`}
                            placeholder="Cupom"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponInput}
                            className="px-4 py-2.5 rounded-xl bg-cosmos/5 text-cosmos text-sm font-medium hover:bg-cosmos/10 transition-colors disabled:opacity-40 shrink-0"
                          >
                            Aplicar
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <XCircle size={12} /> {couponErrorReason}
                          </p>
                        )}
                        <Link
                          to="/cupons"
                          className="inline-flex items-center gap-1.5 text-xs text-cosmos/40 hover:text-kosmo mt-2 transition-colors"
                        >
                          <Tag size={12} /> Ver regulamento dos cupons
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Gift card */}
                  {state.giftCards.length === 0 && (
                    <div className="p-4 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift size={16} className="text-kosmo" />
                        <span className="font-display font-semibold text-sm text-cosmos">Vale-Presente</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={giftCodeInput}
                          onChange={(e) => { setGiftCodeInput(e.target.value); setGiftError(false); }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-cosmos focus:outline-none focus:ring-2 transition-all uppercase ${
                            giftError
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
                          }`}
                          placeholder="KR-XXXXXX"
                        />
                        <button
                          onClick={handleApplyGiftCode}
                          disabled={!giftCodeInput}
                          className="px-4 py-2.5 rounded-xl bg-cosmos/5 text-cosmos text-sm font-medium hover:bg-cosmos/10 transition-colors disabled:opacity-40 shrink-0"
                        >
                          Aplicar
                        </button>
                      </div>
                      {giftError && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                          <XCircle size={12} /> Código inválido ou já utilizado.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-6 border-t border-gray-100 space-y-3 bg-white">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-cosmos/60">Subtotal</span>
                    <span className="font-semibold text-cosmos">{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Desconto ({couponCode})</span>
                      <span className="font-semibold">- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  {coinsDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-amber-600">
                      <span>Kosmo Coins ({coins} 🪙)</span>
                      <span className="font-semibold">- {formatCurrency(coinsDiscount)}</span>
                    </div>
                  )}
                  {giftCardDiscount > 0 && (
                    <div className="space-y-1">
                      {state.giftCards.map((g) => (
                        <div key={g.code} className="flex justify-between items-center text-sm text-purple-600">
                          <span className="flex items-center gap-1">
                            Vale-presente ({g.code})
                            <button
                              onClick={() => removeGiftCard(g.code)}
                              className="text-cosmos/40 hover:text-red-500 transition-colors"
                              aria-label="Remover vale-presente"
                            >
                              <X size={12} />
                            </button>
                          </span>
                          <span className="font-semibold">- {formatCurrency(g.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-cosmos/60">Frete</span>
                    <span className="font-semibold text-cosmos">
                      {shippingCalculated
                        ? shippingPrice === 0 ? 'Grátis' : formatCurrency(shippingPrice)
                        : 'A calcular'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-display font-bold text-cosmos">Total</span>
                    <span className="font-display font-bold text-xl text-cosmos">
                      {formatCurrency(Math.max(0, total - coinsDiscount))}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 bg-kosmo text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
                >
                  Finalizar Compra
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/catalogo"
                  onClick={closeCart}
                  className="w-full py-3 text-cosmos/60 text-sm font-medium text-center hover:text-kosmo transition-colors block"
                >
                  Continuar comprando
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
