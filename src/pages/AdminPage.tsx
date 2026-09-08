import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Trash2, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  AlertTriangle,
  Server,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  getReservations, 
  getWaitlistQueue, 
  seedFirestoreDatabase, 
  setShopWaitlistOpen, 
  updateWaitlistStatus, 
  FirestoreReservation, 
  FirestoreWaitlistEntry 
} from '../lib/firestoreService';
import config from '../../firebase-applet-config.json';

interface AdminPageProps {
  onBackToHome: () => void;
  isWaitlistOpen: boolean;
  onWaitlistToggle: (isOpen: boolean) => void;
}

export default function AdminPage({
  onBackToHome,
  isWaitlistOpen,
  onWaitlistToggle
}: AdminPageProps) {
  const [reservations, setReservations] = useState<FirestoreReservation[]>([]);
  const [waitlist, setWaitlist] = useState<FirestoreWaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [resList, wlList] = await Promise.all([
        getReservations(),
        getWaitlistQueue()
      ]);
      setReservations(resList);
      setWaitlist(wlList);
    } catch (err) {
      console.error('Error loading Firestore admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedFirestoreDatabase();
      if (result.success) {
        setSeedMessage('Succès : Données synchronisées et écrites dans Firestore !');
        await loadAllData();
      } else {
        setSeedMessage(`Note : ${result.message}`);
      }
    } catch (err: any) {
      setSeedMessage(`Erreur : ${err?.message || 'Impossible d\'écrire dans Firestore'}`);
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
            <span>Retour au Site</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firestore ID: {config.projectId}</span>
            </span>

            <button
              type="button"
              onClick={loadAllData}
              className="text-xs text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 border border-white/10 px-3 py-1.5 rounded-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Console de Données & Gestion Gérant</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Espace Base de Données Firestore
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Visualisez et gérez toutes les réservations, la file d'attente walk-in et l'état du salon en direct.
            </p>
          </div>

          {/* Seed button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleSeedFirestore}
              disabled={isSeeding}
              className="bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider px-5 py-3 flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer rounded-sm"
              title="Écrit les données initiales dans Firestore pour alimenter votre console Firebase"
            >
              <Sparkles className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Écriture en cours...' : 'Initialiser / Remplir Firestore'}</span>
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="mb-8 p-4 bg-[#141418] border border-gold/50 text-xs font-mono text-gold flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{seedMessage}</span>
            </div>
            <button 
              type="button"
              onClick={() => setSeedMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Waitlist Toggle */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">File d'Attente Salon</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className={`text-xl font-bold font-serif ${isWaitlistOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isWaitlistOpen ? 'OUVERTE (Clients acceptés)' : 'FERMÉE (RDV uniquement)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleWaitlist}
              className="mt-2 text-xs font-bold uppercase tracking-wider py-2 px-3 border border-white/15 hover:border-gold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isWaitlistOpen ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
              <span>Basculer l'état de la file</span>
            </button>
          </div>

          {/* Card 2: Reservations count */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Réservations Enregistrées</span>
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {reservations.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Stockées dans la collection <code className="text-gold">/reservations</code>
            </span>
          </div>

          {/* Card 3: Waitlist clients count */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Clients en File Walk-in</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {waitlist.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Stockés dans la collection <code className="text-gold">/waitlist</code>
            </span>
          </div>

        </div>

        {/* Section 1: Live Reservations Table */}
        <div className="bg-[#141418] border border-white/10 p-6 mb-10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              <span>Rendez-Vous & Réservations Clients ({reservations.length})</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              Synchronisé avec Firestore
            </span>
          </div>

          {reservations.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs font-mono">
              Aucune réservation pour le moment. Cliquez sur "Initialiser / Remplir Firestore" pour insérer des exemples.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                    <th className="pb-3 pr-4">Ticket / ID</th>
                    <th className="pb-3 px-4">Client</th>
                    <th className="pb-3 px-4">Barbier</th>
                    <th className="pb-3 px-4">Prestation</th>
                    <th className="pb-3 px-4">Date & Heure</th>
                    <th className="pb-3 px-4">Tarif</th>
                    <th className="pb-3 pl-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reservations.map((res, i) => (
                    <tr key={res.id || i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-4 text-gold font-bold">
                        {res.ticketId || res.id?.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        <div className="font-bold">{res.clientName}</div>
                        <div className="text-[10px] text-gray-400">{res.clientPhone || res.clientEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gold">
                        {res.barber}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {res.service}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        <div>{res.date}</div>
                        <div className="text-[10px] text-gray-400">{res.time}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gold font-bold">
                        {res.price}
                      </td>
                      <td className="py-3.5 pl-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase font-bold">
                          {res.status || 'Confirmé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Walk-In Queue Table */}
        <div className="bg-[#141418] border border-white/10 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              <span>File d'Attente Walk-In Actuelle ({waitlist.length})</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              Temps Réel
            </span>
          </div>

          {waitlist.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs font-mono">
              Aucun client en attente dans la file.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                    <th className="pb-3 pr-4">Pos</th>
                    <th className="pb-3 px-4">Ticket</th>
                    <th className="pb-3 px-4">Nom Client</th>
                    <th className="pb-3 px-4">Barbier Choisi</th>
                    <th className="pb-3 px-4">Prestation</th>
                    <th className="pb-3 px-4">Heure Arrivée</th>
                    <th className="pb-3 pl-4 text-right">Actions Gérant</th>
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
                          Marquer Servi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
