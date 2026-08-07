import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKosmo } from '../context/KosmoContext';
import { isAdminEmail } from '../config/admin';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const { login } = useAuth();
  const { redeemLoginCoins } = useKosmo();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Preencha todos os campos');
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      const earned = redeemLoginCoins();
      if (earned > 0) setEarnedCoins(earned);
      navigate(isAdminEmail(email) ? '/admin' : redirectTo || '/');
    } else {
      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size="lg" />
            <div className="text-left">
              <h1 className="font-display text-xl font-bold tracking-wider text-cosmos">
                KOSMO ROLL
              </h1>
              <span className="text-[0.6rem] font-medium tracking-[0.3em] text-kosmo">
                \ CO.
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-kosmo/5 p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-cosmos mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-cosmos/50 text-sm">
              Entre na sua conta para continuar
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {earnedCoins > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center"
            >
              Você ganhou {earnedCoins} Kosmo Coin{earnedCoins > 1 ? 's' : ''} por fazer login hoje! 🪙
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cosmos mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmos/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-kosmo focus:ring-2 focus:ring-kosmo/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-cosmos mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmos/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-kosmo focus:ring-2 focus:ring-kosmo/20 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cosmos/30 hover:text-cosmos transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a href="#" className="text-sm text-kosmo hover:text-kosmo-dark transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-kosmo text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-kosmo-dark transition-all duration-300 shadow-lg shadow-kosmo/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-cosmos/40">ou</span>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-cosmos/60">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-kosmo hover:text-kosmo-dark font-semibold transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
