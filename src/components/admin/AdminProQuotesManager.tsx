import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X, 
  Trash2, 
  MessageSquare,
  AlertCircle,
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  getProQuotes, 
  updateProQuoteStatus, 
  deleteProQuote, 
  ProQuoteRequest,
  extractDateString
} from '../../lib/firestoreService';

export default function AdminProQuotesManager() {
  const [quotes, setQuotes] = useState<ProQuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const list = await getProQuotes();
      setQuotes(list);
    } catch (err) {
      console.error('Error fetching pro quotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleStatusChange = async (quoteId: string, nextStatus: ProQuoteRequest['status']) => {
    try {
      await updateProQuoteStatus(quoteId, nextStatus);
      setNotification({
        type: 'success',
        text: `Statut de la demande mis à jour en "${nextStatus}".`
      });
      await loadQuotes();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Erreur lors de la mise à jour du statut. Veuillez réessayer.'
      });
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!window.confirm('Supprimer définitivement cette demande de devis pro ?')) return;
    try {
      await deleteProQuote(quoteId);
      setNotification({
        type: 'success',
        text: 'Demande de devis supprimée.'
      });
      await loadQuotes();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Erreur lors de la suppression de la demande.'
      });
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    if (filterStatus === 'all') return true;
    return q.status === filterStatus;
  });

  const getStatusBadge = (status: ProQuoteRequest['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold rounded-xs text-[10px] uppercase">Nouveau</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold rounded-xs text-[10px] uppercase">Contacté</span>;
      case 'quoted':
        return <span className="px-2.5 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold rounded-xs text-[10px] uppercase">Devis Envoyé</span>;
      case 'approved':
        return <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold rounded-xs text-[10px] uppercase">Validé / Payé</span>;
      case 'declined':
        return <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold rounded-xs text-[10px] uppercase">Refusé</span>;
      default:
        return <span className="px-2.5 py-1 bg-white/10 text-gray-300 rounded-xs text-[10px] uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#141418] border border-white/10 p-5 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-serif font-bold text-white">
              Devis Professionnels & Événements VIP ({quotes.length})
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Suivi des demandes d'entreprises, mariages, tournages ciné/clip et privatisations complètes du salon Final Stop.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'new', 'contacted', 'quoted', 'approved', 'declined'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-gold text-black font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {st === 'all' ? `Tous (${quotes.length})` : st}
            </button>
          ))}
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quotes List */}
      {isLoading ? (
        <div className="bg-[#141418] border border-white/10 p-12 text-center text-xs font-mono text-gray-400 rounded-xs">
          Chargement des devis professionnels...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-[#141418] border border-white/10 p-12 text-center text-xs font-mono text-gray-400 rounded-xs space-y-3">
          <Building2 className="w-8 h-8 text-gold/60 mx-auto" />
          <p>Aucune demande de devis pro dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuotes.map((quote) => (
            <div 
              key={quote.id} 
              className="bg-[#141418] border border-white/10 hover:border-gold/40 p-5 sm:p-6 rounded-xs transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base sm:text-lg font-serif font-bold text-white">
                      {quote.fullName}
                    </span>
                    {quote.companyName && (
                      <span className="text-xs text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-xs font-mono">
                        {quote.companyName}
                      </span>
                    )}
                    {getStatusBadge(quote.status)}
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Type d'événement : <strong className="text-gray-200">{quote.serviceType}</strong> &bull; Reçu le {extractDateString(quote.createdAt) || 'récemment'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={quote.status}
                    onChange={(e) => handleStatusChange(quote.id, e.target.value as any)}
                    className="bg-black/60 border border-white/20 focus:border-gold px-2.5 py-1.5 text-xs text-white rounded-xs font-mono outline-none"
                  >
                    <option value="new">Nouveau</option>
                    <option value="contacted">Contacté</option>
                    <option value="quoted">Devis Envoyé</option>
                    <option value="approved">Validé &amp; Acompte</option>
                    <option value="declined">Refusé / Annulé</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(quote.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xs transition-colors cursor-pointer"
                    title="Supprimer la demande"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-black/40 p-3.5 rounded-xs border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold" /> Date Souhaitée
                  </span>
                  <span className="text-white font-bold">{quote.targetDate || 'Non spécifié'}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-gold" /> Participants
                  </span>
                  <span className="text-white font-bold">{quote.guestCount || '1'} personne(s)</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-gold" /> Budget Estimé
                  </span>
                  <span className="text-gold font-bold">{quote.estimatedBudget || 'À étudier'}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold" /> Déplacement
                  </span>
                  <span className="text-white font-bold">
                    {quote.locationRequirement === 'on-site' ? 'Au Salon Final Stop' : 'Sur Lieu Externe'}
                  </span>
                </div>
              </div>

              {/* Message / Notes */}
              {quote.notes && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xs text-xs text-gray-300 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">
                    Détails & Besoins Particuliers :
                  </span>
                  <p className="leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}

              {/* Direct Communication Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`tel:${quote.phone}`}
                  className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xs text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler ({quote.phone})</span>
                </a>

                {quote.email && (
                  <a
                    href={`mailto:${quote.email}?subject=Final Stop Barber Shop - Votre Demande de Devis Pro`}
                    className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xs text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Envoyer Email ({quote.email})</span>
                  </a>
                )}

                <a
                  href={`https://wa.me/${quote.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xs text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
