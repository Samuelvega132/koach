'use client';

import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

// ============================================
// SPINNER COMPONENT - Koach Design System
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const Spinner = ({ size = 'md', className, label }: SpinnerProps) => {
  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <Loader2 
        className={clsx(
          'animate-spin text-purple-500',
          sizeClasses[size]
        )} 
      />
      {label && (
        <span className="text-sm text-gray-400 animate-pulse">{label}</span>
      )}
    </div>
  );
};

// Full Page Loading Spinner
export const FullPageSpinner = ({ label = 'Cargando...' }: { label?: string }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20" />
          {/* Spinning ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-3 rounded-full bg-purple-500/20 animate-pulse" />
        </div>
        <span className="text-white font-medium">{label}</span>
      </div>
    </div>
  );
};

// Inline Loading State
export const InlineLoader = ({ text = 'Cargando' }: { text?: string }) => {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{text}</span>
      <span className="animate-pulse">...</span>
    </div>
  );
};
