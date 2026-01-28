"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export const useMicrophone = () => {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number>();

    const animate = useCallback(() => {
        if (!analyzerRef.current) return;

        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);

        // Calcular volumen promedio
        const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        setVolume(avg);

        requestRef.current = requestAnimationFrame(animate);
    }, []);

    const start = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyzerRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

            sourceRef.current.connect(analyzerRef.current);
            analyzerRef.current.fftSize = 256;

            setIsListening(true);
            animate();
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    }, [animate]);

    const stop = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        cancelAnimationFrame(requestRef.current!);
        setIsListening(false);
        setVolume(0);
    }, []);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        isListening,
        volume,
        start,
        stop,
        audioContext: audioContextRef.current,
        source: sourceRef.current
    };
};
