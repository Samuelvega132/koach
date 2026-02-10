"use client";

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { MelodyNote } from '../../types';
import { getNoteCalculations } from '@/utils/noteUtils';

interface PianoRollProps {
    notes: MelodyNote[];
    currentTime: number;
    userPitch?: number | null;
    height?: number;
}

export const PianoRollVisualizer = ({ notes, currentTime, userPitch, height = 300 }: PianoRollProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(currentTime);
    const lastPitchRef = useRef<number | null>(userPitch ?? null);

    // GPU-Accelerated Constants
    const PIXELS_PER_SECOND = 100;
    const NOTE_HEIGHT = 10;

    // PRE-CALCULAR todas las notas UNA SOLA VEZ (no en cada frame)
    const calculatedNotes = useMemo(() => {
        return notes.map(note => getNoteCalculations(note));
    }, [notes]);

    // Calcular rango dinámico de frecuencias basado en las notas de la canción
    const { MIN_FREQ, MAX_FREQ } = useMemo(() => {
        if (calculatedNotes.length === 0) {
            return { MIN_FREQ: 130, MAX_FREQ: 987 }; // Fallback: C3 a B5
        }

        const frequencies = calculatedNotes.map(note => note.frequency);
        const minFreq = Math.min(...frequencies);
        const maxFreq = Math.max(...frequencies);

        // Agregar padding del 20% arriba y abajo para mejor visualización
        const range = maxFreq - minFreq;
        const padding = range * 0.1;

        return {
            MIN_FREQ: Math.max(50, minFreq - padding), // Mínimo absoluto: 50 Hz
            MAX_FREQ: Math.min(1500, maxFreq + padding) // Máximo absoluto: 1500 Hz
        };
    }, [calculatedNotes]);

    const getY = useCallback((freq: number, h: number) => {
        const normalized = 1 - Math.min(1, Math.max(0, (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)));
        return normalized * (h - 40) + 20;
    }, [MIN_FREQ, MAX_FREQ]);

    // CRITICAL: Use RAF for smooth 60fps rendering
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { 
            alpha: false, // Better performance
            desynchronized: true // Unlock GPU rendering
        });
        if (!ctx) return;

        const { width } = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio, 2); // Limit to 2x for perf
        
        // Resize canvas only if needed
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        }

        // Clear
        ctx.fillStyle = '#020617'; // slate-950
        ctx.fillRect(0, 0, width, height);

        // Grid (Static, can be optimized further with offscreen canvas)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += NOTE_HEIGHT * 4) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        const nowX = width * 0.2;
        const time = lastTimeRef.current;

        // Render Notes (usando notas pre-calculadas)
        calculatedNotes.forEach(note => {
            const { start, end, frequency, lyric } = note;

            const startX = nowX + (start - time) * PIXELS_PER_SECOND;
            const widthPx = (end - start) * PIXELS_PER_SECOND;
            const y = getY(frequency, height);

            // Frustum culling
            if (startX + widthPx < -100 || startX > width + 100) return;

            // Neon glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#8b5cf6';
            ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
            ctx.fillRect(startX, y - NOTE_HEIGHT / 2, widthPx, NOTE_HEIGHT);

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(startX, y - NOTE_HEIGHT / 2, widthPx, NOTE_HEIGHT);

            // Lyric
            if (lyric) {
                ctx.font = '10px Inter, sans-serif';
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
                ctx.fillText(lyric, startX, y - NOTE_HEIGHT);
            }

            ctx.shadowBlur = 0;
        });

        // Playhead
        ctx.beginPath();
        ctx.moveTo(nowX, 0);
        ctx.lineTo(nowX, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // User Pitch Cursor (GPU-accelerated with glow)
        const pitch = lastPitchRef.current;
        if (pitch && pitch > 0) {
            const userY = getY(pitch, height);

            ctx.beginPath();
            ctx.arc(nowX, userY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#facc15';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#facc15';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

    }, [calculatedNotes, height, getY]);

    // RAF Loop
    useEffect(() => {
        lastTimeRef.current = currentTime;
        lastPitchRef.current = userPitch ?? null;

        const loop = () => {
            render();
            animationRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [currentTime, userPitch, render]);

    return (
        <div className="w-full rounded-xl overflow-hidden glass-panel">
            <canvas
                ref={canvasRef}
                className="w-full block"
                style={{ height, willChange: 'transform' }} // GPU hint
            />
        </div>
    );
};
