import { useState, useEffect, FormEvent } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Calendar, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Scissors
} from 'lucide-react';
import { 
  getWaitlistQueue, 
  saveWaitlistEntry, 
  FirestoreWaitlistEntry, 
  ensureFirebaseAuth 
} from '../lib/firestoreService';
import { MASTER_BARBERS } from '../data/barbers';
import CallShopModal from '../components/CallShopModal';

interface WaitlistPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  initialBarber?: string;
  isWaitlistOpen?: boolean;
}

export default function WaitlistPage({
  onBackToHome,
  onNavigateToBooking,
  initialBarber,
  isWaitlistOpen = true
}: WaitlistPageProps) {
  const [queue, setQueue] = useState<FirestoreWaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(
    initialBarber === 'lusca' ? 'Lusca' : initialBarber === 'mika' ? 'Mika' : 'First Available'
  );
  const [selectedService, setSelectedService] = useState('Skin Fade & Precision Haircut ($35)');
  const [activeTicket, setActiveTicket] = useState<FirestoreWaitlistEntry | null>(null);

  // Load queue
  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await getWaitlistQueue();
      setQueue(data);
    } catch (err) {
      console.warn('Error loading waitlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Check if user already has an active ticket locally
    try {
      const saved = localStorage.getItem('finalstop_active_ticket');
      if (saved) {
        setActiveTicket(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketId = 'FS-' + Math.floor(100 + Math.random() * 900);
      const position = queue.length + 1;
      const estMinutes = position * 15;

      const newEntry: Omit<FirestoreWaitlistEntry, 'id'> = {
        ticketId,
        name: clientName.trim(),
        phone: clientPhone.trim(),
        barber: selectedBarber,
        service: selectedService,
        position,
        estMinutes,
        status: 'waiting',
        joinedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      const docId = await saveWaitlistEntry(newEntry);
      const fullTicket = { ...newEntry, id: docId };

      setActiveTicket(fullTicket);
      localStorage.setItem('finalstop_active_ticket', JSON.stringify(fullTicket));
      await fetchQueue();
    } catch (err) {
      console.error('Failed to join waitlist:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Retour à l'Accueil</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchQueue}
              className="text-xs text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5 border border-white/10 px-3 py-1.5 rounded-sm"
              title="Rafraîchir la file"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Actualiser la file</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Réserver avec créneau fixe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            File d'Attente Directe en Temps Réel
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Digital Walk-In Lounge & Queue
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-3"></div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Pas de rendez-vous ? Enregistrez-vous en direct dans la file d'attente de Mika ou Lusca (plus de 20 ans d'expérience). Suivez votre position et rejoignez le salon quand votre tour approche.
          </p>
        </div>

        {/* Active Ticket Banner if already joined */}
        {activeTicket && (
          <div className="bg-[#121215] border-2 border-gold p-6 sm:p-8 mb-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Votre Ticket de File d'Attente Actif</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Ticket #{activeTicket.ticketId} &bull; {activeTicket.name}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Barbier : <span className="text-gold font-bold">{activeTicket.barber}</span> &bull; Service : {activeTicket.service}
                </p>
              </div>

              <div className="text-right shrink-0 bg-gold/10 border border-gold/30 px-4 py-2 rounded-sm">
                <span className="text-[10px] uppercase font-mono text-gold block">Position</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  #{activeTicket.position}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">~{activeTicket.estMinutes} min</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Live Queue Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141418] border border-white/10 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-gold" />
                    <span>File en Direct au Salon</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-mono">
                    Synchronisé en temps réel avec la base de données Firestore
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {isWaitlistOpen ? 'File Ouverte' : 'File Temporairement Fermée'}
                  </span>
                </div>
              </div>

              {/* Queue Items */}
              {isLoading ? (
                <div className="py-12 text-center text-gray-500 font-mono text-sm">
                  Chargement de la file d'attente...
                </div>
              ) : queue.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-10 h-10 text-gold/40 mx-auto mb-3" />
                  <h3 className="text-base font-serif font-bold text-white mb-1">Aucune attente actuellement !</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Le salon est prêt à vous accueillir immédiatement. Soyez le premier sur le fauteuil.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item, idx) => (
                    <div
                      key={item.id || item.ticketId || idx}
                      className={`p-4 border flex items-center justify-between transition-all ${
                        item.status === 'in-chair'
                          ? 'bg-gold/10 border-gold/50 text-white shadow-md'
                          : 'bg-[#18181D] border-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                          item.status === 'in-chair'
                            ? 'bg-gold text-black'
                            : 'bg-white/10 text-gold border border-white/10'
                        }`}>
                          #{idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">({item.ticketId})</span>
                            {item.status === 'in-chair' && (
                              <span className="text-[10px] bg-gold text-black font-bold uppercase px-1.5 py-0.5 rounded-xs">
                                Au Fauteuil
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            Barbier : <strong className="text-gold">{item.barber}</strong> &bull; {item.service}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs text-gold block font-bold">
                          {item.status === 'in-chair' ? 'En cours' : `~${(idx + 1) * 15} min`}
                        </span>
                        <span className="text-[10px] text-gray-500">Inscrit à {item.joinedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Join Waitlist Form */}
          <div className="space-y-6">
            <div className="bg-[#141418] border border-white/10 p-6">
              <h2 className="text-lg font-serif font-bold text-white mb-1 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-gold" />
                <span>Rejoindre la File d'Attente</span>
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Enregistrez votre nom et numéro. Vous recevrez un ticket direct.
              </p>

              <form onSubmit={handleJoin} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Votre Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="ex. Marcus Taylor"
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Téléphone mobile (pour SMS) *</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(619) 555-0199"
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Barbier souhaité *</label>
                  <select
                    value={selectedBarber}
                    onChange={(e) => setSelectedBarber(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none"
                  >
                    <option value="First Available">Premier Barbier Disponible (Plus rapide)</option>
                    <option value="Mika">Mika (20+ ans &bull; Fades & Rasoir)</option>
                    <option value="Lusca">Lusca (20+ ans &bull; Barbe, Soins & Tresses)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Prestation choisie *</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none"
                  >
                    <option value="Skin Fade & Precision Haircut ($35)">Skin Fade & Precision Haircut ($35)</option>
                    <option value="Beard Sculpting & Hot Lather Shave ($25)">Beard Sculpting & Hot Lather Shave ($25)</option>
                    <option value="The Signature Master Combo : Cut + Beard ($55)">The Signature Master Combo ($55)</option>
                    <option value="Custom Braids & Cornrows ($65+)">Custom Braids & Cornrows ($65+)</option>
                    <option value="Dreadlocks & Full Retwist ($75+)">Dreadlocks Retwist ($75+)</option>
                    <option value="VIP Prestige Grooming ($90)">VIP Prestige Grooming ($90)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isWaitlistOpen}
                  className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold uppercase tracking-widest py-3 transition-all cursor-pointer rounded-sm shadow-md mt-2"
                >
                  {isSubmitting ? 'Enregistrement Firestore...' : 'Obtenir Mon Ticket'}
                </button>
              </form>
            </div>

            {/* Quick Assistance Box */}
            <div className="bg-[#121215] border border-white/10 p-5 font-mono text-xs">
              <span className="text-gold font-bold uppercase block mb-1">Besoin d'aide immédiate ?</span>
              <p className="text-gray-400 text-[11px] mb-3">
                Appelez nos lignes directes au salon pour connaître l'affluence exacte en direct.
              </p>
              <button
                type="button"
                onClick={() => setIsCallModalOpen(true)}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/15 py-2.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Appeler (619) 886-1267</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}
