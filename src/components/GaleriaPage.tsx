import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, Tv, MessageSquare, Send, Users, Play, Pause, Volume2, VolumeX, Sparkles, Heart, Share2, Film, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Photo, Video } from '../types';



export default function GaleriaPage() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [photosFilter, setPhotosFilter] = useState<'all' | 'facilities' | 'matches' | 'events'>('all');
  const [videosFilter, setVideosFilter] = useState<'all' | 'live' | 'highlight' | 'full_match'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  
  // Custom Lightbox premium features states
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Video Player States
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string; isUser?: boolean }[]>([
    { sender: 'Sistema', text: 'Conectando a la señal de Cancha 1 Techada...', time: '12:00' },
    { sender: 'Moderador', text: 'Bienvenidos a la transmisión oficial de Fútbol Rápido Tribol.', time: '12:01' },
    { sender: 'Carlos_M', text: '¡Saludos desde Ixtapaluca! Con todo Tribol.', time: '12:02' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [likesCount, setLikesCount] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewerCount, setViewerCount] = useState(184);

  const videoElementRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevIsLiveRef = useRef<boolean | undefined>(undefined);

  const [videoError, setVideoError] = useState<string | null>(null);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("HTML Video loading error:", e);
    setVideoError("No ha sido posible establecer conexión con el canal de video. Por favor verifica que el enlace sea correcto, no contenga bloqueos, o intenta de nuevo.");
  };

  const handleRetryConnection = () => {
    setVideoError(null);
    setIsPlaying(true);
    if (selectedVideo) {
      setSelectedVideo({ ...selectedVideo });
    }
  };

  // Helper to extract a clean URL or embed url from any raw text (including iframe codes or plain urls)
  const resolveVideoUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    
    // Check if they pasted an <iframe> embed code
    if (trimmed.toLowerCase().startsWith('<iframe') || trimmed.toLowerCase().includes('src=')) {
      const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }
    
    // If it's a general string but doesn't have http/https, prepend https://
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && trimmed.length > 3) {
      return `https://${trimmed}`;
    }
    
    return trimmed;
  };

  // Reset error when selected video changes or validate URL formats
  useEffect(() => {
    setVideoError(null);
    if (selectedVideo) {
      if (!selectedVideo.url) {
        setVideoError("La transmisión no tiene un enlace configurado en el panel administrativo.");
      } else {
        const resolved = resolveVideoUrl(selectedVideo.url);
        if (!resolved.startsWith('http://') && !resolved.startsWith('https://')) {
          setVideoError("El enlace del video no tiene un formato web válido (debe iniciar con http:// o https://).");
        }
      }
    }
  }, [selectedVideo?.id, selectedVideo?.url]);

  // Track starts/stops of live transmission in the player chat messages
  useEffect(() => {
    if (selectedVideo) {
      if (prevIsLiveRef.current !== undefined && prevIsLiveRef.current !== selectedVideo.isLive) {
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (selectedVideo.isLive) {
          setChatMessages(prev => [
            ...prev,
            { sender: 'Sistema', text: '🔴 ¡Estación En Vivo! Los administradores acaban de iniciar la transmisión en tiempo real.', time: timeString }
          ]);
          setViewerCount(184);
        } else {
          setChatMessages(prev => [
            ...prev,
            { sender: 'Sistema', text: '⚪ Transmisión finalizada. El video ahora se reproduce como archivo histórico DVR.', time: timeString }
          ]);
          setViewerCount(0);
        }
      }
      prevIsLiveRef.current = selectedVideo.isLive;
    } else {
      prevIsLiveRef.current = undefined;
    }
  }, [selectedVideo?.isLive, selectedVideo?.id]);

  // Helper to extract any video embed URL or detect if it is raw video format
  const getEmbeddableUrl = (url: string): { type: 'youtube' | 'facebook' | 'vimeo' | 'iframe' | 'video' | 'invalid'; embedUrl?: string } => {
    if (!url) return { type: 'invalid' };
    
    const cleanUrl = resolveVideoUrl(url);
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return { type: 'invalid' };
    }

    // 1. YouTube
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = cleanUrl.match(ytReg);
    if (ytMatch && ytMatch[2].length === 11) {
      const videoId = ytMatch[2];
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&enablejsapi=1`
      };
    }

    // 2. Vimeo
    const vimeoReg = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|showcase\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = cleanUrl.match(vimeoReg);
    if (vimeoMatch && vimeoMatch[4]) {
      const videoId = vimeoMatch[4];
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=${isPlaying ? 1 : 0}&muted=${isMuted ? 1 : 0}&loop=1`
      };
    }

    // 3. Facebook Video
    if (cleanUrl.includes('facebook.com')) {
      const encodedUrl = encodeURIComponent(cleanUrl);
      return {
        type: 'facebook',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`
      };
    }

    // 4. TikTok Video
    const tiktokReg = /tiktok\.com\/.*\/video\/(\d+)/;
    const tiktokMatch = cleanUrl.match(tiktokReg);
    if (tiktokMatch && tiktokMatch[1]) {
      return {
        type: 'iframe',
        embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`
      };
    }

    // 5. Direct video formats
    const isDirectVideo = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8)(\?.*)?$/i.test(cleanUrl) || cleanUrl.includes('stream') || cleanUrl.includes('m3u8');
    if (isDirectVideo) {
      return { type: 'video' };
    }

    // 6. Otherwise: treat general links as iframe fallback so any link can be embedded
    return {
      type: 'iframe',
      embedUrl: cleanUrl
    };
  };

  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      const photosRes = await fetch('/api/gallery');
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(photosData);
      }
      
      const videosRes = await fetch('/api/videos');
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData);
        if (videosData.length > 0) {
          // Set the live stream as the default selected video if available
          const liveStream = videosData.find((v: Video) => v.isLive) || videosData[0];
          setSelectedVideo(prev => prev ? (videosData.find((v: Video) => v.id === prev.id) || liveStream) : liveStream);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Periodic background sync polling to keep videos (live, title, views) updated automatically list with admin changes
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const videosRes = await fetch('/api/videos');
        if (videosRes.ok) {
          const videosData: Video[] = await videosRes.json();
          setVideos(prevVideos => {
            const changed = prevVideos.length !== videosData.length || 
              JSON.stringify(prevVideos.map(v => ({ id: v.id, isLive: v.isLive, views: v.views, title: v.title, url: v.url }))) !==
              JSON.stringify(videosData.map(v => ({ id: v.id, isLive: v.isLive, views: v.views, title: v.title, url: v.url })));
            
            return changed ? videosData : prevVideos;
          });

          if (selectedVideo) {
            const updatedSelected = videosData.find(v => v.id === selectedVideo.id);
            if (updatedSelected) {
              if (updatedSelected.isLive !== selectedVideo.isLive || 
                  updatedSelected.url !== selectedVideo.url || 
                  updatedSelected.title !== selectedVideo.title) {
                setSelectedVideo(updatedSelected);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error keeping videos state in sync:", err);
      }
    }, 7000);

    return () => clearInterval(syncInterval);
  }, [selectedVideo]);



  // Keep chat scrolled down as new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedVideo) return;

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setChatMessages(prev => [
      ...prev,
      { sender: 'Tú', text: newMessage.trim(), time: timeString, isUser: true }
    ]);
    setNewMessage('');
  };

  const handlePlayPause = () => {
    if (videoElementRef.current) {
      if (isPlaying) {
        videoElementRef.current.pause();
      } else {
        videoElementRef.current.play().catch(err => console.log('Auto-play blocked or failed:', err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteUnmute = () => {
    if (videoElementRef.current) {
      videoElementRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // When clicking on an archived video, switch the main active video player
  const selectActiveVideoPlayer = (video: Video) => {
    setVideoError(null);
    setSelectedVideo(video);
    setIsPlaying(true);
    setChatMessages([
      { sender: 'Sistema', text: `Cargando canal DVR: ${video.title}`, time: 'Ahora' },
      { sender: 'Moderador', text: 'Chat diferido o repetición del partido.', time: 'Hace un momento' }
    ]);
    if (video.isLive) {
      setViewerCount(184);
    } else {
      setViewerCount(0); // 0 active viewer list if it's fully recording
    }
    
    // Increment view count via visual feedback locally
    video.views += 1;
    
    // Auto Scroll to Player
    document.getElementById('video-center-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredPhotos = photosFilter === 'all' 
    ? photos 
    : photos.filter(p => p.category === photosFilter);

  const filteredVideos = videosFilter === 'all'
    ? videos
    : videos.filter(v => v.category === videosFilter);

  // --- PREMIUM LIGHTBOX EVENT HANDLERS ---
  const currentPhotoIndex = previewPhoto ? filteredPhotos.findIndex(p => p.id === previewPhoto.id) : -1;

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (filteredPhotos.length === 0 || currentPhotoIndex === -1) return;
    const prevIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setPreviewPhoto(filteredPhotos[prevIndex]);
    setZoomScale(1); // Reset zoom
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (filteredPhotos.length === 0 || currentPhotoIndex === -1) return;
    const nextIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    setPreviewPhoto(filteredPhotos[nextIndex]);
    setZoomScale(1); // Reset zoom
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomScale(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2.5 : 1));
  };

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'tribol_instalacion.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewPhoto) return;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrevPhoto();
      } else if (e.key === 'Escape') {
        setPreviewPhoto(null);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoplay(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPhoto, currentPhotoIndex, filteredPhotos]);

  // Autoplay progression loop
  useEffect(() => {
    if (!isAutoplay || !previewPhoto) return;
    const timer = setInterval(() => {
      handleNextPhoto();
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoplay, previewPhoto, currentPhotoIndex, filteredPhotos]);

  // Clean-up zoom and autoplay states on exit
  useEffect(() => {
    if (!previewPhoto) {
      setZoomScale(1);
      setIsAutoplay(false);
    }
  }, [previewPhoto]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Visual Header Grid Banner */}
      <div className="space-y-4 text-center lg:text-left">
        <div className="inline-flex items-center space-x-2 bg-adhler-orange/15 border border-adhler-orange/25 px-3.5 py-1.5 rounded-full select-none">
          <Camera className="w-4 h-4 text-[#ED7038]" />
          <span className="text-xs font-mono font-bold text-[#ED7038] uppercase tracking-widest">Multimedia Oficial Fútbol Rápido Tribol</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Galería, Transmisiones & Videos
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Explora la galería oficial de retratos del complejo de fútbol rápido o sintoniza transmisiones en vivo y videos destacados de las finales en Ixtapaluca.
        </p>
      </div>

      {/* Main Mode Tabs Switch */}
      <div className="flex border-b border-adhler-cyan/15 gap-1 sm:gap-2 pb-0.5 overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => setActiveTab('photos')}
          id="tab-btn-photos"
          className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center space-x-2.5 cursor-pointer leading-none ${
            activeTab === 'photos'
              ? 'border-adhler-orange text-adhler-orange font-extrabold bg-[#ED7038]/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-4.5 h-4.5" />
          <span>Álbum de Fotos</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          id="tab-btn-videos"
          className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center space-x-2.5 cursor-pointer leading-none ${
            activeTab === 'videos'
              ? 'border-[#ED7038] text-adhler-orange font-extrabold bg-[#ED7038]/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Tv className="w-4.5 h-4.5" />
          <span>Cámaras En Vivo & Goles</span>
          <span className="bg-red-500 text-[8px] text-white font-extrabold font-mono px-1.5 py-0.5 rounded-full uppercase scale-90 animate-pulse">
            En Vivo
          </span>
        </button>
      </div>

      {/* MODE 1: PHOTOS PORTFOLIO */}
      {activeTab === 'photos' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <button
              onClick={() => setPhotosFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                photosFilter === 'all' ? 'bg-[#ED7038] text-white font-extrabold shadow-[0_0_12px_rgba(237,112,56,0.3)]' : 'text-gray-400 hover:text-white bg-[#1e2530]/20 border border-zinc-900'
              }`}
            >
              Ver Todo
            </button>
            <button
              onClick={() => setPhotosFilter('facilities')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                photosFilter === 'facilities' ? 'bg-[#ED7038] text-white font-extrabold shadow-[0_0_12px_rgba(237,112,56,0.3)]' : 'text-gray-400 hover:text-white bg-[#1e2530]/20 border border-zinc-900'
              }`}
            >
              Canchas e Instalaciones
            </button>
            <button
              onClick={() => setPhotosFilter('matches')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                photosFilter === 'matches' ? 'bg-[#ED7038] text-white font-extrabold shadow-[0_0_12px_rgba(237,112,56,0.3)]' : 'text-gray-400 hover:text-white bg-[#1e2530]/20 border border-zinc-900'
              }`}
            >
              Partidos en Curso
            </button>
            <button
              onClick={() => setPhotosFilter('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                photosFilter === 'events' ? 'bg-[#ED7038] text-white font-extrabold shadow-[0_0_12px_rgba(237,112,56,0.3)]' : 'text-gray-400 hover:text-white bg-[#1e2530]/20 border border-zinc-900'
              }`}
            >
              Torneos y Copa Premiaciones
            </button>
          </div>

          {/* Photo Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-xs font-mono text-adhler-orange animate-pulse">Cargando catálogo visual...</div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl text-gray-400 border border-zinc-900 font-mono text-xs">
              No hay fotografías registradas en esta sección actualmente.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setPreviewPhoto(photo)}
                  className="glass-panel overflow-hidden rounded-2xl border border-zinc-900 hover:border-[#ED7038]/25 transition-all duration-300 group cursor-pointer relative shadow-md hover:shadow-lg"
                  title="Click para ampliar"
                >
                  <div className="h-60 overflow-hidden relative">
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* On hover view badge */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-[#ED7038] text-white rounded-full p-3 font-bold flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <Eye className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    </div>

                    <span className="absolute top-3 left-3 bg-black/85 backdrop-blur rounded uppercase font-mono font-bold text-[8px] px-2 py-0.5 text-adhler-orange tracking-wide border border-adhler-orange/10">
                      {photo.category}
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="p-4 bg-zinc-950/40 text-left border-t border-zinc-900">
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-sans font-medium">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: VIDEOS Y TRANSMISIONES EN VIVO */}
      {activeTab === 'videos' && (
        <div className="space-y-10 animate-fadeIn" id="video-center-anchor">
          
          {/* Main Video Streaming Viewport Box */}
          {selectedVideo ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* VIDEO PLAYER CELL */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-adhler-orange/20 shadow-2xl group flex flex-col justify-end">
                  
                  {/* Dynamic Video Player/Embed Loader */}
                  {(() => {
                    const resolved = getEmbeddableUrl(selectedVideo.url);
                    return videoError ? (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center space-y-4 border border-rose-500/10">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
                          <Tv className="w-8 h-8 text-rose-500" />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                          <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">Señal No Disponible</h4>
                          <p className="text-gray-400 text-xs leading-relaxed font-sans">
                            {videoError}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleRetryConnection}
                            className="px-4 py-2 rounded-xl bg-adhler-orange hover:bg-adhler-orange/95 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-adhler-orange/10"
                          >
                            Reintentar Conexión
                          </button>
                          <a
                            href={resolveVideoUrl(selectedVideo.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Abrir Enlace Original
                          </a>
                        </div>
                      </div>
                    ) : (resolved.type === 'youtube' || resolved.type === 'vimeo' || resolved.type === 'facebook' || resolved.type === 'iframe') ? (
                      <div className="w-full h-full absolute inset-0">
                        <iframe
                          key={selectedVideo.id}
                          src={resolved.embedUrl!}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={selectedVideo.title}
                        />
                      </div>
                    ) : (
                      <video
                        ref={videoElementRef}
                        key={selectedVideo.id}
                        src={resolveVideoUrl(selectedVideo.url)}
                        className="w-full h-full object-cover"
                        autoPlay={isPlaying}
                        muted={isMuted}
                        loop
                        playsInline
                        referrerPolicy="no-referrer"
                        onError={handleVideoError}
                      />
                    );
                  })()}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* HUD: Left corner badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 select-none">
                    {selectedVideo.isLive ? (
                      <span className="bg-red-600 text-[10px] text-white font-extrabold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md border border-red-500/30">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        En Vivo
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-[10px] text-gray-200 font-extrabold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-zinc-700">
                        DVR / Histórico
                      </span>
                    )}

                    <span className="bg-black/75 backdrop-blur text-[10px] text-adhler-orange font-extrabold font-mono px-2.5 py-1 rounded-full border border-adhler-orange/10">
                      CANCHA 1 TECHADA
                    </span>
                  </div>

                  {/* HUD: Right corner indicators */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 select-none bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-zinc-800 text-[10px] text-gray-300 font-mono">
                    <Users className="w-3.5 h-3.5 text-blue-400 mr-1" />
                    <span>
                      {selectedVideo.isLive ? (
                        <><strong>{viewerCount}</strong> aficionados</>
                      ) : (
                        'Diferido'
                      )}
                    </span>
                  </div>

                  {/* CUSTOM PLAYER HUD FOOTER OVERLAY */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 space-y-3 z-10">
                    <h3 className="font-display font-extrabold text-sm sm:text-lg text-white leading-tight drop-shadow">
                      {selectedVideo.title}
                    </h3>

                    {/* Interactive Playback & Sound Widgets */}
                    <div className="flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayPause}
                          className="bg-adhler-orange hover:bg-adhler-orange/90 text-white p-3 rounded-full transition-transform hover:scale-105 shadow-md flex items-center justify-center cursor-pointer"
                          title={isPlaying ? 'Pausar' : 'Reproducir'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <button
                          onClick={handleMuteUnmute}
                          className="text-white hover:text-adhler-orange p-2 transition-colors cursor-pointer"
                          title={isMuted ? 'Activar sonido' : 'Silenciar'}
                        >
                          {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-adhler-orange animate-pulse" />}
                        </button>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
                        <button 
                          onClick={() => {
                            setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);
                            setHasLiked(!hasLiked);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur border text-[10px] sm:text-xs transition-all cursor-pointer ${
                            hasLiked ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-black/60 text-gray-300 border-zinc-800 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{likesCount} Likes</span>
                        </button>

                        <span className="hidden sm:inline bg-black/60 border border-zinc-850 px-3 py-1.5 rounded-full">
                          Vistas: {selectedVideo.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner info text below player */}
                <div className="glass-panel p-4.5 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-left">
                  <div className="space-y-1">
                    <span className="bg-adhler-cyan/15 text-adhler-cyan border border-adhler-cyan/25 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                      Señal HD de Altas Prestaciones
                    </span>
                    <p className="text-xs text-gray-300 font-medium">Transmitiendo en vivo cortes de partidos, mejores goles sabatinos y partidos de eliminación dominical.</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-1.5 rounded-xl font-mono text-[10px] text-gray-400">
                    Fecha de inicio: <span className="text-white">Junio 1, 2026</span>
                  </div>
                </div>

              </div>

              {/* INTERACTIVE COMMUNITY LIVE CHAT COLUMN */}
              <div className="glass-panel rounded-3xl border border-zinc-800/80 bg-zinc-950/40 overflow-hidden flex flex-col h-[400px] lg:h-auto text-left">
                
                {/* Chat Header Widget */}
                <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-adhler-orange" />
                    <span className="text-xs font-display font-bold text-white uppercase tracking-wider">Chat en Vivo Gratuito</span>
                  </div>
                  {selectedVideo.isLive ? (
                    <div className="flex items-center space-x-1.5 text-[9px] bg-adhler-orange/15 text-adhler-orange px-2.5 py-0.5 rounded border border-adhler-orange/20 font-mono">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-adhler-orange animate-ping"></span>
                      <span>EN VIVO</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-[9px] bg-zinc-850 text-gray-400 px-2.5 py-0.5 rounded border border-zinc-800 font-mono">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                      <span>GRABADO</span>
                    </div>
                  )}
                </div>

                {/* Scroller Chat Body */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 font-mono text-[11px] h-48 scroll-smooth no-scrollbar">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-xl border max-w-[85%] transition-all animate-fadeIn ${
                        msg.isUser 
                          ? 'bg-adhler-orange/10 border-adhler-orange/20 text-white ml-auto' 
                          : 'bg-zinc-900/60 border-zinc-850/60 text-gray-300 mr-auto'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 justify-between">
                        <span className={`font-black tracking-wide ${msg.isUser ? 'text-adhler-orange' : 'text-adhler-yellow'}`}>
                          @{msg.sender}
                        </span>
                        <span className="text-[8px] text-gray-500">{msg.time}</span>
                      </div>
                      <p className="font-medium font-sans leading-relaxed text-xs break-words">{msg.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Sub-inputs form */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje en el chat..."
                    className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ED7038]/50 font-sans"
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    className="bg-adhler-orange hover:bg-adhler-orange/95 text-white p-2 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>

              </div>

            </div>
          ) : null}

          {/* Archived Video Grid & Navigation Filters */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-t border-adhler-cyan/15 pt-8 text-left">
              <div className="space-y-1 self-start">
                <h4 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-adhler-orange" />
                  Videoteca de Goles & Resúmenes
                </h4>
                <p className="text-xs text-gray-400 font-sans">Busca y reproduce videos históricos, clips de mejores de la fecha o repeticiones completas.</p>
              </div>

              {/* Video Filters */}
              <div className="flex gap-1.5 overflow-x-auto self-start sm:self-center w-full sm:w-auto no-scrollbar">
                <button
                  onClick={() => setVideosFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    videosFilter === 'all'
                      ? 'bg-[#ED7038] text-white font-black'
                      : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setVideosFilter('live')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    videosFilter === 'live'
                      ? 'bg-[#ED7038] text-white font-black'
                      : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Canales En Vivo
                </button>
                <button
                  onClick={() => setVideosFilter('highlight')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    videosFilter === 'highlight'
                      ? 'bg-[#ED7038] text-white font-black'
                      : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Resúmenes Goles
                </button>
                <button
                  onClick={() => setVideosFilter('full_match')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    videosFilter === 'full_match'
                      ? 'bg-[#ED7038] text-white font-black'
                      : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Partido Completo
                </button>
              </div>
            </div>

            {/* Video List */}
            {filteredVideos.length === 0 ? (
              <div className="py-12 text-center text-gray-400 border border-zinc-900 rounded-2xl glass-panel font-mono text-xs">
                No hay videos en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const isActive = selectedVideo?.id === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => selectActiveVideoPlayer(video)}
                      className={`glass-panel overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group text-left ${
                        isActive
                          ? 'border-adhler-orange shadow-[0_0_15px_rgba(237,112,56,0.15)] bg-adhler-orange/5'
                          : 'border-zinc-800/80 hover:border-[#ED7038]/25 bg-zinc-950/40'
                      }`}
                    >
                      <div className="relative h-44 bg-zinc-900 overflow-hidden">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <div className={`p-3 rounded-full transition-all flex items-center justify-center ${
                            isActive ? 'bg-[#ED7038] text-white' : 'bg-black/60 text-white group-hover:bg-[#ED7038] group-hover:text-white'
                          }`}>
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Top banner tag */}
                        <div className="absolute top-2.5 left-2.5">
                          {video.isLive ? (
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded tracking-wide border border-red-500/10 animate-pulse">
                              Transmisión Activa
                            </span>
                          ) : (
                            <span className="bg-black/80 text-gray-400 text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded tracking-wide border border-zinc-800">
                              {video.category === 'highlight' ? 'Mejores Goles' : 'Replay de 90m'}
                            </span>
                          )}
                        </div>

                        {/* Bottom timestamp wrapper */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-gray-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                          {video.isLive ? 'Varios Ángulos' : 'Repetición'}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h5 className="font-sans font-bold text-sm text-white line-clamp-2 leading-snug tracking-tight">
                          {video.title}
                        </h5>
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-1.5 border-t border-zinc-900/45">
                          <span>{video.views} reproducciones</span>
                          <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Premium Interactive Lightbox Modal Popup for Photos */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none overflow-hidden"
            onClick={() => setPreviewPhoto(null)}
          >
            {/* AUTOPLAY INDICATOR PROGRESS BAR */}
            {isAutoplay && (
              <motion.div 
                key={previewPhoto.id}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute top-0 left-0 h-1 bg-[#ED7038] z-50"
              />
            )}

            {/* TOP HEADER CONTROLS BAR */}
            <div 
              className="w-full flex items-center justify-between bg-zinc-950/40 backdrop-blur-sm px-4 py-3 rounded-2xl border border-zinc-900/60 max-w-7xl mx-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Counter & Status */}
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs font-mono font-medium tracking-wide">
                  Imagen <strong className="text-white">{currentPhotoIndex + 1}</strong> de <strong className="text-white">{filteredPhotos.length}</strong>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-adhler-orange/15 border border-adhler-orange/25 text-[9px] font-bold text-adhler-orange uppercase tracking-widest font-mono">
                  {previewPhoto.category === 'facilities' ? 'Instalaciones' : previewPhoto.category === 'matches' ? 'Partidos' : 'Torneos'}
                </span>
              </div>

              {/* Center: Play/Pause indicator */}
              {isAutoplay && (
                <div className="flex items-center gap-1.5 bg-[#ED7038]/15 border border-[#ED7038]/25 px-3 py-1 rounded-full text-[#ED7038] text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse">
                  <Sparkles size={11} className="animate-spin" />
                  <span>Autoplay Activado</span>
                </div>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Autoplay Play/Pause */}
                <button
                  type="button"
                  onClick={() => setIsAutoplay(prev => !prev)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isAutoplay 
                      ? 'bg-[#ED7038] text-white border-transparent' 
                      : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white'
                  }`}
                  title={isAutoplay ? "Pausar Reproducción Automática (Espacio)" : "Iniciar Reproducción Automática (Espacio)"}
                >
                  {isAutoplay ? <Pause size={14} className="stroke-[2.5]" /> : <Play size={14} className="stroke-[2.5]" />}
                </button>

                {/* Zoom out */}
                <button
                  type="button"
                  onClick={() => setZoomScale(prev => Math.max(1, prev - 0.5))}
                  disabled={zoomScale <= 1}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Alejar Imagen"
                >
                  <ZoomOut size={14} />
                </button>

                {/* Zoom in */}
                <button
                  type="button"
                  onClick={() => setZoomScale(prev => Math.min(3, prev + 0.5))}
                  disabled={zoomScale >= 3}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Acercar Imagen"
                >
                  <ZoomIn size={14} />
                </button>

                {/* Reset Zoom helper */}
                {zoomScale > 1 && (
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="p-2 rounded-xl bg-adhler-cyan/15 border border-adhler-cyan/25 text-adhler-cyan hover:bg-[#96D7DD] hover:text-black transition-all cursor-pointer text-[10px] font-black font-mono uppercase px-2.5"
                    title="Restablecer Zoom"
                  >
                    {zoomScale.toFixed(1)}x
                  </button>
                )}

                {/* Share Link / Copy Info */}
                <button
                  type="button"
                  onClick={(e) => handleShare(e, previewPhoto.url)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    shareCopied 
                      ? 'bg-[#2d3846] text-white border-transparent' 
                      : 'bg-zinc-900 border-zinc-800 text-gray-300 hover:text-white hover:border-zinc-700'
                  }`}
                  title="Copiar Enlace de Fotografía"
                >
                  {shareCopied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={(e) => handleDownload(e, previewPhoto.url, `Tribol_Galeria_${previewPhoto.id}.jpg`)}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Guardar Imagen Original"
                >
                  <Download size={14} />
                </button>

                <div className="w-px h-5 bg-zinc-800 mx-1 hidden sm:block" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-450 hover:text-black transition-all cursor-pointer"
                  title="Cerrar Visualización (Esc)"
                >
                  <X size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* MAIN LIGHTBOX CENTER STAGE LAYOUT */}
            <div className="flex-grow flex items-center justify-between relative max-w-7xl mx-auto w-full px-2 sm:px-6 my-2">
              
              {/* Previous Image Chevron */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 p-3.5 rounded-full bg-zinc-950/70 hover:bg-adhler-orange hover:text-white text-white hover:scale-105 active:scale-95 transition-all duration-200 z-10 border border-zinc-900/60 cursor-pointer shadow-xl"
                title="Imagen Anterior (A / Izquierda)"
              >
                <ChevronLeft size={20} className="stroke-[3]" />
              </button>

              {/* Interactive Image Frame */}
              <div 
                className="flex-1 h-full flex items-center justify-center p-2 sm:p-6 overflow-auto"
                onClick={() => setPreviewPhoto(null)}
              >
                <motion.div
                  key={previewPhoto.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="relative max-h-full flex items-center justify-center cursor-zoom-in"
                  onClick={(e) => toggleZoom(e)}
                >
                  <motion.img
                    src={previewPhoto.url} 
                    alt={previewPhoto.caption} 
                    className="max-w-full rounded-2xl border border-zinc-850 shadow-2xl object-contain origin-center cursor-zoom-in transition-all duration-300"
                    style={{ 
                      scale: zoomScale,
                      maxHeight: '52vh'
                    }}
                    referrerPolicy="no-referrer"
                  />
                  
                  {shareCopied && (
                    <div className="absolute top-4 bg-adhler-orange text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xl animate-bounce">
                      <Check size={12} className="stroke-[3]" />
                      <span>¡Enlace Copiado al Portapapeles!</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Next Image Chevron */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 p-3.5 rounded-full bg-zinc-950/70 hover:bg-adhler-orange hover:text-white text-white hover:scale-105 active:scale-95 transition-all duration-200 z-10 border border-zinc-900/60 cursor-pointer shadow-xl"
                title="Siguiente Imagen (D / Derecha)"
              >
                <ChevronRight size={20} className="stroke-[3]" />
              </button>
            </div>

            {/* UNDER LAYOUT: CAPTIONS AND THUMBNAIL TRACK */}
            <div 
              className="w-full space-y-4 max-w-4xl mx-auto z-10 pb-2 sm:pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Caption text with glassmorphism */}
              <div className="bg-zinc-950/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-900/80 text-center space-y-1">
                <p className="text-white text-xs sm:text-sm font-semibold max-w-2xl mx-auto leading-relaxed">
                  {previewPhoto.caption}
                </p>
                <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-500 pt-1">
                  <span>Ficha: #{previewPhoto.id}</span>
                  <span>•</span>
                  <span>Categoría: <strong className="text-adhler-orange uppercase font-bold">{previewPhoto.category}</strong></span>
                  <span>•</span>
                  <span>Fecha: {new Date(previewPhoto.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Mini Thumbnail Strip Roller */}
              <div className="flex gap-2.5 py-1.5 px-4 overflow-x-auto justify-start sm:justify-center max-w-full no-scrollbar">
                {filteredPhotos.map((photo, pIdx) => {
                  const isActive = photo.id === previewPhoto.id;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => {
                        setPreviewPhoto(photo);
                        setZoomScale(1);
                      }}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-250 ${
                        isActive 
                          ? 'ring-2 ring-adhler-orange scale-110 opacity-100 shadow-[0_0_12px_rgba(237,112,56,0.4)]' 
                          : 'opacity-40 hover:opacity-100'
                      }`}
                      title={`Ver imagen ${pIdx + 1}`}
                    >
                      <img 
                        src={photo.url} 
                        alt={photo.caption} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
