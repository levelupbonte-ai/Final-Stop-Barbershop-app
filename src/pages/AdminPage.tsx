import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  Upload,
  AlertCircle,
  Camera,
  FolderOpen,
  X
} from 'lucide-react';
import { 
  getReservations, 
  getWaitlistQueue, 
  seedFirestoreDatabase, 
  setShopWaitlistOpen, 
  updateWaitlistStatus, 
  getGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  seedFirestoreGallery,
  FirestoreReservation, 
  FirestoreWaitlistEntry,
  FirestoreGalleryItem
} from '../lib/firestoreService';
import { uploadImageToFreeCloud } from '../lib/freeImageUploadService';

interface AdminPageProps {
  onBackToHome: () => void;
  isWaitlistOpen: boolean;
  onWaitlistToggle: (isOpen: boolean) => void;
}

type AdminTab = 'appointments' | 'waitlist' | 'gallery';

export default function AdminPage({
  onBackToHome,
  isWaitlistOpen,
  onWaitlistToggle
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [reservations, setReservations] = useState<FirestoreReservation[]>([]);
  const [waitlist, setWaitlist] = useState<FirestoreWaitlistEntry[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<FirestoreGalleryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Image Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBarber, setNewBarber] = useState<'Mika' | 'Lusca' | 'Both'>('Mika');
  const [newCategory, setNewCategory] = useState('Braids & Cornrows');
  const [newAudience, setNewAudience] = useState<'Women & Girls (Braids)' | 'Men & Boys (Haircuts)' | 'Shop'>('Women & Girls (Braids)');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [resList, wlList, photos] = await Promise.all([
        getReservations(),
        getWaitlistQueue(),
        getGalleryItems()
      ]);
      setReservations(resList);
      setWaitlist(wlList);
      setGalleryPhotos(photos);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    setStatusMessage(null);
    try {
      const [dbRes, galRes] = await Promise.all([
        seedFirestoreDatabase(),
        seedFirestoreGallery()
      ]);
      if (dbRes.success) {
        setStatusMessage({ 
          type: 'success', 
          text: `Firestore synchronized! Populated reservations, queue, and ${galRes.count} gallery photos.` 
        });
        await loadAllData();
      } else {
        setStatusMessage({ type: 'error', text: dbRes.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Sync failed' });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleToggleWaitlist = async () => {
    const nextState = !isWaitlistOpen;
    onWaitlistToggle(nextState);
    await setShopWaitlistOpen(nextState);
  };

  const handleServeTicket = async (docId: string) => {
    await updateWaitlistStatus(docId, 'served');
    await loadAllData();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).' });
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'L\'image dépasse 15 Mo. Veuillez choisir une photo plus petite.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    setNewImageUrl(''); // Clear text URL if direct file chosen
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddGalleryItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || (!newImageUrl.trim() && !selectedFile) || !newDescription.trim()) {
      setStatusMessage({ type: 'error', text: 'Veuillez remplir le titre, la description et sélectionner une photo.' });
      return;
    }

    setIsSavingImage(true);
    try {
      let finalImageUrl = newImageUrl.trim();

      // If user picked a local file from device / camera
      if (selectedFile) {
        setIsUploadingFile(true);
        setStatusMessage({ type: 'success', text: 'Téléversement gratuit de votre photo en cours...' });
        finalImageUrl = await uploadImageToFreeCloud(selectedFile);
        setIsUploadingFile(false);
      }

      if (!finalImageUrl) {
        throw new Error('Impossible d\'obtenir l\'adresse de l\'image.');
      }

      await saveGalleryItem({
        title: newTitle.trim(),
        barber: newBarber,
        category: newCategory,
        targetAudience: newAudience,
        imageUrl: finalImageUrl,
        description: newDescription.trim()
      });

      setStatusMessage({ 
        type: 'success', 
        text: `"${newTitle}" a été enregistrée avec succès dans la base de données Firebase!` 
      });

      // Reset form
      setNewTitle('');
      setNewImageUrl('');
      setNewDescription('');
      handleClearSelectedFile();
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err?.message || 'Erreur lors de l\'enregistrement de la photo dans Firestore.' 
      });
    } finally {
      setIsSavingImage(false);
      setIsUploadingFile(false);
    }
  };

  const handleDeleteImage = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Delete this photo from the Firestore database?')) {
      try {
        await deleteGalleryItem(id);
        setStatusMessage({ type: 'success', text: 'Photo deleted from Firestore database.' });
        await loadAllData();
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err?.message || 'Deletion error' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      
      {/* Header - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Public Site</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Direct Link: finalstop.org/admin</span>
            </span>

            <button
              type="button"
              onClick={loadAllData}
              className="text-xs text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 border border-white/10 px-3 py-1.5 rounded-sm cursor-pointer bg-transparent"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner & Master Barber Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Final Stop Administration Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Manage client reservations, real-time walk-in queue, and Firestore photo gallery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSeedFirestore}
              disabled={isSeeding}
              className="bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer rounded-sm"
              title="Seed initial Firestore data & curated photos"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Syncing...' : 'Sync Firestore Database'}</span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`mb-6 p-4 text-xs font-mono flex items-center justify-between gap-4 border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          
          {/* Card 1: Waitlist Toggle */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Walk-In Desk State</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className={`text-lg font-bold font-serif ${isWaitlistOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isWaitlistOpen ? 'OPEN (Walk-ins active)' : 'CLOSED (Appointments only)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleWaitlist}
              className="mt-2 text-xs font-bold uppercase tracking-wider py-2 px-3 border border-white/15 hover:border-gold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isWaitlistOpen ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
              <span>Toggle Walk-In Desk</span>
            </button>
          </div>

          {/* Card 2: Reservations count */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Total Bookings</span>
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {reservations.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Confirmed client slots
            </span>
          </div>

          {/* Card 3: Gallery Photos in Database */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Database Photos</span>
              <ImageIcon className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {galleryPhotos.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Mika (Braids) &bull; Lusca (Cuts)
            </span>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 font-bold ${
              activeTab === 'appointments'
                ? 'border-gold text-gold bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Appointments ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waitlist')}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 font-bold ${
              activeTab === 'waitlist'
                ? 'border-gold text-gold bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Walk-In Queue ({waitlist.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 font-bold flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-gold text-gold bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-gold" />
            <span>Photos Database ({galleryPhotos.length})</span>
          </button>
        </div>

        {/* TAB 1: Appointments Table */}
        {activeTab === 'appointments' && (
          <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                <span>Confirmed Bookings in Firestore ({reservations.length})</span>
              </h2>
              <span className="text-xs font-mono text-gray-400">
                Synced with Firestore
              </span>
            </div>

            {reservations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-mono">
                No appointments recorded at this moment. Click "Sync Firestore Database" to load sample bookings.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                      <th className="pb-3 pr-4">Ticket</th>
                      <th className="pb-3 px-4">Client</th>
                      <th className="pb-3 px-4">Barber</th>
                      <th className="pb-3 px-4">Service</th>
                      <th className="pb-3 px-4">Date & Time</th>
                      <th className="pb-3 px-4">Price</th>
                      <th className="pb-3 pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reservations.map((res: any, i) => (
                      <tr key={res.id || i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-4 text-gold font-bold">
                          {res.ticketId || res.id?.substring(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 text-white">
                          <div className="font-bold">{res.clientName}</div>
                          <div className="text-[10px] text-gray-400">{res.clientPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gold font-bold">
                          {res.barberName || res.barber}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          {res.serviceName || res.service}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          <div>{res.bookingDate || res.date}</div>
                          <div className="text-[10px] text-gold">{res.bookingTime || res.time}</div>
                        </td>
                        <td className="py-3.5 px-4 text-white font-bold">
                          ${res.price}
                        </td>
                        <td className="py-3.5 pl-4">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase font-bold">
                            {res.status || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Walk-In Queue Table */}
        {activeTab === 'waitlist' && (
          <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                <span>Live Walk-In Queue ({waitlist.length})</span>
              </h2>
              <span className="text-xs font-mono text-gray-400">
                Real-time queue desk
              </span>
            </div>

            {waitlist.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-mono">
                No clients currently waiting in the live queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                      <th className="pb-3 pr-4">Pos</th>
                      <th className="pb-3 px-4">Ticket</th>
                      <th className="pb-3 px-4">Client Name</th>
                      <th className="pb-3 px-4">Barber</th>
                      <th className="pb-3 px-4">Service</th>
                      <th className="pb-3 px-4">Check-in Time</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {waitlist.map((item, idx) => (
                      <tr key={item.id || item.ticketId || idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-4 text-gold font-bold">
                          #{idx + 1}
                        </td>
                        <td className="py-3.5 px-4 text-white font-bold">
                          {item.ticketId}
                        </td>
                        <td className="py-3.5 px-4 text-white">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-[10px] text-gray-400">{item.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gold font-bold">
                          {item.barber}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          {item.service}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">
                          {item.joinedAt}
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleServeTicket(item.id || item.ticketId)}
                            className="bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 px-2.5 py-1 text-[11px] uppercase font-bold transition-all cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Photos & Gallery Database */}
        {activeTab === 'gallery' && (
          <div className="space-y-10">
            
            {/* Add New Photo Form */}
            <div className="bg-[#141418] border border-gold/30 p-6 rounded-sm shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gold" />
                    <span>Add New Photo to Firestore Database</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload hairstyles with attribution (Mika for girls' braids, Lusca for boys' cuts).
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddGalleryItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Style Title */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Style Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Waist-Length Knotless Braids"
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
                  />
                </div>

                {/* Barber Assignment */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Master Barber Attribution *
                  </label>
                  <select
                    value={newBarber}
                    onChange={(e) => {
                      const val = e.target.value as 'Mika' | 'Lusca' | 'Both';
                      setNewBarber(val);
                      if (val === 'Mika') {
                        setNewAudience('Women & Girls (Braids)');
                        setNewCategory('Braids & Cornrows');
                      } else if (val === 'Lusca') {
                        setNewAudience('Men & Boys (Haircuts)');
                        setNewCategory('Skin Fades');
                      } else {
                        setNewAudience('Shop');
                        setNewCategory('The Shop');
                      }
                    }}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Mika">Mika (Master Braider &bull; Girls’ Braids & Locs)</option>
                    <option value="Lusca">Lusca (Master Barber &bull; Boys’ & Men’s Cuts)</option>
                    <option value="Both">Both (Mika & Lusca &bull; Barbershop Lounge)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Braids & Cornrows">Braids & Cornrows</option>
                    <option value="Locs & Twists">Locs & Twists</option>
                    <option value="Skin Fades">Skin Fades</option>
                    <option value="Beards & Shaves">Beards & Shaves</option>
                    <option value="The Shop">The Shop</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Audience Tag *
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Women & Girls (Braids)">Women & Girls (Braids)</option>
                    <option value="Men & Boys (Haircuts)">Men & Boys (Haircuts)</option>
                    <option value="Shop">Shop Facility</option>
                  </select>
                </div>

                {/* Direct Image File Upload & Camera Selector */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-mono text-gold font-bold block flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Importer la Photo Directement (Fichier ou Appareil Photo) *</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">PNG, JPG, WEBP jusqu'à 15 Mo</span>
                  </div>

                  {/* Hidden native input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-photo-file-input"
                  />

                  {/* Dropzone & Button */}
                  {!filePreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gold/40 hover:border-gold bg-[#0A0A0B] p-6 text-center cursor-pointer transition-all duration-200 group rounded-xs hover:bg-gold/5 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        Cliquez pour choisir une photo depuis votre téléphone ou ordinateur
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Prenez une photo en direct ou sélectionnez depuis votre galerie
                      </p>
                    </div>
                  ) : (
                    <div className="relative p-3 bg-black border border-gold/60 rounded-xs flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={filePreview} 
                          alt="Selected preview" 
                          className="w-16 h-16 object-cover border border-gold/50 rounded-xs"
                        />
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                            {selectedFile?.name}
                          </p>
                          <p className="text-[10px] font-mono text-gold mt-0.5">
                            {(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0)} Mo &bull; Prête pour le téléversement
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="Supprimer la photo sélectionnée"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Alternative URL Link (Optional fallback) */}
                  <div className="pt-2 border-t border-white/10">
                    <details className="group">
                      <summary className="text-[11px] font-mono text-gray-400 cursor-pointer hover:text-gold flex items-center gap-1">
                        <span>Ou coller une URL d'image existante (Optionnel)</span>
                      </summary>
                      <div className="mt-2 space-y-2 pl-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => {
                            setNewImageUrl(e.target.value);
                            if (e.target.value) handleClearSelectedFile();
                          }}
                          placeholder="https://i.ibb.co/... ou lien Cloudflare / CDN"
                          className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                        {newImageUrl && (
                          <div className="flex items-center gap-2 p-1.5 bg-black border border-white/10 rounded-xs">
                            <img 
                              src={newImageUrl} 
                              alt="Preview URL" 
                              className="w-10 h-10 object-cover border border-gold/40"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="text-[10px] font-mono text-gray-400">Aperçu via URL</span>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Technique & Style Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe the parting technique, tension control, fade millimeter precision, products used, or styling advice..."
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingImage || isUploadingFile}
                    className="bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs px-6 py-3 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-60"
                  >
                    <Upload className={`w-4 h-4 ${(isSavingImage || isUploadingFile) ? 'animate-bounce' : ''}`} />
                    <span>
                      {isUploadingFile 
                        ? 'Téléversement de la photo...' 
                        : isSavingImage 
                        ? 'Enregistrement dans Firebase...' 
                        : 'Enregistrer la photo dans la galerie'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Current Photos in Firestore Grid */}
            <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gold" />
                  <span>Photos Active in Database ({galleryPhotos.length})</span>
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  Visible to public clients
                </span>
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs font-mono">
                  No photos found in database. Click "Sync Firestore Database" above to load initial portfolio.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryPhotos.map((photo, i) => (
                    <div 
                      key={photo.id || i}
                      className="bg-[#0A0A0B] border border-white/10 hover:border-gold/40 transition-all rounded-xs overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-video relative overflow-hidden bg-black">
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 text-gold text-[10px] font-mono px-2 py-0.5 border border-white/20">
                          {photo.barber}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/80 text-gray-300 text-[9px] font-mono px-2 py-0.5 border border-white/20">
                          {photo.category}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-serif font-bold text-white mb-1">
                            {photo.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono block mb-2">
                            Audience: {photo.targetAudience}
                          </span>
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                            {photo.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-500">
                            {photo.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(photo.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 text-[11px] font-mono"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
