import cors from 'cors';
// import { config } from './env.config';

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
export const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
