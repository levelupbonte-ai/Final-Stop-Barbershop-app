import { useState, useEffect, FormEvent } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Scissors, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWaitlist?: () => void;
  initialQuery?: string;
  isWaitlistOpen?: boolean;
  onNavigateToBooking?: () => void;
}

export default function CheckStatusModal({ 
  isOpen, 
  onClose, 
  onOpenWaitlist, 
  initialQuery = '',
  isWaitlistOpen = false,
  onNavigateToBooking
}: CheckStatusModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
      return;
    }

    // Auto-check if client has a cached ticket or appointment in localStorage
    const savedTicket = localStorage.getItem('finalstop_active_ticket');
    const savedBooking = localStorage.getItem('finalstop_active_booking');
    
    if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);
        setResult(parsed);
      } catch (e) {
        // ignore
      }
    } else if (savedBooking) {
      try {
        const parsed = JSON.parse(savedBooking);
        setResult(parsed);
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const performSearch = async (term: string) => {
    const queryStr = term.trim().toLowerCase();
    if (!queryStr) return;

    setIsSearching(true);
    setNotFound(false);
    setResult(null);

    try {
      let foundData: any = null;

      // 1. Search in waitlist collection
      try {
        const waitlistRef = collection(db, 'waitlist');
        const snap = await getDocs(waitlistRef);
        snap.forEach((doc) => {
          const data = doc.data();
          const nameMatch = data.name && data.name.toLowerCase().includes(queryStr);
          const idMatch = data.ticketId && data.ticketId.toLowerCase().includes(queryStr);
          const phoneMatch = data.phone && data.phone.toLowerCase().includes(queryStr);

          if (nameMatch || idMatch || phoneMatch) {
            foundData = { ...data, type: 'waitlist' };
          }
        });
      } catch (err) {
        console.warn('Firestore waitlist search fallback:', err);
      }

      // 2. If not found in waitlist, search in reservations collection
      if (!foundData) {
        try {
          const resRef = collection(db, 'reservations');
          const snap = await getDocs(resRef);
          snap.forEach((doc) => {
            const data = doc.data();
            const nameMatch = (data.fullName && data.fullName.toLowerCase().includes(queryStr)) ||
                              (data.name && data.name.toLowerCase().includes(queryStr));
            const idMatch = (data.ticketId && data.ticketId.toLowerCase().includes(queryStr)) ||
                            (doc.id && doc.id.toLowerCase().includes(queryStr));
            const phoneMatch = data.phone && data.phone.toLowerCase().includes(queryStr);

            if (nameMatch || idMatch || phoneMatch) {
              foundData = { 
                ...data, 
                ticketId: data.ticketId || doc.id.substring(0, 7).toUpperCase(),
                name: data.fullName || data.name,
                type: 'reservation' 
              };
            }
          });
        } catch (err) {
          console.warn('Firestore reservations search fallback:', err);
        }
      }

      // 3. Fallback to localStorage check
      if (!foundData) {
        const savedTicket = localStorage.getItem('finalstop_active_ticket');
        const savedBooking = localStorage.getItem('finalstop_active_booking');
        
        if (savedTicket) {
          const parsed = JSON.parse(savedTicket);
          if (
            parsed.name?.toLowerCase().includes(queryStr) || 
            parsed.ticketId?.toLowerCase().includes(queryStr) ||
            parsed.phone?.toLowerCase().includes(queryStr)
          ) {
            foundData = parsed;
          }
        } else if (savedBooking) {
          const parsed = JSON.parse(savedBooking);
          if (
            parsed.fullName?.toLowerCase().includes(queryStr) ||
            parsed.name?.toLowerCase().includes(queryStr) ||
            parsed.ticketId?.toLowerCase().includes(queryStr) ||
            parsed.id?.toLowerCase().includes(queryStr)
          ) {
            foundData = parsed;
          }
        }
      }

      if (foundData) {
        setResult(foundData);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleRefresh = async () => {
    if (!result) return;
    setIsSearching(true);
    try {
      const idToFind = result.ticketId || result.id;
      if (idToFind) {
        await performSearch(idToFind);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const isWaitlist = result?.type !== 'reservation';
  const waitlistStatus = result?.status || 'waiting';
  const resStatus = result?.status || 'confirmed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div 
        id="check-status-modal-content"
        className="bg-[#151517] border border-gold/40 w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer border-none bg-transparent"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
              Suivi en Direct &bull; Rendez-vous & File d'attente
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-1.5">
            Statut de ma Réservation / Ticket
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Entrez votre <strong>nom</strong> ou <strong>numéro de ticket</strong> (ex: FS-102, RES-892) pour suivre en direct votre avancée et l'état de votre fauteuil.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom ou Ticket ID (ex: Thomas, FS-102)"
                className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none font-mono"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gold hover:bg-gold-light disabled:opacity-40 text-black px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isSearching ? 'Vérification...' : 'Vérifier'}
            </button>
          </div>
        </form>

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Aucun enregistrement actif trouvé pour "{searchQuery}"</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
              {isWaitlistOpen 
                ? "Vérifiez l'orthographe ou le numéro de téléphone, ou rejoignez directement la file d'attente sans rendez-vous."
                : "Vérifiez votre nom ou numéro de ticket. Vous pouvez également réserver votre créneau directement en ligne."}
            </p>
            <div className="pl-6 pt-1 flex gap-4">
              {isWaitlistOpen && onOpenWaitlist ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWaitlist();
                  }}
                  className="text-xs text-gold underline font-bold uppercase tracking-wider hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Rejoindre la File d'Attente &rarr;
                </button>
              ) : onNavigateToBooking ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToBooking();
                  }}
                  className="text-xs text-gold underline font-bold uppercase tracking-wider hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Prendre un Rendez-vous &rarr;
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result ? (
          <div className="bg-[#0A0A0B] border border-gold/50 p-6 space-y-5 rounded-xs">
            
            {/* Header / Ticket Badge */}
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  {result.type === 'reservation' ? 'Rendez-vous Programmé' : 'Ticket File d’Attente Live'}
                </span>
                <p className="text-xl font-mono font-bold text-gold mt-0.5">
                  #{result.ticketId || 'CONFIRMÉ'}
                </p>
                <p className="text-sm text-white font-medium flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>{result.name || result.fullName || result.clientName}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">Barbier Assigné</span>
                <span className="text-xs text-gray-200 font-mono font-bold block mt-0.5">
                  {result.barber || 'Mika & Lusca (Final Stop)'}
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">
                  {result.service}
                </span>
                {result.date && (
                  <span className="text-[10px] font-mono text-gold block mt-0.5">
                    {result.date} à {result.time}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Status Box */}
            {isWaitlist ? (
              <div className={`p-4 border rounded-xs ${
                waitlistStatus === 'in-chair'
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                  : (waitlistStatus === 'called' || result.position === 1)
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : waitlistStatus === 'served'
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                  : waitlistStatus === 'cancelled'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : 'bg-[#151517] border-gold/30 text-gray-300'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {(waitlistStatus === 'called' || result.position === 1) ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
                    ) : waitlistStatus === 'in-chair' ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-pulse"></div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-gold"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {waitlistStatus === 'in-chair'
                        ? "AU FAUTEUIL &bull; Coupe / Soin en cours d'exécution"
                        : (waitlistStatus === 'called' || result.position === 1)
                        ? "VOUS ÊTES LE PROCHAIN ! Veuillez vous approcher du comptoir"
                        : waitlistStatus === 'served'
                        ? "PRESTATION TERMINÉE &bull; Merci de votre confiance"
                        : waitlistStatus === 'cancelled'
                        ? "TICKET ANNULÉ PAR LE SALON"
                        : `Vous êtes actuellement position #${result.position || 2} dans la file`}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {waitlistStatus === 'in-chair'
                        ? "Profitez de votre prestation avec notre maître barbier."
                        : (waitlistStatus === 'called' || result.position === 1)
                        ? "Votre barbier prépare les serviettes chaudes et les instruments. Vous serez pris en charge immédiatement."
                        : waitlistStatus === 'served'
                        ? "Nous espérons que votre nouvelle coupe vous plaît !"
                        : waitlistStatus === 'cancelled'
                        ? "Ce ticket a été clôturé ou annulé. Contactez le salon pour toute question."
                        : `Temps d'attente estimé : ~${result.estMinutes || 15} minutes. Restez attentif(ve) à l'appel de votre nom.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 border rounded-xs ${
                resStatus === 'completed'
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                  : resStatus === 'confirmed'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : resStatus === 'cancelled'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : 'bg-[#151517] border-gold/30 text-gray-300'
              }`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {resStatus === 'completed'
                        ? "RENDEZ-VOUS TERMINÉ"
                        : resStatus === 'cancelled'
                        ? "RENDEZ-VOUS ANNULÉ"
                        : "RENDEZ-VOUS CONFIRMÉ & ENREGISTRÉ"}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {resStatus === 'completed'
                        ? "Merci de votre visite chez Final Stop !"
                        : resStatus === 'cancelled'
                        ? "Ce rendez-vous a été annulé."
                        : `Votre créneau pour ${result.service} est validé avec ${result.barber || 'votre barbier'}. Présentez-vous 5 minutes avant l'heure prévue.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4-Step Visual Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2 font-bold uppercase tracking-wider">
                <span>Barre de progression en direct :</span>
                <span className="text-gold">Mise à jour en temps réel</span>
              </div>

              {isWaitlist ? (
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                  <div className="bg-white/10 text-gray-300 py-2 border border-white/10 rounded-xs">
                    1. Inscrit
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    (result.position > 1 && waitlistStatus === 'waiting')
                      ? 'bg-gold text-black font-bold border-gold shadow-sm'
                      : (waitlistStatus === 'called' || waitlistStatus === 'in-chair' || waitlistStatus === 'served')
                      ? 'bg-gold/20 text-gold border-gold/40'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    2. En File (#{result.position || '1'})
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    (waitlistStatus === 'called' || (result.position === 1 && waitlistStatus === 'waiting'))
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md'
                      : (waitlistStatus === 'in-chair' || waitlistStatus === 'served')
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    3. Au Fauteuil
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    waitlistStatus === 'served'
                      ? 'bg-blue-500 text-white font-bold border-blue-400'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    4. Terminé
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                  <div className="bg-white/10 text-gray-300 py-2 border border-white/10 rounded-xs">
                    1. Reçue
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    resStatus === 'confirmed'
                      ? 'bg-gold text-black font-bold border-gold shadow-sm'
                      : resStatus === 'completed'
                      ? 'bg-gold/20 text-gold border-gold/40'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    2. Confirmé
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    resStatus === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    3. Prêt au Salon
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    resStatus === 'completed'
                      ? 'bg-blue-500 text-white font-bold border-blue-400'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    4. Terminé
                  </div>
                </div>
              )}
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Système Central Final Stop Sécurisé</span>
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isSearching}
                className="text-gold hover:text-gold-light flex items-center gap-1.5 font-bold cursor-pointer transition-colors bg-transparent border-none"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                <span>Rafraîchir le Statut</span>
              </button>
            </div>

          </div>
        ) : (
          !notFound && (
            <div className="bg-[#0A0A0B] border border-white/5 p-6 text-center text-xs text-gray-400 space-y-3 rounded-xs">
              <Clock className="w-8 h-8 text-gold/60 mx-auto" />
              <p>
                Consultez à tout moment la position de votre ticket ou la confirmation de votre créneau avec Mika et Lusca.
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}
