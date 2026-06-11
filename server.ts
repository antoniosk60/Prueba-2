import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore, signToken, verifyToken, FIELDS } from './server/dbStore';
import { Reservation, Payment, Promotion, Photo, Video, User, Team, Player, Review } from './src/types';
import { sendReservationWhatsApp, generateEntryCode } from './server/twilioService';


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // Helper middleware for Admin verification via Authorization header
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Autenticación requerida.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso exclusivo para administradores.' });
    }

    req.body.adminUser = decoded;
    next();
  };

  const getUserFromHeader = (req: express.Request): any | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  };

  // --- API ROUTES ---

  // 1. Auth Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const emailLower = email.toLowerCase();

    // Default testing configuration for Admin
    if (emailLower === 'admin@canchafutbol.com' && password === 'admin') {
      const adminUser = dbStore.getUserById('admin-01');
      if (adminUser) {
        const token = signToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role });
        return res.json({
          token,
          user: adminUser
        });
      }
    }

    // Standard registered user login
    const user = dbStore.getUserByEmail(emailLower);
    if (user && user.password === password) {
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        token,
        user
      });
    }

    return res.status(401).json({ message: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  });

  // 1a. Register Endpoint
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos para completar el registro.' });
    }

    const emailLower = email.toLowerCase();
    const existing = dbStore.getUserByEmail(emailLower);
    if (existing) {
      if (!existing.password) {
        // Upgrade passwordless user
        existing.password = password;
        if (name) existing.name = name;
        if (phone) existing.phone = phone;
        dbStore.updatePlayer(existing.id, { contact: phone }); // update if linked
        dbStore.save();
        const token = signToken({ id: existing.id, email: existing.email, role: existing.role });
        return res.json({
          message: 'Cuenta actualizada exitosamente.',
          token,
          user: existing
        });
      }
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    const newUser = dbStore.addUser({
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      name,
      email: emailLower,
      phone,
      role: 'user',
      password
    });

    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      user: newUser
    });
  });

  // 2. Fields API
  app.get('/api/fields', (req, res) => {
    res.json(dbStore.getFields());
  });

  // 2b. Fields update & Dynamic pricing management API
  app.put('/api/fields/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { basePricePerHour } = req.body;
    if (basePricePerHour === undefined) {
      return res.status(400).json({ message: 'El precio base por hora es requerido.' });
    }
    const updated = dbStore.updateFieldRate(id, Number(basePricePerHour));
    if (!updated) {
      return res.status(404).json({ message: 'Cancha no encontrada.' });
    }
    res.json(updated);
  });

  app.get('/api/admin/prices', requireAdmin, (req, res) => {
    res.json(dbStore.getDynamicPrices());
  });

  app.post('/api/admin/prices', requireAdmin, (req, res) => {
    const { courtId, dayOfWeek, startHour, endHour, rate } = req.body;
    if (courtId === undefined || rate === undefined) {
      return res.status(400).json({ message: 'Datos de tarifa dinámica incompletos.' });
    }
    const newRule = dbStore.addDynamicPrice({
      courtId,
      dayOfWeek: Number(dayOfWeek),
      startHour: startHour || '18:00',
      endHour: endHour || '22:00',
      rate: Number(rate)
    });
    res.status(201).json(newRule);
  });

  app.delete('/api/admin/prices/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteDynamicPrice(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Regla de tarifa dinámica no encontrada.' });
    }
    res.json({ success: true, message: 'Regla eliminada con éxito.' });
  });

  // 3. Reservations API
  app.get('/api/reservations', (req, res) => {
    res.json(dbStore.getReservations());
  });

  app.post('/api/reservations', (req, res) => {
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
      return res.status(400).json({ message: 'Faltan campos obligatorios para completar la reserva.' });
    }

    // Check if slot is already booked for this field and date
    const existing = dbStore.getReservations().find(r => 
      r.fieldId === fieldId && 
      r.date === date && 
      r.timeSlot === timeSlot && 
      r.status !== 'cancelled'
    );

    if (existing) {
      return res.status(400).json({ message: 'El horario seleccionado ya se encuentra reservado para esta cancha.' });
    }

    // Create unique ID for reservation
    const reservationId = 'res-' + Math.random().toString(36).substr(2, 9);
    
    // Find or create user representing the client
    let clientUser = dbStore.getUserByEmail(email);
    if (!clientUser) {
      clientUser = dbStore.addUser({
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        role: 'user'
      });
    }

    const field = FIELDS.find(f => f.id === fieldId) || FIELDS[0];

    const newReservation: Reservation = {
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
      status: 'pending',
      paymentStatus: 'pending',
      entryCode: generateEntryCode(),
      createdAt: new Date().toISOString()
    };

    const saved = dbStore.addReservation(newReservation);
    
    // Send automated WhatsApp notification asynchronously in the background
    sendReservationWhatsApp(saved).catch(err => {
      console.error('[TWILIO EXCEPTION]: Error sending automated transaction WhatsApp:', err);
    });

    res.status(201).json(saved);
  });

  app.put('/api/reservations/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'ID y estado son requeridos para actualizar.' });
    }

    const updated = dbStore.updateReservationStatus(id, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ message: 'No se encontró la reserva.' });
    }

    // Send WhatsApp notification of updated reservation status
    sendReservationWhatsApp(updated).catch(err => {
      console.error('[TWILIO EXCEPTION]: Error sending updated WhatsApp notification:', err);
    });

    res.json(updated);
  });

  app.delete('/api/reservations/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteReservation(id);
    if (!deleted) {
      return res.status(404).json({ message: 'No se encontró la reserva.' });
    }
    res.json({ success: true, message: 'Reserva eliminada con éxito.' });
  });

  // 4. Payments API (Simulated Checkout integration)
  app.post('/api/payments', (req, res) => {
    const { reservationId, amount, paymentMethod, transactionId } = req.body;

    if (!reservationId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'Faltan datos requeridos del pago.' });
    }

    const paymentId = 'pay-' + Math.random().toString(36).substr(2, 9);
    const newPayment: Payment = {
      id: paymentId,
      reservationId,
      amount: Number(amount),
      paymentMethod,
      transactionId: transactionId || 'tx_sim_' + Math.random().toString(36).substr(2, 9),
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    const savedPayment = dbStore.addPayment(newPayment);

    // After adding the payment, the reservation is confirmed/paid automatically.
    // Fetch the updated reservation from the dbStore and send a WhatsApp confirmation.
    const resObj = dbStore.getReservations().find(r => r.id === savedPayment.reservationId);
    if (resObj) {
      sendReservationWhatsApp(resObj).catch(err => {
        console.error('[TWILIO EXCEPTION]: Error sending payment confirmation WhatsApp:', err);
      });
    }

    res.status(201).json(savedPayment);
  });

  // 5. Promotions API
  app.get('/api/promotions', (req, res) => {
    res.json(dbStore.getPromotions());
  });

  app.get('/api/promotions/all', requireAdmin, (req, res) => {
    res.json(dbStore.getAllPromotionsAdmin());
  });

  app.post('/api/promotions', requireAdmin, (req, res) => {
    const { title, description, discountPercentage, promoCode, validUntil, type } = req.body;

    if (!title || !description || validUntil === undefined) {
      return res.status(400).json({ message: 'Campos requeridos faltantes.' });
    }

    const newPromo: Promotion = {
      id: 'promo-' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      discountPercentage: Number(discountPercentage) || 0,
      promoCode: promoCode || undefined,
      validUntil,
      isActive: true,
      type: type || 'discount'
    };

    const saved = dbStore.addPromotion(newPromo);
    res.status(201).json(saved);
  });

  app.put('/api/promotions/:id/toggle', requireAdmin, (req, res) => {
    const { id } = req.params;
    const updated = dbStore.togglePromotion(id);
    if (!updated) {
      return res.status(404).json({ message: 'Promoción no encontrada.' });
    }
    res.json(updated);
  });

  app.delete('/api/promotions/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deletePromotion(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Promoción no encontrada.' });
    }
    res.json({ success: true, message: 'Promoción eliminada.' });
  });

  // 6. Gallery API
  app.get('/api/gallery', (req, res) => {
    res.json(dbStore.getPhotos());
  });

  app.post('/api/gallery', requireAdmin, (req, res) => {
    const { url, caption, category } = req.body;

    if (!url || !caption) {
      return res.status(400).json({ message: 'URL y título de la imagen son requeridos.' });
    }

    const newPhoto: Photo = {
      id: 'photo-' + Math.random().toString(36).substr(2, 9),
      url,
      caption,
      category: category || 'facilities',
      uploadedAt: new Date().toISOString()
    };

    const saved = dbStore.addPhoto(newPhoto);
    res.status(201).json(saved);
  });

  app.delete('/api/gallery/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deletePhoto(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Imagen no encontrada.' });
    }
    res.json({ success: true, message: 'Imagen eliminada exitosamente del catálogo.' });
  });

  // 6.5 Videos API
  app.get('/api/videos', (req, res) => {
    res.json(dbStore.getVideos());
  });

  app.post('/api/videos', requireAdmin, (req, res) => {
    const { title, url, thumbnailUrl, category, isLive } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'El título y la URL del video son obligatorios.' });
    }

    const newVideo: Video = {
      id: 'vid-' + Math.random().toString(36).substr(2, 9),
      title,
      url,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400',
      category: category || 'highlight',
      isLive: !!isLive,
      views: 0,
      uploadedAt: new Date().toISOString()
    };

    const saved = dbStore.addVideo(newVideo);
    res.status(201).json(saved);
  });

  app.put('/api/videos/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { title, url, thumbnailUrl, category, isLive } = req.body;

    const updated = dbStore.updateVideo(id, {
      title,
      url,
      thumbnailUrl,
      category,
      isLive: isLive !== undefined ? !!isLive : undefined
    });

    if (!updated) {
      return res.status(404).json({ message: 'Video no encontrado.' });
    }

    res.json(updated);
  });

  app.delete('/api/videos/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteVideo(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Video no encontrado.' });
    }
    res.json({ success: true, message: 'Video eliminado exitosamente.' });
  });

  // 7. Teams (Equipos) API
  app.get('/api/teams', (req, res) => {
    res.json(dbStore.getTeams());
  });

  app.post('/api/teams', requireAdmin, (req, res) => {
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
      return res.status(400).json({ message: 'Nombre, color y contacto del capitán son obligatorios.' });
    }

    // Check duplicate name
    const matches = dbStore.getTeams().some(t => t.name.toLowerCase() === name.toLowerCase());
    if (matches) {
      return res.status(400).json({ message: 'Ya existe un equipo con ese nombre de escuadra.' });
    }

    const newTeam: Team = {
      id: 'team-' + Math.random().toString(36).substr(2, 9),
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
      createdAt: new Date().toISOString()
    };

    const saved = dbStore.addTeam(newTeam);
    res.status(201).json(saved);
  });

  app.put('/api/teams/:id', requireAdmin, (req, res) => {
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
      gamesPlayed: gamesPlayed !== undefined ? Number(gamesPlayed) : undefined,
      gamesWon: gamesWon !== undefined ? Number(gamesWon) : undefined,
      gamesDrawn: gamesDrawn !== undefined ? Number(gamesDrawn) : undefined,
      gamesLost: gamesLost !== undefined ? Number(gamesLost) : undefined,
      goalsAgainst: goalsAgainst !== undefined ? Number(goalsAgainst) : undefined,
      points: points !== undefined ? Number(points) : undefined,
      form: Array.isArray(form) ? form : undefined
    });
    if (!updated) {
      return res.status(404).json({ message: 'Equipo no encontrado.' });
    }
    res.json(updated);
  });

  app.delete('/api/teams/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteTeam(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Equipo no encontrado.' });
    }
    res.json({ success: true, message: 'Equipo y jugadores correspondientes eliminados.' });
  });


  // 8. Players (Jugadores) API
  app.get('/api/players', (req, res) => {
    res.json(dbStore.getPlayers());
  });

  app.post('/api/players', requireAdmin, (req, res) => {
    const { teamId, name, age, position, contact, goals } = req.body;

    if (!teamId || !name || !age || !position) {
      return res.status(400).json({ message: 'Equipo, nombre, edad y posición son campos requeridos.' });
    }

    const newPlayer: Player = {
      id: 'player-' + Math.random().toString(36).substr(2, 9),
      teamId,
      name,
      age: Number(age),
      position,
      contact: contact || '',
      goals: Number(goals) || 0,
      createdAt: new Date().toISOString()
    };

    const saved = dbStore.addPlayer(newPlayer);
    res.status(201).json(saved);
  });

  app.put('/api/players/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { teamId, name, age, position, contact, goals } = req.body;

    const updated = dbStore.updatePlayer(id, { teamId, name, age: Number(age), position, contact, goals: Number(goals) || 0 });
    if (!updated) {
      return res.status(404).json({ message: 'Jugador no encontrado.' });
    }
    res.json(updated);
  });

  app.delete('/api/players/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deletePlayer(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Jugador no encontrado.' });
    }
    res.json({ success: true, message: 'Jugador eliminado exitosamente de la plantilla.' });
  });


  // 8b. Reviews API (Calificaciones y Comentarios)
  // Public GET: returns approved reviews only
  app.get('/api/reviews', (req, res) => {
    const reviews = dbStore.getReviews().filter(r => r.status === 'approved');
    res.json(reviews);
  });

  // Admin GET: returns all reviews (pending, approved, rejected)
  app.get('/api/reviews/admin', requireAdmin, (req, res) => {
    res.json(dbStore.getReviews());
  });

  // Post Review: requires a logged-in user
  app.post('/api/reviews', (req, res) => {
    const user = getUserFromHeader(req);
    if (!user) {
      return res.status(401).json({ message: 'Inicia sesión para dejar una reseña.' });
    }

    const { fieldId, rating, comment, reservationId } = req.body;

    if (!fieldId || !rating || !comment) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para registrar tu calificación.' });
    }

    const field = FIELDS.find(f => f.id === fieldId);
    if (!field) {
      return res.status(400).json({ message: 'La cancha seleccionada no es válida.' });
    }

    // Optionally check reservation validity
    if (reservationId) {
      const reservation = dbStore.getReservations().find(r => r.id === reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'No se encontró la reservación indicada.' });
      }
      if (user.role !== 'admin' && reservation.userEmail.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(403).json({ message: 'No tienes permisos para calificar esta reservación.' });
      }
    }

    const newReview: Review = {
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      fieldId,
      fieldName: field.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      rating: Number(rating),
      comment,
      status: 'pending', // Requires admin moderation
      reservationId,
      createdAt: new Date().toISOString()
    };

    const saved = dbStore.addReview(newReview);
    res.status(201).json(saved);
  });

  // Admin update moderation status (approve/reject)
  app.put('/api/reviews/:id/moderate', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'

    if (!status) {
      return res.status(400).json({ message: 'El estado es requerido.' });
    }

    const updated = dbStore.updateReviewStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Reseña no encontrada.' });
    }

    res.json(updated);
  });

  // Admin reply to a review
  app.post('/api/reviews/:id/reply', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    if (reply === undefined) {
      return res.status(400).json({ message: 'El comentario de respuesta es requerido.' });
    }

    const updated = dbStore.replyToReview(id, reply);
    if (!updated) {
      return res.status(404).json({ message: 'Reseña no encontrada.' });
    }

    res.json(updated);
  });

  // Admin delete a review
  app.delete('/api/reviews/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteReview(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Reseña no encontrada.' });
    }
    res.json({ success: true, message: 'Reseña eliminada con éxito.' });
  });

  // 9. Admin Analytics Stats API
  app.get('/api/stats', requireAdmin, (req, res) => {
    res.json(dbStore.getStats());
  });


  // --- VITE AND STATIC ASSETS HANDLER ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK SERVER] Ejecutándose correctamente en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor Express + Vite full-stack:', err);
});
