import cors from 'cors';
import { config } from './env.config';

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
export const corsOptions: cors.CorsOptions = {
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
