"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
    Mic, 
    Play, 
    ArrowRight, 
    ArrowLeft, 
    Music, 
    CheckCircle, 
    XCircle,
    Volume2,
    Loader2,
    User,
    Hand
} from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface VocalRangeResult {
    lowestNote: string;
    highestNote: string;
    lowestMidi: number;
    highestMidi: number;
    range: number;
    voiceType: VoiceType;
    comfortableRange: [string, string];
}

export type VoiceType = 
    | 'bass' 
    | 'baritone' 
    | 'tenor' 
    | 'countertenor' 
    | 'contralto' 
    | 'mezzo-soprano' 
    | 'soprano';

export type BiologicalRegister = 'male' | 'female';

interface VoiceTypeConfig {
    name: string;
    range: string;
    color: string;
    bgColor: string;
}

// ============================================
// CONSTANTS
// ============================================

const VOICE_TYPES: Record<VoiceType, VoiceTypeConfig> = {
    bass:           { name: 'Bajo',           range: 'E2 - E4',   color: 'text-blue-400',   bgColor: 'bg-blue-500/20' },
    baritone:       { name: 'Barítono',       range: 'A2 - A4',   color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
    tenor:          { name: 'Tenor',          range: 'C3 - C5',   color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    countertenor:   { name: 'Contratenor',    range: 'E3 - E5',   color: 'text-pink-400',   bgColor: 'bg-pink-500/20' },
    contralto:      { name: 'Contralto',      range: 'F3 - F5',   color: 'text-rose-400',   bgColor: 'bg-rose-500/20' },
    'mezzo-soprano': { name: 'Mezzosoprano', range: 'A3 - A5',   color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    soprano:        { name: 'Soprano',        range: 'C4 - C6',   color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
};

// Starting notes based on biological register
const STARTING_NOTES: Record<BiologicalRegister, { midi: number; label: string }> = {
    male:   { midi: 48, label: 'C3' },  // Male starts at C3
    female: { midi: 60, label: 'C4' },  // Female starts at C4
};

// Note names for display
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function midiToNote(midi: number): string {
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return `${NOTES[noteIndex]}${octave}`;
}

function midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function frequencyToMidi(freq: number): number {
    return 12 * Math.log2(freq / 440) + 69;
}

function classifyVoiceType(lowestMidi: number, highestMidi: number): VoiceType {
    const midpoint = (lowestMidi + highestMidi) / 2;
    
    if (midpoint < 48) return 'bass';
    if (midpoint < 52) return 'baritone';
    if (midpoint < 57) return 'tenor';
    if (midpoint < 62) return 'countertenor';
    if (midpoint < 65) return 'contralto';
    if (midpoint < 70) return 'mezzo-soprano';
    return 'soprano';
}

// ============================================
// WIZARD TYPES
// ============================================

type WizardStep = 'gender' | 'intro' | 'descending' | 'ascending' | 'results';
type TestDirection = 'descending' | 'ascending';

interface VocalRangeWizardProps {
    onComplete?: (result: VocalRangeResult) => void;
    onClose?: () => void;
}

export function VocalRangeWizard({ onComplete, onClose }: VocalRangeWizardProps) {
    // ============================================
    // STATE
    // ============================================
    const [step, setStep] = useState<WizardStep>('gender');
    const [biologicalRegister, setBiologicalRegister] = useState<BiologicalRegister | null>(null);
    const [currentMidi, setCurrentMidi] = useState<number>(60);
    const [testDirection, setTestDirection] = useState<TestDirection>('descending');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [result, setResult] = useState<VocalRangeResult | null>(null);
    const [loadingTone, setLoadingTone] = useState(false);
    const [detectedPitch, setDetectedPitch] = useState<number | null>(null);
    const [consecutiveHits, setConsecutiveHits] = useState(0);
    const [consecutiveMisses, setConsecutiveMisses] = useState(0);
    
    // Dynamic range tracking
    const [lowestMidiReached, setLowestMidiReached] = useState<number | null>(null);
    const [highestMidiReached, setHighestMidiReached] = useState<number | null>(null);
    const [notesAttempted, setNotesAttempted] = useState<number>(0);

    // ============================================
    // REFS (Audio)
    // ============================================
    interface ToneSynth {
        triggerAttackRelease: (frequency: number, duration: string) => void;
        dispose: () => void;
    }
    
    const toneRef = useRef<{ start: () => Promise<void>; PolySynth: unknown; Synth: unknown } | null>(null);
    const synthRef = useRef<ToneSynth | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number>();
    const detectorRef = useRef<((data: Float32Array, sampleRate: number) => number | null) | null>(null);

    // Hit detection timing
    const hitTimeoutRef = useRef<NodeJS.Timeout>();
    const NOTE_HIT_DURATION = 800; // ms to hold note to count as hit
    const CONSECUTIVE_HITS_TO_ADVANCE = 1;
    const CONSECUTIVE_MISSES_TO_STOP = 2;

    // ============================================
    // LAZY LOAD AUDIO LIBRARIES
    // ============================================
    const loadTone = useCallback(async () => {
        if (toneRef.current) return;
        
        setLoadingTone(true);
        try {
            const Tone = await import('tone').catch(() => null);
            if (!Tone) {
                console.warn('[VocalRangeWizard] Tone.js not available.');
                setLoadingTone(false);
                return;
            }
            
            toneRef.current = Tone;
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.5 },
            }).toDestination();
            
            await Tone.start();
        } catch (err) {
            console.error('[VocalRangeWizard] Failed to load Tone.js:', err);
        } finally {
            setLoadingTone(false);
        }
    }, []);

    const loadPitchDetector = useCallback(async () => {
        const pitchfinder = await import('pitchfinder');
        // Lower threshold for better bass detection
        detectorRef.current = pitchfinder.YIN({ 
            sampleRate: 48000,
            threshold: 0.10, // Better for low frequencies
        });
    }, []);

    // ============================================
    // AUDIO CONTROL
    // ============================================
    const playNote = useCallback((midi: number) => {
        if (!synthRef.current || !toneRef.current) return;
        const freq = midiToFrequency(midi);
        synthRef.current.triggerAttackRelease(freq, '1n');
    }, []);

    const startMicrophone = useCallback(async () => {
        if (!detectorRef.current) await loadPitchDetector();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: { ideal: 48000 },
                }
            });
            
            streamRef.current = stream;
            audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 48000 });
            
            analyzerRef.current = audioContextRef.current.createAnalyser();
            analyzerRef.current.fftSize = 8192; // Higher for bass detection
            
            // Add gain node for signal boost (Focusrite fix)
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.gain.value = 2.0; // 2x digital boost
            
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(gainNodeRef.current);
            gainNodeRef.current.connect(analyzerRef.current);
            
            setIsListening(true);
            
            // Start pitch detection loop
            const buffer = new Float32Array(analyzerRef.current.fftSize);
            
            const detect = () => {
                if (!analyzerRef.current || !detectorRef.current) return;
                
                analyzerRef.current.getFloatTimeDomainData(buffer);
                const pitch = detectorRef.current(buffer, audioContextRef.current!.sampleRate);
                
                // Extended range for bass (down to ~55Hz = A1)
                if (pitch && pitch > 55 && pitch < 2000) {
                    setDetectedPitch(pitch);
                } else {
                    setDetectedPitch(null);
                }
                
                rafRef.current = requestAnimationFrame(detect);
            };
            
            detect();
        } catch (err) {
            console.error('Microphone error:', err);
        }
    }, [loadPitchDetector]);

    const stopMicrophone = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (hitTimeoutRef.current) clearTimeout(hitTimeoutRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (gainNodeRef.current) gainNodeRef.current.disconnect();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setIsListening(false);
        setDetectedPitch(null);
    }, []);

    // ============================================
    // PITCH MATCHING LOGIC
    // ============================================
    const isNoteMatched = useCallback((detectedFreq: number, targetMidi: number): boolean => {
        const detectedMidi = frequencyToMidi(detectedFreq);
        const tolerance = 1.5; // ±1.5 semitones
        return Math.abs(detectedMidi - targetMidi) <= tolerance;
    }, []);

    // Check for note hit
    useEffect(() => {
        if (!isListening || detectedPitch === null || step === 'results' || step === 'gender' || step === 'intro') return;
        
        if (isNoteMatched(detectedPitch, currentMidi)) {
            setConsecutiveMisses(0);
            
            // Start hit timer if not already running
            if (!hitTimeoutRef.current) {
                hitTimeoutRef.current = setTimeout(() => {
                    setConsecutiveHits(prev => prev + 1);
                    hitTimeoutRef.current = undefined;
                }, NOTE_HIT_DURATION);
            }
        } else {
            // Clear hit timer if pitch doesn't match
            if (hitTimeoutRef.current) {
                clearTimeout(hitTimeoutRef.current);
                hitTimeoutRef.current = undefined;
            }
        }
    }, [detectedPitch, currentMidi, isListening, isNoteMatched, step]);

    // ============================================
    // CALCULATE RESULTS
    // ============================================
    const calculateResults = useCallback(() => {
        stopMicrophone();
        
        const startMidi = biologicalRegister === 'male' ? 48 : 60;
        const lowest = lowestMidiReached ?? startMidi;
        const highest = highestMidiReached ?? startMidi;
        const range = highest - lowest;
        const voiceType = classifyVoiceType(lowest, highest);
        
        // Comfortable range is inner 80%
        const comfortLow = lowest + Math.floor(range * 0.1);
        const comfortHigh = highest - Math.floor(range * 0.1);
        
        setResult({
            lowestNote: midiToNote(lowest),
            highestNote: midiToNote(highest),
            lowestMidi: lowest,
            highestMidi: highest,
            range,
            voiceType,
            comfortableRange: [midiToNote(comfortLow), midiToNote(comfortHigh)],
        });
        
        setStep('results');
    }, [stopMicrophone, biologicalRegister, lowestMidiReached, highestMidiReached]);

    // Handle consecutive hits - advance to next note
    useEffect(() => {
        if (consecutiveHits >= CONSECUTIVE_HITS_TO_ADVANCE) {
            // Record this note as reached
            if (testDirection === 'descending') {
                setLowestMidiReached(prev => prev === null ? currentMidi : Math.min(prev, currentMidi));
            } else {
                setHighestMidiReached(prev => prev === null ? currentMidi : Math.max(prev, currentMidi));
            }
            
            // Generate next note dynamically
            const nextMidi = testDirection === 'descending' ? currentMidi - 2 : currentMidi + 2;
            
            // Check boundaries (don't go below A1 or above C7)
            if (testDirection === 'descending' && nextMidi < 33) {
                // Switch to ascending
                setTestDirection('ascending');
                setCurrentMidi(biologicalRegister === 'male' ? 48 : 60);
            } else if (testDirection === 'ascending' && nextMidi > 96) {
                // Test complete
                calculateResults();
            } else {
                setCurrentMidi(nextMidi);
            }
            
            setConsecutiveHits(0);
            setNotesAttempted(prev => prev + 1);
        }
    }, [consecutiveHits, currentMidi, testDirection, biologicalRegister, calculateResults]);

    // ============================================
    // USER ACTIONS
    // ============================================
    const handleSelectGender = (gender: BiologicalRegister) => {
        setBiologicalRegister(gender);
        const startNote = STARTING_NOTES[gender];
        setCurrentMidi(startNote.midi);
        setStep('intro');
    };

    const handleStartTest = async () => {
        await loadTone();
        await startMicrophone();
        setTestDirection('descending');
        setStep('descending');
        setNotesAttempted(0);
        setLowestMidiReached(null);
        setHighestMidiReached(null);
    };

    const handlePlayNote = () => {
        playNote(currentMidi);
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 1500);
    };

    const handleCantReachNote = () => {
        setConsecutiveMisses(prev => prev + 1);
        
        if (consecutiveMisses + 1 >= CONSECUTIVE_MISSES_TO_STOP) {
            if (testDirection === 'descending') {
                // Switch to ascending
                setTestDirection('ascending');
                setCurrentMidi(biologicalRegister === 'male' ? 48 : 60);
                setStep('ascending');
                setConsecutiveMisses(0);
            } else {
                // Test complete
                calculateResults();
            }
        } else {
            // Skip this note and try next
            const nextMidi = testDirection === 'descending' ? currentMidi - 2 : currentMidi + 2;
            setCurrentMidi(nextMidi);
        }
        
        setNotesAttempted(prev => prev + 1);
    };

    const handleStopHere = () => {
        if (testDirection === 'descending') {
            setTestDirection('ascending');
            setCurrentMidi(biologicalRegister === 'male' ? 48 : 60);
            setStep('ascending');
            setConsecutiveMisses(0);
        } else {
            calculateResults();
        }
    };

    // ============================================
    // CLEANUP
    // ============================================
    useEffect(() => {
        return () => {
            stopMicrophone();
            if (synthRef.current) {
                synthRef.current.dispose();
            }
        };
    }, [stopMicrophone]);

    const handleComplete = () => {
        if (result && onComplete) {
            onComplete(result);
        }
        onClose?.();
    };

    // Current note info
    const currentNoteLabel = midiToNote(currentMidi);
    const isNoteHit = detectedPitch ? isNoteMatched(detectedPitch, currentMidi) : false;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl border border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Music className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Test de Rango Vocal</h2>
                                <p className="text-sm text-gray-400">Descubre tu tipo de voz</p>
                            </div>
                        </div>
                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* GENDER SELECTION STEP */}
                    {step === 'gender' && (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4">
                                ¿Cuál es tu registro biológico?
                            </h3>
                            
                            <p className="text-gray-300 mb-8 max-w-md mx-auto">
                                Esto nos ayuda a determinar el punto de inicio óptimo para tu test de rango vocal.
                            </p>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <button
                                    onClick={() => handleSelectGender('male')}
                                    className="p-6 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/30 transition-all group"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className="text-white font-semibold">Masculino</span>
                                    <p className="text-xs text-gray-400 mt-1">Inicia en C3</p>
                                </button>
                                
                                <button
                                    onClick={() => handleSelectGender('female')}
                                    className="p-6 rounded-xl bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/60 hover:bg-pink-500/30 transition-all group"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="w-6 h-6 text-pink-400" />
                                    </div>
                                    <span className="text-white font-semibold">Femenino</span>
                                    <p className="text-xs text-gray-400 mt-1">Inicia en C4</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* INTRO STEP */}
                    {step === 'intro' && (
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <Mic className="w-12 h-12 text-white" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4">
                                ¡Listo para descubrir tu rango!
                            </h3>
                            
                            <p className="text-gray-300 mb-6 max-w-md mx-auto">
                                El test se adapta dinámicamente a tu voz. Seguiremos bajando o subiendo notas hasta que no puedas alcanzarlas.
                            </p>

                            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-purple-400" />
                                    Instrucciones
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">1.</span>
                                        Escucha la nota de referencia
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">2.</span>
                                        Mantén la nota por ~1 segundo
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">3.</span>
                                        Si no puedes, presiona &quot;Hasta aquí llego&quot;
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={handleStartTest}
                                disabled={loadingTone}
                                className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {loadingTone ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-5 h-5" />
                                        Comenzar Test
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* TESTING STEPS (Descending & Ascending) */}
                    {(step === 'descending' || step === 'ascending') && (
                        <div>
                            {/* Direction indicator */}
                            <div className="mb-6 text-center">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                    testDirection === 'descending' 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-pink-500/20 text-pink-400'
                                }`}>
                                    {testDirection === 'descending' ? (
                                        <>
                                            <ArrowLeft className="w-4 h-4 rotate-[-90deg]" />
                                            Buscando nota más grave
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="w-4 h-4 rotate-[-90deg]" />
                                            Buscando nota más aguda
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* Current note display */}
                            <div className="text-center mb-8">
                                <div className="text-sm text-gray-400 mb-2">
                                    Notas probadas: {notesAttempted}
                                </div>
                                
                                <div className={`text-8xl font-bold mb-4 transition-all duration-300 ${
                                    isNoteHit ? 'text-green-400 scale-110' : 'text-white'
                                }`}>
                                    {currentNoteLabel}
                                </div>

                                {/* Pitch indicator */}
                                {isListening && (
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <div className={`w-3 h-3 rounded-full transition-all ${
                                            isNoteHit ? 'bg-green-500 scale-125' : 
                                            detectedPitch ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
                                        }`} />
                                        <span className="text-sm text-gray-400 font-mono">
                                            {detectedPitch ? `${Math.round(detectedPitch)} Hz` : 'Escuchando...'}
                                        </span>
                                    </div>
                                )}

                                {/* Match indicator */}
                                {isNoteHit && (
                                    <div className="flex items-center justify-center gap-2 text-green-400 animate-pulse">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>¡Mantén la nota!</span>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <button
                                    onClick={handlePlayNote}
                                    disabled={isPlaying}
                                    className="p-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                                >
                                    {isPlaying ? (
                                        <Volume2 className="w-8 h-8 animate-pulse" />
                                    ) : (
                                        <Play className="w-8 h-8 ml-1" />
                                    )}
                                </button>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    onClick={handleCantReachNote}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    No puedo alcanzar esta nota
                                </button>
                                
                                <button
                                    onClick={handleStopHere}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                                >
                                    <Hand className="w-4 h-4" />
                                    Hasta aquí llego
                                </button>
                            </div>
                        </div>
                    )}

                    {/* RESULTS STEP */}
                    {step === 'results' && result && (
                        <div className="text-center">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${VOICE_TYPES[result.voiceType].bgColor}`}>
                                <Music className={`w-10 h-10 ${VOICE_TYPES[result.voiceType].color}`} />
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-2">
                                ¡Eres {VOICE_TYPES[result.voiceType].name}!
                            </h3>
                            
                            <p className="text-gray-400 mb-6">
                                Rango típico: {VOICE_TYPES[result.voiceType].range}
                            </p>

                            {/* Range display */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-sm text-gray-400 mb-1">Nota más grave</p>
                                    <p className="text-2xl font-bold text-blue-400">{result.lowestNote}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-sm text-gray-400 mb-1">Nota más aguda</p>
                                    <p className="text-2xl font-bold text-pink-400">{result.highestNote}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-400 mb-1">Rango cómodo</p>
                                <p className="text-xl font-semibold text-white">
                                    {result.comfortableRange[0]} - {result.comfortableRange[1]}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    ({result.range} semitonos de rango total)
                                </p>
                            </div>

                            <button
                                onClick={handleComplete}
                                className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                            >
                                Guardar Resultados
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
