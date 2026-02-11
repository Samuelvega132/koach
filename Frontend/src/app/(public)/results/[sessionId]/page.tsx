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
    Music2,
    Timer,
    Activity,
    Keyboard,
    Trophy,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Toast } from '@/components/ui/Toast';

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
    allDiagnoses?: string[]; // Lista completa de diagnósticos de Prolog
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

/**
 * Detecta si el diagnóstico indica una performance excelente
 * basándose en la respuesta del Motor Prolog
 */
function isExcellentPerformance(diagnosis: VocalDiagnosis): boolean {
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

export default function ResultsPage() {
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

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

    /**
     * Maneja el compartir el análisis
     * Usa Web Share API si está disponible, sino copia link al portapapeles
     */
    const handleShare = async () => {
        setIsSharing(true);
        
        const shareUrl = window.location.href;
        const shareTitle = `Mi análisis vocal - ${sessionData?.song.title}`;
        const shareText = `🎤 Obtuve ${sessionData?.score} en "${sessionData?.song.title}" en KOACH!`;

        try {
            // Web Share API (mobile + algunos navegadores modernos)
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
                setToast({ message: '¡Compartido exitosamente!', type: 'success' });
            } else {
                // Fallback: copiar al portapapeles
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                setToast({ message: 'Link copiado al portapapeles ✓', type: 'success' });
            }
        } catch (err) {
            // Usuario canceló o error
            if ((err as Error).name !== 'AbortError') {
                setToast({ message: 'Error al compartir', type: 'error' });
            }
        } finally {
            setIsSharing(false);
        }
    };

    /**
     * Exporta el análisis a PDF
     * Usa html2canvas para capturar el contenido + jsPDF para generar el PDF
     */
    const handleExportPDF = async () => {
        setIsExporting(true);
        setToast({ message: 'Generando PDF... ⏳', type: 'warning' });

        try {
            // Importaciones dinámicas (code splitting)
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            // Capturar el contenido principal
            const mainContent = document.querySelector('main');
            if (!mainContent) throw new Error('Contenido no encontrado');

            // Ocultar temporalmente elementos no deseados (botones, etc)
            const elementsToHide = document.querySelectorAll('[data-no-pdf]');
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

            // 🔧 FIX: Agregar fondo blanco temporal para que el contenido sea visible
            const originalBg = document.body.style.backgroundColor;
            const originalMainBg = (mainContent as HTMLElement).style.backgroundColor;
            document.body.style.backgroundColor = '#1a0b2e'; // Dark purple solid
            (mainContent as HTMLElement).style.backgroundColor = '#1a0b2e';

            // Scroll to top para capturar desde arriba
            const originalScroll = window.scrollY;
            window.scrollTo(0, 0);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll + animations

            // Captura con configuración optimizada para fondos oscuros
            const canvas = await html2canvas(mainContent as HTMLElement, {
                scale: 2,
                backgroundColor: '#1a0b2e', // Dark purple background
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: false, // Mejor compatibilidad
                imageTimeout: 0,
                removeContainer: true,
                width: mainContent.scrollWidth,
                height: mainContent.scrollHeight,
                windowWidth: mainContent.scrollWidth,
                windowHeight: mainContent.scrollHeight,
                onclone: (clonedDoc) => {
                    // 🔧 FIX: Forzar estilos en el DOM clonado para mejor visibilidad
                    const clonedMain = clonedDoc.querySelector('main');
                    if (clonedMain) {
                        (clonedMain as HTMLElement).style.backgroundColor = '#1a0b2e';
                        (clonedMain as HTMLElement).style.color = '#ffffff';
                        
                        // Remover blur effects que causan problemas
                        clonedDoc.querySelectorAll('.backdrop-blur-md, .backdrop-blur-lg, .backdrop-blur-xl').forEach(el => {
                            (el as HTMLElement).style.backdropFilter = 'none';
                            (el as HTMLElement).style.webkitBackdropFilter = 'none';
                        });
                        
                        // Forzar opacidad en glass panels
                        clonedDoc.querySelectorAll('.glass-panel').forEach(el => {
                            (el as HTMLElement).style.backgroundColor = 'rgba(30, 15, 50, 0.95)';
                        });
                    }
                },
            });

            // Restaurar estilos originales
            document.body.style.backgroundColor = originalBg;
            (mainContent as HTMLElement).style.backgroundColor = originalMainBg;
            window.scrollTo(0, originalScroll);
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = '');

            // Crear PDF (A4 portrait) con compresión
            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Comprimir imagen para reducir tamaño del PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG con 85% calidad
            
            // Primera página
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // Agregar páginas adicionales si el contenido es muy largo
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }

            // Agregar metadata
            pdf.setProperties({
                title: `Análisis Vocal - ${sessionData?.song.title}`,
                subject: 'Análisis de Performance Vocal',
                author: 'KOACH AI Vocal Coach',
                keywords: 'vocal, análisis, performance, karaoke',
                creator: 'KOACH Platform',
            });

            // Marca de agua en cada página (footer)
            const totalPages = pdf.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.text(
                    `KOACH - Intelligent Vocal Studio | Página ${i} de ${totalPages} | ${new Date().toLocaleDateString()}`,
                    105,
                    290,
                    { align: 'center' }
                );
            }

            // Descargar PDF
            const filename = `KOACH-${sessionData?.song.title.replace(/[^a-zA-Z0-9]/g, '_')}-${sessionData?.score}pts-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);

            setToast({ message: '✅ PDF descargado exitosamente', type: 'success' });
        } catch (err) {
            console.error('[Export PDF] Error:', err);
            setToast({ message: '❌ Error al generar PDF', type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

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

    // Calculate scores for radar chart
    // 🆕 USAR SCORES DEL BACKEND (ya calculados con filtrado de outliers)
    // NO recalcular aquí - causa inconsistencias entre UI y BDD
    const pitchScore = sessionData?.analysis?.pitchAccuracy?.score ?? 0;
    const stabilityScore = sessionData?.analysis?.stability?.score ?? 0;
    const rhythmScore = sessionData?.analysis?.timing?.score ?? 0;
    
    // Tono y rango desde telemetry (para gráfica de radar)
    const toneScore = pitchScore; // Mismo que pitch accuracy
    const notesAchieved = sessionData?.telemetry?.rangeCoverage?.notesAchieved?.length ?? 0;
    const notesMissed = sessionData?.telemetry?.rangeCoverage?.notesMissed?.length ?? 0;
    const totalNotes = notesAchieved + notesMissed;
    const rangeScore = totalNotes > 0 ? (notesAchieved / totalNotes) * 100 : 0;

    // Detectar si es una performance excelente (Happy Path)
    const isExcellent = sessionData.diagnosis ? isExcellentPerformance(sessionData.diagnosis) : false;

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

                    <div className="flex items-center gap-2" data-no-pdf>
                        <button 
                            onClick={handleShare}
                            disabled={isSharing}
                            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSharing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Share2 className="w-4 h-4" />
                            )}
                            {isSharing ? 'Compartiendo...' : 'Compartir'}
                        </button>
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {isExporting ? 'Generando...' : 'Exportar PDF'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Score Overview - Adaptive styling based on performance */}
                <div className={`glass-panel p-8 rounded-xl mb-8 text-center border ${
                    isExcellent 
                        ? 'border-teal-500/50 bg-gradient-to-br from-teal-500/10 to-green-500/10' 
                        : 'border-purple-500/30'
                }`}>
                    {/* Excellence Badge */}
                    {isExcellent && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-green-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-500/25">
                                <Trophy className="w-4 h-4" />
                                Ejecución Impecable
                            </span>
                        </div>
                    )}
                    
                    <h2 className={`text-6xl font-bold mb-2 ${
                        isExcellent ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400' : 'text-white'
                    }`}>{sessionData.score}</h2>
                    <p className={`text-xl ${isExcellent ? 'text-teal-400' : 'text-purple-400'}`}>
                        Puntuación Global
                    </p>
                    
                    {/* Excellence Message */}
                    {isExcellent && (
                        <p className="mt-3 text-gray-300 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-teal-400" />
                            No se detectaron anomalías técnicas
                        </p>
                    )}
                    
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

                {/* All Diagnoses Detected - New Section */}
                {sessionData.diagnosis.allDiagnoses && sessionData.diagnosis.allDiagnoses.length > 0 && (
                    <div className="glass-panel p-8 rounded-xl mb-8 border border-orange-500/30">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-orange-400" />
                            Análisis Completo del Sistema Experto
                        </h2>
                        <p className="text-gray-400 mb-6 text-sm">
                            El motor Prolog detectó {sessionData.diagnosis.allDiagnoses.length} patrón(es) en tu interpretación:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sessionData.diagnosis.allDiagnoses.map((diag, index) => {
                                const diagLower = diag.toLowerCase();
                                const isSevere = diagLower.includes('severa') || diagLower.includes('severe');
                                const isModerate = diagLower.includes('moderada') || diagLower.includes('moderate');
                                const isPitch = diagLower.includes('afinacion') || diagLower.includes('pitch') || diagLower.includes('desafinacion');
                                const isStability = diagLower.includes('tremolo') || diagLower.includes('vibrato') || diagLower.includes('estabilidad');
                                const isRange = diagLower.includes('rango') || diagLower.includes('range') || diagLower.includes('registro');
                                const isTiming = diagLower.includes('timing') || diagLower.includes('anticipacion') || diagLower.includes('retras');
                                
                                let bgColor = 'bg-gray-500/20';
                                let borderColor = 'border-gray-500/30';
                                let textColor = 'text-gray-300';
                                let icon = '🔍';
                                
                                if (isSevere) {
                                    bgColor = 'bg-red-500/20';
                                    borderColor = 'border-red-500/30';
                                    textColor = 'text-red-300';
                                    icon = '🚨';
                                } else if (isModerate) {
                                    bgColor = 'bg-yellow-500/20';
                                    borderColor = 'border-yellow-500/30';
                                    textColor = 'text-yellow-300';
                                    icon = '⚠️';
                                } else if (isPitch) {
                                    bgColor = 'bg-purple-500/20';
                                    borderColor = 'border-purple-500/30';
                                    textColor = 'text-purple-300';
                                    icon = '🎵';
                                } else if (isStability) {
                                    bgColor = 'bg-blue-500/20';
                                    borderColor = 'border-blue-500/30';
                                    textColor = 'text-blue-300';
                                    icon = '📊';
                                } else if (isRange) {
                                    bgColor = 'bg-green-500/20';
                                    borderColor = 'border-green-500/30';
                                    textColor = 'text-green-300';
                                    icon = '🎼';
                                } else if (isTiming) {
                                    bgColor = 'bg-orange-500/20';
                                    borderColor = 'border-orange-500/30';
                                    textColor = 'text-orange-300';
                                    icon = '⏱️';
                                }
                                
                                return (
                                    <div 
                                        key={index}
                                        className={`p-3 rounded-lg border ${bgColor} ${borderColor} transition-all hover:scale-105`}
                                    >
                                        <span className="text-lg mr-2">{icon}</span>
                                        <span className={`text-sm font-medium ${textColor}`}>
                                            {diag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Prescription Card - Única sección de recomendaciones */}
                <div className="mb-8">
                    <PrescriptionCard prescription={sessionData.diagnosis.prescription} />
                </div>

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

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
