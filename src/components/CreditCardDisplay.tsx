import { useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND_INFO, type CardBrand } from '../utils/cardValidation';

interface CreditCardProps {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  brand: CardBrand;
  isFlipped?: boolean;
}

export default function CreditCardDisplay({
  number,
  name,
  expiry,
  cvv,
  brand,
  isFlipped = false,
}: CreditCardProps) {
  const [flipped, setFlipped] = useState(false);

  const displayNumber = number || '•••• •••• •••• ••••';
  const displayName = name || 'NOME NO CARTÃO';
  const displayExpiry = expiry || 'MM/AA';
  const displayCVV = cvv || '•••';
  const brandInfo = BRAND_INFO[brand];

  // Format number for display (always show 4 groups)
  const formatDisplayNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    const padded = cleaned.padEnd(16, '•');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="flex justify-center mb-6">
      <div
        className="relative w-[320px] h-[200px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ rotateY: flipped || isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              background: `linear-gradient(135deg, ${brandInfo.color} 0%, ${brandInfo.color}dd 50%, ${brandInfo.color}99 100%)`,
              boxShadow: `0 20px 60px ${brandInfo.color}40`,
            }}
          >
            {/* Card chip + brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-yellow-400/80 flex items-center justify-center">
                  <div className="w-6 h-4 rounded-sm border border-yellow-600/50" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white/30" />
                </div>
              </div>
              <motion.span
                key={brand}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-white/90 font-bold text-sm tracking-wider"
              >
                {brandInfo.name}
              </motion.span>
            </div>

            {/* Card number */}
            <div className="font-mono text-xl text-white tracking-wider">
              {formatDisplayNumber(displayNumber)}
            </div>

            {/* Name + Expiry */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-white/60 uppercase mb-0.5">Titular</p>
                <p className="text-sm text-white font-medium uppercase tracking-wider">
                  {displayName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase mb-0.5">Validade</p>
                <p className="text-sm text-white font-medium font-mono">
                  {displayExpiry}
                </p>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `linear-gradient(135deg, ${brandInfo.color}cc 0%, ${brandInfo.color} 100%)`,
              boxShadow: `0 20px 60px ${brandInfo.color}40`,
            }}
          >
            {/* Magnetic stripe */}
            <div className="w-full h-10 bg-black/40 mt-8" />

            {/* Signature + CVV */}
            <div className="px-6 mt-6">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-8 rounded bg-white/90 flex items-center px-3">
                  <div className="flex gap-0.5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 h-4 bg-gray-300 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded px-3 py-2 min-w-[60px]">
                  <motion.p
                    key={cvv}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-sm text-gray-800 font-bold text-center"
                  >
                    {displayCVV}
                  </motion.p>
                </div>
              </div>
              <p className="text-[10px] text-white/60 mt-2 text-center">
                Clique para ver o CVV
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
