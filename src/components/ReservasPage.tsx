import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Lightbulb, MapPin, CheckCircle, CreditCard, Shield, AlertCircle, Sparkles, Star, MessageSquare } from 'lucide-react';
import { FieldConfig, Reservation, Review } from '../types';

interface ReservasPageProps {
  fields: FieldConfig[];
  user?: any;
  token?: string | null;
}

// Available Booking Time slots 
const TIME_SLOTS = [
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00", // Night Hours (Requires Lights)
  "19:00 - 20:00", // Night Hours
  "20:00 - 21:00", // Night Hours
  "21:00 - 22:00", // Night Hours
  "22:00 - 23:00"  // Night Hours
];

export default function ReservasPage({ fields, user, token }: ReservasPageProps) {
  const [selectedField, setSelectedField] = useState<FieldConfig | null>(fields[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [duration, setDuration] = useState<number>(1); // default 1 hour
  
  // Surcharges & Extras State
  const [ballSurcharge, setBallSurcharge] = useState(false);
  const [bibSurcharge, setBibSurcharge] = useState(false);
  const [refereeSurcharge, setRefereeSurcharge] = useState(false);

  // Client Information Form
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Checkout Options
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'whatsapp_transfer' | 'cash'>('stripe');
  const [stripeCard, setStripeCard] = useState('4242 •••• •••• 4242');
  const [stripeCvc, setStripeCvc] = useState('123');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Status values
  const [bookingsList, setBookingsList] = useState<Reservation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Reviews & Comments States
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newReviewFieldId, setNewReviewFieldId] = useState<string>(fields[0]?.id || 'cancha-1');
  const [newReviewResId, setNewReviewResId] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState<boolean>(false);
  const [filterFieldId, setFilterFieldId] = useState<string>('all');

  // Pre-load current reservations to prevent duplicate selections in the calendar
  const loadReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setBookingsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  useEffect(() => {
    loadReservations();
    loadReviews();
    // Default to today
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);

  // Autofill if user profile is loaded
  useEffect(() => {
    if (user) {
      setClientName(user.name || '');
      setClientEmail(user.email || '');
      setClientPhone(user.phone || '');
    } else {
      setClientName('');
      setClientEmail('');
      setClientPhone('');
    }
  }, [user]);

  // Review posting handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setIsReviewSubmitting(true);

    if (!token) {
      setReviewError('Debes iniciar sesión con tu cuenta para dejar una calificación.');
      setIsReviewSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fieldId: newReviewFieldId,
          rating: newRating,
          comment: newComment,
          reservationId: newReviewResId || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar reseña.');
      }

      setReviewSuccess('¡Comentario enviado! Tu calificación pasará a moderación de administración.');
      setNewComment('');
      setNewReviewResId('');
      setNewRating(5);
      loadReviews();
    } catch (err: any) {
      setReviewError(err.message || 'Ocurrió un error al enviar el comentario.');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Recalculate dynamic price taking surcharges, nocturne hours, and extras into account
  const calculatePricing = () => {
    if (!selectedField) return { base: 0, lights: 0, extras: 0, total: 0, isNight: false };

    const basePrice = selectedField.basePricePerHour;
    const durationMultiplier = duration; // 1 or 1.5

    // Detect if slot is in the night list (starting from selectedField.nightHoursStart, default 18:00)
    let isNight = false;
    if (selectedSlot) {
      const hourStart = parseInt(selectedSlot.split(':')[0]);
      if (hourStart >= selectedField.nightHoursStart) {
        isNight = true;
      }
    }

    const baseSum = basePrice * durationMultiplier;
    const lightsPrice = isNight ? (selectedField.lightPriceSurcharge * durationMultiplier) : 0;
    
    // Addons cost
    let extrasSum = 0;
    if (ballSurcharge) extrasSum += 50; // MXN
    if (bibSurcharge) extrasSum += 50; // MXN
    if (refereeSurcharge) extrasSum += 200; // MXN

    const totalCost = baseSum + lightsPrice + extrasSum;

    return {
      base: baseSum,
      lights: lightsPrice,
      extras: extrasSum,
      total: totalCost,
      isNight
    };
  };

  const pricing = calculatePricing();

  // Next 14 days calendar helper
  const getBookingDays = () => {
    const days = [];
    const date = new Date();
    for (let i = 0; i < 14; i++) {
      const futureDate = new Date(date);
      futureDate.setDate(date.getDate() + i);
      const str = futureDate.toISOString().split('T')[0];
      const dayLabel = futureDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
      days.push({ value: str, label: dayLabel });
    }
    return days;
  };

  const calendarDays = getBookingDays();

  // Slot occupancy checker
  const isSlotOccupied = (slot: string) => {
    if (!selectedField || !selectedDate) return false;
    return bookingsList.some(r => 
      r.fieldId === selectedField.id && 
      r.date === selectedDate && 
      r.timeSlot === slot && 
      r.status !== 'cancelled'
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessReservation(null);

    if (!selectedField) return;
    if (!selectedSlot) {
      setErrorMessage('Por favor selecciona una hora de juego para tu renta.');
      return;
    }
    if (!clientName || !clientEmail || !clientPhone) {
      setErrorMessage('Por favor completa todos tus datos personales de contacto de fútbol.');
      return;
    }

    // Check availability once more before submitting
    if (isSlotOccupied(selectedSlot)) {
      setErrorMessage('El horario elegido acaba de ser reservado. Intenta con otra hora.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Post Reservation
      const resObj = {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        date: selectedDate,
        timeSlot: selectedSlot,
        duration,
        fieldId: selectedField.id,
        hasLights: pricing.isNight,
        extras: {
          balls: ballSurcharge,
          bibs: bibSurcharge,
          referee: refereeSurcharge
        },
        totalPrice: pricing.total
      };

      const resResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resObj)
      });

      const resData = await resResponse.json();

      if (!resResponse.ok) {
        throw new Error(resData.message || 'Error al procesar la reservación');
      }

      // 2. Simulated payment gateway connection
      let transId = '';
      if (paymentMethod === 'stripe') {
        transId = 'ch_stripe_payout_' + Math.random().toString(36).substr(2, 9);
      } else if (paymentMethod === 'paypal') {
        transId = 'pay_paypal_order_' + Math.random().toString(36).substr(2, 9);
      } else if (paymentMethod === 'whatsapp_transfer') {
        transId = 'whatsapp_trans_' + Math.random().toString(36).substr(2, 9);
      }

      const payResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: resData.id,
          amount: pricing.total,
          paymentMethod,
          transactionId: transId
        })
      });

      if (!payResponse.ok) {
        throw new Error('La reserva se guardó, pero hubo un error de conexión al cobrador simulado.');
      }

      // Read finalized representation
      const finalized = { ...resData, paymentStatus: 'paid', status: 'confirmed' };
      setSuccessReservation(finalized);

      // Clean inputs
      setSelectedSlot('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setBallSurcharge(false);
      setBibSurcharge(false);
      setRefereeSurcharge(false);

      // Refresh list
      loadReservations();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error general de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Introduction */}
      <div className="space-y-4 text-center lg:text-left">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Reservar Cancha en Línea
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Selecciona tu cancha preferida, escoge un horario y completa tu pago seguro con Stripe, PayPal o transferencia para agendar tu partido de forma inmediata.
        </p>
      </div>

      {successReservation ? (
        /* SUCCESS RECEIPT ANIMATED PANEL */
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-400/30 text-center space-y-6 max-w-2xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">¡RENTA CONFIRMADA Y PAGADA!</span>
            <h3 className="font-display font-extrabold text-2xl text-white">¡Disfruta el Cotejo, {successReservation.userName}!</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">Tu folio de reserva es <strong className="text-gray-200 font-mono font-bold">{successReservation.id}</strong>. Hemos enviado las instrucciones de acceso, vestidores y tu código por correo electrónico y WhatsApp.</p>
          </div>

          {/* Twilio WhatsApp Sent Status Badge */}
          <div className="bg-[#25D366]/10 border border-[#25D366]/20 py-2.5 px-4 rounded-xl max-w-md mx-auto text-xs flex items-center justify-center space-x-2 text-[#25D366]">
            <span className="animate-pulse">💬</span>
            <span className="font-bold">Notificación Twilio WhatsApp enviada con éxito al {successReservation.userPhone}</span>
          </div>

          {/* Receipt details */}
          <div className="p-6 bg-emerald-950/15 rounded-2xl border border-emerald-900/20 text-left space-y-3 divide-y divide-emerald-950/20 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Cancha Seleccionada:</span>
              <strong className="text-white">{successReservation.fieldName}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Fecha y Hora agendada:</span>
              <strong className="text-white font-mono">{successReservation.date} a las {successReservation.timeSlot}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Duración:</span>
              <strong className="text-white">{successReservation.duration} Hora(s)</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Soporte LED Nocturno:</span>
              <strong className={successReservation.hasLights ? 'text-emerald-400 font-bold' : 'text-gray-300'}>
                {successReservation.hasLights ? 'Incluido (+ Surcharge)' : 'Sin luces requeridas'}
              </strong>
            </div>
            
            {/* NEW ENTRY CODE DISPLAY */}
            <div className="flex justify-between py-2 items-center text-sm">
              <span className="text-amber-400 font-bold">Código de Entrada al Complejo:</span>
              <strong className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono px-3 py-1 rounded-lg text-xs font-black tracking-wider">
                {successReservation.entryCode || 'GA-482109'}
              </strong>
            </div>

            <div className="flex justify-between pt-2 border-t border-emerald-900/30 text-sm font-bold">
              <span className="text-emerald-400">Total liquidado:</span>
              <strong className="text-white font-mono">${successReservation.totalPrice} MXN</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
            <button
              onClick={() => setSuccessReservation(null)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Nueva Reservación
            </button>
            <a
              href={`https://wa.me/525512345678?text=Hola,%20quisiera%20confirmar%20mi%20asistencia%20al%20partido%20con%20Folio:%20${successReservation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1fb354] text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
            >
              <span>Preguntar por WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        /* RESERVATION SYSTEM GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calendar, Time & Location (Left side) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Field Choice */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-emerald-950/20">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-black text-[10px] font-bold">1</span>
                <h3 className="font-display font-bold text-base text-white">Selecciona tu Cancha deportiva</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {fields.map((field) => {
                  const isChosen = selectedField?.id === field.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field)}
                      className={`p-4 rounded-xl cursor-pointer border text-left transition-all ${
                        isChosen
                          ? 'bg-emerald-900/10 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-emerald-950/5 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <h4 className="font-bold text-sm text-white">{field.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 lines-clamp-2 leading-relaxed">{field.description}</p>
                      <p className="text-xs font-mono font-semibold text-emerald-400 mt-2">${field.basePricePerHour} <span className="text-[9px] font-normal text-gray-400 font-sans">MXN/Hr</span></p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Interactive grid Calendar */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-emerald-950/20">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-black text-[10px] font-bold">2</span>
                <h3 className="font-display font-bold text-base text-white">Elige la Fecha de Juego</h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate === day.value;
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day.value);
                        setSelectedSlot(''); // reset slot when day changes
                      }}
                      className={`p-3 rounded-lg border text-xs font-medium font-mono transition-all text-center ${
                        isSelected
                          ? 'bg-emerald-500 text-black border-emerald-500 font-extrabold shadow-sm'
                          : 'bg-emerald-950/5 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-emerald-950/10'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Interactive Time Slots */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-emerald-950/20">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-black text-[10px] font-bold">3</span>
                <h3 className="font-display font-bold text-base text-white">Selecciona tu Horario</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {TIME_SLOTS.map((slot) => {
                  const occupied = isSlotOccupied(slot);
                  const isSelected = selectedSlot === slot;
                  
                  // Extract hours to warn if nighttime lights surcharge is activated
                  const hoursCheck = parseInt(slot.split(':')[0]);
                  const requiresLight = selectedField ? (hoursCheck >= selectedField.nightHoursStart) : false;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={occupied}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col items-center justify-center transition-all ${
                        occupied
                          ? 'bg-red-950/5 border-red-900/10 text-red-700/60 opacity-40 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-emerald-950/5 border-gray-800/40 text-gray-300 hover:border-gray-700 hover:bg-emerald-950/10'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono">{slot}</span>
                      </div>
                      {requiresLight && !occupied && (
                        <span className="text-[9px] text-emerald-400 font-medium font-sans flex items-center gap-0.5 mt-1">
                          <Lightbulb className="w-2.5 h-2.5" /> Foco LED Activo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Extras and Surcharges Addons */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-emerald-950/20">
                <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  ballSurcharge ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-transparent border-gray-800'
                }`}>
                  <input
                    type="checkbox"
                    checked={ballSurcharge}
                    onChange={(e) => setBallSurcharge(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold block text-white">Alquilar Balones</span>
                    <span className="text-[10px] text-gray-400 font-mono">+$50 MXN (Reta Completa)</span>
                  </div>
                </label>

                <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  bibSurcharge ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-transparent border-gray-800'
                }`}>
                  <input
                    type="checkbox"
                    checked={bibSurcharge}
                    onChange={(e) => setBibSurcharge(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold block text-white">Casacas / Petos</span>
                    <span className="text-[10px] text-gray-400 font-mono">+$50 MXN (10 piezas)</span>
                  </div>
                </label>

                <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  refereeSurcharge ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-transparent border-gray-800'
                }`}>
                  <input
                    type="checkbox"
                    checked={refereeSurcharge}
                    onChange={(e) => setRefereeSurcharge(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold block text-white">Servicio de Árbitro</span>
                    <span className="text-[10px] text-gray-400 font-mono">+$200 MXN (Juego Oficial)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Client info and payment choice */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-emerald-950/20">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-black text-[10px] font-bold">4</span>
                <h3 className="font-display font-bold text-base text-white">Datos de Responsable & Pago Seguro</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Vela"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-emerald-950/20 text-white font-medium p-3 rounded-xl border border-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. vela@gmail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-emerald-950/20 text-white font-medium p-3 rounded-xl border border-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Número Celular *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +52 55291823"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-emerald-950/20 text-white font-medium p-3 rounded-xl border border-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Set game duration */}
              <div className="pt-2">
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Duración del Partido</label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setDuration(1)}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      duration === 1 
                        ? 'bg-emerald-500 text-black border-emerald-500' 
                        : 'bg-emerald-950/5 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    1 Hora de Juego
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration(1.5)}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      duration === 1.5 
                        ? 'bg-emerald-500 text-black border-emerald-500' 
                        : 'bg-emerald-950/5 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    1.5 Horas de Juego
                  </button>
                </div>
              </div>

              {/* Secure simulated payment integrations */}
              <div className="space-y-3 pt-4 border-t border-emerald-950/20">
                <span className="block text-xs font-bold text-white">Método de Liquidación:</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all ${
                      paymentMethod === 'stripe' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-transparent border-gray-800 text-gray-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tarjeta (Stripe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all ${
                      paymentMethod === 'paypal' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-transparent border-gray-800 text-gray-400'
                    }`}
                  >
                    <span>PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('whatsapp_transfer')}
                    className={`p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all ${
                      paymentMethod === 'whatsapp_transfer' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-transparent border-gray-800 text-gray-400'
                    }`}
                  >
                    <span>Transferencia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all ${
                      paymentMethod === 'cash' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-transparent border-gray-800 text-gray-400'
                    }`}
                  >
                    <span>En Cancha (Efectivo)</span>
                  </button>
                </div>

                {/* Sub-panels for payments details */}
                {paymentMethod === 'stripe' && (
                  <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10 space-y-2.5 animate-fadeIn">
                    <p className="text-[11px] text-gray-400">Introduce los datos de tu tarjeta de prueba para simular la pasarela en Cloud Run (Sandbox):</p>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={stripeCard}
                        onChange={(e) => setStripeCard(e.target.value)}
                        placeholder="Número de Tarjeta"
                        className="col-span-2 bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-850"
                      />
                      <input
                        type="text"
                        value={stripeCvc}
                        onChange={(e) => setStripeCvc(e.target.value)}
                        placeholder="CVC"
                        className="bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-850 text-center"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10 space-y-2.5 animate-fadeIn">
                    <p className="text-[11px] text-gray-400">Acceso exprés simulado vía PayPal checkout API. Introduce tu e-mail:</p>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="paypal-sandbox-user@example.com"
                      className="w-full bg-emerald-950/20 text-white text-xs p-2.5 rounded-lg border border-gray-850"
                    />
                  </div>
                )}

                {paymentMethod === 'whatsapp_transfer' && (
                  <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10 text-left space-y-1 animate-fadeIn text-[11px]">
                    <p className="text-gray-300 font-semibold mb-1">Pasos para transferencia:</p>
                    <p className="text-gray-400">1. Al hacer clic en "Confirmar", nuestro sistema generará un Folio de Reserva.</p>
                    <p className="text-gray-400">2. Deberás transferir al número CLABE: <strong className="text-white font-mono">0121 8000 8122 3456</strong>.</p>
                    <p className="text-gray-400">3. Envía el comprobante de pago por WhatsApp para activación.</p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10 text-[11px] text-gray-400 animate-fadeIn">
                    <span>Deberás pagar completo en caja de recepción por lo menos 15 minutos antes de iniciar tu cotejo oficial para evitar cancelaciones automáticas.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Pricing Calculator Summary & Booking Activation (Right side) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 space-y-6 shadow-md text-left">
              <h3 className="font-display font-extrabold text-lg text-white pb-3 border-b border-emerald-950/20">Ficha de Cotización</h3>
              
              {selectedField ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedField.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedDate || 'Fecha sin elegir'} en {selectedSlot || 'Hora sin elegir'}</p>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-2.5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Precio Base Cancha ({duration} Hr):</span>
                      <span className="font-mono text-white">${pricing.base} MXN</span>
                    </div>

                    {pricing.lights > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span className="flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Iluminación LED Nocturna:</span>
                        <span className="font-mono">+${pricing.lights} MXN</span>
                      </div>
                    )}

                    {pricing.extras > 0 && (
                      <div className="flex justify-between">
                        <span>Adicionales (Balones / Casacas / Árbitro):</span>
                        <span className="font-mono text-white">+${pricing.extras} MXN</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-emerald-950/20 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white uppercase">Monto Total:</span>
                      <span className="text-2xl font-display font-black text-emerald-400 font-mono">${pricing.total} MXN</span>
                    </div>
                  </div>

                  {/* Submit Trigger Button */}
                  {errorMessage && (
                    <div className="p-3 bg-red-950/25 border border-red-900/30 text-red-400 rounded-xl text-xs flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-sm py-4 rounded-xl uppercase tracking-wider shadow-[0_5px_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer text-center block"
                    >
                      {isSubmitting ? 'Procediendo al Cobro...' : 'Confirmar & Pagar Cancha'}
                    </button>
                  </form>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Por favor escoge primero una de las canchas del complejo deportivo.</p>
              )}

              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>SSL Pago Encriptado de 256 bits</span>
              </div>
            </div>

            {/* Support Widget */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 text-left space-y-3.5">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold font-mono rounded inline-block uppercase">Dudas Frecuentes</span>
              <h4 className="font-display font-bold text-sm text-white">¿Puedo reagendar un cotejo deportivo?</h4>
              <p className="text-[11px] text-gray-400 leading-normal font-light">Sí, se aceptan re-calendarizaciones gratuitas solicitándolo a través del soporte de WhatsApp hasta con 24 horas de antelación.</p>
            </div>

          </div>

        </div>
      )}

      {/* SECCIÓN DE CALIFICACIONES Y COMENTARIOS */}
      <div className="mt-16 border-t border-emerald-950/20 pt-16 space-y-10 text-left">
        <div className="space-y-2">
          <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 justify-start">
            <Sparkles className="w-4 h-4" />
            Opinión de los Futbolistas
          </span>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Calificaciones y Comentarios de Canchas
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Nuestros clientes califican las instalaciones después de cada cotejo oficial. ¡Mira las opiniones o deja tu comentario si ya has completado un juego!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Panel Lateral: Promedio y Filtros */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-emerald-950/40 space-y-6 animate-fadeIn">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider font-mono">
                Puntuación General
              </h4>

              {/* Score Average */}
              <div className="flex items-center space-x-4">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                  {reviewsList.length > 0
                    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
                    : '5.0'}
                </div>
                <div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = reviewsList.length > 0 
                        ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length)
                        : 5;
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-amber-400 stroke-none text-amber-400' : 'text-zinc-700'}`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Con base en {reviewsList.length} valoraciones</p>
                </div>
              </div>

              {/* Star Progress Bars */}
              <div className="space-y-2 text-xs font-mono">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter((r) => r.rating === stars).length;
                  const percent = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center space-x-2 text-gray-400">
                      <span className="w-3 text-right text-[11px]">{stars}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-none shrink-0" />
                      <div className="flex-grow h-2 bg-black/40 rounded-full overflow-hidden border border-emerald-950/20">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[11px] text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Canchas Filter Switcher */}
              <div className="space-y-3 pt-4 border-t border-emerald-950/20 text-xs">
                <p className="font-semibold text-gray-400 font-mono text-[11px] uppercase tracking-wider">Filtrar por Cancha:</p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setFilterFieldId('all')}
                    className={`px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      filterFieldId === 'all'
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-emerald-950/10 hover:bg-emerald-900/10 text-gray-300 shadow-sm border border-emerald-900/5'
                    }`}
                  >
                    ⚽ Todas las Canchas ({reviewsList.length})
                  </button>
                  {fields.map((f) => {
                    const count = reviewsList.filter((r) => r.fieldId === f.id).length;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFilterFieldId(f.id)}
                        className={`px-3 py-2 rounded-xl text-left font-medium transition-all text-xs cursor-pointer ${
                          filterFieldId === f.id
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-emerald-950/10 hover:bg-emerald-900/10 text-gray-300 shadow-sm border border-emerald-900/5'
                        }`}
                      >
                        ⏱️ {f.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Listado de Comentarios y Formulario */}
          <div className="lg:col-span-8 space-y-8">
            {/* Formulario de Calificación */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/15 text-left space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h4 className="font-display font-extrabold text-base text-white">Dejar Calificación Deportiva</h4>
              </div>

              {token ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 mb-1">Cancha Visitada</label>
                      <select
                        value={newReviewFieldId}
                        onChange={(e) => setNewReviewFieldId(e.target.value)}
                        className="w-full bg-emerald-950/10 text-white text-xs px-3 py-2.5 rounded-xl border border-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-0"
                        required
                      >
                        {fields.map((f) => (
                          <option key={f.id} value={f.id} className="bg-zinc-950 text-white text-xs">{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 mb-1">Folio Reservación (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej. res-..."
                        value={newReviewResId}
                        onChange={(e) => setNewReviewResId(e.target.value)}
                        className="w-full bg-emerald-950/10 text-white text-xs px-3 py-2.5 rounded-xl border border-gray-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Star Selector */}
                  <div>
                    <span className="block text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 mb-1">Calificación de la cancha</span>
                    <div className="flex space-x-2 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newRating ? 'fill-amber-400 text-amber-400 stroke-none' : 'text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 mb-1">Tu Opinión Deportiva</label>
                    <textarea
                      placeholder="Cuéntanos qué tal estuvo la iluminación, las redes, el balón y el juego..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full bg-emerald-950/10 text-white text-xs px-4 py-3 rounded-xl border border-gray-800 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  {reviewSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                      {reviewSuccess}
                    </div>
                  )}

                  {reviewError && (
                    <div className="p-3.5 bg-red-950/25 border border-red-900/30 rounded-xl text-red-400 text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                    <p className="text-[10px] text-gray-500 italic max-w-sm">Nota- Tu reseña pasará por la cola de moderación del administrador antes de publicarse.</p>
                    <button
                      type="submit"
                      disabled={isReviewSubmitting}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer font-sans shadow-sm"
                    >
                      {isReviewSubmitting ? 'Enviando...' : 'Publicar Opinión'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-emerald-950/5 border border-dashed border-zinc-800 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    ¿Quieres calificar alguna cancha? Crea tu cuenta o inicia sesión desde el botón superior <strong className="text-white font-mono">"Ingresar / Registro"</strong> con tus accesos para dejarnos tus opiniones detalladas sobre las instalaciones.
                  </p>
                </div>
              )}
            </div>

            {/* Listado de reviews */}
            <div className="space-y-4">
              <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-1.5 pt-2">
                ⚽ Comentarios Publicados
              </h4>

              {reviewsList.filter(r => filterFieldId === 'all' || r.fieldId === filterFieldId).length === 0 ? (
                <p className="text-xs text-gray-500 italic text-left py-4">No hay comentarios aprobados para esta selección.</p>
              ) : (
                reviewsList
                  .filter(r => filterFieldId === 'all' || r.fieldId === filterFieldId)
                  .map((review) => (
                    <div
                      key={review.id}
                      className="p-5 rounded-2xl glass-panel border border-emerald-950/20 text-left space-y-3 animate-fadeIn"
                    >
                      {/* header reviews details */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white font-sans">{review.userName}</span>
                            {review.reservationId && (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/10">
                                ✓ Cliente Verificado
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-500 font-mono font-medium block mt-1">{review.fieldName}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono shrink-0">{new Date(review.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* stars rating */}
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < review.rating ? 'fill-amber-400 text-amber-400 stroke-none' : 'text-zinc-800'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed font-light">{review.comment}</p>

                      {/* Reponded from admin context */}
                      {review.reply && (
                        <div className="p-3 bg-zinc-950/50 rounded-xl border-l-[3px] border-emerald-500/40 text-[11px] mt-2 space-y-1">
                          <span className="font-bold text-amber-400 font-mono text-[9px] uppercase tracking-wider block">Respuesta de Fútbol Rápido Tribol:</span>
                          <p className="text-gray-400 font-light leading-relaxed">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
