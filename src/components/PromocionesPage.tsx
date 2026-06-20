import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Award, Calendar, ToggleLeft, Copy, Check } from 'lucide-react';
import { Promotion } from '../types';

interface PromocionesPageProps {
  onRentClick: () => void;
}

export default function PromocionesPage({ onRentClick }: PromocionesPageProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/promotions');
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (e) {
      console.error('Error fetching promotions', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Visual Title */}
      <div className="space-y-4 text-center lg:text-left">
        <div className="inline-flex items-center space-x-2 bg-adhler-orange/15 border border-adhler-orange/25 px-3.5 py-1.5 rounded-full select-none">
          <Sparkles className="w-4 h-4 text-adhler-orange" />
          <span className="text-xs font-mono font-semibold text-adhler-orange uppercase tracking-wider">Beneficios Exclusivos 2026</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Inscripciones y Torneos Fútbol Rápido Tribol
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Sácale provecho a nuestros cupones especiales para reservar tus partidos con descuento o inscribe a tu club en la Copa Nocturna para pelear los premios en efectivo.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs font-mono text-adhler-orange">Cargando beneficios deportivos...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-[#303846] text-gray-400">
          Actualmente las promociones están siendo actualizadas. Por favor contáctanos por WhatsApp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => {
            const isTournament = promo.type === 'tournament';
            return (
              <div
                key={promo.id}
                className="glass-panel rounded-2xl overflow-hidden border border-adhler-cyan/15 flex flex-col justify-between hover:border-adhler-orange/30 transition-all duration-300 group shadow-md"
              >
                
                {/* Header aspect */}
                <div className="p-6 text-left space-y-4 flex-1">
                  
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[9px] font-bold font-mono uppercase rounded-md ${
                      isTournament 
                        ? 'bg-adhler-yellow/15 text-adhler-yellow border border-adhler-yellow/25' 
                        : 'bg-adhler-orange/15 text-adhler-orange border border-adhler-orange/25'
                    }`}>
                      {isTournament ? 'TORNEO OFICIAL' : 'DESCUENTO DE HORARIO'}
                    </span>
                    
                    {promo.discountPercentage > 0 && (
                      <span className="text-2xl font-display font-black text-adhler-orange">
                        -{promo.discountPercentage}%
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-white group-hover:text-adhler-orange transition-colors">
                    {promo.title}
                  </h3>
                  
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    {promo.description}
                  </p>

                  <div className="pt-4 border-t border-adhler-cyan/10 flex items-center space-x-2 text-[10px] text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-mono">Vence: {promo.validUntil}</span>
                  </div>
                </div>

                {/* Footer aspect */}
                {promo.promoCode && (
                  <div className="p-5 bg-white/[0.02] border-t border-adhler-cyan/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono block">Cupón Oficial:</span>
                      <strong className="text-white text-xs font-mono font-bold tracking-wider">{promo.promoCode}</strong>
                    </div>
                    
                    <button
                      onClick={() => handleCopyCode(promo.id, promo.promoCode!)}
                      className="px-3 py-1.5 rounded-lg bg-adhler-orange/10 border border-adhler-orange/20 hover:bg-adhler-orange/20 text-adhler-orange text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === promo.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-adhler-orange" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Tournament join call */}
                {isTournament && (
                  <div className="p-5 bg-white/[0.02] border-t border-adhler-cyan/10">
                    <button
                      onClick={onRentClick}
                      className="w-full bg-adhler-orange hover:bg-adhler-orange-dark text-white font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-[0_4px_12px_rgba(237,112,56,0.2)]"
                    >
                      Inscribirse al Torneo
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Bonus Coupon */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-adhler-cyan/20 text-center space-y-4 max-w-4xl mx-auto">
        <div className="w-10 h-10 rounded-xl bg-adhler-orange/10 border border-adhler-orange/20 text-adhler-orange flex items-center justify-center mx-auto">
          <Award className="w-5 h-5 animate-pulse" />
        </div>
        <h3 className="font-display font-extrabold text-xl text-white">¿Tienes un cupón corporativo o escolar?</h3>
        <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Inscríbelo durante el formulario de reservaciones en línea o muéstraselo al operador en caja para hacer efectivo tus descuentos exclusivos antes de confirmar el silbatazo inicial.
        </p>
      </section>

    </div>
  );
}
