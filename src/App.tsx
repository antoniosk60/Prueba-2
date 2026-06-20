import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InicioPage from './components/InicioPage';
import ReservasPage from './components/ReservasPage';
import PromocionesPage from './components/PromocionesPage';
import GaleriaPage from './components/GaleriaPage';
import ContactoPage from './components/ContactoPage';
import EquiposPage from './components/EquiposPage';
import AdminPanel from './components/AdminPanel';
import AliadosSection from './components/AliadosSection';
import { FieldConfig, User } from './types';
import { Shield, Sparkles, Phone, MessageSquare, Award, ArrowLeft, LogOut } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('inicio');
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Android View controls for simulator and Capacitor native wrappers
  const [forceAndroidView, setForceAndroidView] = useState(() => {
    return localStorage.getItem('arena_force_android_view') === 'true';
  });

  const [androidEmail, setAndroidEmail] = useState('admin@canchafutbol.com');
  const [androidPassword, setAndroidPassword] = useState('admin');
  const [androidLoginError, setAndroidLoginError] = useState('');
  const [androidLoginLoading, setAndroidLoginLoading] = useState(false);

  const isCapacitorNative = Capacitor.isNativePlatform();
  const isInAndroidView = forceAndroidView || isCapacitorNative;

  const toggleAndroidView = () => {
    const newValue = !forceAndroidView;
    setForceAndroidView(newValue);
    localStorage.setItem('arena_force_android_view', String(newValue));
  };

  const handleAndroidLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAndroidLoginError('');
    setAndroidLoginLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: androidEmail, password: androidPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud de acceso.');
      }

      handleLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setAndroidLoginError(err.message || 'Ocurrió un error en el servidor al intentar validar accesos.');
    } finally {
      setAndroidLoginLoading(false);
    }
  };

  // Load field credentials on start
  const fetchFields = async () => {
    try {
      const response = await fetch('/api/fields');
      if (response.ok) {
        const data = await response.json();
        setFields(data);
      }
    } catch (err) {
      console.error('Error fetching field configurations', err);
    }
  };

  useEffect(() => {
    fetchFields();
    // Re-hydrate admin token if stored in local storage
    const storedToken = localStorage.getItem('arena_admin_token');
    const storedUserStr = localStorage.getItem('arena_user_profile');
    if (storedToken && storedUserStr) {
      const parsedUser = JSON.parse(storedUserStr);
      setAdminToken(storedToken);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'admin');
    }
  }, []);

  const handleLoginSuccess = (token: string, userdata: User) => {
    setAdminToken(token);
    setUser(userdata);
    const isUserAdmin = userdata.role === 'admin';
    setIsAdmin(isUserAdmin);
    localStorage.setItem('arena_admin_token', token);
    localStorage.setItem('arena_user_profile', JSON.stringify(userdata));
    if (isUserAdmin) {
      setCurrentPage('admin'); // Auto redirect to dashboard
    } else {
      setCurrentPage('reservas'); // Redirect standard users to booking
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('arena_admin_token');
    localStorage.removeItem('arena_user_profile');
    setCurrentPage('inicio');
  };

  // If in Android view, render the optimized Material-themed Administration frame
  if (isInAndroidView) {
    return (
      <div className="min-h-screen bg-[#171E26] text-gray-100 flex flex-col font-sans selection:bg-adhler-orange selection:text-white">
        
        {/* Android Native Status Top Bar */}
        <div className="sticky top-0 z-50 bg-[#0f141a] border-b border-adhler-cyan/15 px-4 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-adhler-orange/30 shadow-[0_0_8px_rgba(237,112,56,0.25)] bg-[#1e2530]">
              <img 
                src="/src/assets/images/tribol_logo_1780556302100.png" 
                alt="Fútbol Rápido Tribol Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-white">TRIBOL APP <span className="text-adhler-orange text-[10px] font-mono px-1 py-0.5 rounded bg-[#1e2530] border border-adhler-orange/20 ml-1">ADMIN</span></h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-adhler-orange animate-pulse"></span>
                <span className="text-[9px] text-adhler-orange font-mono font-medium tracking-wide uppercase">Realtime Cloud Sync</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCapacitorNative && (
              <button
                onClick={toggleAndroidView}
                className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] py-1.5 px-3 rounded-lg text-gray-400 hover:text-white transition-all flex items-center space-x-1 cursor-pointer"
                title="Volver a la vista del sitio web público"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Sitio Web</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="bg-red-950/30 border border-red-500/20 hover:bg-red-900/40 text-red-400 p-2 rounded-lg transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary View Area */}
        <div className="flex-grow">
          {!isAdmin ? (
            /* Dedicated Android Lock Login Portal */
            <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[80vh]">
              <div className="text-center mb-8 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-adhler-orange bg-[#131920] shadow-[0_0_20px_rgba(237,112,56,0.25)] transition-transform hover:rotate-6 duration-300">
                  <img 
                    src="/src/assets/images/tribol_logo_1780556302100.png" 
                    alt="Fútbol Rápido Tribol" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Acceso Administrativo</h2>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Panel oficial de control de canchas, liguillas y transacciones para Fútbol Rápido Tribol en Ixtapaluca.
                </p>
              </div>

              {androidLoginError && (
                <div className="mb-4 bg-red-950/50 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-xl flex items-start space-x-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{androidLoginError}</span>
                </div>
              )}

              <form onSubmit={handleAndroidLoginSubmit} className="space-y-4 bg-[#1e2530] p-6 rounded-2xl border border-adhler-cyan/15 shadow-xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-extrabold">Usuario de Control</label>
                  <input
                    type="email"
                    required
                    value={androidEmail}
                    onChange={(e) => setAndroidEmail(e.target.value)}
                    placeholder="ejemplo@canchafutbol.com"
                    className="w-full bg-[#171E26] border border-[#2d3846] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-adhler-orange/55 focus:border-adhler-orange/55 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-extrabold">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={androidPassword}
                    onChange={(e) => setAndroidPassword(e.target.value)}
                    placeholder="Ingrese su clave"
                    className="w-full bg-[#171E26] border border-[#2d3846] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-adhler-orange/55 focus:border-adhler-orange/55 transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={androidLoginLoading}
                  className="w-full bg-adhler-orange hover:bg-adhler-orange-dark text-white font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(237,112,56,0.35)] flex items-center justify-center space-x-2 tracking-wider uppercase cursor-pointer"
                >
                  {androidLoginLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Ingresar al Sistema</span>
                  )}
                </button>

                <div className="pt-2 border-t border-[#2d3846] flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAndroidEmail('admin@canchafutbol.com');
                      setAndroidPassword('admin');
                    }}
                    className="text-[10px] font-mono text-adhler-cyan hover:text-adhler-cyan/80 font-bold tracking-wide transition-all uppercase cursor-pointer"
                  >
                    ⚡ Autocompletar Credenciales
                  </button>
                </div>
              </form>

              {/* Security info */}
              <div className="mt-8 text-center text-[10px] text-gray-600 font-mono space-y-1">
                <p>Módulo de Control Android • Versión 1.0.0</p>
                <p>Firestore Database ID: <span className="text-zinc-500">ai-studio-22548b9b-b157-4d35-8a28-79744d6730b1</span></p>
              </div>
            </div>
          ) : (
            /* Open AdminPanel directly inside Android container full viewport width */
            <div className="px-3 py-4 max-w-7xl mx-auto">
              <AdminPanel token={adminToken} onLogout={handleLogout} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standalone multi-platform visitor layout
  return (
    <div className="min-h-screen bg-[#171E26] text-gray-100 flex flex-col justify-between selection:bg-adhler-orange selection:text-white">
      


      {/* Upper Navigation Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        user={user}
      />

      {/* Render hero only on front screen */}
      {currentPage === 'inicio' && (
        <Hero 
          onRentClick={() => setCurrentPage('reservas')}
          onExplorePromos={() => setCurrentPage('promociones')}
        />
      )}

      {/* Primary Routing view container */}
      <main className="flex-grow pt-24">
        {currentPage === 'inicio' && (
          <InicioPage
            fields={fields}
            onRentClick={() => setCurrentPage('reservas')}
            onExplorePromos={() => setCurrentPage('promociones')}
          />
        )}

        {currentPage === 'reservas' && (
          <ReservasPage fields={fields} user={user} token={adminToken} />
        )}

        {currentPage === 'promociones' && (
          <PromocionesPage onRentClick={() => setCurrentPage('reservas')} />
        )}

        {currentPage === 'galeria' && (
          <GaleriaPage />
        )}

        {currentPage === 'contacto' && (
          <ContactoPage />
        )}

        {currentPage === 'equipos' && (
          <EquiposPage isAdmin={isAdmin} adminToken={adminToken} />
        )}

        {(currentPage === 'admin' || currentPage === 'admin_dashboard') && isAdmin && (
          <AdminPanel token={adminToken} onLogout={handleLogout} />
        )}
      </main>

      {/* Corporate Alliances & Sponsors list */}
      <AliadosSection onContactClick={() => setCurrentPage('contacto')} />

      {/* Responsive Sports Theme Footer */}
      <footer className="bg-gradient-to-t from-[#0e1319] via-[#121820] to-[#171E26] border-t border-adhler-cyan/15 pt-16 pb-8 text-left text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Identity */}
          <div className="space-y-4">
            <h4 className="font-display font-extrabold text-white text-base flex items-center space-x-2">
              <span className="text-xl font-normal">🍀</span>
              <span>Fútbol Rápido Tribol</span>
            </h4>
            <p className="text-[11px] font-light leading-relaxed">
              La comunidad deportiva de fútbol rápido más emocionante en Ixtapaluca, Estado de México. Síguenos para ver roles de juego oficiales, MVPs de la jornada, crónicas de liguilla y registro de escuadrillas.
            </p>
            <div className="flex space-x-3 text-amber-400 font-mono text-[10px] font-bold">
              <span>● Ixtapaluca, EdoMex</span>
              <span>● Comunidad en Facebook</span>
            </div>
          </div>

          {/* Column 2: Quick pages switchers */}
          <div className="space-y-4">
            <strong className="text-white text-xs uppercase tracking-wider font-semibold font-mono">Contenidos de la Liga</strong>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => setCurrentPage('inicio')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">Inicio & MVPs</button></li>
              <li><button onClick={() => setCurrentPage('reservas')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">Renta de Canchas</button></li>
              <li><button onClick={() => setCurrentPage('promociones')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">Copas y Torneos</button></li>
              <li><button onClick={() => setCurrentPage('equipos')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">Registro de Escuadras</button></li>
            </ul>
          </div>

          {/* Column 3: Contact coordinates */}
          <div className="space-y-4">
            <strong className="text-white text-xs uppercase tracking-wider font-semibold font-mono">Ubicación & Contacto</strong>
            <p className="font-light leading-relaxed text-[11px]">
              Fútbol Rápido Tribol<br/>
              Av. Cuauhtémoc s/n, Ixtapaluca, Estado de México.<br/>
              Lunes a Sábado: 14:00 - 23:00 Hrs.<br/>
              Domingos: 09:00 - 21:00 Hrs.
            </p>
          </div>

          {/* Column 4: Facebook Official Profile CTA & WhatsApp */}
          <div className="space-y-4">
            <strong className="text-white text-xs uppercase tracking-wider font-semibold font-mono">Redes Oficiales</strong>
            <p className="text-[11px] font-light leading-relaxed">Sigue nuestra página de Facebook para ver transmisiones en vivo y videos de goles:</p>
            
            <div className="flex flex-col gap-2">
              <a
                href="https://www.facebook.com/share/1Gjs7z4eGc/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white p-3 rounded-xl inline-flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold shadow-md"
              >
                <span className="font-extrabold font-mono text-xs">f</span>
                <span>Fútbol Rápido Tribol</span>
              </a>
              
              <a
                href="https://wa.me/525512345678?text=Hola,%20quisiera%20inscribir%20mi%20equipo%20en%20Fútbol%20Rápido%20Tribol"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 rounded-xl inline-flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold shadow-sm"
              >
                <MessageSquare className="w-4 h-4 fill-current stroke-none" />
                <span>Contacto WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Closing details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-adhler-cyan/10 flex flex-col sm:flex-row justify-between text-gray-600 text-[10px] items-center">
          <span>© 2026 Fútbol Rápido Tribol Ixtapaluca. Todos los derechos reservados.</span>
          <div className="flex gap-4 mt-2 sm:mt-0 font-mono">
            <span>Privacidad de Plantillas</span>
            <span>Reglamento Oficial F7</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

