import React from 'react';
import { ArrowUpRight, MessageSquare, Shield, Sparkles } from 'lucide-react';

interface AliadosSectionProps {
  onContactClick: () => void;
}

export default function AliadosSection({ onContactClick }: AliadosSectionProps) {
  return (
    <section id="aliados-estrategicos" className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-950/20 bg-gradient-to-b from-[#030604] to-[#020403] select-none">
      
      {/* Decorative neon ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-[#22c55e] text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alianzas con de Corazón</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Nuestros Aliados Estratégicos
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Trabajamos junto a marcas que comparten nuestra pasión por la excelencia y el deporte
          </p>
        </div>

        {/* Brand Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Pinturas Adhler (Official Partner) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-950/40 hover:border-green-500/30 transition-all duration-300 flex flex-col justify-between group shadow-lg text-left relative overflow-hidden">
            {/* Top-right subtle overlay brand gradient flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/5 to-transparent pointer-events-none" />
            
            <div className="space-y-6">
              {/* Logo & Badge Lockup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Custom Inline SVG Vector Logotype for Pinturas Adhler */}
                <div className="w-60 h-16 bg-black/30 rounded-xl p-2 border border-white/5 flex items-center justify-center select-none shadow-inner" title="Adhler Ingeniería del Color">
                  <svg width="220" height="55" viewBox="0 0 245 70" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Segmented prismatic color triangle */}
                    <g transform="translate(10, 5)">
                      {/* Left: vibrant red-orange hue */}
                      <path d="M 30 0 L 0 50 L 30 50 Z" fill="#EF4444" />
                      {/* Right: radiant athletic blue */}
                      <path d="M 30 0 L 30 50 L 60 50 Z" fill="#3B82F6" />
                      {/* Lower left: intense athletic amber yellow */}
                      <path d="M 0 50 L 30 32 L 30 50 Z" fill="#FBBF24" />
                      {/* Lower right: energetic grass neon-green */}
                      <path d="M 60 50 L 30 32 L 30 50 Z" fill="#22C55E" />
                      {/* Inner core prism balance */}
                      <path d="M 30 16 L 18 36 L 42 36 Z" fill="#A855F7" />
                    </g>
                    {/* Modern geometric sans typography */}
                    <text x="85" y="32" fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="26" fill="#FFFFFF" letterSpacing="0.5">Adhler</text>
                    {/* Technical monospace descriptor */}
                    <text x="85" y="49" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="9" fill="#22C55E" letterSpacing="2.5">INGENIERÍA DEL COLOR</text>
                  </svg>
                </div>

                {/* Badge component */}
                <div className="inline-flex max-w-fit items-center gap-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1.5 rounded-full select-none">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Aliado Oficial</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-light">
                Con más de 60 años de experiencia, Pinturas Adhler es nuestro aliado oficial para el mantenimiento y embellecimiento de nuestras instalaciones. Su tecnología de alta resistencia garantiza que nuestras canchas luzcan impecables y seguras.
              </p>
            </div>

            {/* Action Interactive anchor */}
            <div className="mt-8 pt-6 border-t border-emerald-950/20">
              <a 
                href="https://www.pinturasadhler.com.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#22c55e] hover:bg-green-400 text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase font-mono tracking-wider transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(34,197,94,0.35)] cursor-pointer"
              >
                <span>Visita su sitio web</span>
                <ArrowUpRight className="w-4 h-4 text-black stroke-[3px]" />
              </a>
            </div>
          </div>

          {/* Card 2: Joint Invitation dotted card */}
          <div className="border-2 border-dashed border-emerald-900/40 hover:border-[#22c55e]/30 bg-green-500/[0.01] hover:bg-green-500/[0.02] p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group">
            
            <div className="space-y-6">
              {/* Visual geometric accent */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/30 border border-emerald-900/30 flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6" />
              </div>

              {/* Invitation Text */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-xl text-white">
                  ¿Eres un colaborador?
                </h3>
                <h4 className="font-display font-bold text-lg text-[#22c55e] leading-snug">
                  Únete a nuestra red de aliados
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-light">
                  Conecta tu marca con nuestra creciente comunidad de aficionados y futbolistas locales en Ixtapaluca. Ofrecemos espacios de patrocinio estático en canchas, activaciones en torneos nocturnos, integraciones digitales y visibilidad corporativa preferencial.
                </p>
              </div>
            </div>

            {/* Form switcher contact button */}
            <div className="mt-8 pt-6 border-t border-emerald-950/10">
              <button 
                onClick={onContactClick}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-[#22c55e]/5 text-[#22c55e] border border-[#22c55e]/30 hover:border-[#22c55e] font-bold px-6 py-3 rounded-xl text-xs uppercase font-mono tracking-wider transition-all duration-200 cursor-pointer"
              >
                <span>Únete como Patrocinador</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
