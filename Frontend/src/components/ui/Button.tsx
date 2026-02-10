'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

// ============================================
// BUTTON COMPONENT - Koach Design System
// ============================================
// Variants: primary | secondary | ghost | danger
// Sizes: sm | md | lg
// States: loading, disabled
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    'bg-purple-600 hover:bg-purple-700 text-white',
    'shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30',
    'border border-purple-500/50'
  ),
  secondary: clsx(
    'bg-white/10 hover:bg-white/20 text-white',
    'border border-white/20 hover:border-white/30',
    'backdrop-blur-sm'
  ),
  ghost: clsx(
    'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
    'border border-transparent'
  ),
  danger: clsx(
    'bg-red-600 hover:bg-red-700 text-white',
    'shadow-lg shadow-red-500/20 hover:shadow-red-500/30',
    'border border-red-500/50'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center font-semibold rounded-lg',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
          
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          
          // States
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          !isDisabled && 'hover:scale-[1.02] active:scale-[0.98]',
          
          // Width
          fullWidth && 'w-full',
          
          // Custom
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
