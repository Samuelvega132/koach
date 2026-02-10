'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_CONFIG } from '@/config/api.config';

// ============================================
// PERFORMANCE SUBMIT HOOK
// ============================================
// Extracts the session submission logic from StudioClient
// Handles validation, API call, and navigation
// ============================================

interface PerformanceDataPoint {
  timestamp: number;
  targetFrequency: number;
  detectedFrequency: number | null;
  targetNote: string;
}

interface SessionStats {
  totalPoints: number;
  validPoints: number;
  duration: number;
}

interface UsePerformanceSubmitOptions {
  songId: string;
  userName?: string;
  minValidPoints?: number;
}

interface UsePerformanceSubmitReturn {
  isSubmitting: boolean;
  error: string | null;
  submitPerformance: (
    performanceData: PerformanceDataPoint[],
    stats: SessionStats
  ) => Promise<void>;
  clearError: () => void;
}

export const usePerformanceSubmit = ({
  songId,
  userName = 'Usuario Demo',
  minValidPoints = 10,
}: UsePerformanceSubmitOptions): UsePerformanceSubmitReturn => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitPerformance = useCallback(
    async (performanceData: PerformanceDataPoint[], stats: SessionStats) => {
      // Reset error state
      setError(null);

      // Validate data
      if (performanceData.length === 0) {
        setError('No hay datos suficientes para analizar. Intenta cantar durante la canción.');
        return;
      }

      // Validate that there are enough valid frequency points
      const validPoints = performanceData.filter(
        (p) => p.detectedFrequency && p.detectedFrequency > 0
      );

      if (validPoints.length < minValidPoints) {
        setError(
          `Solo se detectaron ${validPoints.length} puntos de audio válidos. Asegúrate de que tu micrófono esté funcionando y canta más fuerte.`
        );
        return;
      }

      setIsSubmitting(true);

      try {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.performances}`;

        const payload = {
          songId,
          userName,
          performanceData,
        };

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[PerformanceSubmit] Sending:', {
            url,
            songId: payload.songId,
            dataPoints: payload.performanceData.length,
            payloadSize: `${(JSON.stringify(payload).length / 1024).toFixed(2)} KB`,
            stats,
          });
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al guardar sesión');
        }

        const data = await response.json();

        if (process.env.NODE_ENV === 'development') {
          console.log('[PerformanceSubmit] Success:', data.sessionId);
        }

        // Navigate to results page
        router.push(`/results/${data.sessionId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo guardar la sesión';
        setError(message);
        
        if (process.env.NODE_ENV === 'development') {
          console.error('[PerformanceSubmit] Error:', err);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [songId, userName, minValidPoints, router]
  );

  return {
    isSubmitting,
    error,
    submitPerformance,
    clearError,
  };
};
