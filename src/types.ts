/**
 * Types and models for the Soccer Booking System (Cancha de Fútbol Rápido)
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  password?: string; // Optional password for registered users
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "18:00 - 19:00"
  duration: number; // in hours (1 or 1.5)
  fieldId: string; // e.g., "principal" or "secundaria"
  fieldName: string; // e.g., "Cancha 1 (Techada)"
  hasLights: boolean; // extra light surcharge
  extras: {
    balls: boolean;
    bibs: boolean;
    referee: boolean;
  };
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  entryCode?: string; // Access code for the complex
  createdAt: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  paymentMethod: 'stripe' | 'paypal' | 'whatsapp_transfer' | 'cash';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  promoCode?: string;
  validUntil: string; // YYYY-MM-DD
  isActive: boolean;
  type: 'discount' | 'tournament' | 'special';
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  category: 'facilities' | 'matches' | 'events';
  uploadedAt: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  category: 'live' | 'highlight' | 'full_match';
  isLive: boolean;
  views: number;
  uploadedAt: string;
}

export interface Team {
  id: string;
  name: string;
  color: string; // color del uniforme
  captainContact: string; // teléfono o contacto del capitán
  goalsFor: number; // goles a favor o puntos en el torneo
  createdAt: string;
}

export interface Player {
  id: string;
  teamId: string;
  teamName?: string; // Nombre del equipo resuelto temporalmente
  name: string;
  age: number;
  position: string; // Portero, Defensa, Medio, Delantero
  contact: string;
  goals?: number; // Goles marcados en el torneo
  createdAt: string;
}

export interface AppStats {
  totalReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  activePromotionsCount: number;
  teamsCount: number;
  playersCount: number;
  recentBookings: Reservation[];
}

export interface FieldConfig {
  id: string;
  name: string;
  description: string;
  basePricePerHour: number;
  lightPriceSurcharge: number; // surcharge if booking is in late hours
  nightHoursStart: number; // e.g. 18 (for 6:00 PM)
  imageUrl: string;
}

export interface Review {
  id: string;
  fieldId: string;
  fieldName: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  comment: string;
  reply?: string; // respond from administrator
  status: 'pending' | 'approved' | 'rejected';
  reservationId?: string; // optional binded reservation
  createdAt: string;
}

