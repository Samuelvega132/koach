/**
 * Formato ÚNICO de Nota (Avanzado)
 * Solo se usa time/duration/midi/frequency/lyric
 */
export interface MelodyNote {
    time: number;           // Tiempo de inicio en segundos
    duration: number;       // Duración en segundos
    midi: number;           // Valor MIDI (60-81)
    note: string;           // Nombre de la nota (ej: "A4", "C5")
    frequency: number;      // Frecuencia en Hz
    lyric?: string;         // Letra/sílaba (opcional)
}

export interface MelodyData {
    bpm: number;
    key: string;
    notes: MelodyNote[];
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    key: string;
    audioUrl: string;
    melodyData: MelodyData;
    createdAt: string;
    updatedAt: string;
    // Optional UI properties
    duration?: number;       // Duration in seconds (calculated from audio/melody)
    difficulty?: 'Fácil' | 'Media' | 'Difícil' | 'Experto';
    coverUrl?: string;       // Optional cover image URL
}

export interface PerformanceDataPoint {
    timestamp: number;
    detectedFrequency: number | null;
    targetFrequency: number;
    targetNote: string;
}

export interface PerformanceFeedback {
    pitchAccuracy: {
        score: number;
        avgDeviationCents: number;
        inTunePercentage: number;
    };
    stability: {
        score: number;
        avgJitter: number;
        stableNotesPercentage: number;
    };
    timing: {
        score: number;
        avgLatency: number;
        onTimePercentage: number;
    };
    recommendations: string[];
}
