import { useState, Fragment } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Timer,
  ShoppingBag,
  Tag,
  Mail,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  LogOut,
  ExternalLink,
  Shield,
  Coins,
  Heart,
  Users,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  MapPin,
  CreditCard,
  Truck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Download,
  StickyNote,
  Printer,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders, getOrderStatusInfo, getPaymentStatusInfo, getNextStatus, type Order, type OrderStatus } from '../context/OrderContext';
import { useKosmo } from '../context/KosmoContext';
import {
  useCatalog,
  adminAddProduct,
  adminUpdateProduct,
  adminRemoveProduct,
  adminResetCatalog,
  emptyProduct,
} from '../store/catalogStore';
import {
  COUPON_INFO,
  getCouponInfo,
  getCouponOverrides,
  saveCouponOverride,
  resetCouponOverrides,
  type CouponOverride,
} from '../utils/commerce';
import { getWaitlistEmails, getRestockAlerts } from '../utils/waitlist';
import { CATEGORIES, type Product, type Size, type ProductColor } from '../types';
import Logo from '../components/Logo';

type AdminTab = 'dashboard' | 'produtos' | 'timers' | 'pedidos' | 'cupons' | 'waitlist';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

const pad = (n: number) => String(n).padStart(2, '0');

const toDateTimeLocal = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromDateTimeLocal = (value: string) =>
  value ? new Date(value).toISOString() : undefined;

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const STAT_CARD_CLASS = 'bg-white rounded-2xl border border-gray-100 p-5 shadow-sm';

function StatCard({ icon: Icon, label, value, tone = 'text-cosmos' }: { icon: typeof Package; label: string; value: string | number; tone?: string }) {
  return (
    <div className={STAT_CARD_CLASS}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-cosmos/50 uppercase tracking-wider">{label}</span>
        <Icon size={18} className="text-kosmo" />
      </div>
      <span className={`font-display text-2xl font-bold ${tone}`}>{value}</span>
    </div>
  );
}

function DashboardTab() {
  const products = useCatalog();
  const { orders } = useOrders();
  const { coins, wishlist, giftCards, reviews } = useKosmo();
  const waitlist = getWaitlistEmails();
  const restock = getRestockAlerts();

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const activeCoupons = Object.keys(COUPON_INFO).filter((code) => getCouponInfo(code)?.active !== false).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Produtos" value={products.length} />
        <StatCard icon={ShoppingBag} label="Pedidos" value={orders.length} />
        <StatCard icon={Coins} label="Receita total" value={formatCurrency(revenue)} tone="text-green-600" />
        <StatCard icon={Timer} label="Pedidos em aberto" value={pending} />
        <StatCard icon={Tag} label="Cupons ativos" value={activeCoupons} />
        <StatCard icon={Heart} label="Wishlist" value={wishlist.length} />
        <StatCard icon={Coins} label="Kosmo Coins em jogo" value={coins} />
        <StatCard icon={Users} label="Na lista de espera" value={waitlist.length + restock.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-display font-bold text-cosmos mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-kosmo" /> Pedidos recentes
          </h3>
          <div className="space-y-3">
            {recentOrders.length === 0 && <p className="text-sm text-cosmos/40">Nenhum pedido ainda.</p>}
            {recentOrders.map((o) => {
              const info = getOrderStatusInfo(o.status);
              return (
                <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-cosmos">{o.id}</p>
                    <p className="text-xs text-cosmos/40">{o.userEmail || 'Visitante'} • {formatDate(o.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-cosmos">{formatCurrency(o.total)}</span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${info.color}`}>{info.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-display font-bold text-cosmos mb-4 flex items-center gap-2">
            <Shield size={16} className="text-kosmo" /> Ações rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin', label: 'Dashboard' },
              { to: '/catalogo', label: 'Ver loja' },
              { to: '/edicoes', label: 'Edições' },
              { to: '/esgotados', label: 'Esgotados' },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="p-4 rounded-xl bg-kosmo/5 border border-kosmo/10 text-sm font-semibold text-kosmo hover:bg-kosmo hover:text-white transition-colors text-center"
              >
                {a.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-gray-50 text-xs text-cosmos/50 leading-relaxed">
            💡 As alterações feitas aqui (produtos, cronômetros e cupons) são salvas no
            navegador e refletem na loja na hora. Para limpar tudo e voltar ao catálogo padrão,
            use a aba Produtos → "Restaurar catálogo padrão".
          </div>
        </div>
      </div>

      {giftCards.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-display font-bold text-cosmos mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-kosmo" /> Vales-presente criados ({giftCards.length})
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {giftCards.map((g) => (
              <div key={g.code} className="p-3 rounded-xl bg-gray-50 text-sm">
                <p className="font-bold text-kosmo">{g.code}</p>
                <p className="text-cosmos/50 text-xs">{formatCurrency(g.amount)} • para {g.toEmail}</p>
                <p className={`text-xs font-semibold mt-1 ${g.used ? 'text-red-500' : 'text-green-600'}`}>
                  {g.used ? 'Usado' : 'Disponível'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-display font-bold text-cosmos mb-4 flex items-center gap-2">
            <StarIcon /> Avaliações recentes ({reviews.length})
          </h3>
          <div className="space-y-2">
            {reviews.slice(-5).reverse().map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-gray-50 text-sm flex items-center justify-between gap-3">
                <span className="text-cosmos/70">{r.userName} — "{r.comment || 'sem comentário'}"</span>
                <span className="text-amber-500 text-xs font-bold">{'★'.repeat(r.rating)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StarIcon() {
  return <span className="text-amber-500">★</span>;
}

// ─── PRODUCTS ───

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [price, setPrice] = useState(String(initial.price || ''));
  const [originalPrice, setOriginalPrice] = useState(initial.originalPrice ? String(initial.originalPrice) : '');
  const [category, setCategory] = useState<Product['category']>(initial.category);
  const [shortDescription, setShortDescription] = useState(initial.shortDescription);
  const [description, setDescription] = useState(initial.description);
  const [stock, setStock] = useState(String(initial.stock ?? 0));
  const [imagesText, setImagesText] = useState(initial.images.join('\n'));
  const [tagsText, setTagsText] = useState(initial.tags.join(', '));
  const [sizes, setSizes] = useState<Size[]>(initial.sizes);
  const [colors, setColors] = useState<ProductColor[]>(initial.colors.map((c) => ({ ...c })));
  const [isLimited, setIsLimited] = useState(initial.edition.isLimited);
  const [editionCurrent, setEditionCurrent] = useState(String(initial.edition.current));
  const [editionTotal, setEditionTotal] = useState(String(initial.edition.total));
  const [isNew, setIsNew] = useState(initial.isNew);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [saleEndsAt, setSaleEndsAt] = useState(toDateTimeLocal(initial.saleEndsAt));
  const [error, setError] = useState('');

  const ALL_SIZES: Size[] = ['P', 'M', 'G', 'GG', 'XG'];

  const toggleSize = (s: Size) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const updateColor = (i: number, patch: Partial<ProductColor>) => {
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const handleNameBlur = () => {
    if (!slug.trim()) setSlug(slugify(name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug.trim() || slugify(name);
    const images = imagesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name.trim()) return setError('Dê um nome ao produto.');
    if (!finalSlug) return setError('Slug inválido.');
    if (!price || Number(price) <= 0) return setError('Defina um preço válido.');
    if (images.length === 0) return setError('Adicione ao menos uma imagem.');
    if (sizes.length === 0) return setError('Selecione ao menos um tamanho.');
    if (colors.length === 0) return setError('Adicione ao menos uma cor.');

    const product: Product = {
      ...initial,
      name: name.trim(),
      slug: finalSlug,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      stock: Math.max(0, Number(stock) || 0),
      images,
      colorImages: initial.colorImages,
      sizes,
      colors,
      edition: {
        current: Math.max(0, Number(editionCurrent) || 0),
        total: Math.max(1, Number(editionTotal) || 1),
        isLimited,
      },
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
      isNew,
      isFeatured,
      saleEndsAt: fromDateTimeLocal(saleEndsAt),
      lifestyleImages: initial.lifestyleImages,
    };
    onSave(product);
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all';
  const labelClass = 'block text-xs font-semibold text-cosmos/60 uppercase tracking-wider mb-1.5';

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-cosmos">
          {initial.id ? 'Editar produto' : 'Novo produto'}
        </h3>
        <button type="button" onClick={onCancel} aria-label="Fechar" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-cosmos/60 hover:bg-gray-200 transition-colors">
          <X size={16} />
        </button>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} className={inputClass} placeholder="Ex.: Cometa Tee" />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className={inputClass} placeholder="cometa-tee" />
        </div>
        <div>
          <label className={labelClass}>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as Product['category'])} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Preço (R$)</label>
          <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="149.90" />
        </div>
        <div>
          <label className={labelClass}>Preço original (R$)</label>
          <input type="number" step="0.01" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className={inputClass} placeholder="Opcional" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Descrição curta</label>
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} placeholder="Aparece nos cards do catálogo" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Descrição completa</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="História e detalhes da peça" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Imagens (uma por linha ou separadas por vírgula)</label>
          <textarea rows={3} value={imagesText} onChange={(e) => setImagesText(e.target.value)} className={inputClass} placeholder={'/products/cometa-front.webp\n/products/cometa-back.webp'} />
          {imagesText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagesText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).slice(0, 4).map((src) => (
                <div key={src} className="w-14 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>Estoque</label>
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tags (separadas por vírgula)</label>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass} placeholder="camiseta, novo" />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className={labelClass}>Tamanhos</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                sizes.includes(s) ? 'border-kosmo bg-kosmo text-white' : 'border-gray-200 text-cosmos/60 hover:border-kosmo/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className={labelClass}>Cores</label>
        <div className="space-y-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={c.hex}
                onChange={(e) => updateColor(i, { hex: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                value={c.name}
                onChange={(e) => updateColor(i, { name: e.target.value })}
                className={inputClass}
                placeholder="Nome da cor"
              />
              <label className="flex items-center gap-1.5 text-xs text-cosmos/60 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={c.available}
                  onChange={(e) => updateColor(i, { available: e.target.checked })}
                  className="w-4 h-4 text-kosmo"
                />
                Disponível
              </label>
              <button
                type="button"
                onClick={() => setColors((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remover cor"
                className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-cosmos/50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setColors((prev) => [...prev, { name: '', hex: '#000000', available: true }])}
          className="mt-2 text-sm text-kosmo font-semibold hover:underline"
        >
          + Adicionar cor
        </button>
      </div>

      {/* Edition */}
      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <label className="flex items-center gap-2 text-sm font-semibold text-cosmos">
          <input type="checkbox" checked={isLimited} onChange={(e) => setIsLimited(e.target.checked)} className="w-4 h-4 text-kosmo" />
          Edição limitada
        </label>
        <div>
          <label className={labelClass}>Número atual</label>
          <input type="number" min="0" value={editionCurrent} onChange={(e) => setEditionCurrent(e.target.value)} className={inputClass} disabled={!isLimited} />
        </div>
        <div>
          <label className={labelClass}>Total de peças</label>
          <input type="number" min="1" value={editionTotal} onChange={(e) => setEditionTotal(e.target.value)} className={inputClass} disabled={!isLimited} />
        </div>
      </div>

      {/* Timer + flags */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Cronômetro (fim da venda)</label>
          <input type="datetime-local" value={saleEndsAt} onChange={(e) => setSaleEndsAt(e.target.value)} className={inputClass} />
          {saleEndsAt && <p className="text-[11px] text-cosmos/40 mt-1">Encerra em {formatDate(fromDateTimeLocal(saleEndsAt))}</p>}
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-cosmos">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-4 h-4 text-kosmo" />
            Novo
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-cosmos">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-kosmo" />
            Destaque
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 py-3 bg-kosmo text-white rounded-xl font-semibold text-sm hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25 flex items-center justify-center gap-2">
          <Save size={16} /> Salvar produto
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 bg-gray-100 text-cosmos rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
      </div>
    </motion.form>
  );
}

function ProductsTab() {
  const products = useCatalog();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openNew = () => {
    const base = emptyProduct();
    setEditing({ ...base, slug: slugify(base.name) || undefined } as Product);
    setFormOpen(true);
  };

  const handleSave = (product: Product) => {
    if (product.id) {
      adminUpdateProduct(product.id, product);
    } else {
      const id = `${product.slug}-${Date.now().toString(36)}`;
      adminAddProduct({ ...product, id });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    adminRemoveProduct(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-cosmos">Produtos</h2>
          <p className="text-sm text-cosmos/50">{products.length} produtos no catálogo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if (confirm('Restaurar o catálogo padrão? Alterações feitas serão perdidas.')) { adminResetCatalog(); } }}
            className="px-4 py-2.5 rounded-xl bg-gray-100 text-cosmos text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Restaurar padrão
          </button>
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-kosmo text-white rounded-xl text-sm font-semibold hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25 flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar produto
          </button>
        </div>
      </div>

      {formOpen && editing && (
        <ProductForm initial={editing} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditing(null); }} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cosmos/40 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Cronômetro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-13 rounded-lg overflow-hidden bg-gray-100 shrink-0" style={{ height: '52px', width: '44px' }}>
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/produto/${p.slug}`} className="font-semibold text-cosmos hover:text-kosmo truncate block max-w-[220px]">{p.name}</Link>
                        <p className="text-xs text-cosmos/40">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cosmos/60">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-cosmos">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${p.stock <= 0 ? 'bg-red-50 text-red-500' : p.stock <= 10 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                      {p.stock <= 0 ? 'Esgotado' : p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cosmos/60">{formatDate(p.saleEndsAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setEditing({ ...p }); setFormOpen(true); }}
                        aria-label="Editar"
                        className="w-9 h-9 rounded-lg bg-kosmo/5 text-kosmo flex items-center justify-center hover:bg-kosmo hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      {confirmDelete === p.id ? (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-3 h-9 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          aria-label="Remover"
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TIMERS ───

function TimersTab() {
  const products = useCatalog();
  const [timers, setTimers] = useState<Record<string, string>>(() =>
    Object.fromEntries(products.map((p) => [p.id, toDateTimeLocal(p.saleEndsAt)]))
  );
  const [savedId, setSavedId] = useState<string | null>(null);

  const saveTimer = (id: string) => {
    const value = fromDateTimeLocal(timers[id] || '');
    adminUpdateProduct(id, { saleEndsAt: value });
    setSavedId(id);
    window.setTimeout(() => setSavedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-cosmos">Cronômetros</h2>
        <p className="text-sm text-cosmos/50">
          Controle o fim da venda de cada peça. Enquanto o cronômetro está rodando, o produto
          exibe a contagem regressiva na loja. Quando zera, a venda encerra.
        </p>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-cosmos truncate">{p.name}</p>
              <p className="text-xs text-cosmos/40">
                Status atual: <span className={p.saleEndsAt ? 'text-kosmo font-semibold' : 'text-cosmos/40'}>
                  {p.saleEndsAt ? `encerra ${formatDate(p.saleEndsAt)}` : 'sem cronômetro'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="datetime-local"
                value={timers[p.id] || ''}
                onChange={(e) => setTimers((prev) => ({ ...prev, [p.id]: e.target.value }))}
                className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
              />
              <button
                onClick={() => saveTimer(p.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  savedId === p.id ? 'bg-green-500 text-white' : 'bg-kosmo text-white hover:bg-kosmo-dark'
                }`}
              >
                {savedId === p.id ? <CheckIcon /> : <Save size={14} />}
                {savedId === p.id ? 'Salvo' : 'Salvar'}
              </button>
              {p.saleEndsAt && (
                <button
                  onClick={() => { adminUpdateProduct(p.id, { saleEndsAt: undefined }); setTimers((prev) => ({ ...prev, [p.id]: '' })); }}
                  aria-label="Remover cronômetro"
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckIcon() {
  return <span className="text-xs">✓</span>;
}

// ─── ORDERS ───

function OrdersTab() {
  const { orders, updateOrderStatus, updateOrderTracking, updateOrderNotes, updateOrderPayment } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all' | 'late'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [trackingDraft, setTrackingDraft] = useState('');
  const [trackingSaved, setTrackingSaved] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sorted = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = sorted.filter((o) => {
    if (filter === 'late' && !isOrderLate(o.status, getOrderAgeDays(o.date))) return false;
    if (filter !== 'all' && filter !== 'late' && o.status !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const haystack = `${o.id} ${o.userEmail || ''} ${o.address?.city || ''} ${o.trackingCode || ''} ${o.notes || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
  const allVisibleSelected = filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filtered.forEach((o) => next.delete(o.id));
      else filtered.forEach((o) => next.add(o.id));
      return next;
    });
  };

  const advanceSelected = () => {
    selectedOrders.forEach((o) => {
      if (o.paymentStatus === 'pending' && o.status === 'pending') return;
      const next = getNextStatus(o.status);
      if (next) updateOrderStatus(o.id, next);
    });
  };

  const paySelected = () => {
    selectedOrders.forEach((o) => updateOrderPayment(o.id, 'paid'));
  };

  const cancelSelected = () => {
    selectedOrders.forEach((o) => {
      if (o.status !== 'cancelled') updateOrderStatus(o.id, 'cancelled');
    });
  };

  const openPrint = (list: Order[]) => {
    const w = window.open('', '_blank', 'width=820,height=640');
    if (!w) return;
    w.document.write(buildPrintHtml(list));
    w.document.close();
    w.focus();
  };

  const printSelected = () => {
    openPrint(selectedOrders.length > 0 ? selectedOrders : filtered);
  };

  const openOrder = (o: Order) => {
    setSelected(o);
    setTrackingDraft(o.trackingCode || '');
    setTrackingSaved(false);
    setNotesDraft(o.notes || '');
    setNotesSaved(false);
  };

  const closeOrder = () => setSelected(null);

  const advance = (o: Order) => {
    const next = getNextStatus(o.status);
    if (!next) return;
    if (next === 'processing' && o.paymentStatus === 'pending') return;
    updateOrderStatus(o.id, next);
    const updated = { ...o, status: next };
    setSelected((prev) => (prev && prev.id === o.id ? updated : prev));
    if (next === 'shipped') {
      setSelected(updated);
      setTrackingDraft(o.trackingCode || '');
      setTrackingSaved(false);
    }
  };

  const confirmPayment = (o: Order) => {
    updateOrderPayment(o.id, 'paid');
    setSelected((prev) => (prev && prev.id === o.id ? { ...prev, paymentStatus: 'paid' } : prev));
  };

  const saveTracking = () => {
    if (!selected) return;
    updateOrderTracking(selected.id, trackingDraft.trim());
    setSelected((prev) => (prev ? { ...prev, trackingCode: trackingDraft.trim() } : prev));
    setTrackingSaved(true);
    window.setTimeout(() => setTrackingSaved(false), 1500);
  };

  const saveNotes = () => {
    if (!selected) return;
    updateOrderNotes(selected.id, notesDraft.trim());
    setSelected((prev) => (prev ? { ...prev, notes: notesDraft.trim() } : prev));
    setNotesSaved(true);
    window.setTimeout(() => setNotesSaved(false), 1500);
  };

  const exportCsv = () => {
    const sep = ';';
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Pedido', 'Data', 'Cliente', 'Itens', 'Total', 'Pagamento', 'Status', 'Rastreio', 'Endereço', 'Cidade', 'UF', 'CEP', 'Notas'].join(sep);
    const rows = orders.map((o) =>
      [
        o.id,
        new Date(o.date).toLocaleString('pt-BR'),
        o.userEmail || 'Visitante',
        o.items.map((i) => `${i.quantity}x ${i.productName} (${i.size}/${i.color})`).join(' | '),
        o.total.toFixed(2).replace('.', ','),
        `${o.paymentMethod} · ${getPaymentStatusInfo(o.paymentStatus).label}`,
        getOrderStatusInfo(o.status).label,
        o.trackingCode || '',
        `${o.address.street}, ${o.address.number} - ${o.address.neighborhood}`,
        o.address.city,
        o.address.state,
        o.address.zipCode,
        o.notes || '',
      ].map(esc).join(sep)
    );
    const csv = '\uFEFF' + [header, ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kosmo-roll-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
    pending: 'Processar',
    processing: 'Enviar',
    shipped: 'Entregar',
  };

  const countFor = (key: OrderStatus | 'all' | 'late') =>
    key === 'all' ? orders.length
      : key === 'late' ? orders.filter((o) => isOrderLate(o.status, getOrderAgeDays(o.date))).length
      : orders.filter((o) => o.status === key).length;

  const paymentLabel = (m: string) => (m === 'pix' ? 'Pix' : m === 'card' ? 'Cartão' : 'Boleto');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-cosmos">Pedidos</h2>
          <p className="text-sm text-cosmos/50">{orders.length} pedidos registrados</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-cosmos hover:border-kosmo/40 hover:text-kosmo transition-colors"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={printSelected}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-cosmos hover:border-kosmo/40 hover:text-kosmo transition-colors"
          >
            <Printer size={14} /> Imprimir
          </button>
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cosmos/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nº, e-mail, cidade..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
            />
          </div>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {ORDER_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === f.key
                ? 'bg-cosmos text-white shadow-lg shadow-cosmos/20'
                : 'bg-white text-cosmos/60 border border-gray-200 hover:border-kosmo/40 hover:text-kosmo'
            }`}
          >
            {f.label}
            <span className={filter === f.key ? 'text-white/70' : 'text-cosmos/35'}>{countFor(f.key)}</span>
          </button>
        ))}
      </div>

      {/* Batch toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-cosmos text-white rounded-2xl px-4 py-3 shadow-lg shadow-cosmos/20">
          <span className="text-sm font-bold">{selectedIds.size} selecionado(s)</span>
          <div className="flex-1" />
          <button
            onClick={paySelected}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
          >
            <Banknote size={14} /> Confirmar pagamento
          </button>
          <button
            onClick={advanceSelected}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-kosmo text-white text-xs font-bold hover:bg-kosmo-dark transition-colors"
          >
            <ArrowRight size={14} /> Avançar status
          </button>
          <button
            onClick={() => openPrint(selectedOrders)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 text-white text-xs font-bold hover:bg-white/25 transition-colors"
          >
            <Printer size={14} /> Imprimir
          </button>
          <button
            onClick={cancelSelected}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
          >
            <XCircle size={14} /> Cancelar
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/70 hover:bg-white/10 transition-colors"
          >
            <X size={14} /> Limpar
          </button>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-cosmos/50">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              aria-label="Selecionar todos visíveis"
              className="w-4 h-4 accent-kosmo cursor-pointer"
            />
            <span>
              {allVisibleSelected ? 'Nenhum selecionado' : 'Selecionar todos'} ({filtered.length} visíveis)
            </span>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <Package size={32} className="mx-auto mb-3 text-cosmos/20" />
            <p className="text-sm text-cosmos/50">Nenhum pedido encontrado.</p>
          </div>
        )}
        {filtered.map((o) => {
          const info = getOrderStatusInfo(o.status);
          const payInfo = getPaymentStatusInfo(o.paymentStatus);
          const next = getNextStatus(o.status);
          const awaitingPayment = o.status === 'pending' && o.paymentStatus === 'pending';
          const isSelected = selectedIds.has(o.id);
          return (
            <div key={o.id} className={`bg-white rounded-2xl border p-4 sm:p-5 transition-colors ${isSelected ? 'border-kosmo ring-2 ring-kosmo/20' : 'border-gray-100 hover:border-kosmo/20'}`}>
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(o.id)}
                  aria-label={`Selecionar ${o.id}`}
                  className="mt-1 shrink-0 w-4 h-4 accent-kosmo cursor-pointer"
                />
                <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openOrder(o)}
                      className="font-display font-bold text-cosmos hover:text-kosmo transition-colors text-left"
                    >
                      {o.id}
                    </button>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${info.color}`}>
                      {info.icon} {info.label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${payInfo.color}`}>
                      <Banknote size={10} /> {payInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-cosmos/50 mt-1 flex items-center flex-wrap gap-1.5">
                    {formatDate(o.date)} • {o.userEmail || 'Visitante'} • {o.address?.city || '—'}/{o.address?.state || ''}
                    {o.status !== 'delivered' && o.status !== 'cancelled' && (
                      <AgeBadge status={o.status} date={o.date} />
                    )}
                  </p>
                  {o.trackingCode && (
                    <p className="text-xs text-kosmo mt-1 flex items-center gap-1">
                      <Truck size={12} /> Rastreio: {o.trackingCode}
                    </p>
                  )}
                  {o.notes && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 truncate">
                      <StickyNote size={12} /> {o.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-cosmos">{formatCurrency(o.total)}</p>
                  <p className="text-[11px] text-cosmos/40 uppercase">{paymentLabel(o.paymentMethod)}</p>
                </div>
              </div>

              <p className="text-xs text-cosmos/60 mb-3">
                {o.items.reduce((s, i) => s + i.quantity, 0)} item(ns) • {o.items.map((i) => i.productName).slice(0, 2).join(', ')}{o.items.length > 2 ? '…' : ''}
              </p>

              <OrderTimeline status={o.status} />

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                {awaitingPayment ? (
                  <button
                    onClick={() => confirmPayment(o)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    <Banknote size={14} /> Confirmar pagamento
                  </button>
                ) : next ? (
                  <button
                    onClick={() => advance(o)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kosmo text-white text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                  >
                    {NEXT_LABEL[next]} <ArrowRight size={14} />
                  </button>
                ) : null}
                {o.status !== 'cancelled' && (
                  confirmCancel === o.id ? (
                    <button
                      onClick={() => { updateOrderStatus(o.id, 'cancelled'); setConfirmCancel(null); }}
                      onMouseLeave={() => setConfirmCancel(null)}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      Confirmar cancelamento?
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmCancel(o.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  )
                )}
                <button
                  onClick={() => openOrder(o)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-cosmos text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Eye size={14} /> Detalhes
                </button>
                <button
                  onClick={() => openPrint([o])}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-cosmos text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Printer size={14} /> Imprimir
                </button>
              </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeOrder} />
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h3 className="font-display font-bold text-cosmos text-lg">{selected.id}</h3>
                <p className="text-xs text-cosmos/50 mt-0.5">{formatDate(selected.date)}</p>
              </div>
              <button
                onClick={closeOrder}
                className="w-9 h-9 rounded-full bg-gray-100 text-cosmos flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto space-y-5">
              <OrderTimeline status={selected.status} />

              {/* Cliente */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[11px] font-bold text-cosmos/40 uppercase tracking-wider mb-2">Cliente & Entrega</p>
                <p className="text-sm font-semibold text-cosmos">{selected.userEmail || 'Visitante'}</p>
                <p className="text-sm text-cosmos/60 mt-2 flex items-start gap-1.5">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {selected.address.street}, {selected.address.number} — {selected.address.neighborhood}
                  <br />
                  {selected.address.city}/{selected.address.state} • {selected.address.zipCode}
                </p>
              </div>

              {/* Itens */}
              <div>
                <p className="text-[11px] font-bold text-cosmos/40 uppercase tracking-wider mb-2">Itens</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cosmos truncate">{item.productName}</p>
                        <p className="text-xs text-cosmos/40">{item.size} • {item.color} • Qtd: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-cosmos shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagamento */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <span className="text-sm text-cosmos/70 flex items-center gap-2">
                  <CreditCard size={14} /> {paymentLabel(selected.paymentMethod)}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${getPaymentStatusInfo(selected.paymentStatus).color}`}>
                    <Banknote size={10} /> {getPaymentStatusInfo(selected.paymentStatus).label}
                  </span>
                </span>
                <span className="font-display font-bold text-cosmos">{formatCurrency(selected.total)}</span>
              </div>
              {selected.status === 'pending' && selected.paymentStatus === 'pending' && (
                <button
                  onClick={() => confirmPayment(selected)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                >
                  <Banknote size={14} /> Confirmar pagamento <ArrowRight size={14} />
                </button>
              )}

              {/* Rastreio */}
              {selected.status === 'shipped' || selected.status === 'delivered' ? (
                <div>
                  <p className="text-[11px] font-bold text-cosmos/40 uppercase tracking-wider mb-2">Código de rastreio</p>
                  <div className="flex items-center gap-2">
                    <input
                      value={trackingDraft}
                      onChange={(e) => setTrackingDraft(e.target.value)}
                      placeholder="Ex: BR123456789BR"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                    />
                    <button
                      onClick={saveTracking}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        trackingSaved ? 'bg-green-500 text-white' : 'bg-kosmo text-white hover:bg-kosmo-dark'
                      }`}
                    >
                      {trackingSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                      {trackingSaved ? 'Salvo' : 'Salvar'}
                    </button>
                  </div>
                  {selected.trackingCode && (
                    <a
                      href={`https://rastreamento.correios.com.br/app/detalhes.php?objetos=${selected.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-kosmo font-semibold hover:underline"
                    >
                      <ExternalLink size={12} /> Acompanhar no site dos Correios
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-cosmos/40 flex items-center gap-1.5">
                  <Truck size={12} /> O rastreio fica disponível quando o pedido for enviado.
                </p>
              )}

              {/* Notas internas */}
              <div>
                <p className="text-[11px] font-bold text-cosmos/40 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <StickyNote size={12} /> Notas internas
                </p>
                <div className="flex items-start gap-2">
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Observações só para você (não aparecem pro cliente)"
                    rows={2}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all resize-none"
                  />
                  <button
                    onClick={saveNotes}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      notesSaved ? 'bg-green-500 text-white' : 'bg-kosmo text-white hover:bg-kosmo-dark'
                    }`}
                  >
                    {notesSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                    {notesSaved ? 'Salvo' : 'Salvar'}
                  </button>
                </div>
              </div>

              {selected.status !== 'cancelled' && selected.paymentStatus !== 'pending' && getNextStatus(selected.status) && (
                <button
                  onClick={() => { advance(selected); }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-kosmo text-white text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                >
                  {NEXT_LABEL[getNextStatus(selected.status)!]} pedido <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ORDER_FILTERS: { key: OrderStatus | 'all' | 'late'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'late', label: 'Atrasados' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'processing', label: 'Processando' },
  { key: 'shipped', label: 'Enviados' },
  { key: 'delivered', label: 'Entregues' },
  { key: 'cancelled', label: 'Cancelados' },
];

const STATUS_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

const SLA_LIMITS_DAYS: Partial<Record<OrderStatus, number>> = {
  pending: 2,
  processing: 3,
  shipped: 7,
};

function getOrderAgeDays(iso: string): number {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return Math.max(0, days);
}

function isOrderLate(status: OrderStatus, ageDays: number): boolean {
  const limit = SLA_LIMITS_DAYS[status];
  return limit != null && ageDays > limit;
}

function AgeBadge({ status, date }: { status: OrderStatus; date: string }) {
  const age = getOrderAgeDays(date);
  const late = isOrderLate(status, age);
  const label = age === 0 ? 'hoje' : age === 1 ? 'ontem' : `há ${age} dias`;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        late ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-cosmos/50'
      }`}
      title={late ? `Atrasado — SLA de ${SLA_LIMITS_DAYS[status]} dia(s)` : undefined}
    >
      <AlertTriangle size={10} className={late ? 'text-red-500' : 'text-cosmos/30'} />
      {label}
    </span>
  );
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
        <XCircle size={14} /> Pedido cancelado
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STATUS_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const info = getOrderStatusInfo(s);
        return (
          <Fragment key={s}>
            {i > 0 && (
              <span className={`h-1 w-6 sm:w-10 rounded-full ${done || current ? 'bg-kosmo' : 'bg-gray-200'}`} />
            )}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 ${
                current ? info.color : done ? 'bg-kosmo/10 text-kosmo' : 'bg-gray-50 text-gray-400'
              }`}
            >
              {done || current ? '✓' : info.icon} {info.label}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

const escHtml = (v: string) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildPrintHtml(orders: Order[]) {
  const total = orders.reduce((s, o) => s + o.total, 0);
  const rows = orders.map((o) => `
      <div class="order">
        <div class="order-head">
          <strong>${escHtml(o.id)}</strong>
          <span>${escHtml(getOrderStatusInfo(o.status).label)}${o.trackingCode ? ' &middot; ' + escHtml(o.trackingCode) : ''}</span>
        </div>
        <p class="meta">${escHtml(o.userEmail || 'Visitante')} &middot; ${escHtml(new Date(o.date).toLocaleString('pt-BR'))}</p>
        <table>
          <thead><tr><th>Produto</th><th>Tam</th><th>Cor</th><th class="r">Qtd</th><th class="r">Valor</th></tr></thead>
          <tbody>
            ${o.items.map((i) => `<tr><td>${escHtml(i.productName)}</td><td>${escHtml(i.size)}</td><td>${escHtml(i.color)}</td><td class="r">${i.quantity}</td><td class="r">${formatCurrency(i.price * i.quantity)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="foot">
          <div>
            <p class="label">Entrega</p>
            <p>${escHtml(o.address.street)}, ${escHtml(o.address.number)} &mdash; ${escHtml(o.address.neighborhood)}</p>
            <p>${escHtml(o.address.city)}/${escHtml(o.address.state)} &middot; ${escHtml(o.address.zipCode)}</p>
          </div>
          <div class="right">
            <p class="label">Pagamento</p>
            <p>${escHtml(o.paymentMethod)} &middot; ${escHtml(getPaymentStatusInfo(o.paymentStatus).label)}</p>
            <p class="total">Total: ${formatCurrency(o.total)}</p>
          </div>
        </div>
      </div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Kosmo Roll — Romaneio</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; font-size: 12px; }
  h1 { font-size: 20px; margin: 0; letter-spacing: 4px; }
  .sub { color: #666; margin: 0 0 4px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .order { border-top: 2px solid #111; padding-top: 12px; margin-top: 20px; page-break-inside: avoid; }
  .order-head { display: flex; justify-content: space-between; font-size: 14px; }
  .meta { color: #555; margin: 4px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #ddd; }
  th { color: #666; font-size: 10px; text-transform: uppercase; }
  .r { text-align: right; }
  .foot { display: flex; justify-content: space-between; gap: 16px; }
  .right { text-align: right; }
  .label { color: #666; text-transform: uppercase; font-size: 10px; margin: 0; }
  .total { font-weight: bold; font-size: 14px; }
  p { margin: 2px 0; }
  @media print { body { padding: 0; } }
</style>
</head>
<body onload="window.print()">
  <div class="top">
    <div>
      <h1>KOSMO ROLL</h1>
      <p class="sub">Romaneio de envio</p>
    </div>
    <div class="right">
      <p>${new Date().toLocaleString('pt-BR')}</p>
      <p>${orders.length} pedido(s)</p>
    </div>
  </div>
  ${rows}
  ${orders.length > 1 ? `<div class="order-head"><strong>Total geral</strong><strong>${formatCurrency(total)}</strong></div>` : ''}
</body>
</html>`;
}

// ─── COUPONS ───

function CouponsTab() {
  const [overrides, setOverrides] = useState<Record<string, CouponOverride>>(getCouponOverrides());
  const [savedCode, setSavedCode] = useState<string | null>(null);

  const setDiscount = (code: string, discountPct: number) => {
    setOverrides((prev) => ({ ...prev, [code]: { ...prev[code], discount: discountPct / 100 } }));
  };
  const setActive = (code: string, active: boolean) => {
    setOverrides((prev) => ({ ...prev, [code]: { ...prev[code], active } }));
  };
  const setTitle = (code: string, title: string) => {
    setOverrides((prev) => ({ ...prev, [code]: { ...prev[code], title } }));
  };

  const saveCoupon = (code: string) => {
    saveCouponOverride(code, overrides[code] ?? {});
    setSavedCode(code);
    window.setTimeout(() => setSavedCode(null), 1500);
  };

  const coupons = Object.keys(COUPON_INFO).map((code) => getCouponInfo(code)).filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-cosmos">Cupons</h2>
          <p className="text-sm text-cosmos/50">Edite o desconto e pause cupons na hora.</p>
        </div>
        <button
          onClick={() => { resetCouponOverrides(); setOverrides({}); }}
          className="px-4 py-2.5 rounded-xl bg-gray-100 text-cosmos text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Restaurar padrão
        </button>
      </div>

      <div className="space-y-4">
        {coupons.map((coupon) => {
          const override = overrides[coupon.code] ?? {};
          const discountPct = override.discount != null ? Math.round(override.discount * 100) : Math.round(coupon.discount * 100);
          const active = override.active ?? coupon.active ?? true;
          return (
            <div key={coupon.code} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-kosmo to-purple-600 flex items-center justify-center text-white font-display font-bold text-sm shadow-lg shadow-kosmo/25">
                    %
                  </div>
                  <div>
                    <p className="font-display font-bold text-cosmos tracking-wider">{coupon.code}</p>
                    <p className="text-xs text-cosmos/40">{coupon.type === 'primeira-compra' ? 'Primeira compra' : 'Geral'}</p>
                  </div>
                </div>
                <label className={`flex items-center gap-2 text-sm font-semibold ${active ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{active ? 'Ativo' : 'Pausado'}</span>
                  <button
                    onClick={() => setActive(coupon.code, !active)}
                    className={`w-12 h-7 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}
                    aria-label="Alternar ativo"
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? 'left-6' : 'left-1'}`} />
                  </button>
                </label>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cosmos/60 uppercase tracking-wider mb-1.5">Desconto (%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={discountPct}
                    onChange={(e) => setDiscount(coupon.code, Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-cosmos/60 uppercase tracking-wider mb-1.5">Título</label>
                  <input
                    value={override.title ?? coupon.title}
                    onChange={(e) => setTitle(coupon.code, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-cosmos focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => saveCoupon(coupon.code)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  savedCode === coupon.code ? 'bg-green-500 text-white' : 'bg-kosmo text-white hover:bg-kosmo-dark'
                }`}
              >
                {savedCode === coupon.code ? <CheckIcon /> : <Save size={14} />}
                {savedCode === coupon.code ? 'Salvo!' : 'Salvar cupom'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WAITLIST ───

function WaitlistTab() {
  const [waitlist, setWaitlist] = useState<string[]>(getWaitlistEmails());
  const [restock, setRestock] = useState(getRestockAlerts());
  const products = useCatalog();

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-cosmos">Lista de Espera</h2>
        <p className="text-sm text-cosmos/50">Quem está esperando pelas próximas drops e por peças esgotadas.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-cosmos flex items-center gap-2">
              <Users size={16} className="text-kosmo" /> Pré-venda / Waitlist ({waitlist.length})
            </h3>
            {waitlist.length > 0 && (
              <button
                onClick={() => { localStorage.removeItem('kosmo-waitlist'); setWaitlist([]); }}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {waitlist.length === 0 && <p className="text-sm text-cosmos/40">Ninguém na lista ainda.</p>}
            {waitlist.map((email) => (
              <div key={email} className="p-3 rounded-xl bg-gray-50 text-sm text-cosmos/70 flex items-center gap-2">
                <Mail size={14} className="text-kosmo shrink-0" /> {email}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-cosmos flex items-center gap-2">
              <AlertTriangle size={16} className="text-kosmo" /> Alerta de volta (restock)
            </h3>
            {restock.length > 0 && (
              <button
                onClick={() => { localStorage.removeItem('kosmo-restock-alerts'); setRestock([]); }}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {restock.length === 0 && <p className="text-sm text-cosmos/40">Ninguém pediu para ser avisado.</p>}
            {restock.map((a, i) => (
              <div key={`${a.productId}-${a.email}-${i}`} className="p-3 rounded-xl bg-gray-50 text-sm flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-cosmos">{productName(a.productId)}</p>
                  <p className="text-cosmos/50 flex items-center gap-1.5"><Mail size={12} className="text-kosmo" /> {a.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ───

const TABS: { id: AdminTab; label: string; icon: typeof Package }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'timers', label: 'Cronômetros', icon: Timer },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'cupons', label: 'Cupons', icon: Tag },
  { id: 'waitlist', label: 'Lista de Espera', icon: Mail },
];

export default function Admin() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  if (!isAuthenticated || !user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Shield size={48} className="text-red-400 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-cosmos mb-3">Acesso restrito</h1>
          <p className="text-cosmos/50 mb-8">
            Esta área é exclusiva para a administração da Kosmo Roll. Sua conta não tem permissão para entrar aqui.
          </p>
          <Link to="/" className="inline-block px-8 py-4 bg-kosmo text-white rounded-full font-semibold text-sm hover:bg-kosmo-dark transition-colors shadow-lg shadow-kosmo/25">
            Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderTab = () => {
    switch (tab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'produtos':
        return <ProductsTab />;
      case 'timers':
        return <TimersTab />;
      case 'pedidos':
        return <OrdersTab />;
      case 'cupons':
        return <CouponsTab />;
      case 'waitlist':
        return <WaitlistTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-cosmos text-white sticky top-0 z-40 shadow-lg shadow-cosmos/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="md" />
              <div className="leading-none">
                <p className="font-display font-bold tracking-wider text-white">KOSMO ROLL</p>
                <p className="text-[0.6rem] tracking-[0.3em] text-kosmo font-medium">\ CO.</p>
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-kosmo/20 text-kosmo text-xs font-bold uppercase tracking-wider">
              <Shield size={12} /> Painel Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:block text-sm text-white/60">{user.name}</span>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={14} /> Ver loja
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-kosmo text-white hover:bg-kosmo-dark transition-colors"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 pb-0 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl transition-colors border-b-2 ${
                  tab === t.id
                    ? 'bg-gray-50 text-kosmo border-kosmo'
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderTab()}
        </motion.div>
      </main>
    </div>
  );
}
