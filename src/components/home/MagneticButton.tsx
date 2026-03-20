'use client';

import { motion } from 'framer-motion';
import { useMagneticCursor } from '@/hooks/useMagneticCursor';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  maxDisplacement?: number;
}

export function MagneticButton({
  children,
  className = '',
  radius = 120,
  maxDisplacement = 8,
}: MagneticButtonProps) {
  const { ref, style, onMouseLeave } = useMagneticCursor({
    radius,
    maxDisplacement,
    enabled: true,
  });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`inline-block ${className}`}
      style={style}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
