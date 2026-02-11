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

  // CORS - Normalizar removiendo slash final
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),

  // JWT Secrets
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-CHANGE-IN-PRODUCTION',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-CHANGE-IN-PRODUCTION',

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

// Validar secretos JWT en producción
if (config.isProduction) {
  if (config.JWT_SECRET === 'dev-secret-key-CHANGE-IN-PRODUCTION') {
    throw new Error('❌ JWT_SECRET debe ser configurado en producción');
  }
  if (config.JWT_REFRESH_SECRET === 'dev-refresh-secret-key-CHANGE-IN-PRODUCTION') {
    throw new Error('❌ JWT_REFRESH_SECRET debe ser configurado en producción');
  }
  if (config.FRONTEND_URL === 'http://localhost:3000') {
    console.warn('⚠️  FRONTEND_URL no configurado en producción. CORS puede fallar.');
  }
}
