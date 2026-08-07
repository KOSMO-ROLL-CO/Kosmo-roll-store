import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Search } from 'lucide-react';
import { useCatalog, getSoldOutProducts } from '../store/catalogStore';

const EXAMPLES = [38, 22, 120];

export default function Validar() {
  const products = useCatalog();
  const soldOut = getSoldOutProducts();
  const all = [...products, ...soldOut];

  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleValidate = () => {
    if (!code) return;
    const num = Number(code);
    const match = all.find((p) => p.edition.current === num);
    if (match) {
      setResult('valid');
    } else {
      setResult('invalid');
    }
  };

  const found = all.find((p) => p.edition.current === Number(code));

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-cosmos/50">
          <Link to="/edicoes" className="flex items-center gap-1 hover:text-kosmo transition-colors">
            <ArrowLeft size={14} />
            Edições Limitadas
          </Link>
          <span>/</span>
          <span className="text-cosmos">Validar Peça</span>
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-cosmos text-white"
        >
          {/* Header */}
          <div className="relative p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kosmo/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kosmo/20 text-kosmo text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck size={14} />
                Validação Oficial
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                Descubra sua peça
              </h1>
              <p className="text-white/60 max-w-md mx-auto">
                Digite o número gravado na etiqueta da sua peça e confirme a autenticidade.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white text-cosmos rounded-t-[2rem] p-8 sm:p-12">
            {/* Input */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="font-display font-bold text-sm text-cosmos mb-3 flex items-center gap-2">
                <Fingerprint size={16} className="text-kosmo" />
                Número da peça
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setResult('idle'); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-cosmos font-mono text-lg focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                  placeholder="Ex.: 38"
                />
                <button
                  onClick={handleValidate}
                  disabled={!code}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kosmo text-white text-sm font-semibold hover:bg-kosmo-dark transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Search size={15} />
                  Validar
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-cosmos/40">Teste com:</span>
                {EXAMPLES.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setCode(String(n)); setResult('idle'); }}
                    className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-mono text-cosmos/70 hover:border-kosmo/40 hover:text-kosmo transition-colors"
                  >
                    #{n}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {result === 'valid' && found && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6"
              >
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                  <CheckCircle2 size={18} />
                  Peça autêntica encontrada!
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-kosmo/5 to-purple-100 shrink-0">
                    <img
                      src={found.images[0]}
                      alt={found.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-cosmos">{found.name}</h2>
                    <span className="text-xs text-kosmo font-semibold uppercase tracking-wider">
                      Kosmo Roll • Edição Oficial
                    </span>
                  </div>
                </div>

                <dl className="space-y-3 mb-5">
                  {[
                    { label: 'Numeração', value: `#${found.edition.current} de ${found.edition.total}` },
                    {
                      label: 'Coleção',
                      value: found.category === 'edicoes-limitadas' ? 'Edições Limitadas' : 'Edição numerada',
                    },
                    {
                      label: 'Status',
                      value: found.stock === 0 ? 'Esgotada' : 'Disponível',
                    },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center justify-between gap-4 py-2 border-b border-green-100">
                      <dt className="text-sm text-cosmos/50">{d.label}</dt>
                      <dd className="text-sm font-semibold text-cosmos text-right">{d.value}</dd>
                    </div>
                  ))}
                </dl>

                <Link
                  to={`/certificado/${found.slug}`}
                  className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-kosmo text-white text-sm font-semibold hover:bg-kosmo-dark transition-colors"
                >
                  Ver Certificado de Autenticidade
                </Link>
              </motion.div>
            )}

            {result === 'invalid' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
              >
                <XCircle size={32} className="text-red-500 mx-auto mb-3" />
                <p className="font-display font-bold text-cosmos mb-1">Numeração não encontrada</p>
                <p className="text-sm text-cosmos/50 mb-4">
                  Não existe peça com o número #{code || '—'} no registro oficial. Verifique o número
                  na etiqueta da peça.
                </p>
                <button
                  onClick={() => { setCode(''); setResult('idle'); }}
                  className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-600 text-sm font-semibold hover:bg-red-500/20 transition-colors"
                >
                  Tentar novamente
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
