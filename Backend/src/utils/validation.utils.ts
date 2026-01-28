/**
 * ============================================
 * VALIDATION UTILITIES
 * ============================================
 * Funciones reutilizables para validación de datos
 */

// import { PerformanceDataPoint } from '../types'; // Eliminado por no uso

/**
 * Resultado de validación
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Valida la estructura de performanceData
 * @param data - Datos de performance a validar
 * @returns Resultado de validación
 */
export function validatePerformanceData(data: any): ValidationResult {
    const errors: string[] = [];

    // Verificar que sea un array
    if (!Array.isArray(data)) {
        errors.push('performanceData must be an array');
        return { isValid: false, errors };
    }

    // Verificar que no esté vacío
    if (data.length === 0) {
        errors.push('performanceData cannot be empty');
        return { isValid: false, errors };
    }

    // Validar cada elemento
    data.forEach((point, index) => {
        if (!point || typeof point !== 'object') {
            errors.push(`performanceData[${index}] must be an object`);
            return;
        }

        // Validar timestamp
        if (typeof point.timestamp !== 'number' || point.timestamp < 0) {
            errors.push(`performanceData[${index}].timestamp must be a non-negative number`);
        }

        // Validar targetFrequency
        if (typeof point.targetFrequency !== 'number' || point.targetFrequency <= 0) {
            errors.push(`performanceData[${index}].targetFrequency must be a positive number`);
        }

        // Validar targetNote
        if (typeof point.targetNote !== 'string' || point.targetNote.trim() === '') {
            errors.push(`performanceData[${index}].targetNote must be a non-empty string`);
        }

        // Validar detectedFrequency (puede ser null)
        if (
            point.detectedFrequency !== null &&
            (typeof point.detectedFrequency !== 'number' || point.detectedFrequency <= 0)
        ) {
            errors.push(`performanceData[${index}].detectedFrequency must be null or a positive number`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Valida la estructura de melodyData
 * @param data - Datos de melodía a validar
 * @returns Resultado de validación
 */
export function validateMelodyData(data: any): ValidationResult {
    const errors: string[] = [];

    // Verificar que sea un objeto
    if (!data || typeof data !== 'object') {
        errors.push('melodyData must be an object');
        return { isValid: false, errors };
    }

    // Verificar que tenga el array de notas
    if (!Array.isArray(data.notes)) {
        errors.push('melodyData.notes must be an array');
        return { isValid: false, errors };
    }

    // Verificar que no esté vacío
    if (data.notes.length === 0) {
        errors.push('melodyData.notes cannot be empty');
        return { isValid: false, errors };
    }

    // Validar cada nota
    data.notes.forEach((note: any, index: number) => {
        if (!note || typeof note !== 'object') {
            errors.push(`melodyData.notes[${index}] must be an object`);
            return;
        }

        // Validar start
        if (typeof note.start !== 'number' || note.start < 0) {
            errors.push(`melodyData.notes[${index}].start must be a non-negative number`);
        }

        // Validar end
        if (typeof note.end !== 'number' || note.end <= note.start) {
            errors.push(`melodyData.notes[${index}].end must be greater than start`);
        }

        // Validar note
        if (typeof note.note !== 'string' || note.note.trim() === '') {
            errors.push(`melodyData.notes[${index}].note must be a non-empty string`);
        }

        // Validar frequency
        if (typeof note.frequency !== 'number' || note.frequency <= 0) {
            errors.push(`melodyData.notes[${index}].frequency must be a positive number`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Valida los datos de entrada para crear una canción
 * @param input - Datos de entrada
 * @returns Resultado de validación
 */
export function validateSongInput(input: any): ValidationResult {
    const errors: string[] = [];

    // Validar title
    if (typeof input.title !== 'string') {
        errors.push('title must be a string');
    } else if (input.title.trim().length === 0) {
        errors.push('title cannot be empty');
    } else if (input.title.length > 200) {
        errors.push('title must be 200 characters or less');
    }

    // Validar artist
    if (typeof input.artist !== 'string') {
        errors.push('artist must be a string');
    } else if (input.artist.trim().length === 0) {
        errors.push('artist cannot be empty');
    } else if (input.artist.length > 200) {
        errors.push('artist must be 200 characters or less');
    }

    // Validar bpm
    if (typeof input.bpm !== 'number') {
        errors.push('bpm must be a number');
    } else if (input.bpm < 20 || input.bpm > 300) {
        errors.push('bpm must be between 20 and 300');
    }

    // Validar key
    if (typeof input.key !== 'string') {
        errors.push('key must be a string');
    } else if (input.key.trim().length === 0) {
        errors.push('key cannot be empty');
    } else if (input.key.length > 10) {
        errors.push('key must be 10 characters or less');
    }

    // Validar audioFilename
    if (typeof input.audioFilename !== 'string') {
        errors.push('audioFilename must be a string');
    } else if (!input.audioFilename.endsWith('.mp3')) {
        errors.push('audioFilename must end with .mp3');
    } else if (input.audioFilename.length > 255) {
        errors.push('audioFilename must be 255 characters or less');
    }

    // Validar melodyData
    const melodyValidation = validateMelodyData(input.melodyData);
    if (!melodyValidation.isValid) {
        errors.push(...melodyValidation.errors);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Sanitiza un string eliminando caracteres peligrosos
 * @param input - String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}
