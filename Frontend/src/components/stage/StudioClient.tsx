"use client";

import { useState, useEffect } from 'react';
import { Song } from '@/types';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMicrophone } from '@/hooks/useMicrophone';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { PianoRollVisualizer } from './PianoRollVisualizer';
import { LiveTunerGauge } from './LiveTunerGauge';
import { getNoteCalculations } from '@/utils/noteUtils';
import { Play, Pause, Mic, LogOut, RotateCcw, MicOff } from 'lucide-react';
import Link from 'next/link';
import { clsx } from "clsx";

interface StudioClientProps {
    song: Song;
}

export const StudioClient = ({ song }: StudioClientProps) => {
    // 1. Audio Player (Backing Track)
    const { isPlaying, currentTime, duration, stop, toggle } = useAudioPlayer(song.audioUrl);

    // 2. Microphone Input
    const { isListening, start: startMic, stop: stopMic, audioContext, source } = useMicrophone();

    // 3. Real-time Pitch Detection
    const { pitch: detectedFreq } = usePitchDetector(audioContext, source);

    const [targetNote, setTargetNote] = useState<string>("-");
    const [accuracy, setAccuracy] = useState<number>(0);

    // Lógica de Feedback: Comparar Voz vs Canción
    useEffect(() => {
        // Encontrar nota actual en la canción
        const activeNoteObj = song.melodyData.notes.find(n => {
            const { start, end } = getNoteCalculations(n);
            return start <= currentTime && end >= currentTime;
        });

        if (activeNoteObj) {
            const { frequency, noteName } = getNoteCalculations(activeNoteObj);
            setTargetNote(noteName);

            if (detectedFreq && frequency > 0) {
                // Calcular Desviación (Cents)
                // Fórmula: 1200 * log2(f_cantada / f_objetivo)
                const cents = 1200 * Math.log2(detectedFreq / frequency);
                setAccuracy(cents);
            } else {
                setAccuracy(0); // Sin voz detectada
            }
        } else {
            setTargetNote("-");
            setAccuracy(0);
        }
    }, [currentTime, song.melodyData.notes, detectedFreq]);

    // Auto-start Mic on mount (Optional, better on user interaction)
    // useEffect(() => { startMic(); return () => stopMic(); }, []);

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

                <div className="flex items-center gap-2">
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
                        userPitch={detectedFreq}
                        height={400}
                    />
                </div>
            </div>

            {/* Control Deck (Bottom) */}
            <div className="h-64 border-t border-white/10 bg-black/80 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3">

                {/* Left: Target Note */}
                <div className="hidden md:flex flex-col items-center justify-center p-6 border-r border-white/5">
                    <div className="text-center space-y-2">
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest">Target</h3>
                        <div className="text-5xl font-black text-white">{targetNote}</div>
                        <div className="text-sm text-purple-400 font-mono">
                            {detectedFreq ? `${Math.round(detectedFreq)} Hz` : '---'}
                        </div>
                    </div>
                </div>

                {/* Center: Tuner Gauge */}
                <div className="flex items-center justify-center p-6 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                    {/* Pasamos accuracy real, el componente se encarga de la rotación */}
                    <LiveTunerGauge cents={accuracy} targetNote={targetNote} isSinging={!!detectedFreq} />
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
