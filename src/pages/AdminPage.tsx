import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  Upload,
  AlertCircle,
  Camera,
  FolderOpen,
  X,
  Lock,
  LogOut,
  Shield,
  Check,
  ShieldAlert,
  Mail,
  UserPlus,
  DollarSign,
  Briefcase,
  Globe,
  Clock,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Sliders,
  Send,
  Search,
  Filter
} from 'lucide-react';
import { 
  getReservations, 
  getWaitlistQueue, 
  seedFirestoreDatabase, 
  setShopWaitlistOpen, 
  updateWaitlistStatus, 
  updateReservationStatus,
  getGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  seedFirestoreGallery,
  getAdminEmails,
  addAdminEmail,
  removeAdminEmail,
  verifyAndRegisterAdmin,
  getPromoPopupStatus,
  setPromoPopupStatus,
  getShopRedirectConfig,
  setShopRedirectConfig,
  ShopRedirectConfig,
  archiveOldWaitlistTickets,
  FirestoreReservation, 
  FirestoreWaitlistEntry,
  FirestoreGalleryItem
} from '../lib/firestoreService';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { uploadImageToFreeCloud } from '../lib/freeImageUploadService';
import AdminServicesManager from '../components/admin/AdminServicesManager';
import AdminProQuotesManager from '../components/admin/AdminProQuotesManager';
import AdminWaitlistManager from '../components/admin/AdminWaitlistManager';
import AdminEmailMarketingManager from '../components/admin/AdminEmailMarketingManager';
import AdminContentSettingsManager from '../components/admin/AdminContentSettingsManager';
import ScrollIndicator from '../components/ScrollIndicator';

interface AdminPageProps {
  onBackToHome?: () => void;
  isWaitlistOpen: boolean;
  onWaitlistToggle: (isOpen: boolean) => void;
}

export type AdminTab = 
  | 'appointments' 
  | 'waitlist' 
  | 'services' 
  | 'quotes' 
  | 'marketing' 
  | 'content' 
  | 'gallery' 
  | 'settings';

export default function AdminPage({
  isWaitlistOpen,
  onWaitlistToggle
}: AdminPageProps) {
  // Authentication & Access Protection
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('finalstop_admin_authorized') === 'true' ||
             localStorage.getItem('finalstop_admin_authorized') === 'true';
    }
    return false;
  });
  const [signInError, setSignInError] = useState<string | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [isFirstAdminNotice, setIsFirstAdminNotice] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Tabs scroll reference for PC and Mobile smooth navigation
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Redirection URL Management State
  const [redirectConfig, setRedirectConfig] = useState<ShopRedirectConfig>({
    redirectUrl: 'https://finalstop.org',
    redirectEnabled: false,
    redirectLabel: 'Google Reviews & Official Links'
  });
  const [isSavingRedirect, setIsSavingRedirect] = useState(false);

  // 3-Minute Inactivity Auto-Logout Timer (180 seconds)
  const [secondsInactive, setSecondsInactive] = useState(0);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [autoLogoutNotice, setAutoLogoutNotice] = useState<string | null>(null);

  // VIP Promo Pop-up Toggle (-$5)
  const [promoPopupEnabled, setPromoPopupEnabled] = useState(true);
  const [isTogglingPromo, setIsTogglingPromo] = useState(false);

  // Admin Team Management State
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [adminActionStatus, setAdminActionStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [reservations, setReservations] = useState<FirestoreReservation[]>([]);
  const [waitlist, setWaitlist] = useState<FirestoreWaitlistEntry[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<FirestoreGalleryItem[]>([]);
  
  // Filtering in appointments
  const [appointmentFilter, setAppointmentFilter] = useState<string>('all');
  const [appointmentSearch, setAppointmentSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Image Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBarber, setNewBarber] = useState<'Mika' | 'Lusca' | 'Both'>('Mika');
  const [newCategory, setNewCategory] = useState('Braids & Cornrows');
  const [newAudience, setNewAudience] = useState<'Women & Girls (Braids)' | 'Men & Boys (Haircuts)' | 'Shop'>('Women & Girls (Braids)');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);

  /**
   * 3-Minute Inactivity Auto-Logout Effect
   */
  useEffect(() => {
    if (!isAuthorized) return;

    const resetTimer = () => {
      setSecondsInactive(0);
      setShowInactivityWarning(false);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    const interval = setInterval(() => {
      setSecondsInactive((prev) => {
        const next = prev + 1;
        if (next >= 150 && next < 180) {
          setShowInactivityWarning(true);
        } else if (next >= 180) {
          handleAutoLogout();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      clearInterval(interval);
    };
  }, [isAuthorized]);

  const handleAutoLogout = async () => {
    try {
      await logout();
    } catch {}
    setCurrentUser(null);
    setIsAuthorized(false);
    setShowInactivityWarning(false);
    setAutoLogoutNotice("Your admin session was automatically locked after 3 minutes of inactivity to safeguard salon controls.");
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('finalstop_admin_authorized');
      localStorage.removeItem('finalstop_admin_authorized');
    }
  };

  /**
   * Verifies if the authenticated Google user is authorized in Firestore.
   */
  const checkAdminAuthorization = async (user: User): Promise<boolean> => {
    if (!user.email) {
      setUnauthorizedEmail('Email unavailable');
      setIsAuthorized(false);
      return false;
    }
    try {
      const result = await verifyAndRegisterAdmin(user.email);
      setAdminEmails(result.adminEmails);
      if (result.authorized) {
        setIsAuthorized(true);
        setUnauthorizedEmail(null);
        setAutoLogoutNotice(null);
        if (result.isFirstAdmin) {
          setIsFirstAdminNotice(true);
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('finalstop_admin_authorized', 'true');
          localStorage.setItem('finalstop_admin_authorized', 'true');
        }
        return true;
      } else {
        setIsAuthorized(false);
        setUnauthorizedEmail(user.email);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('finalstop_admin_authorized');
          localStorage.removeItem('finalstop_admin_authorized');
        }
        return false;
      }
    } catch (err) {
      console.error('Error verifying admin authorization in Firestore:', err);
      setIsAuthorized(false);
      return false;
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkAdminAuthorization(user);
      } else {
        setIsAuthorized(false);
        setUnauthorizedEmail(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('finalstop_admin_authorized');
        }
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const loadAdminEmailsList = async () => {
    try {
      const emails = await getAdminEmails();
      setAdminEmails(emails);
    } catch (err) {
      console.error('Error fetching admin emails:', err);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [resList, wlList, photos, promoStatus, redirectCfg] = await Promise.all([
        getReservations(),
        getWaitlistQueue(true),
        getGalleryItems(),
        getPromoPopupStatus(),
        getShopRedirectConfig()
      ]);
      setReservations(resList);
      setWaitlist(wlList);
      setGalleryPhotos(photos);
      setPromoPopupEnabled(promoStatus);
      if (redirectCfg) {
        setRedirectConfig(redirectCfg);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRedirectConfig = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingRedirect(true);
    setStatusMessage(null);
    try {
      await setShopRedirectConfig(redirectConfig);
      setStatusMessage({
        type: 'success',
        text: 'Redirection configuration updated successfully!'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error saving redirection configuration.'
      });
    } finally {
      setIsSavingRedirect(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadAllData();
      loadAdminEmailsList();
    }
  }, [isAuthorized]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    setUnauthorizedEmail(null);
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      const authorized = await checkAdminAuthorization(user);
      if (authorized) {
        await loadAllData();
      }
    } catch (err: any) {
      setSignInError('Unable to complete Google authentication. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    setCurrentUser(null);
    setIsAuthorized(false);
    setUnauthorizedEmail(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('finalstop_admin_authorized');
      localStorage.removeItem('finalstop_admin_authorized');
    }
  };

  const handleAddAdminEmail = async (e: FormEvent) => {
    e.preventDefault();
    const clean = newAdminEmailInput.trim().toLowerCase();
    if (!clean) return;
    setIsUpdatingAdmin(true);
    setAdminActionStatus(null);
    try {
      const updated = await addAdminEmail(clean);
      setAdminEmails(updated);
      setNewAdminEmailInput('');
      setAdminActionStatus({
        type: 'success',
        text: `Address ${clean} has been successfully authorized! This barber can now sign in using their Google account.`
      });
    } catch (err: any) {
      setAdminActionStatus({
        type: 'error',
        text: err?.message || 'Error adding new administrator.'
      });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const handleRemoveAdminEmail = async (emailToRemove: string) => {
    if (!window.confirm(`Are you sure you want to revoke admin access for ${emailToRemove}?`)) {
      return;
    }
    setIsUpdatingAdmin(true);
    setAdminActionStatus(null);
    try {
      const updated = await removeAdminEmail(emailToRemove);
      setAdminEmails(updated);
      setAdminActionStatus({
        type: 'success',
        text: `Administrator ${emailToRemove} was removed.`
      });
    } catch (err: any) {
      setAdminActionStatus({
        type: 'error',
        text: err?.message || 'Error removing administrator.'
      });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    setStatusMessage(null);
    try {
      const [dbRes, galRes] = await Promise.all([
        seedFirestoreDatabase(),
        seedFirestoreGallery()
      ]);
      if (dbRes.success) {
        setStatusMessage({ 
          type: 'success', 
          text: `Central database synchronized successfully (${galRes.count} portfolio photos loaded).` 
        });
        await loadAllData();
      } else {
        setStatusMessage({ type: 'error', text: 'Could not synchronize database.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Error during data sync.' });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleToggleWaitlist = async () => {
    const nextState = !isWaitlistOpen;
    onWaitlistToggle(nextState);
    await setShopWaitlistOpen(nextState);
  };

  const handleTogglePromo = async () => {
    setIsTogglingPromo(true);
    setStatusMessage(null);
    try {
      const next = !promoPopupEnabled;
      await setPromoPopupStatus(next);
      setPromoPopupEnabled(next);
      setStatusMessage({
        type: 'success',
        text: `VIP Promo Pop-up (-$5) ${next ? 'ENABLED' : 'DISABLED'} successfully on the public website.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error updating promo pop-up status.'
      });
    } finally {
      setIsTogglingPromo(false);
    }
  };

  const handleUpdateReservationStatus = async (resId: string, nextStatus: FirestoreReservation['status']) => {
    try {
      await updateReservationStatus(resId, nextStatus);
      setStatusMessage({
        type: 'success',
        text: `Appointment status updated to "${nextStatus}".`
      });
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error updating status.'
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image exceeds 15 MB. Please select a smaller photo.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    setNewImageUrl('');
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddGalleryItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || (!newImageUrl.trim() && !selectedFile) || !newDescription.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a title, description, and select a photo.' });
      return;
    }

    setIsSavingImage(true);
    try {
      let finalImageUrl = newImageUrl.trim();

      if (selectedFile) {
        setIsUploadingFile(true);
        setStatusMessage({ type: 'success', text: 'Uploading photo to cloud storage...' });
        finalImageUrl = await uploadImageToFreeCloud(selectedFile);
        setIsUploadingFile(false);
      }

      if (!finalImageUrl) {
        throw new Error('Unable to retrieve image URL.');
      }

      await saveGalleryItem({
        title: newTitle.trim(),
        barber: newBarber,
        category: newCategory,
        targetAudience: newAudience,
        imageUrl: finalImageUrl,
        description: newDescription.trim()
      });

      setStatusMessage({ 
        type: 'success', 
        text: `"${newTitle}" added successfully to the portfolio!` 
      });

      setNewTitle('');
      setNewImageUrl('');
      setNewDescription('');
      handleClearSelectedFile();
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Error saving photo. Please check the image and try again.' 
      });
    } finally {
      setIsSavingImage(false);
      setIsUploadingFile(false);
    }
  };

  const handleDeleteImage = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Permanently delete this photo from the portfolio?')) {
      try {
        await deleteGalleryItem(id);
        setStatusMessage({ type: 'success', text: 'Photo removed from portfolio.' });
        await loadAllData();
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Error deleting photo.' });
      }
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((res) => {
    const matchesFilter = appointmentFilter === 'all' || res.status === appointmentFilter;
    const searchLower = appointmentSearch.toLowerCase();
    const matchesSearch = !appointmentSearch.trim() || 
      res.clientName?.toLowerCase().includes(searchLower) ||
      res.clientPhone?.includes(appointmentSearch) ||
      res.barberName?.toLowerCase().includes(searchLower) ||
      res.ticketId?.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  // Loading Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-[#111114] border border-white/10 rounded-xs max-w-sm w-full mx-4 shadow-xl">
          <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-gray-300">Checking staff security authorization...</p>
        </div>
      </div>
    );
  }

  // Unauthorized Email Screen: User signed in with Google, but is not in authorized list
  if (currentUser && unauthorizedEmail && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col font-sans selection:bg-gold selection:text-black">
        <header className="px-6 py-4 border-b border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="font-serif font-bold text-white text-sm">Final Stop Barber Shop &bull; Staff Portal</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-xs cursor-pointer bg-transparent font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-[#111115] border border-white/10 p-6 sm:p-8 rounded-xs text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">
                Staff Access Restricted
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed">
                This administrative console is strictly reserved for authorized barbers and staff of Final Stop Barber Shop.
              </p>
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xs font-mono text-xs text-red-300 break-all">
                Signed in as: <strong className="text-white">{currentUser.email}</strong>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Please contact the salon owner to add your Google address to the authorized administrators list.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all rounded-xs border border-white/20 cursor-pointer flex items-center justify-center gap-2 font-mono"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out &amp; Switch Account</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Security Gate: Direct Google Authentication for Authorized Staff
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
        <header className="bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold" />
              <span className="font-serif font-bold text-white text-sm tracking-wide">Final Stop Barber Shop</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-xs">
              <Lock className="w-3 h-3 text-gold" />
              <span>Staff Authentication</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-[#111115] border border-white/10 rounded-xs shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

            {/* Auto-logout notification */}
            {autoLogoutNotice && (
              <div className="mb-6 bg-amber-500/15 border border-amber-500/40 p-3.5 rounded-xs text-center text-xs text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 inline-block mr-2 align-middle" />
                <span className="leading-relaxed align-middle">{autoLogoutNotice}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-3">
                  <Shield className="w-7 h-7 text-gold" />
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide mb-1.5">
                  Staff Account Login
                </h1>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                  Sign in with your authorized Google email to access the Final Stop management console.
                </p>
              </div>

              {signInError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xs text-center text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 inline-block mr-2 align-middle" />
                  <span className="leading-relaxed align-middle">{signInError}</span>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  id="adminGoogleSignInButton"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-3 rounded-xs shadow-xl cursor-pointer disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-800" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-gray-500 font-mono text-center pt-2">
                Protected Management Portal &bull; finalstop.org
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans relative">
      
      {/* 3-Minute Inactivity Warning Floating Banner */}
      {showInactivityWarning && (
        <div className="fixed bottom-5 right-5 z-50 bg-amber-500 text-black px-5 py-3.5 rounded shadow-2xl flex items-center gap-4 border border-amber-400 font-mono text-xs animate-bounce">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-black shrink-0 animate-spin" />
            <div>
              <p className="font-bold">Inactivity Detected: Automatic sign-out in {180 - secondsInactive}s</p>
              <p className="text-[10px] text-black/80">Move mouse or click anywhere to extend your active session.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { setSecondsInactive(0); setShowInactivityWarning(false); }}
            className="bg-black text-white px-3 py-1.5 font-bold text-xs uppercase cursor-pointer rounded hover:bg-gray-900 transition-colors shrink-0"
          >
            Stay Signed In
          </button>
        </div>
      )}

      {/* Header - Fixed atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-sm sm:text-base tracking-wide block">
                FINAL STOP BARBER SHOP
              </span>
              <span className="text-[10px] font-mono text-gold uppercase tracking-wider block">
                Staff Management Portal &bull; 5277 El Cajon Blvd
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile / Access Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xs">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Google Avatar" 
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-bold flex items-center justify-center shrink-0">
                    {currentUser.displayName?.[0] || 'A'}
                  </div>
                )}
                <span className="text-[11px] font-mono text-gray-300 hidden md:inline truncate max-w-[160px]">
                  {currentUser.email}
                </span>
              </div>
            )}

            {/* Admin Team Management Button */}
            <button
              type="button"
              onClick={() => {
                setAdminActionStatus(null);
                setIsTeamModalOpen(true);
              }}
              className="text-xs text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 border border-white/10 hover:border-gold/50 px-2.5 py-1.5 rounded-xs cursor-pointer bg-transparent font-mono"
              title="Manage authorized Google administrator accounts"
            >
              <Users className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Admin Team</span>
              <span className="px-1.5 py-0.5 bg-gold/20 text-gold text-[10px] rounded-full font-bold">
                {adminEmails.length}
              </span>
            </button>

            <button
              type="button"
              onClick={loadAllData}
              className="text-xs text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 border border-white/10 px-2.5 py-1.5 rounded-xs cursor-pointer bg-transparent"
              title="Refresh all data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 border border-white/10 hover:border-red-500/40 px-2.5 py-1.5 rounded-xs cursor-pointer bg-transparent font-mono"
              title="Lock portal and sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* First Admin Congratulations Banner */}
      {isFirstAdminNotice && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-[13px]">
                  Welcome! You are registered as the primary master administrator.
                </p>
                <p className="text-emerald-300 text-[11px] mt-0.5">
                  Your Google account (<code className="text-white font-mono font-bold">{currentUser?.email}</code>) is saved as an authorized administrator. You can add fellow barbers using the <strong>"Admin Team"</strong> button above.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFirstAdminNotice(false)}
              className="text-emerald-400 hover:text-white p-1.5 cursor-pointer bg-transparent border-none shrink-0"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Central Shop Console &bull; San Diego, CA</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Salon Operations &amp; Management Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real-time monitoring of appointments, walk-in queue, pricing, pro quotes, email marketing campaigns, and shop content.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSeedFirestore}
              disabled={isSeeding}
              className="bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer rounded-xs"
              title="Synchronize and refresh all database collections"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Syncing...' : 'Sync Central Database'}</span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`mb-6 p-4 text-xs font-mono flex items-center justify-between gap-4 border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top Summary Cards (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Walk-in Desk Toggle */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Walk-In Desk</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className={`text-base font-bold font-serif ${isWaitlistOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isWaitlistOpen ? 'OPEN (Walk-ins Accepted)' : 'CLOSED (Full / Disabled)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleWaitlist}
              className="mt-2 text-xs font-bold uppercase tracking-wider py-2 px-3 border border-white/15 hover:border-gold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xs"
            >
              {isWaitlistOpen ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
              <span>{isWaitlistOpen ? 'Close Walk-In Queue' : 'Open Walk-In Queue'}</span>
            </button>
          </div>

          {/* Card 2: Promo Pop-up VIP Toggle */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">VIP Pop-up (-$5)</span>
              <Tag className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className={`text-base font-bold font-serif ${promoPopupEnabled ? 'text-emerald-400' : 'text-gray-400'}`}>
                {promoPopupEnabled ? 'ACTIVE (Shown on Site)' : 'HIDDEN (Disabled)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleTogglePromo}
              disabled={isTogglingPromo}
              className="mt-2 text-xs font-bold uppercase tracking-wider py-2 px-3 border border-white/15 hover:border-gold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xs disabled:opacity-50"
            >
              {promoPopupEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
              <span>{isTogglingPromo ? 'Updating...' : promoPopupEnabled ? 'Disable Pop-up' : 'Enable Pop-up'}</span>
            </button>
          </div>

          {/* Card 3: Reservations count */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Client Bookings</span>
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {reservations.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Scheduled appointments
            </span>
          </div>

          {/* Card 4: Gallery Photos */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Portfolio &amp; Gallery</span>
              <ImageIcon className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {galleryPhotos.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Mika (Braids) &bull; Lusca (Haircuts)
            </span>
          </div>

        </div>

        {/* Tab Navigation with Left and Right Arrows for PC and Mobile */}
        <div className="relative flex items-center mb-8 border-b border-white/10 bg-[#0E0E12] p-1.5 rounded-xs">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="p-2 text-gray-400 hover:text-gold bg-[#15151A] hover:bg-[#1C1C22] border border-white/10 rounded-xs transition-colors cursor-pointer shrink-0 mr-2 shadow-sm"
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4 text-gold" />
          </button>

          {/* Horizontally Scrollable Tab List */}
          <div 
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 font-mono flex-1 scroll-smooth"
          >
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments ({reservations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('waitlist')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'waitlist'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Walk-In Queue ({waitlist.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Services &amp; Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quotes')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'quotes'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Pro Quotes &amp; Events</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('marketing')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'marketing'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Marketing &amp; Campaigns</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'content'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Shop Content &amp; Hours</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Portfolio ({galleryPhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Redirect URL &amp; Links</span>
            </button>
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="p-2 text-gray-400 hover:text-gold bg-[#15151A] hover:bg-[#1C1C22] border border-white/10 rounded-xs transition-colors cursor-pointer shrink-0 ml-2 shadow-sm"
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4 text-gold" />
          </button>
        </div>

        {/* TAB 1: Appointments Table */}
        {activeTab === 'appointments' && (
          <div className="bg-[#141418] border border-white/10 p-6 rounded-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  <span>Scheduled Client Appointments ({filteredReservations.length})</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time synchronization with online booking requests and client schedules.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter */}
                <div className="flex items-center gap-1.5 bg-black border border-white/15 px-2.5 py-1.5 rounded-xs text-xs font-mono">
                  <Filter className="w-3.5 h-3.5 text-gold" />
                  <select
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                    className="bg-transparent text-gray-200 outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#141418]">All Statuses</option>
                    <option value="confirmed" className="bg-[#141418]">Confirmed</option>
                    <option value="in-chair" className="bg-[#141418]">In Chair</option>
                    <option value="completed" className="bg-[#141418]">Completed</option>
                    <option value="cancelled" className="bg-[#141418]">Cancelled</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    placeholder="Search name, phone, ticket..."
                    className="bg-black border border-white/15 focus:border-gold px-3 py-1.5 pl-8 text-xs text-white rounded-xs outline-none font-mono placeholder-gray-500"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {filteredReservations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-mono">
                No appointments match your filters. Click "Sync Central Database" to reload reservations.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                      <th className="pb-3 pr-4">Ticket</th>
                      <th className="pb-3 px-4">Client</th>
                      <th className="pb-3 px-4">Barber</th>
                      <th className="pb-3 px-4">Service</th>
                      <th className="pb-3 px-4">Date &amp; Time</th>
                      <th className="pb-3 px-4">Price</th>
                      <th className="pb-3 px-4">Current Status</th>
                      <th className="pb-3 pl-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredReservations.map((res: any, i) => (
                      <tr key={res.id || i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-4 text-gold font-bold">
                          {res.ticketId || res.id?.substring(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 text-white">
                          <div className="font-bold">{res.clientName}</div>
                          <div className="text-[10px] text-gray-400">{res.clientPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gold font-bold">
                          {res.barberName || res.barber}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          {res.serviceName || res.service}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          <div>{res.bookingDate || res.date}</div>
                          <div className="text-[10px] text-gold">{res.bookingTime || res.time}</div>
                        </td>
                        <td className="py-3.5 px-4 text-white font-bold">
                          ${res.price}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs ${
                            res.status === 'confirmed' || res.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : res.status === 'in-chair'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : res.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : res.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-white/10 text-gray-300'
                          }`}>
                            {res.status === 'confirmed' || res.status === 'Confirmed' ? 'Confirmed' :
                             res.status === 'in-chair' ? 'In Chair' :
                             res.status === 'completed' ? 'Completed' :
                             res.status === 'cancelled' ? 'Cancelled' : res.status}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <select
                            value={res.status || 'confirmed'}
                            onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value as any)}
                            className="bg-black/60 border border-white/20 hover:border-gold px-2 py-1 text-[10px] text-white rounded-xs outline-none cursor-pointer"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="in-chair">In Chair</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Walk-In Queue Manager */}
        {activeTab === 'waitlist' && (
          <AdminWaitlistManager
            waitlist={waitlist}
            onRefresh={loadAllData}
            isWaitlistOpen={isWaitlistOpen}
            onToggleWaitlist={handleToggleWaitlist}
          />
        )}

        {/* TAB 3: Services & Pricing Manager */}
        {activeTab === 'services' && (
          <AdminServicesManager />
        )}

        {/* TAB 4: Pro Quotes Manager */}
        {activeTab === 'quotes' && (
          <AdminProQuotesManager />
        )}

        {/* TAB 5: Email Marketing & Campaigns Manager */}
        {activeTab === 'marketing' && (
          <AdminEmailMarketingManager />
        )}

        {/* TAB 6: Shop Content & Hours Manager */}
        {activeTab === 'content' && (
          <AdminContentSettingsManager />
        )}

        {/* TAB 7: Portfolio & Gallery Photos */}
        {activeTab === 'gallery' && (
          <div className="space-y-10">
            
            {/* Add New Photo Form */}
            <div className="bg-[#141418] border border-gold/30 p-6 rounded-xs shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gold" />
                    <span>Upload New Creation to Portfolio</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Add haircut or braiding style photography with barber attribution (Mika for women/girls braids, Lusca for men/boys haircuts).
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddGalleryItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Style Title */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Style Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Waist-Length Knotless Braids"
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
                  />
                </div>

                {/* Barber Assignment */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Master Barber Attribution *
                  </label>
                  <select
                    value={newBarber}
                    onChange={(e) => {
                      const val = e.target.value as 'Mika' | 'Lusca' | 'Both';
                      setNewBarber(val);
                      if (val === 'Mika') {
                        setNewAudience('Women & Girls (Braids)');
                        setNewCategory('Braids & Cornrows');
                      } else if (val === 'Lusca') {
                        setNewAudience('Men & Boys (Haircuts)');
                        setNewCategory('Skin Fades');
                      } else {
                        setNewAudience('Shop');
                        setNewCategory('The Shop');
                      }
                    }}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Mika">Mika (Master Braider &bull; Girls’ Braids &amp; Locs)</option>
                    <option value="Lusca">Lusca (Master Barber &bull; Boys’ &amp; Men’s Cuts)</option>
                    <option value="Both">Both (Mika &amp; Lusca &bull; Barbershop Lounge)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Braids & Cornrows">Braids &amp; Cornrows</option>
                    <option value="Locs & Twists">Locs &amp; Twists</option>
                    <option value="Skin Fades">Skin Fades</option>
                    <option value="Beards & Shaves">Beards &amp; Shaves</option>
                    <option value="The Shop">The Shop</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Audience Tag *
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Women & Girls (Braids)">Women &amp; Girls (Braids)</option>
                    <option value="Men & Boys (Haircuts)">Men &amp; Boys (Haircuts)</option>
                    <option value="Shop">Shop Facility</option>
                  </select>
                </div>

                {/* Direct Image File Upload & Camera Selector */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-mono text-gold font-bold block flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo Directly (File or Camera) *</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">PNG, JPG, WEBP up to 15 MB</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-photo-file-input"
                  />

                  {!filePreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gold/40 hover:border-gold bg-[#0A0A0B] p-6 text-center cursor-pointer transition-all duration-200 group rounded-xs hover:bg-gold/5 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        Click to select a photo from your computer or phone
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Take a live photo with your camera or pick from gallery
                      </p>
                    </div>
                  ) : (
                    <div className="relative p-3 bg-black border border-gold/60 rounded-xs flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={filePreview} 
                          alt="Selected preview" 
                          className="w-16 h-16 object-cover border border-gold/50 rounded-xs"
                        />
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                            {selectedFile?.name}
                          </p>
                          <p className="text-[10px] font-mono text-gold mt-0.5">
                            {(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0)} MB &bull; Ready to upload
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                        title="Remove selected file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Alternative URL Link */}
                  <div className="pt-2 border-t border-white/10">
                    <details className="group">
                      <summary className="text-[11px] font-mono text-gray-400 cursor-pointer hover:text-gold flex items-center gap-1">
                        <span>Or paste an existing image URL (Optional)</span>
                      </summary>
                      <div className="mt-2 space-y-2 pl-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => {
                            setNewImageUrl(e.target.value);
                            if (e.target.value) handleClearSelectedFile();
                          }}
                          placeholder="https://images.unsplash.com/... or CDN link"
                          className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                        {newImageUrl && (
                          <div className="flex items-center gap-2 p-1.5 bg-black border border-white/10 rounded-xs">
                            <img 
                              src={newImageUrl} 
                              alt="Preview URL" 
                              className="w-10 h-10 object-cover border border-gold/40"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="text-[10px] font-mono text-gray-400">URL Preview</span>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Technique &amp; Style Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe parting technique, tension control, fade millimeter precision, products used, or styling advice..."
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingImage || isUploadingFile}
                    className="bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs px-6 py-3 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-60"
                  >
                    <Upload className={`w-4 h-4 ${(isSavingImage || isUploadingFile) ? 'animate-bounce' : ''}`} />
                    <span>
                      {isUploadingFile 
                        ? 'Uploading photo...' 
                        : isSavingImage 
                        ? 'Saving photo...' 
                        : 'Save Photo to Portfolio'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Current Photos in System Grid */}
            <div className="bg-[#141418] border border-white/10 p-6 rounded-xs">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gold" />
                  <span>Published Portfolio Realizations ({galleryPhotos.length})</span>
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  Visible to public clients
                </span>
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs font-mono">
                  No portfolio photos saved yet. Click "Sync Central Database" to load sample portfolio photos.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryPhotos.map((photo, i) => (
                    <div 
                      key={photo.id || i}
                      className="bg-[#0A0A0B] border border-white/10 hover:border-gold/40 transition-all rounded-xs overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-video relative overflow-hidden bg-black">
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 text-gold text-[10px] font-mono px-2 py-0.5 border border-white/20">
                          {photo.barber}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/80 text-gray-300 text-[9px] font-mono px-2 py-0.5 border border-white/20">
                          {photo.category}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-serif font-bold text-white mb-1">
                            {photo.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono block mb-2">
                            Audience: {photo.targetAudience}
                          </span>
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                            {photo.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-500">
                            {photo.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(photo.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 text-[11px] font-mono"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 8: Settings & Redirection URL Manager */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Redirection Configuration Card */}
            <div className="bg-[#141418] border border-white/10 p-6 rounded-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gold" />
                    <span>Redirection URL &amp; Link Settings</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Define where to direct your clients (Google Reviews, Instagram, partnership link, etc.) directly from your console.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs ${
                    redirectConfig.redirectEnabled 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {redirectConfig.redirectEnabled ? 'Redirection Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveRedirectConfig} className="space-y-4 max-w-xl font-mono text-xs">
                <div>
                  <label className="text-gray-300 font-bold block mb-1.5 uppercase text-[11px]">
                    Destination URL (e.g. Google Reviews link)
                  </label>
                  <input
                    type="url"
                    required
                    value={redirectConfig.redirectUrl}
                    onChange={(e) => setRedirectConfig(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    placeholder="https://g.page/r/finalstop/review"
                    className="w-full bg-[#0A0A0B] border border-white/20 focus:border-gold px-3.5 py-2.5 text-white rounded-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1.5 uppercase text-[11px]">
                    Public Button Label
                  </label>
                  <input
                    type="text"
                    required
                    value={redirectConfig.redirectLabel}
                    onChange={(e) => setRedirectConfig(prev => ({ ...prev, redirectLabel: e.target.value }))}
                    placeholder="Leave a 5-Star Google Review"
                    className="w-full bg-[#0A0A0B] border border-white/20 focus:border-gold px-3.5 py-2.5 text-white rounded-xs outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={redirectConfig.redirectEnabled}
                      onChange={(e) => setRedirectConfig(prev => ({ ...prev, redirectEnabled: e.target.checked }))}
                      className="w-4 h-4 accent-gold"
                    />
                    <span>Enable redirection button on public website</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSavingRedirect}
                    className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider rounded-xs cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingRedirect ? 'Saving...' : 'Save Redirection'}</span>
                  </button>

                  {redirectConfig.redirectUrl && (
                    <a
                      href={redirectConfig.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/15 rounded-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test URL</span>
                    </a>
                  )}
                </div>
              </form>
            </div>

            {/* Quick Actions & Shop Operations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* VIP Promo Manager */}
              <div className="bg-[#141418] border border-white/10 p-6 rounded-xs space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                  <Tag className="w-4 h-4 text-gold" />
                  <span>VIP Promo Pop-up (-$5)</span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Enables or disables the pop-up modal offering a $5 discount coupon to new salon visitors.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTogglePromo}
                    disabled={isTogglingPromo}
                    className="px-4 py-2 bg-white/5 hover:bg-gold/20 text-white hover:text-gold border border-white/20 hover:border-gold/50 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {promoPopupEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                    <span>{promoPopupEnabled ? 'Disable VIP Pop-up' : 'Enable VIP Pop-up'}</span>
                  </button>
                </div>
              </div>

              {/* Day Waitlist Archive */}
              <div className="bg-[#141418] border border-white/10 p-6 rounded-xs space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Daily Queue Reset</span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Allows the barbers to archive older completed tickets and maintain only today's active walk-in clients.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Archive old tickets and start a clean queue for today?")) {
                        await archiveOldWaitlistTickets();
                        await loadAllData();
                        setStatusMessage({ type: 'success', text: "Waitlist queue cleaned and reset for today." });
                      }
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-gold/20 text-white hover:text-gold border border-white/20 hover:border-gold/50 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span>Clean Daily Queue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Scroll Down Indicator for longer panels */}
        <div className="mt-8 flex justify-center">
          <ScrollIndicator label="Scroll down for more information" />
        </div>

      </main>

      {/* Admin Team Management Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111115] border border-gold/40 rounded-xs shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 bg-transparent border-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Administrator Team
                </h3>
                <p className="text-[11px] text-gray-400">
                  Manage Google accounts authorized to administer Final Stop Barber Shop
                </p>
              </div>
            </div>

            <div className="overflow-y-auto pr-1 space-y-5 flex-1">
              {/* Form to add a new admin email */}
              <form onSubmit={handleAddAdminEmail} className="bg-white/5 border border-white/10 p-4 rounded-xs space-y-3">
                <label htmlFor="newAdminEmailInput" className="block text-xs font-mono text-gray-300 uppercase tracking-wider">
                  Add New Administrator:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      id="newAdminEmailInput"
                      type="email"
                      required
                      value={newAdminEmailInput}
                      onChange={(e) => setNewAdminEmailInput(e.target.value)}
                      placeholder="barber.name@gmail.com"
                      className="w-full bg-black/60 border border-white/20 focus:border-gold pl-9 pr-3 py-2.5 text-xs text-white font-mono rounded-xs outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingAdmin || !newAdminEmailInput.trim()}
                    className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xs cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isUpdatingAdmin ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    <span>Add</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  Enter the exact email address used to sign in to their personal Google account.
                </p>
              </form>

              {/* Status feedback */}
              {adminActionStatus && (
                <div className={`p-3 rounded-xs text-xs flex items-start gap-2.5 ${
                  adminActionStatus.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}>
                  {adminActionStatus.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{adminActionStatus.text}</span>
                </div>
              )}

              {/* List of current admins */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 pb-1">
                  <span>Authorized Administrators ({adminEmails.length})</span>
                  <span className="text-[10px] text-gray-500">Firestore Cloud</span>
                </div>

                {adminEmails.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500 bg-white/5 rounded-xs">
                    No administrators registered yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {adminEmails.map((email) => {
                      const isMe = currentUser?.email?.toLowerCase() === email.toLowerCase();
                      return (
                        <div
                          key={email}
                          className="flex items-center justify-between p-2.5 bg-black/50 border border-white/10 rounded-xs hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                              {email[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-mono text-white truncate">
                                {email}
                              </p>
                              {isMe && (
                                <span className="inline-block text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-xs">
                                  Your Current Account
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAdminEmail(email)}
                            disabled={isUpdatingAdmin || adminEmails.length <= 1}
                            title={adminEmails.length <= 1 ? "Cannot delete the only remaining administrator" : "Revoke administrator access"}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer bg-transparent border-none disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Informational security summary */}
              <div className="bg-gold/5 border border-gold/20 p-3 rounded-xs text-[11px] text-gray-400 leading-relaxed space-y-1">
                <p className="text-gold font-bold font-mono text-[10px] uppercase tracking-wider">
                  Staff Access Policy:
                </p>
                <p>
                  Only team members who sign in with an authorized Google email address listed above can access this management dashboard.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
