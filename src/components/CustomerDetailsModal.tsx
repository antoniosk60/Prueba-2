import React, { useState, useMemo } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  TrendingUp, 
  Percent, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  Send,
  MessageSquare
} from 'lucide-react';
import { Reservation, Payment } from '../types';

interface CustomerDetailsModalProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  allReservations: Reservation[];
  allPayments: Payment[];
  onClose: () => void;
  getFieldFriendlyName: (fieldId: string) => string;
}

export default function CustomerDetailsModal({
  customerName,
  customerPhone,
  customerEmail,
  allReservations,
  allPayments,
  onClose,
  getFieldFriendlyName
}: CustomerDetailsModalProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  // Find all reservations of this customer based on phone (or email/name if phone is missing)
  const customerReservations = useMemo(() => {
    return allReservations.filter(res => {
      // Clean and compare phone numbers
      const p1 = res.userPhone.replace(/\D/g, '');
      const p2 = customerPhone.replace(/\D/g, '');
      if (p1 && p2 && p1 === p2) return true;
      
      // Fallback to exact email
      if (res.userEmail && customerEmail && res.userEmail.toLowerCase() === customerEmail.toLowerCase()) return true;
      
      // Fallback to exact name match
      return res.userName.toLowerCase() === customerName.toLowerCase();
    });
  }, [allReservations, customerPhone, customerEmail, customerName]);

  // Compute stats about the customer
  const stats = useMemo(() => {
    const total = customerReservations.length;
    if (total === 0) {
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        canceledRate: 0,
        checkInCount: 0,
        checkInRate: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalPending: 0,
        paymentFidelityRate: 0 // percentage of total billed that is paid
      };
    }

    let confirmed = 0;
    let pending = 0;
    let cancelled = 0;
    let checkInCount = 0;
    let totalBilled = 0;
    let totalPaid = 0;

    customerReservations.forEach(res => {
      if (res.status === 'confirmed') {
        confirmed++;
        // If checked in, increment checkin count
        if (res.checkedIn) {
          checkInCount++;
        }
        totalBilled += res.totalPrice;
        
        if (res.paymentStatus === 'paid') {
          totalPaid += res.totalPrice;
        } else {
          totalPaid += (res.advancePaid || 0);
        }
      } else if (res.status === 'pending') {
        pending++;
        totalBilled += res.totalPrice;
        totalPaid += (res.advancePaid || 0);
      } else if (res.status === 'cancelled') {
        cancelled++;
        // For cancelled reservations, some deposit might have been paid, but usually totalPrice is not owed.
        // Let's add advance paid if any was non-refundable.
        totalPaid += (res.advancePaid || 0);
      }
    });

    // Also verify actual payments registered in the payment list
    // This provides a robust double check on payment behavior (how many separate payments they did)
    const reservationIds = new Set(customerReservations.map(r => r.id));
    const customerPayments = allPayments.filter(p => reservationIds.has(p.reservationId) && p.status === 'completed');
    const registeredPaymentsSum = customerPayments.reduce((acc, p) => acc + p.amount, 0);

    // We'll use the maximum of computed payment state and registered payment sum to show actual collection
    const realPaidAmount = Math.max(totalPaid, registeredPaymentsSum);
    const unpaidAmount = Math.max(0, totalBilled - realPaidAmount);

    const checkInRate = confirmed > 0 ? Math.round((checkInCount / confirmed) * 100) : 0;
    const canceledRate = Math.round((cancelled / total) * 100);
    const paymentFidelityRate = totalBilled > 0 ? Math.round((realPaidAmount / totalBilled) * 100) : 0;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      canceledRate,
      checkInCount,
      checkInRate,
      totalBilled,
      totalPaid: realPaidAmount,
      totalPending: unpaidAmount,
      paymentFidelityRate
    };
  }, [customerReservations, allPayments]);

  // Filter reservations for display list
  const displayReservations = useMemo(() => {
    return customerReservations.filter(res => {
      if (statusFilter === 'all') return true;
      return res.status === statusFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customerReservations, statusFilter]);

  // Handle opening WhatsApp chat for reservation verification/payment behavior
  const handleContactWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const textMsg = `Hola ${customerName}, te contactamos desde Fútbol Rápido Tribol para dar seguimiento a tus reservas en nuestro sistema.`;
    const url = `https://wa.me/${cleanPhone.startsWith('52') ? '52' : ''}${cleanPhone}?text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" id="customer-details-modal">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in zoom-in-95 duration-150">
        
        {/* Banner/Header Segment */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 border-b border-zinc-900 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
              <User size={28} />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Detalle del Cliente</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase mt-0.5">{customerName}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                  <Phone size={12} className="text-zinc-500" />
                  {customerPhone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={12} className="text-zinc-500" />
                  {customerEmail || 'Sin correo registrado'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleContactWhatsApp}
              type="button"
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border border-emerald-500/20 transition cursor-pointer text-xs font-bold flex items-center gap-1.5 self-center"
              title="Contactar vía WhatsApp"
            >
              <MessageSquare size={13} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Container with customized scrolling */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-left">
          
          {/* Quick stats indicator cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Historial Reservas</span>
                <Calendar size={16} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
                <p className="text-[10px] text-zinc-500 mt-1">Registros en total</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Tasa de Asistencia</span>
                <Activity size={16} className="text-blue-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-white font-mono">{stats.checkInRate}%</span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-500 h-1" style={{ width: `${stats.checkInRate}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">{stats.checkInCount} asistencias de {stats.confirmed} confirmados</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Tasa de Cancelación</span>
                <AlertTriangle size={16} className={stats.canceledRate > 30 ? "text-amber-500" : "text-zinc-500"} />
              </div>
              <div>
                <span className={`text-2xl font-black font-mono ${stats.canceledRate > 30 ? "text-amber-500" : "text-white"}`}>
                  {stats.canceledRate}%
                </span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2">
                  <div className={`h-1 ${stats.canceledRate > 30 ? "bg-amber-500" : "bg-zinc-650"}`} style={{ width: `${stats.canceledRate}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">{stats.cancelled} canceladas de {stats.total} intentos</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Desempeño de Pago</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-white font-mono">{stats.paymentFidelityRate}%</span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-1" style={{ width: `${stats.paymentFidelityRate}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">${stats.totalPaid} pagados de ${stats.totalBilled} MXN</p>
              </div>
            </div>

          </div>

          {/* Payment Behavior breakdown and warnings */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 block">
            <h3 className="text-xs uppercase font-black text-zinc-400 tracking-widest border-b border-zinc-900 pb-3 mb-4">
              💸 Análisis de Comportamiento de Pago
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">Monto Total Reservado</span>
                <span className="text-lg font-bold text-white font-mono">${stats.totalBilled.toLocaleString("es-MX")} MXN</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Suma de cargos por todas las canchas reservadas, luces y adicionales contratados.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">Total Recaudado / Abonos</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">${stats.totalPaid.toLocaleString("es-MX")} MXN</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Depósitos por transferencias o cobros en efectivo ya consolidados y verificados por administración.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">Saldo Pendiente de Cobro</span>
                <span className={`text-lg font-bold font-mono ${stats.totalPending > 0 ? "text-amber-450" : "text-zinc-500"}`}>
                  ${stats.totalPending.toLocaleString("es-MX")} MXN
                </span>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Monto total restante que el capitán debe finiquitar al ingresar a la cancha o vía digital.</p>
              </div>

            </div>

            {/* Health warnings / alerts related to reservations reliability */}
            {stats.canceledRate >= 40 && (
              <div className="mt-5 p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-amber-500 uppercase block">Alerta de Alta Cancelación (Riesgo Financiero)</span>
                  <p className="text-[10.5px] text-zinc-400 mt-0.5 leading-relaxed">
                    Este cliente posee una tasa de cancelación del {stats.canceledRate}%. Se aconseja solicitar de forma estricta un anticipo del 100% o garantía de pago antes de autorizar y confirmar sus próximas reservaciones futbolísticas.
                  </p>
                </div>
              </div>
            )}

            {stats.totalPending > 0 && (
              <div className="mt-3.5 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-start gap-3">
                <DollarSign className="text-emerald-450 shrink-0 mt-0.5 animate-pulse" size={16} />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white uppercase block">Adeudos Pendientes Activos</span>
                  <p className="text-[10.5px] text-zinc-400 mt-0.5 leading-relaxed">
                    Hay un saldo pendiente de <strong className="text-emerald-400">${stats.totalPending} MXN</strong> en las reservas activas de este usuario. Asegura la liquidación en caja antes de permitir el encendido de luces o acceso a la cancha seleccionada.
                  </p>
                </div>
              </div>
            )}
            
          </div>

          {/* Customer History Log Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-900 pb-3">
              <h3 className="text-xs uppercase font-black text-zinc-400 tracking-widest flex items-center gap-2">
                📂 Bitácora de Reservaciones ({customerReservations.length})
              </h3>
              
              {/* Tab Filters for reservation lists */}
              <div className="flex flex-wrap gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-850">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'confirmed', label: 'Confirmadas' },
                  { value: 'pending', label: 'Pendientes' },
                  { value: 'cancelled', label: 'Canceladas' }
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                      statusFilter === tab.value 
                        ? 'bg-emerald-500 text-black shadow' 
                        : 'text-zinc-550 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of customer's filtered reservations */}
            {displayReservations.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900 rounded-2xl text-xs text-zinc-500 font-mono">
                No hay reservaciones en este estado ({statusFilter}) para el cliente seleccionado.
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayReservations.map((res) => {
                  const hasOwed = res.status !== 'cancelled' && res.paymentStatus === 'pending' && (res.totalPrice - (res.advancePaid || 0) > 0);
                  const owedAmount = res.totalPrice - (res.advancePaid || 0);

                  return (
                    <div 
                      key={res.id} 
                      className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 transition text-zinc-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Meta information: ID, Field, DateTime */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-black text-zinc-550">#{res.id}</span>
                            <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md">
                              {getFieldFriendlyName(res.fieldId)}
                            </span>
                            
                            {/* Checkin Status Indicator */}
                            {res.checkedIn && (
                              <span className="text-[9px] font-black uppercase text-emerald-450 bg-emerald-950/20 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                ✓ LLEGÓ
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs flex-wrap">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <Calendar size={13} className="text-emerald-450" />
                              {res.date}
                            </span>
                            <span className="text-zinc-400 font-mono flex items-center gap-1">
                              <Clock size={13} className="text-zinc-500" />
                              {res.timeSlot}
                            </span>
                          </div>
                        </div>

                        {/* Financial and payment values */}
                        <div className="grid grid-cols-2 md:flex md:items-center gap-4 text-left md:text-right shrink-0">
                          
                          <div className="space-y-0.5 md:min-w-[100px]">
                            <span className="text-[9px] text-zinc-500 font-semibold block">TOTAL CARGO</span>
                            <span className="font-mono text-sm font-black text-white">${res.totalPrice}</span>
                          </div>

                          <div className="space-y-0.5 md:min-w-[100px]">
                            <span className="text-[9px] text-zinc-500 font-semibold block">ANTICIPO</span>
                            <span className="font-mono text-sm font-semibold text-zinc-300">
                              ${res.advancePaid || 0}
                            </span>
                          </div>

                          <div className="space-y-0.5 md:min-w-[110px]">
                            <span className="text-[9px] text-zinc-500 font-semibold block">ADEUDO</span>
                            <span className={`font-mono text-sm font-bold ${hasOwed ? "text-amber-500" : "text-emerald-450"}`}>
                              ${res.status === 'cancelled' ? 0 : (owedAmount > 0 ? owedAmount : 0)}
                            </span>
                          </div>

                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto uppercase tracking-wide text-[10px] font-black">
                          
                          {/* Payment status badge */}
                          {res.status !== 'cancelled' && (
                            <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                              res.paymentStatus === 'paid'
                                ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                                : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}>
                              {res.paymentStatus === 'paid' ? 'PAGADO ✓' : 'PENDIENTE'}
                            </span>
                          )}

                          {/* Reservation progress status badge */}
                          <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            res.status === 'confirmed'
                              ? "bg-emerald-500 text-black border-transparent font-extrabold"
                              : res.status === 'pending'
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-rose-950/20 text-rose-450 border-rose-500/20"
                          }`}>
                            {res.status === 'confirmed' && 'CONFIRMADO'}
                            {res.status === 'pending' && 'PENDIENTE'}
                            {res.status === 'cancelled' && 'CANCELADO'}
                          </span>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer border border-zinc-850"
          >
            Cerrar Reporte
          </button>
        </div>

      </div>
    </div>
  );
}
