import { MelodyNote } from '../types';

/**
 * Calcular frecuencia desde MIDI usando fórmula estándar
 * Referencia: A4 (MIDI 69) = 440 Hz
 * OPTIMIZADO: Sin validaciones ni logs para máximo rendimiento a 60 FPS
 */
function calculateFrequencyFromMidi(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convertir frecuencia a nombre de nota más cercana
 * Inverso de calculateFrequencyFromMidi
 */
export function frequencyToNoteName(frequency: number): string {
    if (!frequency || frequency <= 0) return "-";
    
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor((midi - 12) / 12);
    const noteIndex = midi % 12;
    
    return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Obtener cálculos de una nota (formato optimizado para 60 FPS)
 * NO ejecuta validaciones ni logs - solo cálculos puros
 */
export function getNoteCalculations(note: MelodyNote) {
    return {
        start: note.time,
        end: note.time + note.duration,
        duration: note.duration,
        frequency: note.frequency ?? calculateFrequencyFromMidi(note.midi),
        noteName: note.note,
        lyric: note.lyric || ""
    };
}
