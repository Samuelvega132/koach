"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { User, TrendingUp, Award, Target, BarChart3 } from "lucide-react";
import { ProfileHeader, StatsCard, VocalCard } from "@/components/profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ProfileHeader user={user} />

      {/* Vocal Profile Card */}
      <VocalCard />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={TrendingUp}
          iconColor="text-purple-400"
          title="Sesiones Totales"
          value={0}
          subtitle="Próximamente disponible"
        />
        <StatsCard
          icon={Award}
          iconColor="text-yellow-400"
          title="Mejor Puntaje"
          value="-"
          subtitle="Aún no has cantado"
        />
        <StatsCard
          icon={Target}
          iconColor="text-green-400"
          title="Promedio"
          value="-"
          subtitle="Necesitas al menos 3 sesiones"
        />
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-8 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          Tu Historial
        </h2>
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            ¡Empieza tu viaje vocal!
          </h3>
          <p className="text-gray-400 mb-6">
            Tus sesiones guardadas aparecerán aquí. Ve al Studio y comienza a cantar.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Ir al Studio
          </a>
        </div>
      </div>
    </div>
  );
}
