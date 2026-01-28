"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Pitchfinder from "pitchfinder";

export const usePitchDetector = (audioContext: AudioContext | null, source: MediaStreamAudioSourceNode | null) => {
    const [pitch, setPitch] = useState<number | null>(null);
    const [clarity, setClarity] = useState<number>(0);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const requestRef = useRef<number>();

    // Algoritmo YIN: Buena tolerancia al ruido, usado en afinadores
    const detectPitch = useRef<any>(null);

    useEffect(() => {
        if (!detectPitch.current) {
            detectPitch.current = Pitchfinder.YIN({ sampleRate: 44100 });
        }
    }, []);

    const analyze = useCallback(() => {
        if (!analyzerRef.current) return;

        const buffer = new Float32Array(analyzerRef.current.fftSize);
        analyzerRef.current.getFloatTimeDomainData(buffer);

        // Detectar pitch
        const frequency = detectPitch.current(buffer);

        if (frequency && frequency > 50 && frequency < 1500) { // Filtro vocal rango humano
            setPitch(frequency);
            setClarity(1); // Pitchfinder no nos da clarity directo fácil, asumimos 1 si detectamos
        } else {
            setPitch(null);
            setClarity(0);
        }

        requestRef.current = requestAnimationFrame(analyze);
    }, []);

    useEffect(() => {
        if (audioContext && source) {
            analyzerRef.current = audioContext.createAnalyser();
            analyzerRef.current.fftSize = 2048; // Mayor resolución para graves
            source.connect(analyzerRef.current);

            analyze();
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [audioContext, source, analyze]);

    return { pitch, clarity };
};
