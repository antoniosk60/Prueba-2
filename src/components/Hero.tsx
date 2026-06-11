import { Calendar, Trophy, Users, Shield, Zap } from 'lucide-react';

interface HeroProps {
  onRentClick: () => void;
  onExplorePromos: () => void;
}

export default function Hero({ onRentClick, onExplorePromos }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pb-28">
      {/* Decorative soccer pitch lines in background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-4 border-emerald-500 rounded-full" />
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-emerald-500 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">Torneos Oficiales • Ixtapaluca</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              Fútbol Rápido <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-500 glow-green animate-pulse">
                Tribol Ixtapaluca
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              La comunidad deportiva más emocionante y competitiva de Ixtapaluca. Sigue las tablas de posiciones, conoce a los MVPs de la jornada, registra tu equipo en las categorías de Nuevos Valores, Femenil, Libre o Juvenil, y renta canchas de alta calidad.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                id="btn-hero-rent"
                onClick={onRentClick}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5 fill-current" />
                <span>Rentar Cancha</span>
              </button>
              
              <button
                id="btn-hero-promos"
                onClick={onExplorePromos}
                className="w-full sm:w-auto bg-transparent border border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Ver Inscripciones & Torneos</span>
              </button>
            </div>

            {/* Micro KPI features row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-950/20 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <span className="block font-display font-bold text-2xl sm:text-3xl text-emerald-400">5+</span>
                <span className="text-xs text-gray-400">Categorías de Juego</span>
              </div>
              <div>
                <span className="block font-display font-bold text-2xl sm:text-3xl text-amber-400">4.3K</span>
                <span className="text-xs text-gray-400">Seguidores Facebook</span>
              </div>
              <div>
                <span className="block font-display font-bold text-2xl sm:text-3xl text-emerald-400">100%</span>
                <span className="text-xs text-gray-400">Ambiente Familiar</span>
              </div>
            </div>
          </div>

          {/* Graphical element: Render a simulated preview card with a soccer action backdrop */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/5 rounded-3xl blur-2xl" />
            
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-emerald-950/10">
              <img 
                src="/src/assets/images/FB_IMG_1780559862787.jpg" 
                alt="Complejo Fútbol Rápido Tribol" 
                className="w-full h-80 object-cover scale-102 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 space-y-3">
                <span className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-bold uppercase rounded font-mono">EN VIVO</span>
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-white text-lg">Cancha 1 (Techada)</h4>
                  <span className="text-emerald-400 text-sm font-semibold font-mono">$600 MXN / Hr</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-300">
                  <p className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-400" /> Ideal 5 vs 5 / 6 vs 6</p>
                  <p className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Vestidores & Regaderas</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
