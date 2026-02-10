"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { User, TrendingUp, Award, Target, BarChart3, Calendar, Music } from "lucide-react";
import { ProfileHeader, StatsCard, VocalCard } from "@/components/profile";
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
  diagnosis?: any;
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [savedVocalRange, setSavedVocalRange] = useState<VocalRangeResult | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
        if (!token) return;

        const response = await fetch(`${API_CONFIG.baseURL}/auth/me/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setSessions(data.recentSessions || []);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
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
              <a
                key={session.id}
                href={`/results/${session.id}`}
                className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Music className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{session.song.title}</h3>
                      <p className="text-sm text-gray-400">{session.song.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      session.score >= 80 ? 'text-green-400' :
                      session.score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {session.score}%
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.createdAt).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
              </a>
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
