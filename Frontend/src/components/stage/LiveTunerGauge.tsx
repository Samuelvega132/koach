"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface LiveTunerGaugeProps {
    cents: number; // Desviación en cents (-50 a +50)
    detectedNote: string; // Nota detectada del micrófono
    targetNote: string; // Nota objetivo de la canción
    userFrequency: number | null; // Frecuencia detectada
    isSinging: boolean;
    isMatching: boolean; // Si la nota coincide con el target
}

export const LiveTunerGauge = ({ cents, detectedNote, userFrequency, isSinging, isMatching }: LiveTunerGaugeProps) => {
    // Clamp cents visualmente para que no rompa la aguja
    const clampedCents = Math.max(-50, Math.min(50, cents));

    // Rotación: -50 cents = -45deg, +50 cents = +45deg
    const rotation = (clampedCents / 50) * 45;

    // Color de retroalimentación
    const getStatusColor = () => {
        if (!isSinging) return "text-gray-500 border-gray-700";
        if (isMatching) return "text-green-400 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]"; // GREEN when matching
        if (Math.abs(cents) < 10) return "text-tuner-perfect border-tuner-perfect shadow-tuner-perfect";
        if (cents > 0) return "text-tuner-sharp border-tuner-sharp"; // Alto (Sharp)
        return "text-tuner-flat border-tuner-flat"; // Bajo (Flat)
    };

    return (
        <div className="relative flex flex-col items-center justify-end w-64 h-32">
            {/* Arco de fondo (SVG) */}
            <svg className="absolute top-0 w-full h-full overflow-visible" viewBox="0 0 200 100">
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100" // Arco semicircular
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/10"
                />
                {/* Marca Central */}
                <line x1="100" y1="20" x2="100" y2="35" stroke="currentColor" strokeWidth="2" className="text-white/20" />
            </svg>

            {/* Aguja Animada */}
            <div className="absolute top-0 w-full h-full flex items-end justify-center pb-2">
                <motion.div
                    className="origin-bottom w-1 h-[80px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    style={{ transformOrigin: "bottom center" }}
                />
            </div>

            {/* Nota Central - NOTA DETECTADA DEL MICRÓFONO */}
            <div className={clsx(
                "relative z-10 flex flex-col items-center justify-center w-20 h-20 mb-[-10px] rounded-full border-4 bg-slate-900 transition-colors duration-300",
                getStatusColor()
            )}>
                <span className="text-2xl font-bold tracking-tighter">
                    {detectedNote || "-"}
                </span>
                {userFrequency && (
                    <span className="text-[8px] font-mono text-gray-400 mt-[-2px]">
                        {Math.round(userFrequency)} Hz
                    </span>
                )}
            </div>

            {/* Indicadores Texto */}
            <div className="absolute bottom-4 left-0 text-xs font-mono text-tuner-flat font-bold opacity-50">FLAT</div>
            <div className="absolute bottom-4 right-0 text-xs font-mono text-tuner-sharp font-bold opacity-50">SHARP</div>
        </div>
    );
};
