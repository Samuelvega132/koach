import { Prisma } from '@prisma/client';

// ============================================
// USER DTO (Data Transfer Object)
// ============================================

/**
 * Interfaz del modelo User (espejo del modelo Prisma)
 * Usado para tipado sin depender directamente del cliente generado
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  // Perfil Vocal
  vocalRange?: string | null;
  voiceType?: string | null;
  lowestNote?: string | null;
  highestNote?: string | null;
  comfortableRange?: Prisma.JsonValue | null;
  vocalRangeSemitones?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaz para el usuario seguro (sin información sensible)
 * NUNCA incluir passwordHash en las respuestas al cliente
 */
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Perfil Vocal
  vocalRange?: string | null;
  voiceType?: string | null;
  lowestNote?: string | null;
  highestNote?: string | null;
  comfortableRange?: [string, string] | null;
  vocalRangeSemitones?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convierte un modelo User de Prisma a un UserDTO seguro
 * Excluye explícitamente el campo passwordHash
 * 
 * 🔒 REGLA DE ORO: Nunca devolver el objeto User completo al cliente
 * 
 * @param user - Usuario de la base de datos
 * @returns Usuario sin información sensible
 */
export function toUserDto(user: User): UserDTO {
  // Convertir comfortableRange de JsonValue a [string, string] si existe
  let comfortableRange: [string, string] | null | undefined = undefined;
  if (user.comfortableRange) {
    if (Array.isArray(user.comfortableRange) && user.comfortableRange.length === 2) {
      comfortableRange = user.comfortableRange as [string, string];
    }
  } else if (user.comfortableRange === null) {
    comfortableRange = null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    vocalRange: user.vocalRange,
    voiceType: user.voiceType,
    lowestNote: user.lowestNote,
    highestNote: user.highestNote,
    comfortableRange,
    vocalRangeSemitones: user.vocalRangeSemitones,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Convierte un array de usuarios a DTOs
 * @param users - Array de usuarios
 * @returns Array de usuarios sanitizados
 */
export function toUserDtoArray(users: User[]): UserDTO[] {
  return users.map(toUserDto);
}
