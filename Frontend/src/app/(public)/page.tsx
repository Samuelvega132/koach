import { api } from '@/services/api';
import { SongCard } from '@/components/SongCard';
import { Mic2 } from 'lucide-react';

// Force dynamic rendering to always fetch latest songs
export const dynamic = 'force-dynamic';

export default async function Home() {
  const songs = await api.getSongs();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center">
      {/* Hero Section */}
      <div className="mb-16 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-4 animate-glow">
          <Mic2 className="w-8 h-8 text-purple-400" />
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-purple-900 text-glow">
          VOCAL STUDIO
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          Select a track to start your <span className="text-purple-400 font-medium">real-time pitch analysis</span> session.
        </p>
      </div>

      {/* Grid de Canciones */}
      {songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-4">
          {songs.map((song) => (
            <div key={song.id} className="transform hover:scale-[1.02] transition-all duration-300">
              <SongCard song={song} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 glass-panel">
          <p className="text-xl text-gray-500 font-mono">No tracks found in database.</p>
          <p className="text-sm text-gray-600 mt-2">Check your backend connection or run seeds.</p>
        </div>
      )}
    </div>
  );
}
