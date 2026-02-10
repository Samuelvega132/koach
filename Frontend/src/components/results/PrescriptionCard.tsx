"use client";

import { ClipboardList, Lightbulb, Star, Sparkles, Trophy, AlertTriangle } from "lucide-react";

interface PrescriptionCardProps {
    prescription: string[];
}

/**
 * Detecta si las prescripciones son del "happy path" (celebratorias)
 * CORREGIDO: Ahora también verifica que NO haya indicadores de error
 */
function isSuccessPrescription(prescription: string[]): boolean {
    if (prescription.length === 0) return false; // Sin prescripciones = no es éxito
    
    const successIndicators = [
        'felicitaciones',
        'mantén tu rutina',
        'desafíate',
        'mayor dificultad',
        'sigue usando',
        'mantener tu nivel',
    ];
    
    // Indicadores de ERROR que invalidan el "éxito"
    const errorIndicators = [
        'alerta',
        'error',
        'problema',
        'desafinación',
        'desafinacion',
        'detectado',
        'severa',
        'corregir',
        'mejorar',
        'practica',
        'ejercicio',
    ];
    
    const allText = prescription.join(' ').toLowerCase();
    
    // Si hay indicadores de error, NO es éxito
    if (errorIndicators.some(indicator => allText.includes(indicator))) {
        return false;
    }
    
    // Solo es éxito si tiene indicadores de éxito
    return successIndicators.some(indicator => allText.includes(indicator));
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
    const isSuccess = isSuccessPrescription(prescription);

    // Vista especial para el Happy Path
    if (isSuccess) {
        return (
            <div className="glass-panel p-6 rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-green-500/5">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-teal-400" />
                    Recomendaciones para Continuar tu Progreso
                </h2>

                <div className="space-y-4">
                    {prescription.map((exercise, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-teal-500/10 to-green-500/5 rounded-lg border border-teal-500/20 hover:border-teal-500/40 transition-all"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white">
                                <Star className="w-4 h-4" />
                            </div>
                            <p className="text-gray-200 leading-relaxed flex-1">
                                {exercise}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-lg border border-teal-500/30">
                    <p className="text-sm text-teal-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Excelente trabajo:</strong> Tu técnica vocal está en óptimas condiciones. Continúa practicando regularmente para mantener tu nivel.
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    // Vista estándar para prescripciones de mejora
    return (
        <div className="glass-panel p-6 rounded-xl border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-purple-400" />
                Prescripción de Ejercicios
            </h2>

            <div className="space-y-4">
                {prescription.map((exercise, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                            {i + 1}
                        </div>
                        <p className="text-gray-200 leading-relaxed flex-1">
                            {exercise}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                        <strong>Consejo:</strong> Practica estos ejercicios durante 10-15 minutos diarios para ver mejoras significativas en 2-3 semanas.
                    </span>
                </p>
            </div>
        </div>
    );
}
