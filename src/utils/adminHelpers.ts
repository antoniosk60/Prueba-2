import { Reservation, Team, Player, AuditLog } from '../types';

/**
 * Downloads a tabular CSV representation of reservations
 */
export function exportReservationsToCSV(reservations: Reservation[], fieldFriendlyNames: (fid: string) => string) {
  const headers = ['Folio ID', 'Cancha', 'Fecha', 'Horario HS', 'Capitán', 'Celular', 'Correo', 'Total Cobrado', 'Anticipo', 'Saldo Restante', 'Estado de Reserva', 'Estado de Pago', 'Check-in Digital', 'Fecha de Registro'];
  
  const rows = reservations.map(res => {
    const total = res.totalPrice || 0;
    const advance = res.advancePaid || 0;
    const remaining = total - advance;
    return [
      `"${res.id}"`,
      `"${fieldFriendlyNames(res.fieldId)}"`,
      `"${res.date}"`,
      `"${res.timeSlot}"`,
      `"${res.userName}"`,
      `"${res.userPhone}"`,
      `"${res.userEmail}"`,
      total,
      advance,
      remaining,
      `"${res.status === 'confirmed' ? 'Confirmado' : res.status === 'pending' ? 'Pendiente' : 'Cancelado'}"`,
      `"${res.paymentStatus === 'paid' ? 'Pagado' : 'Impago'}"`,
      `"${res.checkedIn ? 'SI (Check-in hecho)' : 'NO'}"`,
      `"${res.createdAt}"`
    ];
  });
  
  const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Tribol_Reporte_Reservas_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a tabular CSV representation of financial reports
 */
export function exportFinancesToCSV(reservations: Reservation[]) {
  const headers = ['Mes', 'Año', 'Folio Reserva', 'Cliente', 'Cobrado', 'Abonado', 'Pendiente', 'Estado Pago', 'Auditado'];
  const completed = reservations.filter(r => r.status === 'confirmed');
  
  const rows = completed.map(res => {
    const total = res.totalPrice || 0;
    const advance = res.advancePaid || 0;
    const remaining = total - advance;
    const d = new Date(res.date);
    const mes = d.toLocaleString('es-MX', { month: 'long' });
    const anio = d.getFullYear();
    
    return [
      `"${mes}"`,
      anio,
      `"${res.id}"`,
      `"${res.userName}"`,
      total,
      advance,
      remaining,
      `"${res.paymentStatus === 'paid' ? 'Saldado' : 'Abono Parcial'}"`,
      `"Auditado Caja OK"`
    ];
  });
  
  const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Tribol_Reporte_Caja_BI_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Analyzes reservation schedule occupancy to identify "Horas Valle" (under-occupied timeslots)
 */
export function analyzeLowOccupancyHours(reservations: Reservation[]) {
  // Typical slots
  const slots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
    '20:00 - 21:00', '21:00 - 22:00'
  ];
  
  const activeBookings = reservations.filter(r => r.status !== 'cancelled');
  
  const slotStats = slots.map(slot => {
    const count = activeBookings.filter(r => r.timeSlot.includes(slot.split(' - ')[0])).length;
    return { slot, count };
  });
  
  // Sort from least reserved to most reserved (with minimum count)
  return slotStats.sort((a,b) => a.count - b.count).slice(0, 4);
}

/**
 * Renders high-ranking captains (Capitanes VIP) based on bookings volume
 */
export function getCapitanesLeaderboard(reservations: Reservation[]) {
  const map: Record<string, { name: string; phone: string; email: string; bookings: number; totalSpent: number }> = {};
  
  reservations.filter(r => r.status === 'confirmed').forEach(r => {
    if (!map[r.userEmail]) {
      map[r.userEmail] = {
        name: r.userName,
        phone: r.userPhone,
        email: r.userEmail,
        bookings: 0,
        totalSpent: 0
      };
    }
    map[r.userEmail].bookings += 1;
    map[r.userEmail].totalSpent += r.totalPrice;
  });
  
  return Object.values(map)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);
}

/**
 * Automatical fixtures generator using Round-Robin (All-play-All) tournament scheduling
 */
export interface FixtureGame {
  round: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  timeSlot: string;
  courtId: string;
}

export function generateRoundRobinFixtures(teams: Team[], startDateStr: string, slotHours: string[], courtIds: string[]): FixtureGame[] {
  if (teams.length < 2) return [];
  
  const list = [...teams];
  if (list.length % 2 !== 0) {
    // Add dummy bye team
    list.push({ id: 'dummy-bye', name: 'Descanso (Bye)', color: '-', captainContact: '-', goalsFor: 0, createdAt: '' });
  }
  
  const numTeams = list.length;
  const numRounds = numTeams - 1;
  const gamesPerRound = numTeams / 2;
  const fixtures: FixtureGame[] = [];
  
  let currentDate = new Date(startDateStr);
  let slotIndex = 0;
  let courtIndex = 0;
  
  for (let r = 0; r < numRounds; r++) {
    for (let g = 0; g < gamesPerRound; g++) {
      const homeIdx = (r + g) % (numTeams - 1);
      const awayIdx = (numTeams - 1 - g + r) % (numTeams - 1);
      
      const home = g === 0 ? list[0] : list[homeIdx + 1];
      const away = g === 0 ? list[numTeams - 1 - r] : list[awayIdx + 1];
      
      // Skip bye games
      if (home.id === 'dummy-bye' || away.id === 'dummy-bye') continue;
      
      // Select date slot
      const tSlot = slotHours[slotIndex % slotHours.length];
      const tCourt = courtIds[courtIndex % courtIds.length];
      
      fixtures.push({
        round: r + 1,
        homeTeam: home.name,
        awayTeam: away.name,
        date: currentDate.toISOString().split('T')[0],
        timeSlot: tSlot,
        courtId: tCourt
      });
      
      // Progress time variables for visual realism
      slotIndex++;
      if (slotIndex % slotHours.length === 0) {
        courtIndex++;
        if (courtIndex % courtIds.length === 0) {
          // Advance one week for next round fixtures
          currentDate.setDate(currentDate.getDate() + 7);
        }
      }
    }
  }
  
  return fixtures;
}

/**
 * Initial operations logs for visualization
 */
export function getInitialAuditLogs(): AuditLog[] {
  const roles: ('owner' | 'receptionist' | 'moderator')[] = ['owner', 'receptionist', 'moderator'];
  const names = ['Juan Administrador', 'Karla Recepción', 'Mauricio Panelistas'];
  
  return [
    {
      id: 'log-01',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('es-MX'),
      role: 'owner',
      adminName: 'Juan Administrador (Dueño)',
      actionType: 'INICIO_SESION',
      description: 'El Administrador Principal (Dueño) inició sesión desde una tableta.'
    },
    {
      id: 'log-02',
      timestamp: new Date(Date.now() - 2500000).toLocaleString('es-MX'),
      role: 'receptionist',
      adminName: 'Karla Recepción',
      actionType: 'CHECKIN_DIGITAL',
      description: 'Marcaron asistencia (Check-in) para el equipo Carlos Mendoza en la Cancha 1.'
    },
    {
      id: 'log-03',
      timestamp: new Date(Date.now() - 1200000).toLocaleString('es-MX'),
      role: 'moderator',
      adminName: 'Mauricio Panelistas',
      actionType: 'MODERACION_RESEÑA',
      description: 'Aprobación del comentario del capitán Carlos Mendoza respecto a la Cancha 1.'
    }
  ];
}
