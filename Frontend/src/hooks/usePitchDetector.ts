"use client";

import { useEffect, useRef, useCallback } from "react";
import * as Pitchfinder from "pitchfinder";
import { AUDIO_CONFIG } from "@/config/audio.config";

// ============================================
// PITCH DETECTOR HOOK - Optimizado para graves
// ============================================
// Usa YIN algorithm optimizado para frecuencias bajas (< 100Hz)
// Mayor buffer size y threshold ajustado para bass/baritone
// ============================================

interface UsePitchDetectorOptions {
    /** Buffer size for FFT (higher = better low freq resolution) */
    fftSize?: number;
    /** YIN threshold (lower = more sensitive, higher = less false positives) */
    yinThreshold?: number;
    /** Smoothing factor (0 = no smoothing, 1 = max smoothing) */
    smoothingFactor?: number;
}

export const usePitchDetector = (
    audioContext: AudioContext | null, 
    source: MediaStreamAudioSourceNode | null,
    options: UsePitchDetectorOptions = {}
) => {
    const {
        fftSize = 8192,
        yinThreshold = 0.10, // Lowered from 0.15 for better bass detection
        smoothingFactor = 0.25, // Slightly lower for faster response
    } = options;
    
    // CRITICAL: Use refs for 60fps updates
    const pitchRef = useRef<number | null>(null);
    const rawPitchRef = useRef<number | null>(null);
    const clarityRef = useRef<number>(0);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const requestRef = useRef<number>();

    // Smoothing state
    const smoothedPitchRef = useRef<number | null>(null);

    // YIN Algorithm - Best for human voice including bass
    const detectPitch = useRef<ReturnType<typeof Pitchfinder.YIN> | null>(null);

    useEffect(() => {
        if (!detectPitch.current && audioContext) {
            const sampleRate = audioContext.sampleRate;
            
            if (process.env.NODE_ENV === 'development') {
                console.log('[PitchDetector] Initializing YIN:', {
                    sampleRate: `${sampleRate} Hz`,
                    threshold: yinThreshold,
                    fftSize,
                });
            }
            
            // OPTIMIZED YIN Configuration for bass/baritone voices
            detectPitch.current = Pitchfinder.YIN({ 
                sampleRate: sampleRate,
                threshold: yinThreshold, // Lower = better bass detection
                probabilityThreshold: 0.05, // Lower for detecting quiet bass notes
            });
        }
    }, [audioContext, yinThreshold, fftSize]);

    const analyze = useCallback(() => {
        if (!analyzerRef.current || !detectPitch.current) return;

        // Use full buffer size for maximum precision (especially for bass)
        const buffer = new Float32Array(analyzerRef.current.fftSize);
        analyzerRef.current.getFloatTimeDomainData(buffer);

        // Detect raw pitch
        const rawFrequency = detectPitch.current(buffer);

        // Extended range for bass detection (down to ~55Hz = A1)
        const MIN_FREQ = AUDIO_CONFIG.PITCH_RANGE?.MIN ?? 55; // A1
        const MAX_FREQ = AUDIO_CONFIG.PITCH_RANGE?.MAX ?? 2000;
        
        if (rawFrequency && rawFrequency > MIN_FREQ && rawFrequency < MAX_FREQ) { 
            rawPitchRef.current = rawFrequency;
            
            // Apply exponential smoothing
            if (smoothedPitchRef.current === null) {
                smoothedPitchRef.current = rawFrequency;
            } else {
                // Adaptive smoothing: less smoothing for large jumps (octave detection)
                const diff = Math.abs(rawFrequency - smoothedPitchRef.current);
                const adaptiveFactor = diff > 100 ? 0.1 : smoothingFactor;
                
                smoothedPitchRef.current = 
                    smoothedPitchRef.current * adaptiveFactor + 
                    rawFrequency * (1 - adaptiveFactor);
            }

            pitchRef.current = smoothedPitchRef.current;
            clarityRef.current = 1;
        } else {
            rawPitchRef.current = null;
            // Graceful fade out over 2-3 frames
            if (smoothedPitchRef.current !== null) {
                clarityRef.current = Math.max(0, clarityRef.current - 0.15);
                if (clarityRef.current <= 0.1) {
                    pitchRef.current = null;
                    smoothedPitchRef.current = null;
                    clarityRef.current = 0;
                }
            }
        }

        requestRef.current = requestAnimationFrame(analyze);
    }, [smoothingFactor]);

    useEffect(() => {
        if (audioContext && source) {
            analyzerRef.current = audioContext.createAnalyser();
            
            // CRITICAL: Higher fftSize = better frequency resolution for bass
            // fftSize 8192 @ 48kHz = ~5.9 Hz resolution
            // fftSize 16384 @ 48kHz = ~2.9 Hz resolution (best for bass)
            analyzerRef.current.fftSize = fftSize;
            
            // CRITICAL: Set to 0 for real-time, unsmoothed raw data
            analyzerRef.current.smoothingTimeConstant = 0;
            
            source.connect(analyzerRef.current);

            if (process.env.NODE_ENV === 'development') {
                console.log('[PitchDetector] Analyzer Config:', {
                    fftSize: analyzerRef.current.fftSize,
                    sampleRate: audioContext.sampleRate,
                    frequencyResolution: `${(audioContext.sampleRate / analyzerRef.current.fftSize).toFixed(2)} Hz`,
                    minDetectable: `~${(audioContext.sampleRate / analyzerRef.current.fftSize).toFixed(0)} Hz`,
                });
            }

            analyze();
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (analyzerRef.current) {
                analyzerRef.current.disconnect();
            }
        };
    }, [audioContext, source, analyze, fftSize]);

    return { 
        getPitch: () => pitchRef.current,
        getClarity: () => clarityRef.current,
        getRawPitch: () => rawPitchRef.current,
    };
};
