import { motion } from 'framer-motion';
import { assetUrl } from '../utils/asset';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-14 h-14',
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <motion.img
      src={assetUrl('/kosmo-roll-logo.svg')}
      alt="Kosmo Roll"
      className={`${sizeMap[size]} animate-logo-glow ${className}`}
      initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  );
}
