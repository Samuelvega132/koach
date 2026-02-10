"use client";

import { 
    Music, 
    Keyboard, 
    Microscope, 
    Trophy, 
    CheckCircle, 
    Sparkles,
    AlertTriangle,
    AlertCircle 
} from "lucide-react";

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

/**
 * Detecta si el diagnóstico es "excelente" / "happy path"
 * basándose en la respuesta del Motor Prolog
 */
function isExcellentDiagnosis(diagnosis: VocalDiagnosis): boolean {
    const excellentIndicators = [
        'salud vocal óptima',
        'excelente',
        'impecable',
        'óptima',
        'sin problemas',
        'sin anomalías',
    ];
    
    const primaryLower = diagnosis.primaryIssue.toLowerCase();
    const diagnosisLower = diagnosis.diagnosis.toLowerCase();
    
    return excellentIndicators.some(indicator => 
        primaryLower.includes(indicator) || diagnosisLower.includes(indicator)
    );
}

export function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
    const isExcellent = isExcellentDiagnosis(diagnosis);

    // Configuración especial para el Happy Path
    if (isExcellent) {
        return (
            <div className="glass-panel p-6 rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-green-500/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-teal-400" />
                        Diagnóstico Experto
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-green-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-500/25">
                            <Sparkles className="w-4 h-4" />
                            Excelente
                        </span>
                    </div>
                </div>

                {/* Success Hero Section */}
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-green-500/20 border border-teal-500/30 mb-4">
                        <CheckCircle className="w-10 h-10 text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-teal-300 mb-3">
                        {diagnosis.primaryIssue}
                    </h3>
                    <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        {diagnosis.diagnosis}
                    </p>
                </div>

                {/* Success Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20 text-center">
                        <CheckCircle className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Afinación</p>
                        <p className="text-lg font-bold text-teal-300">Correcta</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                        <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Estabilidad</p>
                        <p className="text-lg font-bold text-green-300">Óptima</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Timing</p>
                        <p className="text-lg font-bold text-emerald-300">Preciso</p>
                    </div>
                </div>
            </div>
        );
    }

    // Configuración para diagnósticos con problemas
    const severityConfig = {
        mild: {
            color: 'bg-yellow-500',
            bgGradient: 'from-yellow-500/10 to-transparent',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/30',
            label: 'Leve',
            Icon: AlertCircle,
        },
        moderate: {
            color: 'bg-orange-500',
            bgGradient: 'from-orange-500/10 to-transparent',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/30',
            label: 'Moderado',
            Icon: AlertTriangle,
        },
        severe: {
            color: 'bg-red-500',
            bgGradient: 'from-red-500/10 to-transparent',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/30',
            label: 'Severo',
            Icon: AlertTriangle,
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
    const SeverityIcon = config.Icon;

    return (
        <div className={`glass-panel p-6 rounded-xl border ${config.borderColor} bg-gradient-to-br ${config.bgGradient}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Microscope className="w-6 h-6 text-purple-400" />
                    Diagnóstico Experto
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full ${config.color} text-white text-sm font-bold flex items-center gap-1`}>
                        <SeverityIcon className="w-3.5 h-3.5" />
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
                                <span className={config.textColor}>•</span>
                                <span>{issue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
