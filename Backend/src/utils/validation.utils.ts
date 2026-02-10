/**
 * ============================================
 * VALIDATION UTILITIES
 * ============================================
 * Funciones reutilizables para validación de datos
 * Refactorizado para seguir principios de Clean Code
 */

import { z } from 'zod';

// ============================================
// ZOD SCHEMAS
// ============================================

/**
 * Schema para validar un punto de performance
 */
const PerformanceDataPointSchema = z.object({
  timestamp: z.number().nonnegative('Timestamp must be non-negative'),
  detectedFrequency: z.number().positive('Detected frequency must be positive').nullable(),
  targetFrequency: z.number().positive('Target frequency must be positive'),
  targetNote: z.string().min(1, 'Target note cannot be empty'),
});

/**
 * Schema para validar datos de performance
 */
const PerformanceDataSchema = z
  .array(PerformanceDataPointSchema)
  .min(1, 'Performance data cannot be empty');

/**
 * Schema para validar una nota de melodía
 */
const MelodyNoteSchema = z.object({
  start: z.number().nonnegative('Start time must be non-negative'),
  end: z.number().positive('End time must be positive'),
  note: z.string().min(1, 'Note name cannot be empty'),
  frequency: z.number().positive('Frequency must be positive'),
}).refine((data) => data.end > data.start, {
  message: 'End time must be greater than start time',
  path: ['end'],
});

/**
 * Schema para validar datos de melodía
 */
const MelodyDataSchema = z.object({
  notes: z.array(MelodyNoteSchema).min(1, 'Melody must have at least one note'),
});

/**
 * Schema para validar entrada de canción
 */
const SongInputSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  artist: z.string()
    .min(1, 'Artist cannot be empty')
    .max(200, 'Artist must be 200 characters or less')
    .trim(),
  bpm: z.number()
    .int('BPM must be an integer')
    .min(20, 'BPM must be at least 20')
    .max(300, 'BPM must be at most 300'),
  key: z.string()
    .min(1, 'Key cannot be empty')
    .max(10, 'Key must be 10 characters or less')
    .trim(),
  audioFilename: z.string()
    .min(1, 'Audio filename cannot be empty')
    .max(255, 'Audio filename must be 255 characters or less')
    .endsWith('.mp3', 'Audio filename must end with .mp3'),
  melodyData: MelodyDataSchema,
});

// ============================================
// VALIDATION RESULT INTERFACE
// ============================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Valida la estructura de performanceData
 * @param data - Datos de performance a validar
 * @returns Resultado de validación
 */
export function validatePerformanceData(data: unknown): ValidationResult {
  try {
    PerformanceDataSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((issue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ),
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Valida la estructura de melodyData
 * @param data - Datos de melodía a validar
 * @returns Resultado de validación
 */
export function validateMelodyData(data: unknown): ValidationResult {
  try {
    MelodyDataSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((issue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ),
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Valida los datos de entrada para crear una canción
 * @param input - Datos de entrada
 * @returns Resultado de validación
 */
export function validateSongInput(input: unknown): ValidationResult {
  try {
    SongInputSchema.parse(input);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((issue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ),
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Sanitiza un string eliminando caracteres peligrosos
 * @param input - String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
