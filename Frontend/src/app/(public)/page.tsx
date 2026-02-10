import Link from 'next/link';
import { Mic2, LineChart, Headphones, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">
              Análisis vocal en tiempo real
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="block text-white mb-2">
              Mejora tu técnica vocal
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
              con análisis instantáneo
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Entrena con retroalimentación inmediata sobre tu afinación, 
            visualiza tu progreso y perfecciona cada nota.
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              href="/songs"
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
            >
              <Mic2 className="w-6 h-6" />
              <span>Comenzar ahora</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            ¿Por qué elegir Koach?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LineChart className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Análisis en vivo
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Obtén feedback instantáneo sobre tu afinación mientras cantas. 
                Ve cada nota en tiempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic2 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Diagnóstico inteligente
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Sistema experto que identifica áreas de mejora y genera 
                recomendaciones personalizadas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Practica con pistas
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Selecciona entre nuestra biblioteca de canciones y mejora 
                tu técnica con acompañamiento musical.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-gray-400">
            Únete y descubre tu verdadero potencial vocal
          </p>
          <Link
            href="/songs"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          >
            Explorar canciones
          </Link>
        </div>
      </section>
    </div>
  );
}
