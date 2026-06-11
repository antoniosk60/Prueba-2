import React, { useState, useEffect } from 'react';
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
  Edit2
} from 'lucide-react';
import { 
  Reservation, 
  Promotion, 
  Photo, 
  Team, 
  Player, 
  Review, 
  Video, 
  FieldConfig 
} from '../types';

interface AdminPanelProps {
  token: string | null;
  onLogout: () => void;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'admin-dashboard' | 
    'admin-reservations' | 
    'admin-gallery' | 
    'admin-promotions' | 
    'admin-prices' | 
    'admin-reviews' | 
    'admin-teams'
  >('admin-dashboard');

  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Stats / Dashboard data
  const [stats, setStats] = useState<any | null>(null);

  // Domain lists
  const [reservations, setReservations] = useState<Reservation[]>([]);
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

  // WhatsApp Widget simulation
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');

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
  }, []);

  // Update reservation status and payment status
  const handleUpdateReservation = async (id: string, status: 'confirmed' | 'cancelled', paymentStatus: 'pending' | 'paid') => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, paymentStatus })
      });
      if (response.ok) {
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

  // Base64 file decoder
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoErrorMsg("Por favor ingresa únicamente archivos de tipo imagen (.png, .jpeg, .jpg, .webp).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoErrorMsg("La imagen excede el límite recomendado de carga de 10MB.");
      return;
    }
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

  // WhatsApp helper click trigger
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppText.trim()) return;
    const url = `https://wa.me/5215512345678?text=${encodeURIComponent(whatsAppText)}`;
    window.open(url, '_blank');
    setWhatsAppText('');
    setIsWhatsAppOpen(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <span className="font-extrabold text-white tracking-wider text-sm uppercase">Canchas Fútbol Rápido Tribol</span>
          </div>
          <button 
            onClick={onLogout}
            className="rounded-xl px-3.5 py-1.5 border border-rose-500/10 hover:border-rose-500/30 text-rose-450 hover:bg-rose-950/15 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Salir</span>
          </button>
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
                  { id: 'admin-teams', label: "Equipos y Plantillas", icon: <Users size={14} /> }
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
                          <span className="text-xl sm:text-2xl font-black text-emerald-450 font-mono">${(stats.totalRevenue || stats.totalEarnings || 0).toLocaleString("es-MX")}</span>
                          <span className="text-[10px] text-zinc-500 block font-mono">Pesos Mexicanos (MXN)</span>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
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
                                    <span className="text-emerald-400 font-bold">${court.earnings.toLocaleString("es-MX")} MXN</span>
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
                                  <strong className="text-emerald-450 font-extrabold text-sm">${court.earnings.toLocaleString("es-MX")}</strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Operational system notes */}
                    <div className="bg-zinc-950 border border-emerald-500/10 rounded-2xl p-5 flex gap-3 text-left shadow-lg">
                      <ShieldAlert className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-white">⚙️ Rutina de Alarmas de Partidos disputados</span>
                        <p className="text-zinc-400 leading-relaxed font-sans">
                          El sistema del cron-job está activo y simulando notificaciones automáticas cada 30 minutos a los capitanes de equipo. Los folios cancelados se re-disponibilizan inmediatamente.
                        </p>
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

                    {/* Table element */}
                    {filteredReservationsList.length === 0 ? (
                      <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-zinc-900 text-xs text-zinc-500">
                        Ninguna reserva registrada coincide con el criterio de búsqueda.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-zinc-900">
                        <table className="min-w-full divide-y divide-zinc-900 text-xs text-left">
                          <thead className="bg-zinc-950 font-bold tracking-wider text-zinc-400 uppercase text-[10px]">
                            <tr>
                              <th className="px-5 py-4">ID / Folio</th>
                              <th className="px-5 py-4">Cancha</th>
                              <th className="px-5 py-4">Fecha y Hora</th>
                              <th className="px-5 py-4">Capitán / Contacto</th>
                              <th className="px-5 py-4">Monto Cobrado</th>
                              <th className="px-5 py-4">Estados</th>
                              <th className="px-5 py-4 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="bg-zinc-950/30 divide-y divide-zinc-900" id="admin-reservations-table-body">
                            {filteredReservationsList.map(res => (
                              <tr key={res.id} className="hover:bg-zinc-905/40 transition">
                                <td className="px-5 py-4 font-mono font-bold text-zinc-300">#{res.id}</td>
                                <td className="px-5 py-4 font-semibold text-white">
                                  {getFieldFriendlyName(res.fieldId)}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-zinc-200">{res.date}</span>
                                    <span className="font-mono text-emerald-400 tracking-wide text-[10px]">{res.timeSlot} HS</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-col text-zinc-400 gap-0.5">
                                    <span className="font-bold text-white font-sans">{res.userName}</span>
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-550 font-mono">
                                      <Phone size={10} /> {res.userPhone}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-550 font-mono">
                                      <Mail size={10} /> {res.userEmail}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                                  ${res.totalPrice.toLocaleString("es-MX")}
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
                                    {res.status !== 'confirmed' && (
                                      <button 
                                        onClick={() => handleUpdateReservation(res.id, 'confirmed', 'paid')}
                                        className="bg-emerald-600 hover:bg-emerald-555 text-black font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition uppercase flex items-center gap-1"
                                        title="Confirmar Partido y Pago"
                                      >
                                        <CheckCircle size={11} />
                                        <span>Confirmar</span>
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
                                accept="image/*"
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
                              <p className="text-[9px] text-zinc-550 leading-none">Formatos: PNG, JPG, WEBP (Max 10MB)</p>
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

              </div>
            )}

          </div>

        </div>
      </main>

      {/* WHATSAPP SUPPORT FLOATING ACTION TRIGGER COMPONENT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="whatsapp-floating-button">
        
        {isWhatsAppOpen && (
          <div className="mb-3 w-80 rounded-2xl bg-zinc-950 border border-emerald-500/30 p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-left">
            <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Soporte Tribol Fútbol Rápido</h4>
                  <p className="text-[11px] text-zinc-500 leading-none mt-1">Soporte técnico administrativo en vivo</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWhatsAppOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <XCircle size={15} />
              </button>
            </div>
            
            <p className="py-4 text-xs text-zinc-400 leading-relaxed font-sans">
              ⚽ ¡Hola Delegado! Escribe tus dudas sobre torneos especiales, facturas de caja o cambios de cancha e inicia chat vía WhatsApp de inmediato.
            </p>

            <form onSubmit={handleWhatsAppSubmit} className="flex gap-2">
              <input 
                type="text"
                placeholder="Escribe tu mensaje administrativo..."
                value={whatsAppText}
                onChange={(e) => setWhatsAppText(e.target.value)}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-504"
              />
              <button 
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 p-2 text-black font-extrabold flex items-center justify-center cursor-pointer transition"
              >
                <ChevronRight size={14} className="stroke-[3]" />
              </button>
            </form>
          </div>
        )}

        <button 
          onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/20"
          title="Soporte WhatsApp"
        >
          <MessageSquare size={24} className="stroke-[2.5]" />
        </button>

      </div>

    </div>
  );
}
