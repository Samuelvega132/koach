import Link from 'next/link';
import { Play, Mic2, Pause, Music, Clock, Zap } from 'lucide-react';
import { Song } from '../types';

// ============================================
// DYNAMIC COLOR GENERATION
// ============================================
// Generates deterministic pastel gradients based on song ID/title
// No external libraries needed - pure CSS/JS

const COLOR_PALETTES = [
    { from: 'from-purple-600', to: 'to-pink-500', accent: 'purple', shadow: 'shadow-purple-500/20' },
    { from: 'from-blue-600', to: 'to-cyan-500', accent: 'blue', shadow: 'shadow-blue-500/20' },
    { from: 'from-emerald-600', to: 'to-teal-500', accent: 'emerald', shadow: 'shadow-emerald-500/20' },
    { from: 'from-orange-600', to: 'to-amber-500', accent: 'orange', shadow: 'shadow-orange-500/20' },
    { from: 'from-rose-600', to: 'to-pink-500', accent: 'rose', shadow: 'shadow-rose-500/20' },
    { from: 'from-indigo-600', to: 'to-violet-500', accent: 'indigo', shadow: 'shadow-indigo-500/20' },
    { from: 'from-fuchsia-600', to: 'to-purple-500', accent: 'fuchsia', shadow: 'shadow-fuchsia-500/20' },
    { from: 'from-sky-600', to: 'to-blue-500', accent: 'sky', shadow: 'shadow-sky-500/20' },
];

// Simple hash function to get deterministic color from string
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

function getColorPalette(id: string, title: string) {
    const hash = hashString(id + title);
    return COLOR_PALETTES[hash % COLOR_PALETTES.length];
}

// ============================================
// COMPONENT
// ============================================

interface SongCardProps {
    song: Song;
    onPlay?: () => void;
    onSing?: () => void;
    isPlaying?: boolean;
}

export const SongCard = ({ song, onPlay, isPlaying = false }: SongCardProps) => {
    const palette = getColorPalette(song.id, song.title);
    
    // Format duration if available
    const formatDuration = (seconds?: number) => {
        if (!seconds) return null;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`group relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/10 ${palette.shadow} hover:shadow-lg`}>
            {/* Gradient Header */}
            <div className={`h-32 bg-gradient-to-br ${palette.from} ${palette.to} relative overflow-hidden`}>
                {/* Abstract pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
                    <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-black/20" />
                </div>
                
                {/* Music icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-16 h-16 text-white/40" />
                </div>
                
                {/* Difficulty badge */}
                {song.difficulty && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {song.difficulty}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title & Artist */}
                <h3 className="font-bold text-white text-lg truncate group-hover:text-purple-300 transition-colors">
                    {song.title}
                </h3>
                <p className="text-gray-400 text-sm truncate mb-3">
                    {song.artist}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    {song.bpm && (
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            {song.bpm} BPM
                        </span>
                    )}
                    {song.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(song.duration)}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/studio/${song.id}`}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${palette.from} ${palette.to} px-4 py-2.5 text-sm font-semibold text-white ${palette.shadow} shadow-lg transition-all hover:scale-[1.02] active:scale-95`}
                    >
                        <Mic2 className="h-4 w-4" />
                        Cantar
                    </Link>

                    <button
                        onClick={onPlay}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95 ${isPlaying ? 'text-green-400 border-green-500/30' : ''}`}
                        aria-label={isPlaying ? "Pausar vista previa" : "Reproducir vista previa"}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                </div>
            </div>

            {/* Playing Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
                <div
                    className={`h-full bg-gradient-to-r ${palette.from} ${palette.to} transition-all duration-300`}
                    style={{ width: isPlaying ? '100%' : '0%', opacity: isPlaying ? 1 : 0 }}
                />
            </div>
        </div>
    );
};
