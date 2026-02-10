"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// AUDIO MICROPHONE HOOK WITH GAIN CONTROL
// ============================================
// Optimizado para interfaces de audio profesionales (Focusrite, etc)
// Incluye GainNode configurable para boost digital
// ============================================

interface UseMicrophoneOptions {
    /** Ganancia digital inicial (1.0 = sin boost, 2.0 = doble) */
    initialGain?: number;
    /** Sample rate preferido (48000 para mejor resolución) */
    sampleRate?: number;
}

interface UseMicrophoneReturn {
    isListening: boolean;
    getVolume: () => number;
    start: () => Promise<void>;
    stop: () => void;
    audioContext: AudioContext | null;
    source: MediaStreamAudioSourceNode | null;
    /** Ajustar ganancia digital (útil para interfaces con señal baja) */
    setGain: (value: number) => void;
    /** Obtener ganancia actual */
    getGain: () => number;
    /** Nodo de ganancia para encadenamiento de audio */
    gainNode: GainNode | null;
}

export const useMicrophone = (options: UseMicrophoneOptions = {}): UseMicrophoneReturn => {
    const { initialGain = 1.0, sampleRate = 48000 } = options;
    
    const [isListening, setIsListening] = useState(false);
    
    // CRITICAL: Use ref for high-frequency updates (60fps)
    const volumeRef = useRef<number>(0);
    const gainValueRef = useRef<number>(initialGain);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number>();

    const animate = useCallback(() => {
        if (!analyzerRef.current) return;

        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);

        // Store in ref instead of state to avoid re-renders
        const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        volumeRef.current = avg;

        requestRef.current = requestAnimationFrame(animate);
    }, []);

    // ============================================
    // GAIN CONTROL (Digital Boost for low-signal interfaces)
    // ============================================
    const setGain = useCallback((value: number) => {
        // Clamp between 0.1 and 10.0 (prevent clipping)
        const clampedValue = Math.max(0.1, Math.min(10.0, value));
        gainValueRef.current = clampedValue;
        
        if (gainNodeRef.current) {
            // Smooth transition to avoid clicks
            gainNodeRef.current.gain.setTargetAtTime(
                clampedValue,
                audioContextRef.current?.currentTime || 0,
                0.01 // 10ms transition
            );
        }
    }, []);

    const getGain = useCallback(() => gainValueRef.current, []);

    const start = useCallback(async () => {
        try {
            // CRITICAL: Disable ALL audio processing for accurate pitch detection
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,  // No echo cancellation
                    noiseSuppression: false,  // No noise reduction
                    autoGainControl: false,   // No AGC (prevents freq distortion)
                    // Request specific sample rate if supported
                    sampleRate: { ideal: sampleRate },
                }
            });
            
            streamRef.current = stream;
            
            // Create AudioContext with preferred sample rate
            audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
                sampleRate: sampleRate,
            });
            
            // Log sample rate for debugging
            if (process.env.NODE_ENV === 'development') {
                console.log('[Microphone] AudioContext Sample Rate:', audioContextRef.current.sampleRate, 'Hz');
                console.log('[Microphone] Initial Gain:', gainValueRef.current);
            }
            
            // Create audio nodes
            analyzerRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            
            // ============================================
            // GAIN NODE - Digital Boost for Focusrite/etc
            // ============================================
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.gain.value = gainValueRef.current;

            // Chain: Source -> GainNode -> Analyzer
            sourceRef.current.connect(gainNodeRef.current);
            gainNodeRef.current.connect(analyzerRef.current);
            
            // Configure analyzer for volume metering
            analyzerRef.current.fftSize = 256;
            analyzerRef.current.smoothingTimeConstant = 0.8;

            setIsListening(true);
            animate();
        } catch (err) {
            console.error("[Microphone] Error accessing microphone:", err);
        }
    }, [animate, sampleRate]);

    const stop = useCallback(() => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        
        // Reset refs
        sourceRef.current = null;
        gainNodeRef.current = null;
        audioContextRef.current = null;
        analyzerRef.current = null;
        
        setIsListening(false);
        volumeRef.current = 0;
    }, []);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        isListening,
        getVolume: () => volumeRef.current,
        start,
        stop,
        audioContext: audioContextRef.current,
        source: sourceRef.current,
        setGain,
        getGain,
        gainNode: gainNodeRef.current,
    };
};
