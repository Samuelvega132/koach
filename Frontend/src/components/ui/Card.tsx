'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

// ============================================
// CARD COMPONENT - Koach Design System
// ============================================
// Glass-morphism card with variants
// Variants: glass | solid | outline
// ============================================

type CardVariant = 'glass' | 'solid' | 'outline';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CardVariant, string> = {
  glass: clsx(
    'bg-white/5 backdrop-blur-xl',
    'border border-white/10'
  ),
  solid: clsx(
    'bg-slate-800/80',
    'border border-slate-700/50'
  ),
  outline: clsx(
    'bg-transparent',
    'border border-white/20'
  ),
};

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      hover = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // Base styles
          'rounded-xl overflow-hidden',
          
          // Variant
          variantStyles[variant],
          
          // Padding
          paddingStyles[padding],
          
          // Hover effect
          hover && 'transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/5',
          
          // Custom
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Sub-component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, icon, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex items-center justify-between mb-4',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';
