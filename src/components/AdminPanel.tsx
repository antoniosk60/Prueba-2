import React, { useState, useEffect } from 'react';
import CustomerDetailsModal from './CustomerDetailsModal';
import AdminGoogleDrive from './AdminGoogleDrive';
import { 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  Image as ImageIcon, 
  Users, 
  DollarSign, 
  Clock, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Plus, 
  User, 
  RefreshCw, 
  Star, 
  MessageSquare, 
  Film, 
  AlertTriangle,
  Upload,
  LogOut,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ShieldAlert,
  Edit2,
  Lock,
  Shield,
  Download,
  Send,
  FileSpreadsheet,
  QrCode,
  CreditCard,
  Cloud
} from 'lucide-react';
import { 
  Reservation, 
  Promotion, 
  Photo, 
  Team, 
  Player, 
  Review, 
  Video, 
  FieldConfig,
  AuditLog,
  Payment
} from '../types';
import { 
  exportReservationsToCSV, 
  exportFinancesToCSV, 
  exportPaymentsToCSV, 
  analyzeLowOccupancyHours, 
  getCapitanesLeaderboard, 
  generateRoundRobinFixtures, 
  getInitialAuditLogs,
  FixtureGame
} from '../utils/adminHelpers';

interface AdminPanelProps {
  token: string | null;
  onLogout: () => void;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  // --- CLIENT ROLE-BASED ACCESS CONTROL (RBAC) ---
  const [adminRole, setAdminRole] = useState<'owner' | 'receptionist' | 'moderator'>('owner');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // --- RESERVATION INTERACTIVE VIEW MODE & MOVING STATES ---
  const [reservationViewMode, setReservationViewMode] = useState<'table' | 'calendar'>('table');
  const [calendarTargetDate, setCalendarTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [movingReservationId, setMovingReservationId] = useState<string | null>(null);

  // --- QUICK RESERVATION POP OVER FORM STATES ---
  const [quickFieldId, setQuickFieldId] = useState<string>('cancha-1');
  const [quickTimeSlot, setQuickTimeSlot] = useState<string>('18:00 - 19:00');
  const [quickDate, setQuickDate] = useState<string>('');
  const [quickName, setQuickName] = useState<string>('');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [isQuickOpen, setIsQuickOpen] = useState<boolean>(false);

  // --- WHATSAPP PREVIEW SIMULATION STATES ---
  const [whatsAppPreviewObj, setWhatsAppPreviewObj] = useState<Reservation | null>(null);
  
  // --- PARTIAL PAYMENT REGISTRATION POP OVER ---
  const [payingReservation, setPayingReservation] = useState<Reservation | null>(null);
  const [abonoAmountInput, setAbonoAmountInput] = useState<string>('200');

  // --- SELECTED CUSTOMER DETAIL REPORT OVERLAY ---
  const [selectedDetailedCustomer, setSelectedDetailedCustomer] = useState<{ name: string; phone: string; email: string } | null>(null);

  // --- MONTHLY ACCOUNTING EXPORT STATE & HELPERS ---
  const [selectedExportMonth, setSelectedExportMonth] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  });

  const getAvailableExportMonths = () => {
    const monthsSet = new Set<string>();
    const today = new Date();
    const curMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(curMonthStr);
    
    reservations.forEach(res => {
      if (res.date && res.date.length >= 7) {
        monthsSet.add(res.date.substring(0, 7));
      }
    });
    
    return Array.from(monthsSet).sort().reverse();
  };

  const formatYearMonthSpanish = (ym: string) => {
    const [year, monthStr] = ym.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthIndex = parseInt(monthStr, 10) - 1;
    return `${months[monthIndex]} ${year}`;
  };

  // --- TOURNAMENT SCHEDULE FIXTURES AUTO-GENERATION STATES ---
  const [fixturesStartDate, setFixturesStartDate] = useState<string>(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [fixturesTimeSlotHours, setFixturesTimeSlotHours] = useState<string[]>(['18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00']);
  const [generatedFixtures, setGeneratedFixtures] = useState<any[]>([]);
  const [fixtureStatusMsg, setFixtureStatusMsg] = useState<string>('');

  // --- MINDS BULK PLAYER UPLOAD ROSTER ATTACHMENT ---
  const [bulkPlayersText, setBulkPlayersText] = useState<string>('');
  const [bulkStatusMsg, setBulkStatusMsg] = useState<string>('');

  // --- OFFICIAL QR PASS CREDENTIALS PANEL DRAWERS ---
  const [selectedCredentialPlayer, setSelectedCredentialPlayer] = useState<Player | null>(null);

  const [activeTab, setActiveTab] = useState<
    'admin-dashboard' | 
    'admin-reservations' | 
    'admin-gallery' | 
    'admin-promotions' | 
    'admin-prices' | 
    'admin-reviews' | 
    'admin-teams' |
    'admin-payments'
  >('admin-dashboard');

  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Stats / Dashboard data
  const [stats, setStats] = useState<any | null>(null);

  // Domain lists
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [dynamicPrices, setDynamicPrices] = useState<any[]>([]);

  // Search, edit and filters
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationFilterStatus, setReservationFilterStatus] = useState<'todos' | 'pending' | 'confirmed' | 'cancelled'>('todos');
  const [teamSearch, setTeamSearch] = useState('');

  // Payment filters state
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStartDate, setPaymentStartDate] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}-01`;
  });
  const [paymentEndDate, setPaymentEndDate] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${mm}-${dd}`;
  });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'todos' | 'stripe' | 'paypal' | 'whatsapp_transfer' | 'cash'>('todos');
  
  // Create promotion form
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(10);
  const [promoCode, setPromoCode] = useState('');
  const [promoUntil, setPromoUntil] = useState('');
  const [promoType, setPromoType] = useState<'discount' | 'tournament' | 'special'>('discount');
  const [promoStatusMsg, setPromoStatusMsg] = useState('');
  const [promoErrorMsg, setPromoErrorMsg] = useState('');

  // Add Photo Form State
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'facilities' | 'matches' | 'events'>('facilities');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoIsDragging, setPhotoIsDragging] = useState(false);
  const [photoStatusMsg, setPhotoStatusMsg] = useState('');
  const [photoErrorMsg, setPhotoErrorMsg] = useState('');

  // Video adding form (sub-feature in photos tab)
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');
  const [videoCategory, setVideoCategory] = useState<'live' | 'highlight' | 'full_match'>('highlight');
  const [videoIsLive, setVideoIsLive] = useState(false);
  const [videoStatusMsg, setVideoStatusMsg] = useState('');

  // Add Dynamic Prices rule state
  const [priceTargetCourtId, setPriceTargetCourtId] = useState('');
  const [priceBaseRateInput, setPriceBaseRateInput] = useState<number>(500);
  const [priceDynamicHoursStart, setPriceDynamicHoursStart] = useState('18:00');
  const [priceDynamicHoursEnd, setPriceDynamicHoursEnd] = useState('22:00');
  const [priceDynamicDayInput, setPriceDynamicDayInput] = useState<number>(1); // Lunes
  const [priceDynamicRateInput, setPriceDynamicRateInput] = useState<number>(900);
  const [priceStatusMsg, setPriceStatusMsg] = useState('');
  const [priceErrorMsg, setPriceErrorMsg] = useState('');

  // Edit / Add Teams and Players form state
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamFormName, setTeamFormName] = useState('');
  const [teamFormColor, setTeamFormColor] = useState('');
  const [teamFormCaptain, setTeamFormCaptain] = useState('');
  const [teamFormGoals, setTeamFormGoals] = useState('0');

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerFormName, setPlayerFormName] = useState('');
  const [playerFormAge, setPlayerFormAge] = useState('');
  const [playerFormPosition, setPlayerFormPosition] = useState('Delantero');
  const [playerFormContact, setPlayerFormContact] = useState('');
  const [playerFormTeamId, setPlayerFormTeamId] = useState('');

  // Calendar helper ranges
  const calendarHours = [
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00',
    '22:00 - 23:00'
  ];



  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Load All Server Data
  const fetchAllAdminData = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Stats
      const statsRes = await fetch('/api/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fields
      const fieldsRes = await fetch('/api/fields');
      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        setFields(fieldsData);
        if (fieldsData.length > 0 && !priceTargetCourtId) {
          setPriceTargetCourtId(fieldsData[0].id);
        }
      }

      // Reservations
      const resRes = await fetch('/api/reservations');
      if (resRes.ok) {
        const resData = await resRes.json();
        resData.sort((a: any, b: any) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setReservations(resData);
      }

      // Promotions
      const promoRes = await fetch('/api/promotions');
      if (promoRes.ok) {
        setPromotions(await promoRes.json());
      }

      // Gallery Photos
      const photosRes = await fetch('/api/gallery');
      if (photosRes.ok) {
        setPhotos(await photosRes.json());
      }

      // Videos
      const videosRes = await fetch('/api/videos');
      if (videosRes.ok) {
        setVideos(await videosRes.json());
      }

      // Teams
      const teamsRes = await fetch('/api/teams');
      if (teamsRes.ok) {
        setTeams(await teamsRes.json());
      }

      // Players
      const playersRes = await fetch('/api/players');
      if (playersRes.ok) {
        setPlayers(await playersRes.json());
      }

      // Reviews
      const reviewsRes = await fetch('/api/reviews/admin', { headers });
      if (reviewsRes.ok) {
        setReviews(await reviewsRes.json());
      }

      // Dynamic rule prices
      const ruleRes = await fetch('/api/admin/prices', { headers });
      if (ruleRes.ok) {
        setDynamicPrices(await ruleRes.json());
      }

      // Payments
      const paymentsRes = await fetch('/api/payments', { headers });
      if (paymentsRes.ok) {
        setPayments(await paymentsRes.json());
      }

    } catch (err: any) {
      console.error(err);
      setErrorStatus("Falla al sincronizar indicadores de administración.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
    const todayStr = new Date().toISOString().split('T')[0];
    setPromoUntil(todayStr);
    setAuditLogs(getInitialAuditLogs());
  }, []);

  const addAuditLog = (actionType: string, description: string) => {
    const freshLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      role: adminRole,
      adminName: adminRole === 'owner' ? 'Juan Administrador (Dueño)' : adminRole === 'receptionist' ? 'Karla Recepción' : 'Mauricio Moderador',
      actionType,
      description
    };
    setAuditLogs(prev => [freshLog, ...prev]);
  };

  const handleQuickCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickPhone) return;
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fieldId: quickFieldId,
          date: quickDate,
          timeSlot: quickTimeSlot,
          userName: quickName,
          userPhone: quickPhone,
          userEmail: quickEmail || `${quickName.toLowerCase().replace(/\s+/g, '')}@tribol.com`,
          totalPrice: 400,
          status: 'confirmed',
          paymentStatus: 'pending',
          advancePaid: 0,
          checkedIn: false
        })
      });
      if (response.ok) {
        addAuditLog('CREAR_RESERVA_RAPIDA', `Reserva express creada para ${quickName} en slot [${quickTimeSlot}].`);
        setIsQuickOpen(false);
        setQuickName('');
        setQuickPhone('');
        setQuickEmail('');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update reservation status and payment status
  const handleUpdateReservation = async (id: string, status: 'confirmed' | 'cancelled', paymentStatus: 'pending' | 'paid', extraBody?: any) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, paymentStatus, ...extraBody })
      });
      if (response.ok) {
        const targetRes = reservations.find(r => r.id === id);
        const name = targetRes ? targetRes.userName : 'Cliente';
        addAuditLog('ACTUALIZAR_RESERVA', `Se modificó estado de reserva #${id} (${name}) a [${status}] y pago a [${paymentStatus}].`);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create promotion
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoCode.trim()) {
      setPromoErrorMsg("Por favor, llena todos los campos obligatorios del cupón.");
      return;
    }
    setPromoStatusMsg('');
    setPromoErrorMsg('');

    try {
      const discountPercentage = Number(promoDiscount);
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: promoTitle,
          description: promoDesc || `Descuento especial con código ${promoCode.toUpperCase()}`,
          discountPercentage,
          promoCode: promoCode.toUpperCase(),
          validUntil: promoUntil,
          type: promoType
        })
      });

      if (res.ok) {
        setPromoStatusMsg(`🎈 ¡Promoción [${promoCode.toUpperCase()}] creada con éxito!`);
        setPromoTitle('');
        setPromoDesc('');
        setPromoCode('');
        setPromoDiscount(10);
        fetchAllAdminData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setPromoErrorMsg(errData.message || "Falla en la respuesta al registrar promoción.");
      }
    } catch (err: any) {
      setPromoErrorMsg(err.message || "Error al registrar cupón.");
    }
  };

  // Toggle active promotion status
  const handleTogglePromo = async (id: string) => {
    try {
      const res = await fetch(`/api/promotions/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete promotion
  const handleDeletePromo = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta promoción?")) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Base64 file decoder - accepts any format and size
  const processImageFile = (file: File) => {
    setPhotoFileName(file.name);
    setPhotoErrorMsg('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.onerror = () => {
      setPhotoErrorMsg("Contratiempo al descodificar los metadatos de la imagen.");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim() || !photoBase64) {
      setPhotoErrorMsg("Completa todos los campos obligatorios y selecciona una imagen para subir.");
      return;
    }
    setPhotoStatusMsg('');
    setPhotoErrorMsg('');

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: photoBase64, // The backend handles base64 urls or stores them
          caption: photoTitle,
          category: photoCategory === 'facilities' ? 'facilities' : photoCategory === 'matches' ? 'matches' : 'events'
        })
      });

      if (res.ok) {
        setPhotoStatusMsg("⚽ ¡Fotografía subida al servidor con éxito!");
        setPhotoTitle('');
        setPhotoDescription('');
        setPhotoBase64('');
        setPhotoFileName('');
        fetchAllAdminData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setPhotoErrorMsg(errorData.message || "Falla en la respuesta al registrar imagen en galería.");
      }
    } catch (err: any) {
      setPhotoErrorMsg(err.message || "Contratiempo al subir fotografía.");
    }
  };

  // Delete gallery photo
  const handleDeletePhoto = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta foto de la galería?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add highlight matches video
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;
    setVideoStatusMsg('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: videoTitle,
          url: videoUrl,
          thumbnailUrl: videoThumbnailUrl || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400',
          category: videoCategory,
          isLive: videoIsLive
        })
      });

      if (res.ok) {
        setVideoStatusMsg("⚡ ¡Video publicado en videoteca!");
        setVideoTitle('');
        setVideoUrl('');
        setVideoThumbnailUrl('');
        setVideoIsLive(false);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm("¿Deseas eliminar este video de la videoteca?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Price base rates and dynamic prices config
  const handleUpdateBasePrice = async (fieldConfig: FieldConfig) => {
    try {
      const res = await fetch(`/api/fields/${fieldConfig.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ basePricePerHour: Number(priceBaseRateInput) })
      });
      if (res.ok) {
        setPriceStatusMsg(`✓ Tarifa base para [${fieldConfig.name}] actualizada correctamente.`);
        fetchAllAdminData();
      } else {
        setPriceErrorMsg("Error al actualizar tarifa de cancha.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDynamicPriceRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceTargetCourtId || !priceDynamicRateInput) {
      setPriceErrorMsg("Por favor introduce datos de reglas válidos.");
      return;
    }
    setPriceStatusMsg('');
    setPriceErrorMsg('');

    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courtId: priceTargetCourtId,
          dayOfWeek: Number(priceDynamicDayInput),
          startHour: priceDynamicHoursStart,
          endHour: priceDynamicHoursEnd,
          rate: Number(priceDynamicRateInput)
        })
      });

      if (res.ok) {
        setPriceStatusMsg("⚡ ¡Regla de tarifa dinámica registrada en el sistema!");
        setPriceDynamicRateInput(900);
        fetchAllAdminData();
      } else {
        setPriceErrorMsg("Falla en la respuesta al registrar regla de tarifa.");
      }
    } catch (err: any) {
      setPriceErrorMsg(err.message || "Contratiempo al registrar regla.");
    }
  };

  const handleDeleteDynamicPriceRule = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta regla de tarifa dinámica?")) return;
    try {
      const res = await fetch(`/api/admin/prices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Review Status updates & Replies
  const handleModerateReview = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    try {
      const res = await fetch(`/api/reviews/${id}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReviewReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        setReplyText('');
        setReplyingReviewId(null);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("¿Deseas remover permanentemente esta recomendación opinada del sistema?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Teams and Players CRUD operations
  const handleSaveTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFormName || !teamFormColor || !teamFormCaptain) return;

    try {
      const isEditing = !!editingTeamId;
      const url = isEditing ? `/api/teams/${editingTeamId}` : '/api/teams';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: teamFormName,
          color: teamFormColor,
          captainContact: teamFormCaptain,
          goalsFor: parseInt(teamFormGoals) || 0
        })
      });

      if (res.ok) {
        setTeamFormName('');
        setTeamFormColor('');
        setTeamFormCaptain('');
        setTeamFormGoals('0');
        setEditingTeamId(null);
        setShowTeamForm(false);
        fetchAllAdminData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Error al registrar el equipo.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("¿Estás totalmente seguro de eliminar este equipo? Esto borrará también a todos los jugadores vinculados.")) return;
    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerFormTeamId || !playerFormName || !playerFormAge || !playerFormPosition) return;

    try {
      const isEditing = !!editingPlayerId;
      const url = isEditing ? `/api/players/${editingPlayerId}` : '/api/players';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: playerFormTeamId,
          name: playerFormName,
          age: parseInt(playerFormAge),
          position: playerFormPosition,
          contact: playerFormContact
        })
      });

      if (res.ok) {
        setPlayerFormName('');
        setPlayerFormAge('');
        setPlayerFormContact('');
        setEditingPlayerId(null);
        setShowPlayerForm(false);
        fetchAllAdminData();
      } else {
        alert("Contratiempo al registrar ficha de jugador.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("¿Eliminar ficha de este jugador de su plantilla vinculada?")) return;
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };



  // Utilities converters mapping
  const getFieldFriendlyName = (fid: string) => {
    const found = fields.find(f => f.id === fid);
    return found ? found.name : `Cancha General`;
  };

  const getDayLabel = (dayNum: number) => {
    return ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][dayNum] || `Día ${dayNum}`;
  };

  // Combined stats counts for safe view displays
  const maxOcupancyReservations = stats?.occupancyData 
    ? Math.max(...stats.occupancyData.map((o: any) => o.reservations), 1) 
    : 1;

  const maxCourtReservations = stats?.courtStats
    ? Math.max(...stats.courtStats.map((c: any) => c.bookingCount), 1)
    : 1;

  // Search filtering lists
  const filteredReservationsList = reservations.filter(o => {
    const matchStr = reservationSearch.toLowerCase();
    const matchesSearch = 
      o.userName.toLowerCase().includes(matchStr) ||
      o.userPhone.includes(matchStr) ||
      o.userEmail.toLowerCase().includes(matchStr) ||
      getFieldFriendlyName(o.fieldId).toLowerCase().includes(matchStr) ||
      o.id.toLowerCase().includes(matchStr);

    const matchesStatus = reservationFilterStatus === 'todos' || o.status === reservationFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTeamsList = teams.filter(t => 
    t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    t.captainContact.includes(teamSearch)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-sans text-zinc-300">
      
      {/* HEADER BAR FOR THE THEME */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <span className="font-extrabold text-white tracking-wider text-sm uppercase">Fútbol Rápido Tribol — Admin</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-center sm:self-auto">
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-850 p-1 rounded-xl">
              <span className="text-[9px] text-zinc-500 font-extrabold uppercase px-2 hidden md:inline">Simular Consola:</span>
              {(['owner', 'receptionist', 'moderator'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setAdminRole(role);
                    const label = role === 'owner' ? 'Dueño' : role === 'receptionist' ? 'Recepcionista' : 'Moderador';
                    const freshLog = {
                      id: 'log-' + Math.random().toString(36).substr(2, 9),
                      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                      role,
                      adminName: role === 'owner' ? 'Juan Administrador (Dueño)' : role === 'receptionist' ? 'Karla Recepción' : 'Mauricio Moderador',
                      actionType: 'CAMBIO_ROL',
                      description: `Accedió con privilegios de simulación de [${label}].`
                    };
                    setAuditLogs(prev => [freshLog, ...prev]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition cursor-pointer ${
                    adminRole === role 
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/10 font-black" 
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {role === 'owner' ? 'Dueño 👑' : role === 'receptionist' ? 'Recepción 🔑' : 'Moderador 👁️'}
                </button>
              ))}
            </div>

            <button 
              onClick={onLogout}
              className="rounded-xl px-3.5 py-1.5 border border-rose-500/10 hover:border-rose-500/30 text-rose-450 hover:bg-rose-950/15 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE LAYOUT GRID SYSTEM CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-panel-layout">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR NAVIGATION REGION (Col index 1) */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-2xl text-left space-y-4">
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-widest block border-b border-zinc-900 pb-2.5">
                🛡️ CONTROL ADMINISTRATIVO
              </span>
              <nav className="space-y-1 text-xs font-bold font-sans">
                {[
                  { id: 'admin-dashboard', label: "Estadísticas", icon: <LayoutDashboard size={14} /> },
                  { id: 'admin-reservations', label: "Verificar Reservas", icon: <Calendar size={14} /> },
                  { id: 'admin-gallery', label: "Cargar Fotos/Videos", icon: <ImageIcon size={14} /> },
                  { id: 'admin-promotions', label: "Administrar Promos", icon: <Sparkles size={14} /> },
                  { id: 'admin-prices', label: "Configurar Tarifas", icon: <DollarSign size={14} /> },
                  { id: 'admin-reviews', label: "Moderar Opiniones", icon: <MessageSquare size={14} /> },
                  { id: 'admin-teams', label: "Equipos y Plantillas", icon: <Users size={14} /> },
                  { id: 'admin-payments', label: "Historial de Pagos", icon: <CreditCard size={14} /> },
                  { id: 'admin-drive', label: "Copias Google Drive", icon: <Cloud size={14} /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                      activeTab === item.id 
                        ? "bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20 scale-95 duration-100" 
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="border-t border-zinc-900 pt-3">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-2.5 text-rose-400 hover:bg-rose-950/25 transition font-extrabold text-xs tracking-wider uppercase cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Salir Panel</span>
                </button>
              </div>
            </div>

            <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl text-[10px] text-zinc-500 space-y-1 text-left font-mono leading-relaxed">
              <span>📍 ENLACE DE DATOS: EN LÍNEA</span>
              <p>Base de datos relacional SQLite & JSON inicializada. Registros persistentes locales en sincronía permanente.</p>
            </div>
          </aside>

          {/* MAIN VIEWS REGION (Col index 2,3,4) */}
          <div className="lg:col-span-3 space-y-6">

            {isLoading && (
              <div className="py-20 text-center text-xs text-zinc-550 font-mono flex flex-col items-center justify-center gap-2">
                <RefreshCw size={24} className="animate-spin text-emerald-500" />
                <span>Cargando indicadores y sincronizando bases de datos...</span>
              </div>
            )}

            {!isLoading && errorStatus && (
              <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400 text-xs">
                <ShieldAlert size={28} className="mx-auto mb-2 text-rose-500" />
                <span>{errorStatus}</span>
              </div>
            )}

            {!isLoading && !errorStatus && (
              <div className="focus-content-view">
                
                {((adminRole === 'receptionist' && activeTab === 'admin-prices') ||
                  (adminRole === 'moderator' && activeTab !== 'admin-gallery' && activeTab !== 'admin-reviews')) ? (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center shadow-2xl space-y-4 max-w-xl mx-auto my-12 animate-in fade-in duration-200 text-left">
                      <div className="h-16 w-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 text-rose-500 flex items-center justify-center animate-pulse">
                        <Lock size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-wider text-center">Acceso Restringido</h2>
                      <p className="text-xs text-zinc-400 leading-relaxed text-center">
                        Tu nivel de simulación actual de <strong className="text-emerald-450 uppercase">[{adminRole === 'receptionist' ? 'Recepcionista' : 'Moderador'}]</strong> no tiene autorización para acceder a la pestaña de <strong className="text-white uppercase">[{activeTab.replace('admin-', '')}]</strong>.
                      </p>
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-850 xs:text-center mt-2">
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          🛡️ El sistema de roles jerárquicos (RBAC) restringe estas operaciones de caja y configuraciones tácticas. Cambia de rol en la barra superior a <strong className="text-emerald-400">Dueño 👑</strong> para desbloquear todas las propiedades y realizar esta prueba.
                        </p>
                      </div>
                    </div>
                ) : (
                  <>
                
                {/* 1. VIEW: STATISTICS / DASHBOARD */}
                {activeTab === 'admin-dashboard' && stats && (
                  <div className="space-y-8 animate-in fade-in duration-200 text-left" id="admin-dashboard-container">
                    
                    {/* View Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                      <div>
                        <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                          <LayoutDashboard size={12} /> BIENVENIDO DE NUEVO
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">Estadísticas de Canchas</h1>
                        <p className="text-xs sm:text-sm text-zinc-400">Monitorea los ingresos del deportivo, reservas, y actividad de las ligas.</p>
                      </div>
                      <button 
                        onClick={fetchAllAdminData}
                        className="rounded-xl px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <RefreshCw size={12} className="text-emerald-400" />
                        <span>Refrescar</span>
                      </button>
                    </div>

                    {/* Bento Stat Counters Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* Stat 1: Earnings */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">INGRESOS NETOS</span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-450 font-mono">
                            {adminRole === 'receptionist' ? '🔒 [Restringido]' : `$${(stats.totalRevenue || stats.totalEarnings || 0).toLocaleString("es-MX")}`}
                          </span>
                          <span className="text-[10px] text-zinc-500 block font-mono">Pesos Mexicanos (MXN)</span>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center">
                          <DollarSign size={20} />
                        </div>
                      </div>

                      {/* Stat 2: Total Reservations */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">RESERVAS TOTALES</span>
                          <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.totalReservations || stats.totalBookings || 0}</span>
                          <div className="flex gap-2 text-[9px] font-mono mt-1 scale-95 origin-left">
                            <span className="text-emerald-400">{(stats.confirmedCount || stats.totalReservations - stats.pendingReservations || 0)} listos</span>
                            <span className="text-amber-500">{(stats.pendingCount || stats.pendingReservations || 0)} pend.</span>
                          </div>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-450 flex items-center justify-center">
                          <Calendar size={20} />
                        </div>
                      </div>

                      {/* Stat 3: Active fields */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">CANCHAS REGISTRADAS</span>
                          <span className="text-xl sm:text-2xl font-black text-white font-mono">{fields.length}</span>
                          <span className="text-[10px] text-zinc-500 block">Complejo Tribol Domo</span>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                      </div>

                      {/* Stat 4: Active promos */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">CUPONES VIGENTES</span>
                          <span className="text-xl sm:text-2xl font-black text-white font-mono">{promotions.length}</span>
                          <span className="text-[10px] text-zinc-500 block">Campañas activas de descuento</span>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-405 flex items-center justify-center">
                          <Sparkles size={20} />
                        </div>
                      </div>

                    </div>

                    {/* Business Intelligence Export Tools Row */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-md text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
                          <FileSpreadsheet size={14} /> GESTIÓN CONTABLE Y EXPORTADOR (CSV)
                        </h4>
                        <p className="text-[11px] text-zinc-400">Descarga los registros depurados de caja chica y bitácoras de reservas para tu contabilidad en Excel o Google Sheets.</p>
                      </div>
                      
                      {/* Controls Box */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                        
                        {/* Month Selector dropdown */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold">Seleccionar Mes Contable</span>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedExportMonth}
                              onChange={(e) => setSelectedExportMonth(e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer min-w-[140px]"
                            >
                              {getAvailableExportMonths().map(ym => (
                                <option key={ym} value={ym} className="bg-zinc-950 text-white">
                                  {formatYearMonthSpanish(ym)}
                                </option>
                              ))}
                            </select>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-2 rounded-lg" title="Reservas encontradas para este período">
                              {reservations.filter(res => res.date && res.date.startsWith(selectedExportMonth)).length} res
                            </span>
                          </div>
                        </div>

                        {/* Export Month Trigger */}
                        <div className="flex items-end h-full pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              const monthlyRes = reservations.filter(res => res.date && res.date.startsWith(selectedExportMonth));
                              exportReservationsToCSV(monthlyRes, getFieldFriendlyName);
                              addAuditLog('EXPORTAR_CSV_MES', `Exportación mensual (${formatYearMonthSpanish(selectedExportMonth)}) con ${monthlyRes.length} registros.`);
                            }}
                            className="w-full sm:w-auto py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-emerald-500/10 h-[34px]"
                            title="Exportar reservas del mes seleccionado en formato CSV"
                          >
                            <Download size={12} className="stroke-[3]" />
                            <span>Exportar Mes (CSV)</span>
                          </button>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-zinc-800 mx-1" />

                        {/* General Exports Actions */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              exportReservationsToCSV(reservations, getFieldFriendlyName);
                              addAuditLog('EXPORTAR_CSV', 'Exportación de reservas brutas históricas a formato tabular CSV.');
                            }}
                            className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 border border-zinc-800 hover:border-zinc-700 text-[10px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[34px]"
                            title="Exportar base histórica completa de reservas"
                          >
                            <Download size={11} />
                            <span>Historial Completo</span>
                          </button>

                          <button
                            type="button"
                            disabled={adminRole === 'receptionist'}
                            onClick={() => {
                              exportFinancesToCSV(reservations);
                              addAuditLog('EXPORTAR_FINANZAS', 'Se descargó reporte contable mercantil en CSV.');
                            }}
                            className={`flex-1 py-2 px-3 text-[10px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 h-[34px] ${
                              adminRole === 'receptionist'
                                ? "bg-zinc-950 text-zinc-650 cursor-not-allowed border border-zinc-900"
                                : "bg-zinc-900 hover:bg-zinc-850 text-zinc-350 border border-zinc-800 hover:border-zinc-700 cursor-pointer"
                            }`}
                            title="Planilla financiera de auditoría de arqueo de caja"
                          >
                            <Download size={11} />
                            <span>Reporte Caja</span>
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Metrics Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Left graph: Weekly reservations */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="border-b border-zinc-900 pb-3 text-left">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">🗓️ Reservas por Día de la Semana</h3>
                          <p className="text-[10px] text-zinc-500">Afluencia de partidos pactados de Lunes a Domingo.</p>
                        </div>
                        <div className="space-y-4 pt-2">
                          {(stats.occupancyData || [
                            { day: 'Lunes', reservations: 3 },
                            { day: 'Martes', reservations: 5 },
                            { day: 'Miércoles', reservations: 8 },
                            { day: 'Jueves', reservations: 4 },
                            { day: 'Viernes', reservations: 11 },
                            { day: 'Sábado', reservations: 15 },
                            { day: 'Domingo', reservations: 9 }
                          ]).map((item: any, idx: number) => {
                            const percent = (item.reservations / maxOcupancyReservations) * 100;
                            return (
                              <div key={idx} className="space-y-1 text-xs">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="font-bold text-zinc-350">{item.day}</span>
                                  <span className="font-mono font-bold text-emerald-400">
                                    {item.reservations} {item.reservations === 1 ? 'partido' : 'partidos'}
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                                  <div 
                                    style={{ width: `${percent}%` }}
                                    className="bg-emerald-500 rounded-full h-full transition-all duration-1000 ease-out"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right graph: Court occupancy */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="border-b border-zinc-900 pb-3 text-left">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">🏟️ Desempeño por Cancha de Juego</h3>
                          <p className="text-[10px] text-zinc-500">Métricas de partidos disputados y recaudación de caja.</p>
                        </div>
                        <div className="divide-y divide-zinc-900">
                          {(stats.courtStats || fields.map(f => ({
                            name: f.name,
                            bookingCount: reservations.filter(r => r.fieldId === f.id).length,
                            earnings: reservations.filter(r => r.fieldId === f.id && r.paymentStatus === 'paid').reduce((sum, r) => sum + r.totalPrice, 0)
                          }))).map((court: any, idx: number) => {
                            const percent = (court.bookingCount / maxCourtReservations) * 100;
                            return (
                              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="text-left space-y-1 flex-1">
                                  <span className="text-xs font-extrabold text-white">{court.name}</span>
                                  <div className="flex gap-2 items-center text-[10px] font-mono text-zinc-500">
                                    <span>{court.bookingCount} reservas registradas</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-bold">
                                      {adminRole === 'receptionist' ? '🔒 [Restringido]' : `$${court.earnings.toLocaleString("es-MX")} MXN`}
                                    </span>
                                  </div>
                                  <div className="w-2/3 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850 mt-1 max-w-xs">
                                    <div 
                                      className="bg-emerald-505/60 rounded-full h-full"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl text-right font-mono text-xs text-zinc-350 shrink-0 self-start md:self-auto">
                                  <span className="text-[9px] uppercase tracking-wider block text-zinc-500">Cobrado</span>
                                  <strong className="text-emerald-450 font-extrabold text-sm">
                                    {adminRole === 'receptionist' ? '🔒 [Restringido]' : `$${court.earnings.toLocaleString("es-MX")}`}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Secondary BI Row: MoM comparison, VIP clients, Off-peak Hours */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Column 1: MoM dynamic comparison */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left space-y-4">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 border-b border-zinc-900 pb-2.5">
                            📊 COMPARATIVA INTERMENSUAL (MoM)
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1">Cotejo volumétrico de caja del periodo corriente.</p>
                        </div>
                        <div className="space-y-4 flex-1">
                          <div className="bg-zinc-900/40 p-3.5 border border-zinc-850 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-zinc-550 block">PERIODO ACTUAL (JUNIO 2026)</span>
                            <div className="text-lg font-black text-white font-mono">
                              {adminRole === 'receptionist' ? '🔒 [Restringido]' : `$${(stats.totalRevenue || 1675).toLocaleString("es-MX")}`}
                            </div>
                            <span className="text-[9px] text-emerald-400 font-bold block">✓ Metas de taquilla superadas</span>
                          </div>
                          <div className="bg-zinc-900/20 p-3.5 border border-zinc-900 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-zinc-550 block">PERIODO ENERO - MAYO</span>
                            <div className="text-sm font-black text-zinc-400 font-mono">
                              {adminRole === 'receptionist' ? '🔒 [Restringido]' : `$${((stats.totalRevenue || 1675) * 0.81).toLocaleString("es-MX")}`}
                            </div>
                            <span className="text-[9px] text-zinc-500 italic block">Mes anterior de referencia</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-450 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl justify-center text-center">
                            <span>▲ +19% Rendimiento Positivo</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: VIP rankings */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left space-y-4">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 border-b border-zinc-900 pb-2.5">
                            👑 LEADERBOARD CAPITANES VIP (AFLUENCIA)
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1">Capitanes con mayor tasa de reservación.</p>
                        </div>
                        <div className="space-y-2.5 flex-1 pt-1">
                          {getCapitanesLeaderboard(reservations).map((cap, i) => (
                            <div key={i} className="flex items-center justify-between bg-zinc-900/30 p-2.5 border border-zinc-900 rounded-xl">
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold text-white flex items-center gap-1">
                                  {cap.name}
                                  {i === 0 && <span className="text-[10px]">⭐</span>}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono">{cap.phone}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-emerald-400 block font-mono">{cap.bookings} partidos</span>
                                <span className="text-[9px] text-zinc-550 block font-mono">{cap.email}</span>
                              </div>
                            </div>
                          ))}
                          {getCapitanesLeaderboard(reservations).length === 0 && (
                            <div className="text-center py-6 text-xs text-zinc-600 font-mono">
                              No hay reservas confirmadas registradas aún.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Low occupancy hours valle */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left space-y-4">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 border-b border-zinc-900 pb-2.5">
                            📉 HORAS VALLE (ÁMBITOS BAJA FLUENCIA)
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1">Sugerencia de horarios desocupados para campañas.</p>
                        </div>
                        <div className="space-y-2 flex-1 pt-1">
                          {analyzeLowOccupancyHours(reservations).map((hourSlot, i) => (
                            <div key={i} className="flex items-center justify-between bg-zinc-900/30 p-2 border border-zinc-900 rounded-xl">
                              <span className="text-xs font-bold text-zinc-350">{hourSlot.slot}</span>
                              <span className="text-[9px] font-mono font-bold py-0.5 px-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                {hourSlot.count} Rentas registradas
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Trigger promotion form pre-fill
                              setPromoTitle("Tarifa Especial en Horas Valle");
                              setPromoDesc("Incentivo automático para horarios matutinos de baja afluencia.");
                              setPromoCode("VALLE25");
                              setPromoDiscount(25);
                              setPromoType("discount");
                              setActiveTab("admin-promotions");
                              addAuditLog('TRIGGER_VALLE_PROMO', 'Redirección prellenando campaña de descuento "VALLE25" para incentivar horas de baja afluencia.');
                            }}
                            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center block"
                          >
                            Lanzar Cupón "VALLE25" (25% Desc.)
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Operational audit terminal system logs console */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>Registro de Auditoría de Sistemas (Consola de Logs)</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Seguimiento en tiempo real de operaciones de caja y reservas hechas por administradores.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAuditLogs([
                              {
                                id: 'log-' + Math.random().toString(36).substr(2, 9),
                                timestamp: new Date().toLocaleTimeString('es-MX'),
                                role: 'owner',
                                adminName: 'Consola Central',
                                actionType: 'LIMPIEZA_TERMINAL',
                                description: 'Terminal de auditoría refrescada por comando local.'
                              }
                            ]);
                          }}
                          className="rounded-lg px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800 text-[10px] text-zinc-400 cursor-pointer border border-zinc-850"
                        >
                          Limpiar Consola
                        </button>
                      </div>
                      <div className="bg-black/90 p-4 border border-zinc-900 rounded-2xl max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="flex flex-col sm:flex-row sm:items-start text-zinc-400 gap-1 sm:gap-2 leading-relaxed">
                            <span className="text-[10px] text-zinc-600 shrink-0 font-bold">[{log.timestamp}]</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-black shrink-0 uppercase tracking-wider ${
                              log.role === 'owner' 
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-450" 
                                : log.role === 'receptionist'
                                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                                  : "bg-purple-500/10 border border-purple-500/20 text-purple-405"
                            }`}>
                              {log.role === 'owner' ? 'Dueño' : log.role === 'receptionist' ? 'Recep.' : 'Mod.'}
                            </span>
                            <span className="text-zinc-500 shrink-0 font-extrabold">{log.adminName}:</span>
                            <span className="text-white shrink-0 font-bold">[{log.actionType}]</span>
                            <span className="text-zinc-300 font-medium break-words">{log.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. VIEW: RESERVATIONS LOG */}
                {activeTab === 'admin-reservations' && (
                  <div className="space-y-6 animate-in fade-in duration-200 text-left" id="admin-reservations-container">
                    
                    {/* View Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Bitácora de Reservas</h1>
                        <p className="text-xs sm:text-sm text-zinc-400">Administra todas las reservas, aprueba estatus o cancela turnos de canchas.</p>
                      </div>
                      <button 
                        onClick={fetchAllAdminData}
                        className="rounded-xl px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <RefreshCw size={12} className="text-emerald-400" />
                        <span>Sincronizar Lista</span>
                      </button>
                    </div>

                    {/* View mode toggle selector */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-900 rounded-3xl">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black text-zinc-550 tracking-widest block">Consola Operativa</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Metodología de Visualización</h3>
                      </div>
                      
                      <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setReservationViewMode('table')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            reservationViewMode === 'table' 
                              ? "bg-emerald-500 text-black font-black shadow-md" 
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <FileSpreadsheet size={13} />
                          <span>Vista Bitácora</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReservationViewMode('calendar');
                            addAuditLog('ABRIR_CALENDARIO', 'Abrió vista de calendario interactivo de canchas.');
                          }}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            reservationViewMode === 'calendar' 
                              ? "bg-emerald-500 text-black font-black shadow-md" 
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Calendar size={13} />
                          <span>Calendario de Canchas</span>
                        </button>
                      </div>
                    </div>

                    {/* RENDERING DUAL VIEWS */}

                    {/* V1: TABLE VIEW MODE */}
                    {reservationViewMode === 'table' ? (
                      <div className="space-y-6">
                        {/* Search filters and buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                            <input 
                              type="text" 
                              placeholder="Buscar por capitán, celular, correo, folio ID..."
                              value={reservationSearch}
                              onChange={(e) => setReservationSearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-900 focus:outline-none focus:border-emerald-500 text-xs text-white"
                            />
                          </div>
                          <div className="flex gap-2 whitespace-nowrap overflow-x-auto pb-1 sm:pb-0">
                            {[
                              { value: 'todos', label: 'Todos' },
                              { value: 'pending', label: 'Pendientes' },
                              { value: 'confirmed', label: 'Confirmados' },
                              { value: 'cancelled', label: 'Cancelados' }
                            ].map(st => (
                              <button
                                key={st.value}
                                onClick={() => setReservationFilterStatus(st.value as any)}
                                className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                                  reservationFilterStatus === st.value 
                                    ? "bg-emerald-500 text-black border-emerald-405/20 font-bold shadow-md"
                                    : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {filteredReservationsList.length === 0 ? (
                          <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-zinc-900 text-xs text-zinc-500">
                            Ninguna reserva registrada coincide con el criterio de búsqueda.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-zinc-900">
                            <table className="min-w-full divide-y divide-zinc-900 text-xs text-left">
                              <thead className="bg-zinc-950 font-bold tracking-wider text-zinc-400 uppercase text-[10px]">
                                <tr>
                                  <th className="px-5 py-4">Ficha / ID</th>
                                  <th className="px-5 py-4">Cancha</th>
                                  <th className="px-5 py-4">Fecha y Hora</th>
                                  <th className="px-5 py-4">Capitán / Contacto</th>
                                  <th className="px-5 py-4">Caja (Recaudado)</th>
                                  <th className="px-5 py-4">Abonos / LLegada</th>
                                  <th className="px-5 py-4">Estados</th>
                                  <th className="px-5 py-4 text-center">Controles Operativos</th>
                                </tr>
                              </thead>
                              <tbody className="bg-zinc-950/30 divide-y divide-zinc-900" id="admin-reservations-table-body">
                                {filteredReservationsList.map(res => (
                                  <tr key={res.id} className="hover:bg-zinc-900/45 transition">
                                    <td className="px-5 py-4 font-mono font-bold text-zinc-400">
                                      #{res.id}
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-white">
                                      {getFieldFriendlyName(res.fieldId)}
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-zinc-200">{res.date}</span>
                                        <span className="font-mono text-emerald-400 tracking-wide text-[10px]">{res.timeSlot}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="flex flex-col text-zinc-400 gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedDetailedCustomer({
                                              name: res.userName,
                                              phone: res.userPhone,
                                              email: res.userEmail
                                            });
                                          }}
                                          className="font-bold text-white font-sans text-left hover:text-emerald-400 hover:underline transition focus:outline-none cursor-pointer"
                                          title={`Ver perfil y comportamiento de ${res.userName}`}
                                        >
                                          {res.userName}
                                        </button>
                                        <span className="flex items-center gap-1 text-[10px] text-zinc-550 font-mono">
                                          <Phone size={10} /> {res.userPhone}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                                      ${res.totalPrice.toLocaleString("es-MX")}
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="space-y-1">
                                        {/* Anticipo display */}
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] text-zinc-400 font-mono">
                                            Abonado: <strong className="text-emerald-400">${res.advancePaid || 0}</strong>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPayingReservation(res);
                                              setAbonoAmountInput("200");
                                            }}
                                            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-black text-emerald-450 hover:bg-emerald-500 hover:text-black transition cursor-pointer"
                                            title="Registrar abonado"
                                          >
                                            + Abono
                                          </button>
                                        </div>

                                        {/* Arrival checkin */}
                                        <div className="text-[10px]">
                                          {res.checkedIn ? (
                                            <span className="text-emerald-450 font-bold flex items-center gap-1">
                                              ✓ LLEGÓ ({res.checkedInAt || "En cancha"})
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleUpdateReservation(res.id, 'confirmed', res.paymentStatus, {
                                                  checkedIn: true,
                                                  checkedInAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                                                });
                                                addAuditLog('CHECK_IN', `Recepción marcó llegada del equipo de ${res.userName} a cancha.`);
                                              }}
                                              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-extrabold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
                                            >
                                              Marcar Llegada
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="flex flex-col gap-1.5 items-start">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                          res.status === 'confirmed' 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-405" 
                                            : res.status === 'pending' 
                                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                        }`}>
                                          {res.status === 'confirmed' ? "Confirmado" : res.status === 'pending' ? "Pendiente" : "Cancelado"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                          res.paymentStatus === 'paid' 
                                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                                            : "bg-zinc-800 border-zinc-700/60 text-zinc-500"
                                        }`}>
                                          {res.paymentStatus === 'paid' ? "Pagado" : "Impago"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="flex items-center justify-center gap-1.5">
                                        {/* WhatsApp Simulation Dispatcher */}
                                        <button
                                          type="button"
                                          onClick={() => setWhatsAppPreviewObj(res)}
                                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] border border-zinc-800 text-emerald-450 font-bold flex items-center gap-1 cursor-pointer transition"
                                          title="Mensaje de WhatsApp"
                                        >
                                          <Send size={11} />
                                          <span>Notificar WA</span>
                                        </button>

                                        {res.status !== 'confirmed' && (
                                          <button 
                                            onClick={() => handleUpdateReservation(res.id, 'confirmed', 'paid')}
                                            className="bg-emerald-600 hover:bg-emerald-555 text-black font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition uppercase flex items-center gap-1"
                                            title="Confirmar Partido y Pago"
                                          >
                                            <CheckCircle size={11} />
                                            <span>Aprobar</span>
                                          </button>
                                        )}
                                        {res.status !== 'cancelled' && (
                                          <button 
                                            onClick={() => handleUpdateReservation(res.id, 'cancelled', 'pending')}
                                            className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/10 text-rose-450 font-semibold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition uppercase flex items-center gap-1"
                                            title="Cancelar Partido"
                                          >
                                            <XCircle size={11} />
                                            <span>Cancelar</span>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      // V2: DAILY VISUAL GRID SCHEDULER
                      <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Interactive Scheduler controls */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 text-left space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-widest block">Calendario Operativo</span>
                              <h4 className="text-white font-bold text-sm">Selecciona Fecha de Trabajo</h4>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={calendarTargetDate}
                                onChange={(e) => setCalendarTargetDate(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => setCalendarTargetDate(new Date().toISOString().split('T')[0])}
                                className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 rounded-xl hover:text-white transition cursor-pointer"
                              >
                                Hoy
                              </button>
                            </div>
                          </div>

                          {movingReservationId && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center justify-between animate-pulse">
                              <span className="font-bold flex items-center gap-2">
                                🔄 Moviendo reserva #{movingReservationId} — Elige un casillero vacío del calendario para soltar el partido.
                              </span>
                              <button
                                type="button"
                                onClick={() => setMovingReservationId(null)}
                                className="px-2 py-1 bg-zinc-950 text-[10px] font-black rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                              >
                                Cancelar Traslado
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Core calendar matrix grid */}
                        <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950/60 shadow-xl">
                          <div className="min-w-[800px] divide-y divide-zinc-900">
                            {/* Matrix Header (Canchas columns) */}
                            <div className="grid grid-cols-5 bg-zinc-950 text-center font-black text-[10px] text-zinc-400 uppercase tracking-widest py-3 border-b border-zinc-900">
                              <div className="py-2 border-r border-zinc-900 text-left pl-5">Rango Horario</div>
                              {fields.map(f => (
                                <div key={f.id} className="py-2 border-r border-zinc-900 last:border-0 font-bold text-white flex flex-col justify-center items-center leading-none gap-1">
                                  <span>{f.name}</span>
                                  <span className="text-[8px] text-zinc-500 font-normal">Sintético Pro</span>
                                </div>
                              ))}
                            </div>

                            {/* Matrix Rows (Hours slots) */}
                            {calendarHours.map((hour) => (
                              <div key={hour} className="grid grid-cols-5 text-center min-h-[110px]">
                                {/* Horario column */}
                                <div className="border-r border-zinc-900 flex items-center justify-start pl-5 bg-zinc-950/40 text-xs font-black text-zinc-350 font-mono tracking-wider">
                                  {hour}
                                </div>

                                {/* Canchas slots mapping */}
                                {fields.map((f) => {
                                  // Find booking
                                  const booking = reservations.find(
                                    (r) => r.fieldId === f.id && r.date === calendarTargetDate && r.timeSlot === hour && r.status !== 'cancelled'
                                  );

                                  if (booking) {
                                    return (
                                      <div key={f.id} className="p-2.5 border-r border-zinc-900 last:border-0 flex flex-col justify-between bg-zinc-950/10 text-left relative group">
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight block truncate max-w-[120px]">
                                              ⚽ {booking.userName}
                                            </span>
                                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                                              booking.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/25" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                                            }`}>
                                              {booking.paymentStatus === 'paid' ? "Liquidado" : "Pendiente"}
                                            </span>
                                          </div>
                                          <p className="text-[9px] text-zinc-500 font-mono">{booking.userPhone}</p>
                                          <div className="flex flex-wrap gap-1">
                                            <span className="text-[8px] px-1 py-0.2 bg-zinc-900 text-zinc-300 font-mono rounded">
                                              Ab.: ${booking.advancePaid || 0}
                                            </span>
                                            {booking.checkedIn && (
                                              <span className="text-[8px] px-1 py-0.2 bg-emerald-500/10 text-emerald-400 font-bold rounded">
                                                En Cancha
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Action controls direct on calendar cards */}
                                        <div className="pt-2 flex items-center gap-1 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setMovingReservationId(booking.id);
                                              addAuditLog('TRASLAJO_INICIADO', `Se inició movilización de partido de ${booking.userName} en calendario.`);
                                            }}
                                            className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[9px] text-amber-500 font-black cursor-pointer transition uppercase"
                                            title="Cambiar horario / Reajustar"
                                          >
                                            Mover
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPayingReservation(booking);
                                              setAbonoAmountInput("200");
                                            }}
                                            className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[9px] text-emerald-450 font-bold cursor-pointer transition"
                                            title="Registrar abono de reserva"
                                          >
                                            Abono
                                          </button>
                                          
                                          {!booking.checkedIn && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleUpdateReservation(booking.id, 'confirmed', booking.paymentStatus, {
                                                  checkedIn: true,
                                                  checkedInAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                                                });
                                                addAuditLog('CHECK_IN', `Check-in rápido en cancha para ${booking.userName}`);
                                              }}
                                              className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-extrabold hover:text-white transition cursor-pointer"
                                            >
                                              Llegó
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }

                                  // VACANT HOUR SLOT
                                  return (
                                    <div key={f.id} className="p-2 border-r border-zinc-900 last:border-0 flex items-center justify-center bg-transparent transition-all">
                                      {movingReservationId ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // Execute drag & drop rescheduling update
                                            const movingId = movingReservationId;
                                            handleUpdateReservation(movingId, 'confirmed', 'pending', {
                                              fieldId: f.id,
                                              date: calendarTargetDate,
                                              timeSlot: hour
                                            });
                                            addAuditLog('TRASLAJO_EXITOSO', `Se reajustó exitosamente la reserva #${movingId} a la cancha [${f.name}] en horario [${hour}] el día [${calendarTargetDate}].`);
                                            setMovingReservationId(null);
                                          }}
                                          className="w-full py-5 rounded-2xl bg-emerald-500/10 border border-dashed border-emerald-500 text-[10px] text-emerald-400 font-extrabold hover:bg-emerald-500 hover:text-black transition cursor-pointer animate-pulse"
                                        >
                                          🟢 Soltar Aquí
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // Open Fast Booking popover
                                            setQuickFieldId(f.id);
                                            setQuickDate(calendarTargetDate);
                                            setQuickTimeSlot(hour);
                                            setIsQuickOpen(true);
                                          }}
                                          className="w-full h-full py-4 rounded-xl border border-dashed border-zinc-850 hover:border-zinc-700 text-zinc-650 hover:text-zinc-400 text-[9px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1"
                                        >
                                          <Plus size={12} className="stroke-[2.5]" />
                                          <span>DISPONIBLE (RENTAR)</span>
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* POP DIALOGS AND MODALS SECTION */}

                    {/* D1: QUICK ADD BOOKING POP OVER */}
                    {isQuickOpen && (
                      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl max-w-md w-full text-left space-y-4 animate-in zoom-in-95 duration-150">
                          <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest block">Reserva Express</span>
                              <h4 className="text-white font-bold text-sm uppercase">Agendar Espacio Directo</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsQuickOpen(false)}
                              className="text-zinc-500 hover:text-white p-1"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>

                          <form onSubmit={handleQuickCreateBook} className="space-y-4 text-xs font-sans">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-850 text-[11px] text-zinc-400">
                              <div>
                                <span className="block text-[9px] font-bold text-zinc-550">CANCHA SELECCIONADA</span>
                                <strong className="text-white block mt-0.5">{getFieldFriendlyName(quickFieldId)}</strong>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold text-zinc-550">HORARIO Y FECHA</span>
                                <strong className="text-white block mt-0.5 font-mono">{quickDate} ({quickTimeSlot})</strong>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-zinc-400 font-medium block">Nombre del Capitán *</label>
                              <input
                                type="text"
                                placeholder="Ej: Fernando Alonso"
                                value={quickName}
                                onChange={(e) => setQuickName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-medium block">Celular del Capitán *</label>
                                <input
                                  type="tel"
                                  placeholder="52155..."
                                  value={quickPhone}
                                  onChange={(e) => setQuickPhone(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-505"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-medium block">Email (Opcional)</label>
                                <input
                                  type="email"
                                  placeholder="capitan@gmail.com"
                                  value={quickEmail}
                                  onChange={(e) => setQuickEmail(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-505"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer transition block text-center"
                            >
                              Registrar Reservado ($400 MXN base)
                            </button>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* D2: ABONO DOWN-PAYMENT REGISTRATION POP OVER */}
                    {payingReservation && (
                      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-left space-y-4 animate-in zoom-in-95 duration-150">
                          <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest block">Pagos anticipados</span>
                              <h4 className="text-white font-bold text-sm uppercase">Registrar Abono Parcial</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPayingReservation(null)}
                              className="text-zinc-500 hover:text-white p-1"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>

                          <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-xl text-xs space-y-1 font-sans">
                            <div className="flex justify-between">
                              <span className="text-zinc-400 font-medium">Cliente capitán:</span>
                              <strong className="text-white">{payingReservation.userName}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400 font-medium">Costo Total Partido:</span>
                              <strong className="text-white font-mono">${payingReservation.totalPrice} MXN</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400 font-medium">Anticipo Anterior:</span>
                              <strong className="text-emerald-400 font-mono">${payingReservation.advancePaid || 0} MXN</strong>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs font-sans">
                            <label className="text-zinc-400 font-medium block">Monto del nuevo abono del cliente ($)*</label>
                            <input
                              type="number"
                              value={abonoAmountInput}
                              onChange={(e) => setAbonoAmountInput(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-lg font-bold font-mono focus:outline-none focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-zinc-500 leading-tight">El anticipo se registrará en la ficha del folio y se restará del cobro final.</p>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              const extraAbonoVal = Number(abonoAmountInput) || 0;
                              const prevAbono = payingReservation.advancePaid || 0;
                              const updatedAbono = prevAbono + extraAbonoVal;

                              // Trigger API update with extra parameters
                              await handleUpdateReservation(payingReservation.id, payingReservation.status, payingReservation.paymentStatus, {
                                advancePaid: updatedAbono
                              });

                              addAuditLog('ABONO_REGISTRADO', `Se abonaron $${extraAbonoVal} MXN a reserva #${payingReservation.id} de ${payingReservation.userName}.`);
                              setPayingReservation(null);
                            }}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer text-center block transition"
                          >
                            Registrar Abono
                          </button>
                        </div>
                      </div>
                    )}

                    {/* D3: SMARTPHONE WHATSAPP SIMULATION PREVIEW MODAL */}
                    {whatsAppPreviewObj && (
                      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-950 border border-zinc-900 max-w-sm w-full rounded-[40px] p-6 shadow-2xl relative border-zinc-850/60 ring-8 ring-zinc-900/60 text-left animate-in zoom-in-95 duration-150">
                          
                          {/* Close button */}
                          <button
                            type="button"
                            onClick={() => setWhatsAppPreviewObj(null)}
                            className="absolute top-4 right-4 text-zinc-550 hover:text-white"
                          >
                            <XCircle size={18} />
                          </button>

                          {/* Top speaker notch look */}
                          <div className="h-4 w-28 bg-zinc-900 rounded-full mx-auto mb-4 border border-zinc-850"></div>

                          {/* Mock WhatsApp screen header */}
                          <div className="bg-zinc-900 p-4 rounded-t-2xl border-b border-zinc-850 flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-450 text-xs font-black flex items-center justify-center uppercase">
                              {whatsAppPreviewObj.userName[0]}
                            </div>
                            <div className="text-xs leading-tight">
                              <h5 className="font-extrabold text-white">{whatsAppPreviewObj.userName}</h5>
                              <span className="text-[9px] text-emerald-400 font-mono">En Línea (Tribol Canchas)</span>
                            </div>
                          </div>

                          {/* Message dialogue bubble look */}
                          <div className="bg-[#0b141a] p-4 min-h-[220px] rounded-b-2xl space-y-3 relative overflow-hidden font-sans border-t border-black">
                            <div className="text-[10px] text-center bg-[#182229] py-1 px-3.5 rounded-lg text-[#8696a0] max-w-xs mx-auto">
                              Hoy • Cifrado de extremo a extremo
                            </div>

                            <div className="bg-[#005c4b] text-white p-3 rounded-2xl text-[11px] leading-relaxed relative max-w-[85%] self-end ml-auto space-y-1.5 shadow-md">
                              <p className="font-black text-emerald-300">🏆 FÚTBOL RÁPIDO TRIBOL CANCHAS</p>
                              <p>¡Hola <strong>{whatsAppPreviewObj.userName}</strong>! Te confirmamos tu partido reservado en el complejo.</p>
                              <p>⚡ Cancha: <strong>{getFieldFriendlyName(whatsAppPreviewObj.fieldId)}</strong><br />
                              📅 Fecha: <strong>{whatsAppPreviewObj.date}</strong><br />
                              ⏰ Horario: <strong>{whatsAppPreviewObj.timeSlot}</strong><br />
                              💵 Costo Base Renta: <strong>$500 MXN</strong><br />
                              💰 Anticipo registrado: <strong className="text-emerald-300">${whatsAppPreviewObj.advancePaid || 0} MXN</strong>
                              </p>
                              <p className="text-[9px] text-emerald-305 italic">Para cambios de hora o check-in digital, dirígete con el recepcionista.</p>
                              <span className="block text-[8px] text-right text-emerald-250 italic">10:42 PM ✓✓</span>
                            </div>
                          </div>

                          {/* Simulated click sender trigger link */}
                          <div className="pt-5">
                            <button
                              type="button"
                              onClick={() => {
                                const msgText = `🏆 FÚTBOL RÁPIDO TRIBOL CANCHAS\n\n¡Hola *${whatsAppPreviewObj.userName}*! Te confirmamos tu partido reservado:\n⚡ Cancha: *${getFieldFriendlyName(whatsAppPreviewObj.fieldId)}*\n📅 Fecha: *${whatsAppPreviewObj.date}*\n⏰ Horario: *${whatsAppPreviewObj.timeSlot}*\n💵 Costo Base Renta: *$500*\n💰 Anticipo registrado: *$${whatsAppPreviewObj.advancePaid || 0} MXN*\n\n¡Te esperamos en Domo Tribol! ⚽`;
                                const waUrl = `https://wa.me/${whatsAppPreviewObj.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msgText)}`;
                                addAuditLog('NOTIFICAR_WA', `Envío de plantilla de WhatsApp autorizada a capitán ${whatsAppPreviewObj.userName}.`);
                                window.open(waUrl, '_blank');
                                setWhatsAppPreviewObj(null);
                              }}
                              className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5 transition"
                            >
                              <Send size={12} className="stroke-[2.5]" />
                              <span>Enviar por WhatsApp Web</span>
                            </button>
                            <p className="text-[9px] text-zinc-500 text-center mt-2">La simulación disparará la API oficial de WhatsApp para computadoras y móviles.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDetailedCustomer && (
                      <CustomerDetailsModal
                        customerName={selectedDetailedCustomer.name}
                        customerPhone={selectedDetailedCustomer.phone}
                        customerEmail={selectedDetailedCustomer.email || ''}
                        allReservations={reservations}
                        allPayments={payments}
                        onClose={() => setSelectedDetailedCustomer(null)}
                        getFieldFriendlyName={getFieldFriendlyName}
                      />
                    )}

                  </div>
                )}

                {/* 3. VIEW: GALLERY CAPTURES (Cargar Fotos / Videos Highlights) */}
                {activeTab === 'admin-gallery' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200 text-left" id="admin-gallery-container">
                    
                    {/* File creation form */}
                    <div className="lg:col-span-1 space-y-6">
                      
                      {/* Form: Photo Upload */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                            <Upload size={16} className="text-emerald-400" />
                            <span>Cargar Nueva Foto</span>
                          </h3>
                          <p className="text-[11px] text-zinc-500 mt-1">Sube instantáneas de las instalaciones y eventos de Tribol.</p>
                        </div>

                        <form onSubmit={handlePhotoFormSubmit} className="space-y-4 text-xs font-sans">
                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Título de la Foto *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: Final del Torneo Nocturno"
                              value={photoTitle}
                              onChange={(e) => setPhotoTitle(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-505"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Categoría *</label>
                            <select 
                              value={photoCategory} 
                              onChange={(e) => setPhotoCategory(e.target.value as any)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-zinc-300 font-sans"
                            >
                              <option value="facilities">🏟️ Instalaciones y Cafetería</option>
                              <option value="matches">⚽ Partidos y Ligas</option>
                              <option value="events">🏆 Eventos Especiales</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Seleccionar Imagen *</label>
                            <div 
                              onDragOver={(e) => { e.preventDefault(); setPhotoIsDragging(true); }}
                              onDragLeave={() => setPhotoIsDragging(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setPhotoIsDragging(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) processImageFile(file);
                              }}
                              className={`relative rounded-2xl border-2 border-dashed p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                                photoIsDragging 
                                  ? "border-emerald-550 bg-emerald-500/5" 
                                  : photoBase64 
                                    ? "border-emerald-500/30 bg-zinc-900/40" 
                                    : "border-zinc-805 hover:border-zinc-700 bg-zinc-900/20"
                              }`}
                            >
                              <input 
                                type="file" 
                                accept="image/*, .png, .jpg, .jpeg, .gif, .webp, .svg, .bmp, .tiff, .ico, .heic, .heif, .raw"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) processImageFile(file);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <Upload size={22} className={photoBase64 ? "text-emerald-400 animate-bounce" : "text-zinc-500"} />
                              <p className="text-[11px] text-zinc-300">
                                {photoFileName ? (
                                  <span className="font-bold text-white break-all font-mono">{photoFileName}</span>
                                ) : "Arrastra tu imagen aquí o haz clic para buscar."}
                              </p>
                              <p className="text-[9px] text-zinc-550 leading-none">Cualquier formato e imagen (Sin límite de tamaño)</p>
                            </div>
                          </div>

                          {photoStatusMsg && (
                            <div className="text-[10px] text-emerald-450 bg-emerald-500/5 p-2 rounded-xl flex items-center gap-1">
                              <CheckCircle size={12} className="text-emerald-500" />
                              <span>{photoStatusMsg}</span>
                            </div>
                          )}

                          {photoErrorMsg && (
                            <div className="text-[10px] text-rose-450 bg-rose-500/5 p-2 rounded-xl flex items-center gap-1">
                              <AlertTriangle size={12} className="text-rose-500" />
                              <span>{photoErrorMsg}</span>
                            </div>
                          )}

                          <button 
                            type="submit"
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            Publicar Foto
                          </button>
                        </form>
                      </div>

                      {/* Unified Form: Published Video Stream Links */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                            <Film size={16} className="text-emerald-400" />
                            <span>Publicar Video en Transmisión</span>
                          </h3>
                          <p className="text-[11px] text-zinc-500 mt-1">Transmite video directo (Highlights o en Vivo) en el portal cliente.</p>
                        </div>

                        <form onSubmit={handleAddVideo} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-zinc-400">Título del Video</label>
                            <input 
                              type="text" 
                              placeholder="Ej: Final Copa Sabatina Primera Fuerza"
                              value={videoTitle}
                              onChange={(e) => setVideoTitle(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">URL del Video (MP4 / Stream)</label>
                            <input 
                              type="url" 
                              placeholder="https://..."
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-zinc-400">Categoría</label>
                              <select 
                                value={videoCategory} 
                                onChange={(e) => setVideoCategory(e.target.value as any)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white text-zinc-300 focus:outline-none"
                              >
                                <option value="live">En Vivo (Stream Live)</option>
                                <option value="highlight">Highlights de Goles</option>
                                <option value="full_match">Partido Completo</option>
                              </select>
                            </div>
                            <div className="space-y-1 flex flex-col justify-end pb-1 text-left">
                              <label className="text-zinc-400 flex items-center gap-1.5 cursor-pointer user-select-none text-[11px]">
                                <input 
                                  type="checkbox" 
                                  checked={videoIsLive}
                                  onChange={(e) => setVideoIsLive(e.target.checked)}
                                  className="rounded border-zinc-800 bg-zinc-900 text-emerald-500"
                                />
                                <span>¿Está Transmitiendo?</span>
                              </label>
                            </div>
                          </div>

                          {videoStatusMsg && (
                            <p className="text-[10px] text-emerald-450 font-medium font-mono">{videoStatusMsg}</p>
                          )}

                          <button 
                            type="submit"
                            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                          >
                            Agregar Video
                          </button>
                        </form>
                      </div>

                    </div>

                    {/* Published Gallery list (Col spans 2) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Subview Title */}
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                        <div>
                          <h2 className="text-base font-black text-white uppercase tracking-wider">📸 Catálogo de la Galería</h2>
                          <p className="text-[11px] text-zinc-500">Mapeo de archivos de almacenamiento y registros de fotos.</p>
                        </div>
                        <button 
                          onClick={fetchAllAdminData}
                          className="rounded-full p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition"
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>

                      {/* Photos Display */}
                      {photos.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-900/15 rounded-2xl text-xs text-zinc-550 border border-zinc-900">
                          Aún no hay fotos registradas para mostrar.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {photos.map(p => (
                            <div key={p.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex gap-4 text-left shadow-lg items-center relative overflow-hidden">
                              <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
                                <img 
                                  src={p.url} 
                                  alt={p.caption} 
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover filter brightness-90"
                                />
                              </div>
                              <div className="flex-1 space-y-1 text-xs">
                                <h4 className="font-extrabold text-white text-xs leading-snug line-clamp-1">{p.caption}</h4>
                                <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-zinc-405">
                                  <span className="bg-zinc-900 border border-zinc-805 px-1.5 py-0.5 rounded leading-none text-emerald-400">
                                    {p.category}
                                  </span>
                                  <span>•</span>
                                  <span>ID #{p.id}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeletePhoto(p.id)}
                                className="rounded-full p-2 bg-rose-950/20 border border-rose-500/10 text-rose-405 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                                title="Eliminar Foto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Video Streamings Catalog Display */}
                      <div className="border-t border-zinc-900 pt-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">🎥 Videoteca y Transmisiones ({videos.length})</h3>
                        {videos.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic">No hay transmisiones grabadas.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videos.map(vid => (
                              <div key={vid.id} className="bg-zinc-950 border border-zinc-900 p-3 rounded-2xl flex items-center gap-3">
                                <div className="h-12 w-16 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shrink-0">
                                  <img 
                                    src={vid.thumbnailUrl} 
                                    className="h-full w-full object-cover filter brightness-75" 
                                    alt={vid.title} 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 text-left text-xs">
                                  <h4 className="font-extrabold text-white line-clamp-1 leading-none">{vid.title}</h4>
                                  <div className="flex items-center gap-1.5 text-[9px] font-mono mt-1 text-zinc-500">
                                    <span className={`${vid.isLive ? "text-rose-400" : "text-zinc-405"}`}>
                                      {vid.isLive ? "🔴 EN VIVO" : "📼 GRABADO"}
                                    </span>
                                    <span>•</span>
                                    <span>{vid.views} vistas</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDeleteVideo(vid.id)}
                                  className="text-rose-400 hover:text-white p-1 rounded-full hover:bg-rose-950/25 transition cursor-pointer shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* 4. VIEW: PROMOTIONS CONTROL */}
                {activeTab === 'admin-promotions' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200 text-left" id="admin-promotions-container">
                    
                    {/* Creation Form (Col 1) */}
                    <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                          <Sparkles size={16} className="text-emerald-400" />
                          <span>Crear Promoción / Cupón</span>
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1">Crea cupones de descuento válidos para la taquilla del club.</p>
                      </div>

                      <form onSubmit={handleCreatePromo} className="space-y-4 text-xs font-sans">
                        <div className="space-y-1">
                          <label className="text-zinc-400 block font-medium">Nombre de Promoción *</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Lunes de Goleada Loca"
                            value={promoTitle}
                            onChange={(e) => setPromoTitle(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-505"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Código Cupón *</label>
                            <input 
                              type="text" 
                              placeholder="LUNES20"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono uppercase tracking-wider focus:outline-none font-bold"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Tipo Promo *</label>
                            <select 
                              value={promoType} 
                              onChange={(e) => setPromoType(e.target.value as any)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none text-zinc-300 font-sans"
                            >
                              <option value="discount">Descuento (%)</option>
                              <option value="tournament">En Torneo</option>
                              <option value="special">Fórmula Especial</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Porcentaje de Descuento (%) *</label>
                            <input 
                              type="number" 
                              min={1} 
                              max={100}
                              value={promoDiscount}
                              onChange={(e) => setPromoDiscount(Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono focus:outline-none text-sm font-bold"
                              required
                            />
                          </div>
                          
                          <div className="space-y-1 font-sans">
                            <label className="text-zinc-400 block font-medium">Vigencia hasta *</label>
                            <input 
                              type="date" 
                              value={promoUntil}
                              onChange={(e) => setPromoUntil(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-400 block font-medium">Descripción Narrativa *</label>
                          <textarea 
                            rows={3} 
                            placeholder="Ej: Descuento del 10% aplicable en reservas ordinarias..."
                            value={promoDesc}
                            onChange={(e) => setPromoDesc(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                            required
                          />
                        </div>

                        {promoStatusMsg && (
                          <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-1">
                            <CheckCircle size={12} />
                            <span>{promoStatusMsg}</span>
                          </div>
                        )}

                        {promoErrorMsg && (
                          <div className="text-[10px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl flex items-center gap-1">
                            <AlertTriangle size={12} />
                            <span>{promoErrorMsg}</span>
                          </div>
                        )}

                        <button 
                          type="submit"
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          Crear Promoción
                        </button>
                      </form>
                    </div>

                    {/* Active Promotions Grid (Col 2, 3) */}
                    <div className="lg:col-span-2 space-y-4">
                      
                      {/* Section Title */}
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                        <div>
                          <h2 className="text-base font-black text-white uppercase tracking-wider">🏷️ Cupones y Promociones Activas</h2>
                          <p className="text-[11px] text-zinc-500">Habilita o elimina cupones de promoción vigentes para los checkout.</p>
                        </div>
                        <button 
                          onClick={fetchAllAdminData}
                          className="rounded-full p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer"
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>

                      {/* Promos loop catalog */}
                      {promotions.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl text-xs text-zinc-500 pb-12">
                          No hay promociones o campañas registradas aún.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {promotions.map(promo => (
                            <div key={promo.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden text-left shadow-md">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-emerald-400 font-mono font-black border border-emerald-500/25 px-2.5 py-1 rounded bg-emerald-500/5 text-xs text-center">
                                    {promo.promoCode || "SIN CODIGO"}
                                  </span>
                                  <button 
                                    onClick={() => handleTogglePromo(promo.id)}
                                    className="cursor-pointer transition"
                                    title={promo.isActive ? "Desactivar" : "Activar"}
                                  >
                                    {promo.isActive ? (
                                      <ToggleRight className="text-emerald-500" size={28} />
                                    ) : (
                                      <ToggleLeft className="text-zinc-650" size={28} />
                                    )}
                                  </button>
                                </div>
                                <h4 className="font-extrabold text-white text-xs leading-none pt-1">{promo.title}</h4>
                                <p className="text-[11px] text-zinc-400 leading-snug font-sans">{promo.description}</p>
                              </div>
                              
                              <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                                <div>
                                  <span className="block">Descuento: <span className="font-bold text-white">-{promo.discountPercentage}%</span></span>
                                  <span>Vence: <span className="font-semibold text-zinc-400">{promo.validUntil}</span></span>
                                </div>
                                <button
                                  onClick={() => handleDeletePromo(promo.id)}
                                  className="rounded-full p-2 bg-rose-950/20 border border-rose-500/10 text-rose-400 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                                  title="Eliminar promoción"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* 5. VIEW: CONFIGURE CHARGES / TARIFAS */}
                {activeTab === 'admin-prices' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200 text-left" id="admin-prices-container">
                    
                    {/* Court prices configure base */}
                    <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                          <DollarSign size={16} className="text-emerald-400" />
                          <span>Tarifas Base de Canchas</span>
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1">Configura el precio regular por hora para cada cancha.</p>
                      </div>

                      <div className="space-y-4">
                        {fields.map(f => (
                          <div key={f.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                            <div className="text-left leading-tight">
                              <span className="font-extrabold text-white text-xs block">{f.name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">Tarifa Base: ${f.basePricePerHour} MXN/Hr</span>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                placeholder="Nueva tarifa..."
                                onChange={(e) => setPriceBaseRateInput(Number(e.target.value))}
                                className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs text-white max-w-[100px] font-mono font-black"
                              />
                              <button 
                                onClick={() => handleUpdateBasePrice(f)}
                                className="bg-emerald-500 hover:bg-emerald-450 text-black text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {priceStatusMsg && (
                        <div className="text-[10px] text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl leading-relaxed">
                          {priceStatusMsg}
                        </div>
                      )}

                    </div>

                    {/* Dynamic Pricing rules form and display (Col 2, 3) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Configuration creation */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl text-left space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                          <Clock size={16} className="text-emerald-450" />
                          <span>Regla de Tarifa Dinámica para Horas Pico</span>
                        </h3>
                        
                        <form onSubmit={handleCreateDynamicPriceRule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Cancha Seleccionada</label>
                            <select 
                              value={priceTargetCourtId}
                              onChange={(e) => setPriceTargetCourtId(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                            >
                              {fields.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Día de la Semana</label>
                            <select 
                              value={priceDynamicDayInput}
                              onChange={(e) => setPriceDynamicDayInput(Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white text-xs focus:outline-none font-sans"
                            >
                              <option value={1}>Lunes</option>
                              <option value={2}>Martes</option>
                              <option value={3}>Miércoles</option>
                              <option value={4}>Jueves</option>
                              <option value={5}>Viernes</option>
                              <option value={6}>Sábado</option>
                              <option value={0}>Domingo</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-zinc-400 block font-medium">Precio por Hora Pico *</label>
                            <input 
                              type="number" 
                              value={priceDynamicRateInput}
                              onChange={(e) => setPriceDynamicRateInput(Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none font-mono font-bold"
                              required
                            />
                          </div>

                          <div className="space-y-1 font-mono">
                            <label className="text-zinc-400 block font-medium font-sans">Desde hora pico (Start)</label>
                            <input 
                              type="text" 
                              placeholder="18:00"
                              value={priceDynamicHoursStart}
                              onChange={(e) => setPriceDynamicHoursStart(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 font-mono">
                            <label className="text-zinc-400 block font-medium font-sans">Hasta hora pico (End)</label>
                            <input 
                              type="text" 
                              placeholder="22:00"
                              value={priceDynamicHoursEnd}
                              onChange={(e) => setPriceDynamicHoursEnd(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none"
                            />
                          </div>

                          <div className="flex items-end">
                            <button 
                              type="submit"
                              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                            >
                              Agregar Regla
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Display Rules List */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest block">REGLAS DINÁMICAS VIGENTES ({dynamicPrices.length})</h4>
                        {dynamicPrices.length === 0 ? (
                          <div className="text-center py-10 bg-zinc-900/10 rounded-2xl border border-zinc-900 text-xs text-zinc-500">
                            Ninguna regla dinámica temporal activa. El sistema calcula en base a tarifas fijas de cancha ordinarias.
                          </div>
                        ) : (
                          <div className="divide-y divide-zinc-900">
                            {dynamicPrices.map(rule => (
                              <div key={rule.id} className="py-3 flex items-center justify-between text-xs">
                                <div className="text-left space-y-0.5">
                                  <span className="font-extrabold text-white text-xs block">
                                    {getFieldFriendlyName(rule.courtId)}
                                  </span>
                                  <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-mono">
                                    <span>{getDayLabel(rule.dayOfWeek)}</span>
                                    <span>•</span>
                                    <span>{rule.startHour} a {rule.endHour} HS</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-emerald-450 font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                    ${rule.rate} MXN/Hr
                                  </span>
                                  <button 
                                    onClick={() => handleDeleteDynamicPriceRule(rule.id)}
                                    className="p-1.5 bg-rose-950/20 border border-rose-500/10 hover:bg-rose-900 text-rose-400 rounded-lg cursor-pointer transition"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* 6. VIEW: MODERATE CLIENT REVIEWS */}
                {activeTab === 'admin-reviews' && (
                  <div className="space-y-6 animate-in fade-in duration-200 text-left" id="admin-reviews-container">
                    
                    {/* View Header */}
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Aprobación de Comentarios</h1>
                        <p className="text-xs sm:text-sm text-zinc-400">Modera las opiniones y calificaciones enviadas por capitanes en la web.</p>
                      </div>
                      <button 
                        onClick={fetchAllAdminData}
                        className="rounded-full p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>

                    {/* Loop grid list container */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl text-xs text-zinc-500">
                        Ningún capitán ha enviado calificaciones u opiniones visibles para moderación aún.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="admin-reviews-grid">
                        {reviews.map(rev => (
                          <div key={rev.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden">
                            <div className="space-y-3">
                              
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1 text-amber-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={12} 
                                      className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-800"} 
                                    />
                                  ))}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                  rev.status === 'approved' 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                }`}>
                                  {rev.status === 'approved' ? "Aprobado (Público)" : "Pendiente"}
                                </span>
                              </div>

                              <p className="text-zinc-300 text-xs sm:text-sm font-sans italic leading-relaxed">
                                "{rev.comment}"
                              </p>

                              {rev.reply && (
                                <div className="bg-zinc-900/40 border border-zinc-850 p-2.5 rounded-xl text-[11px] text-zinc-400">
                                  <strong className="text-emerald-400 font-bold font-mono text-[9px] uppercase tracking-wider block">Respuesta Administrador:</strong>
                                  <p className="italic mt-0.5 font-sans leading-normal">"{rev.reply}"</p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-zinc-900 pt-3">
                              
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 font-bold font-sans text-emerald-400 flex items-center justify-center">
                                    {rev.userName.charAt(0)}
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="font-bold text-zinc-300 leading-none">{rev.userName}</span>
                                    <span className="text-[9px] text-zinc-500 mt-0.5">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('es-MX') : ""}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 select-none shrink-0 border-l border-zinc-900 pl-2">
                                  <button 
                                    onClick={() => handleModerateReview(rev.id, rev.status)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[9px] uppercase font-bold cursor-pointer transition border ${
                                      rev.status === 'approved' 
                                        ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-805 text-zinc-405" 
                                        : "bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500"
                                    }`}
                                  >
                                    {rev.status === 'approved' ? "Desaprobar" : "Aprobar"}
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/10 text-rose-450 hover:bg-rose-900 transition cursor-pointer"
                                    title="Remover permanentemente"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Simple Expand Reply Form */}
                              {replyingReviewId === rev.id ? (
                                <div className="space-y-2 mt-1">
                                  <textarea 
                                    rows={2}
                                    placeholder="Responde a esta recomendación..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-sans leading-snug"
                                  />
                                  <div className="flex justify-end gap-1.5 text-[10px]">
                                    <button 
                                      onClick={() => setReplyingReviewId(null)}
                                      className="px-2.5 py-1 text-zinc-500"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      onClick={() => handlePostReviewReply(rev.id)}
                                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold rounded-lg uppercase tracking-wider font-mono text-[9px]"
                                    >
                                      Responder Comentario
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => { setReplyingReviewId(rev.id); setReplyText(rev.reply || ''); }}
                                  className="text-left text-[10px] text-emerald-400 hover:text-white flex items-center gap-1 mt-0.5 leading-none bg-zinc-900/20 px-2 py-1 border border-zinc-900 hover:bg-zinc-900 transition rounded-lg h-fit w-fit"
                                >
                                  <MessageSquare size={10} />
                                  <span>{rev.reply ? "Editar Respuesta" : "Responder Opinión"}</span>
                                </button>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {/* 7. VIEW: TEAMS & PLAYERS LIGAS CRUDS */}
                {activeTab === 'admin-teams' && (
                  <div className="space-y-8 animate-in fade-in duration-200 text-left" id="admin-teams-container">
                    
                    {/* View Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Equipos y Plantillas del Torneo</h1>
                        <p className="text-xs sm:text-sm text-zinc-400 font-sans">Control del campeonato. Agrega nuevos equipos de fútbol o inscribe fichas de plantillas.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            setShowTeamForm(!showTeamForm); 
                            setEditingTeamId(null); 
                            setTeamFormName(''); 
                            setTeamFormCaptain(''); 
                            setTeamFormColor(''); 
                            setTeamFormGoals('0'); 
                          }}
                          className="rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs flex items-center gap-1.5"
                        >
                          <Plus size={13} />
                          <span>Nuevo Equipo</span>
                        </button>
                        <button 
                          onClick={() => { 
                            setShowPlayerForm(!showPlayerForm); 
                            setEditingPlayerId(null); 
                            setPlayerFormName(''); 
                            setPlayerFormAge(''); 
                            setPlayerFormContact(''); 
                            if (teams.length > 0) setPlayerFormTeamId(teams[0].id);
                          }}
                          className="rounded-xl px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-white font-extrabold text-xs flex items-center gap-1.5"
                        >
                          <Plus size={13} />
                          <span>Agregar Jugador</span>
                        </button>
                      </div>
                    </div>

                    {/* Conditional rendering for Team Creation Form */}
                    {showTeamForm && (
                      <div className="bg-zinc-950 border border-emerald-500/15 rounded-3xl p-6 shadow-2xl space-y-4 max-w-xl">
                        <h2 className="font-extrabold text-white text-sm uppercase tracking-wider">{editingTeamId ? '📝 Editar Equipo' : '⚽ Registrar de Nuevo Equipo'}</h2>
                        <form onSubmit={handleSaveTeamSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="space-y-1">
                            <label className="text-zinc-400">Nombre del Club *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: Galácticos FC" 
                              value={teamFormName}
                              onChange={(e) => setTeamFormName(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">Color de Uniforme *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: Negro y Azul" 
                              value={teamFormColor}
                              onChange={(e) => setTeamFormColor(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">Celular del Capitán o Delegado *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: +52 55..." 
                              value={teamFormCaptain}
                              onChange={(e) => setTeamFormCaptain(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">Goles / Puntos en Torneo</label>
                            <input 
                              type="number" 
                              value={teamFormGoals}
                              onChange={(e) => setTeamFormGoals(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none font-mono font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2 flex justify-end gap-2 text-xs pt-1">
                            <button 
                              type="button" 
                              onClick={() => setShowTeamForm(false)}
                              className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white transition rounded-xl"
                            >
                              Cancelar
                            </button>
                            <button 
                              type="submit" 
                              className="px-5 py-2 bg-emerald-500 text-black font-extrabold rounded-xl"
                            >
                              {editingTeamId ? 'Guardar Cambios' : 'Registrar'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Conditional rendering for Player Creation Form */}
                    {showPlayerForm && (
                      <div className="bg-zinc-950 border border-emerald-500/15 rounded-3xl p-6 shadow-2xl space-y-4 max-w-xl">
                        <h2 className="font-extrabold text-white text-sm uppercase tracking-wider">👤 Ficha de Jugador</h2>
                        <form onSubmit={handleSavePlayerSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="space-y-1">
                            <label className="text-zinc-400">Vincular al Equipo *</label>
                            <select 
                              value={playerFormTeamId}
                              onChange={(e) => setPlayerFormTeamId(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-300 focus:outline-none"
                              required
                            >
                              <option value="">Selecciona un club...</option>
                              {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">Nombre del Jugador *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: Daniel Ortíz" 
                              value={playerFormName}
                              onChange={(e) => setPlayerFormName(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">Edad *</label>
                            <input 
                              type="number" 
                              placeholder="Ej: 24" 
                              value={playerFormAge}
                              onChange={(e) => setPlayerFormAge(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none font-mono"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-400">Posición *</label>
                            <select 
                              value={playerFormPosition}
                              onChange={(e) => setPlayerFormPosition(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-300 focus:outline-none"
                            >
                              <option value="Portero">🛡️ Portero</option>
                              <option value="Defensa">🛡️ Defensa</option>
                              <option value="Medio">⚙️ Medio</option>
                              <option value="Delantero">🚀 Delantero</option>
                            </select>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-zinc-400">Celular del Jugador</label>
                            <input 
                              type="text" 
                              placeholder="Ej: +52 559..." 
                              value={playerFormContact}
                              onChange={(e) => setPlayerFormContact(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2 flex justify-end gap-2 text-xs pt-1">
                            <button 
                              type="button" 
                              onClick={() => setShowPlayerForm(false)}
                              className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white transition rounded-xl"
                            >
                              Cancelar
                            </button>
                            <button 
                              type="submit" 
                              className="px-5 py-2 bg-emerald-500 text-black font-extrabold rounded-xl"
                            >
                              Inscribir Jugador
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Search block and layout list */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-550" />
                      <input 
                        type="text" 
                        placeholder="Buscar clubes de la liga o capitanes..."
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        className="w-full max-w-md pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 focus:outline-none focus:border-emerald-500 text-xs text-white"
                      />
                    </div>

                    {filteredTeamsList.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No hay equipos que coincidan con la búsqueda.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTeamsList.map(t => {
                          const teamPlayers = players.filter(p => p.teamId === t.id);
                          return (
                            <div key={t.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-lg space-y-4">
                              
                              {/* Header team */}
                              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                <div className="text-left">
                                  <h4 className="font-extrabold text-white text-base leading-none">{t.name}</h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                                    <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded leading-none font-bold" style={{ color: t.color }}>
                                      Uniforme: {t.color}
                                    </span>
                                    <span>•</span>
                                    <span>Capitán: {t.captainContact}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button 
                                    onClick={() => {
                                      setEditingTeamId(t.id);
                                      setTeamFormName(t.name);
                                      setTeamFormColor(t.color);
                                      setTeamFormCaptain(t.captainContact);
                                      setTeamFormGoals(String(t.goalsFor));
                                      setShowTeamForm(true);
                                    }}
                                    className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTeam(t.id)}
                                    className="p-1.5 bg-rose-950/20 hover:bg-rose-900 border border-rose-500/10 rounded-lg text-rose-400 transition"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              {/* Goals / statistics */}
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Puntos del campeonato / Goles a favor:</span>
                                <strong className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-sm font-black">
                                  {t.goalsFor} pts
                                </strong>
                              </div>

                              {/* Players plantillas list */}
                              <div className="space-y-2">
                                <span className="text-[10px] text-zinc-500 uppercase font-black block tracking-widest text-left">Plantilla Inscrita ({teamPlayers.length} Capitanes/Jugadores)</span>
                                {teamPlayers.length === 0 ? (
                                  <p className="text-[11px] text-zinc-550 italic text-left">Sin jugadores inscritos aún. Agrega jugadores usando el botón superior.</p>
                                ) : (
                                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                    {teamPlayers.map(p => (
                                      <div key={p.id} className="flex justify-between items-center bg-zinc-900/40 border border-zinc-900/60 p-2 rounded-xl text-xs">
                                        <div className="text-left leading-none">
                                          <span className="font-bold text-zinc-300 block">{p.name} {p.goals ? <span className="text-[10px] text-amber-500">⚽ {p.goals} goles</span> : ""}</span>
                                          <span className="text-[9px] text-zinc-550 mt-1 block font-mono">Edad: {p.age} | {p.position} | {p.contact || "Sin cel"}</span>
                                        </div>
                                        <button 
                                          onClick={() => handleDeletePlayer(p.id)}
                                          className="text-rose-450 hover:text-white transition cursor-pointer p-1"
                                          title="Eliminar jugador"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

                {activeTab === 'admin-drive' && (
                  <AdminGoogleDrive
                    reservations={reservations}
                    payments={payments}
                    getFieldFriendlyName={getFieldFriendlyName}
                    adminToken={token}
                    onPhotosImported={fetchAllAdminData}
                  />
                )}

                {activeTab === 'admin-payments' && (
                  <div className="space-y-8 animate-in fade-in duration-200 text-left" id="admin-payments-container">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                          <CreditCard className="text-emerald-400" size={20} />
                          <span>Auditoría de Pagos y Caja</span>
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">
                          Consulte y exporte las transacciones de abonos y reservaciones registradas en el sistema.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            setPaymentSearch('');
                            setPaymentMethodFilter('todos');
                            const today = new Date();
                            const mm = String(today.getMonth() + 1).padStart(2, '0');
                            setPaymentStartDate(`${today.getFullYear()}-${mm}-01`);
                            setPaymentEndDate(`${today.getFullYear()}-${mm}-${String(today.getDate()).padStart(2, '0')}`);
                          }}
                          className="px-3.5 py-2 rounded-xl border border-zinc-900 hover:bg-zinc-900 hover:text-white transition text-xs font-semibold text-zinc-400 cursor-pointer"
                          title="Restablecer todos los filtros"
                        >
                          Reiniciar Filtros
                        </button>
                        
                        <button
                          onClick={() => {
                            const filtered = payments.filter(pay => {
                              const res = reservations.find(r => r.id === pay.reservationId);
                              const clientName = res ? res.userName.toLowerCase() : '';
                              const clientEmail = res ? res.userEmail.toLowerCase() : '';
                              const fieldName = res ? res.fieldName.toLowerCase() : '';
                              const transId = (pay.transactionId || '').toLowerCase();
                              const payId = pay.id.toLowerCase();
                              
                              const matchesSearch = !paymentSearch ? true : (
                                clientName.includes(paymentSearch.toLowerCase()) ||
                                clientEmail.includes(paymentSearch.toLowerCase()) ||
                                fieldName.includes(paymentSearch.toLowerCase()) ||
                                transId.includes(paymentSearch.toLowerCase()) ||
                                payId.includes(paymentSearch.toLowerCase())
                              );
                              
                              let matchesDate = true;
                              if (pay.createdAt) {
                                const payDateStr = pay.createdAt.split('T')[0];
                                if (paymentStartDate && payDateStr < paymentStartDate) matchesDate = false;
                                if (paymentEndDate && payDateStr > paymentEndDate) matchesDate = false;
                              }
                              
                              let matchesMethod = true;
                              if (paymentMethodFilter !== 'todos') {
                                matchesMethod = pay.paymentMethod === paymentMethodFilter;
                              }
                              
                              return matchesSearch && matchesDate && matchesMethod;
                            });
                            exportPaymentsToCSV(filtered, reservations);
                          }}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-xs font-black shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5 transition"
                          title="Exportar transacciones filtradas"
                        >
                          <FileSpreadsheet size={13} />
                          <span>Exportar Lista</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter controls section */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest block font-sans">
                        🔍 FILTRADO Y CRONOLOGÍA DE TRANSACCIONES
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Palabra clave</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
                            <input
                              type="text"
                              value={paymentSearch}
                              onChange={(e) => setPaymentSearch(e.target.value)}
                              placeholder="Buscar cliente, correo, folio..."
                              className="w-full rounded-xl bg-zinc-900/50 border border-zinc-900 px-3 py-2 pl-8 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Caja Desde (Fecha)</label>
                          <input
                            type="date"
                            value={paymentStartDate}
                            onChange={(e) => setPaymentStartDate(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Caja Hasta (Fecha)</label>
                          <input
                            type="date"
                            value={paymentEndDate}
                            onChange={(e) => setPaymentEndDate(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Método de cobro</label>
                          <select
                            value={paymentMethodFilter}
                            onChange={(e: any) => setPaymentMethodFilter(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                          >
                            <option value="todos">Todos los métodos</option>
                            <option value="stripe">Tarjetas (Stripe)</option>
                            <option value="paypal">PayPal Gateway</option>
                            <option value="whatsapp_transfer">Transferencia de WhatsApp</option>
                            <option value="cash">Efectivo en Recepción</option>
                          </select>
                        </div>

                      </div>
                    </div>

                    {/* Filter result calculation & Stats summary row */}
                    {(() => {
                      const list = payments.filter(pay => {
                        const res = reservations.find(r => r.id === pay.reservationId);
                        const clientName = res ? res.userName.toLowerCase() : '';
                        const clientEmail = res ? res.userEmail.toLowerCase() : '';
                        const fieldName = res ? res.fieldName.toLowerCase() : '';
                        const transId = (pay.transactionId || '').toLowerCase();
                        const payId = pay.id.toLowerCase();
                        
                        const matchesSearch = !paymentSearch ? true : (
                          clientName.includes(paymentSearch.toLowerCase()) ||
                          clientEmail.includes(paymentSearch.toLowerCase()) ||
                          fieldName.includes(paymentSearch.toLowerCase()) ||
                          transId.includes(paymentSearch.toLowerCase()) ||
                          payId.includes(paymentSearch.toLowerCase())
                        );
                        
                        let matchesDate = true;
                        if (pay.createdAt) {
                          const payDateStr = pay.createdAt.split('T')[0];
                          if (paymentStartDate && payDateStr < paymentStartDate) matchesDate = false;
                          if (paymentEndDate && payDateStr > paymentEndDate) matchesDate = false;
                        }
                        
                        let matchesMethod = true;
                        if (paymentMethodFilter !== 'todos') {
                          matchesMethod = pay.paymentMethod === paymentMethodFilter;
                        }
                        
                        return matchesSearch && matchesDate && matchesMethod;
                      });

                      const totalAmount = list.reduce((sum, p) => sum + (p.amount || 0), 0);
                      const stripeSum = list.filter(p => p.paymentMethod === 'stripe').reduce((sum, p) => sum + (p.amount || 0), 0);
                      const paypalSum = list.filter(p => p.paymentMethod === 'paypal').reduce((sum, p) => sum + (p.amount || 0), 0);
                      const transferSum = list.filter(p => p.paymentMethod === 'whatsapp_transfer').reduce((sum, p) => sum + (p.amount || 0), 0);
                      const cashSum = list.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0);

                      return (
                        <>
                          {/* Bento Grid Analytics */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            
                            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 hover:border-emerald-500/20 transition duration-150">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block font-sans">Recaudación Filtrada</span>
                              <strong className="text-2xl font-mono text-emerald-400 mt-1 block font-black">
                                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </strong>
                              <span className="text-[10px] text-zinc-600 mt-1 block font-mono">Período de caja actual</span>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 hover:border-emerald-500/20 transition duration-150">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block font-sans">Transacciones Totales</span>
                              <strong className="text-2xl font-mono text-white mt-1 block font-black">
                                {list.length} <span className="text-xs text-zinc-500 font-sans font-normal">recibos</span>
                              </strong>
                              <span className="text-[10px] text-zinc-650 mt-1 block font-mono">Promedio: ${list.length > 0 ? (totalAmount / list.length).toFixed(1) : 0} MXN</span>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 hover:border-emerald-500/20 transition duration-150 sm:col-span-2">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2 font-sans">Composición de Caja</span>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div className="flex justify-between items-center bg-zinc-900/25 border border-zinc-900/50 rounded-lg p-1.5 px-2">
                                  <span className="text-zinc-400 font-sans">💳 Stripe:</span>
                                  <strong className="font-mono text-zinc-300 font-bold">${stripeSum}</strong>
                                </div>
                                <div className="flex justify-between items-center bg-zinc-900/25 border border-zinc-900/50 rounded-lg p-1.5 px-2">
                                  <span className="text-zinc-400 font-sans">🌐 PayPal:</span>
                                  <strong className="font-mono text-zinc-300 font-bold">${paypalSum}</strong>
                                </div>
                                <div className="flex justify-between items-center bg-zinc-900/25 border border-zinc-900/50 rounded-lg p-1.5 px-2">
                                  <span className="text-zinc-400 font-sans">💬 WhatsApp:</span>
                                  <strong className="font-mono text-zinc-300 font-bold">${transferSum}</strong>
                                </div>
                                <div className="flex justify-between items-center bg-zinc-900/25 border border-zinc-900/50 rounded-lg p-1.5 px-2">
                                  <span className="text-zinc-400 font-sans">💵 Efectivo:</span>
                                  <strong className="font-mono text-zinc-300 font-bold">${cashSum}</strong>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* List or Table of payments */}
                          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl">
                            {list.length === 0 ? (
                              <div className="py-16 text-center text-xs text-zinc-500 space-y-3 font-sans max-w-sm mx-auto">
                                <p className="font-bold text-zinc-300">No se encontraron pagos en la selección.</p>
                                <p className="text-[11px] text-zinc-550 leading-relaxed">
                                  No existen registros que coincidan con la palabra clave o el rango de fechas seleccionado en la base de datos de administración.
                                </p>
                                <button
                                  onClick={() => {
                                    setPaymentSearch('');
                                    setPaymentMethodFilter('todos');
                                    const today = new Date();
                                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                                    setPaymentStartDate(`${today.getFullYear()}-${mm}-01`);
                                    setPaymentEndDate(`${today.getFullYear()}-${mm}-${String(today.getDate()).padStart(2, '0')}`);
                                  }}
                                  className="rounded-xl border border-zinc-900 hover:bg-zinc-900 hover:text-white transition px-3.5 py-1.5 text-[11px] font-bold cursor-pointer"
                                >
                                  Restablecer Búsqueda
                                </button>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse" id="payments-history-table">
                                  <thead>
                                    <tr className="border-b border-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest font-black bg-zinc-950">
                                      <th className="px-6 py-4 text-left">Registro / ID</th>
                                      <th className="px-6 py-4 text-left">Capitán / Concepto Reserva</th>
                                      <th className="px-6 py-4 text-right">Monto Cobrado</th>
                                      <th className="px-6 py-4 text-center">Método</th>
                                      <th className="px-6 py-4 text-left">Comprobante Interno</th>
                                      <th className="px-6 py-4 text-center">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-900 font-sans text-xs">
                                    {list.map(pay => {
                                      const res = reservations.find(r => r.id === pay.reservationId);
                                      
                                      const renderMethodBadge = (m: string) => {
                                        switch (m) {
                                          case 'stripe':
                                            return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold text-[10px]">Tarjeta Stripe</span>;
                                          case 'paypal':
                                            return <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-bold text-[10px]">PayPal</span>;
                                          case 'whatsapp_transfer':
                                            return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-[10px]">Transferencia WhatsApp</span>;
                                          case 'cash':
                                            return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold text-[10px]">Efectivo Caja</span>;
                                          default:
                                            return <span className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-2 py-0.5 rounded font-bold text-[10px]">{m}</span>;
                                        }
                                      };

                                      const formattedDate = pay.createdAt 
                                        ? new Date(pay.createdAt).toLocaleString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                        : 'N/A';

                                      return (
                                        <tr key={pay.id} className="hover:bg-zinc-900/30 transition duration-100">
                                          
                                          <td className="px-6 py-4.5 whitespace-nowrap text-left leading-relaxed">
                                            <span className="font-mono text-zinc-500 text-[10px] block">{pay.id}</span>
                                            <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">{formattedDate}</span>
                                          </td>

                                          <td className="px-6 py-4.5 text-left leading-relaxed">
                                            {res ? (
                                              <>
                                                <div className="font-bold text-white flex items-center gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setSelectedDetailedCustomer({
                                                        name: res.userName,
                                                        phone: res.userPhone,
                                                        email: res.userEmail
                                                      });
                                                    }}
                                                    className="font-bold text-white font-sans text-left hover:text-emerald-400 hover:underline transition focus:outline-none cursor-pointer"
                                                    title={`Ver perfil y comportamiento de ${res.userName}`}
                                                  >
                                                    {res.userName}
                                                  </button>
                                                  <span className="text-[10px] font-normal text-zinc-500 font-mono">({res.userPhone})</span>
                                                </div>
                                                <div className="text-[10px] text-zinc-500 mt-1 block">
                                                  Cancha: <strong className="text-zinc-400 font-sans">{res.fieldName}</strong> | Fecha del juego: {res.date} ({res.timeSlot})
                                                </div>
                                              </>
                                            ) : (
                                              <div>
                                                <span className="text-zinc-500 italic block">Reserva Desasociada</span>
                                                <span className="text-[9px] text-zinc-650 block mt-0.5">Folio original: {pay.reservationId}</span>
                                              </div>
                                            )}
                                          </td>

                                          <td className="px-6 py-4.5 text-right whitespace-nowrap">
                                            <strong className="font-mono text-emerald-400 text-sm font-black">
                                              ${(pay.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </strong>
                                            <span className="text-[9px] text-zinc-500 block font-mono mt-0.5">MXN (Abonado)</span>
                                          </td>

                                          <td className="px-6 py-4.5 text-center whitespace-nowrap">
                                            {renderMethodBadge(pay.paymentMethod)}
                                          </td>

                                          <td className="px-6 py-4.5 text-left whitespace-nowrap leading-none">
                                            <span className="font-mono text-[10px] text-zinc-300 block">{pay.transactionId || 'tx_no_def'}</span>
                                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-550 block mt-1.5">REGISTRADOR GENERAL</span>
                                          </td>

                                          <td className="px-6 py-4.5 text-center whitespace-nowrap">
                                            {pay.status === 'completed' ? (
                                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">
                                                Exitoso
                                              </span>
                                            ) : pay.status === 'pending' ? (
                                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">
                                                Pendiente
                                              </span>
                                            ) : (
                                              <span className="bg-rose-500/10 text-rose-450 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">
                                                Fallado
                                              </span>
                                            )}
                                          </td>

                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}

                  </div>
                )}

                  </>
                )}
              </div>
            )}

          </div>

        </div>
      </main>



    </div>
  );
}
