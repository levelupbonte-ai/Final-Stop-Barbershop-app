import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  ArrowLeft, 
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
  LogIn,
  Copy,
  ShieldAlert,
  Mail,
  UserPlus,
  User as UserIcon,
  DollarSign,
  Briefcase,
  Globe,
  Clock,
  AlertTriangle
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
import DomainOAuthModal from '../components/admin/DomainOAuthModal';

interface AdminPageProps {
  onBackToHome: () => void;
  isWaitlistOpen: boolean;
  onWaitlistToggle: (isOpen: boolean) => void;
}

type AdminTab = 'appointments' | 'waitlist' | 'services' | 'quotes' | 'gallery';

export default function AdminPage({
  onBackToHome,
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
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [isFirstAdminNotice, setIsFirstAdminNotice] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isDomainGuideOpen, setIsDomainGuideOpen] = useState(false);

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

  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [reservations, setReservations] = useState<FirestoreReservation[]>([]);
  const [waitlist, setWaitlist] = useState<FirestoreWaitlistEntry[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<FirestoreGalleryItem[]>([]);
  
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
          // Trigger automatic logout after 3 minutes (180s)
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
    setAutoLogoutNotice("Votre session d'administration a été fermée automatiquement après 3 minutes d'inactivité pour protéger le salon.");
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
      setUnauthorizedEmail('Email indisponible');
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
      const [resList, wlList, photos, promoStatus] = await Promise.all([
        getReservations(),
        getWaitlistQueue(true), // Load all waitlist entries
        getGalleryItems(),
        getPromoPopupStatus()
      ]);
      setReservations(resList);
      setWaitlist(wlList);
      setGalleryPhotos(photos);
      setPromoPopupEnabled(promoStatus);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
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
    setUnauthorizedDomain(null);
    setUnauthorizedEmail(null);
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      const authorized = await checkAdminAuthorization(user);
      if (authorized) {
        await loadAllData();
      }
    } catch (err: any) {
      const isDomainError = 
        err?.code === 'auth/unauthorized-domain' || 
        err?.message?.includes('unauthorized-domain');

      if (isDomainError) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'ce domaine';
        setUnauthorizedDomain(domain);
        setSignInError(
          `Connexion Google : Le domaine ${domain} n'est pas encore autorisé dans Firebase Console (Authentication > Settings > Authorized Domains).`
        );
      } else {
        setSignInError(err?.message || 'Erreur lors de la connexion Google. Veuillez réessayer.');
      }
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
        text: `L'adresse ${clean} a été ajoutée avec succès ! Cet administrateur peut désormais se connecter avec son compte Google.`
      });
    } catch (err: any) {
      setAdminActionStatus({
        type: 'error',
        text: err?.message || 'Erreur lors de l\'ajout de l\'administrateur.'
      });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const handleRemoveAdminEmail = async (emailToRemove: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer les accès administrateur pour ${emailToRemove} ?`)) {
      return;
    }
    setIsUpdatingAdmin(true);
    setAdminActionStatus(null);
    try {
      const updated = await removeAdminEmail(emailToRemove);
      setAdminEmails(updated);
      setAdminActionStatus({
        type: 'success',
        text: `L'administrateur ${emailToRemove} a été retiré.`
      });
    } catch (err: any) {
      setAdminActionStatus({
        type: 'error',
        text: err?.message || 'Erreur lors de la suppression de l\'administrateur.'
      });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const copyDomainToClipboard = () => {
    if (unauthorizedDomain && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(unauthorizedDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
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
          text: `Firestore synchronized! Populated reservations, queue, and ${galRes.count} gallery photos.` 
        });
        await loadAllData();
      } else {
        setStatusMessage({ type: 'error', text: dbRes.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Sync failed' });
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
        text: `Pop-up Réduction VIP (-$5) ${next ? 'ACTIVÉ' : 'DÉSACTIVÉ'} avec succès sur le site public.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Erreur lors de la modification du pop-up promo.'
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
        text: `Statut du rendez-vous mis à jour en "${nextStatus}".`
      });
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Erreur lors de la mise à jour.'
      });
    }
  };

  const handleServeTicket = async (docId: string) => {
    await updateWaitlistStatus(docId, 'served');
    await loadAllData();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).' });
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'L\'image dépasse 15 Mo. Veuillez choisir une photo plus petite.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    setNewImageUrl(''); // Clear text URL if direct file chosen
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
      setStatusMessage({ type: 'error', text: 'Veuillez remplir le titre, la description et sélectionner une photo.' });
      return;
    }

    setIsSavingImage(true);
    try {
      let finalImageUrl = newImageUrl.trim();

      // If user picked a local file from device / camera
      if (selectedFile) {
        setIsUploadingFile(true);
        setStatusMessage({ type: 'success', text: 'Téléversement gratuit de votre photo en cours...' });
        finalImageUrl = await uploadImageToFreeCloud(selectedFile);
        setIsUploadingFile(false);
      }

      if (!finalImageUrl) {
        throw new Error('Impossible d\'obtenir l\'adresse de l\'image.');
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
        text: `"${newTitle}" a été enregistrée avec succès dans la base de données Firebase!` 
      });

      // Reset form
      setNewTitle('');
      setNewImageUrl('');
      setNewDescription('');
      handleClearSelectedFile();
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err?.message || 'Erreur lors de l\'enregistrement de la photo dans Firestore.' 
      });
    } finally {
      setIsSavingImage(false);
      setIsUploadingFile(false);
    }
  };

  const handleDeleteImage = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Delete this photo from the Firestore database?')) {
      try {
        await deleteGalleryItem(id);
        setStatusMessage({ type: 'success', text: 'Photo deleted from Firestore database.' });
        await loadAllData();
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err?.message || 'Deletion error' });
      }
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-[#111114] border border-white/10 rounded-xs max-w-sm w-full mx-4 shadow-xl">
          <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-gray-300">Vérification de sécurité en cours...</p>
        </div>
      </div>
    );
  }

  // Unauthorized Email Screen: User signed in with Google, but is not in the authorized admin list
  if (currentUser && unauthorizedEmail && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col font-sans selection:bg-gold selection:text-black">
        <header className="px-6 py-4 border-b border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 text-gold" />
            <span>Retour au site</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-xs cursor-pointer bg-transparent font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-[#111115] border border-red-500/30 p-6 sm:p-8 rounded-xs text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/60" />

            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">
                Accès Administrateur Non Autorisé
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed">
                Le compte Google <strong className="text-gold font-mono">{currentUser.email}</strong> n'est pas répertorié dans la liste des administrateurs du salon.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xs text-left text-xs text-gray-300 space-y-2.5">
              <div className="flex items-center gap-1.5 text-gold font-bold font-mono text-[11px] uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Comment obtenir l'accès ?</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Demandez à l'administrateur principal de <span className="text-white font-semibold">Final Stop Barber Shop</span> d'ajouter votre adresse email (<code className="text-gold font-mono">{currentUser.email}</code>) dans la section <strong>"Équipe Admins"</strong> du tableau de bord.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all rounded-xs border border-white/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se connecter avec un autre compte Google</span>
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs text-gray-500 hover:text-gray-300 py-1 cursor-pointer bg-transparent border-none"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Security Gate: 2-step verification (Code boutique -> Google Login)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
        <header className="bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
              <span>Retour au site public</span>
            </button>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-xs">
              <Lock className="w-3 h-3 text-gold" />
              <span>Accès Restreint</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-[#111115] border border-white/10 rounded-xs shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-3">
                  <Shield className="w-7 h-7 text-gold" />
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide mb-1.5">
                  Console Administrateur
                </h1>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Espace sécurisé réservé à l'équipe de <span className="text-gold font-semibold">Final Stop Barber Shop</span>.
                </p>
              </div>

              {/* Auto-logout notification */}
              {autoLogoutNotice && (
                <div className="bg-amber-500/15 border border-amber-500/40 p-3.5 rounded-xs text-left flex items-start gap-2.5 text-xs text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{autoLogoutNotice}</span>
                </div>
              )}

              {/* Sign in error notice */}
              {signInError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xs text-left flex items-start gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{signInError}</span>
                </div>
              )}

              {/* Explanatory Info Card */}
              <div className="bg-gold/5 border border-gold/20 p-4 rounded-xs text-xs text-gray-300 leading-relaxed text-left space-y-2">
                <div className="flex items-center gap-2 text-gold font-semibold text-xs uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Accès Direct par Compte Google</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Connectez-vous directement avec votre compte Google. La <strong>première personne connectée</strong> est automatiquement enregistrée comme administrateur principal et pourra inviter les autres membres de l'équipe.
                </p>
              </div>

              {/* Direct Google Sign In Button */}
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
                      <span>Connexion Google en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Connectez-vous à finalstop.org (Google)</span>
                    </>
                  )}
                </button>

                {/* Guide for custom domain setup */}
                <button
                  type="button"
                  onClick={() => setIsDomainGuideOpen(true)}
                  className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-gold hover:text-gold-light border border-gold/30 rounded-xs text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Afficher finalstop.org au lieu de Firebase (Guide Domaine)</span>
                </button>

                {unauthorizedDomain && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xs text-left text-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Domaine non autorisé dans Firebase Authentication</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Le domaine <code className="bg-black/60 px-1.5 py-0.5 rounded text-gold font-mono">{unauthorizedDomain}</code> doit être ajouté dans votre console Firebase (Authentication &gt; Settings &gt; Authorized domains) pour autoriser la connexion Google.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={copyDomainToClipboard}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xs text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copié !' : 'Copier le domaine'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-gray-500 font-mono text-center pt-2">
                Authentification Google sécurisée &bull; Final Stop Barber Shop
              </p>
            </div>
          </div>
        </main>

        {/* Domain OAuth Modal */}
        <DomainOAuthModal 
          isOpen={isDomainGuideOpen} 
          onClose={() => setIsDomainGuideOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      
      {/* Header - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none shrink-0"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span className="hidden sm:inline">Back to Public Site</span>
            <span className="sm:hidden">Site</span>
          </button>

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
                <span className="text-[11px] font-mono text-gray-300 hidden md:inline truncate max-w-[150px]">
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
              title="Gérer les comptes Google autorisés comme administrateurs"
            >
              <Users className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Équipe Admins</span>
              <span className="px-1.5 py-0.5 bg-gold/20 text-gold text-[10px] rounded-full font-bold">
                {adminEmails.length}
              </span>
            </button>

            <button
              type="button"
              onClick={loadAllData}
              className="text-xs text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 border border-white/10 px-2.5 py-1.5 rounded-xs cursor-pointer bg-transparent"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 border border-white/10 hover:border-red-500/40 px-2.5 py-1.5 rounded-xs cursor-pointer bg-transparent font-mono"
              title="Déconnexion et verrouillage"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* First Admin Congratulations Banner */}
      {isFirstAdminNotice && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-[13px]">
                  Félicitations ! Vous êtes le premier administrateur enregistré.
                </p>
                <p className="text-emerald-300 text-[11px] mt-0.5">
                  Votre compte Google (<code className="text-white font-mono font-bold">{currentUser?.email}</code>) est configuré comme administrateur principal. Vous pouvez maintenant ajouter les adresses email de vos collègues barbiers en cliquant sur le bouton <strong>"Équipe Admins"</strong> ci-dessus.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFirstAdminNotice(false)}
              className="text-emerald-400 hover:text-white p-1.5 cursor-pointer bg-transparent border-none shrink-0"
              title="Fermer ce message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner & Master Barber Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Final Stop Administration Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Manage client reservations, real-time walk-in queue, and Firestore photo gallery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSeedFirestore}
              disabled={isSeeding}
              className="bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer rounded-sm"
              title="Seed initial Firestore data & curated photos"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Syncing...' : 'Sync Firestore Database'}</span>
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

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          
          {/* Card 1: Waitlist Toggle */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Walk-In Desk State</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className={`text-lg font-bold font-serif ${isWaitlistOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isWaitlistOpen ? 'OPEN (Walk-ins active)' : 'CLOSED (Appointments only)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleWaitlist}
              className="mt-2 text-xs font-bold uppercase tracking-wider py-2 px-3 border border-white/15 hover:border-gold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isWaitlistOpen ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
              <span>Toggle Walk-In Desk</span>
            </button>
          </div>

          {/* Card 2: Reservations count */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Total Bookings</span>
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {reservations.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Confirmed client slots
            </span>
          </div>

          {/* Card 3: Gallery Photos in Database */}
          <div className="bg-[#141418] border border-white/10 p-5 flex flex-col justify-between rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-gray-400">Database Photos</span>
              <ImageIcon className="w-4 h-4 text-gold" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {galleryPhotos.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Mika (Braids) &bull; Lusca (Cuts)
            </span>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 font-bold ${
              activeTab === 'appointments'
                ? 'border-gold text-gold bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Appointments ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waitlist')}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 font-bold ${
              activeTab === 'waitlist'
                ? 'border-gold text-gold bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Walk-In Queue ({waitlist.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 font-bold flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-gold text-gold bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-gold" />
            <span>Photos Database ({galleryPhotos.length})</span>
          </button>
        </div>

        {/* TAB 1: Appointments Table */}
        {activeTab === 'appointments' && (
          <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                <span>Confirmed Bookings in Firestore ({reservations.length})</span>
              </h2>
              <span className="text-xs font-mono text-gray-400">
                Synced with Firestore
              </span>
            </div>

            {reservations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-mono">
                No appointments recorded at this moment. Click "Sync Firestore Database" to load sample bookings.
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
                      <th className="pb-3 px-4">Date & Time</th>
                      <th className="pb-3 px-4">Price</th>
                      <th className="pb-3 pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reservations.map((res: any, i) => (
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
                        <td className="py-3.5 pl-4">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase font-bold">
                            {res.status || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Walk-In Queue Table */}
        {activeTab === 'waitlist' && (
          <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                <span>Live Walk-In Queue ({waitlist.length})</span>
              </h2>
              <span className="text-xs font-mono text-gray-400">
                Real-time queue desk
              </span>
            </div>

            {waitlist.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-mono">
                No clients currently waiting in the live queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                      <th className="pb-3 pr-4">Pos</th>
                      <th className="pb-3 px-4">Ticket</th>
                      <th className="pb-3 px-4">Client Name</th>
                      <th className="pb-3 px-4">Barber</th>
                      <th className="pb-3 px-4">Service</th>
                      <th className="pb-3 px-4">Check-in Time</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
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
                            Mark Completed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Photos & Gallery Database */}
        {activeTab === 'gallery' && (
          <div className="space-y-10">
            
            {/* Add New Photo Form */}
            <div className="bg-[#141418] border border-gold/30 p-6 rounded-sm shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gold" />
                    <span>Add New Photo to Firestore Database</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload hairstyles with attribution (Mika for girls' braids, Lusca for boys' cuts).
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
                    <option value="Mika">Mika (Master Braider &bull; Girls’ Braids & Locs)</option>
                    <option value="Lusca">Lusca (Master Barber &bull; Boys’ & Men’s Cuts)</option>
                    <option value="Both">Both (Mika & Lusca &bull; Barbershop Lounge)</option>
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
                    <option value="Braids & Cornrows">Braids & Cornrows</option>
                    <option value="Locs & Twists">Locs & Twists</option>
                    <option value="Skin Fades">Skin Fades</option>
                    <option value="Beards & Shaves">Beards & Shaves</option>
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
                    <option value="Women & Girls (Braids)">Women & Girls (Braids)</option>
                    <option value="Men & Boys (Haircuts)">Men & Boys (Haircuts)</option>
                    <option value="Shop">Shop Facility</option>
                  </select>
                </div>

                {/* Direct Image File Upload & Camera Selector */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-mono text-gold font-bold block flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Importer la Photo Directement (Fichier ou Appareil Photo) *</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">PNG, JPG, WEBP jusqu'à 15 Mo</span>
                  </div>

                  {/* Hidden native input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-photo-file-input"
                  />

                  {/* Dropzone & Button */}
                  {!filePreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gold/40 hover:border-gold bg-[#0A0A0B] p-6 text-center cursor-pointer transition-all duration-200 group rounded-xs hover:bg-gold/5 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        Cliquez pour choisir une photo depuis votre téléphone ou ordinateur
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Prenez une photo en direct ou sélectionnez depuis votre galerie
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
                            {(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0)} Mo &bull; Prête pour le téléversement
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="Supprimer la photo sélectionnée"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Alternative URL Link (Optional fallback) */}
                  <div className="pt-2 border-t border-white/10">
                    <details className="group">
                      <summary className="text-[11px] font-mono text-gray-400 cursor-pointer hover:text-gold flex items-center gap-1">
                        <span>Ou coller une URL d'image existante (Optionnel)</span>
                      </summary>
                      <div className="mt-2 space-y-2 pl-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => {
                            setNewImageUrl(e.target.value);
                            if (e.target.value) handleClearSelectedFile();
                          }}
                          placeholder="https://i.ibb.co/... ou lien Cloudflare / CDN"
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
                            <span className="text-[10px] font-mono text-gray-400">Aperçu via URL</span>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Technique & Style Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe the parting technique, tension control, fade millimeter precision, products used, or styling advice..."
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
                        ? 'Téléversement de la photo...' 
                        : isSavingImage 
                        ? 'Enregistrement dans Firebase...' 
                        : 'Enregistrer la photo dans la galerie'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Current Photos in Firestore Grid */}
            <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gold" />
                  <span>Photos Active in Database ({galleryPhotos.length})</span>
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  Visible to public clients
                </span>
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs font-mono">
                  No photos found in database. Click "Sync Firestore Database" above to load initial portfolio.
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
                  Équipe d'Administrateurs
                </h3>
                <p className="text-[11px] text-gray-400">
                  Gérez les comptes Google autorisés à administrer Final Stop Barber Shop
                </p>
              </div>
            </div>

            <div className="overflow-y-auto pr-1 space-y-5 flex-1">
              {/* Form to add a new admin email */}
              <form onSubmit={handleAddAdminEmail} className="bg-white/5 border border-white/10 p-4 rounded-xs space-y-3">
                <label htmlFor="newAdminEmailInput" className="block text-xs font-mono text-gray-300 uppercase tracking-wider">
                  Ajouter un nouvel administrateur :
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
                      placeholder="nom.barbier@gmail.com"
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
                    <span>Ajouter</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  Entrez l'adresse email exacte utilisée par la personne pour se connecter à son compte Google.
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
                  <span>Administrateurs autorisés ({adminEmails.length})</span>
                  <span className="text-[10px] text-gray-500">Base Firestore</span>
                </div>

                {adminEmails.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500 bg-white/5 rounded-xs">
                    Aucun administrateur enregistré pour le moment.
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
                                  Votre compte actuel
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAdminEmail(email)}
                            disabled={isUpdatingAdmin || adminEmails.length <= 1}
                            title={adminEmails.length <= 1 ? "Impossible de supprimer le dernier administrateur" : "Retirer cet administrateur"}
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
                  Règle de sécurité en 2 étapes :
                </p>
                <p>
                  1. Tout nouvel administrateur doit d'abord entrer le <strong>code secret boutique</strong>.
                </p>
                <p>
                  2. Ensuite, il doit se connecter avec son <strong>compte Google</strong> figurant dans la liste ci-dessus.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
