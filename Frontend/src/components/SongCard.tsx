import Link from 'next/link';
import { Play, Mic2, Pause } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
    song: Song;
    onPlay?: () => void;
    onSing?: () => void;
    isPlaying?: boolean;
}

export const SongCard = ({ song, onPlay, isPlaying = false }: SongCardProps) => {
    return (
        <div className="group relative ...">
            {/* ... content */}

            <div className="mt-6 flex items-center gap-4">
                <Link
                    href={`/studio/${song.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-95"
                >
                    <Mic2 className="h-4 w-4" />
                    Sing Now
                </Link>

                {/* ... Play Button */}


                <button
                    onClick={onPlay}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:text-blue-400 active:scale-95"
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
            </div>

            {/* Progress Bar (Fake for MVP visual) */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: isPlaying ? '100%' : '0%', opacity: isPlaying ? 1 : 0 }}
                />
            </div>
        </div>
    );
};
