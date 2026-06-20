import { Shield, Lightbulb, Users, Calendar, Award, Phone } from 'lucide-react';
import { FieldConfig } from '../types';

interface InicioPageProps {
  fields: FieldConfig[];
  onRentClick: () => void;
  onExplorePromos: () => void;
}

export default function InicioPage({ fields, onRentClick, onExplorePromos }: InicioPageProps) {
  return (
    <div className="space-y-20 pb-20">
      
      {/* Visual Stadium Presentation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Nuestras Canchas Fútbol Rápido Tribol
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Pasto sintético profesional, iluminación LED certificada y tecnología de punta dentro de Ixtapaluca. Conoce las canchas del complejo Fútbol Rápido Tribol y renta tus horarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {fields.map((field) => (
            <div 
              key={field.id} 
              id={`field-card-${field.id}`}
              className="glass-panel overflow-hidden rounded-2xl border border-adhler-cyan/15 hover:border-adhler-orange/30 transition-all duration-300 group hover:-translate-y-1 shadow-md"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={field.imageUrl} 
                  alt={field.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/44 to-transparent p-4 flex items-end justify-between">
                  <span className="bg-adhler-orange text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded font-mono">
                    DISPONIBLE
                  </span>
                  <span className="text-white font-mono font-bold text-sm bg-black/60 px-2.5 py-1 rounded backdrop-blur">
                    ${field.basePricePerHour} <span className="text-xs text-adhler-cyan">MXN/Hr</span>
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 text-left">
                <h3 className="font-display font-bold text-lg text-white group-hover:text-adhler-orange transition-colors">
                  {field.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  {field.description}
                </p>

                <div className="pt-4 border-t border-adhler-cyan/10 grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">
                    <Users className="w-3.5 h-3.5 text-adhler-orange" /> 5v5 a 7v7
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">
                    <Lightbulb className="w-3.5 h-3.5 text-adhler-yellow" /> Luz Nocturna
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onRentClick}
                    className="w-full bg-adhler-orange/10 hover:bg-adhler-orange hover:text-white border border-adhler-orange/30 text-adhler-orange py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide cursor-pointer text-center"
                  >
                    Ver Horarios Disponibles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MVP de la Semana Showcase Section - Cartas estilo FIFA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-adhler-cyan/10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-adhler-orange/10 border border-adhler-orange/20 px-3 py-1 rounded-full text-adhler-orange font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            🏆 Reconocimientos Especiales Tribol
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Jugadores Más Valiosos (MVP) de la Jornada
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Cada fin de semana destacamos a las leyendas del fútbol de Ixtapaluca con nuestras tarjetas digitales coleccionables de Fútbol Rápido Tribol. ¡Conoce a las figuras de la fecha!
          </p>
        </div>

        {/* Grid of FIFA style cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto pb-10">
          
          {/* Card 1: Piña */}
          <div className="relative group mx-auto w-[280px]">
            {/* Ambient gold glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-t from-adhler-orange via-adhler-yellow to-[#D53C2E] opacity-20 group-hover:opacity-45 blur-lg transition duration-500" />
            
            {/* FIFA-style Card Structure */}
            <div className="relative h-[390px] w-[270px] bg-gradient-to-br from-[#171E26] via-[#212933] to-[#0f151c] border-2 border-adhler-orange/50 rounded-2xl p-5 text-center flex flex-col justify-between overflow-hidden shadow-2xl transition duration-300 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-adhler-orange/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Badge & Top Row */}
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div className="text-left font-mono">
                  <div className="text-3xl font-black text-adhler-yellow leading-none">94</div>
                  <div className="text-[10px] font-bold text-gray-400 leading-none uppercase mt-1">DEL</div>
                  <div className="text-[8px] bg-adhler-orange/25 text-adhler-orange px-1 py-0.5 rounded font-bold uppercase mt-1">MVP DEL TORNEO</div>
                </div>
                <div className="text-right">
                  <span className="text-2xl" title="Fútbol Rápido Tribol">⚽</span>
                  <div className="text-[8px] font-bold text-adhler-orange uppercase tracking-widest mt-1">Barcelona</div>
                </div>
              </div>

              {/* Player Image / Silhouette placeholder with soccer theme */}
              <div className="relative h-32 my-2 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-adhler-orange/15 to-adhler-yellow/20 border border-adhler-orange/30 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl">⚽</span>
                  {/* Glowing halo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-adhler-orange/30 via-transparent to-transparent opacity-60" />
                </div>
                <div className="absolute bottom-1 bg-adhler-orange text-white text-[9px] font-extrabold uppercase px-3 py-0.5 rounded-full font-mono tracking-wider shadow">
                  PIÑA
                </div>
              </div>

              {/* Player Name and Team Details */}
              <div className="space-y-1">
                <h4 className="font-display font-black text-white text-base">E. "Piña" López</h4>
                <p className="text-[10px] text-adhler-cyan font-mono font-bold">Categoría: Libre Sabatina</p>
                <p className="text-[11px] text-gray-300 leading-relaxed font-light italic px-2">
                  "Metió doblete, demostró mucha calidad y fue pieza clave para la victoria del equipo en la Gran Final."
                </p>
              </div>

              {/* Player Stats HUD */}
              <div className="border-t border-white/5 pt-3 grid grid-cols-6 gap-1 text-[10px] font-mono text-gray-400">
                <div>
                  <span className="block font-bold text-white text-[11px]">95</span>
                  <span>RIT</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">96</span>
                  <span>TIR</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">91</span>
                  <span>PAS</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">94</span>
                  <span>REG</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">48</span>
                  <span>DEF</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">82</span>
                  <span>FIS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Gaby Martínez */}
          <div className="relative group mx-auto w-[280px]">
            {/* Ambient gold glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-t from-adhler-orange via-adhler-yellow to-[#D53C2E] opacity-20 group-hover:opacity-45 blur-lg transition duration-500" />
            
            {/* FIFA-style Card Structure */}
            <div className="relative h-[390px] w-[270px] bg-gradient-to-br from-[#171E26] via-[#212933] to-[#0f151c] border-2 border-adhler-orange/50 rounded-2xl p-5 text-center flex flex-col justify-between overflow-hidden shadow-2xl transition duration-300 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-adhler-orange/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Badge & Top Row */}
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div className="text-left font-mono">
                  <div className="text-3xl font-black text-adhler-yellow leading-none">92</div>
                  <div className="text-[10px] font-bold text-gray-400 leading-none uppercase mt-1">MED</div>
                  <div className="text-[8px] bg-adhler-orange/25 text-adhler-orange px-1 py-0.5 rounded font-bold uppercase mt-1">MVP DE LA COPA</div>
                </div>
                <div className="text-right">
                  <span className="text-2xl" title="Fútbol Rápido Tribol">🏃‍♀️</span>
                  <div className="text-[8px] font-bold text-adhler-orange uppercase tracking-widest mt-1">España</div>
                </div>
              </div>

              {/* Player Image / Silhouette placeholder with soccer theme */}
              <div className="relative h-32 my-2 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-adhler-orange/15 to-adhler-yellow/20 border border-adhler-orange/30 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl">🏃‍♀️</span>
                  {/* Glowing halo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-adhler-orange/30 via-transparent to-transparent opacity-60" />
                </div>
                <div className="absolute bottom-1 bg-adhler-orange text-white text-[9px] font-extrabold uppercase px-3 py-0.5 rounded-full font-mono tracking-wider shadow">
                  GABY
                </div>
              </div>

              {/* Player Name and Team Details */}
              <div className="space-y-1">
                <h4 className="font-display font-black text-white text-base">Gaby Martínez</h4>
                <p className="text-[10px] text-adhler-cyan font-mono font-bold">Categoría: Femenil Dominical</p>
                <p className="text-[11px] text-gray-300 leading-relaxed font-light italic px-2">
                  "Metió hat-trick, manejó la media cancha con una intensidad incansable y lideró la victoria ante Real Alianza."
                </p>
              </div>

              {/* Player Stats HUD */}
              <div className="border-t border-white/5 pt-3 grid grid-cols-6 gap-1 text-[10px] font-mono text-gray-400">
                <div>
                  <span className="block font-bold text-white text-[11px]">89</span>
                  <span>RIT</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">88</span>
                  <span>TIR</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">94</span>
                  <span>PAS</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">92</span>
                  <span>REG</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">71</span>
                  <span>DEF</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">80</span>
                  <span>FIS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Tito Portero */}
          <div className="relative group mx-auto w-[280px]">
            {/* Ambient gold glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-t from-adhler-orange via-adhler-yellow to-[#D53C2E] opacity-20 group-hover:opacity-45 blur-lg transition duration-500" />
            
            {/* FIFA-style Card Structure */}
            <div className="relative h-[390px] w-[270px] bg-gradient-to-br from-[#171E26] via-[#212933] to-[#0f151c] border-2 border-adhler-orange/50 rounded-2xl p-5 text-center flex flex-col justify-between overflow-hidden shadow-2xl transition duration-300 group-hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-adhler-orange/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Badge & Top Row */}
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div className="text-left font-mono">
                  <div className="text-[30px] font-black text-adhler-yellow leading-none">90</div>
                  <div className="text-[10px] font-bold text-gray-400 leading-none uppercase mt-1">POR</div>
                  <div className="text-[8px] bg-adhler-orange/25 text-adhler-orange px-1 py-0.5 rounded font-bold uppercase mt-1">EL MURO</div>
                </div>
                <div className="text-right">
                  <span className="text-2xl" title="Fútbol Rápido Tribol">🧤</span>
                  <div className="text-[8px] font-bold text-adhler-orange uppercase tracking-widest mt-1">Barrios</div>
                </div>
              </div>

              {/* Player Image / Silhouette placeholder with soccer theme */}
              <div className="relative h-32 my-2 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-adhler-orange/15 to-adhler-yellow/20 border border-adhler-orange/30 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl">🧤</span>
                  {/* Glowing halo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-adhler-orange/30 via-transparent to-transparent opacity-60" />
                </div>
                <div className="absolute bottom-1 bg-adhler-orange text-white text-[9px] font-extrabold uppercase px-3 py-0.5 rounded-full font-mono tracking-wider shadow">
                  TITO
                </div>
              </div>

              {/* Player Name and Team Details */}
              <div className="space-y-1">
                <h4 className="font-display font-black text-white text-base">Tito "El Muro"</h4>
                <p className="text-[10px] text-adhler-cyan font-mono font-bold">Categoría: Nuevos Valores</p>
                <p className="text-[11px] text-gray-300 leading-relaxed font-light italic px-2">
                  "Atajó penal decisivo en el último minuto para coronar campeones a Barrios en el torneo dominical."
                </p>
              </div>

              {/* Player Stats HUD */}
              <div className="border-t border-white/5 pt-3 grid grid-cols-6 gap-1 text-[10px] font-mono text-gray-400">
                <div>
                  <span className="block font-bold text-white text-[11px]">92</span>
                  <span>EST</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">89</span>
                  <span>PAR</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">78</span>
                  <span>SAK</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">93</span>
                  <span>REF</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">50</span>
                  <span>VEL</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-[11px]">88</span>
                  <span>POS</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Modern Highlighting Features Banner */}
      <section className="bg-gradient-to-r from-adhler-blue/10 via-black to-adhler-orange/5 py-16 border-y border-adhler-cyan/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-8 text-center sm:text-left">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-adhler-orange/10 border border-adhler-orange/20 text-adhler-orange flex items-center justify-center mb-2 mx-auto sm:mx-0">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Pasto Sintético FIFA</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Fibra de monofilamento de última generación que reduce la abrasión y previene lesiones en las rodillas.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-adhler-yellow/10 border border-adhler-yellow/20 text-adhler-yellow flex items-center justify-center mb-2 mx-auto sm:mx-0">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Iluminación LED Profesional</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Distribución refractaria homogénea de luz blanca para una experiencia diurna inigualable por las noches.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-adhler-cyan/10 border border-adhler-cyan/20 text-adhler-cyan flex items-center justify-center mb-2 mx-auto sm:mx-0">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Marcador Electrónico</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Pantallas de alta densidad para registrar anotaciones y faltas de forma profesional durante el juego.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-adhler-blue/20 border border-adhler-blue/40 text-adhler-cyan flex items-center justify-center mb-2 mx-auto sm:mx-0">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Vestidores & Regaderas</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Casilleros con candado, regaderas con agua caliente e hidratación completa para los deportistas.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Fast CTA Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative glass-panel rounded-3xl border border-adhler-cyan/25 overflow-hidden py-14 px-8 sm:px-12 text-center space-y-6 shadow-[0_0_50px_rgba(237,112,56,0.06)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-adhler-orange/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-adhler-yellow/15 rounded-full blur-3xl" />
          
          <h3 className="font-display font-black text-3xl sm:text-4xl text-white">¿Quieres Armar una Reta esta Noche?</h3>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Las canchas se programan rápido los fines de semana. Reserva con anticipación o chatea con nosotros a través de WhatsApp para recibir apoyo personalizado de nuestros coordinadores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onRentClick}
              className="w-full sm:w-auto bg-adhler-orange hover:bg-adhler-orange-dark text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Consultar Disponibilidad Real
            </button>
            <a
              href="https://wa.me/525512345678?text=Hola,%20quisiera%2520información%20sobre%20las%20canchas%20de%20fútbol%20rápido"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-current stroke-none" />
              <span>Soporte por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
