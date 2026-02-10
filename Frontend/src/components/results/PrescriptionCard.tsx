"use client";

import { ClipboardList, Lightbulb } from "lucide-react";

interface PrescriptionCardProps {
    prescription: string[];
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
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
