import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Phone, 
  MapPin, 
  Clock, 
  Shield, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Share2, 
  Youtube, 
  Instagram, 
  Facebook, 
  Twitter, 
  ExternalLink,
  MessageSquare,
  Lock,
  Sparkles
} from 'lucide-react';
import { getShopConfig, updateShopConfig, ShopConfig, DEFAULT_SHOP_CONFIG } from '../../lib/firestoreService';

export default function AdminContentSettingsManager() {
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [phone1, setPhone1] = useState(DEFAULT_SHOP_CONFIG.phone1);
  const [phone2, setPhone2] = useState(DEFAULT_SHOP_CONFIG.phone2);
  const [address, setAddress] = useState(DEFAULT_SHOP_CONFIG.address);
  const [hoursWeekday, setHoursWeekday] = useState(DEFAULT_SHOP_CONFIG.hoursWeekday);
  const [hoursSunday, setHoursSunday] = useState(DEFAULT_SHOP_CONFIG.hoursSunday);
  const [announcement, setAnnouncement] = useState('');
  const [adminAccessCode, setAdminAccessCode] = useState('');

  // Social Links
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  // Load configuration from Firestore
  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await getShopConfig();
      setConfig(data);
      setPhone1(data.phone1 || DEFAULT_SHOP_CONFIG.phone1);
      setPhone2(data.phone2 || DEFAULT_SHOP_CONFIG.phone2);
      setAddress(data.address || DEFAULT_SHOP_CONFIG.address);
      setHoursWeekday(data.hoursWeekday || DEFAULT_SHOP_CONFIG.hoursWeekday);
      setHoursSunday(data.hoursSunday || DEFAULT_SHOP_CONFIG.hoursSunday);
      setAnnouncement(data.announcement || '');
      setAdminAccessCode(data.adminAccessCode || '');
      setInstagram(data.socialLinks?.instagram || '');
      setTiktok(data.socialLinks?.tiktok || '');
      setYoutube(data.socialLinks?.youtube || '');
      setFacebook(data.socialLinks?.facebook || '');
      setTwitter(data.socialLinks?.twitter || '');
    } catch (err) {
      console.error('Failed to load shop configuration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    if (!adminAccessCode.trim()) {
      setErrorMessage('Staff PIN code cannot be empty.');
      setIsSaving(false);
      return;
    }

    try {
      const updates: Partial<ShopConfig> = {
        phone1: phone1.trim(),
        phone2: phone2.trim(),
        address: address.trim(),
        hoursWeekday: hoursWeekday.trim(),
        hoursSunday: hoursSunday.trim(),
        announcement: announcement.trim(),
        adminAccessCode: adminAccessCode.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          youtube: youtube.trim(),
          facebook: facebook.trim(),
          twitter: twitter.trim(),
        }
      };

      await updateShopConfig(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save configuration to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111115] border border-white/10 p-6 rounded-xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-gold" />
            <span>Site Content & Dynamic Links Editor</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Update contact numbers, business hours, social media links, and security access code without touching code.
          </p>
        </div>

        <button
          type="button"
          onClick={loadConfig}
          className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload from Database</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Contact Numbers & Physical Location */}
        <div className="bg-[#111115] border border-white/10 p-6 rounded-xs space-y-5">
          <h3 className="text-sm font-serif font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Phone className="w-4 h-4 text-gold" />
            <span>Contact Numbers & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Primary Phone Number (Mika)
              </label>
              <input
                type="text"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                placeholder="(619) 886-1267"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Secondary Phone Number (Lusca)
              </label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="(619) 928-7084"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Shop Address & Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="5277 El Cajon Blvd, San Diego, CA 92115"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Hours */}
        <div className="bg-[#111115] border border-white/10 p-6 rounded-xs space-y-5">
          <h3 className="text-sm font-serif font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Clock className="w-4 h-4 text-gold" />
            <span>Business Operating Hours</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Weekday Hours (Mon - Sat)
              </label>
              <input
                type="text"
                value={hoursWeekday}
                onChange={(e) => setHoursWeekday(e.target.value)}
                placeholder="Monday - Saturday: 10:00 AM - 6:00 PM"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Sunday Schedule
              </label>
              <input
                type="text"
                value={hoursSunday}
                onChange={(e) => setHoursSunday(e.target.value)}
                placeholder="Sunday: Closed"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Social Media Links with Auto Logos */}
        <div className="bg-[#111115] border border-white/10 p-6 rounded-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h3 className="text-sm font-serif font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-gold" />
              <span>Social Media Channels & Auto-Detected Logos</span>
            </h3>
            <span className="text-[11px] text-gray-400">
              Logos will automatically render in public footer and modals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Instagram */}
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2 mb-1.5">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/finalstopbarbershop"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2 mb-1.5">
                <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px] bg-white/10 text-cyan-400 rounded-xs">TT</span>
                <span>TikTok Profile URL</span>
              </label>
              <input
                type="url"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://tiktok.com/@finalstopbarbershop"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2 mb-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@finalstopbarbershop"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2 mb-1.5">
                <Facebook className="w-4 h-4 text-blue-500" />
                <span>Facebook Page URL</span>
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/finalstopbarbershop"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* Twitter / X */}
            <div className="sm:col-span-2">
              <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2 mb-1.5">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>X / Twitter Profile URL</span>
              </label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/finalstopbarbershop"
                className="w-full bg-black/40 border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Social Links Live Preview */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-4">
            <span className="text-xs font-mono uppercase text-gray-400">Live Footer Icon Preview:</span>
            <div className="flex items-center gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-pink-400 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-cyan-400 transition-colors font-bold text-xs">
                  TT
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-red-500 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-blue-500 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {twitter && (
                <a href={twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-sky-400 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {!instagram && !tiktok && !youtube && !facebook && !twitter && (
                <span className="text-xs text-gray-500 italic">No social links configured yet. Paste URLs above.</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Staff PIN Security Code (Stored in Database) */}
        <div className="bg-[#111115] border border-white/10 p-6 rounded-xs space-y-5">
          <h3 className="text-sm font-serif font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Shield className="w-4 h-4 text-gold" />
            <span>Staff Portal Security Gate (Stored in Database)</span>
          </h3>

          <div className="max-w-md space-y-2">
            <label className="text-xs font-mono uppercase text-gray-400 block">
              Staff Access PIN Code
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={adminAccessCode}
                onChange={(e) => setAdminAccessCode(e.target.value)}
                placeholder="Enter secret PIN"
                className="w-full bg-black/40 border border-white/15 rounded-xs pl-9 pr-3 py-2.5 text-xs text-gold font-mono font-bold tracking-widest focus:outline-none focus:border-gold"
              />
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              This master code is securely persisted in the Firestore database. Staff members must enter this PIN to unlock the Google Sign-In button.
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xs text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>Site content and database configuration successfully saved and updated across the shop.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xs text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs rounded-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save All Changes to Database</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
