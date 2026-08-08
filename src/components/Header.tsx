import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User, LogOut, ArrowRight, Shield } from 'lucide-react';
import { Instagram } from './Icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../store/catalogStore';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/edicoes', label: 'Edições Limitadas' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { totalItems, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const products = useCatalog();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) =>
        [p.name, p.shortDescription, p.category, ...p.tags]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/catalogo?busca=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass shadow-lg shadow-kosmo/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Logo size="xl" />
              <div className="absolute -inset-1.5 bg-kosmo/10 rounded-full blur group-hover:bg-kosmo/20 transition-colors" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold tracking-wider text-cosmos">
                KOSMO ROLL
              </span>
              <span className="text-[0.6rem] font-medium tracking-[0.3em] text-kosmo">
                \ CO.
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'bg-kosmo text-white shadow-lg shadow-kosmo/25'
                    : 'text-cosmos/70 hover:text-cosmos hover:bg-kosmo/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com/kosmoroll.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-cosmos/60 hover:text-kosmo hover:bg-kosmo/5 transition-all"
            >
              <Instagram size={16} />
              <span className="hidden lg:inline">@kosmoroll.co</span>
            </a>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label={isSearchOpen ? 'Fechar busca' : 'Abrir busca'}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isSearchOpen
                  ? 'bg-kosmo text-white shadow-lg shadow-kosmo/25'
                  : 'text-cosmos/60 hover:text-cosmos hover:bg-kosmo/5'
              }`}
            >
              <Search size={18} />
            </button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/minha-conta"
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-cosmos/70 hover:text-kosmo hover:bg-kosmo/5 transition-all"
                >
                  <User size={16} />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    title="Painel Admin"
                    className="flex items-center justify-center w-10 h-10 rounded-full text-cosmos/60 hover:text-kosmo hover:bg-kosmo/5 transition-all"
                  >
                    <Shield size={16} />
                  </Link>
                )}
                <button
                  onClick={logout}
                  aria-label="Sair"
                  className="flex items-center justify-center w-10 h-10 rounded-full text-cosmos/60 hover:text-kosmo hover:bg-kosmo/5 transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo text-white text-sm font-medium hover:bg-kosmo-dark transition-all shadow-lg shadow-kosmo/25"
              >
                <User size={16} />
                <span className="hidden lg:inline">Entrar</span>
              </Link>
            )}

            <button
              onClick={toggleCart}
              aria-label="Abrir carrinho"
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-cosmos/60 hover:text-kosmo hover:bg-kosmo/5 transition-all"
            >
              <ShoppingBag size={18} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-kosmo text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-kosmo/30"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-cosmos/60 hover:text-cosmos hover:bg-kosmo/5 transition-all"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-b border-kosmo/10"
          >
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-4" ref={searchRef}>
              <form onSubmit={submitSearch} className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmos/40" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Buscar camiseta, boné, alien, edição..."
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-gray-200 text-cosmos text-sm placeholder-cosmos/40 focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar busca"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cosmos/30 hover:text-cosmos transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    {searchResults.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            to={`/produto/${p.slug}`}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setIsSearchFocused(false); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-kosmo/5 transition-colors"
                          >
                            <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-kosmo/10 to-purple-100 overflow-hidden shrink-0">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-cosmos truncate">{p.name}</h4>
                              <p className="text-xs text-cosmos/40 truncate">{p.shortDescription}</p>
                            </div>
                            <span className="text-sm font-bold text-kosmo shrink-0">
                              R$ {p.price.toFixed(2).replace('.', ',')}
                            </span>
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={() => submitSearch()}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100 text-sm font-semibold text-kosmo hover:bg-kosmo/5 transition-colors"
                        >
                          Ver todos os resultados
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <p className="px-4 py-5 text-sm text-cosmos/40 text-center">
                        Nada encontrado para "{searchQuery}". Tente outro termo.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-kosmo/10"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <form
                onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
                className="relative mb-2 md:hidden"
              >
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmos/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-cosmos text-sm placeholder-cosmos/40 focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                />
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-kosmo text-white'
                      : 'text-cosmos/70 hover:bg-kosmo/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://instagram.com/kosmoroll.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl text-sm font-medium text-cosmos/70 hover:bg-kosmo/5 flex items-center gap-2 transition-all"
              >
                <Instagram size={16} />
                @kosmoroll.co
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
