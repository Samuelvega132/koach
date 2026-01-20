import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.config';
import { corsOptions } from './config/cors.config';
import songRoutes from './routes/song.routes';
import performanceRoutes from './routes/performance.routes';

// ============================================
// INICIALIZAR APP
// ============================================
const app = express();

// ============================================
// SECURITY MIDDLEWARES
// ============================================
app.use(helmet()); // Headers de seguridad
app.use(cors(corsOptions)); // CORS configurado

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10mb' })); // JSON con límite de 10MB
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================
app.get('/api/health', (_, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.use('/api/songs', songRoutes);
app.use('/api/performances', performanceRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  
  if (config.isDevelopment) {
    console.error(err.stack);
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.isDevelopment ? err.message : 'An unexpected error occurred',
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(config.PORT, () => {
  console.log('');
  console.log('🎤 ==========================================');
  console.log('   KOACH BACKEND - API REST');
  console.log('   ==========================================');
  console.log(`   🚀 Server running on port ${config.PORT}`);
  console.log(`   🌐 Environment: ${config.NODE_ENV}`);
  console.log(`   🔒 CORS enabled for: ${config.FRONTEND_URL}`);
  console.log(`   📊 Health check: http://localhost:${config.PORT}/api/health`);
  console.log('   ==========================================');
  console.log('');
});

export default app;
