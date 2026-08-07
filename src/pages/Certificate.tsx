import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, CheckCircle2, XCircle, BadgeCheck, Fingerprint } from 'lucide-react';
import { useCatalog } from '../store/catalogStore';
import Logo from '../components/Logo';
import QRCode from '../components/QRCode';

export default function Certificate() {
  const { slug } = useParams<{ slug: string }>();
  const products = useCatalog();
  const product = products.find((p) => p.slug === slug);

  const [code, setCode] = useState('');
  const [validation, setValidation] = useState<'idle' | 'valid' | 'invalid'>('idle');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Logo size="xl" className="mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-cosmos mb-3">Certificado não encontrado</h1>
          <p className="text-cosmos/50 mb-8">Verifique o link ou escaneie o QR Code da etiqueta da peça.</p>
          <Link
            to="/edicoes"
            className="px-6 py-3 bg-kosmo text-white rounded-full text-sm font-semibold hover:bg-kosmo-dark transition-colors"
          >
            Ver Edições Limitadas
          </Link>
        </div>
      </div>
    );
  }

  const editionNumber = product.edition.current;
  const validationUrl = `https://kosmoroll.co/certificado/${product.slug}#ed-${editionNumber}`;

  const handleValidate = () => {
    if (code.replace(/\D/g, '') === String(editionNumber)) {
      setValidation('valid');
    } else {
      setValidation('invalid');
    }
  };

  const details = [
    { label: 'Peça', value: product.name },
    { label: 'Coleção', value: product.category === 'edicoes-limitadas' ? 'Edições Limitadas' : 'Edição numerada' },
    { label: 'Numeração', value: `#${editionNumber} de ${product.edition.total}` },
    { label: 'Material', value: 'Algodão premium' },
    { label: 'Técnica', value: 'Estampa sob demanda + numeração em laser' },
  ];

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
          <span className="text-cosmos">Certificado de Autenticidade</span>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
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
                Certificado Digital
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                Autenticidade Verificada
              </h1>
              <p className="text-white/60 max-w-md mx-auto">
                Esta peça pertence à edição numerada oficial da Kosmo Roll.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white text-cosmos rounded-t-[2rem] p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* QR + validation */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl border-2 border-dashed border-kosmo/30 bg-white shadow-lg">
                    <QRCode value={validationUrl} size={176} />
                  </div>
                </div>
                <p className="text-xs text-cosmos/40 text-center">
                  Escaneie para validar esta peça na página oficial
                </p>

                {/* Manual validation */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-sm text-cosmos flex items-center gap-2">
                      <Fingerprint size={16} className="text-kosmo" />
                      Validar numeração manual
                    </h3>
                    <Link
                      to="/validar"
                      className="text-xs text-kosmo font-semibold hover:text-kosmo-dark transition-colors"
                    >
                      Buscar por número →
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setValidation('idle'); }}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-cosmos font-mono focus:outline-none focus:ring-2 focus:ring-kosmo/20 focus:border-kosmo transition-all"
                      placeholder={`Número da peça (ex.: ${editionNumber})`}
                    />
                    <button
                      onClick={handleValidate}
                      className="px-5 py-3 rounded-xl bg-kosmo text-white text-sm font-semibold hover:bg-kosmo-dark transition-colors shrink-0"
                    >
                      Validar
                    </button>
                  </div>
                  {validation === 'valid' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-green-600 font-medium mt-3 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Peça autêntica! Você possui uma edição oficial Kosmo Roll.
                    </motion.p>
                  )}
                  {validation === 'invalid' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 font-medium mt-3 flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Numeração não confere. Verifique o número na etiqueta da peça.
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-kosmo/5 to-purple-100 flex items-center justify-center shrink-0">
                    <Logo size="md" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-cosmos">{product.name}</h2>
                    <span className="text-xs text-kosmo font-semibold uppercase tracking-wider">
                      Kosmo Roll • Edição Oficial
                    </span>
                  </div>
                </div>

                <dl className="space-y-3">
                  {details.map((d) => (
                    <div key={d.label} className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100">
                      <dt className="text-sm text-cosmos/50">{d.label}</dt>
                      <dd className="text-sm font-semibold text-cosmos text-right">{d.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="p-4 rounded-2xl bg-kosmo/5 border border-kosmo/10 flex items-start gap-3">
                  <BadgeCheck size={20} className="text-kosmo shrink-0 mt-0.5" />
                  <p className="text-xs text-cosmos/60 leading-relaxed">
                    Este certificado garante a autenticidade e a exclusividade da peça. A numeração é
                    gravada em laser e não pode ser removida ou duplicada. Peças com numeração
                    conferida dão acesso vitalício ao <span className="text-kosmo font-semibold">Cofre de Membro</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
              <p className="font-display text-sm text-cosmos/60">
                kosmoroll.co/certificado/{product.slug} • #{editionNumber}
              </p>
              <p className="text-[11px] text-cosmos/40 mt-1">Documento digital emitido pela Kosmo Roll</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
