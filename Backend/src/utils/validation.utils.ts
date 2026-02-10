/**
 * ============================================
 * VALIDATION UTILITIES
 * ============================================
 * Funciones reutilizables para validación de datos usando Zod
 * 
 * Este módulo NO es parte del Motor de Inferencia (Prolog),
 * sino que asegura la integridad de los datos ANTES de procesarlos.
 * 
 * Principios:
 * - Fail Fast: Validar temprano para evitar errores tardíos
 * - Type Safety: Usar Zod para inferencia de tipos automática
 * - Clear Errors: Mensajes descriptivos para debugging
 * 
 * @module validation.utils
 * @version 2.0.0
 */

import { z } from 'zod';

// ============================================
// ZOD SCHEMAS - DEFINICIONES DE VALIDACIÓN
// ============================================

/**
 * Schema para validar un punto de performance individual
 * 
 * Cada punto representa una muestra de audio procesada (~100ms)
 * Contiene frecuencia detectada vs frecuencia objetivo
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
 * 
 * Valida todos los campos requeridos para crear una canción en el sistema
 * Incluye validaciones estrictas de formato y rangos
 */
const SongInputSchema = z.object({
  title: z.string()
    .min(1, 'El título no puede estar vacío')
    .max(200, 'El título debe tener máximo 200 caracteres')
    .trim()
    .transform(str => str.replace(/\s+/g, ' ')), // Normalizar espacios
  
  artist: z.string()
    .min(1, 'El artista no puede estar vacío')
    .max(200, 'El artista debe tener máximo 200 caracteres')
    .trim()
    .transform(str => str.replace(/\s+/g, ' ')),
  
  bpm: z.number()
    .int('El BPM debe ser un número entero')
    .min(20, 'El BPM mínimo es 20 (muy lento)')
    .max(300, 'El BPM máximo es 300 (muy rápido)'),
  
  key: z.string()
    .min(1, 'La tonalidad no puede estar vacía')
    .max(10, 'La tonalidad debe tener máximo 10 caracteres')
    .regex(/^[A-G][#b]?\s+(Major|Minor|Maior|Menor)$/i, 'Formato de tonalidad inválido (ej: "C Major", "A Minor")')
    .trim(),
  
  audioFilename: z.string()
    .min(1, 'El nombre del archivo no puede estar vacío')
    .max(255, 'El nombre del archivo debe tener máximo 255 caracteres')
    .regex(/\.mp3$/i, 'El archivo debe tener extensión .mp3'),
  
  melodyData: MelodyDataSchema,
});

// ============================================
// VALIDATION RESULT INTERFACE
// ============================================

/**
 * Resultado de validación normalizado
 * 
 * Estructura consistente para todos los tipos de validación
 * Permite manejo unificado de errores en controllers
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];  // Array de mensajes de error legibles
}

// ============================================
// VALIDATION FUNCTIONS - ENTRADA DE DATOS
// ============================================

/**
 * Valida la estructura de performanceData
 * 
 * Verifica que cada punto tenga:
 * - timestamp válido (>= 0)
 * - detectedFrequency válida (puede ser null)
 * - targetFrequency válida (> 0)
 * - targetNote válida (string no vacío)
 * 
 * @param data - Datos de performance a validar
 * @returns Resultado de validación con errores descriptivos
 * 
 * @example
 * const result = validatePerformanceData(data);
 * if (!result.isValid) {
 *   return res.status(400).json({ errors: result.errors });
 * }
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
