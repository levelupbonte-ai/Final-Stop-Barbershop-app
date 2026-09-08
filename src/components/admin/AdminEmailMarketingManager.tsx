import { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  Sparkles, 
  Check, 
  Search, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Tag, 
  Calendar, 
  Clock, 
  Eye, 
  FileText,
  UserCheck,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { getClientContactList, CollectedClientContact } from '../../lib/firestoreService';
import { sendMarketingCampaignEmail, CampaignEmailParams } from '../../lib/emailService';

type CampaignTemplateType = 'promo_code' | 'we_miss_you' | 'announcement' | 'custom';

export default function AdminEmailMarketingManager() {
  const [contacts, setContacts] = useState<CollectedClientContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'all' | 'vip_club' | 'appointment' | 'waitlist'>('all');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [copiedEmailsNotice, setCopiedEmailsNotice] = useState(false);

  // Email Composer State
  const [templateType, setTemplateType] = useState<CampaignTemplateType>('promo_code');
  const [promoCode, setPromoCode] = useState('VIP15');
  const [discountText, setDiscountText] = useState('15% OFF Any Service');
  const [expiryDate, setExpiryDate] = useState('Valid for 30 Days');
  const [headline, setHeadline] = useState('Weekend Special Grooming Offer');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customDirectEmail, setCustomDirectEmail] = useState('');
  const [recipientMode, setRecipientMode] = useState<'selected' | 'all' | 'custom'>('selected');

  // Preview tab state
  const [previewTab, setPreviewTab] = useState<'compose' | 'preview'>('compose');

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Load contacts
  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const data = await getClientContactList();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    
    if (!matchesSearch) return false;
    if (selectedSourceFilter === 'all') return true;
    return c.source === selectedSourceFilter;
  });

  // Toggle single email selection
  const toggleSelectEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  // Toggle select all filtered
  const toggleSelectAll = () => {
    const filteredEmailList = filteredContacts.map((c) => c.email);
    const allSelected = filteredEmailList.every((e) => selectedEmails.includes(e));
    if (allSelected) {
      setSelectedEmails(selectedEmails.filter((e) => !filteredEmailList.includes(e)));
    } else {
      const merged = Array.from(new Set([...selectedEmails, ...filteredEmailList]));
      setSelectedEmails(merged);
    }
  };

  // Copy all emails to clipboard
  const handleCopyEmails = () => {
    const emailList = (selectedEmails.length > 0 ? selectedEmails : filteredContacts.map((c) => c.email)).join(', ');
    if (!emailList) return;
    navigator.clipboard.writeText(emailList);
    setCopiedEmailsNotice(true);
    setTimeout(() => setCopiedEmailsNotice(false), 3000);
  };

  // Determine recipients list for sending
  const getTargetRecipients = (): string[] => {
    if (recipientMode === 'custom') {
      const emails = customDirectEmail
        .split(/[,;\n]/)
        .map((e) => e.trim())
        .filter((e) => e.includes('@'));
      return emails;
    }
    if (recipientMode === 'all') {
      return contacts.map((c) => c.email).filter(Boolean);
    }
    return selectedEmails;
  };

  // Handle Send Campaign
  const handleSendCampaign = async () => {
    setDispatchResult(null);
    const recipients = getTargetRecipients();

    if (recipients.length === 0) {
      setDispatchResult({
        type: 'error',
        message: 'Please select at least one recipient or enter a custom email.'
      });
      return;
    }

    setIsSending(true);

    try {
      const payload: CampaignEmailParams = {
        recipients,
        type: templateType,
        promoCode: templateType === 'promo_code' ? promoCode : undefined,
        discountText: templateType === 'promo_code' ? discountText : undefined,
        expiryDate: templateType === 'promo_code' ? expiryDate : undefined,
        headline: templateType === 'announcement' ? headline : undefined,
        customSubject: customSubject.trim() || undefined,
        customMessage: customMessage.trim() || undefined,
      };

      const res = await sendMarketingCampaignEmail(payload);

      if (res.success) {
        setDispatchResult({
          type: 'success',
          message: `Campaign successfully dispatched to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''} via Resend.`
        });
      } else {
        setDispatchResult({
          type: 'warning',
          message: res.message || 'Email dispatch completed with notification. Verify RESEND_API_KEY configuration.'
        });
      }
    } catch (err: any) {
      setDispatchResult({
        type: 'error',
        message: err?.message || 'Failed to dispatch campaign.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const vipCount = contacts.filter((c) => c.source === 'vip_club').length;
  const appointmentCount = contacts.filter((c) => c.source === 'appointment').length;
  const targetCount = getTargetRecipients().length;

  return (
    <div className="space-y-8 animate-fadeIn text-gray-200">
      
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111115] border border-white/10 p-5 rounded-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xs bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-gold" />
          </div>
          <div>
            <div className="text-2xl font-serif font-black text-white">{contacts.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Total Client Contacts</div>
          </div>
        </div>

        <div className="bg-[#111115] border border-white/10 p-5 rounded-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xs bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-serif font-black text-white">{vipCount}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">VIP Promo Club Members</div>
          </div>
        </div>

        <div className="bg-[#111115] border border-white/10 p-5 rounded-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xs bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-serif font-black text-white">{appointmentCount}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Booked Appointments</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Left = Audience List, Right = Campaign Composer & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Audience & Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111115] border border-white/10 p-5 rounded-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gold" />
                  <span>Client Contacts Directory</span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Collected from bookings, walk-ins, VIP club & accounts
                </p>
              </div>
              <button
                type="button"
                onClick={loadContacts}
                className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors cursor-pointer"
                title="Refresh contacts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContacts ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xs pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedSourceFilter('all')}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-xs border transition-colors cursor-pointer ${
                    selectedSourceFilter === 'all'
                      ? 'bg-gold/15 border-gold text-gold font-bold'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  All ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSourceFilter('vip_club')}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-xs border transition-colors cursor-pointer ${
                    selectedSourceFilter === 'vip_club'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  VIP Club ({vipCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSourceFilter('appointment')}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-xs border transition-colors cursor-pointer ${
                    selectedSourceFilter === 'appointment'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  Bookings ({appointmentCount})
                </button>
              </div>
            </div>

            {/* Selection actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filteredContacts.length > 0 && filteredContacts.every((c) => selectedEmails.includes(c.email))}
                  onChange={toggleSelectAll}
                  className="rounded text-gold focus:ring-0 cursor-pointer"
                />
                <span>Select All Filtered ({filteredContacts.length})</span>
              </label>

              <button
                type="button"
                onClick={handleCopyEmails}
                className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light font-mono cursor-pointer bg-transparent border-none p-0"
              >
                {copiedEmailsNotice ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Emails</span>
                  </>
                )}
              </button>
            </div>

            {/* Contacts scroll list */}
            <div className="max-h-[440px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingContacts ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gold" />
                  Loading client database...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  No contacts found matching criteria.
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedEmails.includes(contact.email);
                  return (
                    <div
                      key={contact.id + contact.email}
                      onClick={() => toggleSelectEmail(contact.email)}
                      className={`p-3 rounded-xs border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gold/10 border-gold/40'
                          : 'bg-black/30 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-gold focus:ring-0 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{contact.name}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-xs uppercase ${
                              contact.source === 'vip_club'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : contact.source === 'appointment'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-gray-700/40 text-gray-400'
                            }`}>
                              {contact.source === 'vip_club' ? 'VIP' : contact.source === 'appointment' ? 'Booking' : 'Waitlist'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-gray-400 truncate">
                            {contact.email}
                          </div>
                          {contact.notes && (
                            <div className="text-[10px] text-gray-500 truncate">
                              {contact.notes} &bull; {contact.lastActivity}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-[11px] font-mono text-gray-400 pt-2 border-t border-white/10 flex justify-between">
              <span>Selected for Campaign:</span>
              <strong className="text-gold font-bold">{selectedEmails.length} recipients</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Composer & Live Template Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111115] border border-white/10 p-5 rounded-xs space-y-5">
            
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" />
                  <span>Email Marketing & Campaign Composer</span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Select a pre-crafted template or craft a custom broadcast with Resend
                </p>
              </div>

              {/* Tab Switcher: Compose vs Preview */}
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('compose')}
                  className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    previewTab === 'compose' ? 'bg-gold text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    previewTab === 'preview' ? 'bg-gold text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {/* Template Selection Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-400 tracking-wider block">
                Choose Email Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                
                <button
                  type="button"
                  onClick={() => setTemplateType('promo_code')}
                  className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    templateType === 'promo_code'
                      ? 'bg-gold/15 border-gold text-white'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <Tag className={`w-4 h-4 mb-2 ${templateType === 'promo_code' ? 'text-gold' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs font-bold leading-snug">VIP Promo Voucher</div>
                    <div className="text-[10px] opacity-75">15% Off or Custom Code</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('we_miss_you')}
                  className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    templateType === 'we_miss_you'
                      ? 'bg-gold/15 border-gold text-white'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <Clock className={`w-4 h-4 mb-2 ${templateType === 'we_miss_you' ? 'text-gold' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs font-bold leading-snug">We Miss You</div>
                    <div className="text-[10px] opacity-75">Fresh Cut & Braids Reminder</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('announcement')}
                  className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    templateType === 'announcement'
                      ? 'bg-gold/15 border-gold text-white'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 mb-2 ${templateType === 'announcement' ? 'text-gold' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs font-bold leading-snug">Announcement</div>
                    <div className="text-[10px] opacity-75">Holiday / Flash Event</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('custom')}
                  className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    templateType === 'custom'
                      ? 'bg-gold/15 border-gold text-white'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <FileText className={`w-4 h-4 mb-2 ${templateType === 'custom' ? 'text-gold' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs font-bold leading-snug">Custom Message</div>
                    <div className="text-[10px] opacity-75">Full Freeform Text</div>
                  </div>
                </button>

              </div>
            </div>

            {/* Recipient Targeting Mode */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono uppercase text-gray-400 tracking-wider block">
                Send To
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRecipientMode('selected')}
                  className={`px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
                    recipientMode === 'selected'
                      ? 'bg-gold/20 border-gold text-gold font-bold'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  Selected Contacts ({selectedEmails.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('all')}
                  className={`px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
                    recipientMode === 'all'
                      ? 'bg-gold/20 border-gold text-gold font-bold'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  All Collected Clients ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('custom')}
                  className={`px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
                    recipientMode === 'custom'
                      ? 'bg-gold/20 border-gold text-gold font-bold'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  Direct Email Input
                </button>
              </div>

              {recipientMode === 'custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Enter email (e.g. client@gmail.com, or separate with comma)"
                    value={customDirectEmail}
                    onChange={(e) => setCustomDirectEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xs px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
              )}
            </div>

            {/* Template Specific Form Controls */}
            {previewTab === 'compose' ? (
              <div className="space-y-4 pt-2 border-t border-white/10">
                
                {templateType === 'promo_code' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1">Promo Code</label>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="VIP15"
                        className="w-full bg-black/40 border border-white/15 rounded-xs px-3 py-2 text-xs text-gold font-mono font-bold tracking-wider focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1">Discount Headline</label>
                      <input
                        type="text"
                        value={discountText}
                        onChange={(e) => setDiscountText(e.target.value)}
                        placeholder="15% OFF Any Service"
                        className="w-full bg-black/40 border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1">Expiration / Validity</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="Valid for 30 Days"
                        className="w-full bg-black/40 border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                )}

                {templateType === 'announcement' && (
                  <div>
                    <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Special Announcement from Final Stop"
                      className="w-full bg-black/40 border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1">
                    Subject Line (Optional - auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Leave blank for template default subject"
                    className="w-full bg-black/40 border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 uppercase block mb-1">
                    Custom Message or Additional Note (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personalized note to include in the email body..."
                    className="w-full bg-black/40 border border-white/15 rounded-xs p-3 text-xs text-white focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>

              </div>
            ) : (
              /* Live Template Preview Mockup */
              <div className="bg-[#0B0B0D] border border-white/15 rounded-xs p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto">
                <div className="border-b border-white/10 pb-3 text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
                    Email Preview
                  </div>
                  <div className="text-xs text-gray-300 font-mono mt-1">
                    Subject: <span className="text-white font-bold">{customSubject || (templateType === 'promo_code' ? `Exclusive Gift: ${discountText} (Code: ${promoCode})` : templateType === 'we_miss_you' ? 'Time for a Fresh Cut? Your Chair Awaits' : headline)}</span>
                  </div>
                </div>

                {/* Email Canvas Mockup */}
                <div className="max-w-md mx-auto bg-[#141418] border border-white/10 rounded p-6 text-center space-y-4 shadow-xl">
                  <div className="flex justify-center">
                    <img 
                      src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
                      alt="Final Stop" 
                      className="h-10 w-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
                    Final Stop Barber Shop &bull; San Diego
                  </div>

                  {templateType === 'promo_code' ? (
                    <div className="space-y-3 py-2">
                      <div className="text-xl font-serif font-bold text-white">{discountText}</div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Hello Valued Guest, we are delighted to treat you to this exclusive offer on your upcoming visit.
                      </p>
                      <div className="p-4 bg-black/50 border-2 border-dashed border-gold rounded-xs">
                        <div className="text-[10px] uppercase font-mono text-gray-400">Promo Code</div>
                        <div className="text-2xl font-mono font-black text-gold tracking-widest my-1">{promoCode}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{expiryDate} &bull; Valid for Mika & Lusca</div>
                      </div>
                    </div>
                  ) : templateType === 'we_miss_you' ? (
                    <div className="space-y-3 py-2">
                      <div className="text-xl font-serif font-bold text-white">Ready for a Fresh Cut or Braids?</div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        It's been a while since your last visit. Crisp lines, master fades, and flawless protective braids are waiting for you.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-2">
                      <div className="text-xl font-serif font-bold text-white">{headline}</div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {customMessage || 'Thank you for choosing Final Stop Barber Shop as your trusted grooming destination.'}
                      </p>
                    </div>
                  )}

                  {customMessage && templateType !== 'announcement' && (
                    <div className="text-left text-xs bg-white/5 border-l-2 border-gold p-3 text-gray-200">
                      {customMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="inline-block bg-gold text-black font-bold uppercase text-[11px] tracking-wider px-6 py-2.5 rounded-xs">
                      Book Appointment Now
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-gray-500 pt-3 border-t border-white/10">
                    5277 El Cajon Blvd, San Diego, CA 92115 &bull; (619) 886-1267<br />
                    Powered By Levelup ecosystem
                  </div>
                </div>
              </div>
            )}

            {/* Status notification */}
            {dispatchResult && (
              <div className={`p-3.5 rounded-xs text-xs flex items-start gap-2.5 ${
                dispatchResult.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : dispatchResult.type === 'warning'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}>
                {dispatchResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">
                  <strong>{dispatchResult.message}</strong>
                  {dispatchResult.type === 'warning' && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      Tip: Set <code className="text-gold">RESEND_API_KEY</code> in environment variables or your hosting secrets for full live production dispatch.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
              <div className="text-xs font-mono text-gray-400">
                Ready to dispatch to <strong className="text-gold">{targetCount} recipient{targetCount === 1 ? '' : 's'}</strong>
              </div>

              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={isSending || targetCount === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs rounded-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Dispatching via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black" />
                    <span>Send Email Broadcast ({targetCount})</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
