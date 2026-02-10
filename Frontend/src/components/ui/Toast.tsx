"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={clsx(
        'fixed top-24 right-6 z-[100] max-w-md',
        'transform transition-all duration-300 ease-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      )}
    >
      <div
        className={clsx(
          'glass-panel p-4 rounded-xl border shadow-2xl relative overflow-hidden',
          'flex items-start gap-3',
          type === 'success' && 'border-green-500/30 bg-green-500/10',
          type === 'warning' && 'border-yellow-500/30 bg-yellow-500/10',
          type === 'error' && 'border-red-500/30 bg-red-500/10'
        )}
      >
        {/* Progress bar */}
        <div className={clsx(
          'absolute bottom-0 left-0 h-1 transition-all duration-100 ease-linear',
          type === 'success' && 'bg-green-500',
          type === 'warning' && 'bg-yellow-500',
          type === 'error' && 'bg-red-500'
        )} style={{ width: `${progress}%` }} />
        
        {/* Icon */}
        {type === 'success' && (
          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
        )}
        {type === 'warning' && (
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
        )}
        {type === 'error' && (
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
        )}

        {/* Message */}
        <div className="flex-1">
          <p className="text-white font-medium leading-relaxed">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'warning' | 'error' }>;
  removeToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${96 + index * 80}px` }}
          className="fixed right-6 z-[100]"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  );
};
