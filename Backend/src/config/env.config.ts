import dotenv from 'dotenv';

// Cargar variables de entorno ANTES de cualquier importación
dotenv.config();

// ============================================
// CONFIGURACIÓN DE ENTORNO
// ============================================
export const config = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Validaciones
  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  get isProduction() {
    return this.NODE_ENV === 'production';
  },
};

// Validar configuración crítica
if (!config.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no configurado. Verificar archivo .env');
}
