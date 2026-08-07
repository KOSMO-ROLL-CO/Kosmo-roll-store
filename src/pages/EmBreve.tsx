import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, CheckCircle2, Rocket } from 'lucide-react';
import { joinWaitlist } from '../utils/waitlist';

const DROP_DATE = new Date('2026-09-19T12:00:00-03:00');

function getTimeLeft() {
  const diff = Math.max(0, DROP_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function EmBreve() {
  const [time, setTime] = useState(getTimeLeft);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTime(getTimeLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = joinWaitlist(email);
    setResult(res);
    if (res.ok) setEmail('');
  };

  const units = [
    { label: 'dias', value: time.days },
    { label: 'horas', value: time.hours },
    { label: 'min', value: time.minutes },
    { label: 'seg', value: time.seconds },
  ];

  return (
    <div className="min-h-screen bg-cosmos text-white overflow-hidden relative flex flex-col items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-kosmo/10 rounded-full blur-3xl" />
        <motion.span
          className="absolute top-16 left-[12%] text-2xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          🪐
        </motion.span>
        <motion.span
          className="absolute bottom-24 right-[10%] text-2xl"
          animate={{ y: [12, -12, 12] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          🛸
        </motion.span>
        {['top-20 right-[20%]', 'top-40 left-[22%]', 'bottom-32 left-[16%]', 'top-1/2 right-[8%]'].map((pos, i) => (
          <motion.span
            key={i}
            className={`absolute ${pos} text-xs`}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
          >
            ✨
          </motion.span>
        ))}
      </div>

      <div className="relative w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kosmo/15 border border-kosmo/30 text-kosmo text-xs font-bold uppercase tracking-widest mb-8">
            <Rocket size={14} /> Nova coleção a caminho
          </span>

          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-4">
            PRÓXIMA <span className="text-kosmo">DROP</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-lg mx-auto mb-10">
            Peças numeradas, edição limitada, zero sobra. Entra na lista de pré-venda e garante a sua
            quando o sinal de lançamento for dado.
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-4 gap-3 sm:gap-4 mb-10"
        >
          {units.map((u) => (
            <div key={u.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl py-5">
              <p className="font-display text-3xl sm:text-5xl font-bold text-kosmo tabular-nums">
                {pad(u.value)}
              </p>
              <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-widest mt-1">{u.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Waitlist form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-kosmo text-white rounded-xl text-sm font-bold hover:bg-kosmo-light transition-all duration-300 shadow-lg shadow-kosmo/25"
            >
              <Bell size={15} /> Me avisar
            </button>
          </div>
          {result && (
            <p className={`mt-3 text-sm flex items-center justify-center gap-1.5 ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
              {result.ok && <CheckCircle2 size={14} />} {result.message}
            </p>
          )}
          <p className="text-[11px] text-white/30 mt-3">
            Sem spam. Só o sinal de lançamento e acesso antecipado.
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            Enquanto isso, explore a coleção atual <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
