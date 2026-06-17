import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  FolderPlus, 
  RefreshCw, 
  Trash2, 
  Download, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { Reservation, Payment } from '../types';
import { googleSignIn, initAuth, logout, getAccessToken } from '../utils/googleAuth';

interface AdminGoogleDriveProps {
  reservations: Reservation[];
  payments: Payment[];
  getFieldFriendlyName: (fid: string) => string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export default function AdminGoogleDrive({
  reservations,
  payments,
  getFieldFriendlyName
}: AdminGoogleDriveProps) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  // Drive list state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderId, setFolderId] = useState<string | null>(null);
  
  // File upload state
  const [dragging, setDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion confirmation modal State
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState<string>('');

  // 1. Listen for Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Fetch or create Tribol directory and list content
  useEffect(() => {
    if (token) {
      initializeDriveSpace();
    }
  }, [token]);

  const initializeDriveSpace = async () => {
    setLoading(true);
    try {
      const fId = await getOrCreateAppFolder();
      setFolderId(fId);
      if (fId) {
        await listFolderFiles(fId);
      }
    } catch (err: any) {
      console.error('Error al inicializar espacio de Google Drive:', err);
      showStatus('error', 'Error al sincronizar con Google Drive: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => {
      setActionStatus({ type: null, message: '' });
    }, 6000);
  };

  const handleLogin = async () => {
    try {
      setActionLoading(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showStatus('success', 'Cuenta de Google vinculada con éxito');
      }
    } catch (err: any) {
      console.error('Error de login:', err);
      showStatus('error', 'Error al vincular cuenta de Google: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setFolderId(null);
      setDriveFiles([]);
      showStatus('success', 'Sesión de Google Drive cerrada con éxito');
    } catch (err: any) {
      console.error('Error logout:', err);
    }
  };

  // 3. Helper to look up or create our application folder: 'Futbol_Rapido_Tribol_Respaldos'
  const getOrCreateAppFolder = async (): Promise<string | null> => {
    if (!token) return null;
    try {
      // Look for the folder
      const q = encodeURIComponent("name = 'Futbol_Rapido_Tribol_Respaldos' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }

      // If not found, let's create it
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Futbol_Rapido_Tribol_Respaldos',
          mimeType: 'application/vnd.google-apps.folder',
          description: 'Carpeta de respaldos de Fútbol Rápido Tribol'
        })
      });
      const folder = await createRes.json();
      return folder.id || null;
    } catch (err) {
      console.error('Error buscando/creando carpeta de la app:', err);
      throw err;
    }
  };

  // 4. File Listing from directory
  const listFolderFiles = async (fId: string) => {
    if (!token) return;
    try {
      const q = encodeURIComponent(`'${fId}' in parents and trashed = false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.files) {
        setDriveFiles(data.files);
      }
    } catch (err) {
      console.error('Error listando archivos de Drive:', err);
      throw err;
    }
  };

  // 5. Native Native multipart file upload to Google Drive
  const uploadToDrive = async (fileName: string, mimeType: string, fileContent: string | Blob) => {
    if (!token || !folderId) {
      showStatus('error', 'Falta vinculación o carpeta de Google Drive');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    try {
      const metadata = {
        name: fileName,
        parents: [folderId]
      };

      const boundary = 'foo_bar_baz_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const delimiterBlob = new Uint8Array(new TextEncoder().encode(delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n'));
      const fileHeaderBlob = new Uint8Array(new TextEncoder().encode(delimiter + `Content-Type: ${mimeType}\r\n\r\n`));
      const closingBlob = new Uint8Array(new TextEncoder().encode(close_delim));
      
      const fileBlob = typeof fileContent === 'string' 
        ? new Blob([fileContent], { type: mimeType })
        : fileContent;

      const finalBlob = new Blob([
        delimiterBlob,
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
        fileHeaderBlob,
        fileBlob,
        closingBlob
      ], { type: `multipart/related; boundary=${boundary}` });

      setUploadProgress(40);

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: finalBlob
      });

      setUploadProgress(80);

      if (res.ok) {
        showStatus('success', `Archivo "${fileName}" guardado correctamente en Google Drive`);
        await listFolderFiles(folderId);
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || 'Error en respuesta de Google Drive');
      }
    } catch (err: any) {
      console.error('Error al subir archivo a Drive:', err);
      showStatus('error', 'Error de subida: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 6. CSV Export Data Compilers
  const compileReservationsCSV = (): string => {
    const headers = ['Folio ID', 'Cancha', 'Fecha', 'Horario HS', 'Capitán', 'Celular', 'Correo', 'Total Cobrado', 'Anticipo', 'Saldo Restante', 'Estado de Reserva', 'Estado de Pago', 'Check-in Digital', 'Fecha de Registro'];
    const rows = reservations.map(res => {
      const total = res.totalPrice || 0;
      const advance = res.advancePaid || 0;
      const remaining = total - advance;
      return [
        `"${res.id}"`,
        `"${getFieldFriendlyName(res.fieldId)}"`,
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
    return "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  };

  const compileFinancesCSV = (): string => {
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
    return "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  };

  const compilePaymentsCSV = (): string => {
    const headers = ['ID Pago', 'Folio Reserva', 'Cliente', 'Correo', 'Monto Pagado', 'Metodo de Pago', 'ID Transactorial', 'Estado Pago', 'Fecha de Registro'];
    const rows = payments.map(pay => {
      const res = reservations.find(r => r.id === pay.reservationId);
      const clientName = res ? res.userName : 'N/A';
      const clientEmail = res ? res.userEmail : 'N/A';
      
      let methodDisplay: string = pay.paymentMethod;
      if (pay.paymentMethod === 'stripe') methodDisplay = 'Tarjeta (Stripe)';
      else if (pay.paymentMethod === 'paypal') methodDisplay = 'PayPal';
      else if (pay.paymentMethod === 'whatsapp_transfer') methodDisplay = 'Transferencia WhatsApp';
      else if (pay.paymentMethod === 'cash') methodDisplay = 'Efectivo en Caja';
      
      return [
        `"${pay.id}"`,
        `"${pay.reservationId}"`,
        `"${clientName}"`,
        `"${clientEmail}"`,
        pay.amount || 0,
        `"${methodDisplay}"`,
        `"${pay.transactionId || 'Sin ID'}"`,
        `"${pay.status === 'completed' ? 'Completado' : pay.status === 'pending' ? 'Pendiente' : 'Fallado'}"`,
        `"${pay.createdAt}"`
      ];
    });
    return "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  };

  // 7. Core trigger actions
  const backupReservations = async () => {
    setActionLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Tribol_Reporte_Reservas_${dateStr}.csv`;
    const content = compileReservationsCSV();
    await uploadToDrive(fileName, 'text/csv', content);
    setActionLoading(false);
  };

  const backupFinances = async () => {
    setActionLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Tribol_Reporte_Caja_BI_${dateStr}.csv`;
    const content = compileFinancesCSV();
    await uploadToDrive(fileName, 'text/csv', content);
    setActionLoading(false);
  };

  const backupPayments = async () => {
    setActionLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Tribol_Historial_Pagos_${dateStr}.csv`;
    const content = compilePaymentsCSV();
    await uploadToDrive(fileName, 'text/csv', content);
    setActionLoading(false);
  };

  // 8. Delete operation on Google Drive file
  const handleDeleteFile = async () => {
    if (!token || !fileToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showStatus('success', `Archivo "${fileToDelete.name}" eliminado de Google Drive permanente`);
        setFileToDelete(null);
        setConfirmDeleteText('');
        if (folderId) {
          await listFolderFiles(folderId);
        }
      } else {
        throw new Error('Error al ejecutar DELETE en Google Drive API');
      }
    } catch (err: any) {
      console.error('Error al borrar archivo de Drive:', err);
      showStatus('error', 'Error al borrar archivo: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 9. Manual Upload Drag/Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      await uploadSingleFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      await uploadSingleFile(file);
    }
  };

  const uploadSingleFile = async (file: File) => {
    setActionLoading(true);
    try {
      await uploadToDrive(file.name, file.type || 'application/octet-stream', file);
    } catch (err: any) {
      showStatus('error', 'Error al subir archivo manual: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter local drive files in browser
  const filteredFilesList = driveFiles.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const b = parseInt(bytes);
    if (isNaN(b)) return 'N/A';
    if (b < 1024) return b + ' B';
    const kb = b / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8 text-left" id="google-drive-admin-view">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl">
        <div className="text-left">
          <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Workspace Cloud Sync</span>
          <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-tight">Sincronización Google Drive</h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Respalde de manera segura y automática las bases de datos de reservaciones, reportes financieros de caja y logs en formato CSV del sistema directamente en su Google Drive.
          </p>
        </div>
        
        {/* Toggle connection state buttons */}
        {!loading && (
          <div className="shrink-0 flex items-center">
            {user ? (
              <div className="flex items-center gap-3 bg-zinc-950 px-4 py-3 border border-zinc-850 rounded-2xl">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-8 w-8 rounded-full border border-emerald-500/25" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">
                    {user.displayName?.[0] || 'A'}
                  </div>
                )}
                <div className="text-left text-xs">
                  <p className="font-bold text-white max-w-[120px] truncate">{user.displayName || 'Administrador'}</p>
                  <button 
                    onClick={handleLogout}
                    type="button" 
                    className="text-[10px] text-zinc-550 hover:text-rose-400 font-bold block transition uppercase mt-0.5 cursor-pointer underline hover:no-underline"
                  >
                    Desvincular Google
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                type="button"
                className="gsi-material-button font-bold text-xs"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Vincular Google Drive</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {actionStatus.message && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
          actionStatus.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-450' 
            : 'bg-rose-950/20 border-rose-500/20 text-rose-450'
        }`}>
          {actionStatus.type === 'success' ? (
            <CheckCircle className="shrink-0 mt-0.5" size={16} />
          ) : (
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
          )}
          <span className="text-xs font-mono font-medium">{actionStatus.message}</span>
        </div>
      )}

      {/* Main drive action interface or empty link guidance */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/50 border border-zinc-900 rounded-3xl">
          <RefreshCw className="text-emerald-500 animate-spin mb-4" size={32} />
          <p className="text-xs text-zinc-500 font-mono">Conectando con Google Drive Client...</p>
        </div>
      ) : !user ? (
        <div className="py-16 px-6 text-center border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20 max-w-4xl mx-auto flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-zinc-900/40 rounded-2xl border border-zinc-850 flex items-center justify-center text-zinc-500 mb-4 shadow-xl">
            <Cloud size={32} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Vincule su cuenta para administrar respaldos</h3>
          <p className="text-xs text-zinc-550 max-w-md mx-auto mt-2 leading-relaxed">
            Para la integridad y auditoría de la taquilla, se requiere vincular una cuenta autorizada de la administración para almacenar y listar archivos en su carpeta personal segura de Google Drive.
          </p>
          <button
            onClick={handleLogin}
            type="button"
            className="mt-6 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center gap-2"
          >
            <Cloud size={14} />
            Configurar Conexión Google Drive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column Left: Actions backups */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-lg text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block border-b border-zinc-900 pb-2">
                🗄️ RESPALDO INSTANTÁNEO TRIBOL
              </span>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Seleccione la base de datos o corte de caja a transferir a su Google Drive. Se guardarán en la carpeta <strong className="text-white">Futbol_Rapido_Tribol_Respaldos</strong>.
              </p>

              <div className="space-y-3.5 pt-2">
                
                <button
                  onClick={backupReservations}
                  disabled={actionLoading}
                  type="button"
                  className="w-full text-left p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-emerald-950/20 border border-zinc-850 hover:border-emerald-500/20 transition cursor-pointer flex items-center gap-3 font-semibold group"
                >
                  <div className="p-2 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-xl text-emerald-450 border border-emerald-500/10">
                    <Database size={15} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-xs text-white uppercase font-bold block">Historial de Reservas</span>
                    <span className="text-[9.5px] text-zinc-500 block truncate font-mono">Reserva total ({reservations.length} records)</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-650 shrink-0" />
                </button>

                <button
                  onClick={backupFinances}
                  disabled={actionLoading}
                  type="button"
                  className="w-full text-left p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-emerald-950/20 border border-zinc-850 hover:border-emerald-500/20 transition cursor-pointer flex items-center gap-3 font-semibold group"
                >
                  <div className="p-2 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-xl text-emerald-450 border border-emerald-500/10">
                    <FileText size={15} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-xs text-white uppercase font-bold block">Corte Finanzas Caja</span>
                    <span className="text-[9.5px] text-zinc-500 block truncate font-mono">Consolidado ingresos</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-650 shrink-0" />
                </button>

                <button
                  onClick={backupPayments}
                  disabled={actionLoading}
                  type="button"
                  className="w-full text-left p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-emerald-950/20 border border-zinc-850 hover:border-emerald-500/20 transition cursor-pointer flex items-center gap-3 font-semibold group"
                >
                  <div className="p-2 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-xl text-emerald-450 border border-emerald-500/10">
                    <CheckCircle size={15} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-xs text-white uppercase font-bold block">Historial de Pagos</span>
                    <span className="text-[9.5px] text-zinc-500 block truncate font-mono">Histórico completo de abonos</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-650 shrink-0" />
                </button>

              </div>
            </div>

            {/* Drag & Drop Manual file Upload area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-zinc-950/40 border border-dashed rounded-3xl p-6 text-center transition flex flex-col items-center justify-center space-y-3 cursor-pointer ${
                dragging 
                  ? 'border-emerald-500 bg-emerald-950/10' 
                  : 'border-zinc-850 hover:border-zinc-700 bg-zinc-950/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-850 shadow">
                <UploadCloud size={22} className={dragging ? 'text-emerald-400 animate-bounce' : 'text-zinc-550'} />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white block uppercase">Cargar Archivo a Drive</span>
                <span className="text-[10px] text-zinc-550 block mt-1">Arrastre o haga clic para subir reglamento, PDF de torneo, etc.</span>
              </div>
              
              {isUploading && (
                <div className="w-full space-y-1.5 pt-2">
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 block uppercase">Subiendo al 100% cloud...</span>
                </div>
              )}
            </div>

          </div>

          {/* Column Right: Drive file browser */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl shadow-lg p-5 flex flex-col min-h-[460px] text-left">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4 mb-4">
                <div className="text-left mb-1 sm:mb-0">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/15 uppercase font-mono">
                    Carpeta: Futbol_Rapido_Tribol_Respaldos
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-sm uppercase font-black text-white">Archivos Respaldados ({driveFiles.length})</h3>
                    <button 
                      onClick={initializeDriveSpace}
                      disabled={actionLoading}
                      type="button" 
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
                      title="Refrescar lista"
                    >
                      <RefreshCw size={11} className={actionLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {/* Input Search drive */}
                <div className="bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-xl flex items-center gap-2 w-full sm:max-w-[200px]">
                  <Search size={13} className="text-zinc-550 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Filtrar archivos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs text-white placeholder-zinc-550 w-full"
                  />
                </div>
              </div>

              {/* Items listing table */}
              <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2 text-xs">
                {filteredFilesList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-550 font-mono gap-1 text-center">
                    <FolderPlus size={24} className="text-zinc-700" />
                    <span>Sin registros en la carpeta seleccionada.</span>
                  </div>
                ) : (
                  filteredFilesList.map((file) => {
                    const isCSV = file.mimeType === 'text/csv' || file.name.endsWith('.csv');
                    const hasSize = typeof file.size === 'string';

                    return (
                      <div 
                        key={file.id} 
                        className="bg-zinc-950 border border-zinc-900 hover:bg-zinc-900/30 p-3.5 rounded-2xl flex items-center justify-between gap-4 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2 rounded-xl text-zinc-450 border shrink-0 ${
                            isCSV 
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-440' 
                              : 'bg-zinc-900 border-zinc-850'
                          }`}>
                            <FileText size={16} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <span className="font-bold text-white block truncate uppercase" title={file.name}>
                              {file.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] text-zinc-500 mt-0.5">
                              {hasSize && (
                                <span className="font-mono bg-zinc-900 px-1.5 py-0.2 rounded shrink-0">
                                  {formatBytes(file.size)}
                                </span>
                              )}
                              <span>Creado: {file.createdTime ? new Date(file.createdTime).toLocaleDateString('es-MX') : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* File actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a 
                              href={file.webViewLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-zinc-350 hover:text-white rounded-xl transition flex items-center justify-center cursor-pointer"
                              title="Ver en Google Drive"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          
                          <button
                            onClick={() => setFileToDelete(file)}
                            type="button"
                            className="p-2 bg-zinc-900 hover:bg-rose-950/30 text-zinc-350 hover:text-rose-450 border border-zinc-850 hover:border-rose-950/40 rounded-xl transition cursor-pointer"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Delete Confirmation Modal as per security compliance instructions */}
      {fileToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" id="google-delete-modal">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-left shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-base uppercase font-black text-rose-400 tracking-wider">¿Eliminar permanentemente?</h3>
                <p className="text-xs text-zinc-400 mt-1 pb-4 leading-relaxed border-b border-zinc-900">
                  Está a punto de borrar el archivo <strong className="text-white">"{fileToDelete.name}"</strong> de su almacenamiento de Google Drive. Esta acción no se puede deshacer.
                </p>
                
                <div className="mt-4 space-y-3">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Para confirmar, escriba <strong className="text-white">REGISTRAR</strong> a continuación:
                  </label>
                  <input 
                    type="text" 
                    value={confirmDeleteText}
                    onChange={(e) => setConfirmDeleteText(e.target.value)}
                    placeholder="Escriba REGISTRAR..."
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-550 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 text-xs font-bold">
                  <button
                    onClick={() => {
                      setFileToDelete(null);
                      setConfirmDeleteText('');
                    }}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteFile}
                    disabled={confirmDeleteText !== 'REGISTRAR' || actionLoading}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-zinc-900 text-black disabled:text-zinc-600 transition cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    Eliminar de Google Drive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
