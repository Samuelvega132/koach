import { PrismaClient } from '@prisma/client';

// ============================================
// SINGLETON PATTERN FOR PRISMA CLIENT
// ============================================
// Evita múltiples instancias en desarrollo (hot-reload)
// En producción, crea una sola instancia

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
