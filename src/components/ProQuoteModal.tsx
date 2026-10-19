import React, { useState } from 'react';
import { Briefcase, X, Check, Calendar, Users, Building, Phone, Mail, FileText, Sparkles, Send } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';
import { errorMessage as toErrorMessage, submitForm } from '../lib/site/api';
import { LIMITS, check, formSchema, quoteDetailsSchema } from '../lib/site/validation';
import { useSubmitLock } from '../lib/site/useSubmitLock';

interface ProQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProQuoteModal({ isOpen, onClose }: ProQuoteModalProps) {
  const { site } = useSiteData();
  const mainPhone = site.contact.phones[0];
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    phone: '',
    email: '',
    serviceType: 'Wedding & Groomsmen' as const,
    headcount: 5,
    eventDate: '',
    location: 'In-shop (private VIP buyout)',
    estimatedBudget: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitOnce = useSubmitLock();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return submitOnce(async () => {
      // Everything is checked before sending (phone and email are both required here).
      const details = check(quoteDetailsSchema, {
        service_type: formData.serviceType,
        headcount: Number(formData.headcount),
        event_date: formData.eventDate,
        location: formData.location,
        estimated_budget: formData.estimatedBudget
      });
      if (!details.ok) {
        setErrorMessage(details.message);
        return;
      }
      const input = {
        formType: 'quote' as const,
        name: formData.clientName,
        email: formData.email,
        phone: formData.phone,
        company: formData.companyName,
        message: formData.notes,
        data: details.data
      };
      const valid = check(formSchema, input);
      if (!valid.ok || !valid.data.email || !valid.data.phone) {
        setErrorMessage(valid.ok ? 'Please enter both a phone number and an email address.' : valid.message);
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const { ticketCode } = await submitForm(input);
        setSubmittedTicket(ticketCode);
      } catch (err) {
        setErrorMessage(toErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setFormData({
      clientName: '',
      companyName: '',
      phone: '',
      email: '',
      serviceType: 'Wedding & Groomsmen',
      headcount: 5,
      eventDate: '',
      location: 'In-shop (private VIP buyout)',
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
          title="Close"
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
                Inquiry Received
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                Quote Request #{submittedTicket} Submitted
              </h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Thank you <strong className="text-white">{formData.clientName}</strong>. Our master barber or events manager will contact you within 24 business hours to finalize package details and confirm scheduling.
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 p-4 rounded-xs text-left text-xs font-mono space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between text-gray-400">
                <span>Service Package:</span>
                <span className="text-white font-bold">{formData.serviceType}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Estimated Guests:</span>
                <span className="text-white font-bold">{formData.headcount} guests</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Requested Date:</span>
                <span className="text-gold font-bold">{formData.eventDate || 'To be determined'}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={mainPhone ? `tel:${mainPhone.tel}` : undefined}
                className="w-full sm:w-auto px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-colors text-center cursor-pointer"
              >
                Call Shop Directly
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-mono text-xs uppercase rounded-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/40 px-3 py-1 text-[11px] font-mono font-bold text-gold uppercase tracking-wider rounded-xs mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>VIP Events, Group Packages & Productions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Request a VIP Group Quote
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Full lounge buyout, wedding groomsmen parties, video productions, VIP styling, and corporate grooming days.
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    maxLength={LIMITS.name}
                    autoComplete="name"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Company / Project (Optional)
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      placeholder="e.g. San Diego Media / Vance Wedding"
                      maxLength={LIMITS.company}
                      autoComplete="organization"
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
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="tel"
                      required
                      placeholder="(619) 886-1267"
                      maxLength={LIMITS.phone + 10}
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="contact@company.com"
                      maxLength={LIMITS.email}
                      autoComplete="email"
                      inputMode="email"
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
                    Event Type *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={e => setFormData({ ...formData, serviceType: e.target.value as any })}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none rounded-xs"
                  >
                    <option value="Wedding & Groomsmen">Wedding & Groomsmen Package</option>
                    <option value="Corporate Grooming Day">Corporate Grooming & Executive Day</option>
                    <option value="Full Lounge Buyout">Full Lounge Buyout & Private Session</option>
                    <option value="Video Shoot / Backstage">Video Shoot / Backstage VIP Styling</option>
                    <option value="Custom Event">Custom Tailored Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Estimated Headcount *
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
                    Target Event Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="date"
                      required
                      min={new Date().toLocaleDateString('en-CA')}
                      value={formData.eventDate}
                      onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-9 pr-3.5 py-2.5 text-xs text-white outline-none rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                    Estimated Budget (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $300 - $600"
                    maxLength={60}
                    value={formData.estimatedBudget}
                    onChange={e => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 uppercase block mb-1.5">
                  Details & Specific Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Morning private session starting at 8 AM, custom cuts and styling for wedding party..."
                  maxLength={LIMITS.message}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none rounded-xs"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-gray-400 font-mono">
                  Response from our team within 24 business hours.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold font-mono text-xs uppercase tracking-wider px-6 py-3 flex items-center justify-center gap-2 rounded-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Quote Request'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
