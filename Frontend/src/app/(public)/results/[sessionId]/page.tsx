"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DiagnosisCard } from '@/components/results/DiagnosisCard';
import { PrescriptionCard } from '@/components/results/PrescriptionCard';
import { API_CONFIG } from '@/config/api.config';
import { ResultsPageSkeleton } from '@/components/ui/Skeleton';
import { 
    ArrowLeft, 
    Download, 
    Share2, 
    UserPlus, 
    TrendingUp, 
    Save,
    XCircle,
    Clock,
    Mic,
    Music,
    BarChart3,
    LineChart,
    Target,
    Lightbulb,
    Music2,
    Timer,
    Activity,
    Keyboard
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

// Lazy load heavy chart component
const PerformanceRadar = dynamic(
    () => import('@/components/charts/PerformanceRadar').then(mod => ({ default: mod.PerformanceRadar })),
    { 
        loading: () => (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        ),
        ssr: false 
    }
);

interface SessionTelemetry {
    pitchDeviationAverage: number;
    pitchDeviationStdDev: number;
    sharpNotesCount: number;
    flatNotesCount: number;
    rhythmicOffsetAverage: number;
    earlyNotesCount: number;
    lateNotesCount: number;
    stabilityVariance: number;
    vibratoRate: number;
    vibratoDepth: number;
    rangeCoverage: {
        notesMissed: string[];
        notesAchieved: string[];
        lowestNote: string;
        highestNote: string;
        comfortableRange: [string, string];
    };
    totalDuration: number;
    activeSingingTime: number;
    silenceTime: number;
}

interface VocalDiagnosis {
    primaryIssue: string;
    secondaryIssues: string[];
    diagnosis: string;
    prescription: string[];
    severity: 'mild' | 'moderate' | 'severe';
    affectedRange: 'low' | 'mid' | 'high' | 'full';
}

interface SessionData {
    sessionId: string;
    score: number;
    feedback: string[];
    analysis: {
        pitchAccuracy: { score: number; avgDeviationCents: number; inTunePercentage: number };
        stability: { score: number; avgJitter: number; stableNotesPercentage: number };
        timing: { score: number; avgLatency: number; onTimePercentage: number };
    };
    telemetry: SessionTelemetry;
    diagnosis: VocalDiagnosis;
    song: {
        title: string;
        artist: string;
    };
}

export default function ResultsPage() {
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.performanceById(params.sessionId as string)}`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Development-only logging
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Results] Session loaded:', {
                        sessionId: params.sessionId,
                        score: data.score,
                        hasTelemetry: !!data.telemetry,
                        hasDiagnosis: !!data.diagnosis,
                    });
                }
                
                setSessionData(data);
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('[Results] Failed to load session:', err);
                }
                setError(err instanceof Error ? err.message : 'Error loading session');
            } finally {
                setLoading(false);
            }
        };

        if (params.sessionId) {
            fetchSession();
        }
    }, [params.sessionId]);

    if (loading) {
        return <ResultsPageSkeleton />;
    }

    if (error || !sessionData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-400 text-xl mb-4">
                        <XCircle className="w-6 h-6" />
                        <span>{error || 'Sesión no encontrada'}</span>
                    </div>
                    <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate scores for radar chart (with safe defaults)
    const pitchScore = sessionData?.analysis?.pitchAccuracy?.score ?? 0;
    const rhythmScore = sessionData?.analysis?.timing?.score ?? 0;
    const stabilityScore = sessionData?.analysis?.stability?.score ?? 0;
    const toneScore = Math.max(0, 100 - Math.abs(sessionData?.telemetry?.pitchDeviationAverage ?? 0) * 2);
    
    const notesAchieved = sessionData?.telemetry?.rangeCoverage?.notesAchieved?.length ?? 0;
    const notesMissed = sessionData?.telemetry?.rangeCoverage?.notesMissed?.length ?? 0;
    const totalNotes = notesAchieved + notesMissed;
    const rangeScore = totalNotes > 0 ? (notesAchieved / totalNotes) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Análisis Vocal Completo</h1>
                            <p className="text-sm text-purple-400">{sessionData.song.title} - {sessionData.song.artist}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-all">
                            <Share2 className="w-4 h-4" />
                            Compartir
                        </button>
                        <button className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-sm flex items-center gap-2 transition-all">
                            <Download className="w-4 h-4" />
                            Exportar PDF
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Score Overview */}
                <div className="glass-panel p-8 rounded-xl mb-8 text-center border border-purple-500/30">
                    <h2 className="text-6xl font-bold text-white mb-2">{sessionData.score}</h2>
                    <p className="text-xl text-purple-400">Puntuación Global</p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {(sessionData.telemetry?.totalDuration ?? 0).toFixed(1)}s
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Mic className="w-4 h-4" />
                            {(sessionData.telemetry?.activeSingingTime ?? 0).toFixed(1)}s activo
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Music className="w-4 h-4" />
                            {notesAchieved} notas logradas
                        </span>
                    </div>
                    
                    {/* Status Badge */}
                    {isAuthenticated ? (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                            <Save className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-300">Guardado en tu historial</span>
                        </div>
                    ) : (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                            <span className="text-sm text-yellow-300">Modo invitado - No guardado</span>
                        </div>
                    )}
                </div>

                {/* Guest Banner - Call to Action */}
                {!isAuthenticated && (
                    <div className="glass-panel p-8 rounded-xl mb-8 border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    ¿Quieres guardar tu progreso y ver tu evolución?
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    Crea tu cuenta gratis y accede a gráficos históricos, estadísticas detalladas y compara tus mejoras a lo largo del tiempo.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Crear Cuenta Gratis
                                    </button>
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-200"
                                    >
                                        Ya tengo cuenta
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Benefits List */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Historial Completo</p>
                                    <p className="text-sm text-gray-400">Todas tus sesiones guardadas</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <LineChart className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Gráficos de Progreso</p>
                                    <p className="text-sm text-gray-400">Ve tu evolución en el tiempo</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <Target className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Objetivos Personalizados</p>
                                    <p className="text-sm text-gray-400">Mejora según tu nivel</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Radar Chart */}
                <div className="glass-panel p-8 rounded-xl mb-8 border border-purple-500/30">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                        Análisis Multidimensional
                    </h2>
                    <PerformanceRadar
                        pitchScore={pitchScore}
                        rhythmScore={rhythmScore}
                        stabilityScore={stabilityScore}
                        toneScore={toneScore}
                        rangeScore={rangeScore}
                    />
                </div>

                {/* Diagnosis Card */}
                <div className="mb-8">
                    <DiagnosisCard diagnosis={sessionData.diagnosis} />
                </div>

                {/* Prescription Card */}
                <div className="mb-8">
                    <PrescriptionCard prescription={sessionData.diagnosis.prescription} />
                </div>

                {/* Feedback & Recommendations */}
                {sessionData.feedback && sessionData.feedback.length > 0 && (
                    <div className="glass-panel p-8 rounded-xl mb-8 border border-blue-500/30">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-blue-400" />
                            Recomendaciones del Sistema Experto
                        </h2>
                        <div className="space-y-3">
                            {sessionData.feedback.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <span className="text-2xl flex-shrink-0">{index + 1}</span>
                                    <p className="text-gray-300 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detailed Metrics */}
                <div className="glass-panel p-8 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <LineChart className="w-6 h-6 text-purple-400" />
                        Métricas Detalladas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pitch Metrics */}
                        <div className="p-4 bg-white/5 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                <Music2 className="w-5 h-5" />
                                Afinación
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Desviación promedio:</span>
                                    <span className="text-white font-mono">{(sessionData.telemetry?.pitchDeviationAverage ?? 0).toFixed(1)} cents</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Desviación estándar:</span>
                                    <span className="text-white font-mono">{(sessionData.telemetry?.pitchDeviationStdDev ?? 0).toFixed(1)} cents</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Notas agudas:</span>
                                    <span className="text-white font-mono">{sessionData.telemetry?.sharpNotesCount ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
            
            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                defaultMode="register"
            />
                                    <span className="text-gray-400">Notas graves:</span>
                                    <span className="text-white font-mono">{sessionData.telemetry?.flatNotesCount ?? 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rhythm Metrics */}
                        <div className="p-4 bg-white/5 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                <Timer className="w-5 h-5" />
                                Ritmo
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Offset promedio:</span>
                                    <span className="text-white font-mono">{(sessionData.telemetry?.rhythmicOffsetAverage ?? 0).toFixed(0)} ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Notas tempranas:</span>
                                    <span className="text-white font-mono">{sessionData.telemetry?.earlyNotesCount ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Notas tardías:</span>
                                    <span className="text-white font-mono">{sessionData.telemetry?.lateNotesCount ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Precisión:</span>
                                    <span className="text-white font-mono">{(sessionData.analysis?.timing?.onTimePercentage ?? 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Stability Metrics */}
                        <div className="p-4 bg-white/5 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Estabilidad
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Varianza:</span>
                                    <span className="text-white font-mono">{(sessionData.telemetry?.stabilityVariance ?? 0).toFixed(1)} Hz</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Vibrato rate:</span>
                                    <span className="text-white font-mono">{(sessionData.telemetry?.vibratoRate ?? 0).toFixed(1)} Hz</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Vibrato depth:</span>
                                    <span className="text-white font-mono">{(sessionData.telemetry?.vibratoDepth ?? 0).toFixed(1)} cents</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Notas estables:</span>
                                    <span className="text-white font-mono">{(sessionData.analysis?.stability?.stableNotesPercentage ?? 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Range Coverage */}
                    <div className="mt-6 p-4 bg-white/5 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                            <Keyboard className="w-5 h-5" />
                            Cobertura de Rango
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-400 mb-2">Rango total:</p>
                                <p className="text-white font-mono">
                                    {sessionData.telemetry?.rangeCoverage?.lowestNote ?? 'N/A'} - {sessionData.telemetry?.rangeCoverage?.highestNote ?? 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-2">Rango cómodo:</p>
                                <p className="text-white font-mono">
                                    {sessionData.telemetry?.rangeCoverage?.comfortableRange?.[0] ?? 'N/A'} - {sessionData.telemetry?.rangeCoverage?.comfortableRange?.[1] ?? 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
