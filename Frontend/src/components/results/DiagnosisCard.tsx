"use client";

import { Music, Keyboard, Microscope } from "lucide-react";

interface VocalDiagnosis {
    primaryIssue: string;
    secondaryIssues: string[];
    diagnosis: string;
    prescription: string[];
    severity: 'mild' | 'moderate' | 'severe';
    affectedRange: 'low' | 'mid' | 'high' | 'full';
}

interface DiagnosisCardProps {
    diagnosis: VocalDiagnosis;
}

export function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
    const severityConfig = {
        mild: {
            color: 'bg-green-500',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/30',
            label: 'Leve',
        },
        moderate: {
            color: 'bg-yellow-500',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/30',
            label: 'Moderado',
        },
        severe: {
            color: 'bg-red-500',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/30',
            label: 'Severo',
        },
    };

    const rangeConfig = {
        low: { label: 'Graves', IconComponent: Music },
        mid: { label: 'Medios', IconComponent: Music },
        high: { label: 'Agudos', IconComponent: Music },
        full: { label: 'Rango Completo', IconComponent: Keyboard },
    };

    const config = severityConfig[diagnosis.severity];
    const rangeInfo = rangeConfig[diagnosis.affectedRange];
    const RangeIcon = rangeInfo.IconComponent;

    return (
        <div className={`glass-panel p-6 rounded-xl border ${config.borderColor}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Microscope className="w-6 h-6 text-purple-400" />
                    Diagnóstico Experto
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full ${config.color} text-white text-sm font-bold`}>
                        {config.label}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-bold flex items-center gap-1">
                        <RangeIcon className="w-4 h-4" />
                        {rangeInfo.label}
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-2 ${config.textColor}`}>
                    {diagnosis.primaryIssue}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                    {diagnosis.diagnosis}
                </p>
            </div>

            {diagnosis.secondaryIssues.length > 0 && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Problemas Adicionales:</h4>
                    <ul className="space-y-1">
                        {diagnosis.secondaryIssues.map((issue, i) => (
                            <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>{issue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
