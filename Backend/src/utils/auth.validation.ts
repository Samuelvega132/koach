import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS CON ZOD
// ============================================

/**
 * Schema de validación para el registro de usuarios
 * Valida email, contraseña fuerte, nombre y apellido
 */
export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)'
    ),
  
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .trim(),
});

/**
 * Schema de validación para el login
 * Valida email y contraseña básica (sin restricciones de fuerza)
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

// ============================================
// TYPES INFERIDOS DE LOS SCHEMAS
// ============================================
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
