import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Smartphone } from 'lucide-react';

export default function ContactoPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Intro */}
      <div className="space-y-4 text-center lg:text-left">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Formas de Contacto directo
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          ¿Tienes inquietudes sobre cotizaciones para torneos corporativos, renta fija de horarios o reglamento interno? Escríbenos o haz clic para chatear por WhatsApp de inmediato.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Contact Info (Left column) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-adhler-cyan/15 space-y-6 text-left">
            <h3 className="font-display font-bold text-lg text-white">Detalles del Complejo</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <MapPin className="w-5 h-5 text-adhler-orange shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Ubicación oficial:</strong>
                  <span className="text-gray-400 font-light">Av. de los Deportes #420, Colonia Estadio, Ciudad de México, CP 06100</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <Clock className="w-5 h-5 text-adhler-orange shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Horarios de Operación:</strong>
                  <span className="text-gray-400 font-light block">Lunes a Sábado: 14:00 - 23:00 Hrs</span>
                  <span className="text-gray-400 font-light block">Domingos: 09:00 - 21:00 Hrs</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <Phone className="w-5 h-5 text-adhler-orange shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Teléfonos de Atención:</strong>
                  <span className="text-gray-400 font-light font-mono">+52 (55) 1234-5678 (Oficina)</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <Mail className="w-5 h-5 text-adhler-orange shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Correo electrónico:</strong>
                  <span className="text-gray-400 font-light font-mono">contacto@canchaarenagol.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sencillo mapa simulado CSS */}
          <div className="glass-panel p-6 rounded-2xl border border-adhler-cyan/15 space-y-3 text-left overflow-hidden min-h-[200px] relative flex flex-col justify-end bg-white/[0.01]">
            {/* Draw miniature field in CSS background */}
            <div className="absolute inset-x-4 top-4 bottom-4 opacity-10 border-2 border-adhler-cyan rounded flex items-center justify-center">
              <div className="w-1/2 h-full border-r border-adhler-cyan" />
              <div className="absolute w-12 h-12 border border-adhler-cyan rounded-full" />
            </div>
            
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center space-x-1 text-adhler-orange font-mono text-[10px] font-bold">
                <MapPin className="w-3.5 h-3.5 animate-bounce" />
                <span>UBICACIÓN SATELITAL</span>
              </div>
              <h4 className="font-display font-bold text-white text-sm">ArenaGOL Parque Deportivo</h4>
              <p className="text-[11px] text-gray-400">Junto a la Alameda Poniente. Estacionamiento vigilante gratuito para 50 automóviles.</p>
            </div>
          </div>
        </div>

        {/* Messaging Form & WhatsApp direct CTA (Right column) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-adhler-cyan/15 text-left space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Buzón de Sugerencias y Cotizaciones</h3>
            
            {isSent && (
              <div className="p-3 bg-adhler-orange/15 border border-adhler-orange/25 text-adhler-orange rounded-xl text-xs flex gap-2 items-center">
                <CheckCircle className="w-4 h-4" />
                <span>¡Mensaje recibido! Nos comunicaremos al correo provisto a la brevedad.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1e2530] text-white text-xs p-3 rounded-lg border border-[#2d3846] focus:outline-none focus:border-adhler-orange"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e2530] text-white text-xs p-3 rounded-lg border border-[#2d3846] focus:outline-none focus:border-adhler-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Mensaje o Detalle de Cotización *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Por favor descríbenos tu necesidad corporativa o escolar..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#1e2530] text-white text-xs p-3 rounded-lg border border-[#2d3846] focus:outline-none focus:border-adhler-orange text-left"
                />
              </div>

              <button
                type="submit"
                className="bg-adhler-orange hover:bg-adhler-orange-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer shadow-[0_4px_12px_rgba(237,112,56,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Comentario</span>
              </button>
            </form>
          </div>

          {/* Huge WhatsApp Quick Action Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-adhler-cyan/20 text-left relative overflow-hidden bg-gradient-to-r from-[#25D366]/10 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#25D366]">Canal Preferente</span>
              <h4 className="font-display font-extrabold text-white text-lg">¿Prefieres Soporte Inmediato?</h4>
              <p className="text-xs text-gray-400">Inicia un chat con un operador disponible de guardia para cotizaciones de torneos rápidos y ligas.</p>
            </div>

            <a
              href="https://wa.me/525512345678?text=Hola,%20quisiera%20rentar%20una%20cancha%20de%20fútbol%2520rápido"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1fb354] text-white font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(37,211,102,0.3)] shrink-0 flex items-center space-x-1.5"
            >
              <Smartphone className="w-4 h-4" />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
