/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TeamAndPricing from './components/TeamAndPricing';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import BookingPage from './pages/BookingPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import CheckStatusModal from './components/CheckStatusModal';
import WalkInHubModal, { ModalMode } from './components/WalkInHubModal';
import ClientStatusHub from './components/ClientStatusHub';
import OwnerWaitlistModal from './components/OwnerWaitlistModal';
import WelcomePromoModal from './components/WelcomePromoModal';
import CallShopModal from './components/CallShopModal';
import NotificationAndPwaModal from './components/NotificationAndPwaModal';
import NotificationPermissionBanner from './components/NotificationPermissionBanner';
import MobilePwaApp from './components/MobilePwaApp';
import Style360Viewer from './components/Style360Viewer';
import { getIsWaitlistOpen } from './lib/waitlistService';
import { registerServiceWorker } from './lib/pwa';
import { Smartphone } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'booking' | 'route'>(() => {
    if (window.location.hash === '#booking') return 'booking';
    if (window.location.hash === '#route') return 'route';
    return 'home';
  });

  // Standalone PWA detection:
  // Strictly for installed PWAs (display-mode: standalone, iOS standalone, ?source=pwa, or #pwa)
  // Standard mobile web browser visitors keep the responsive website ("ancien version web") as requested.
  const checkIsPwaInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      window.location.search.includes('source=pwa') ||
      window.location.hash.includes('pwa')
    );
  };

  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(checkIsPwaInstalled);
  const [forceWebView, setForceWebView] = useState<boolean>(false);

  // Modals state for menu action items
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [hubMode, setHubMode] = useState<ModalMode>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  // Shop Owner-controlled waitlist state (Default: closed until owner opens it)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState<boolean>(getIsWaitlistOpen);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Register PWA Service Worker on initial startup
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Update PWA detection on resize and URL hash changes
  useEffect(() => {
    const handleCheckPwa = () => {
      setIsPwaInstalled(checkIsPwaInstalled());
    };
    const handleOpen360 = () => setIs360ModalOpen(true);

    window.addEventListener('resize', handleCheckPwa);
    window.addEventListener('hashchange', handleCheckPwa);
    window.addEventListener('open-360-modal', handleOpen360);
    return () => {
      window.removeEventListener('resize', handleCheckPwa);
      window.removeEventListener('hashchange', handleCheckPwa);
      window.removeEventListener('open-360-modal', handleOpen360);
    };
  }, []);

  // Global call modal and notification modal listeners
  useEffect(() => {
    const handleOpenCall = () => setIsCallModalOpen(true);
    const handleOpenNotifications = () => setIsNotificationModalOpen(true);
    window.addEventListener('open-call-modal', handleOpenCall);
    window.addEventListener('open-notification-modal', handleOpenNotifications);
    return () => {
      window.removeEventListener('open-call-modal', handleOpenCall);
      window.removeEventListener('open-notification-modal', handleOpenNotifications);
    };
  }, []);

  // Timed VIP Welcome Promo Pop-up (strictly 5 seconds after arrival)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPromoModalOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWaitlistChange = (e: any) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setIsWaitlistOpen(e.detail.isOpen);
      }
    };
    window.addEventListener('waitlist-status-changed', handleWaitlistChange);
    return () => window.removeEventListener('waitlist-status-changed', handleWaitlistChange);
  }, []);

  const handleOpenCheckStatus = (initialQuery?: string) => {
    setStatusQuery(initialQuery || '');
    setIsStatusModalOpen(true);
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#booking') {
        setCurrentView('booking');
      } else if (window.location.hash === '#route') {
        setCurrentView('route');
      } else if (!window.location.hash || window.location.hash === '#') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToBooking = (serviceName?: string) => {
    if (serviceName) {
      window.location.hash = `#booking?service=${encodeURIComponent(serviceName)}`;
    } else {
      window.location.hash = '#booking';
    }
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRoutePlanner = () => {
    window.location.hash = '#route';
    setCurrentView('route');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.history.pushState(null, '', window.location.pathname);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'booking') {
    return <BookingPage onBackToHome={navigateToHome} />;
  }

  if (currentView === 'route') {
    return <RoutePlannerPage onBackToHome={navigateToHome} />;
  }

  // Dedicated Mobile PWA Experience (Strictly for installed PWA mode, normal mobile browsers stay on web)
  if (isPwaInstalled && !forceWebView && currentView === 'home') {
    return (
      <>
        <MobilePwaApp
          onNavigateToBooking={(serviceName) => {
            if (serviceName) {
              window.location.hash = `#booking?service=${encodeURIComponent(serviceName)}`;
            } else {
              window.location.hash = '#booking';
            }
            setCurrentView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToRoutePlanner={navigateToRoutePlanner}
          onOpenCheckStatus={() => handleOpenCheckStatus()}
          onOpenCallModal={() => setIsCallModalOpen(true)}
          onOpenWaitlist={() => setHubMode('waitlist')}
          isWaitlistOpen={isWaitlistOpen}
          onSwitchToWebView={() => setForceWebView(true)}
        />

        {/* 1. Dedicated 'Check My Status' Modal */}
        <CheckStatusModal 
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setStatusQuery('');
          }}
          onOpenWaitlist={() => setHubMode('waitlist')}
          initialQuery={statusQuery}
          isWaitlistOpen={isWaitlistOpen}
          onNavigateToBooking={navigateToBooking}
        />

        {/* 2. Walk-in Waitlist Modal */}
        <WalkInHubModal 
          mode={hubMode}
          onClose={() => setHubMode(null)}
          onOpenStatusCheck={() => handleOpenCheckStatus()}
          isWaitlistOpen={isWaitlistOpen}
          onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
          onNavigateToBooking={navigateToBooking}
        />

        {/* 3. Shop Owner Waitlist Control Modal */}
        <OwnerWaitlistModal 
          isOpen={isOwnerModalOpen}
          onClose={() => setIsOwnerModalOpen(false)}
          isWaitlistOpen={isWaitlistOpen}
          onStatusChange={(newState) => setIsWaitlistOpen(newState)}
        />

        {/* 4. Direct Phone Lines Modal (2 shop numbers) */}
        <CallShopModal 
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
        />

        {/* 5. 6-Second Notification Permission Pop-up Banner */}
        <NotificationPermissionBanner />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
      {/* Switch back to mobile PWA mode pill if in PWA standalone */}
      {isPwaInstalled && forceWebView && (
        <button
          type="button"
          onClick={() => setForceWebView(false)}
          className="fixed bottom-4 left-4 z-40 bg-gold hover:bg-gold-light text-black font-mono font-bold text-xs py-2 px-3.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-black/20 cursor-pointer active:scale-95 transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span>Mode App Mobile PWA</span>
        </button>
      )}

      {/* Top Navbar with Client Services (Status check, Waitlist, VIP Club) */}
      <Navbar 
        onNavigateToBooking={navigateToBooking}
        onOpenCheckStatus={() => handleOpenCheckStatus()}
        onOpenWaitlist={() => setHubMode('waitlist')}
        onOpenPromo={() => setIsPromoModalOpen(true)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
        isWaitlistOpen={isWaitlistOpen}
      />

      {/* Hero section with Book Appointment & Explore Our Work */}
      <Hero onNavigateToBooking={navigateToBooking} />

      <main>
        {/* Barbers craft specialties and rates */}
        <TeamAndPricing onNavigateToBooking={() => navigateToBooking()} />
        
        {/* Client Status Hub & Live Queue */}
        <ClientStatusHub 
          onOpenCheckStatus={handleOpenCheckStatus}
          onOpenWaitlist={() => setHubMode('waitlist')}
          onOpenPromo={() => setIsPromoModalOpen(true)}
          isWaitlistOpen={isWaitlistOpen}
          onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
          onNavigateToBooking={navigateToBooking}
        />

        {/* Realizations portfolio */}
        <Gallery onOpen360={() => setIs360ModalOpen(true)} />
        
        {/* Location & Map Section with interactive map & route planner */}
        <MapSection onNavigateToRoutePlanner={navigateToRoutePlanner} />

        {/* Google Reviews testimonials */}
        <Testimonials />
        
        {/* FAQ section (last) */}
        <FAQ />
      </main>

      <Footer 
        onNavigateToBooking={navigateToBooking} 
        onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
      />

      {/* 1. Dedicated 'Check My Status' Modal */}
      <CheckStatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusQuery('');
        }}
        onOpenWaitlist={() => setHubMode('waitlist')}
        initialQuery={statusQuery}
        isWaitlistOpen={isWaitlistOpen}
        onNavigateToBooking={navigateToBooking}
      />

      {/* 2. Walk-in Waitlist Modal */}
      <WalkInHubModal 
        mode={hubMode}
        onClose={() => setHubMode(null)}
        onOpenStatusCheck={() => handleOpenCheckStatus()}
        isWaitlistOpen={isWaitlistOpen}
        onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
        onNavigateToBooking={navigateToBooking}
      />

      {/* 3. Shop Owner Waitlist Control Modal */}
      <OwnerWaitlistModal 
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        isWaitlistOpen={isWaitlistOpen}
        onStatusChange={(newState) => setIsWaitlistOpen(newState)}
      />

      {/* 4. Timed Welcome VIP 15% Off Pop-up Modal */}
      <WelcomePromoModal 
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onNavigateToBooking={navigateToBooking}
      />

      {/* 5. Direct Phone Lines Modal (2 shop numbers) */}
      <CallShopModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

      {/* 6. PWA Installation & Notifications Center */}
      <NotificationAndPwaModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* 7. 6-Second Notification Permission Pop-up Banner */}
      <NotificationPermissionBanner />

      {/* 8. 360 Studio & Haircare Products Inspection Modal */}
      {is360ModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-4xl relative">
            <Style360Viewer
              onClose={() => setIs360ModalOpen(false)}
              onSelectServiceForBooking={(srv) => {
                setIs360ModalOpen(false);
                navigateToBooking(srv);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
