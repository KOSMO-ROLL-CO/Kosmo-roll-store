import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Mail, MessageSquare, Copy, Check, CreditCard } from 'lucide-react';
import { useKosmo } from '../context/KosmoContext';
import { formatCurrency } from '../utils/commerce';

const AMOUNTS = [50, 100, 200];

export default function ValePresente() {
  const { createGiftCard } = useKosmo();
  const [amount, setAmount] = useState(100);
  const [fromName, setFromName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [message, setMessage] = useState('');
  const [created, setCreated] = useState<{ code: string; amount: number; toEmail: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const card = createGiftCard({ amount, fromName, toEmail, message });
    setCreated({ code: card.code, amount: card.amount, toEmail: card.toEmail });
    setCopied(false);
  };

  const copyCode = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-kosmo/10 mb-4">
            <Gift size={28} className="text-kosmo" />
          </div>
          <span className="text-kosmo text-sm font-semibold tracking-wider uppercase">Kosmo Roll</span>
          <h1 className="font-display text-4xl font-bold text-cosmos mt-2">Vale-Presente</h1>
          <p className="text-cosmos/50 max-w-lg mx-auto mt-3">
            Dê um presente para quem está na mesma órbita que você. Escolha o valor, envie o
            código e pronto — a pessoa usa direto no checkout.
          </p>
        </motion.div>

        {!created ? (
          <motion.form
            onSubmit={handleCreate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-xl shadow-cosmos/5 border border-gray-100"
          >
            <label className="block text-sm font-semibold text-cosmos mb-3">Valor</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`py-4 rounded-2xl text-lg font-display font-bold border-2 transition-all duration-300 ${
                    amount === a
                      ? 'border-kosmo bg-kosmo text-white shadow-lg shadow-kosmo/25'
                      : 'border-gray-200 text-cosmos/60 hover:border-kosmo/30'
                  }`}
                >
                  R$ {a}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-cosmos mb-2">
                  <Mail size={14} className="text-kosmo" /> E-mail de quem vai receber
                </label>
                <input
                  type="email"
                  required
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="amigo@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-kosmo"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-cosmos mb-2">
                  <Gift size={14} className="text-kosmo" /> Seu nome
                </label>
                <input
                  type="text"
                  required
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Quem está presenteando"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-kosmo"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-cosmos mb-2">
                  <MessageSquare size={14} className="text-kosmo" /> Mensagem (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Escreva um recado especial..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-kosmo resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-kosmo text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-kosmo-dark transition-all duration-300 shadow-xl shadow-kosmo/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CreditCard size={18} />
                Comprar Vale-Presente — {formatCurrency(amount)}
              </button>
              <p className="text-center text-xs text-cosmos/40">
                O pagamento é simulado nesta demo. O código é gerado na hora.
              </p>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-xl shadow-cosmos/5 border border-gray-100 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-cosmos mb-2">Vale-Presente criado!</h2>
            <p className="text-cosmos/50 text-sm mb-6">
              R$ {created.amount.toFixed(2).replace('.', ',')} enviado para{' '}
              <span className="font-semibold text-cosmos">{created.toEmail}</span>
            </p>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-kosmo via-purple-600 to-cosmos text-white mb-6">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Código do vale</p>
              <p className="font-display text-3xl font-bold tracking-widest select-all">{created.code}</p>
              <button
                onClick={copyCode}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-semibold transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar código'}
              </button>
            </div>

            <p className="text-xs text-cosmos/40 mb-6">
              Insira o código na tela de pagamento. Seu amigo pode aplicar em qualquer compra na loja.
            </p>

            <button
              onClick={() => setCreated(null)}
              className="w-full py-3 rounded-2xl bg-kosmo text-white font-semibold text-sm hover:bg-kosmo-dark transition-colors"
            >
              Criar outro Vale-Presente
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
