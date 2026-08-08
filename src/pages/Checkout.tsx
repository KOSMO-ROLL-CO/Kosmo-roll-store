import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Truck,
  Shield,
  Check,
  ArrowLeft,
  ShoppingCart,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Gift,
  Plus,
  Coins,
  Info,
} from 'lucide-react';
import { useCatalog } from '../store/catalogStore';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useKosmo } from '../context/KosmoContext';
import { useOrders } from '../context/OrderContext';
import type { Address } from '../context/AuthContext';
import Logo from '../components/Logo';
import CreditCardDisplay from '../components/CreditCardDisplay';
import { COUPON_INFO, getCouponInfo, type CouponInfo } from '../utils/commerce';
import { detectCardBrand, formatCardNumber as formatCard, formatExpiry as formatExp, luhnCheck, BRAND_INFO, type CardBrand } from '../utils/cardValidation';
import { assetUrl } from '../utils/asset';

type CheckoutStep = 'info' | 'payment' | 'confirmation';
type PaymentMethod = 'pix' | 'card' | 'boleto';

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  installments: string;
}

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
};



const BR_STATES = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' }, { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' }, { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' }, { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' }, { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' },
];

export default function Checkout() {
  const {
    state, addItem, clearCart, totalItems, subtotal,
    couponCode, couponApplied, couponDiscount, applyCoupon, removeCoupon,
    calculateShipping, shippingPrice, shippingCalculated, freeShipping,
    applyGiftCard, removeGiftCard, giftCardDiscount,
  } = useCart();
  const { coins, getCoinsDiscount, getUsableCoins } = useKosmo();
  const coinsDiscount = getCoinsDiscount(subtotal);
  const usableCoins = getUsableCoins(subtotal);
  const { orders, addOrder } = useOrders();
  const [step, setStep] = useState<CheckoutStep>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponErrorReason, setCouponErrorReason] = useState('');
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [giftError, setGiftError] = useState(false);
  const [isLookingUpCEP, setIsLookingUpCEP] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);

  const { user, isAuthenticated, savedAddresses, addAddress } = useAuth();
  const products = useCatalog();

  const userHasOrders = !!user && orders.some((o) => o.userEmail === user.email);

  const availableCoupons = Object.keys(COUPON_INFO)
    .map((code) => getCouponInfo(code))
    .filter((c): c is CouponInfo => c !== null)
    .filter((c) => c.active !== false);

  const getCouponStatus = (coupon: CouponInfo) => {
    if (coupon.active === false) return { available: false, text: 'Pausado — volte em breve', tone: 'text-red-500' };
    if (coupon.type === 'primeira-compra') {
      if (!isAuthenticated) return { available: false, text: 'Exige conta', tone: 'text-kosmo' };
      if (userHasOrders) return { available: false, text: 'Já usou', tone: 'text-red-500' };
      return { available: true, text: 'Primeira compra', tone: 'text-green-600' };
    }
    return { available: true, text: 'Disponível', tone: 'text-green-600' };
  };

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', cpf: '',
    address: '', number: '', complement: '', neighborhood: '',
    city: '', state: '', zipCode: '',
  });

  const [cardData, setCardData] = useState<CardData>({
    number: '', name: '', expiry: '', cvv: '', installments: '1',
  });

  // Auto-select default address on mount
  useEffect(() => {
    if (isAuthenticated && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
      setFormData((prev) => ({
        ...prev,
        zipCode: defaultAddr.zipCode,
        address: defaultAddr.address,
        number: defaultAddr.number,
        complement: defaultAddr.complement,
        neighborhood: defaultAddr.neighborhood,
        city: defaultAddr.city,
        state: defaultAddr.state,
      }));
    }
  }, [isAuthenticated, savedAddresses]);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setShowNewAddress(false);
    setFormData((prev) => ({
      ...prev,
      zipCode: addr.zipCode,
      address: addr.address,
      number: addr.number,
      complement: addr.complement,
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
    }));
  };

  const handleSaveNewAddress = () => {
    if (!formData.zipCode || !formData.address || !formData.number || !formData.neighborhood || !formData.city || !formData.state) return;
    addAddress({
      label: savedAddresses.length === 0 ? 'Casa' : `Endereço ${savedAddresses.length + 1}`,
      zipCode: formData.zipCode,
      address: formData.address,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      isDefault: savedAddresses.length === 0,
    });
  };

  const total = Math.max(0, subtotal - couponDiscount - giftCardDiscount - coinsDiscount) + shippingPrice;
  const pixActive = step === 'payment' && paymentMethod === 'pix';

  const suggestions = useMemo(() => {
    const inCartIds = new Set(state.items.map((i) => i.product.id));
    const cartCategories = new Set(state.items.map((i) => i.product.category));
    return products
      .filter((p) => !inCartIds.has(p.id) && cartCategories.has(p.category))
      .slice(0, 3);
  }, [state.items, products]);

  const [justAddedSuggestion, setJustAddedSuggestion] = useState<string | null>(null);

  const handleAddSuggestion = (product: Product) => {
    addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    setJustAddedSuggestion(product.id);
    window.setTimeout(() => setJustAddedSuggestion(null), 1600);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const lookupCEP = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setIsLookingUpCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setIsLookingUpCEP(false);
    }
  }, []);

  useEffect(() => {
    const digits = formData.zipCode.replace(/\D/g, '');
    if (digits.length === 8) {
      lookupCEP(formData.zipCode);
      calculateShipping(formData.zipCode);
    }
  }, [formData.zipCode, lookupCEP, calculateShipping]);

  const validateInfo = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.includes('@')) newErrors.email = 'Email inválido';
    if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
    if (formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = 'CPF inválido';
    if (!formData.zipCode.replace(/\D/g, '').length) newErrors.zipCode = 'CEP é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.number.trim()) newErrors.number = 'Número é obrigatório';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'Estado é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInfo()) {
      setStep('payment');
    }
  };

  const handleConfirmPayment = () => {
    if (couponApplied && couponCode === 'KOSMO10' && orders.some((o) => o.userEmail === user?.email)) {
      setCouponError(true);
      setCouponErrorReason('Este cupom vale somente para a primeira compra.');
      removeCoupon();
      setStep('info');
      return;
    }

    if (user) {
      addOrder({
        userEmail: user.email,
        items: state.items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.size,
          color: item.color.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: paymentMethod === 'pix' ? total * 0.95 : total,
        paymentMethod,
        address: {
          street: formData.address,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      });
    }

    setStep('confirmation');
    clearCart();
  };

  const handleApplyCoupon = () => {
    const res = applyCoupon(couponInput);
    setCouponError(!res.ok);
    setCouponErrorReason(res.ok ? '' : res.reason ?? 'Cupom inválido.');
    if (res.ok) setCouponInput('');
  };

  const handleApplyGiftCode = () => {
    const ok = applyGiftCard(giftCodeInput);
    setGiftError(!ok);
    if (ok) setGiftCodeInput('');
  };

  const handleUseKosmo10 = () => {
    const res = applyCoupon('KOSMO10');
    setCouponError(!res.ok);
    setCouponErrorReason(res.ok ? '' : res.reason ?? 'Cupom inválido.');
  };

  const handleApplyCouponFromModal = (code: string) => {
    const res = applyCoupon(code);
    setCouponError(!res.ok);
    setCouponErrorReason(res.ok ? '' : res.reason ?? 'Cupom inválido.');
    if (res.ok) {
      setCouponInput('');
      setCouponModalOpen(false);
    }
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCard(value);
    const brand = detectCardBrand(formatted);
    setCardBrand(brand);
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExp(value);
    setCardData((prev) => ({ ...prev, expiry: formatted }));
  };

  const isCardNumberValid = cardData.number.replace(/\D/g, '').length === BRAND_INFO[cardBrand].maxLength && luhnCheck(cardData.number);
  const isExpiryValid = cardData.expiry.length === 5 && parseInt(cardData.expiry.slice(0, 2)) >= 1 && parseInt(cardData.expiry.slice(0, 2)) <= 12;
  const isCVVValid = cardData.cvv.length === BRAND_INFO[cardBrand].cvvLength;
  const isCardNameValid = cardData.name.trim().split(/\s+/).filter((w) => w.length >= 2).length >= 2;

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-gray-50 border text-cosmos focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
    }`;

  const cardInstallments = [
    { value: '1', label: '1x sem juros' },
    { value: '2', label: '2x sem juros' },
    { value: '3', label: '3x sem juros' },
    { value: '6', label: '6x sem juros' },
    { value: '12', label: '12x com juros' },
  ];

  // ─── REQUIRED LOGIN ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          <span className="text-7xl block mb-6">🔒</span>
          <h1 className="font-display text-3xl font-bold text-cosmos mb-3">
            Faça login para comprar
          </h1>
          <p className="text-cosmos/50 mb-8">
            Para garantir seu cupom de primeira compra e acompanhar seus pedidos,
            é preciso ter uma conta. Leva menos de 1 minuto.
          </p>
          <div className="space-y-3">
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-4 bg-kosmo text-white rounded-full font-semibold text-sm block hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
            >
              Fazer Login
            </Link>
            <Link
              to="/cadastro?redirect=/checkout"
              className="w-full py-4 bg-cosmos text-white rounded-full font-semibold text-sm block hover:bg-cosmos/90 transition-colors"
            >
              Criar minha conta
            </Link>
            <Link
              to="/catalogo"
              className="w-full py-3 text-cosmos/50 text-sm font-medium block hover:text-kosmo transition-colors"
            >
              Continuar comprando
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── EMPTY CART ───
  if (state.items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-7xl block mb-6">🛒</span>
          <h1 className="font-display text-3xl font-bold text-cosmos mb-3">Sacola vazia</h1>
          <p className="text-cosmos/50 mb-8">Adicione produtos antes de finalizar a compra.</p>
          <Link
            to="/catalogo"
            className="px-8 py-4 bg-kosmo text-white rounded-full font-semibold text-sm hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
          >
            Explorar Catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── CONFIRMATION ───
  if (step === 'confirmation') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-md w-full text-center p-8 rounded-3xl bg-white border border-gray-100 shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <Check size={32} className="text-green-500" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-cosmos mb-3">Pedido Confirmado! 🎉</h1>
          <p className="text-cosmos/50 mb-2">Obrigado pela compra! Seu pedido foi recebido com sucesso.</p>
          <p className="text-sm text-cosmos/40 mb-8">Você receberá um e-mail com os detalhes e o rastreio.</p>
          <div className="space-y-3">
            <Link
              to="/catalogo"
              className="w-full py-3 bg-kosmo text-white rounded-full font-semibold text-sm block hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
            >
              Continuar Comprando
            </Link>
            <Link to="/" className="w-full py-3 text-cosmos/50 text-sm font-medium block hover:text-kosmo transition-colors">
              Voltar pra Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT ───
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/catalogo" className="flex items-center gap-2 text-sm text-cosmos/50 hover:text-kosmo transition-colors">
              <ArrowLeft size={14} /> Voltar ao catálogo
            </Link>
            <h1 className="font-display text-xl font-bold text-cosmos">Checkout</h1>
            <div className="w-24" />
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {[
              { id: 'info', label: 'Dados' },
              { id: 'payment', label: 'Pagamento' },
              { id: 'confirmation', label: 'Confirmação' },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.id
                      ? 'bg-kosmo text-white shadow-lg shadow-kosmo/25'
                      : i < ['info', 'payment', 'confirmation'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-cosmos/40'
                  }`}
                >
                  {i < ['info', 'payment', 'confirmation'].indexOf(step) ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${step === s.id ? 'text-kosmo' : 'text-cosmos/40'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: INFO ── */}
              {step === 'info' && (
                <motion.form
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmitInfo}
                  className="space-y-8"
                >
                  {/* Personal Info */}
                  <div className="p-6 rounded-2xl bg-white border border-gray-100">
                    <h2 className="font-display font-bold text-cosmos mb-6 flex items-center gap-2">
                      <span className="text-kosmo">01</span> Dados Pessoais
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Nome completo</label>
                        <input type="text" required value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className={fieldClass('name')} placeholder="Seu nome completo" />
                        {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">E-mail</label>
                        <input type="email" required value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className={fieldClass('email')} placeholder="seu@email.com" />
                        {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Telefone</label>
                        <input type="tel" required value={formData.phone}
                          onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                          className={fieldClass('phone')} placeholder="(11) 99999-9999" />
                        {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">CPF</label>
                        <input type="text" required value={formData.cpf}
                          onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                          className={fieldClass('cpf')} placeholder="000.000.000-00" />
                        {errors.cpf && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.cpf}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="p-6 rounded-2xl bg-white border border-gray-100">
                    <h2 className="font-display font-bold text-cosmos mb-6 flex items-center gap-2">
                      <span className="text-kosmo">02</span> Endereço de Entrega
                    </h2>

                    {/* Saved addresses */}
                    {isAuthenticated && savedAddresses.length > 0 && !showNewAddress && (
                      <div className="space-y-3 mb-6">
                        <p className="text-sm text-cosmos/60">Seus endereços salvos:</p>
                        {savedAddresses.map((addr) => (
                          <motion.label
                            key={addr.id}
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-kosmo bg-kosmo/5 shadow-md shadow-kosmo/10'
                                : 'border-gray-200 hover:border-kosmo/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedAddressId === addr.id}
                              onChange={() => handleSelectAddress(addr)}
                              className="w-4 h-4 text-kosmo focus:ring-kosmo/20 mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-cosmos">{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 rounded-full bg-kosmo/10 text-kosmo text-[10px] font-bold">Padrão</span>
                                )}
                              </div>
                              <p className="text-xs text-cosmos/50 mt-1">
                                {addr.address}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ''}
                              </p>
                              <p className="text-xs text-cosmos/40">
                                {addr.neighborhood} - {addr.city}/{addr.state} • CEP: {addr.zipCode}
                              </p>
                            </div>
                          </motion.label>
                        ))}
                        <button
                          type="button"
                          onClick={() => setShowNewAddress(true)}
                          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-cosmos/50 hover:border-kosmo/50 hover:text-kosmo transition-all"
                        >
                          + Usar novo endereço
                        </button>
                      </div>
                    )}

                    {(showNewAddress || !isAuthenticated || savedAddresses.length === 0) && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">CEP</label>
                        <div className="relative">
                          <input type="text" required value={formData.zipCode}
                            onChange={(e) => updateField('zipCode', formatCEP(e.target.value))}
                            className={`${fieldClass('zipCode')} pr-10`} placeholder="00000-000" />
                          {isLookingUpCEP && (
                            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-kosmo animate-spin" />
                          )}
                        </div>
                        {errors.zipCode && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.zipCode}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Endereço</label>
                        <input type="text" required value={formData.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          className={fieldClass('address')} placeholder="Rua, Avenida..." />
                        {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.address}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Número</label>
                        <input type="text" required value={formData.number}
                          onChange={(e) => updateField('number', e.target.value)}
                          className={fieldClass('number')} placeholder="123" />
                        {errors.number && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.number}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Complemento</label>
                        <input type="text" value={formData.complement}
                          onChange={(e) => updateField('complement', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                          placeholder="Apto, Bloco..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Bairro</label>
                        <input type="text" required value={formData.neighborhood}
                          onChange={(e) => updateField('neighborhood', e.target.value)}
                          className={fieldClass('neighborhood')} placeholder="Bairro" />
                        {errors.neighborhood && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.neighborhood}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Cidade</label>
                        <input type="text" required value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className={fieldClass('city')} placeholder="Cidade" />
                        {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.city}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Estado</label>
                        <select required value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          className={fieldClass('state')}>
                          <option value="">Selecione...</option>
                          {BR_STATES.map((s) => (
                            <option key={s.uf} value={s.uf}>{s.name}</option>
                          ))}
                        </select>
                        {errors.state && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.state}</p>}
                      </div>
                    </div>
                    )}

                    {/* Save address checkbox */}
                    {isAuthenticated && !showNewAddress && savedAddresses.length === 0 && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handleSaveNewAddress}
                          className="text-sm text-kosmo hover:text-kosmo-dark font-medium transition-colors"
                        >
                          💾 Salvar este endereço pra próximas compras
                        </button>
                      </div>
                    )}
                    {isAuthenticated && !showNewAddress && savedAddresses.length > 0 && selectedAddressId && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handleSaveNewAddress}
                          className="text-sm text-kosmo/60 hover:text-kosmo font-medium transition-colors"
                        >
                          💾 Salvar novo endereço
                        </button>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 bg-kosmo text-white rounded-2xl font-semibold text-sm hover:bg-kosmo-dark transition-all duration-300 shadow-xl shadow-kosmo/25"
                  >
                    Continuar para Pagamento
                  </motion.button>
                </motion.form>
              )}

              {/* ── STEP 2: PAYMENT ── */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Payment Methods */}
                  <div className="p-6 rounded-2xl bg-white border border-gray-100">
                    <h2 className="font-display font-bold text-cosmos mb-6 flex items-center gap-2">
                      <span className="text-kosmo">03</span> Pagamento
                    </h2>

                    <div className="space-y-3">
                      {[
                        { id: 'pix' as PaymentMethod, icon: '⚡', title: 'Pix', description: 'Aprovação instantânea', tag: 'Mais rápido' },
                        { id: 'card' as PaymentMethod, icon: '💳', title: 'Cartão de Crédito', description: 'Até 6x sem juros', tag: '' },
                        { id: 'boleto' as PaymentMethod, icon: '📄', title: 'Boleto Bancário', description: 'Até 3 dias úteis', tag: '' },
                      ].map((method) => (
                        <motion.label
                          key={method.id}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? 'border-kosmo bg-kosmo/5 shadow-md shadow-kosmo/10'
                              : 'border-gray-200 hover:border-kosmo/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                            className="w-4 h-4 text-kosmo focus:ring-kosmo/20"
                          />
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-cosmos">{method.title}</div>
                            <div className="text-xs text-cosmos/50">{method.description}</div>
                          </div>
                          {method.tag && (
                            <span className="px-2.5 py-1 rounded-full bg-kosmo/10 text-kosmo text-[10px] font-bold uppercase">
                              {method.tag}
                            </span>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* PIX Info */}
                  <AnimatePresence>
                    {paymentMethod === 'pix' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-kosmo/5 to-purple-500/5 border border-kosmo/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-kosmo/10 flex items-center justify-center">
                              <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-cosmos">Pague com Pix</h3>
                              <p className="text-xs text-cosmos/50">Aprovação instantânea • 5% de desconto</p>
                            </div>
                          </div>
                          <p className="text-sm text-cosmos/60 mb-4">
                            Após confirmar, você receberá um QR Code e a chave Pix para pagamento imediato.
                          </p>
                          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <CheckCircle2 size={14} />
                            <span>Economia de {formatCurrency(total * 0.05)} no Pix</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Credit Card Form */}
                  <AnimatePresence>
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 rounded-2xl bg-white border border-gray-100 space-y-4">
                          <CreditCardDisplay
                            number={cardData.number}
                            name={cardData.name}
                            expiry={cardData.expiry}
                            cvv={cardData.cvv}
                            brand={cardBrand}
                            isFlipped={false}
                          />

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={18} className="text-kosmo" />
                              <span className="font-display font-bold text-cosmos text-sm">Dados do Cartão</span>
                            </div>
                            {cardBrand !== 'unknown' && (
                              <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: BRAND_INFO[cardBrand].color }}
                              >
                                {BRAND_INFO[cardBrand].name}
                              </motion.span>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Número do cartão</label>
                            <div className="relative">
                              <input type="text" value={cardData.number}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-cosmos focus:outline-none focus:ring-2 transition-all font-mono pr-12 ${
                                  cardData.number && !isCardNumberValid ? 'border-red-400 focus:ring-red-200' : cardData.number && isCardNumberValid ? 'border-green-400 focus:ring-green-200' : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
                                }`}
                                placeholder="0000 0000 0000 0000" />
                              {cardData.number && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {isCardNumberValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Nome no cartão</label>
                            <div className="relative">
                              <input type="text" value={cardData.name}
                                onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                                className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-cosmos focus:outline-none focus:ring-2 transition-all pr-12 ${
                                  cardData.name && !isCardNameValid ? 'border-red-400 focus:ring-red-200' : cardData.name && isCardNameValid ? 'border-green-400 focus:ring-green-200' : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
                                }`}
                                placeholder="NOME COMO NO CARTÃO" />
                              {cardData.name && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {isCardNameValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Validade</label>
                              <div className="relative">
                                <input type="text" value={cardData.expiry}
                                  onChange={(e) => handleExpiryChange(e.target.value)}
                                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-cosmos focus:outline-none focus:ring-2 transition-all font-mono pr-10 ${
                                    cardData.expiry && !isExpiryValid ? 'border-red-400 focus:ring-red-200' : cardData.expiry && isExpiryValid ? 'border-green-400 focus:ring-green-200' : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
                                  }`}
                                  placeholder="MM/AA" />
                                {cardData.expiry && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isExpiryValid ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-400" />}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-cosmos/70 mb-1.5">CVV</label>
                              <div className="relative">
                                <input type="text" value={cardData.cvv}
                                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, BRAND_INFO[cardBrand].cvvLength) })}
                                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-cosmos focus:outline-none focus:ring-2 transition-all font-mono pr-10 ${
                                    cardData.cvv && !isCVVValid ? 'border-red-400 focus:ring-red-200' : cardData.cvv && isCVVValid ? 'border-green-400 focus:ring-green-200' : 'border-gray-200 focus:ring-kosmo/20 focus:border-kosmo'
                                  }`}
                                  placeholder={cardBrand === 'amex' ? '0000' : '000'} />
                                {cardData.cvv && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isCVVValid ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-400" />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Parcelas</label>
                            <select value={cardData.installments}
                              onChange={(e) => setCardData({ ...cardData, installments: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all">
                              {cardInstallments.map((inst) => (
                                <option key={inst.value} value={inst.value}>
                                  {inst.label} — {formatCurrency(total / parseInt(inst.value))}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-cosmos/40 pt-2">
                            <Shield size={12} />
                            <span>Dados protegidos com criptografia SSL</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Boleto Info */}
                  <AnimatePresence>
                    {paymentMethod === 'boleto' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                          <h3 className="font-display font-bold text-cosmos text-sm mb-2">Boleto Bancário</h3>
                          <p className="text-sm text-cosmos/60">
                            O boleto será gerado após a confirmação. O prazo de compensação é de até 3 dias úteis.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('info')}
                      className="px-6 py-4 bg-gray-100 text-cosmos rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                    >
                      Voltar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmPayment}
                      className="flex-1 py-4 bg-kosmo text-white rounded-2xl font-semibold text-sm hover:bg-kosmo-dark transition-all duration-300 shadow-xl shadow-kosmo/25"
                    >
                      Confirmar Pedido — {formatCurrency(paymentMethod === 'pix' ? total * 0.95 : total)}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-2xl bg-white border border-gray-100 space-y-6">
              <h3 className="font-display font-bold text-cosmos flex items-center gap-2">
                <ShoppingCart size={16} className="text-kosmo" />
                Resumo do Pedido
              </h3>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color.name}`} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-kosmo/5 to-purple-100 flex items-center justify-center shrink-0">
                      <Logo size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-cosmos truncate">{item.product.name}</h4>
                      <p className="text-xs text-cosmos/40">{item.size} • {item.color.name} • Qtd: {item.quantity}</p>
                      <span className="text-sm font-bold text-cosmos">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upsell / Complementos */}
              {suggestions.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-display font-bold text-sm text-cosmos mb-3">
                    Quem comprou levou também
                  </h4>
                  <div className="space-y-2.5">
                    {suggestions.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-kosmo/10 to-purple-100">
                          <img src={assetUrl(s.images[0])} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-cosmos truncate">{s.name}</h5>
                          <p className="text-xs text-cosmos/40">{s.shortDescription}</p>
                          <span className="text-sm font-bold text-kosmo">
                            R$ {s.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddSuggestion(s)}
                          aria-label={`Adicionar ${s.name} à sacola`}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                            justAddedSuggestion === s.id
                              ? 'bg-green-500 text-white scale-110'
                              : 'bg-kosmo text-white hover:bg-kosmo-dark hover:scale-110'
                          }`}
                        >
                          {justAddedSuggestion === s.id ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div>
                {couponApplied ? (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 border border-green-100">
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
                  <div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmos/30" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value); setCouponError(false); }}
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border text-sm text-cosmos focus:outline-none focus:ring-2 transition-all uppercase ${
                            couponError
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-kosmo/20'
                          }`}
                          placeholder="Cupom"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApplyCoupon}
                        disabled={!couponInput}
                        className="px-4 py-2.5 rounded-xl bg-cosmos/5 text-cosmos text-sm font-medium hover:bg-cosmos/10 transition-colors disabled:opacity-50"
                      >
                        Aplicar
                      </motion.button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponErrorReason}</p>}
                    <button
                      onClick={handleUseKosmo10}
                      className="flex items-center gap-1.5 text-xs text-kosmo/60 hover:text-kosmo mt-2 transition-colors"
                    >
                      <Tag size={12} /> Usar cupom KOSMO10
                    </button>
                    <button
                      onClick={() => { setCouponModalOpen(true); setCouponError(false); }}
                      className="flex items-center gap-1.5 text-xs text-cosmos/40 hover:text-kosmo mt-1 transition-colors"
                    >
                      <Info size={12} /> Ver cupons e regulamento
                    </button>
                  </div>
                )}
              </div>

              {/* Kosmo Coins */}
              {coins > 0 && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    <Coins size={13} /> Kosmo Coins
                  </p>
                  <p className="text-[11px] text-amber-700/70 mt-0.5">
                    Você pode usar até {usableCoins} de {coins} pontos nesta compra (desconto de até 5%). O valor é somado ao cupom.
                  </p>
                </div>
              )}

              {/* Gift card */}
              {state.giftCards.length === 0 && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Gift size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmos/30" />
                      <input
                        type="text"
                        value={giftCodeInput}
                        onChange={(e) => { setGiftCodeInput(e.target.value); setGiftError(false); }}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border text-sm text-cosmos focus:outline-none focus:ring-2 transition-all uppercase ${
                          giftError
                            ? 'border-red-300 focus:ring-red-200'
                            : 'border-gray-200 focus:ring-kosmo/20'
                        }`}
                        placeholder="Vale-presente (KR-XXXXXX)"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyGiftCode}
                      disabled={!giftCodeInput}
                      className="px-4 py-2.5 rounded-xl bg-cosmos/5 text-cosmos text-sm font-medium hover:bg-cosmos/10 transition-colors disabled:opacity-50"
                    >
                      Aplicar
                    </motion.button>
                  </div>
                  {giftError && <p className="text-xs text-red-500 mt-1">Código inválido ou já utilizado.</p>}
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-cosmos/60">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto ({couponCode})</span>
                    <span>- {formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                {coinsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Kosmo Coins ({usableCoins} 🪙)</span>
                    <span>- {formatCurrency(coinsDiscount)}</span>
                  </div>
                )}
                {giftCardDiscount > 0 && (
                  <div className="space-y-1">
                    {state.giftCards.map((g) => (
                      <div key={g.code} className="flex justify-between text-sm text-purple-600">
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
                        <span>- {formatCurrency(g.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {pixActive && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto Pix (5%)</span>
                    <span>- {formatCurrency(total * 0.05)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-cosmos/60">
                  <span>Frete</span>
                  <span>
                    {shippingCalculated
                      ? freeShipping || shippingPrice === 0 ? 'Grátis' : formatCurrency(shippingPrice)
                      : 'A calcular'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-display font-bold text-cosmos">Total</span>
                  <span className="font-display font-bold text-xl text-cosmos">
                    {formatCurrency(pixActive ? total * 0.95 : total)}
                  </span>
                </div>
                {paymentMethod === 'card' && parseInt(cardData.installments) > 1 && (
                  <p className="text-xs text-cosmos/40 text-right">
                    ou {cardInstallments.find((i) => i.value === cardData.installments)?.label}
                  </p>
                )}
              </div>

              {/* Perks */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-cosmos/50">
                  <Truck size={12} className="text-kosmo" />
                  <span>Frete grátis acima de R$ 299</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-cosmos/50">
                  <Shield size={12} className="text-kosmo" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-cosmos/50">
                  <CreditCard size={12} className="text-kosmo" />
                  <span>Dados protegidos com SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons modal */}
      <AnimatePresence>
        {couponModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cosmos/60 backdrop-blur-sm"
            onClick={() => { setCouponModalOpen(false); setExpandedCoupon(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-gray-100 shadow-2xl"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 z-10">
                <div>
                  <h2 className="font-display font-bold text-lg text-cosmos">Cupons disponíveis</h2>
                  <p className="text-xs text-cosmos/50 mt-0.5">
                    Escolha um cupom e veja o regulamento de cada um. Só é possível usar 1 por pedido.
                  </p>
                </div>
                <button
                  onClick={() => { setCouponModalOpen(false); setExpandedCoupon(null); }}
                  aria-label="Fechar"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-cosmos/60 hover:bg-gray-200 hover:text-cosmos transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {availableCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const expanded = expandedCoupon === coupon.code;
                  const isCurrent = couponApplied && couponCode === coupon.code;
                  return (
                    <div
                      key={coupon.code}
                      className={`rounded-2xl border transition-colors ${
                        isCurrent ? 'border-green-300 bg-green-50/50' : 'border-gray-100'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-kosmo to-purple-600 flex items-center justify-center shrink-0">
                              <Tag size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="font-display font-bold text-cosmos tracking-wider">{coupon.code}</p>
                              <p className="text-xs text-kosmo font-semibold">{coupon.title}</p>
                            </div>
                          </div>
                          <span className="font-display font-bold text-lg text-cosmos shrink-0">
                            {coupon.discount * 100}% OFF
                          </span>
                        </div>

                        <p className="text-xs text-cosmos/60 mt-3 leading-relaxed">{coupon.description}</p>

                        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-[11px] font-semibold ${status.tone}`}>
                            {status.text}
                          </span>
                          <div className="flex items-center gap-2">
                            {couponApplied && couponCode === coupon.code && (
                              <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Aplicado
                              </span>
                            )}
                            {couponApplied && couponCode !== coupon.code && (
                              <span className="text-[11px] font-semibold text-cosmos/40">
                                Troque o cupom para usar
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => setExpandedCoupon(expanded ? null : coupon.code)}
                            className="flex items-center gap-1 text-xs text-cosmos/50 hover:text-kosmo transition-colors"
                          >
                            <Info size={13} />
                            {expanded ? 'Ocultar regulamento' : 'Ver regulamento'}
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => handleApplyCouponFromModal(coupon.code)}
                              className={`ml-auto px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                                status.available
                                  ? 'bg-kosmo text-white hover:bg-kosmo-dark shadow-md shadow-kosmo/25'
                                  : 'bg-gray-100 text-cosmos/40 cursor-not-allowed'
                              }`}
                              disabled={!status.available}
                            >
                              {status.available ? 'Usar cupom' : 'Indisponível'}
                            </button>
                          )}
                        </div>
                      </div>

                      {expanded && (
                        <div className="px-4 pb-4">
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <h3 className="text-xs font-bold text-cosmos mb-2">Regulamento</h3>
                            <ul className="space-y-1.5">
                              {coupon.rules.map((rule, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-cosmos/60">
                                  <span className="text-kosmo font-bold shrink-0">{i + 1}.</span>
                                  <span>{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="p-4 rounded-xl bg-cosmos text-white">
                  <h3 className="text-xs font-bold mb-2">Regras gerais</h3>
                  <ul className="space-y-1.5 text-[11px] text-white/70">
                    <li>• Cupons não são cumulativos — use apenas um por pedido.</li>
                    <li>• Cupons não se aplicam à compra de vale-presentes.</li>
                    <li>• Descontos são calculados sobre o subtotal, antes do frete.</li>
                    <li>• O desconto dos Kosmo Coins pode ser somado ao cupom.</li>
                  </ul>
                </div>

                <Link
                  to="/cupons"
                  onClick={() => setCouponModalOpen(false)}
                  className="block text-center text-xs text-kosmo font-semibold hover:underline py-1"
                >
                  Ver regulamento completo na página de cupons
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
