import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MobileSectionProps {
  order: string;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

/**
 * Section wrapper with mobile order support.
 * Usage: <MobileSection order={MOBILE_ORDER.PRICING} className="py-14 md:py-20">
 * Parent page root div must have className="... flex flex-col".
 */
export function MobileSection({ order, className, children, style }: MobileSectionProps) {
  return (
    <section
      className={cn('py-10 md:py-16', order, className)}
      style={style}
    >
      {children}
    </section>
  );
}
