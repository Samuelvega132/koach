"use client";

import { useState, useEffect } from "react";
import { Music, Sparkles } from "lucide-react";
import { VocalRangeWizard, VocalRangeResult, VoiceType } from "./VocalRangeWizard";

interface VoiceTypeConfig {
  name: string;
  range: string;
  color: string;
  bgColor: string;
}

const VOICE_TYPES: Record<VoiceType, VoiceTypeConfig> = {
  bass: { name: "Bajo", range: "E2 - E4", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  baritone: { name: "Barítono", range: "A2 - A4", color: "text-indigo-400", bgColor: "bg-indigo-500/20" },
  tenor: { name: "Tenor", range: "C3 - C5", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  countertenor: { name: "Contratenor", range: "E3 - E5", color: "text-pink-400", bgColor: "bg-pink-500/20" },
  contralto: { name: "Contralto", range: "F3 - F5", color: "text-rose-400", bgColor: "bg-rose-500/20" },
  "mezzo-soprano": { name: "Mezzosoprano", range: "A3 - A5", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  soprano: { name: "Soprano", range: "C4 - C6", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
};

interface VocalCardProps {
  savedRange?: VocalRangeResult | null;
  onRangeUpdate?: (range: VocalRangeResult) => void;
}

export function VocalCard({ savedRange, onRangeUpdate }: VocalCardProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [localRange, setLocalRange] = useState<VocalRangeResult | null>(savedRange || null);

  // Sincronizar con savedRange cuando cambie desde el padre
  useEffect(() => {
    setLocalRange(savedRange || null);
  }, [savedRange]);

  const handleComplete = (result: VocalRangeResult) => {
    setLocalRange(result);
    onRangeUpdate?.(result);
    setShowWizard(false);
  };

  const voiceConfig = localRange ? VOICE_TYPES[localRange.voiceType] : null;

  return (
    <>
      <div className="glass-panel p-8 rounded-xl border border-purple-500/30 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Music className="w-6 h-6 text-purple-400" />
            Perfil Vocal
          </h2>
          {localRange && (
            <button
              onClick={() => setShowWizard(true)}
              className="text-sm text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Repetir test
            </button>
          )}
        </div>

        {localRange && voiceConfig ? (
          <div className="space-y-6">
            {/* Voice Type Badge */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${voiceConfig.bgColor}`}>
                <Music className={`w-8 h-8 ${voiceConfig.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tu tipo de voz</p>
                <h3 className={`text-3xl font-bold ${voiceConfig.color}`}>{voiceConfig.name}</h3>
              </div>
            </div>

            {/* Range Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Nota más grave</p>
                <p className="text-2xl font-bold text-blue-400">{localRange.lowestNote}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Nota más aguda</p>
                <p className="text-2xl font-bold text-pink-400">{localRange.highestNote}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Rango cómodo</p>
                <p className="text-lg font-semibold text-white">
                  {localRange.comfortableRange[0]} - {localRange.comfortableRange[1]}
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Rango total: {localRange.range} semitonos
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Descubre tu rango vocal
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Realiza un test rápido para conocer tu tipo de voz y las notas que puedes alcanzar cómodamente.
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <Music className="w-5 h-5" />
              Comenzar Test de Rango
            </button>
          </div>
        )}
      </div>

      {/* Vocal Range Wizard Modal */}
      {showWizard && (
        <VocalRangeWizard
          onComplete={handleComplete}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  );
}
