"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { User, TrendingUp, Award, Target, BarChart3 } from "lucide-react";
import { ProfileHeader, StatsCard, VocalCard, SessionCard } from "@/components/profile";
import { VocalRangeResult, VoiceType } from "@/components/profile/VocalRangeWizard";
import { API_CONFIG } from "@/config/api.config";

interface UserStats {
  totalSessions: number;
  bestScore: number;
  averageScore: number;
  recentSessions: any[];
}

interface Session {
  id: string;
  score: number;
  createdAt: string;
  song: {
    title: string;
    artist: string;
  };
  diagnosis?: {
    primaryIssue?: string;
    diagnosis?: string;
    prescription?: string[];
    severity?: string;
  };
  telemetry?: {
    pitchDeviationAverage?: number;
    stabilityPercentage?: number;
    durationSeconds?: number;
  };
  analysis?: any;
  feedback?: string;
  performanceLog?: {
    rawData?: any[];
  };
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, refreshUser, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [savedVocalRange, setSavedVocalRange] = useState<VocalRangeResult | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Convertir el user de la DB al formato VocalRangeResult cuando cambie
  useEffect(() => {
    if (user?.vocalRange && user?.voiceType && user?.lowestNote && user?.highestNote) {
      // Calcular MIDI aproximado basado en las notas (esto es una aproximación)
      // En la realidad, el wizard ya calculó esto, pero aquí reconstruimos
      const noteToMidi = (note: string): number => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        const noteIndex = notes.indexOf(noteName);
        return 12 + (octave * 12) + noteIndex;
      };

      setSavedVocalRange({
        lowestNote: user.lowestNote,
        highestNote: user.highestNote,
        lowestMidi: noteToMidi(user.lowestNote),
        highestMidi: noteToMidi(user.highestNote),
        range: user.vocalRangeSemitones || 24,
        voiceType: user.voiceType as VoiceType,
        comfortableRange: user.comfortableRange || ["E3", "G4"],
      });
    } else {
      setSavedVocalRange(null);
    }
  }, [user]);

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('koach_access_token');
        if (!token) {
          console.warn('[Profile] No hay token disponible');
          setIsLoadingStats(false);
          return;
        }

        const response = await fetch(`${API_CONFIG.baseURL}/auth/me/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setSessions(data.recentSessions || []);
        } else if (response.status === 401 || response.status === 403) {
          console.error('[Profile] Token expirado o inválido');
          // Mostrar mensaje al usuario de que debe volver a iniciar sesión
          setTokenExpired(true);
          setStats(null);
          setSessions([]);
        } else {
          console.error('[Profile] Error al cargar estadísticas:', response.status);
        }
      } catch (error) {
        console.error('[Profile] Error al cargar estadísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [user]);

  // Handler para guardar el rango vocal en el backend
  const handleRangeUpdate = useCallback(async (result: VocalRangeResult) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('koach_access_token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_CONFIG.baseURL}/auth/me/vocal-range`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vocalRange: `${result.lowestNote} - ${result.highestNote}`,
          voiceType: result.voiceType,
          lowestNote: result.lowestNote,
          highestNote: result.highestNote,
          comfortableRange: result.comfortableRange,
          vocalRangeSemitones: result.range,
        }),
      });

      if (response.ok) {
        console.log('✅ Perfil vocal guardado en la base de datos');
        // Actualizar el contexto con los nuevos datos del servidor
        await refreshUser();
        // Actualizar también el estado local inmediatamente
        setSavedVocalRange(result);
      } else {
        const error = await response.json();
        console.error('Error al guardar perfil vocal:', error);
      }
    } catch (error) {
      console.error('Error de red al guardar perfil vocal:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, refreshUser]);

  if (!user) return null;
// Mostrar mensaje de token expirado
  if (tokenExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 rounded-xl border border-red-500/30 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Sesión Expirada
          </h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Tu sesión ha expirado por seguridad. Por favor, cierra sesión y vuelve a iniciar sesión para continuar.
          </p>
          <button
            onClick={logout}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <ProfileHeader user={user} />

      {/* Vocal Profile Card */}
      <VocalCard 
        savedRange={savedVocalRange}
        onRangeUpdate={handleRangeUpdate}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={TrendingUp}
          iconColor="text-purple-400"
          title="Sesiones Totales"
          value={isLoadingStats ? "..." : stats?.totalSessions || 0}
          subtitle={stats?.totalSessions ? `${stats.totalSessions} ${stats.totalSessions === 1 ? 'sesión' : 'sesiones'} completadas` : "Aún no has cantado"}
        />
        <StatsCard
          icon={Award}
          iconColor="text-yellow-400"
          title="Mejor Puntaje"
          value={isLoadingStats ? "..." : stats?.bestScore ? `${stats.bestScore}%` : "-"}
          subtitle={stats?.bestScore ? "¡Sigue mejorando!" : "Completa tu primera sesión"}
        />
        <StatsCard
          icon={Target}
          iconColor="text-green-400"
          title="Promedio"
          value={isLoadingStats ? "..." : stats?.averageScore ? `${stats.averageScore}%` : "-"}
          subtitle={stats && stats.totalSessions >= 3 ? "Basado en tus sesiones" : "Necesitas al menos 3 sesiones"}
        />
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-8 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          Tu Historial
        </h2>
        
        {isLoadingStats ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Cargando sesiones...</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
            
            {stats && stats.totalSessions > 5 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-400">
                  Mostrando las últimas 5 sesiones de {stats.totalSessions}
                </p>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
