import React, { useState } from 'react';
import { Trophy, Calendar, Sparkles, Image as ImageIcon, Phone, Briefcase, Lock, LogOut, Menu, X, User, Users } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAdmin: boolean;
  onLoginSuccess: (token: string, user: UserType) => void;
  onLogout: () => void;
  user: UserType | null;
}

export default function Header({
  currentPage,
  setCurrentPage,
  isAdmin,
  onLoginSuccess,
  onLogout,
  user
}: HeaderProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('admin@canchafutbol.com');
  const [password, setPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  // Nav items configuration
  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Trophy, activeClass: 'bg-adhler-orange/15 text-adhler-orange border border-adhler-orange/30 shadow-[0_0_10px_rgba(237,112,56,0.15)]' },
    { id: 'reservas', label: 'Reservas', icon: Calendar, activeClass: 'bg-adhler-red/15 text-adhler-red-light border border-adhler-red/30 shadow-[0_0_10px_rgba(213,60,46,0.15)]' },
    { id: 'promociones', label: 'Promociones', icon: Sparkles, activeClass: 'bg-adhler-yellow/15 text-adhler-yellow border border-adhler-yellow/30 shadow-[0_0_10px_rgba(247,217,85,0.15)]' },
    { id: 'galeria', label: 'Galería', icon: ImageIcon, activeClass: 'bg-adhler-blue/30 text-adhler-blue-light border border-adhler-blue/40 shadow-[0_0_10px_rgba(14,43,163,0.15)]' },
    { id: 'equipos', label: 'Equipos', icon: Users, activeClass: 'bg-adhler-cyan/15 text-adhler-cyan border border-adhler-cyan/30 shadow-[0_0_10px_rgba(150,215,221,0.15)]' },
    { id: 'contacto', label: 'Contacto', icon: Phone, activeClass: 'bg-adhler-blue/30 text-adhler-blue-light border border-adhler-blue/40 shadow-[0_0_10px_rgba(14,43,163,0.15)]' },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload = isRegisterMode
        ? { name: registerName, email, phone: registerPhone, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud.');
      }

      onLoginSuccess(data.token, data.user);
      setIsLoginOpen(false);
      // Clean form
      setRegisterName('');
      setRegisterPhone('');
    } catch (err: any) {
      setLoginError(err.message || 'Ocurrió un error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-adhler-cyan/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setCurrentPage('inicio')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 overflow-hidden border border-adhler-orange/30 shadow-[0_0_15px_rgba(237,112,56,0.3)] bg-bg-dark">
              <img 
                src="/src/assets/images/tribol_logo_1780556302100.png" 
                alt="Fútbol Rápido Tribol Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <span className="font-display font-extrabold text-lg sm:text-2xl tracking-wider text-white flex items-center leading-none">
                  FÚTBOL RÁPIDO<span className="text-adhler-orange font-extrabold font-mono ml-1">TRIBOL</span>
                </span>
                <p className="text-[9px] sm:text-[10px] text-adhler-cyan font-mono tracking-widest leading-none mt-1 font-bold">LIGA DE FÚTBOL RÁPIDO • ADHLER SPORTS PARTNER</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? item.activeClass
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {isAdmin && (
              <button
                id="nav-link-admin"
                onClick={() => setCurrentPage('admin')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === 'admin'
                    ? 'bg-adhler-orange text-white shadow-[0_0_15px_rgba(237,112,56,0.4)]'
                    : 'text-adhler-orange border border-adhler-orange/30 hover:bg-adhler-orange/10'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-adhler-blue/20 px-3 py-1.5 rounded-xl border border-adhler-cyan/15">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-adhler-orange animate-pulse' : 'bg-adhler-cyan'}`} />
                  <span className="text-xs font-mono text-adhler-cyan uppercase max-w-[120px] truncate">{isAdmin ? 'ADMIN' : user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-adhler-red-light transition-colors p-1 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-admin-login-trigger"
                onClick={() => {
                  setIsRegisterMode(false);
                  setIsLoginOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-800 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:border-adhler-orange/40 transition-colors duration-200 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ingresar / Registro</span>
              </button>
            )}
            <button
              onClick={() => setCurrentPage('reservas')}
              className="bg-adhler-orange hover:bg-adhler-orange-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(237,112,56,0.3)] cursor-pointer"
            >
              Reservar Online
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {!user && (
              <button
                onClick={() => {
                  setIsRegisterMode(false);
                  setIsLoginOpen(true);
                }}
                className="text-gray-400 hover:text-white p-2"
                title="Ingresar o Registrarse"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-adhler-cyan/20 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? item.activeClass
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentPage('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-left text-sm font-bold ${
                currentPage === 'admin'
                  ? 'bg-adhler-orange text-white shadow-[0_0_15px_rgba(237,112,56,0.35)]'
                  : 'text-adhler-orange border border-adhler-orange/20'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Panel de Administración</span>
            </button>
          )}

          {user ? (
            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 text-adhler-red-light hover:bg-[#D53C2E]/10 rounded-xl text-left text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión ({user.name.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setIsLoginOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-white rounded-xl text-left text-sm font-medium cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Ingresar / Registro</span>
            </button>
          )}
          
          <button
            onClick={() => {
              setCurrentPage('reservas');
              setIsMobileMenuOpen(false);
            }}
            className="w-full bg-adhler-orange hover:bg-adhler-orange-dark text-white font-semibold text-center py-3 rounded-xl block shadow-[0_4px_12px_rgba(237,112,56,0.3)]"
          >
            Reservar Cancha Online
          </button>
        </div>
      )}

      {/* Account Signup/Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-8 rounded-2xl glass-panel border border-adhler-cyan/20 shadow-[0_0_50px_rgba(237,112,56,0.15)] animate-scaleIn">
            
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center bg-adhler-orange/15 border border-adhler-orange/25 p-3 rounded-xl mb-3">
                <Lock className="w-6 h-6 text-adhler-orange" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                {isRegisterMode ? 'Crear Cuenta' : 'Ingreso Futbolista'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isRegisterMode 
                  ? 'Regístrate para calificar canchas, registrar tus escuadras y guardar tus reservas.' 
                  : 'Ingresa para agendar, calificar canchas y ver tus estadísticas deportistas.'}
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex bg-black/30 p-1 rounded-xl mb-4 border border-adhler-cyan/15 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer ${
                  !isRegisterMode ? 'bg-[#ED7038] text-white' : 'text-gray-400'
                }`}
              >
                Iniciando Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer ${
                  isRegisterMode ? 'bg-[#ED7038] text-white' : 'text-gray-400'
                }`}
              >
                Registrar Cuenta
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-gray-400 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full bg-[#1e2530] text-white text-xs font-medium px-4 py-3 rounded-xl border border-gray-800 focus:border-adhler-orange focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-gray-400 mb-1">Teléfono Móvil</label>
                    <input
                      type="tel"
                      placeholder="Ej. +52 55 1234 5678"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full bg-[#1e2530] text-white text-xs font-medium px-4 py-3 rounded-xl border border-gray-800 focus:border-adhler-orange focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-gray-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="futbolista@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1e2530] text-white text-xs font-medium px-4 py-3 rounded-xl border border-gray-800 focus:border-adhler-orange focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold text-gray-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e2530] text-white text-xs font-medium px-4 py-3 rounded-xl border border-gray-800 focus:border-adhler-orange focus:outline-none transition-colors"
                  required
                />
              </div>

              {loginError && (
                <div className="text-xs text-red-400 bg-red-950/25 border border-red-900/30 px-3 py-2.5 rounded-lg">
                  {loginError}
                </div>
              )}

              {!isRegisterMode && email.toLowerCase() === 'admin@canchafutbol.com' && (
                <div className="p-3 bg-semibold bg-adhler-orange/5 rounded-xl border border-adhler-orange/10 text-[10px] text-adhler-orange/85 leading-relaxed font-mono">
                  <span className="font-bold uppercase text-adhler-orange">Acceso Admin de Prueba:</span><br />
                  Email: admin@canchafutbol.com / Pass: admin
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-adhler-orange hover:bg-adhler-orange/90 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl shadow-[0_4px_12px_rgba(237,112,56,0.3)] transition-all cursor-pointer font-sans"
              >
                {isLoading ? 'Procesando...' : isRegisterMode ? 'Registrarme' : 'Ingresar'}
              </button>
            </form>

          </div>
        </div>
      )}
    </header>
  );
}
