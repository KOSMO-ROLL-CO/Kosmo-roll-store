import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Package,
  LogOut,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Star,
  Settings,
  Lock,
  Mail,
  CheckCircle2,
  Rocket,
  ArrowRight,
  Heart,
  Coins,
  Gift,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useAuth, type Address } from '../context/AuthContext';
import { useOrders, getOrderStatusInfo, TRACKING_URL } from '../context/OrderContext';
import { useKosmo } from '../context/KosmoContext';
import { useCatalog } from '../store/catalogStore';
import { isOnWaitlist, joinWaitlist } from '../utils/waitlist';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';

type Tab = 'profile' | 'addresses' | 'orders' | 'cofre' | 'favoritos';

const COFRE_BENEFITS = [
  { icon: '⚡', title: 'Pré-venda garantida', description: 'Acesso à compra antes de abrir pro público.' },
  { icon: '🔢', title: 'Numeração reservada', description: 'Reserve seu número favorito nas próximas drops.' },
  { icon: '🎁', title: 'Brindes exclusivos', description: 'Adesivos, patches e surpresas em cada lançamento.' },
  { icon: '🛡️', title: 'Autenticidade vitalícia', description: 'Certificado digital ligado ao seu perfil.' },
];

export default function MyAccount() {
  const { user, isAuthenticated, logout, savedAddresses, removeAddress, setDefaultAddress } = useAuth();
  const { orders } = useOrders();
  const { coins, coinsDiscountRate, wishlist, giftCards } = useKosmo();
  const products = useCatalog();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [cofreEmail, setCofreEmail] = useState('');
  const [cofreMessage, setCofreMessage] = useState<string | null>(null);
  const [cofreError, setCofreError] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-7xl block mb-6">🔒</span>
          <h1 className="font-display text-3xl font-bold text-cosmos mb-3">Acesse sua conta</h1>
          <p className="text-cosmos/50 mb-8">Faça login para ver seu perfil e histórico de pedidos.</p>
          <Link
            to="/login"
            className="px-8 py-4 bg-kosmo text-white rounded-full font-semibold text-sm hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
          >
            Fazer Login
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const myOrders = orders.filter((o) => o.userEmail === user.email);

  const tabs = [
    { id: 'profile' as Tab, label: 'Perfil', icon: User },
    { id: 'favoritos' as Tab, label: 'Favoritos', icon: Heart },
    { id: 'addresses' as Tab, label: 'Endereços', icon: MapPin },
    { id: 'orders' as Tab, label: 'Pedidos', icon: Package },
    { id: 'cofre' as Tab, label: 'Cofre de Membro', icon: Lock },
  ];

  const limitedProductIds = new Set(products.filter((p) => p.edition.isLimited).map((p) => p.id));
  const ownsLimitedPiece = myOrders.some((o) => o.items.some((item) => limitedProductIds.has(item.productId)));
  const isMember = isOnWaitlist(user.email) || ownsLimitedPiece;

  const handleCofreWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinWaitlist(cofreEmail);
    setCofreMessage(result.message);
    setCofreError(!result.ok);
    if (result.ok) setCofreEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm text-cosmos/50 hover:text-kosmo transition-colors">
              <ArrowLeft size={14} /> Voltar pra Home
            </Link>
            <h1 className="font-display text-xl font-bold text-cosmos">Minha Conta</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28">
              {/* User info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-kosmo/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-display font-bold text-cosmos">{user.name}</h3>
                <p className="text-xs text-cosmos/50">{user.email}</p>
              </div>

              {/* Kosmo Coins */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Coins size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl text-cosmos leading-none">{coins}</p>
                    <p className="text-[11px] text-cosmos/50">
                      Kosmo Coins • {(coinsDiscountRate * 100).toFixed(1)}% de desconto
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-cosmos/40 mt-2">
                  Ganhe no login e avaliando produtos comprados. 1 coin = R$0,001 no checkout (até 5% da compra, somado ao cupom).
                </p>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-kosmo text-white shadow-lg shadow-kosmo/25'
                        : 'text-cosmos/60 hover:bg-kosmo/5 hover:text-kosmo'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                    {tab.id === 'orders' && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-kosmo/10'
                      }`}                      >
                        {myOrders.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-4"
              >
                <LogOut size={18} />
                Sair da conta
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-display font-bold text-cosmos mb-6 flex items-center gap-2">
                      <Settings size={18} className="text-kosmo" />
                      Informações Pessoais
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Nome</label>
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos">
                          {user.name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cosmos/70 mb-1.5">Email</label>
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                      <div className="text-2xl mb-2">🛍️</div>
                      <div className="font-display font-bold text-2xl text-cosmos">{myOrders.length}</div>
                      <div className="text-xs text-cosmos/50">Pedidos</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                      <div className="text-2xl mb-2">📦</div>
                      <div className="font-display font-bold text-2xl text-cosmos">
                        {myOrders.filter((o) => o.status === 'delivered').length}
                      </div>
                      <div className="text-xs text-cosmos/50">Entregues</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                      <div className="text-2xl mb-2">🏠</div>
                      <div className="font-display font-bold text-2xl text-cosmos">{savedAddresses.length}</div>
                      <div className="text-xs text-cosmos/50">Endereços</div>
                    </div>
                  </div>

                  {/* Gift Cards */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-cosmos flex items-center gap-2">
                        <Gift size={18} className="text-kosmo" />
                        Vale-Presentes
                      </h3>
                      <Link
                        to="/vale-presente"
                        className="flex items-center gap-2 text-sm text-kosmo hover:text-kosmo-dark font-semibold"
                      >
                        <Plus size={16} />
                        Criar
                      </Link>
                    </div>

                    {giftCards.length === 0 ? (
                      <p className="text-sm text-cosmos/50">
                        Você ainda não criou nenhum vale-presente.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {giftCards.map((card) => (
                          <div
                            key={card.code}
                            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-kosmo/5 to-purple-100/40 border border-kosmo/10"
                          >
                            <div>
                              <p className="font-display font-bold text-cosmos">{card.code}</p>
                              <p className="text-xs text-cosmos/50">
                                Para {card.toEmail} • {new Date(card.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-display font-bold text-kosmo">
                                R$ {card.amount.toFixed(2).replace('.', ',')}
                              </p>
                              <span className={`text-[11px] font-semibold ${card.used ? 'text-cosmos/40' : 'text-green-600'}`}>
                                {card.used ? 'Utilizado' : 'Disponível'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Favoritos Tab */}
              {activeTab === 'favoritos' && (
                <motion.div
                  key="favoritos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="font-display font-bold text-cosmos flex items-center gap-2">
                    <Heart size={18} className="text-kosmo" />
                    Favoritos
                  </h2>

                  {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                      <span className="text-5xl block mb-4">💜</span>
                      <h3 className="font-display font-semibold text-cosmos mb-2">Nenhum favorito ainda</h3>
                      <p className="text-sm text-cosmos/50 mb-4">
                        Toque no coração das peças que você ama para guardá-las aqui.
                      </p>
                      <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                      >
                        Explorar Catálogo
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products
                        .filter((p) => wishlist.includes(p.id))
                        .map((p, index) => (
                          <ProductCard key={p.id} product={p} index={index} />
                        ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-cosmos flex items-center gap-2">
                      <MapPin size={18} className="text-kosmo" />
                      Endereços Salvos
                    </h2>
                    <Link
                      to="/checkout"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-kosmo text-white text-sm font-medium hover:bg-kosmo-dark transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar
                    </Link>
                  </div>

                  {savedAddresses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                      <span className="text-5xl block mb-4">📍</span>
                      <h3 className="font-display font-semibold text-cosmos mb-2">Nenhum endereço salvo</h3>
                      <p className="text-sm text-cosmos/50 mb-4">Adicione um endereço no checkout para ele aparecer aqui.</p>
                      <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                      >
                        Explorar Catálogo
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {savedAddresses.map((addr: Address) => (
                        <div
                          key={addr.id}
                          className="bg-white rounded-2xl border border-gray-100 p-5 relative"
                        >
                          {addr.isDefault && (
                            <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-kosmo/10 text-kosmo text-[10px] font-bold flex items-center gap-1">
                              <Star size={10} className="fill-kosmo" /> Padrão
                            </span>
                          )}
                          <h4 className="font-semibold text-sm text-cosmos mb-2">{addr.label}</h4>
                          <p className="text-xs text-cosmos/60 mb-1">
                            {addr.address}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ''}
                          </p>
                          <p className="text-xs text-cosmos/40">
                            {addr.neighborhood} - {addr.city}/{addr.state} • CEP: {addr.zipCode}
                          </p>
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                            {!addr.isDefault && (
                              <button
                                onClick={() => setDefaultAddress(addr.id)}
                                className="text-xs text-kosmo hover:text-kosmo-dark font-medium"
                              >
                                Definir como padrão
                              </button>
                            )}
                            <button
                              onClick={() => removeAddress(addr.id)}
                              className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="font-display font-bold text-cosmos flex items-center gap-2">
                    <Package size={18} className="text-kosmo" />
                    Histórico de Pedidos
                  </h2>

                  {myOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                      <span className="text-5xl block mb-4">📦</span>
                      <h3 className="font-display font-semibold text-cosmos mb-2">Nenhum pedido ainda</h3>
                      <p className="text-sm text-cosmos/50 mb-4">Faça sua primeira compra e ela aparecerá aqui!</p>
                      <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                      >
                        Explorar Catálogo
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((order) => {
                        const statusInfo = getOrderStatusInfo(order.status);
                        return (
                          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-xs text-cosmos/40 mb-0.5">
                                  <Clock size={12} className="inline mr-1" />
                                  {new Date(order.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="font-display font-bold text-sm text-cosmos">{order.id}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusInfo.color}`}>
                                {statusInfo.icon} {statusInfo.label}
                              </span>
                            </div>
                            {order.trackingCode && (
                              <div className="flex items-center justify-between gap-3 bg-kosmo/5 rounded-xl px-3 py-2.5 mb-4">
                                <p className="text-xs text-cosmos/70 flex items-center gap-1.5">
                                  <Truck size={14} className="text-kosmo" />
                                  <span className="font-semibold">Rastreio:</span> {order.trackingCode}
                                </p>
                                <a
                                  href={`${TRACKING_URL}${order.trackingCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-kosmo font-bold hover:underline shrink-0"
                                >
                                  Rastrear <ExternalLink size={12} />
                                </a>
                              </div>
                            )}

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-kosmo/5 to-purple-100 flex items-center justify-center shrink-0">
                                    <Logo size="sm" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-cosmos truncate">{item.productName}</p>
                                    <p className="text-xs text-cosmos/40">{item.size} • {item.color} • Qtd: {item.quantity}</p>
                                  </div>
                                  <span className="text-sm font-bold text-cosmos">
                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-cosmos/50">
                                  {order.paymentMethod === 'pix' ? '⚡ Pix' : order.paymentMethod === 'card' ? '💳 Cartão' : '📄 Boleto'}
                                </span>
                                <span className="text-xs text-cosmos/50">
                                  📍 {order.address.city}/{order.address.state}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-cosmos/40">Total</p>
                                <p className="font-display font-bold text-cosmos">
                                  R$ {order.total.toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
              {/* Cofre de Membro Tab */}
              {activeTab === 'cofre' && (
                <motion.div
                  key="cofre"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="font-display font-bold text-cosmos flex items-center gap-2">
                    <Lock size={18} className="text-kosmo" />
                    Cofre de Membro
                  </h2>

                  {isMember ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-kosmo/10 flex items-center justify-center text-3xl">
                          🔐
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-cosmos text-lg">
                            Membro Cósmico Ativo
                          </h3>
                          <p className="text-sm text-cosmos/50 flex items-center gap-1.5 mt-0.5">
                            <CheckCircle2 size={14} className="text-green-500" />
                            Acesso vitalício ao Cofre
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {COFRE_BENEFITS.map((benefit) => (
                          <div key={benefit.title} className="p-4 rounded-xl bg-kosmo/5 border border-kosmo/10">
                            <span className="text-2xl block mb-2">{benefit.icon}</span>
                            <h4 className="font-display font-semibold text-sm text-cosmos mb-1">{benefit.title}</h4>
                            <p className="text-xs text-cosmos/50">{benefit.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="text-center mb-6">
                          <span className="text-5xl block mb-4">🔐</span>
                          <h3 className="font-display font-bold text-cosmos text-lg mb-2">
                            Entre pra tripulação
                          </h3>
                          <p className="text-sm text-cosmos/50 max-w-md mx-auto">
                            O Cofre de Membro é liberado para quem possui uma peça numerada
                            ou está na lista de pré-venda. Entre e garanta acesso antecipado às próximas drops.
                          </p>
                        </div>

                        <form onSubmit={handleCofreWaitlist} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                          <div className="flex-1 relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmos/30" />
                            <input
                              type="email"
                              required
                              value={cofreEmail}
                              onChange={(e) => { setCofreEmail(e.target.value); setCofreMessage(null); }}
                              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-cosmos text-sm focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                              placeholder="seu@email.com"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-6 py-3 bg-kosmo text-white rounded-xl font-semibold text-sm hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25"
                          >
                            Entrar na lista
                          </button>
                        </form>
                        {cofreMessage && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-sm font-medium text-center mt-3 flex items-center justify-center gap-1.5 ${
                              cofreError ? 'text-red-500' : 'text-green-600'
                            }`}
                          >
                            {!cofreError && <CheckCircle2 size={14} />}
                            {cofreMessage}
                          </motion.p>
                        )}

                        <p className="text-center text-xs text-cosmos/40 mt-6">
                          Já tem uma peça numerada? Seu pedido no histórico já te dá acesso.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="p-5 rounded-2xl bg-cosmos text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <Rocket size={20} className="text-kosmo" />
                      <h4 className="font-display font-bold">Próxima Drop</h4>
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                      Drop 02 — 50 peças numeradas. Membros do Cofre compram antes de todo mundo.
                    </p>
                    <Link
                      to="/edicoes"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-light transition-colors"
                    >
                      Ver Edições <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
