"use client";

import { useEffect, useRef } from 'react';
import { MelodyNote } from '../../types';
import { getNoteCalculations } from '@/utils/noteUtils';

interface PianoRollProps {
    notes: MelodyNote[];
    currentTime: number;
    userPitch?: number | null; // Frecuencia detectada del usuario
    height?: number;
}

export const PianoRollVisualizer = ({ notes, currentTime, userPitch, height = 300 }: PianoRollProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Constantes de visualización
    const PIXELS_PER_SECOND = 100;
    const NOTE_HEIGHT = 10;
    const MIN_FREQ = 130; // C3 aprox
    const MAX_FREQ = 987; // B5 aprox

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Función helper para Y
        const getY = (freq: number) => {
            const normalized = 1 - Math.min(1, Math.max(0, (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)));
            return normalized * (height - 40) + 20;
        };

        // Configurar tamaño
        const { width } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        // Limpiar
        ctx.clearRect(0, 0, width, height);

        // Fondo Cyberpunk (Grid)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += NOTE_HEIGHT * 4) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Dibujar Notas Objetivo (Barras)
        // Desplazamiento: currentTime está en el 20% del ancho del canvas (línea de "ahora")
        const nowX = width * 0.2;

        notes.forEach(note => {
            const { start, end, frequency, lyric } = getNoteCalculations(note);

            const startX = nowX + (start - currentTime) * PIXELS_PER_SECOND;
            const widthPx = (end - start) * PIXELS_PER_SECOND;
            const y = getY(frequency);

            // Solo dibujar si está visible
            if (startX + widthPx > -100 && startX < width + 100) {
                // Estilo Neon
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#8b5cf6'; // Violet glow
                ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
                ctx.fillRect(startX, y - NOTE_HEIGHT / 2, widthPx, NOTE_HEIGHT);

                // Borde brillante
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(startX, y - NOTE_HEIGHT / 2, widthPx, NOTE_HEIGHT);

                // Dibujar letra si existe
                if (lyric) {
                    ctx.font = '10px Inter, sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.shadowBlur = 0;
                    ctx.fillText(lyric, startX, y - NOTE_HEIGHT);
                }

                // Reset shadow
                ctx.shadowBlur = 0;
            }
        });

        // Línea de "AHORA" (Playhead)
        ctx.beginPath();
        ctx.moveTo(nowX, 0);
        ctx.lineTo(nowX, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dibujar Pitch del Usuario (Cursor)
        if (userPitch && userPitch > 0) {
            const userY = getY(userPitch);

            ctx.beginPath();
            ctx.arc(nowX, userY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#facc15'; // Yellow
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#facc15';
            ctx.fill();
        }

    }, [notes, currentTime, userPitch, height]);

    return (
        <div className="w-full rounded-xl overflow-hidden glass-panel">
            <canvas
                ref={canvasRef}
                className="w-full block"
                style={{ height }}
            />
        </div>
    );
};
