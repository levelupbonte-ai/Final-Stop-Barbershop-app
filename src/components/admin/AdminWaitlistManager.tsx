import { useState } from 'react';
import { 
  Users, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Scissors, 
  AlertCircle, 
  Calendar, 
  RefreshCw,
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';
import { 
  FirestoreWaitlistEntry, 
  updateWaitlistStatus, 
  moveWaitlistToFront, 
  reorderWaitlistQueue,
  archiveOldWaitlistTickets
} from '../../lib/firestoreService';

interface AdminWaitlistManagerProps {
  waitlist: FirestoreWaitlistEntry[];
  onRefresh: () => Promise<void>;
  isWaitlistOpen: boolean;
  onToggleWaitlist: () => Promise<void>;
}

export default function AdminWaitlistManager({
  waitlist,
  onRefresh,
  isWaitlistOpen,
  onToggleWaitlist
}: AdminWaitlistManagerProps) {
  // Today filter (default to today as requested: "mettre la liste d'attente du jour pas celui de tout le monde")
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredWaitlist = waitlist.filter((entry) => {
    // Date filter
    if (dateFilter === 'today') {
      const entryDate = entry.joinedDate || (entry.createdAt ? entry.createdAt.split('T')[0] : '');
      if (entryDate && entryDate !== todayStr) {
        return false;
      }
    }

    // Barber filter
    if (barberFilter !== 'all') {
      const entryBarber = entry.barber || '';
      if (!entryBarber.toLowerCase().includes(barberFilter.toLowerCase())) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === 'active') {
      return entry.status === 'waiting' || entry.status === 'called' || entry.status === 'in-chair';
    } else if (statusFilter === 'all') {
      return true;
    } else {
      return entry.status === statusFilter;
    }
  });

  const handleStatusUpdate = async (docId: string, nextStatus: FirestoreWaitlistEntry['status']) => {
    setActionLoadingId(docId);
    try {
      await updateWaitlistStatus(docId, nextStatus);
      setNotification({
        type: 'success',
        text: `Statut mis à jour : ${nextStatus}.`
      });
      await onRefresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'Erreur lors du changement de statut.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveToFront = async (docId: string, clientName: string) => {
    setActionLoadingId(docId);
    try {
      await moveWaitlistToFront(docId);
      setNotification({
        type: 'success',
        text: `${clientName} a été placé en tête de file (Position #1) !`
      });
      await onRefresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'Erreur lors du déplacement en tête de file.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredWaitlist.length) return;

    const currentEntry = filteredWaitlist[index];
    const targetEntry = filteredWaitlist[targetIndex];

    if (!currentEntry.id || !targetEntry.id) return;

    setActionLoadingId(currentEntry.id);
    try {
      await reorderWaitlistQueue(currentEntry.id, direction);
      await onRefresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'Erreur lors du réordonnancement.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchiveOldTickets = async () => {
    if (!window.confirm("Archiver tous les anciens tickets et repartir sur une file d'attente propre pour aujourd'hui ?")) {
      return;
    }
    try {
      await archiveOldWaitlistTickets();
      setNotification({
        type: 'success',
        text: "File d'attente mise à jour : seuls les tickets actifs du jour sont conservés."
      });
      await onRefresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || "Erreur lors de l'archivage des anciens tickets."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-[#141418] border border-white/10 p-5 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-serif font-bold text-white">
              Gestion de la File d'Attente Walk-In ({filteredWaitlist.length})
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Ordonnez la file en temps réel, faites passer un client prioritaire devant, et changez les étapes de progression.
          </p>
        </div>

        {/* Desk Open/Closed Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleWaitlist}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm ${
              isWaitlistOpen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isWaitlistOpen ? 'bg-white animate-pulse' : 'bg-red-400'}`} />
            <span>{isWaitlistOpen ? 'File Ouverte aux Inscriptions' : 'File Fermée (Complet)'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xs text-xs font-mono flex items-center justify-between gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/40 border border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar: Date, Barber, Status */}
      <div className="bg-[#18181E] border border-white/10 p-4 rounded-xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        
        {/* Date Selector (Day vs All) */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold uppercase text-[10px]">Affichage :</span>
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-xs cursor-pointer transition-colors ${
              dateFilter === 'today'
                ? 'bg-gold text-black font-bold shadow-xs'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            Aujourd'hui ({todayStr})
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-xs cursor-pointer transition-colors ${
              dateFilter === 'all'
                ? 'bg-gold text-black font-bold shadow-xs'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            Toutes les dates
          </button>
        </div>

        {/* Barber filter */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold uppercase text-[10px]">Barbier :</span>
          <select
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="bg-black/60 border border-white/20 focus:border-gold px-2.5 py-1.5 text-xs text-white rounded-xs outline-none"
          >
            <option value="all">Tous les barbiers</option>
            <option value="Lusca">Lusca (Coupes)</option>
            <option value="Mika">Mika (Tresses)</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold uppercase text-[10px]">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/20 focus:border-gold px-2.5 py-1.5 text-xs text-white rounded-xs outline-none"
          >
            <option value="active">En attente / Au fauteuil</option>
            <option value="all">Tous les tickets</option>
            <option value="waiting">En attente uniquement</option>
            <option value="served">Servis / Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>

        {/* Clean / Reset Day Waitlist Button */}
        <div>
          <button
            type="button"
            onClick={handleArchiveOldTickets}
            className="px-3 py-1.5 bg-white/5 hover:bg-gold/20 text-gray-300 hover:text-gold border border-white/15 hover:border-gold/50 rounded-xs text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Archiver les tickets passés et commencer une nouvelle file d'attente du jour"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>File du Jour Uniquement (Nettoyer)</span>
          </button>
        </div>

      </div>

      {/* Queue List Table */}
      <div className="bg-[#141418] border border-white/10 rounded-xs overflow-hidden">
        {filteredWaitlist.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400 space-y-2">
            <Clock className="w-8 h-8 text-gold/60 mx-auto" />
            <p>
              {dateFilter === 'today'
                ? "Aucun client dans la file d'attente d'aujourd'hui."
                : "Aucun client enregistré dans cette catégorie."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredWaitlist.map((entry, index) => {
              const isLoadingThis = actionLoadingId === entry.id;
              const isFront = index === 0 && (entry.status === 'waiting' || entry.status === 'called');

              return (
                <div 
                  key={entry.id || index}
                  className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isFront 
                      ? 'bg-gold/5 border-l-4 border-l-gold' 
                      : entry.status === 'in-chair'
                      ? 'bg-purple-950/20 border-l-4 border-l-purple-500'
                      : entry.status === 'served'
                      ? 'opacity-60 bg-black/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Left: Position, Ticket, Client Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Position Badge & Reorder arrows */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <span className={`w-9 h-9 rounded-xs flex items-center justify-center font-mono font-bold text-sm border ${
                        isFront
                          ? 'bg-gold text-black border-gold shadow-md'
                          : entry.status === 'in-chair'
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-black/60 text-white border-white/15'
                      }`}>
                        #{entry.position || (index + 1)}
                      </span>

                      {/* Up/Down buttons if active */}
                      {(entry.status === 'waiting' || entry.status === 'called') && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            type="button"
                            disabled={index === 0 || isLoadingThis}
                            onClick={() => handleMoveOrder(index, 'up')}
                            className="p-1 bg-white/5 hover:bg-gold hover:text-black text-gray-400 rounded-xs disabled:opacity-20 cursor-pointer"
                            title="Monter d'une place"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === filteredWaitlist.length - 1 || isLoadingThis}
                            onClick={() => handleMoveOrder(index, 'down')}
                            className="p-1 bg-white/5 hover:bg-gold hover:text-black text-gray-400 rounded-xs disabled:opacity-20 cursor-pointer"
                            title="Descendre d'une place"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Client info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-serif font-bold text-white">
                          {entry.name}
                        </span>
                        <span className="text-[11px] font-mono text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-xs font-bold">
                          {entry.ticketId || `FS-${index + 100}`}
                        </span>
                        {isFront && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-xs uppercase tracking-wider animate-pulse">
                            &bull; Prochain au Fauteuil
                          </span>
                        )}
                        {entry.status === 'in-chair' && (
                          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded-xs uppercase tracking-wider">
                            &bull; Au Fauteuil Actuellement
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 font-mono">
                        <strong className="text-white">{entry.service}</strong> &bull; Barbier : <span className="text-gold font-bold">{entry.barber || 'Mika/Lusca'}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono flex-wrap">
                        {entry.phone && (
                          <a href={`tel:${entry.phone}`} className="hover:text-gold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gold" />
                            <span>{entry.phone}</span>
                          </a>
                        )}
                        <span>Temps estimé : ~{entry.estMinutes || 15} min</span>
                        <span>Date : {entry.joinedDate || todayStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 4-Step Progress Bar (Client & Admin sync) */}
                  <div className="w-full lg:w-72 bg-black/40 p-2.5 rounded-xs border border-white/10">
                    <span className="text-[9px] font-mono uppercase text-gray-400 block mb-1 font-bold">
                      Barre de progression en direct :
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-mono">
                      <div className="bg-white/10 text-gray-300 py-1 rounded-xs">
                        1. Inscrit
                      </div>
                      <div className={`py-1 rounded-xs font-bold ${
                        entry.status === 'waiting'
                          ? 'bg-gold text-black'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        2. En File
                      </div>
                      <div className={`py-1 rounded-xs font-bold ${
                        (entry.status === 'called' || entry.status === 'in-chair')
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-500'
                      }`}>
                        3. Fauteuil
                      </div>
                      <div className={`py-1 rounded-xs font-bold ${
                        entry.status === 'served'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-gray-500'
                      }`}>
                        4. Fini
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                    
                    {/* "Passer Devant" button for priority */}
                    {index > 0 && entry.status === 'waiting' && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleMoveToFront(entry.id!, entry.name)}
                        className="px-2.5 py-1.5 bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Placer immédiatement en tête de file (Position #1)"
                      >
                        <ChevronsUp className="w-3.5 h-3.5" />
                        <span>Passer Devant (#1)</span>
                      </button>
                    )}

                    {/* Step: Call / Place in Chair */}
                    {entry.status === 'waiting' && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleStatusUpdate(entry.id!, 'in-chair')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-mono font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Au Fauteuil</span>
                      </button>
                    )}

                    {/* Step: Terminer / Complete */}
                    {(entry.status === 'waiting' || entry.status === 'called' || entry.status === 'in-chair') && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleStatusUpdate(entry.id!, 'served')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terminé</span>
                      </button>
                    )}

                    {/* Cancel status */}
                    {(entry.status === 'waiting' || entry.status === 'called') && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleStatusUpdate(entry.id!, 'cancelled')}
                        className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] font-mono uppercase rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Annuler ce ticket"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Annuler</span>
                      </button>
                    )}

                    {/* Re-open if cancelled or served */}
                    {(entry.status === 'cancelled' || entry.status === 'served') && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleStatusUpdate(entry.id!, 'waiting')}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-mono uppercase rounded-xs cursor-pointer"
                      >
                        Remettre en file
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
