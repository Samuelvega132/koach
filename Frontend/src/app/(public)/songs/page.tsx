import { api } from '@/services/api';
import { SongCard } from '@/components/SongCard';
import { Music2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to always fetch latest songs
export const dynamic = 'force-dynamic';

export default async function SongsPage() {
  const songs = await api.getSongs();

  return (
    <div className="min-h-[80vh] py-12">
      {/* Header */}
      <div className="mb-12 space-y-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Volver al inicio</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Music2 className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Biblioteca de Canciones
            </h1>
            <p className="text-gray-400 mt-2">
              Selecciona una pista para comenzar tu sesión de práctica
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Canciones */}
      {songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
          {songs.map((song) => (
            <div key={song.id} className="transform hover:scale-[1.02] transition-all duration-300">
              <SongCard song={song} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 glass-panel max-w-2xl mx-auto">
          <Music2 className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-xl text-gray-400 font-medium">No hay canciones disponibles</p>
          <p className="text-sm text-gray-500 mt-2">Verifica tu conexión al backend o ejecuta el seed</p>
        </div>
      )}
    </div>
  );
}
