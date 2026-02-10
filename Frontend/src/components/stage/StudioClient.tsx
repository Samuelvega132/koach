"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Song } from '@/types';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMicrophone } from '@/hooks/useMicrophone';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { PianoRollVisualizer } from './PianoRollVisualizer';
import { LiveTunerGauge } from './LiveTunerGauge';
import { getNoteCalculations, frequencyToNoteName } from '@/utils/noteUtils';
import { AUDIO_CONFIG } from '@/config/audio.config';
import { API_CONFIG } from '@/config/api.config';
import { useSessionTelemetry } from '@/hooks/useSessionTelemetry';
import { Play, Pause, Mic, LogOut, RotateCcw, MicOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { clsx } from "clsx";

interface StudioClientProps {
    song: Song;
}

export const StudioClient = ({ song }: StudioClientProps) => {
    // CRITICAL: Microphone latency compensation (from config)
    const MICROPHONE_LATENCY_MS = AUDIO_CONFIG.MICROPHONE_LATENCY_MS;

    // 1. Audio Player (Backing Track)
    const { isPlaying, currentTime, duration, stop, toggle, getCurrentTime } = useAudioPlayer(song.audioUrl);

    // 2. Microphone Input
    const { isListening, start: startMic, stop: stopMic, audioContext, source } = useMicrophone();

    // 3. Real-time Pitch Detection (now returns getters)
    const { getPitch, getRawPitch } = usePitchDetector(audioContext, source);

    // 4. Session Telemetry Collection
    const { startRecording, recordDataPoint, getPerformanceData, getSessionStats } = useSessionTelemetry();

    // PRE-CALCULAR todas las notas UNA SOLA VEZ (no en cada frame)
    const calculatedNotes = useMemo(() => {
        return song.melodyData.notes.map(note => getNoteCalculations(note));
    }, [song.melodyData.notes]);

    const [targetNote, setTargetNote] = useState<string>("-");
    const [detectedNote, setDetectedNote] = useState<string>("-");
    const [accuracy, setAccuracy] = useState<number>(0);
    const [rawPitchDisplay, setRawPitchDisplay] = useState<number | null>(null);
    const [userPitchDisplay, setUserPitchDisplay] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    // CRITICAL: RAF loop for UI updates (decoupled from audio processing)
    const rafRef = useRef<number>();

    const updateUI = useCallback(() => {
        const detectedFreq = getPitch();
        const rawFreq = getRawPitch();

        // Update display pitch for visualizer
        setUserPitchDisplay(detectedFreq);
        setRawPitchDisplay(rawFreq);

        // Calculate detected note from user's microphone
        if (detectedFreq && detectedFreq > 0) {
            const userNote = frequencyToNoteName(detectedFreq);
            setDetectedNote(userNote);
        } else {
            setDetectedNote("-");
        }

        // LATENCY COMPENSATION: Compare with note that was playing X ms ago
        const compensatedTime = getCurrentTime() - (MICROPHONE_LATENCY_MS / 1000);

        // Find active note at the compensated time (usando notas pre-calculadas)
        const activeNoteObj = calculatedNotes.find(note => {
            return note.start <= compensatedTime && note.end >= compensatedTime;
        });

        if (activeNoteObj) {
            const { frequency, noteName } = activeNoteObj;
            setTargetNote(noteName);

            if (detectedFreq && frequency > 0) {
                // Calculate cents deviation
                const cents = 1200 * Math.log2(detectedFreq / frequency);
                setAccuracy(cents);
            } else {
                setAccuracy(0);
            }

            // Record telemetry data point if recording (SIEMPRE registrar cuando hay nota objetivo)
            if (isRecording && isPlaying) {
                recordDataPoint(detectedFreq, frequency, noteName);
            }
        } else {
            setTargetNote("-");
            setAccuracy(0);
            
            // Registrar puntos sin nota objetivo (silencio/transiciones)
            // Esto es importante para calcular métricas de duración y estabilidad
            if (isRecording && isPlaying) {
                // Usar la última nota conocida o una nota de referencia
                const refNote = calculatedNotes[0] || { frequency: 0, noteName: 'N/A' };
                recordDataPoint(detectedFreq, refNote.frequency, refNote.noteName);
            }
        }

        rafRef.current = requestAnimationFrame(updateUI);
    }, [getPitch, getRawPitch, getCurrentTime, calculatedNotes, MICROPHONE_LATENCY_MS, isRecording, isPlaying, recordDataPoint]);

    // Start UI update loop
    useEffect(() => {
        rafRef.current = requestAnimationFrame(updateUI);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [updateUI]);

    // Auto-start recording when playback starts
    useEffect(() => {
        if (isPlaying && !isRecording) {
            startRecording();
            setIsRecording(true);
            
            // Auto-activate microphone if not active
            if (!isListening) {
                startMic();
            }
        }
    }, [isPlaying, isRecording, startRecording, isListening, startMic]);

    // Handler: Finalizar Sesión y Enviar Datos
    const handleFinishSession = async () => {
        const performanceData = getPerformanceData();
        const stats = getSessionStats();

        // Development-only audit logging
        if (process.env.NODE_ENV === 'development') {
            console.log('[Studio] Session Audit:', {
                totalPoints: performanceData.length,
                validPoints: performanceData.filter(p => p.detectedFrequency && p.detectedFrequency > 0).length,
                payloadSize: `${(JSON.stringify(performanceData).length / 1024).toFixed(2)} KB`,
                stats,
            });
        }

        // Data validation
        if (performanceData.length === 0) {
            alert('No hay datos suficientes para analizar. Intenta cantar durante la canción.');
            return;
        }

        // Validate minimum valid frequency points
        const validPoints = performanceData.filter(p => p.detectedFrequency && p.detectedFrequency > 0);
        if (validPoints.length < 10) {
            alert(`Solo se detectaron ${validPoints.length} puntos de audio válidos. Asegúrate de que tu micrófono esté funcionando y canta más fuerte.`);
            return;
        }

        try {
            const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.performances}`;
            
            const payload = {
                songId: song.id,
                userName: 'Usuario Demo',
                performanceData,
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al guardar sesión');
            }

            const data = await response.json();

            // Navigate to results page
            window.location.href = `/results/${data.sessionId}`;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[Studio] Session finish failed:', error);
            }
            alert(`Error: ${error instanceof Error ? error.message : 'No se pudo guardar la sesión'}`);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] relative">
            {/* Header Studio */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                        <LogOut className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">{song.title}</h1>
                        <p className="text-sm text-purple-400 font-medium">{song.artist} • {song.bpm} BPM</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mic Status Indicator */}
                    {isListening ? (
                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Input</span>
                        </div>
                    ) : (
                        <div className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/50 flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mic Off</span>
                        </div>
                    )}

                    {/* Finish Session Button */}
                    {isRecording && (
                        <button
                            onClick={handleFinishSession}
                            className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-green-500/20"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Finalizar Sesión
                        </button>
                    )}
                </div>
            </header>

            {/* Main Visualizer Area (Piano Roll) */}
            <div className="flex-1 relative bg-slate-950/50 overflow-hidden flex flex-col items-center justify-center">
                {/* Background Grid Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950 to-slate-950" />

                <div className="w-full max-w-5xl px-4 relative z-0">
                    <PianoRollVisualizer
                        notes={song.melodyData.notes}
                        currentTime={currentTime}
                        userPitch={userPitchDisplay}
                        height={400}
                    />
                </div>
            </div>

            {/* Control Deck (Bottom) */}
            <div className="h-64 border-t border-white/10 bg-black/80 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3">

                {/* Left: Target Note (Nota Objetivo de la Canción) */}
                <div className="hidden md:flex flex-col items-center justify-center p-6 border-r border-white/5">
                    <div className="text-center space-y-2">
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest">Target</h3>
                        <div className="text-5xl font-black text-white">{targetNote}</div>
                        <div className="text-sm text-gray-400 font-mono">
                            {targetNote !== "-" ? "Sing this note" : "No active note"}
                        </div>
                        {/* Calibration Debug Info */}
                        {process.env.NODE_ENV === 'development' && rawPitchDisplay && (
                            <div className="text-[10px] text-purple-400 font-mono space-y-1 mt-3 pt-3 border-t border-white/10">
                                <div>Raw: {Math.round(rawPitchDisplay)} Hz</div>
                                <div>Smooth: {userPitchDisplay ? Math.round(userPitchDisplay) : '-'} Hz</div>
                                <div className="text-gray-500">Δ: {userPitchDisplay && rawPitchDisplay ? Math.abs(Math.round(userPitchDisplay - rawPitchDisplay)) : 0} Hz</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Tuner Gauge (Nota Detectada del Micrófono) */}
                <div className="flex items-center justify-center p-6 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                    <LiveTunerGauge
                        cents={accuracy}
                        detectedNote={detectedNote}
                        targetNote={targetNote}
                        userFrequency={userPitchDisplay}
                        isSinging={!!userPitchDisplay}
                        isMatching={detectedNote !== "-" && targetNote !== "-" && detectedNote === targetNote && Math.abs(accuracy) < 25}
                    />
                </div>

                {/* Right: Media Controls */}
                <div className="flex flex-col items-center justify-center p-6 border-l border-white/5 gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={stop}
                            className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={toggle}
                            className={clsx(
                                "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95",
                                isPlaying
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white"
                                    : "bg-white hover:bg-gray-200 shadow-white/20 text-black"
                            )}
                        >
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>

                        <button
                            onClick={isListening ? stopMic : startMic}
                            className={clsx(
                                "p-3 rounded-full transition-all border",
                                isListening
                                    ? "text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                                    : "text-gray-400 bg-white/5 border-white/10 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-[200px] space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration || 0)}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-100 ease-linear"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper
const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
};
