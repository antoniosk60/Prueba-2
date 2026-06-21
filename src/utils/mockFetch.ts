/**
 * MOCK FETCH INTERCEPTOR FOR CLIENT-ONLY STANDALONE ARCHITECTURE
 * All database states are loaded from and persisted to the browser's localStorage.
 * No backend server or Google Cloud required. Perfect for GitHub Pages or static host deployments.
 */

import { User, Reservation, Payment, Promotion, Photo, Video, FieldConfig, Team, Player, Review } from '../types';

// Pre-configured Field Prices and Configs (matching the DB store)
const STATIC_FIELDS: FieldConfig[] = [
  {
    id: 'cancha-1',
    name: 'Cancha 1 (Techada Premium)',
    description: 'Pasto sintético de fibra larga, techada, con gradería y marcador electrónico.',
    basePricePerHour: 600, // MXN (Pesos)
    lightPriceSurcharge: 100, // +100 MXN / Hr with lighting
    nightHoursStart: 18, // 6:00 PM onwards requires light
    imageUrl: '/src/assets/images/FB_IMG_1780559862787.jpg'
  },
  {
    id: 'cancha-2',
    name: 'Cancha 2 (No Techada)',
    description: 'Excelente drenaje, ideal para el juego nocturno bajo las estrellas.',
    basePricePerHour: 450,
    lightPriceSurcharge: 80,
    nightHoursStart: 18,
    imageUrl: '/src/assets/images/FB_IMG_1780559843055.jpg'
  },
  {
    id: 'cancha-3',
    name: 'Cancha 3 (Fútbol 5 Indoor)',
    description: 'Paredes activas para un juego rápido y dinámico y sin saques de banda.',
    basePricePerHour: 350,
    lightPriceSurcharge: 50,
    nightHoursStart: 18,
    imageUrl: '/src/assets/images/FB_IMG_1780559839899.jpg'
  }
];

// Seed/Initial Data
const DEFAULT_LOGS = [
  {
    id: "log-1",
    adminName: "Administrador Complejo",
    role: "owner",
    actionType: "CONFIG_CANCHA",
    actionDetails: "Se actualizó la configuración de iluminación para Cancha 1",
    timestamp: new Date(Date.now() - 36 * 60 * 1000).toISOString()
  },
  {
    id: "log-2",
    adminName: "Gerardo Medina",
    role: "receptionist",
    actionType: "CREAR_RESERVA",
    actionDetails: "Nueva reserva creada en caja para Carlos Mendoza",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'admin-01',
    name: 'Administrador Complejo',
    email: 'admin@canchafutbol.com',
    phone: '+525512345678',
    role: 'admin'
  },
  {
    id: 'user-01',
    name: 'Carlos Mendoza',
    email: 'carlos@gmail.com',
    phone: '+525598765432',
    role: 'user'
  }
];

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "res-01",
    userId: "user-01",
    userName: "Carlos Mendoza",
    userEmail: "carlos@gmail.com",
    userPhone: "+525598765432",
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: "19:00 - 20:00",
    duration: 1,
    fieldId: "cancha-1",
    fieldName: "Cancha 1 (Techada Premium)",
    hasLights: true,
    extras: { balls: true, bibs: true, referee: false },
    totalPrice: 700, // 600 + 100 lights
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-02",
    userId: "user-01",
    userName: "Carlos Mendoza",
    userEmail: "carlos@gmail.com",
    userPhone: "+525598765432",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    timeSlot: "18:00 - 19:30",
    duration: 1.5,
    fieldId: "cancha-2",
    fieldName: "Cancha 2 (No Techada)",
    hasLights: true,
    extras: { balls: false, bibs: true, referee: true },
    totalPrice: 975,
    status: "pending",
    paymentStatus: "pending",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "pay-01",
    reservationId: "res-01",
    amount: 700,
    paymentMethod: "stripe",
    transactionId: "ch_stripe_mock_8172635",
    status: "completed",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-01',
    title: 'Lunes Futbolero',
    description: '20% de descuento en alquiler de canchas de lunes a miércoles antes de las 17:00 Hrs.',
    discountPercentage: 20,
    promoCode: 'LUNESFUT',
    validUntil: '2026-12-31',
    isActive: true,
    type: 'discount'
  },
  {
    id: 'promo-02',
    title: 'Torneo de Verano Nocturno 2026',
    description: '¡Inscríbete ya con tu escuadra! Copa Nocturna de Fútbol Rápido con grandes premios en efectivo. Inicio en Junio.',
    discountPercentage: 0,
    promoCode: 'COPANOCTURNA',
    validUntil: '2026-06-30',
    isActive: true,
    type: 'tournament'
  },
  {
    id: 'promo-03',
    title: 'Descuento Estudiantes',
    description: 'Muestra tu credencial escolar vigente y obtén un 15% de descuento directo en tus horas agendadas.',
    discountPercentage: 15,
    promoCode: 'ALUMNOS',
    validUntil: '2026-12-31',
    isActive: true,
    type: 'discount'
  }
];

const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'photo-tribol-logo',
    url: '/src/assets/images/tribol_logo_1780556302100.png',
    caption: 'Escudo e Identidad Visual Oficial de Fútbol Rápido Tribol',
    category: 'facilities',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-mvp-boy',
    url: '/src/assets/images/mvp_boy_trophy_1780307479148.png',
    caption: 'Goleador Estrella Juvenil recibiendo trofeo MVP de la semana en la cancha techada',
    category: 'events',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-copa-campeones',
    url: '/src/assets/images/copa_campeones_celebration_1780307492915.png',
    caption: 'Ceremonia de campeón de liga con trofeo de oro y lluvia de confeti',
    category: 'events',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-pina-card',
    url: '/src/assets/images/pina_goal_card_1780307507932.png',
    caption: 'Tarjeta coleccionable MVP ¡GOOOOOL! de E. "Piña" López del club Barcelona',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-1',
    url: '/src/assets/images/FB_IMG_1780559851100.jpg',
    caption: 'Encuentros intensos bajo iluminación LED profesional',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-2',
    url: '/src/assets/images/FB_IMG_1780559862787.jpg',
    caption: 'Cancha Principal Techada con Pasto Sintético Premium',
    category: 'facilities',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-1',
    url: '/src/assets/images/FB_IMG_1780559831023.jpg',
    caption: 'Acción de alta intensidad en los costados de la cancha',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-2',
    url: '/src/assets/images/FB_IMG_1780559832822.jpg',
    caption: 'El silbatazo inicial de nuestra liguilla estelar',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-3',
    url: '/src/assets/images/FB_IMG_1780559839899.jpg',
    caption: 'Jugadas de pared en las bandas del complejo Tribol',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-4',
    url: '/src/assets/images/FB_IMG_1780559843055.jpg',
    caption: 'Cierre defensivo espectacular bajo la luz de los reflectores',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-5',
    url: '/src/assets/images/FB_IMG_1780559845797.jpg',
    caption: 'Control de balón excelso en media cancha',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-6',
    url: '/src/assets/images/FB_IMG_1780559849041.jpg',
    caption: 'Disparo potente directo al ángulo',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-7',
    url: '/src/assets/images/FB_IMG_1780559851100.jpg',
    caption: 'La adrenalina del fútbol rápido al límite',
    category: 'matches',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-8',
    url: '/src/assets/images/FB_IMG_1780559854193.jpg',
    caption: 'Escuadras listas para saltar a la cancha',
    category: 'events',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-9',
    url: '/src/assets/images/FB_IMG_1780559856795.jpg',
    caption: 'Público apasionado alentando en la grada Tribol',
    category: 'facilities',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-10',
    url: '/src/assets/images/FB_IMG_1780559858433.jpg',
    caption: 'Celebración eufórica tras el gol del campeonato',
    category: 'events',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-11',
    url: '/src/assets/images/FB_IMG_1780559860027.jpg',
    caption: 'Entrega del trofeo de Goleador de la Temporada',
    category: 'events',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-12',
    url: '/src/assets/images/FB_IMG_1780559861640.jpg',
    caption: 'Los capitanes compartiendo un saludo deportivo',
    category: 'events',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-13',
    url: '/src/assets/images/FB_IMG_1780559862787.jpg',
    caption: 'Imponente vista de la cancha techada número 1',
    category: 'facilities',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'photo-fb-14',
    url: '/src/assets/images/FB_IMG_1780559864592.jpg',
    caption: 'Noche de fútbol rápido con familias completas en Tribol',
    category: 'events',
    uploadedAt: new Date().toISOString()
  }
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-01',
    name: 'Galeones F.C.',
    color: 'Azul y Negro',
    captainContact: 'Adrián Perea (+5255392817)',
    goalsFor: 23,
    gamesPlayed: 8,
    gamesWon: 5,
    gamesDrawn: 1,
    gamesLost: 2,
    goalsAgainst: 15,
    points: 16,
    form: ['G', 'E', 'P', 'G', 'G'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'team-02',
    name: 'Deportivo Cuervos',
    color: 'Negro Mate',
    captainContact: 'Hugo Sánchez (+5255483921)',
    goalsFor: 19,
    gamesPlayed: 8,
    gamesWon: 4,
    gamesDrawn: 0,
    gamesLost: 4,
    goalsAgainst: 18,
    points: 12,
    form: ['P', 'G', 'P', 'G', 'P'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'team-03',
    name: 'Titanes del Rápido',
    color: 'Verde Eléctrico',
    captainContact: 'Mateo Reyes (+5255741829)',
    goalsFor: 31,
    gamesPlayed: 8,
    gamesWon: 6,
    gamesDrawn: 1,
    gamesLost: 1,
    goalsAgainst: 14,
    points: 19,
    form: ['G', 'G', 'E', 'G', 'P'],
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player-01',
    teamId: 'team-01',
    name: 'Adrián Perea',
    age: 27,
    position: 'Defensa (C)',
    contact: '+5255392817',
    goals: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-02',
    teamId: 'team-01',
    name: 'Santiago López',
    age: 24,
    position: 'Medio',
    contact: '+5255849301',
    goals: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-03',
    teamId: 'team-01',
    name: 'Daniel Ortiz',
    age: 26,
    position: 'Delantero',
    contact: '+5255319203',
    goals: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-04',
    teamId: 'team-02',
    name: 'Hugo Sánchez Jr',
    age: 23,
    position: 'Delantero (C)',
    contact: '+5255483921',
    goals: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-05',
    teamId: 'team-02',
    name: 'Gerardo Torrado',
    age: 29,
    position: 'Defensa',
    contact: '+5255938472',
    goals: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-06',
    teamId: 'team-03',
    name: 'Mateo Reyes',
    age: 25,
    position: 'Medio (C)',
    contact: '+5255741829',
    goals: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-07',
    teamId: 'team-03',
    name: 'Esteban Paredes',
    age: 28,
    position: 'Delantero',
    contact: '+5255019283',
    goals: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-08',
    teamId: 'team-03',
    name: 'Chuy Corona',
    age: 31,
    position: 'Portero',
    contact: '+5255374829',
    goals: 0,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    fieldId: 'cancha-1',
    fieldName: 'Cancha 1 (Techada Premium)',
    userId: 'user-01',
    userName: 'Carlos Mendoza',
    userEmail: 'carlos@gmail.com',
    rating: 5,
    comment: '¡Excelente pasto sintético! La iluminación LED es de primer nivel para jugar de noche.',
    reply: 'Muchas gracias Carlos, nos alegra saber que disfrutaste la experiencia nocturna en Fútbol Rápido Tribol.',
    status: 'approved',
    reservationId: 'res-01',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-02',
    fieldId: 'cancha-2',
    fieldName: 'Cancha 2 (No Techada)',
    userId: 'user-01',
    userName: 'Carlos Mendoza',
    userEmail: 'carlos@gmail.com',
    rating: 4,
    comment: 'Una cancha fantástica para jugar por la tarde. Solo faltan reparar unas redes de la portería.',
    status: 'pending',
    reservationId: 'res-02',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_VIDEOS = [
  {
    id: 'vid-live-1',
    title: '🔴 TRANSMISIÓN EN VIVO: Final de Copa Femenil - Real Madrid vs España',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-playing-soccer-in-the-rain-40348-large.mp4',
    thumbnailUrl: '/src/assets/images/FB_IMG_1780559832822.jpg',
    category: 'live',
    isLive: true,
    views: 184,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'vid-highlight-1',
    title: 'Resumen Semanal: Goles de Antología - Jornada 10 (Sabatina)',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-the-ball-in-stadium-40356-large.mp4',
    thumbnailUrl: '/src/assets/images/FB_IMG_1780559849041.jpg',
    category: 'highlight',
    isLive: false,
    views: 742,
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'vid-match-2',
    title: 'Partido Completo: Barcelona vs FC San Pancho - Final Nuevos Valores',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-hitting-the-net-40347-large.mp4',
    thumbnailUrl: '/src/assets/images/FB_IMG_1780559845797.jpg',
    category: 'full_match',
    isLive: false,
    views: 1250,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper functions for LocalStorage management
function initLocalStorage() {
  if (!localStorage.getItem('tb_users')) {
    localStorage.setItem('tb_users', JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem('tb_reservations')) {
    localStorage.setItem('tb_reservations', JSON.stringify(INITIAL_RESERVATIONS));
  }
  if (!localStorage.getItem('tb_payments')) {
    localStorage.setItem('tb_payments', JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem('tb_promotions')) {
    localStorage.setItem('tb_promotions', JSON.stringify(INITIAL_PROMOTIONS));
  }
  if (!localStorage.getItem('tb_photos')) {
    localStorage.setItem('tb_photos', JSON.stringify(INITIAL_PHOTOS));
  }
  if (!localStorage.getItem('tb_videos')) {
    localStorage.setItem('tb_videos', JSON.stringify(INITIAL_VIDEOS));
  }
  if (!localStorage.getItem('tb_teams')) {
    localStorage.setItem('tb_teams', JSON.stringify(INITIAL_TEAMS));
  }
  if (!localStorage.getItem('tb_players')) {
    localStorage.setItem('tb_players', JSON.stringify(INITIAL_PLAYERS));
  }
  if (!localStorage.getItem('tb_reviews')) {
    localStorage.setItem('tb_reviews', JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem('tb_fields')) {
    localStorage.setItem('tb_fields', JSON.stringify(STATIC_FIELDS));
  }
  if (!localStorage.getItem('tb_prices')) {
    localStorage.setItem('tb_prices', JSON.stringify([]));
  }
  if (!localStorage.getItem('tb_logs')) {
    localStorage.setItem('tb_logs', JSON.stringify(DEFAULT_LOGS));
  }
}

// Initalize storage immediately upon script loading
initLocalStorage();

// Getters and Setters helpers
const getCollection = <T>(key: string): T[] => {
  return JSON.parse(localStorage.getItem(key) || '[]') as T[];
};

const setCollection = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const createResponse = (body: any, status: number = 200, statusText: string = 'OK') => {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' }
  });
};

const addLog = (adminName: string, role: string, actionType: string, actionDetails: string) => {
  const logs = getCollection<any>('tb_logs');
  logs.unshift({
    id: `log-${Date.now()}`,
    adminName,
    role,
    actionType,
    actionDetails,
    timestamp: new Date().toISOString()
  });
  setCollection('tb_logs', logs.slice(0, 100)); // Limit to last 100 logs
};

const originalFetch = window.fetch;

// Hijack window.fetch globally to intercept API requests
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);

  // If request is not towards /api, let it fall back to real network fetch
  if (!urlString.includes('/api/')) {
    return originalFetch.apply(this, arguments as any);
  }

  // Parse path and query
  const parsedUrl = new URL(urlString, window.location.origin);
  const path = parsedUrl.pathname;
  const method = init?.method?.toUpperCase() || 'GET';
  const getBody = () => (init?.body ? JSON.parse(init.body as string) : {});

  // Simulate network delay for realistic rendering and loader feel
  await new Promise((resolve) => setTimeout(resolve, 80));

  try {
    // 1. AUTH ENDPOINTS
    if (path === '/api/auth/login') {
      const { email, password } = getBody();
      const users = getCollection<User>('tb_users');
      // Simple verification bypass
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser) {
        return createResponse({
          token: `mock-jwt-client-${foundUser.id}-${Date.now()}`,
          user: foundUser
        });
      } else if (email === 'admin@canchafutbol.com' || password === 'admin') {
        const adminUser: User = {
          id: 'admin-01',
          name: 'Administrador Complejo',
          email: 'admin@canchafutbol.com',
          phone: '+525512345678',
          role: 'admin'
        };
        return createResponse({
          token: `mock-jwt-client-admin-01-${Date.now()}`,
          user: adminUser
        });
      } else {
        // Create mock user profile on-the-fly to support guest playground login
        const newGuest: User = {
          id: `user-${Date.now().toString().slice(-4)}`,
          name: email.split('@')[0],
          email,
          phone: '+5255000000',
          role: email.includes('admin') ? 'admin' : 'user'
        };
        users.push(newGuest);
        setCollection('tb_users', users);

        return createResponse({
          token: `mock-jwt-client-${newGuest.id}-${Date.now()}`,
          user: newGuest
        });
      }
    }

    if (path === '/api/auth/register') {
      const { name, email, phone } = getBody();
      const users = getCollection<User>('tb_users');
      
      const newUser: User = {
        id: `user-${Date.now().toString().slice(-4)}`,
        name,
        email,
        phone,
        role: email.includes('admin') ? 'admin' : 'user'
      };
      
      users.push(newUser);
      setCollection('tb_users', users);
      
      return createResponse({
        token: `mock-jwt-client-${newUser.id}-${Date.now()}`,
        user: newUser
      });
    }

    // 2. FIELDS ENDPOINTS
    if (path === '/api/fields') {
      const fields = getCollection<FieldConfig>('tb_fields');
      return createResponse(fields);
    }

    if (path.startsWith('/api/fields/')) {
      const id = path.split('/').pop();
      const fields = getCollection<FieldConfig>('tb_fields');
      if (method === 'PUT') {
        const updatedBody = getBody();
        const updatedFields = fields.map(f => f.id === id ? { ...f, ...updatedBody } : f);
        setCollection('tb_fields', updatedFields);
        addLog("Administrador", "owner", "CONFIG_CANCHA", `Se modificaron los precios/configuración de la cancha ${id}`);
        return createResponse({ success: true, field: updatedBody });
      }
    }

    // 3. ADMIN PRICES RULES ENDPOINTS
    if (path === '/api/admin/prices') {
      if (method === 'GET') {
        const prices = getCollection<any>('tb_prices');
        return createResponse(prices);
      }
      if (method === 'POST') {
        const newRule = getBody();
        const prices = getCollection<any>('tb_prices');
        newRule.id = `rule-${Date.now()}`;
        prices.push(newRule);
        setCollection('tb_prices', prices);
        addLog("Administrador", "owner", "PRECIO_DINAMICO", `Se creó regla de tarifa para ${newRule.dayOfWeek}`);
        return createResponse(newRule);
      }
    }

    if (path.startsWith('/api/admin/prices/')) {
      const id = path.split('/').pop();
      if (method === 'DELETE') {
        const prices = getCollection<any>('tb_prices');
        setCollection('tb_prices', prices.filter(p => p.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_PRECIO", `Se eliminó regla de precio dinámico (${id})`);
        return createResponse({ success: true });
      }
    }

    // 4. RESERVATIONS ENDPOINTS
    if (path === '/api/reservations') {
      const reservations = getCollection<Reservation>('tb_reservations');
      if (method === 'GET') {
        return createResponse(reservations);
      }
      if (method === 'POST') {
        const newRes = getBody();
        newRes.id = `res-${Date.now().toString().slice(-4)}`;
        newRes.createdAt = new Date().toISOString();
        reservations.push(newRes);
        setCollection('tb_reservations', reservations);
        
        // Also automatically trigger log & mock payment registration if paid on submission
        if (newRes.paymentStatus === 'paid') {
          const payments = getCollection<Payment>('tb_payments');
          payments.push({
            id: `pay-${Date.now()}`,
            reservationId: newRes.id,
            amount: newRes.totalPrice,
            paymentMethod: 'stripe',
            transactionId: `stripe_${Math.floor(Math.random() * 9000000 + 1000000)}`,
            status: 'completed',
            createdAt: new Date().toISOString()
          });
          setCollection('tb_payments', payments);
        }
        
        addLog("Capitán/Sistema", "receptionist", "CREAR_RESERVA", `Nueva reservación hecha para jugador ${newRes.userName} (${newRes.id})`);
        return createResponse(newRes);
      }
    }

    if (path.startsWith('/api/reservations/')) {
      const id = path.split('/').pop();
      const reservations = getCollection<Reservation>('tb_reservations');
      
      if (method === 'PUT') {
        const updatedBody = getBody();
        const updatedReservations = reservations.map(r => {
          if (r.id === id) {
            const merged = { ...r, ...updatedBody };
            // If transitioned to paid, ensure payment logging
            if (updatedBody.paymentStatus === 'paid' && r.paymentStatus !== 'paid') {
              const payments = getCollection<Payment>('tb_payments');
              payments.push({
                id: `pay-${Date.now()}`,
                reservationId: id!,
                amount: merged.totalPrice,
                paymentMethod: 'cash',
                transactionId: `cash_${Math.floor(Math.random() * 9000000 + 1000000)}`,
                status: 'completed',
                createdAt: new Date().toISOString()
              });
              setCollection('tb_payments', payments);
            }
            return merged;
          }
          return r;
        });
        setCollection('tb_reservations', updatedReservations);
        addLog("Administrador", "receptionist", "EDITAR_RESERVA", `Se actualizó estatus/datos de reserva folio ${id}`);
        return createResponse({ success: true });
      }

      if (method === 'DELETE') {
        setCollection('tb_reservations', reservations.filter(r => r.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_RESERVA", `Cancelación definitiva de reserva folio ${id}`);
        return createResponse({ success: true });
      }
    }

    // 5. PAYMENTS ENDPOINTS
    if (path === '/api/payments') {
      const payments = getCollection<Payment>('tb_payments');
      if (method === 'GET') {
        return createResponse(payments);
      }
      if (method === 'POST') {
        const body = getBody();
        body.id = `pay-${Date.now()}`;
        body.createdAt = new Date().toISOString();
        payments.push(body);
        setCollection('tb_payments', payments);
        addLog("Caja de Recepción", "receptionist", "LIQUIDAR_CONTRATO", `Liquidación de canchas registrada - ${body.amount} MXN`);
        return createResponse(body);
      }
    }

    // 6. PROMOTIONS ENDPOINTS
    if (path === '/api/promotions' || path === '/api/promotions/all') {
      const promotions = getCollection<Promotion>('tb_promotions');
      return createResponse(promotions);
    }

    if (path.startsWith('/api/promotions/')) {
      const id = path.split('/').pop();
      const promotions = getCollection<Promotion>('tb_promotions');
      
      if (id && path.endsWith('/toggle')) {
        const promoId = path.split('/')[3];
        const toggled = promotions.map(p => p.id === promoId ? { ...p, isActive: !p.isActive } : p);
        setCollection('tb_promotions', toggled);
        addLog("Administrador", "receptionist", "CONFIG_PROMOS", `Toggle estado de promoción (${promoId})`);
        return createResponse({ success: true });
      }

      if (method === 'DELETE') {
        setCollection('tb_promotions', promotions.filter(p => p.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_PROMO", `Se eliminó la promoción ${id}`);
        return createResponse({ success: true });
      }

      if (method === 'POST' || method === 'PUT') {
        const promoData = getBody();
        const index = promotions.findIndex(p => p.id === id);
        if (index > -1) {
          promotions[index] = { ...promotions[index], ...promoData };
        } else {
          promoData.id = id === 'promotions' || !id ? `promo-${Date.now()}` : id;
          promotions.push(promoData);
        }
        setCollection('tb_promotions', promotions);
        addLog("Administrador", "owner", "CREAR_PROMO", `Promoción salvada exitosamente - ${promoData.title}`);
        return createResponse({ success: true });
      }
    }

    // 7. GALLERY PHOTOS ENDPOINTS
    if (path === '/api/gallery') {
      const photos = getCollection<Photo>('tb_photos');
      if (method === 'GET') {
        return createResponse(photos);
      }
      if (method === 'POST') {
        const photo = getBody();
        photo.id = `photo-${Date.now()}`;
        photo.uploadedAt = new Date().toISOString();
        photos.push(photo);
        setCollection('tb_photos', photos);
        addLog("Administrador", "owner", "REGISTRO_GALERIA", `Se subió nueva fotografía: ${photo.caption}`);
        return createResponse(photo);
      }
    }

    if (path.startsWith('/api/gallery/')) {
      const id = path.split('/').pop();
      if (method === 'DELETE') {
        const photos = getCollection<Photo>('tb_photos');
        setCollection('tb_photos', photos.filter(p => p.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_GALERIA", `Eliminación de archivo gráfico de la galería`);
        return createResponse({ success: true });
      }
    }

    // 8. GALLERY VIDEOS ENDPOINTS
    if (path === '/api/videos') {
      const videos = getCollection<Video>('tb_videos');
      if (method === 'GET') {
        return createResponse(videos);
      }
      if (method === 'POST') {
        const video = getBody();
        video.id = `vid-${Date.now()}`;
        video.uploadedAt = new Date().toISOString();
        video.views = Math.floor(Math.random() * 20 + 2);
        videos.push(video);
        setCollection('tb_videos', videos);
        addLog("Administrador", "owner", "SUBIR_VIDEO", `Se ligó transmisión/multimedia: ${video.title}`);
        return createResponse(video);
      }
    }

    if (path.startsWith('/api/videos/')) {
      const id = path.split('/').pop();
      const videos = getCollection<Video>('tb_videos');
      if (method === 'PUT') {
        const updatedBody = getBody();
        setCollection('tb_videos', videos.map(v => v.id === id ? { ...v, ...updatedBody } : v));
        return createResponse({ success: true });
      }
      if (method === 'DELETE') {
        setCollection('tb_videos', videos.filter(v => v.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_VIDEO", `Se desvinculó videoID ${id}`);
        return createResponse({ success: true });
      }
    }

    // 9. TEAMS ROSTER ENDPOINTS
    if (path === '/api/teams') {
      const teams = getCollection<Team>('tb_teams');
      if (method === 'GET') {
        return createResponse(teams);
      }
      if (method === 'POST') {
        const team = getBody();
        team.id = `team-${Date.now()}`;
        team.createdAt = new Date().toISOString();
        teams.push(team);
        setCollection('tb_teams', teams);
        addLog("Administrador", "receptionist", "CREAR_EQUIPO", `Roster registrado: ${team.name}`);
        return createResponse(team);
      }
    }

    if (path.startsWith('/api/teams/')) {
      const id = path.split('/').pop();
      const teams = getCollection<Team>('tb_teams');
      if (method === 'PUT') {
        const updatedBody = getBody();
        setCollection('tb_teams', teams.map(t => t.id === id ? { ...t, ...updatedBody } : t));
        return createResponse({ success: true });
      }
      if (method === 'DELETE') {
        setCollection('tb_teams', teams.filter(t => t.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_EQUIPO", `Se removió escuadra (${id})`);
        return createResponse({ success: true });
      }
    }

    // 10. PLAYERS REGISTRY ENDPOINTS
    if (path === '/api/players') {
      const players = getCollection<Player>('tb_players');
      if (method === 'GET') {
        return createResponse(players);
      }
      if (method === 'POST') {
        const player = getBody();
        player.id = `player-${Date.now()}`;
        player.createdAt = new Date().toISOString();
        players.push(player);
        setCollection('tb_players', players);
        return createResponse(player);
      }
    }

    if (path.startsWith('/api/players/')) {
      const id = path.split('/').pop();
      const players = getCollection<Player>('tb_players');
      if (method === 'PUT') {
        const updatedBody = getBody();
        setCollection('tb_players', players.map(p => p.id === id ? { ...p, ...updatedBody } : p));
        return createResponse({ success: true });
      }
      if (method === 'DELETE') {
        setCollection('tb_players', players.filter(p => p.id !== id));
        return createResponse({ success: true });
      }
    }

    // 11. REVIEWS & COMMENTS ENDPOINTS
    if (path === '/api/reviews') {
      const reviews = getCollection<Review>('tb_reviews');
      if (method === 'GET') {
        // Publicly we only return approved ones
        return createResponse(reviews.filter(r => r.status === 'approved'));
      }
      if (method === 'POST') {
        const rBody = getBody();
        const newReview: Review = {
          id: `rev-${Date.now()}`,
          fieldId: rBody.fieldId,
          fieldName: rBody.fieldName || 'Cancha General',
          userId: rBody.userId || 'guest',
          userName: rBody.userName || 'Usuario Anónimo',
          userEmail: rBody.userEmail || '',
          rating: rBody.rating || 5,
          comment: rBody.comment || '',
          status: 'pending', // Requires admin moderation
          reservationId: rBody.reservationId || '',
          createdAt: new Date().toISOString()
        };
        const reviews = getCollection<Review>('tb_reviews');
        reviews.push(newReview);
        setCollection('tb_reviews', reviews);
        return createResponse({ success: true, review: newReview });
      }
    }

    if (path === '/api/reviews/admin') {
      const reviews = getCollection<Review>('tb_reviews');
      return createResponse(reviews);
    }

    if (path.startsWith('/api/reviews/')) {
      const parts = path.split('/');
      const id = parts[3];
      const reviews = getCollection<Review>('tb_reviews');

      if (path.endsWith('/moderate')) {
        const { status } = getBody();
        const updated = reviews.map(r => r.id === id ? { ...r, status } : r);
        setCollection('tb_reviews', updated);
        addLog("Administrador", "receptionist", "MODERAR_OPINION", `Puntuación/Comentario folio ${id} cambiada a ${status}`);
        return createResponse({ success: true });
      }

      if (path.endsWith('/reply')) {
        const { reply } = getBody();
        const updated = reviews.map(r => r.id === id ? { ...r, reply } : r);
        setCollection('tb_reviews', updated);
        addLog("Administrador", "receptionist", "RESPONDER_OPINION", `Se emitió respuesta para la opinión ${id}`);
        return createResponse({ success: true });
      }

      if (method === 'DELETE') {
        setCollection('tb_reviews', reviews.filter(r => r.id !== id));
        addLog("Administrador", "owner", "ELIMINAR_OPINION", `Se barrió comentario o feedback en bloque`);
        return createResponse({ success: true });
      }
    }

    // 12. GENERAL STATS ENDPOINT
    if (path === '/api/stats') {
      const reservations = getCollection<Reservation>('tb_reservations');
      const teams = getCollection<Team>('tb_teams');
      const players = getCollection<Player>('tb_players');
      const reviews = getCollection<Review>('tb_reviews');
      const logs = getCollection<any>('tb_logs');

      // Calculate stats live
      const totalRevenue = reservations
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + r.totalPrice, 0);

      const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
      const avgReviewRating = reviews.length > 0 
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 4.8;

      return createResponse({
        totalRevenue,
        totalReservations: reservations.length,
        confirmedReservations,
        totalTeams: teams.length,
        totalPlayers: players.length,
        totalReviews: reviews.length,
        avgReviewRating,
        recentLogs: logs.slice(0, 8),
        demographics: {
          youth: 45,
          adults: 110,
          veterans: 30
        }
      });
    }

    // Default Fallback
    return createResponse({ message: `Route ${path} matches mockup interceptor but is unhandled.` }, 404, 'Not Found');
  } catch (error: any) {
    console.error('[MOCK FETCH ERROR]:', error);
    return createResponse({ message: error.message || 'Interal Client Mock Sandbox Error' }, 500, 'Internal Server Error');
  }
};
