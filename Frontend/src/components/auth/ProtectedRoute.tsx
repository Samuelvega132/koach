"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirigir al home si no está autenticado
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Usuario autenticado, renderizar contenido
  return <>{children}</>;
}
