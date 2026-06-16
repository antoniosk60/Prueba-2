var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/dbStore.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// server/firebase.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var CONFIG_PATH = import_path.default.join(process.cwd(), "firebase-applet-config.json");
var firebaseConfig = {};
try {
  if (import_fs.default.existsSync(CONFIG_PATH)) {
    firebaseConfig = JSON.parse(import_fs.default.readFileSync(CONFIG_PATH, "utf-8"));
  } else {
    console.error("[FIREBASE]: Credentials file not found at:", CONFIG_PATH);
  }
} catch (e) {
  console.error("[FIREBASE CONFIG EXCEPTION]: Error parsing configurations:", e);
}
var app = (0, import_app.initializeApp)(firebaseConfig);
var db = (0, import_firestore.getFirestore)(app, firebaseConfig.firestoreDatabaseId);
async function testConnection() {
  try {
    await (0, import_firestore.getDocFromServer)((0, import_firestore.doc)(db, "test", "connection"));
    console.log("[FIREBASE CONNECTION SUCCESS]: Connected to Firestore database:", firebaseConfig.firestoreDatabaseId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("[FIREBASE CONNECTION ERROR]: Please check your configuration. The client is offline.");
    } else {
      console.log("[FIREBASE CONNECTION]: Optional ping verification finished:", error instanceof Error ? error.message : String(error));
    }
  }
}
testConnection();

// server/dbStore.ts
var import_firestore2 = require("firebase/firestore");
var DB_FILE = import_path2.default.join(process.cwd(), "database_state.json");
function handleFirestoreError(error, operationType, path4) {
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
    path: path4
  };
  console.error("[FIRESTORE EXCEPTION ERROR]:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
var FIELDS = [
  {
    id: "cancha-1",
    name: "Cancha 1 (Techada Premium)",
    description: "Pasto sint\xE9tico de fibra larga, techada, con grader\xEDa y marcador electr\xF3nico.",
    basePricePerHour: 600,
    // MXN (Pesos)
    lightPriceSurcharge: 100,
    // +100 MXN / Hr with lighting
    nightHoursStart: 18,
    // 6:00 PM onwards requires light
    imageUrl: "/src/assets/images/FB_IMG_1780559862787.jpg"
  },
  {
    id: "cancha-2",
    name: "Cancha 2 (No Techada)",
    description: "Excelente drenaje, ideal para el juego nocturno bajo las estrellas.",
    basePricePerHour: 450,
    lightPriceSurcharge: 80,
    nightHoursStart: 18,
    imageUrl: "/src/assets/images/FB_IMG_1780559843055.jpg"
  },
  {
    id: "cancha-3",
    name: "Cancha 3 (F\xFAtbol 5 Indoor)",
    description: "Paredes activas para un juego r\xE1pido y din\xE1mico y sin saques de banda.",
    basePricePerHour: 350,
    lightPriceSurcharge: 50,
    nightHoursStart: 18,
    imageUrl: "/src/assets/images/FB_IMG_1780559839899.jpg"
  }
];
var JWT_SECRET = "cancha_futbol_secreto_super_seguro_2026";
function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = import_crypto.default.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;
    const expectedSignature = import_crypto.default.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (e) {
    return null;
  }
}
var INITIAL_DATA = {
  users: [
    {
      id: "admin-01",
      name: "Administrador Complejo",
      email: "admin@canchafutbol.com",
      phone: "+525512345678",
      role: "admin"
    },
    {
      id: "user-01",
      name: "Carlos Mendoza",
      email: "carlos@gmail.com",
      phone: "+525598765432",
      role: "user"
    }
  ],
  reservations: [
    {
      id: "res-01",
      userId: "user-01",
      userName: "Carlos Mendoza",
      userEmail: "carlos@gmail.com",
      userPhone: "+525598765432",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      // Today
      timeSlot: "19:00 - 20:00",
      duration: 1,
      fieldId: "cancha-1",
      fieldName: "Cancha 1 (Techada Premium)",
      hasLights: true,
      extras: { balls: true, bibs: true, referee: false },
      totalPrice: 700,
      // 600 + 100 lights
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "res-02",
      userId: "user-01",
      userName: "Carlos Mendoza",
      userEmail: "carlos@gmail.com",
      userPhone: "+525598765432",
      date: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      // Tomorrow
      timeSlot: "18:00 - 19:30",
      duration: 1.5,
      fieldId: "cancha-2",
      fieldName: "Cancha 2 (No Techada)",
      hasLights: true,
      extras: { balls: false, bibs: true, referee: true },
      totalPrice: 975,
      status: "pending",
      paymentStatus: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  promotions: [
    {
      id: "promo-01",
      title: "Lunes Futbolero",
      description: "20% de descuento en alquiler de canchas de lunes a mi\xE9rcoles antes de las 17:00 Hrs.",
      discountPercentage: 20,
      promoCode: "LUNESFUT",
      validUntil: "2026-12-31",
      isActive: true,
      type: "discount"
    },
    {
      id: "promo-02",
      title: "Torneo de Verano Nocturno 2026",
      description: "\xA1Inscr\xEDbete ya con tu escuadra! Copa Nocturna de F\xFAtbol R\xE1pido con grandes premios en efectivo. Inicio en Junio.",
      discountPercentage: 0,
      promoCode: "COPANOCTURNA",
      validUntil: "2026-06-30",
      isActive: true,
      type: "tournament"
    },
    {
      id: "promo-03",
      title: "Descuento Estudiantes",
      description: "Muestra tu credencial escolar vigente y obt\xE9n un 15% de descuento directo en tus horas agendadas.",
      discountPercentage: 15,
      promoCode: "ALUMNOS",
      validUntil: "2026-12-31",
      isActive: true,
      type: "discount"
    }
  ],
  photos: [
    {
      id: "photo-tribol-logo",
      url: "/src/assets/images/tribol_logo_1780556302100.png",
      caption: "Escudo e Identidad Visual Oficial de F\xFAtbol R\xE1pido Tribol",
      category: "facilities",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-mvp-boy",
      url: "/src/assets/images/mvp_boy_trophy_1780307479148.png",
      caption: "Goleador Estrella Juvenil recibiendo trofeo MVP de la semana en la cancha techada",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-copa-campeones",
      url: "/src/assets/images/copa_campeones_celebration_1780307492915.png",
      caption: "Ceremonia de campe\xF3n de liga con trofeo de oro y lluvia de confeti",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-pina-card",
      url: "/src/assets/images/pina_goal_card_1780307507932.png",
      caption: 'Tarjeta coleccionable MVP \xA1GOOOOOL! de E. "Pi\xF1a" L\xF3pez del club Barcelona',
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-1",
      url: "/src/assets/images/FB_IMG_1780559851100.jpg",
      caption: "Encuentros intensos bajo iluminaci\xF3n LED profesional",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-2",
      url: "/src/assets/images/FB_IMG_1780559862787.jpg",
      caption: "Cancha Principal Techada con Pasto Sint\xE9tico Premium",
      category: "facilities",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-1",
      url: "/src/assets/images/FB_IMG_1780559831023.jpg",
      caption: "Acci\xF3n de alta intensidad en los costados de la cancha",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-2",
      url: "/src/assets/images/FB_IMG_1780559832822.jpg",
      caption: "El silbatazo inicial de nuestra liguilla estelar",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-3",
      url: "/src/assets/images/FB_IMG_1780559839899.jpg",
      caption: "Jugadas de pared en las bandas del complejo Tribol",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-4",
      url: "/src/assets/images/FB_IMG_1780559843055.jpg",
      caption: "Cierre defensivo espectacular bajo la luz de los reflectores",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-5",
      url: "/src/assets/images/FB_IMG_1780559845797.jpg",
      caption: "Control de bal\xF3n excelso en media cancha",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-6",
      url: "/src/assets/images/FB_IMG_1780559849041.jpg",
      caption: "Disparo potente directo al \xE1ngulo",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-7",
      url: "/src/assets/images/FB_IMG_1780559851100.jpg",
      caption: "La adrenalina del f\xFAtbol r\xE1pido al l\xEDmite",
      category: "matches",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-8",
      url: "/src/assets/images/FB_IMG_1780559854193.jpg",
      caption: "Escuadras listas para saltar a la cancha",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-9",
      url: "/src/assets/images/FB_IMG_1780559856795.jpg",
      caption: "P\xFAblico apasionado alentando en la grada Tribol",
      category: "facilities",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-10",
      url: "/src/assets/images/FB_IMG_1780559858433.jpg",
      caption: "Celebraci\xF3n euf\xF3rica tras el gol del campeonato",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-11",
      url: "/src/assets/images/FB_IMG_1780559860027.jpg",
      caption: "Entrega del trofeo de Goleador de la Temporada",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-12",
      url: "/src/assets/images/FB_IMG_1780559861640.jpg",
      caption: "Los capitanes compartiendo un saludo deportivo",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-13",
      url: "/src/assets/images/FB_IMG_1780559862787.jpg",
      caption: "Imponente vista de la cancha techada n\xFAmero 1",
      category: "facilities",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "photo-fb-14",
      url: "/src/assets/images/FB_IMG_1780559864592.jpg",
      caption: "Noche de f\xFAtbol r\xE1pido con familias completas en Tribol",
      category: "events",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  teams: [
    {
      id: "team-01",
      name: "Galeones F.C.",
      color: "Azul y Negro",
      captainContact: "Adri\xE1n Perea (+5255392817)",
      goalsFor: 23,
      gamesPlayed: 8,
      gamesWon: 5,
      gamesDrawn: 1,
      gamesLost: 2,
      goalsAgainst: 15,
      points: 16,
      form: ["G", "E", "P", "G", "G"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "team-02",
      name: "Deportivo Cuervos",
      color: "Negro Mate",
      captainContact: "Hugo S\xE1nchez (+5255483921)",
      goalsFor: 19,
      gamesPlayed: 8,
      gamesWon: 4,
      gamesDrawn: 0,
      gamesLost: 4,
      goalsAgainst: 18,
      points: 12,
      form: ["P", "G", "P", "G", "P"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "team-03",
      name: "Titanes del R\xE1pido",
      color: "Verde El\xE9ctrico",
      captainContact: "Mateo Reyes (+5255741829)",
      goalsFor: 31,
      gamesPlayed: 8,
      gamesWon: 6,
      gamesDrawn: 1,
      gamesLost: 1,
      goalsAgainst: 14,
      points: 19,
      form: ["G", "G", "E", "G", "P"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  players: [
    {
      id: "player-01",
      teamId: "team-01",
      name: "Adri\xE1n Perea",
      age: 27,
      position: "Defensa (C)",
      contact: "+5255392817",
      goals: 5,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-02",
      teamId: "team-01",
      name: "Santiago L\xF3pez",
      age: 24,
      position: "Medio",
      contact: "+5255849301",
      goals: 3,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-03",
      teamId: "team-01",
      name: "Daniel Ortiz",
      age: 26,
      position: "Delantero",
      contact: "+5255319203",
      goals: 12,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-04",
      teamId: "team-02",
      name: "Hugo S\xE1nchez Jr",
      age: 23,
      position: "Delantero (C)",
      contact: "+5255483921",
      goals: 15,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-05",
      teamId: "team-02",
      name: "Gerardo Torrado",
      age: 29,
      position: "Defensa",
      contact: "+5255938472",
      goals: 2,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-06",
      teamId: "team-03",
      name: "Mateo Reyes",
      age: 25,
      position: "Medio (C)",
      contact: "+5255741829",
      goals: 8,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-07",
      teamId: "team-03",
      name: "Esteban Paredes",
      age: 28,
      position: "Delantero",
      contact: "+5255019283",
      goals: 18,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "player-08",
      teamId: "team-03",
      name: "Chuy Corona",
      age: 31,
      position: "Portero",
      contact: "+5255374829",
      goals: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  reviews: [
    {
      id: "rev-01",
      fieldId: "cancha-1",
      fieldName: "Cancha 1 (Techada Premium)",
      userId: "user-01",
      userName: "Carlos Mendoza",
      userEmail: "carlos@gmail.com",
      rating: 5,
      comment: "\xA1Excelente pasto sint\xE9tico! La iluminaci\xF3n LED es de primer nivel para jugar de noche.",
      reply: "Muchas gracias Carlos, nos alegra saber que disfrutaste la experiencia nocturna en F\xFAtbol R\xE1pido Tribol.",
      status: "approved",
      reservationId: "res-01",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: "rev-02",
      fieldId: "cancha-2",
      fieldName: "Cancha 2 (No Techada)",
      userId: "user-01",
      userName: "Carlos Mendoza",
      userEmail: "carlos@gmail.com",
      rating: 4,
      comment: "Una cancha fant\xE1stica para jugar por la tarde. Solo faltan reparar unas redes de la porter\xEDa.",
      status: "pending",
      reservationId: "res-02",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
    }
  ],
  videos: [
    {
      id: "vid-live-1",
      title: "\u{1F534} TRANSMISI\xD3N EN VIVO: Final de Copa Femenil - Real Madrid vs Espa\xF1a",
      url: "https://assets.mixkit.co/videos/preview/mixkit-playing-soccer-in-the-rain-40348-large.mp4",
      thumbnailUrl: "/src/assets/images/FB_IMG_1780559832822.jpg",
      category: "live",
      isLive: true,
      views: 184,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "vid-highlight-1",
      title: "Resumen Semanal: Goles de Antolog\xEDa - Jornada 10 (Sabatina)",
      url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-the-ball-in-stadium-40356-large.mp4",
      thumbnailUrl: "/src/assets/images/FB_IMG_1780559849041.jpg",
      category: "highlight",
      isLive: false,
      views: 742,
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: "vid-match-2",
      title: "Partido Completo: Barcelona vs FC San Pancho - Final Nuevos Valores",
      url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-hitting-the-net-40347-large.mp4",
      thumbnailUrl: "/src/assets/images/FB_IMG_1780559845797.jpg",
      category: "full_match",
      isLive: false,
      views: 1250,
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
    }
  ],
  fields: FIELDS,
  dynamicPrices: []
};
var DbStore = class {
  constructor() {
    this.data = { ...INITIAL_DATA };
    this.load();
    this.syncWithFirestore().catch((err) => {
      console.error("[FIRESTORE INITIAL SYNC WARNING]: Could not synchronize on startup:", err);
    });
  }
  async syncWithFirestore() {
    console.log("[FIRESTORE] Synchronizing with cloud database...");
    const collections = [
      "users",
      "reservations",
      "payments",
      "promotions",
      "photos",
      "videos",
      "teams",
      "players",
      "reviews",
      "fields",
      "dynamicPrices"
    ];
    let hasCloudData = false;
    for (const colName of collections) {
      try {
        const querySnapshot = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, colName));
        if (!querySnapshot.empty) {
          hasCloudData = true;
          const docsList = [];
          querySnapshot.forEach((docSnap) => {
            docsList.push({ id: docSnap.id, ...docSnap.data() });
          });
          console.log(`[FIRESTORE] Resolved ${docsList.length} documents for collection "${colName}"`);
          if (colName === "users") this.data.users = docsList;
          else if (colName === "reservations") this.data.reservations = docsList;
          else if (colName === "payments") this.data.payments = docsList;
          else if (colName === "promotions") this.data.promotions = docsList;
          else if (colName === "photos") this.data.photos = docsList;
          else if (colName === "videos") this.data.videos = docsList;
          else if (colName === "teams") this.data.teams = docsList;
          else if (colName === "players") this.data.players = docsList;
          else if (colName === "reviews") this.data.reviews = docsList;
          else if (colName === "fields") this.data.fields = docsList;
          else if (colName === "dynamicPrices") this.data.dynamicPrices = docsList;
        }
      } catch (err) {
        console.error(`[FIRESTORE SYNC ERROR] Failed to load "${colName}":`, err);
      }
    }
    if (!hasCloudData) {
      console.log("[FIRESTORE] Cloud database is empty. Seeding with INITIAL_DATA...");
      await this.seedCloudDatabase();
    } else {
      this.save();
      console.log("[FIRESTORE SUCCESS]: Cached cloud database locally on disk.");
    }
  }
  async seedCloudDatabase() {
    const seedPairs = [
      { key: "users", list: this.data.users },
      { key: "reservations", list: this.data.reservations },
      { key: "payments", list: this.data.payments },
      { key: "promotions", list: this.data.promotions },
      { key: "photos", list: this.data.photos },
      { key: "videos", list: this.data.videos || [] },
      { key: "teams", list: this.data.teams },
      { key: "players", list: this.data.players },
      { key: "reviews", list: this.data.reviews },
      { key: "fields", list: this.getFields() },
      { key: "dynamicPrices", list: this.getDynamicPrices() }
    ];
    for (const pair of seedPairs) {
      for (const item of pair.list) {
        try {
          const docRef = (0, import_firestore2.doc)(db, pair.key, item.id);
          const { id, ...dataToSave } = item;
          await (0, import_firestore2.setDoc)(docRef, dataToSave);
        } catch (err) {
          console.error(`[FIRESTORE SEED EXCEPTION] Error seeding item ${item.id} to col "${pair.key}":`, err);
        }
      }
      console.log(`[FIRESTORE SEEDED] Col "${pair.key}" seeded successfully.`);
    }
  }
  async saveToCloud(collectionName, documentId, item) {
    const path4 = `${collectionName}/${documentId}`;
    try {
      const docRef = (0, import_firestore2.doc)(db, collectionName, documentId);
      const dataToSave = { ...item };
      await (0, import_firestore2.setDoc)(docRef, dataToSave);
      console.log(`[FIRESTORE WRITE SUCCESS]: Wrote document to ${path4}`);
    } catch (error) {
      handleFirestoreError(error, "write" /* WRITE */, path4);
    }
  }
  async deleteFromCloud(collectionName, documentId) {
    const path4 = `${collectionName}/${documentId}`;
    try {
      const docRef = (0, import_firestore2.doc)(db, collectionName, documentId);
      await (0, import_firestore2.deleteDoc)(docRef);
      console.log(`[FIRESTORE DELETE SUCCESS]: Deleted document from ${path4}`);
    } catch (error) {
      handleFirestoreError(error, "delete" /* DELETE */, path4);
    }
  }
  load() {
    try {
      if (import_fs2.default.existsSync(DB_FILE)) {
        const fileContent = import_fs2.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        const loadedPlayers = (parsed.players || INITIAL_DATA.players).map((p) => {
          if (p.goals === void 0) {
            const goalMapping = {
              "Adri\xE1n Perea": 5,
              "Santiago L\xF3pez": 3,
              "Daniel Ortiz": 12,
              "Hugo S\xE1nchez Jr": 15,
              "Gerardo Torrado": 2,
              "Mateo Reyes": 8,
              "Esteban Paredes": 18,
              "Chuy Corona": 0
            };
            return {
              ...p,
              goals: goalMapping[p.name] !== void 0 ? goalMapping[p.name] : Math.floor(Math.random() * 8)
            };
          }
          return p;
        });
        const loadedTeams = (parsed.teams || INITIAL_DATA.teams).map((t) => {
          return {
            ...t,
            gamesPlayed: t.gamesPlayed !== void 0 ? t.gamesPlayed : t.id === "team-01" ? 8 : t.id === "team-02" ? 8 : t.id === "team-03" ? 8 : 0,
            gamesWon: t.gamesWon !== void 0 ? t.gamesWon : t.id === "team-01" ? 5 : t.id === "team-02" ? 4 : t.id === "team-03" ? 6 : 0,
            gamesDrawn: t.gamesDrawn !== void 0 ? t.gamesDrawn : t.id === "team-01" ? 1 : t.id === "team-02" ? 0 : t.id === "team-03" ? 1 : 0,
            gamesLost: t.gamesLost !== void 0 ? t.gamesLost : t.id === "team-01" ? 2 : t.id === "team-02" ? 4 : t.id === "team-03" ? 1 : 0,
            goalsAgainst: t.goalsAgainst !== void 0 ? t.goalsAgainst : t.id === "team-01" ? 15 : t.id === "team-02" ? 18 : t.id === "team-03" ? 14 : 0,
            points: t.points !== void 0 ? t.points : t.id === "team-01" ? 16 : t.id === "team-02" ? 12 : t.id === "team-03" ? 19 : 0,
            form: t.form !== void 0 ? t.form : t.id === "team-01" ? ["G", "E", "P", "G", "G"] : t.id === "team-02" ? ["P", "G", "P", "G", "P"] : t.id === "team-03" ? ["G", "G", "E", "G", "P"] : []
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
      console.error("Error loading database file. Initializing default.", e);
      this.data = { ...INITIAL_DATA };
      this.save();
    }
  }
  save() {
    try {
      import_fs2.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing to database file.", e);
    }
  }
  // --- Users Operations ---
  getUsers() {
    return this.data.users;
  }
  addUser(user) {
    this.data.users.push(user);
    this.save();
    this.saveToCloud("users", user.id, user).catch((err) => console.error(err));
    return user;
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  getUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  // --- Reservations Operations ---
  getReservations() {
    return this.data.reservations;
  }
  addReservation(res) {
    this.data.reservations.unshift(res);
    this.save();
    this.saveToCloud("reservations", res.id, res).catch((err) => console.error(err));
    return res;
  }
  updateReservationStatus(id, status, paymentStatus) {
    const res = this.data.reservations.find((r) => r.id === id);
    if (!res) return null;
    res.status = status;
    if (paymentStatus) {
      res.paymentStatus = paymentStatus;
    }
    this.save();
    this.saveToCloud("reservations", res.id, res).catch((err) => console.error(err));
    return res;
  }
  deleteReservation(id) {
    const index = this.data.reservations.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.data.reservations.splice(index, 1);
    this.save();
    this.deleteFromCloud("reservations", id).catch((err) => console.error(err));
    return true;
  }
  // --- Payments Operations ---
  getPayments() {
    return this.data.payments;
  }
  addPayment(pay) {
    this.data.payments.push(pay);
    const res = this.data.reservations.find((r) => r.id === pay.reservationId);
    if (res) {
      res.paymentStatus = "paid";
      res.status = "confirmed";
      this.saveToCloud("reservations", res.id, res).catch((err) => console.error(err));
    }
    this.save();
    this.saveToCloud("payments", pay.id, pay).catch((err) => console.error(err));
    return pay;
  }
  // --- Promotions Operations ---
  getPromotions() {
    return this.data.promotions.filter((p) => p.isActive);
  }
  getAllPromotionsAdmin() {
    return this.data.promotions;
  }
  addPromotion(promo) {
    this.data.promotions.push(promo);
    this.save();
    this.saveToCloud("promotions", promo.id, promo).catch((err) => console.error(err));
    return promo;
  }
  togglePromotion(id) {
    const promo = this.data.promotions.find((p) => p.id === id);
    if (!promo) return null;
    promo.isActive = !promo.isActive;
    this.save();
    this.saveToCloud("promotions", promo.id, promo).catch((err) => console.error(err));
    return promo;
  }
  deletePromotion(id) {
    const index = this.data.promotions.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.promotions.splice(index, 1);
    this.save();
    this.deleteFromCloud("promotions", id).catch((err) => console.error(err));
    return true;
  }
  // --- Gallery Photos Operations ---
  getPhotos() {
    return this.data.photos;
  }
  addPhoto(photo) {
    this.data.photos.unshift(photo);
    this.save();
    this.saveToCloud("photos", photo.id, photo).catch((err) => console.error(err));
    return photo;
  }
  deletePhoto(id) {
    const index = this.data.photos.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.photos.splice(index, 1);
    this.save();
    this.deleteFromCloud("photos", id).catch((err) => console.error(err));
    return true;
  }
  // --- Gallery Videos Operations ---
  getVideos() {
    return this.data.videos || [];
  }
  addVideo(video) {
    if (!this.data.videos) {
      this.data.videos = [];
    }
    this.data.videos.unshift(video);
    this.save();
    this.saveToCloud("videos", video.id, video).catch((err) => console.error(err));
    return video;
  }
  deleteVideo(id) {
    if (!this.data.videos) return false;
    const index = this.data.videos.findIndex((v) => v.id === id);
    if (index === -1) return false;
    this.data.videos.splice(index, 1);
    this.save();
    this.deleteFromCloud("videos", id).catch((err) => console.error(err));
    return true;
  }
  updateVideo(id, updated) {
    if (!this.data.videos) return null;
    const index = this.data.videos.findIndex((v) => v.id === id);
    if (index === -1) return null;
    this.data.videos[index] = { ...this.data.videos[index], ...updated };
    this.save();
    this.saveToCloud("videos", id, this.data.videos[index]).catch((err) => console.error(err));
    return this.data.videos[index];
  }
  // --- Teams (Equipos) Operations ---
  getTeams() {
    return this.data.teams;
  }
  addTeam(team) {
    this.data.teams.unshift(team);
    this.save();
    this.saveToCloud("teams", team.id, team).catch((err) => console.error(err));
    return team;
  }
  updateTeam(id, updatedFields) {
    const team = this.data.teams.find((t) => t.id === id);
    if (!team) return null;
    Object.assign(team, updatedFields);
    this.save();
    this.saveToCloud("teams", id, team).catch((err) => console.error(err));
    return team;
  }
  deleteTeam(id) {
    const index = this.data.teams.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.data.teams.splice(index, 1);
    this.deleteFromCloud("teams", id).catch((err) => console.error(err));
    const playersToDelete = this.data.players.filter((p) => p.teamId === id);
    this.data.players = this.data.players.filter((p) => p.teamId !== id);
    this.save();
    for (const p of playersToDelete) {
      this.deleteFromCloud("players", p.id).catch((err) => console.error(err));
    }
    return true;
  }
  // --- Players (Jugadores) Operations ---
  getPlayers() {
    return this.data.players.map((p) => {
      const team = this.data.teams.find((t) => t.id === p.teamId);
      return {
        ...p,
        teamName: team ? team.name : "Sin Equipo"
      };
    });
  }
  getPlayersByTeam(teamId) {
    return this.data.players.filter((p) => p.teamId === teamId);
  }
  addPlayer(player) {
    this.data.players.push(player);
    this.save();
    this.saveToCloud("players", player.id, player).catch((err) => console.error(err));
    return player;
  }
  updatePlayer(id, updatedFields) {
    const player = this.data.players.find((p) => p.id === id);
    if (!player) return null;
    Object.assign(player, updatedFields);
    this.save();
    this.saveToCloud("players", id, player).catch((err) => console.error(err));
    return player;
  }
  deletePlayer(id) {
    const index = this.data.players.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.players.splice(index, 1);
    this.save();
    this.deleteFromCloud("players", id).catch((err) => console.error(err));
    return true;
  }
  // --- Reviews (Calificaciones y Comentarios) Operations ---
  getReviews() {
    if (!this.data.reviews) {
      this.data.reviews = [];
    }
    return this.data.reviews;
  }
  addReview(review) {
    if (!this.data.reviews) {
      this.data.reviews = [];
    }
    this.data.reviews.unshift(review);
    this.save();
    this.saveToCloud("reviews", review.id, review).catch((err) => console.error(err));
    return review;
  }
  updateReviewStatus(id, status) {
    if (!this.data.reviews) return null;
    const review = this.data.reviews.find((r) => r.id === id);
    if (!review) return null;
    review.status = status;
    this.save();
    this.saveToCloud("reviews", id, review).catch((err) => console.error(err));
    return review;
  }
  replyToReview(id, reply) {
    if (!this.data.reviews) return null;
    const review = this.data.reviews.find((r) => r.id === id);
    if (!review) return null;
    review.reply = reply;
    this.save();
    this.saveToCloud("reviews", id, review).catch((err) => console.error(err));
    return review;
  }
  deleteReview(id) {
    if (!this.data.reviews) return false;
    const index = this.data.reviews.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.data.reviews.splice(index, 1);
    this.save();
    this.deleteFromCloud("reviews", id).catch((err) => console.error(err));
    return true;
  }
  // --- Statistics for Admin ---
  getStats() {
    const totalReservations = this.data.reservations.length;
    const pendingReservations = this.data.reservations.filter((r) => r.status === "pending").length;
    const totalRevenue = this.data.payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
    const activePromotionsCount = this.data.promotions.filter((p) => p.isActive).length;
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
  getFields() {
    if (!this.data.fields) {
      this.data.fields = [...FIELDS];
    }
    return this.data.fields;
  }
  updateFieldRate(id, basePricePerHour) {
    const fieldsList = this.getFields();
    const field = fieldsList.find((f) => f.id === id);
    if (!field) return null;
    field.basePricePerHour = basePricePerHour;
    this.save();
    this.saveToCloud("fields", id, field).catch((err) => console.error(err));
    return field;
  }
  // --- Dynamic Pricing Rules Operations ---
  getDynamicPrices() {
    if (!this.data.dynamicPrices) {
      this.data.dynamicPrices = [];
    }
    return this.data.dynamicPrices;
  }
  addDynamicPrice(rule) {
    if (!this.data.dynamicPrices) {
      this.data.dynamicPrices = [];
    }
    const newRule = {
      id: rule.id || "prc-" + Math.random().toString(36).substr(2, 9),
      ...rule,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.dynamicPrices.unshift(newRule);
    this.save();
    this.saveToCloud("dynamicPrices", newRule.id, newRule).catch((err) => console.error(err));
    return newRule;
  }
  deleteDynamicPrice(id) {
    if (!this.data.dynamicPrices) return false;
    const index = this.data.dynamicPrices.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.data.dynamicPrices.splice(index, 1);
    this.save();
    this.deleteFromCloud("dynamicPrices", id).catch((err) => console.error(err));
    return true;
  }
};
var dbStore = new DbStore();

// server/twilioService.ts
var import_twilio = __toESM(require("twilio"), 1);
var twilioClient = null;
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("Faltan configurar las variables de entorno TWILIO_ACCOUNT_SID y/o TWILIO_AUTH_TOKEN.");
  }
  const isValidSid = typeof accountSid === "string" && accountSid.trim().startsWith("AC");
  if (!isValidSid) {
    throw new Error("accountSid must start with AC");
  }
  if (!twilioClient) {
    twilioClient = (0, import_twilio.default)(accountSid, authToken);
  }
  return twilioClient;
}
function formatWhatsAppNumber(phone) {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+52" + cleaned;
    } else if (cleaned.startsWith("52") && cleaned.length >= 11) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }
  return `whatsapp:${cleaned}`;
}
function generateEntryCode() {
  const num = Math.floor(1e5 + Math.random() * 9e5);
  return `GA-${num}`;
}
async function sendReservationWhatsApp(reservation) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
  if (!fromNumber.startsWith("whatsapp:")) {
    fromNumber = `whatsapp:${fromNumber}`;
  }
  const entryCode = reservation.entryCode || generateEntryCode();
  reservation.entryCode = entryCode;
  const formattedTo = formatWhatsAppNumber(reservation.userPhone);
  const extrasList = [];
  if (reservation.extras.balls) extrasList.push("\u26BD Balones de juego");
  if (reservation.extras.bibs) extrasList.push("\u{1F3BD} Casacas/Chalecos");
  if (reservation.extras.referee) extrasList.push("\u{1F3C1} \xC1rbitro Profesional");
  const extrasString = extrasList.length > 0 ? extrasList.join(", ") : "Ninguno";
  const messageBody = `*\xA1Hola ${reservation.userName}! Tu reservaci\xF3n en Guerreros Ayotla est\xE1 lista* \u{1F422}\u26BD

Aqu\xED tienes los detalles de tu encuentro:
\u{1F4C5} *Fecha:* ${reservation.date}
\u23F0 *Horario:* ${reservation.timeSlot} (${reservation.duration} h)
\u{1F3DF}\uFE0F *Cancha:* ${reservation.fieldName}
\u{1F4A1} *Iluminaci\xF3n:* ${reservation.hasLights ? "S\xED (Incluida)" : "No requerida"}
\u{1F392} *Adicionales:* ${extrasString}
\u{1F4B0} *Total:* $${reservation.totalPrice} MXN
\u{1F4B3} *Estado de Pago:* ${reservation.paymentStatus === "paid" ? "PAGADO \u2713" : "PENDIENTE \u26A0\uFE0F"}

\u{1F511} *C\xD3DIGO DE ENTRADA AL COMPLEJO:* \`${entryCode}\`
Presenta este c\xF3digo al ingresar a las instalaciones deportivas de Ayotla.

*\xA1Te deseamos el mejor de los \xE9xitos en tu partido!* \u{1F3C6}\u{1F525}`;
  const isValidSid = typeof accountSid === "string" && accountSid.trim().startsWith("AC");
  const isValidToken = typeof authToken === "string" && authToken.trim().length > 0 && !authToken.includes("MY_") && !authToken.includes("YOUR_");
  if (!accountSid || !authToken || !isValidSid || !isValidToken) {
    const errorMsg = "NOTIFICACI\xD3N SIMULADA: Credenciales de Twilio no v\xE1lidas o ausentes en el entorno.";
    console.warn(`[TWILIO WARNING]: ${errorMsg}`);
    console.log(`[WhatsApp simulado para ${formattedTo}]:
${messageBody}`);
    return {
      success: true,
      simulated: true,
      recipient: formattedTo,
      body: messageBody,
      error: "Twilio no configurado correctamente. El mensaje fue simulado en consola."
    };
  }
  try {
    const client = getTwilioClient();
    const result = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: formattedTo
    });
    console.log(`[TWILIO SUCCESS]: Mensaje enviado a ${formattedTo}. SID: ${result.sid}`);
    return {
      success: true,
      messageSid: result.sid,
      simulated: false,
      recipient: formattedTo,
      body: messageBody
    };
  } catch (err) {
    const isValidationError = err.message && (err.message.includes("must start with AC") || err.message.includes("Faltan configurar") || err.message.includes("not configured"));
    if (isValidationError) {
      console.warn(`[TWILIO WARNING]: Credenciales no v\xE1lidas. Simulaci\xF3n de WhatsApp para ${formattedTo}:
${messageBody}`);
      return {
        success: true,
        simulated: true,
        recipient: formattedTo,
        body: messageBody,
        error: err.message
      };
    }
    console.error("[TWILIO ERROR]: Fall\xF3 el env\xEDo de WhatsApp v\xEDa Twilio.", err);
    return {
      success: false,
      error: err.message || "Error desconocido al enviar el mensaje de Twilio.",
      simulated: false,
      recipient: formattedTo,
      body: messageBody
    };
  }
}

// server/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
function generateReservationEmailTemplate(reservation) {
  const extrasList = [];
  if (reservation.extras.balls) extrasList.push("\u26BD Balones de Juego");
  if (reservation.extras.bibs) extrasList.push("\u{1F3BD} Casacas / Chalecos");
  if (reservation.extras.referee) extrasList.push("\u{1F3C1} \xC1rbitro Profesional");
  const extrasString = extrasList.length > 0 ? extrasList.join(", ") : "Ninguno";
  const isPaid = reservation.paymentStatus === "paid";
  const statusColor = isPaid ? "#22c55e" : "#f59e0b";
  const statusText = isPaid ? "PAGADO \u2713" : "PENDIENTE DE PAGO \u26A0\uFE0F";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmaci\xF3n de Reserva - Guerreros Ayotla</title>
      <style>
        body {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0c0f0d;
          color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #121614;
          border: 1px solid #14532d;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .header {
          background-color: #050706;
          padding: 30px;
          text-align: center;
          border-bottom: 2px solid #22c55e;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 0;
          letter-spacing: 1px;
        }
        .header p {
          color: #22c55e;
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 2px;
          margin: 5px 0 0 0;
          text-transform: uppercase;
        }
        .content {
          padding: 30px;
        }
        .welcome {
          font-size: 16px;
          line-height: 1.6;
          color: #e5e7eb;
          margin-bottom: 25px;
        }
        .details-card {
          background-color: #090c0a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .details-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #1e293b;
        }
        .details-row:last-child {
          border-bottom: none;
        }
        .details-label {
          color: #9ca3af;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .details-value {
          color: #ffffff;
          font-weight: bold;
          font-size: 14px;
          text-align: right;
        }
        .code-box {
          background-color: #064e3b;
          border: 2px dashed #22c55e;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .code-label {
          color: #a7f3d0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .code-value {
          color: #ffffff;
          font-family: monospace;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 3px;
        }
        .button-wrapper {
          text-align: center;
          margin-top: 30px;
        }
        .cta-button {
          display: inline-block;
          background-color: #22c55e;
          color: #000000 !important;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 14px 28px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .footer {
          background-color: #050706;
          padding: 20px;
          text-align: center;
          font-size: 11px;
          color: #4b5563;
          border-top: 1px solid #14532d;
        }
        .footer a {
          color: #22c55e;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GUERREROS AYOTLA</h1>
          <p>F\xFAtbol R\xE1pido Tribol</p>
        </div>
        <div class="content">
          <div class="welcome">
            Hola <strong>${reservation.userName}</strong>,<br><br>
            \xA1Tu reservaci\xF3n de cancha ha sido registrada de manera exitosa! A continuaci\xF3n te proporcionamos tu comprobante oficial y los detalles de acceso al complejo deportivo.
          </div>

          <div class="details-card">
            <div class="details-row">
              <span class="details-label">ID de Reserva</span>
              <span class="details-value" style="font-family: monospace;">${reservation.id}</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u{1F3DF}\uFE0F Cancha</span>
              <span class="details-value">${reservation.fieldName}</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u{1F4C5} Fecha</span>
              <span class="details-value">${reservation.date}</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u23F0 Horario</span>
              <span class="details-value">${reservation.timeSlot} (${reservation.duration} hrs)</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u{1F4A1} Alumbrado</span>
              <span class="details-value">${reservation.hasLights ? "S\xED (Incluido)" : "No"}</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u{1F4E6} Adicionales</span>
              <span class="details-value">${extrasString}</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u{1F4B0} Precio Total</span>
              <span class="details-value">$${reservation.totalPrice} MXN</span>
            </div>
            <div class="details-row">
              <span class="details-label">\u{1F4B3} Estatus</span>
              <span class="details-value" style="color: ${statusColor}; font-weight: 800;">${statusText}</span>
            </div>
          </div>

          <div class="code-box">
            <div class="code-label">C\xD3DIGO DE ENTRADA AL COMPLEJO</div>
            <div class="code-value">${reservation.entryCode || "GA-XXXXXX"}</div>
            <div style="font-size: 11px; color: #a7f3d0; margin-top: 10px;">Presenta este c\xF3digo al ingresar a nuestras canchas en Ayotla.</div>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
            \xBFTienes alguna duda o necesitas reagendar? Ponte en contacto inmediato con administraci\xF3n.
          </p>

          <div class="button-wrapper">
            <a href="https://wa.me/5255483921" class="cta-button">Contactar Soporte WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 Club Guerreros Ayotla. Carretera Libre M\xE9xico-Puebla, Ixtapaluca.<br>
          Enviado autom\xE1ticamente por el gestor de eventos de reservas.
        </div>
      </div>
    </body>
    </html>
  `;
}
async function sendReservationEmail(reservation) {
  const emailTo = reservation.userEmail;
  const emailFrom = process.env.EMAIL_FROM || "Guerreros Ayotla <comprobantes@canchafutbol.com>";
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailHtml = generateReservationEmailTemplate(reservation);
  const emailSubject = `Confirmaci\xF3n de Reserva #${reservation.id} - Guerreros Ayotla`;
  if (resendApiKey && typeof resendApiKey === "string" && resendApiKey.startsWith("re_")) {
    try {
      console.log(`[EMAIL SERVICE]: Attempting to send confirmation email to ${emailTo} via Resend...`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: emailFrom,
          to: emailTo,
          subject: emailSubject,
          html: emailHtml
        })
      });
      if (response.ok) {
        const body = await response.json();
        console.log(`[EMAIL SERVICE RESEND SUCCESS]: Email successful to ${emailTo}. ID: ${body.id}`);
        return {
          success: true,
          messageId: body.id,
          simulated: false
        };
      } else {
        const errText = await response.text();
        throw new Error(`Resend responded with code ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.error("[EMAIL SERVICE RESEND FAIL]: Failed to send via Resend API. Falling back to simulations...", err);
    }
  }
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`[EMAIL SERVICE]: Attempting SMTP transmission for ${emailTo} via ${smtpHost}...`);
      const transporter = import_nodemailer.default.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      const info = await transporter.sendMail({
        from: emailFrom,
        to: emailTo,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[EMAIL SERVICE SMTP SUCCESS]: Email secure sent. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        simulated: false
      };
    } catch (err) {
      console.error("[EMAIL SERVICE SMTP FAIL]: Failed configured SMTP transmission.", err);
    }
  }
  console.warn(`[EMAIL WARNING]: No valid RESEND_API_KEY or SMTP configuration found. Simulating transaction...`);
  console.log(`
========================================================================
SIMULANDO ENV\xCDO DE COMPROBANTE DE CORREO ELECTR\xD3NICO ELECTR\xD3NICO
========================================================================
DE: ${emailFrom}
PARA: ${emailTo}
ASUNTO: ${emailSubject}
------------------------------------------------------------------------
(Verifique el formato HTML renderizado en su car\xE1tula virtual / bandeja)
========================================================================
  `);
  return {
    success: true,
    simulated: true,
    error: "API no configurada. Transmisi\xF3n de correo simulada en consola para pruebas."
  };
}

// server.ts
async function startServer() {
  const app2 = (0, import_express.default)();
  const PORT = 3e3;
  app2.use(import_express.default.json());
  const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Autenticaci\xF3n requerida." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Acceso exclusivo para administradores." });
    }
    req.body.adminUser = decoded;
    next();
  };
  const getUserFromHeader = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    return verifyToken(token);
  };
  app2.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contrase\xF1a son requeridos." });
    }
    const emailLower = email.toLowerCase();
    if (emailLower === "admin@canchafutbol.com" && password === "admin") {
      const adminUser = dbStore.getUserById("admin-01");
      if (adminUser) {
        const token = signToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role });
        return res.json({
          token,
          user: adminUser
        });
      }
    }
    const user = dbStore.getUserByEmail(emailLower);
    if (user && user.password === password) {
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        token,
        user
      });
    }
    return res.status(401).json({ message: "Credenciales inv\xE1lidas. Verifica tu correo y contrase\xF1a." });
  });
  app2.post("/api/auth/register", (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos para completar el registro." });
    }
    const emailLower = email.toLowerCase();
    const existing = dbStore.getUserByEmail(emailLower);
    if (existing) {
      if (!existing.password) {
        existing.password = password;
        if (name) existing.name = name;
        if (phone) existing.phone = phone;
        dbStore.updatePlayer(existing.id, { contact: phone });
        dbStore.save();
        const token2 = signToken({ id: existing.id, email: existing.email, role: existing.role });
        return res.json({
          message: "Cuenta actualizada exitosamente.",
          token: token2,
          user: existing
        });
      }
      return res.status(400).json({ message: "El correo electr\xF3nico ya est\xE1 registrado." });
    }
    const newUser = dbStore.addUser({
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      name,
      email: emailLower,
      phone,
      role: "user",
      password
    });
    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    res.status(201).json({
      message: "Usuario registrado exitosamente.",
      token,
      user: newUser
    });
  });
  app2.get("/api/fields", (req, res) => {
    res.json(dbStore.getFields());
  });
  app2.put("/api/fields/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { basePricePerHour } = req.body;
    if (basePricePerHour === void 0) {
      return res.status(400).json({ message: "El precio base por hora es requerido." });
    }
    const updated = dbStore.updateFieldRate(id, Number(basePricePerHour));
    if (!updated) {
      return res.status(404).json({ message: "Cancha no encontrada." });
    }
    res.json(updated);
  });
  app2.get("/api/admin/prices", requireAdmin, (req, res) => {
    res.json(dbStore.getDynamicPrices());
  });
  app2.post("/api/admin/prices", requireAdmin, (req, res) => {
    const { courtId, dayOfWeek, startHour, endHour, rate } = req.body;
    if (courtId === void 0 || rate === void 0) {
      return res.status(400).json({ message: "Datos de tarifa din\xE1mica incompletos." });
    }
    const newRule = dbStore.addDynamicPrice({
      courtId,
      dayOfWeek: Number(dayOfWeek),
      startHour: startHour || "18:00",
      endHour: endHour || "22:00",
      rate: Number(rate)
    });
    res.status(201).json(newRule);
  });
  app2.delete("/api/admin/prices/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteDynamicPrice(id);
    if (!deleted) {
      return res.status(404).json({ message: "Regla de tarifa din\xE1mica no encontrada." });
    }
    res.json({ success: true, message: "Regla eliminada con \xE9xito." });
  });
  app2.get("/api/reservations", (req, res) => {
    res.json(dbStore.getReservations());
  });
  app2.post("/api/reservations", (req, res) => {
    const {
      name,
      email,
      phone,
      date,
      timeSlot,
      duration,
      fieldId,
      hasLights,
      extras,
      totalPrice
    } = req.body;
    if (!name || !email || !phone || !date || !timeSlot || !fieldId || !totalPrice) {
      return res.status(400).json({ message: "Faltan campos obligatorios para completar la reserva." });
    }
    const existing = dbStore.getReservations().find(
      (r) => r.fieldId === fieldId && r.date === date && r.timeSlot === timeSlot && r.status !== "cancelled"
    );
    if (existing) {
      return res.status(400).json({ message: "El horario seleccionado ya se encuentra reservado para esta cancha." });
    }
    const reservationId = "res-" + Math.random().toString(36).substr(2, 9);
    let clientUser = dbStore.getUserByEmail(email);
    if (!clientUser) {
      clientUser = dbStore.addUser({
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        role: "user"
      });
    }
    const field = FIELDS.find((f) => f.id === fieldId) || FIELDS[0];
    const newReservation = {
      id: reservationId,
      userId: clientUser.id,
      userName: name,
      userEmail: email,
      userPhone: phone,
      date,
      timeSlot,
      duration: Number(duration),
      fieldId,
      fieldName: field.name,
      hasLights: !!hasLights,
      extras: extras || { balls: false, bibs: false, referee: false },
      totalPrice: Number(totalPrice),
      status: "pending",
      paymentStatus: "pending",
      entryCode: generateEntryCode(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = dbStore.addReservation(newReservation);
    sendReservationWhatsApp(saved).catch((err) => {
      console.error("[TWILIO EXCEPTION]: Error sending automated transaction WhatsApp:", err);
    });
    sendReservationEmail(saved).catch((err) => {
      console.error("[EMAIL EXCEPTION]: Error sending confirmation email copy:", err);
    });
    res.status(201).json(saved);
  });
  app2.put("/api/reservations/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    if (!status) {
      return res.status(400).json({ message: "ID y estado son requeridos para actualizar." });
    }
    const updated = dbStore.updateReservationStatus(id, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ message: "No se encontr\xF3 la reserva." });
    }
    sendReservationWhatsApp(updated).catch((err) => {
      console.error("[TWILIO EXCEPTION]: Error sending updated WhatsApp notification:", err);
    });
    sendReservationEmail(updated).catch((err) => {
      console.error("[EMAIL EXCEPTION]: Error sending updated email notification:", err);
    });
    res.json(updated);
  });
  app2.delete("/api/reservations/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteReservation(id);
    if (!deleted) {
      return res.status(404).json({ message: "No se encontr\xF3 la reserva." });
    }
    res.json({ success: true, message: "Reserva eliminada con \xE9xito." });
  });
  app2.post("/api/payments", (req, res) => {
    const { reservationId, amount, paymentMethod, transactionId } = req.body;
    if (!reservationId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Faltan datos requeridos del pago." });
    }
    const paymentId = "pay-" + Math.random().toString(36).substr(2, 9);
    const newPayment = {
      id: paymentId,
      reservationId,
      amount: Number(amount),
      paymentMethod,
      transactionId: transactionId || "tx_sim_" + Math.random().toString(36).substr(2, 9),
      status: "completed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const savedPayment = dbStore.addPayment(newPayment);
    const resObj = dbStore.getReservations().find((r) => r.id === savedPayment.reservationId);
    if (resObj) {
      sendReservationWhatsApp(resObj).catch((err) => {
        console.error("[TWILIO EXCEPTION]: Error sending payment confirmation WhatsApp:", err);
      });
      sendReservationEmail(resObj).catch((err) => {
        console.error("[EMAIL EXCEPTION]: Error sending payment confirmation Email:", err);
      });
    }
    res.status(201).json(savedPayment);
  });
  app2.get("/api/promotions", (req, res) => {
    res.json(dbStore.getPromotions());
  });
  app2.get("/api/promotions/all", requireAdmin, (req, res) => {
    res.json(dbStore.getAllPromotionsAdmin());
  });
  app2.post("/api/promotions", requireAdmin, (req, res) => {
    const { title, description, discountPercentage, promoCode, validUntil, type } = req.body;
    if (!title || !description || validUntil === void 0) {
      return res.status(400).json({ message: "Campos requeridos faltantes." });
    }
    const newPromo = {
      id: "promo-" + Math.random().toString(36).substr(2, 9),
      title,
      description,
      discountPercentage: Number(discountPercentage) || 0,
      promoCode: promoCode || void 0,
      validUntil,
      isActive: true,
      type: type || "discount"
    };
    const saved = dbStore.addPromotion(newPromo);
    res.status(201).json(saved);
  });
  app2.put("/api/promotions/:id/toggle", requireAdmin, (req, res) => {
    const { id } = req.params;
    const updated = dbStore.togglePromotion(id);
    if (!updated) {
      return res.status(404).json({ message: "Promoci\xF3n no encontrada." });
    }
    res.json(updated);
  });
  app2.delete("/api/promotions/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deletePromotion(id);
    if (!deleted) {
      return res.status(404).json({ message: "Promoci\xF3n no encontrada." });
    }
    res.json({ success: true, message: "Promoci\xF3n eliminada." });
  });
  app2.get("/api/gallery", (req, res) => {
    res.json(dbStore.getPhotos());
  });
  app2.post("/api/gallery", requireAdmin, (req, res) => {
    const { url, caption, category } = req.body;
    if (!url || !caption) {
      return res.status(400).json({ message: "URL y t\xEDtulo de la imagen son requeridos." });
    }
    const newPhoto = {
      id: "photo-" + Math.random().toString(36).substr(2, 9),
      url,
      caption,
      category: category || "facilities",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = dbStore.addPhoto(newPhoto);
    res.status(201).json(saved);
  });
  app2.delete("/api/gallery/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deletePhoto(id);
    if (!deleted) {
      return res.status(404).json({ message: "Imagen no encontrada." });
    }
    res.json({ success: true, message: "Imagen eliminada exitosamente del cat\xE1logo." });
  });
  app2.get("/api/videos", (req, res) => {
    res.json(dbStore.getVideos());
  });
  app2.post("/api/videos", requireAdmin, (req, res) => {
    const { title, url, thumbnailUrl, category, isLive } = req.body;
    if (!title || !url) {
      return res.status(400).json({ message: "El t\xEDtulo y la URL del video son obligatorios." });
    }
    const newVideo = {
      id: "vid-" + Math.random().toString(36).substr(2, 9),
      title,
      url,
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400",
      category: category || "highlight",
      isLive: !!isLive,
      views: 0,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = dbStore.addVideo(newVideo);
    res.status(201).json(saved);
  });
  app2.put("/api/videos/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { title, url, thumbnailUrl, category, isLive } = req.body;
    const updated = dbStore.updateVideo(id, {
      title,
      url,
      thumbnailUrl,
      category,
      isLive: isLive !== void 0 ? !!isLive : void 0
    });
    if (!updated) {
      return res.status(404).json({ message: "Video no encontrado." });
    }
    res.json(updated);
  });
  app2.delete("/api/videos/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteVideo(id);
    if (!deleted) {
      return res.status(404).json({ message: "Video no encontrado." });
    }
    res.json({ success: true, message: "Video eliminado exitosamente." });
  });
  app2.get("/api/teams", (req, res) => {
    res.json(dbStore.getTeams());
  });
  app2.post("/api/teams", requireAdmin, (req, res) => {
    const {
      name,
      color,
      captainContact,
      goalsFor,
      gamesPlayed,
      gamesWon,
      gamesDrawn,
      gamesLost,
      goalsAgainst,
      points,
      form
    } = req.body;
    if (!name || !color || !captainContact) {
      return res.status(400).json({ message: "Nombre, color y contacto del capit\xE1n son obligatorios." });
    }
    const matches = dbStore.getTeams().some((t) => t.name.toLowerCase() === name.toLowerCase());
    if (matches) {
      return res.status(400).json({ message: "Ya existe un equipo con ese nombre de escuadra." });
    }
    const newTeam = {
      id: "team-" + Math.random().toString(36).substr(2, 9),
      name,
      color,
      captainContact,
      goalsFor: Number(goalsFor) || 0,
      gamesPlayed: Number(gamesPlayed) || 0,
      gamesWon: Number(gamesWon) || 0,
      gamesDrawn: Number(gamesDrawn) || 0,
      gamesLost: Number(gamesLost) || 0,
      goalsAgainst: Number(goalsAgainst) || 0,
      points: Number(points) || 0,
      form: Array.isArray(form) ? form : [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = dbStore.addTeam(newTeam);
    res.status(201).json(saved);
  });
  app2.put("/api/teams/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const {
      name,
      color,
      captainContact,
      goalsFor,
      gamesPlayed,
      gamesWon,
      gamesDrawn,
      gamesLost,
      goalsAgainst,
      points,
      form
    } = req.body;
    const updated = dbStore.updateTeam(id, {
      name,
      color,
      captainContact,
      goalsFor: Number(goalsFor) || 0,
      gamesPlayed: gamesPlayed !== void 0 ? Number(gamesPlayed) : void 0,
      gamesWon: gamesWon !== void 0 ? Number(gamesWon) : void 0,
      gamesDrawn: gamesDrawn !== void 0 ? Number(gamesDrawn) : void 0,
      gamesLost: gamesLost !== void 0 ? Number(gamesLost) : void 0,
      goalsAgainst: goalsAgainst !== void 0 ? Number(goalsAgainst) : void 0,
      points: points !== void 0 ? Number(points) : void 0,
      form: Array.isArray(form) ? form : void 0
    });
    if (!updated) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }
    res.json(updated);
  });
  app2.delete("/api/teams/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteTeam(id);
    if (!deleted) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }
    res.json({ success: true, message: "Equipo y jugadores correspondientes eliminados." });
  });
  app2.get("/api/players", (req, res) => {
    res.json(dbStore.getPlayers());
  });
  app2.post("/api/players", requireAdmin, (req, res) => {
    const { teamId, name, age, position, contact, goals } = req.body;
    if (!teamId || !name || !age || !position) {
      return res.status(400).json({ message: "Equipo, nombre, edad y posici\xF3n son campos requeridos." });
    }
    const newPlayer = {
      id: "player-" + Math.random().toString(36).substr(2, 9),
      teamId,
      name,
      age: Number(age),
      position,
      contact: contact || "",
      goals: Number(goals) || 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = dbStore.addPlayer(newPlayer);
    res.status(201).json(saved);
  });
  app2.put("/api/players/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { teamId, name, age, position, contact, goals } = req.body;
    const updated = dbStore.updatePlayer(id, { teamId, name, age: Number(age), position, contact, goals: Number(goals) || 0 });
    if (!updated) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }
    res.json(updated);
  });
  app2.delete("/api/players/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deletePlayer(id);
    if (!deleted) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }
    res.json({ success: true, message: "Jugador eliminado exitosamente de la plantilla." });
  });
  app2.get("/api/reviews", (req, res) => {
    const reviews = dbStore.getReviews().filter((r) => r.status === "approved");
    res.json(reviews);
  });
  app2.get("/api/reviews/admin", requireAdmin, (req, res) => {
    res.json(dbStore.getReviews());
  });
  app2.post("/api/reviews", (req, res) => {
    const user = getUserFromHeader(req);
    if (!user) {
      return res.status(401).json({ message: "Inicia sesi\xF3n para dejar una rese\xF1a." });
    }
    const { fieldId, rating, comment, reservationId } = req.body;
    if (!fieldId || !rating || !comment) {
      return res.status(400).json({ message: "Faltan campos obligatorios para registrar tu calificaci\xF3n." });
    }
    const field = FIELDS.find((f) => f.id === fieldId);
    if (!field) {
      return res.status(400).json({ message: "La cancha seleccionada no es v\xE1lida." });
    }
    if (reservationId) {
      const reservation = dbStore.getReservations().find((r) => r.id === reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "No se encontr\xF3 la reservaci\xF3n indicada." });
      }
      if (user.role !== "admin" && reservation.userEmail.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(403).json({ message: "No tienes permisos para calificar esta reservaci\xF3n." });
      }
    }
    const newReview = {
      id: "rev-" + Math.random().toString(36).substr(2, 9),
      fieldId,
      fieldName: field.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      rating: Number(rating),
      comment,
      status: "pending",
      // Requires admin moderation
      reservationId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = dbStore.addReview(newReview);
    res.status(201).json(saved);
  });
  app2.put("/api/reviews/:id/moderate", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "El estado es requerido." });
    }
    const updated = dbStore.updateReviewStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: "Rese\xF1a no encontrada." });
    }
    res.json(updated);
  });
  app2.post("/api/reviews/:id/reply", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;
    if (reply === void 0) {
      return res.status(400).json({ message: "El comentario de respuesta es requerido." });
    }
    const updated = dbStore.replyToReview(id, reply);
    if (!updated) {
      return res.status(404).json({ message: "Rese\xF1a no encontrada." });
    }
    res.json(updated);
  });
  app2.delete("/api/reviews/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteReview(id);
    if (!deleted) {
      return res.status(404).json({ message: "Rese\xF1a no encontrada." });
    }
    res.json({ success: true, message: "Rese\xF1a eliminada con \xE9xito." });
  });
  app2.get("/api/stats", requireAdmin, (req, res) => {
    res.json(dbStore.getStats());
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app2.use(import_express.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK SERVER] Ejecut\xE1ndose correctamente en http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Error al iniciar el servidor Express + Vite full-stack:", err);
});
//# sourceMappingURL=server.cjs.map
