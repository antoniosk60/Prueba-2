import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, real } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Fields Table (Canchas)
export const fields = pgTable('fields', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  basePricePerHour: integer('base_price_per_hour').notNull(),
  lightPriceSurcharge: integer('light_price_surcharge').notNull(),
  nightHoursStart: integer('night_hours_start').notNull(),
  imageUrl: text('image_url'),
});

// 3. Reservations Table
export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  userPhone: text('user_phone').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('time_slot').notNull(),
  duration: real('duration').notNull(),
  fieldId: text('field_id').references(() => fields.id),
  fieldName: text('field_name'),
  hasLights: boolean('has_lights').default(false).notNull(),
  totalPrice: integer('total_price').notNull(),
  status: text('status').default('pending').notNull(), // pending, confirmed, cancelled
  paymentStatus: text('payment_status').default('pending').notNull(), // pending, paid
  entryCode: text('entry_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Payments Table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  reservationId: text('reservation_id').references(() => reservations.id).notNull(),
  amount: integer('amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // stripe, cash, etc.
  transactionId: text('transaction_id'),
  status: text('status').default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Promotions Table
export const promotions = pgTable('promotions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  discountPercentage: integer('discount_percentage').default(0).notNull(),
  promoCode: text('promo_code'),
  validUntil: text('valid_until').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  type: text('type').default('discount').notNull(), // discount, tournament
});

// 6. Photos Table
export const photos = pgTable('photos', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  caption: text('caption').notNull(),
  category: text('category').default('facilities').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// 7. Videos Table
export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').default('highlight').notNull(),
  isLive: boolean('is_live').default(false).notNull(),
  views: integer('views').default(0).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// 8. Teams Table
export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
  captainContact: text('captain_contact').notNull(),
  goalsFor: integer('goals_for').default(0).notNull(),
  gamesPlayed: integer('games_played').default(0).notNull(),
  gamesWon: integer('games_won').default(0).notNull(),
  gamesDrawn: integer('games_drawn').default(0).notNull(),
  gamesLost: integer('games_lost').default(0).notNull(),
  goalsAgainst: integer('goals_against').default(0).notNull(),
  points: integer('points').default(0).notNull(),
  form: text('form'), // Store as JSON string or comma-separated list
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Players Table
export const players = pgTable('players', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  position: text('position').notNull(),
  contact: text('contact'),
  goals: integer('goals').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Reviews Table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  fieldId: text('field_id').references(() => fields.id).notNull(),
  fieldName: text('field_name'),
  userId: text('user_id'),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  reply: text('reply'),
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  reservationId: text('reservation_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Dynamic Prices Table
export const dynamicPrices = pgTable('dynamic_prices', {
  id: text('id').primaryKey(),
  courtId: text('court_id').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startHour: text('start_hour').notNull(), // e.g. "18:00"
  endHour: text('end_hour').notNull(), // e.g. "22:00"
  rate: integer('rate').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
}));

export const fieldsRelations = relations(fields, ({ many }) => ({
  reservations: many(reservations),
  reviews: many(reviews),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.uid],
  }),
  field: one(fields, {
    fields: [reservations.fieldId],
    references: [fields.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  field: one(fields, {
    fields: [reviews.fieldId],
    references: [fields.id],
  }),
}));
