"use client";

import { useState } from 'react';
import { Music, Calendar, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import Link from 'next/link';

interface SessionCardProps {
  session: {
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
  };
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Determinar color basado en score
  const scoreColor = session.score >= 80 ? 'text-green-400' :
                     session.score >= 60 ? 'text-yellow-400' : 
                     'text-red-400';

  const scoreBgColor = session.score >= 80 ? 'bg-green-500/20' :
                       session.score >= 60 ? 'bg-yellow-500/20' : 
                       'bg-red-500/20';

  // Mapear severity a español
  const severityMap: Record<string, { label: string; color: string }> = {
    mild: { label: 'Leve', color: 'text-green-400' },
    moderate: { label: 'Moderado', color: 'text-yellow-400' },
    severe: { label: 'Severo', color: 'text-red-400' },
  };

  const severity = session.diagnosis?.severity 
    ? severityMap[session.diagnosis.severity] || { label: session.diagnosis.severity, color: 'text-gray-400' }
    : null;

  return (
    <div className="block p-5 bg-white/5 hover:bg-white/8 rounded-xl transition-all border border-white/10 hover:border-purple-500/30">
      {/* Header - Always visible */}
      <div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${scoreBgColor} flex items-center justify-center`}>
              <Music className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{session.song.title}</h3>
              <p className="text-sm text-gray-400">{session.song.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-3xl font-bold ${scoreColor}`}>
                {session.score}%
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(session.createdAt).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          {/* Diagnosis */}
          {session.diagnosis?.primaryIssue && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className={`w-5 h-5 ${severity?.color || 'text-purple-400'} mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Diagnóstico</h4>
                    {severity && (
                      <span className={`text-xs px-2 py-1 rounded-full ${scoreBgColor} ${severity.color} font-medium`}>
                        {severity.label}
                      </span>
                    )}
                  </div>
                  <p className="text-purple-300 font-medium mb-2">{session.diagnosis.primaryIssue}</p>
                  {session.diagnosis.diagnosis && (
                    <p className="text-sm text-gray-400 leading-relaxed">{session.diagnosis.diagnosis}</p>
                  )}
                </div>
              </div>

              {/* Prescription */}
              {session.diagnosis.prescription && session.diagnosis.prescription.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">Recomendaciones:</h5>
                  <ul className="space-y-1.5">
                    {session.diagnosis.prescription.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Telemetry Stats */}
          {session.telemetry && (
            <div className="grid grid-cols-3 gap-3">
              {session.telemetry.pitchDeviationAverage !== undefined && (
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Desviación RMS</p>
                  <p className="text-lg font-bold text-white">
                    {session.telemetry.pitchDeviationAverage.toFixed(0)} ¢
                  </p>
                </div>
              )}
              {session.telemetry.stabilityPercentage !== undefined && (
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Estabilidad</p>
                  <p className="text-lg font-bold text-white">
                    {session.telemetry.stabilityPercentage.toFixed(1)}%
                  </p>
                </div>
              )}
              {session.telemetry.durationSeconds !== undefined && (
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Duración</p>
                  <p className="text-lg font-bold text-white">
                    {session.telemetry.durationSeconds.toFixed(0)}s
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/results/${session.id}`}
              className="flex-1 text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Ver análisis completo
            </Link>
            
            {session.performanceLog?.rawData && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRawData(!showRawData);
                }}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium transition-all flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                {showRawData ? 'Ocultar' : 'Ver'} JSON
              </button>
            )}
          </div>

          {/* Raw Data JSON */}
          {showRawData && session.performanceLog?.rawData && (
            <div className="mt-3">
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30 max-h-96 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-purple-400 font-mono font-semibold">
                    Performance Data ({session.performanceLog.rawData.length} puntos)
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(session.performanceLog?.rawData, null, 2));
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Copiar JSON
                  </button>
                </div>
                <pre className="text-xs text-gray-300 font-mono leading-relaxed">
                  {JSON.stringify(session.performanceLog.rawData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
