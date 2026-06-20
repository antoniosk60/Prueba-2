import { Calendar, Trophy, Users, Shield, Zap } from 'lucide-react';

interface HeroProps {
  onRentClick: () => void;
  onExplorePromos: () => void;
}

export default function Hero({ onRentClick, onExplorePromos }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pb-28">
      {/* Decorative soccer pitch lines in background in ADHLER theme */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-4 border-adhler-orange rounded-full" />
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-adhler-orange/20 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-adhler-orange bg-[#131920] shadow-[0_0_25px_rgba(237,112,56,0.25)] flex-shrink-0">
                <img 
                  src="/src/assets/images/tribol_logo_1780556302100.png" 
                  alt="Fútbol Rápido Tribol"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 bg-adhler-orange/10 border border-adhler-orange/25 px-3.5 py-1.5 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-adhler-orange fill-adhler-orange animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-adhler-orange uppercase tracking-widest">Torneos Oficiales • Ixtapaluca</span>
                </div>
                <p className="text-[10px] text-adhler-cyan font-mono tracking-wider font-extrabold uppercase block sm:mt-1">Domo Deportivo Oficial Tribol</p>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              Fútbol Rápido <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-adhler-orange via-adhler-yellow to-adhler-orange-light glow-orange">
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
                className="w-full sm:w-auto bg-adhler-orange hover:bg-adhler-orange-dark text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(237,112,56,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5 fill-current" />
                <span>Rentar Cancha</span>
              </button>
              
              <button
                id="btn-hero-promos"
                onClick={onExplorePromos}
                className="w-full sm:w-auto bg-adhler-yellow hover:bg-adhler-yellow-dark text-black font-extrabold text-sm px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(247,217,85,0.2)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Trophy className="w-5 h-5 text-black" />
                <span>Ver Inscripciones & Torneos</span>
              </button>
            </div>

            {/* Micro KPI features row in ADHLER specs */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <span className="block font-display font-bold text-2xl sm:text-3xl text-adhler-orange">5+</span>
                <span className="text-xs text-gray-400">Categorías de Juego</span>
              </div>
              <div>
                <span className="block font-display font-bold text-2xl sm:text-3xl text-adhler-yellow">4.3K</span>
                <span className="text-xs text-gray-400">Seguidores Facebook</span>
              </div>
              <div>
                <span className="block font-display font-bold text-2xl sm:text-3xl text-adhler-cyan">100%</span>
                <span className="text-xs text-gray-400">Ambiente Familiar</span>
              </div>
            </div>
          </div>

          {/* Graphical element: Render a simulated preview card with ADHLER styling */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-adhler-orange/20 to-adhler-yellow/5 rounded-3xl blur-2xl" />
            
            <div className="relative rounded-3xl overflow-hidden border border-adhler-cyan/20 shadow-[0_0_50px_rgba(150,215,221,0.15)] bg-[#171E26]">
              <img 
                src="/src/assets/images/FB_IMG_1780559862787.jpg" 
                alt="Complejo Fútbol Rápido Tribol" 
                className="w-full h-80 object-cover scale-102 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 space-y-3">
                <span className="px-2 py-1 bg-adhler-orange text-white text-[10px] font-bold uppercase rounded font-mono">EN VIVO</span>
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-white text-lg">Cancha 1 (Techada)</h4>
                  <span className="text-adhler-orange text-sm font-semibold font-mono">$600 MXN / Hr</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-300">
                  <p className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-adhler-orange" /> Ideal 5 vs 5 / 6 vs 6</p>
                  <p className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-adhler-orange" /> Vestidores & Regaderas</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
