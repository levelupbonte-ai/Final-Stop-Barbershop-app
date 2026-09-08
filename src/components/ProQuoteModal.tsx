import React, { useState } from 'react';
import { Briefcase, X, Check, Calendar, Users, Building, Phone, Mail, FileText, Sparkles, Send } from 'lucide-react';
import { saveProQuote } from '../lib/firestoreService';

interface ProQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProQuoteModal({ isOpen, onClose }: ProQuoteModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    phone: '',
    email: '',
    serviceType: 'Mariage / Groomsmen' as const,
    headcount: 5,
    eventDate: '',
    location: 'Salon Final Stop (Privatisation VIP)',
    estimatedBudget: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const ticketId = `PRO-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await saveProQuote({
        ticketId,
        clientName: formData.clientName,
        companyName: formData.companyName || undefined,
        phone: formData.phone,
        email: formData.email,
        serviceType: formData.serviceType,
        headcount: Number(formData.headcount) || 1,
        eventDate: formData.eventDate,
        location: formData.location,
        estimatedBudget: formData.estimatedBudget || undefined,
        notes: formData.notes || undefined,
        status: 'new'
      });

      setSubmittedTicket(ticketId);
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors de l’envoi. Veuillez réessayer ou nous contacter directement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setFormData({
      clientName: '',
      companyName: '',
      phone: '',
      email: '',
      serviceType: 'Mariage / Groomsmen',
      headcount: 5,
      eventDate: '',
      location: 'Salon Final Stop (Privatisation VIP)',
      estimatedBudget: '',
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="pro-quote-modal"
        className="relative w-full max-w-xl bg-[#121216] border border-gold/40 rounded-sm shadow-2xl p-6 sm:p-8 my-8 text-white animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={resetForm}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xs bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-none"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTicket ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 bg-gold/20 border border-gold/50 rounded-full flex items-center justify-center mx-auto text-gold">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gold font-bold">
                Demande Pro Enregistrée
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                Devis #{submittedTicket} Transmis
              </h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Merci <strong className="text-white">{formData.clientName}</strong>. Notre maître barbier ou responsable événementiel vous contactera sous 24h ouvrées pour finaliser les détails et valider le planning.
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 p-4 rounded-xs text-left text-xs font-mono space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between text-gray-400">
                <span>Prestation :</span>
                <span className="text-white font-bold">{formData.serviceType}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Invités / Participants :</span>
                <span className="text-white font-bold">{formData.headcount} personnes</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Date souhaitée :</span>
                <span className="text-gold font-bold">{formData.eventDate || 'À convenir'}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:6192716161"
                className="w-full sm:w-auto px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-colors text-center cursor-pointer"
              >
                Appeler Directement le Salon
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-mono text-xs uppercase rounded-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/40 px-3 py-1 text-[11px] font-mono font-bold text-gold uppercase tracking-wider rounded-xs mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Espace Pro, Événements & Tournages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Demande de Devis Professionnel
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Privatisation du salon Final Stop, mariages (groomsmen package), shootings vidéo, styling VIP & comités d'entreprise.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 text-xs bg-red-950/50 border border-red-500/40 text-red-300 rounded-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alexandre Martin"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Société ou Projet (Optionnel)
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Ex: Production SD / Mariage VIP"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Téléphone de contact *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="tel"
                      required
                      placeholder="(619) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Adresse Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="contact@entreprise.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Type d'Événement *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={e => setFormData({ ...formData, serviceType: e.target.value as any })}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none rounded-xs"
                  >
                    <option value="Mariage / Groomsmen">Mariage / Groomsmen Package</option>
                    <option value="Entreprise / Corporate Grooming">Entreprise / Corporate Grooming Day</option>
                    <option value="Privatisation Salon">Privatisation Complète du Salon</option>
                    <option value="Tournage / VIP Backstage">Tournage Vidéo / VIP Backstage</option>
                    <option value="Autre">Autre projet sur mesure</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Nombre estimé de personnes *
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={formData.headcount}
                      onChange={e => setFormData({ ...formData, headcount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white outline-none rounded-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Date souhaitée de l'événement *
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white outline-none rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Budget estimé (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: $300 - $600"
                    value={formData.estimatedBudget}
                    onChange={e => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                  Détails & Besoins Particuliers
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Boissons offertes, créneau privatisé le samedi matin dès 8h, coupes personnalisées et tresses pour les témoins..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-gray-400 font-mono">
                  Réponse de notre équipe sous 24h.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold font-mono text-xs uppercase tracking-wider px-6 py-3 flex items-center justify-center gap-2 rounded-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer la Demande de Devis'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
