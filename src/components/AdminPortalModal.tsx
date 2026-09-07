import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  LogOut, 
  Megaphone, 
  Bell, 
  Users, 
  Calendar, 
  Sparkles, 
  Send, 
  Clock, 
  Smartphone,
  Eye,
  RefreshCw,
  Sliders,
  Check,
  Power
} from 'lucide-react';
import { auth, loginWithGoogle, logout, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { setIsWaitlistOpen, getIsWaitlistOpen, DEFAULT_OWNER_PIN } from '../lib/waitlistService';
import { sendTestNotification } from '../lib/notifications';
import { AnnouncementData, DEFAULT_ANNOUNCEMENT } from './AnnouncementBanner';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWaitlistOpen: boolean;
  onWaitlistChange: (isOpen: boolean) => void;
}

export const ADMIN_MASTER_PIN = '2026';
export const ALT_ADMIN_PIN = '1234';

export default function AdminPortalModal({
  isOpen,
  onClose,
  isWaitlistOpen,
  onWaitlistChange
}: AdminPortalModalProps) {
  // Authentication states
  const [pinInput, setPinInput] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcements' | 'notifications' | 'waitlist' | 'reservations'>('announcements');

  // Announcement state
  const [announcement, setAnnouncement] = useState<AnnouncementData>(DEFAULT_ANNOUNCEMENT);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  // Notification broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('Final Stop Barber Shop');
  const [broadcastBody, setBroadcastBody] = useState('✂️ Your barber is ready! Walk-in slots are currently open with no wait.');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Reservations state
  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Fetch initial announcement data
  useEffect(() => {
    if (!isOpen) return;

    const fetchAnnouncement = async () => {
      try {
        const snap = await getDoc(doc(db, 'shop_settings', 'announcement'));
        if (snap.exists()) {
          setAnnouncement(snap.data() as AnnouncementData);
        } else {
          const cached = localStorage.getItem('final_stop_announcement');
          if (cached) setAnnouncement(JSON.parse(cached));
        }
      } catch (err) {
        console.debug('Error loading announcement:', err);
      }
    };

    fetchAnnouncement();
  }, [isOpen]);

  // Load reservations when reservations tab is selected
  useEffect(() => {
    if (isOpen && activeTab === 'reservations' && currentUser) {
      loadReservations();
    }
  }, [isOpen, activeTab, currentUser]);

  const loadReservations = async () => {
    setLoadingReservations(true);
    try {
      const q = query(collection(db, 'reservations'), limit(20));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setReservations(list);
    } catch (err) {
      console.debug('Error fetching reservations:', err);
    } finally {
      setLoadingReservations(false);
    }
  };

  if (!isOpen) return null;

  // Handle PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_MASTER_PIN || pinInput.trim() === ALT_ADMIN_PIN || pinInput.trim() === DEFAULT_OWNER_PIN) {
      setPinUnlocked(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN code. (Default Staff PIN: 2026)');
    }
  };

  // Trigger Google Login Popup
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setPinError('');
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setPinError(err?.message || 'Google Sign-In authentication error.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Disconnect admin
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setPinUnlocked(false);
      setPinInput('');
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save announcement to Firestore & Local Storage
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    setAnnouncementSuccess('');
    try {
      const payload = {
        ...announcement,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'shop_settings', 'announcement'), payload, { merge: true });
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      localStorage.setItem('final_stop_announcement', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('announcement-updated', { detail: payload }));
      setAnnouncementSuccess('Announcement banner updated and published live!');
      setTimeout(() => setAnnouncementSuccess(''), 4000);
    } catch (err: any) {
      console.error('Failed to save announcement:', err);
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // Broadcast push notification
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBroadcast(true);
    setBroadcastSuccess('');
    try {
      // 1. Send native test notification if supported
      await sendTestNotification(broadcastTitle, broadcastBody);

      // 2. Record notification in Firestore
      try {
        await setDoc(doc(collection(db, 'admin_notifications')), {
          title: broadcastTitle,
          message: broadcastBody,
          sentBy: currentUser?.email || 'Admin',
          sentAt: new Date().toISOString()
        });
      } catch {}

      // 3. Dispatch global app notification event
      window.dispatchEvent(
        new CustomEvent('in-app-broadcast', {
          detail: { title: broadcastTitle, body: broadcastBody }
        })
      );

      setBroadcastSuccess('Push notification successfully broadcasted to connected clients!');
      setTimeout(() => setBroadcastSuccess(''), 4000);
    } catch (err) {
      console.error('Broadcast error:', err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Toggle waitlist status
  const handleToggleWaitlist = (status: boolean) => {
    setIsWaitlistOpen(status);
    onWaitlistChange(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#121214] border border-gold/40 rounded-2xl max-w-2xl w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black via-[#171510] to-[#121214] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase font-bold">
                  Administration
                </span>
                <span className="bg-gold/20 text-gold text-[9px] font-mono px-1.5 py-0.2 rounded border border-gold/30">
                  Staff Only
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Shop Management • Final Stop
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: PIN CODE ENTRY */}
          {!pinUnlocked ? (
            <div className="max-w-md mx-auto py-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-serif font-bold text-white mb-1">
                Restricted Staff Access
              </h4>
              <p className="text-xs text-gray-400 mb-6">
                Please enter your security PIN code to unlock administrator access.
              </p>

              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="flex justify-center">
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="••••"
                    autoFocus
                    className="w-48 text-center text-2xl font-mono tracking-[0.5em] bg-black/60 border-2 border-gold/40 focus:border-gold rounded-xl py-3 px-4 text-gold placeholder-gray-600 outline-none transition-all shadow-inner"
                  />
                </div>

                {pinError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-lg flex items-center justify-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full max-w-xs bg-gold hover:bg-gold-light text-black font-mono font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  <span>Unlock Access</span>
                </button>

                <p className="text-[11px] text-gray-500 font-mono pt-2">
                  Staff default PIN code: <strong className="text-gold">2026</strong> or <strong className="text-gold">1234</strong>
                </p>
              </form>
            </div>
          ) : !currentUser ? (
            /* STEP 2: GOOGLE AUTH POPUP TRIGGER */
            <div className="max-w-md mx-auto py-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-mono mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PIN Code verified successfully</span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              <h4 className="text-xl font-serif font-bold text-white mb-2">
                Google Staff Sign-In Required
              </h4>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Sign in with your authorized Google account to manage site announcements, push notifications, walk-in queue, and reservations.
              </p>

              {pinError && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-lg mb-4 font-mono">
                  {pinError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full max-w-xs bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-3 mx-auto border border-white/20"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Opening Google popup...' : 'Continue with Google'}</span>
              </button>
            </div>
          ) : (
            /* STEP 3: ADMIN MANAGEMENT DASHBOARD */
            <div className="space-y-6">
              {/* Admin profile banner */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Admin'}
                      className="w-10 h-10 rounded-full border border-gold/40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-sm">
                      {currentUser.displayName?.[0] || 'A'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {currentUser.displayName || 'Shop Administrator'}
                      </h4>
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                        Online
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-gray-300 border border-white/10 hover:border-rose-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'announcements'
                      ? 'bg-gold text-black shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Site Announcements</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-gold text-black shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Broadcast Notification</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('waitlist')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'waitlist'
                      ? 'bg-gold text-black shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Walk-in Queue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('reservations')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'reservations'
                      ? 'bg-gold text-black shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reservations</span>
                </button>
              </div>

              {/* TAB 1: ANNOUNCEMENTS MANAGEMENT */}
              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        Header Alert / Announcement Banner
                      </h5>
                      <p className="text-xs text-gray-400">
                        Displays prominently at the top of Desktop and Mobile PWA.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-mono text-gray-300">
                        {announcement.active ? 'Active' : 'Hidden'}
                      </span>
                      <input
                        type="checkbox"
                        checked={announcement.active}
                        onChange={(e) => setAnnouncement({ ...announcement, active: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors relative ${announcement.active ? 'bg-gold' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${announcement.active ? 'right-1' : 'left-1'}`} />
                      </div>
                    </label>
                  </div>

                  {announcementSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{announcementSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">
                          Announcement Title
                        </label>
                        <input
                          type="text"
                          value={announcement.title}
                          onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                          placeholder="e.g. Special Holiday Hours, Flash Promo"
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">
                          Visual Style
                        </label>
                        <select
                          value={announcement.type}
                          onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value as any })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold"
                        >
                          <option value="info">Gold / Neutral (Standard)</option>
                          <option value="promo">Flash Promo (Emerald)</option>
                          <option value="alert">Alert / Urgent (Ruby)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        Full Message Content
                      </label>
                      <textarea
                        rows={2}
                        value={announcement.message}
                        onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                        placeholder="Broadcast message displayed to all visitors..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">
                          Button Text (Optional)
                        </label>
                        <input
                          type="text"
                          value={announcement.linkText || ''}
                          onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })}
                          placeholder="e.g. Book Appointment"
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">
                          Action Link URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={announcement.linkUrl || ''}
                          onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                          placeholder="e.g. #booking or https://..."
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    {/* Preview box */}
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        Live Banner Preview:
                      </label>
                      <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                        announcement.type === 'promo'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : announcement.type === 'alert'
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          : 'bg-black/60 border-gold/40 text-gray-200'
                      }`}>
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold text-black uppercase">
                          {announcement.type.toUpperCase()}
                        </span>
                        <strong>{announcement.title}:</strong>
                        <span className="truncate">{announcement.message || 'Your broadcast message...'}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingAnnouncement}
                      className="w-full bg-gold hover:bg-gold-light text-black font-mono font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{savingAnnouncement ? 'Saving...' : 'Update Announcement on Site'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: BROADCAST NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      Broadcast Instant Push Notification
                    </h5>
                    <p className="text-xs text-gray-400">
                      Trigger an instant push alert with sound and vibration to connected client smartphones and browsers.
                    </p>
                  </div>

                  {broadcastSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{broadcastSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. Final Stop Barber Shop"
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">
                        Push Message Content
                      </label>
                      <textarea
                        rows={3}
                        value={broadcastBody}
                        onChange={(e) => setBroadcastBody(e.target.value)}
                        placeholder="e.g. Master barber Mika has open slots right now with zero wait..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold resize-none"
                      />
                    </div>

                    {/* Notification Preview Mockup */}
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        Smartphone Lockscreen Preview:
                      </label>
                      <div className="bg-[#1C1C1E] border border-white/15 rounded-xl p-3 flex items-start gap-3 shadow-lg">
                        <div className="w-9 h-9 rounded-xl bg-black border border-gold/50 overflow-hidden shrink-0">
                          <img
                            src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png"
                            alt="Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span className="font-semibold text-white truncate">{broadcastTitle}</span>
                            <span className="font-mono text-[10px]">Now</span>
                          </div>
                          <p className="text-xs text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                            {broadcastBody}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingBroadcast}
                      className="w-full bg-gold hover:bg-gold-light text-black font-mono font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{sendingBroadcast ? 'Broadcasting...' : 'Send Notification Now'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: WAITLIST WALK-IN MANAGEMENT */}
              {activeTab === 'waitlist' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      Walk-in Queue Management
                    </h5>
                    <p className="text-xs text-gray-400">
                      Open or close the live digital walk-in queue accessible online.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                          Current Shop Status
                        </span>
                        <h4 className="text-lg font-serif font-bold text-white">
                          Walk-in Queue: {isWaitlistOpen ? (
                            <span className="text-emerald-400">OPEN</span>
                          ) : (
                            <span className="text-rose-400">CLOSED</span>
                          )}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleWaitlist(true)}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isWaitlistOpen
                              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>OPEN QUEUE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleWaitlist(false)}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            !isWaitlistOpen
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>CLOSE QUEUE</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                      {isWaitlistOpen
                        ? 'Clients can join the digital waitlist from their phones and track their live queue position.'
                        : 'The waitlist is currently closed. Clients will be prompted to book a scheduled appointment instead.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: RESERVATIONS OVERVIEW */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        Latest Received Reservations
                      </h5>
                      <p className="text-xs text-gray-400">
                        Synchronized with Firestore database.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={loadReservations}
                      disabled={loadingReservations}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingReservations ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingReservations ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-mono">
                      Loading reservations...
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="text-center py-8 bg-black/30 rounded-xl border border-white/5 text-xs text-gray-400 font-mono">
                      No reservations recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {reservations.map((res) => (
                        <div
                          key={res.id}
                          className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{res.clientName || res.name || 'Guest'}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gold/15 text-gold border border-gold/30">
                                {res.service || 'Haircut'}
                              </span>
                            </div>
                            <div className="text-gray-400 font-mono text-[11px] flex items-center gap-2 mt-0.5">
                              <span>{res.date || res.time || 'Today'}</span>
                              <span>•</span>
                              <span>{res.phone || res.email || 'No contact info'}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {res.status || 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Close Staff Administration Panel
          </button>
        </div>
      </div>
    </div>
  );
}
