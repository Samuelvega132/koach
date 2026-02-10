/**
 * ============================================
 * HOOK: useSessionTelemetry
 * ============================================
 * Recolecta datos de performance durante una sesión de canto
 * para análisis posterior por el Sistema Experto
 */

import { useRef, useCallback } from 'react';
import { PerformanceDataPoint } from '@/types';

export function useSessionTelemetry() {
    const performanceData = useRef<PerformanceDataPoint[]>([]);
    const sessionStartTime = useRef<number>(0);

    /**
     * Inicia la recolección de datos
     */
    const startRecording = useCallback(() => {
        performanceData.current = [];
        sessionStartTime.current = Date.now();
        if (process.env.NODE_ENV === 'development') {
            console.log('[Telemetry] Recording started, array cleared');
        }
    }, []);

    /**
     * Registra un punto de datos durante la sesión
     */
    const recordDataPoint = useCallback((
        detectedFrequency: number | null,
        targetFrequency: number,
        targetNote: string
    ) => {
        const timestamp = Date.now() - sessionStartTime.current;

        performanceData.current.push({
            timestamp,
            detectedFrequency,
            targetFrequency,
            targetNote,
        });

        // Log cada 60 puntos (aproximadamente 1 segundo a 60 FPS)
        if (performanceData.current.length % 60 === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Telemetry] ${performanceData.current.length} data points collected`);
            }
        }
    }, []);

    /**
     * Obtiene todos los datos recolectados
     */
    const getPerformanceData = useCallback((): PerformanceDataPoint[] => {
        return performanceData.current;
    }, []);

    /**
     * Limpia los datos recolectados
     */
    const clearData = useCallback(() => {
        performanceData.current = [];
        sessionStartTime.current = 0;
    }, []);

    /**
     * Obtiene estadísticas básicas de la sesión
     */
    const getSessionStats = useCallback(() => {
        const data = performanceData.current;
        const validPoints = data.filter(p => p.detectedFrequency && p.detectedFrequency > 0);

        return {
            totalPoints: data.length,
            validPoints: validPoints.length,
            duration: data.length > 0 ? (data[data.length - 1].timestamp / 1000) : 0,
            coveragePercentage: data.length > 0 ? (validPoints.length / data.length) * 100 : 0,
        };
    }, []);

    return {
        startRecording,
        recordDataPoint,
        getPerformanceData,
        getSessionStats,
        clearData,
    };
}
