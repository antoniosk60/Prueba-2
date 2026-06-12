import { useState, useEffect } from 'react';
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
import { Shield, Sparkles, Phone, MessageSquare, Award } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('inicio');
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
      setCurrentPage('reservas'); // Redirect standard users tobooking
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

  return (
    <div className="min-h-screen bg-[#020403] text-gray-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      
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
      <footer className="bg-gradient-to-t from-black via-zinc-950 to-[#020403] border-t border-emerald-950/20 pt-16 pb-8 text-left text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Identity */}
          <div className="space-y-4">
            <h4 className="font-display font-extrabold text-white text-base flex items-center space-x-2">
              <span className="text-xl">🍀</span>
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
              <li><button onClick={() => setCurrentPage('inicio')} className="hover:text-amber-400 transition-colors cursor-pointer">Inicio & MVPs</button></li>
              <li><button onClick={() => setCurrentPage('reservas')} className="hover:text-amber-400 transition-colors cursor-pointer">Renta de Canchas</button></li>
              <li><button onClick={() => setCurrentPage('promociones')} className="hover:text-amber-400 transition-colors cursor-pointer">Copas y Torneos</button></li>
              <li><button onClick={() => setCurrentPage('equipos')} className="hover:text-amber-400 transition-colors cursor-pointer">Registro de Escuadras</button></li>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-emerald-950/10 flex flex-col sm:flex-row justify-between text-gray-600 text-[10px] items-center">
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
