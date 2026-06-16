import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Reservation, Payment, Promotion, Photo, Video, FieldConfig, Team, Player, AppStats, Review } from '../src/types';
import { db, auth, authenticateServer } from './firebase';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const DB_FILE = path.join(process.cwd(), 'database_state.json');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('[FIRESTORE EXCEPTION ERROR]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Pre-configured Field Prices and Configs
export const FIELDS: FieldConfig[] = [
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

export interface DatabaseSchema {
  users: User[];
  reservations: Reservation[];
  payments: Payment[];
  promotions: Promotion[];
  photos: Photo[];
  videos: Video[];
  teams: Team[];
  players: Player[];
  reviews: Review[];
  fields?: FieldConfig[];
  dynamicPrices?: any[];
}

const JWT_SECRET = 'cancha_futbol_secreto_super_seguro_2026';

// Reusable JWT implementation using standard Node Crypto
export function signToken(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}

// Initial/Seed Data
const INITIAL_DATA: DatabaseSchema = {
  users: [
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
  ],
  reservations: [
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
  ],
  payments: [
    {
      id: "pay-01",
      reservationId: "res-01",
      amount: 700,
      paymentMethod: "stripe",
      transactionId: "ch_stripe_mock_8172635",
      status: "completed",
      createdAt: new Date().toISOString()
    }
  ],
  promotions: [
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
  ],
  photos: [
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
  ],
  teams: [
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
  ],
  players: [
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
  ],
  reviews: [
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
  ],
  videos: [
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
  ],
  fields: FIELDS,
  dynamicPrices: []
};

export class DbStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DATA };
    this.load();
    // Start server, authenticate with Firebase Auth, then synchronize with Firestore
    this.initializeAndSync().catch(err => {
      console.error('[FIRESTORE INITIALIZATION EXCEPTION]:', err);
    });
  }

  async initializeAndSync() {
    try {
      await authenticateServer();
    } catch (err) {
      console.error('[FIRESTORE INITIAL AUTH WARNING]: Failed to authenticate server with Firebase Auth. Operating locally or with guest access:', err);
    }
    await this.syncWithFirestore();
  }

  async syncWithFirestore() {
    console.log('[FIRESTORE] Synchronizing with cloud database...');
    const collections = [
      'users', 'reservations', 'payments', 'promotions', 'photos',
      'videos', 'teams', 'players', 'reviews', 'fields', 'dynamicPrices'
    ];

    let hasCloudData = false;

    for (const colName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, colName));
        if (!querySnapshot.empty) {
          hasCloudData = true;
          const docsList: any[] = [];
          querySnapshot.forEach(docSnap => {
            docsList.push({ id: docSnap.id, ...docSnap.data() });
          });
          
          console.log(`[FIRESTORE] Resolved ${docsList.length} documents for collection "${colName}"`);
          
          if (colName === 'users') this.data.users = docsList;
          else if (colName === 'reservations') this.data.reservations = docsList;
          else if (colName === 'payments') this.data.payments = docsList;
          else if (colName === 'promotions') this.data.promotions = docsList;
          else if (colName === 'photos') this.data.photos = docsList;
          else if (colName === 'videos') this.data.videos = docsList;
          else if (colName === 'teams') this.data.teams = docsList;
          else if (colName === 'players') this.data.players = docsList;
          else if (colName === 'reviews') this.data.reviews = docsList;
          else if (colName === 'fields') this.data.fields = docsList;
          else if (colName === 'dynamicPrices') this.data.dynamicPrices = docsList;
        }
      } catch (err) {
        console.error(`[FIRESTORE SYNC ERROR] Failed to load "${colName}":`, err);
      }
    }

    if (!hasCloudData) {
      console.log('[FIRESTORE] Cloud database is empty. Seeding with INITIAL_DATA...');
      await this.seedCloudDatabase();
    } else {
      this.save();
      console.log('[FIRESTORE SUCCESS]: Cached cloud database locally on disk.');
    }
  }

  async seedCloudDatabase() {
    const seedPairs = [
      { key: 'users', list: this.data.users },
      { key: 'reservations', list: this.data.reservations },
      { key: 'payments', list: this.data.payments },
      { key: 'promotions', list: this.data.promotions },
      { key: 'photos', list: this.data.photos },
      { key: 'videos', list: this.data.videos || [] },
      { key: 'teams', list: this.data.teams },
      { key: 'players', list: this.data.players },
      { key: 'reviews', list: this.data.reviews },
      { key: 'fields', list: this.getFields() },
      { key: 'dynamicPrices', list: this.getDynamicPrices() }
    ];

    for (const pair of seedPairs) {
      for (const item of pair.list) {
        try {
          const docRef = doc(db, pair.key, item.id);
          const { id, ...dataToSave } = item;
          await setDoc(docRef, dataToSave);
        } catch (err) {
          console.error(`[FIRESTORE SEED EXCEPTION] Error seeding item ${item.id} to col "${pair.key}":`, err);
        }
      }
      console.log(`[FIRESTORE SEEDED] Col "${pair.key}" seeded successfully.`);
    }
  }

  async saveToCloud(collectionName: string, documentId: string, item: any) {
    const path = `${collectionName}/${documentId}`;
    try {
      const docRef = doc(db, collectionName, documentId);
      const dataToSave = { ...item };
      await setDoc(docRef, dataToSave);
      console.log(`[FIRESTORE WRITE SUCCESS]: Wrote document to ${path}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  async deleteFromCloud(collectionName: string, documentId: string) {
    const path = `${collectionName}/${documentId}`;
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      console.log(`[FIRESTORE DELETE SUCCESS]: Deleted document from ${path}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure teams and players arrays exist for backward compatibility with older json
        const loadedPlayers = (parsed.players || INITIAL_DATA.players).map((p: any) => {
          if (p.goals === undefined) {
            const goalMapping: Record<string, number> = {
              'Adrián Perea': 5,
              'Santiago López': 3,
              'Daniel Ortiz': 12,
              'Hugo Sánchez Jr': 15,
              'Gerardo Torrado': 2,
              'Mateo Reyes': 8,
              'Esteban Paredes': 18,
              'Chuy Corona': 0
            };
            return {
              ...p,
              goals: goalMapping[p.name] !== undefined ? goalMapping[p.name] : Math.floor(Math.random() * 8)
            };
          }
          return p;
        });

         const loadedTeams = (parsed.teams || INITIAL_DATA.teams).map((t: any) => {
           return {
             ...t,
             gamesPlayed: t.gamesPlayed !== undefined ? t.gamesPlayed : (t.id === 'team-01' ? 8 : t.id === 'team-02' ? 8 : t.id === 'team-03' ? 8 : 0),
             gamesWon: t.gamesWon !== undefined ? t.gamesWon : (t.id === 'team-01' ? 5 : t.id === 'team-02' ? 4 : t.id === 'team-03' ? 6 : 0),
             gamesDrawn: t.gamesDrawn !== undefined ? t.gamesDrawn : (t.id === 'team-01' ? 1 : t.id === 'team-02' ? 0 : t.id === 'team-03' ? 1 : 0),
             gamesLost: t.gamesLost !== undefined ? t.gamesLost : (t.id === 'team-01' ? 2 : t.id === 'team-02' ? 4 : t.id === 'team-03' ? 1 : 0),
             goalsAgainst: t.goalsAgainst !== undefined ? t.goalsAgainst : (t.id === 'team-01' ? 15 : t.id === 'team-02' ? 18 : t.id === 'team-03' ? 14 : 0),
             points: t.points !== undefined ? t.points : (t.id === 'team-01' ? 16 : t.id === 'team-02' ? 12 : t.id === 'team-03' ? 19 : 0),
             form: t.form !== undefined ? t.form : (t.id === 'team-01' ? ['G', 'E', 'P', 'G', 'G'] : t.id === 'team-02' ? ['P', 'G', 'P', 'G', 'P'] : t.id === 'team-03' ? ['G', 'G', 'E', 'G', 'P'] : [])
           };
         });

         this.data = {
          users: parsed.users || INITIAL_DATA.users,
          reservations: parsed.reservations || INITIAL_DATA.reservations,
          payments: parsed.payments || INITIAL_DATA.payments,
          promotions: parsed.promotions || INITIAL_DATA.promotions,
          photos: parsed.photos || INITIAL_DATA.photos,
          videos: parsed.videos || INITIAL_DATA.videos || [],
          teams: loadedTeams,
          players: loadedPlayers,
          reviews: parsed.reviews || INITIAL_DATA.reviews,
          fields: parsed.fields || INITIAL_DATA.fields,
          dynamicPrices: parsed.dynamicPrices || INITIAL_DATA.dynamicPrices || []
        };
        this.save();
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database file. Initializing default.', e);
      this.data = { ...INITIAL_DATA };
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file.', e);
    }
  }

  // --- Users Operations ---
  getUsers(): User[] {
    return this.data.users;
  }

  addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    this.saveToCloud('users', user.id, user).catch(err => console.error(err));
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Reservations Operations ---
  getReservations(): Reservation[] {
    return this.data.reservations;
  }

  addReservation(res: Reservation): Reservation {
    this.data.reservations.unshift(res); // Add to beginning
    this.save();
    this.saveToCloud('reservations', res.id, res).catch(err => console.error(err));
    return res;
  }

  updateReservationStatus(id: string, status: 'confirmed' | 'cancelled', paymentStatus?: 'pending' | 'paid', extraData?: Partial<Reservation>): Reservation | null {
    const res = this.data.reservations.find(r => r.id === id);
    if (!res) return null;
    if (status) res.status = status;
    if (paymentStatus) {
      res.paymentStatus = paymentStatus;
    }
    if (extraData) {
      Object.assign(res, extraData);
    }
    this.save();
    this.saveToCloud('reservations', res.id, res).catch(err => console.error(err));
    return res;
  }

  deleteReservation(id: string): boolean {
    const index = this.data.reservations.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.data.reservations.splice(index, 1);
    this.save();
    this.deleteFromCloud('reservations', id).catch(err => console.error(err));
    return true;
  }

  // --- Payments Operations ---
  getPayments(): Payment[] {
    return this.data.payments;
  }

  addPayment(pay: Payment): Payment {
    this.data.payments.push(pay);
    
    // Auto update reservation payment status
    const res = this.data.reservations.find(r => r.id === pay.reservationId);
    if (res) {
      res.paymentStatus = 'paid';
      res.status = 'confirmed';
      this.saveToCloud('reservations', res.id, res).catch(err => console.error(err));
    }

    this.save();
    this.saveToCloud('payments', pay.id, pay).catch(err => console.error(err));
    return pay;
  }

  // --- Promotions Operations ---
  getPromotions(): Promotion[] {
    return this.data.promotions.filter(p => p.isActive);
  }

  getAllPromotionsAdmin(): Promotion[] {
    return this.data.promotions;
  }

  addPromotion(promo: Promotion): Promotion {
    this.data.promotions.push(promo);
    this.save();
    this.saveToCloud('promotions', promo.id, promo).catch(err => console.error(err));
    return promo;
  }

  togglePromotion(id: string): Promotion | null {
    const promo = this.data.promotions.find(p => p.id === id);
    if (!promo) return null;
    promo.isActive = !promo.isActive;
    this.save();
    this.saveToCloud('promotions', promo.id, promo).catch(err => console.error(err));
    return promo;
  }

  deletePromotion(id: string): boolean {
    const index = this.data.promotions.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.promotions.splice(index, 1);
    this.save();
    this.deleteFromCloud('promotions', id).catch(err => console.error(err));
    return true;
  }

  // --- Gallery Photos Operations ---
  getPhotos(): Photo[] {
    return this.data.photos;
  }

  addPhoto(photo: Photo): Photo {
    this.data.photos.unshift(photo);
    this.save();
    this.saveToCloud('photos', photo.id, photo).catch(err => console.error(err));
    return photo;
  }

  deletePhoto(id: string): boolean {
    const index = this.data.photos.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.photos.splice(index, 1);
    this.save();
    this.deleteFromCloud('photos', id).catch(err => console.error(err));
    return true;
  }

  // --- Gallery Videos Operations ---
  getVideos(): Video[] {
    return this.data.videos || [];
  }

  addVideo(video: Video): Video {
    if (!this.data.videos) {
      this.data.videos = [];
    }
    this.data.videos.unshift(video);
    this.save();
    this.saveToCloud('videos', video.id, video).catch(err => console.error(err));
    return video;
  }

  deleteVideo(id: string): boolean {
    if (!this.data.videos) return false;
    const index = this.data.videos.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.data.videos.splice(index, 1);
    this.save();
    this.deleteFromCloud('videos', id).catch(err => console.error(err));
    return true;
  }

  updateVideo(id: string, updated: Partial<Video>): Video | null {
    if (!this.data.videos) return null;
    const index = this.data.videos.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.data.videos[index] = { ...this.data.videos[index], ...updated };
    this.save();
    this.saveToCloud('videos', id, this.data.videos[index]).catch(err => console.error(err));
    return this.data.videos[index];
  }

  // --- Teams (Equipos) Operations ---
  getTeams(): Team[] {
    return this.data.teams;
  }

  addTeam(team: Team): Team {
    this.data.teams.unshift(team);
    this.save();
    this.saveToCloud('teams', team.id, team).catch(err => console.error(err));
    return team;
  }

  updateTeam(id: string, updatedFields: Partial<Team>): Team | null {
    const team = this.data.teams.find(t => t.id === id);
    if (!team) return null;
    Object.assign(team, updatedFields);
    this.save();
    this.saveToCloud('teams', id, team).catch(err => console.error(err));
    return team;
  }

  deleteTeam(id: string): boolean {
    const index = this.data.teams.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.data.teams.splice(index, 1);
    this.deleteFromCloud('teams', id).catch(err => console.error(err));
    
    // Cascade delete players in that team
    const playersToDelete = this.data.players.filter(p => p.teamId === id);
    this.data.players = this.data.players.filter(p => p.teamId !== id);
    this.save();
    
    for (const p of playersToDelete) {
      this.deleteFromCloud('players', p.id).catch(err => console.error(err));
    }
    return true;
  }

  // --- Players (Jugadores) Operations ---
  getPlayers(): Player[] {
    return this.data.players.map(p => {
      const team = this.data.teams.find(t => t.id === p.teamId);
      return {
        ...p,
        teamName: team ? team.name : 'Sin Equipo'
      };
    });
  }

  getPlayersByTeam(teamId: string): Player[] {
    return this.data.players.filter(p => p.teamId === teamId);
  }

  addPlayer(player: Player): Player {
    this.data.players.push(player);
    this.save();
    this.saveToCloud('players', player.id, player).catch(err => console.error(err));
    return player;
  }

  updatePlayer(id: string, updatedFields: Partial<Player>): Player | null {
    const player = this.data.players.find(p => p.id === id);
    if (!player) return null;
    Object.assign(player, updatedFields);
    this.save();
    this.saveToCloud('players', id, player).catch(err => console.error(err));
    return player;
  }

  deletePlayer(id: string): boolean {
    const index = this.data.players.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.players.splice(index, 1);
    this.save();
    this.deleteFromCloud('players', id).catch(err => console.error(err));
    return true;
  }

  // --- Reviews (Calificaciones y Comentarios) Operations ---
  getReviews(): Review[] {
    if (!this.data.reviews) {
      this.data.reviews = [];
    }
    return this.data.reviews;
  }

  addReview(review: Review): Review {
    if (!this.data.reviews) {
      this.data.reviews = [];
    }
    this.data.reviews.unshift(review);
    this.save();
    this.saveToCloud('reviews', review.id, review).catch(err => console.error(err));
    return review;
  }

  updateReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Review | null {
    if (!this.data.reviews) return null;
    const review = this.data.reviews.find(r => r.id === id);
    if (!review) return null;
    review.status = status;
    this.save();
    this.saveToCloud('reviews', id, review).catch(err => console.error(err));
    return review;
  }

  replyToReview(id: string, reply: string): Review | null {
    if (!this.data.reviews) return null;
    const review = this.data.reviews.find(r => r.id === id);
    if (!review) return null;
    review.reply = reply;
    this.save();
    this.saveToCloud('reviews', id, review).catch(err => console.error(err));
    return review;
  }

  deleteReview(id: string): boolean {
    if (!this.data.reviews) return false;
    const index = this.data.reviews.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.data.reviews.splice(index, 1);
    this.save();
    this.deleteFromCloud('reviews', id).catch(err => console.error(err));
    return true;
  }

  // --- Statistics for Admin ---
  getStats(): AppStats {
    const totalReservations = this.data.reservations.length;
    const pendingReservations = this.data.reservations.filter(r => r.status === 'pending').length;
    
    const totalRevenue = this.data.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const activePromotionsCount = this.data.promotions.filter(p => p.isActive).length;
    const teamsCount = this.data.teams.length;
    const playersCount = this.data.players.length;

    return {
      totalReservations,
      pendingReservations,
      totalRevenue,
      activePromotionsCount,
      teamsCount,
      playersCount,
      recentBookings: this.data.reservations.slice(0, 5)
    };
  }

  // --- Fields Configurations Operations ---
  getFields(): FieldConfig[] {
    if (!this.data.fields) {
      this.data.fields = [ ...FIELDS ];
    }
    return this.data.fields;
  }

  updateFieldRate(id: string, basePricePerHour: number): FieldConfig | null {
    const fieldsList = this.getFields();
    const field = fieldsList.find(f => f.id === id);
    if (!field) return null;
    field.basePricePerHour = basePricePerHour;
    this.save();
    this.saveToCloud('fields', id, field).catch(err => console.error(err));
    return field;
  }

  // --- Dynamic Pricing Rules Operations ---
  getDynamicPrices(): any[] {
    if (!this.data.dynamicPrices) {
      this.data.dynamicPrices = [];
    }
    return this.data.dynamicPrices;
  }

  addDynamicPrice(rule: any): any {
    if (!this.data.dynamicPrices) {
      this.data.dynamicPrices = [];
    }
    const newRule = {
      id: rule.id || 'prc-' + Math.random().toString(36).substr(2, 9),
      ...rule,
      createdAt: new Date().toISOString()
    };
    this.data.dynamicPrices.unshift(newRule);
    this.save();
    this.saveToCloud('dynamicPrices', newRule.id, newRule).catch(err => console.error(err));
    return newRule;
  }

  deleteDynamicPrice(id: string): boolean {
    if (!this.data.dynamicPrices) return false;
    const index = this.data.dynamicPrices.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.data.dynamicPrices.splice(index, 1);
    this.save();
    this.deleteFromCloud('dynamicPrices', id).catch(err => console.error(err));
    return true;
  }
}

export const dbStore = new DbStore();
