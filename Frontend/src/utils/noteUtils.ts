import { MelodyNote } from '../types';

/**
 * Normaliza una nota para obtener su tiempo de inicio, fin y frecuencia,
 * soportando tanto el formato antiguo como el nuevo (MIDI).
 */
export function getNoteCalculations(note: MelodyNote) {
    const start = note.time ?? note.start ?? 0;
    const duration = note.duration ?? (note.end !== undefined && note.start !== undefined ? note.end - note.start : 0.5);
    const end = start + duration;

    let frequency = note.frequency;
    if (frequency === undefined && note.midi !== undefined) {
        // Fórmula: f = 440 * 2^((midi - 69) / 12)
        frequency = 440 * Math.pow(2, (note.midi - 69) / 12);
    }

    return {
        start,
        end,
        duration,
        frequency: frequency ?? 0,
        noteName: note.note,
        lyric: note.lyric || ""
    };
}
