"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioPlayerState {
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    volume: number;
    error: string | null;
}

export const useAudioPlayer = (src: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [state, setState] = useState<AudioPlayerState>({
        isPlaying: false,
        duration: 0,
        currentTime: 0,
        volume: 1,
        error: null,
    });

    // Inicializar audio
    useEffect(() => {
        if (!src) return;

        const audio = new Audio(src);
        audioRef.current = audio;

        const setAudioData = () => {
            setState((prev) => ({ ...prev, duration: audio.duration }));
        };

        const setAudioTime = () => {
            setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
        };

        const handleEnded = () => {
            setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
        };

        const handleError = (e: Event | string) => {
            console.error("Audio error:", e);
            setState((prev) => ({ ...prev, error: "Error loading audio file", isPlaying: false }));
        };

        // Event Listeners
        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audioRef.current = null;
        };
    }, [src]);

    // Controles
    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setState(prev => ({ ...prev, isPlaying: true, error: null })))
                .catch(err => {
                    console.error("Play error:", err);
                    setState(prev => ({ ...prev, error: "Playback failed" }));
                });
        }
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setState(prev => ({ ...prev, isPlaying: false }));
        }
    }, []);

    const toggle = useCallback(() => {
        if (state.isPlaying) pause();
        else play();
    }, [state.isPlaying, pause, play]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setState(prev => ({ ...prev, currentTime: time }));
        }
    }, []);

    return {
        ...state,
        play,
        pause,
        toggle,
        stop,
        seek
    };
};
