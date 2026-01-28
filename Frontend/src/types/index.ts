export interface MelodyNote {
    // Legacy support
    start?: number;
    end?: number;
    frequency?: number;

    // New format (Piano Roll/MIDI style)
    time?: number;
    duration?: number;
    midi?: number;
    lyric?: string;

    // Common
    note: string;
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
    updatedAt: string; // Opcional, dependiendo de Prisma
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
