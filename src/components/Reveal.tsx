import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  scale?: boolean;
  className?: string;
}

export default function Reveal({ children, delay = 0, y = 24, scale = false, className = '' }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={scale ? { opacity: 0, scale: 0.95 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
