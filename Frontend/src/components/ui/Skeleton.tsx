'use client';

import clsx from 'clsx';

// ============================================
// SKELETON COMPONENTS - Koach Design System
// ============================================
// Loading placeholders for content
// ============================================

interface SkeletonProps {
  className?: string;
}

// Base Skeleton Block
export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-white/10 rounded',
        className
      )}
    />
  );
};

// Skeleton Line (for text)
interface SkeletonLineProps extends SkeletonProps {
  width?: 'full' | '3/4' | '1/2' | '1/4';
}

export const SkeletonLine = ({ width = 'full', className }: SkeletonLineProps) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  return (
    <div
      className={clsx(
        'h-4 animate-pulse bg-white/10 rounded',
        widthClasses[width],
        className
      )}
    />
  );
};

// Skeleton Circle (for avatars)
interface SkeletonCircleProps extends SkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SkeletonCircle = ({ size = 'md', className }: SkeletonCircleProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={clsx(
        'rounded-full animate-pulse bg-white/10',
        sizeClasses[size],
        className
      )}
    />
  );
};

// Song Card Skeleton
export const SongCardSkeleton = () => {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-square rounded-lg" />
      
      {/* Title */}
      <SkeletonLine width="3/4" />
      
      {/* Artist */}
      <SkeletonLine width="1/2" className="h-3" />
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
};

// Results Page Skeleton
export const ResultsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonCircle size="lg" />
        <div className="space-y-2 flex-1">
          <SkeletonLine width="1/2" className="h-6" />
          <SkeletonLine width="1/4" className="h-4" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <SkeletonLine width="1/2" className="h-3" />
            <SkeletonLine width="3/4" className="h-8" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <SkeletonLine width="1/4" className="h-5" />
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <SkeletonLine width="1/4" className="h-5" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLine key={i} width="full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Studio Page Skeleton
export const StudioPageSkeleton = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-4">
          <SkeletonCircle size="sm" />
          <div className="space-y-2">
            <SkeletonLine width="full" className="h-5 w-32" />
            <SkeletonLine width="full" className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </header>

      {/* Piano Roll Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Skeleton className="w-full max-w-4xl h-96 rounded-xl" />
      </div>

      {/* Control Deck */}
      <div className="h-64 border-t border-white/10 bg-black/80 grid grid-cols-3">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-3">
            <SkeletonLine width="full" className="h-3 w-16 mx-auto" />
            <Skeleton className="h-12 w-20 mx-auto rounded" />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <SkeletonCircle size="xl" />
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex gap-3">
            <SkeletonCircle size="sm" />
            <SkeletonCircle size="lg" />
            <SkeletonCircle size="sm" />
          </div>
          <Skeleton className="h-2 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
};
