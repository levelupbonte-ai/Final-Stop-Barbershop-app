/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Lenis from 'lenis';

// Dedicated page folders (each interface in its own folder under src/pages/)
import HomePage from './pages/home';
import BarberProfilePage from './pages/barber-profile';
import BarbersPage from './pages/barbers';
import ServicesPage from './pages/services';
import WaitlistPage from './pages/waitlist';
import GalleryPage from './pages/gallery';
import ReviewsPage from './pages/reviews';
import BookingPage from './pages/booking';
import RoutePlannerPage from './pages/route';
import NotFoundPage from './pages/not-found';

// Modals
import CheckStatusModal from './components/CheckStatusModal';
import WalkInHubModal, { ModalMode } from './components/WalkInHubModal';
import CallShopModal from './components/CallShopModal';
import ShopPoliciesModal from './components/ShopPoliciesModal';
import { useSiteData } from './lib/site/SiteDataProvider';
import { updateDocumentSEO } from './lib/seo';

export type ActiveView = 
  | 'home' 
  | 'barbers' 
  | 'barber-profile' 
  | 'services' 
  | 'waitlist' 
  | 'booking' 
  | 'route' 
  | 'gallery' 
  | 'reviews'
  | 'not-found';

interface ParsedLocation {
  view: ActiveView;
  barberId?: string;
  cleanPath?: string;
}

function parseBrowserLocation(validBarberIds: string[]): ParsedLocation {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  // If a legacy #hash exists in the URL, convert it immediately to a clean pathname
  const rawHash = window.location.hash.replace(/^#\/?/, '');
  if (rawHash) {
    const [hashView, hashQuery] = rawHash.split('?');
    if (hashView === 'barber-profile') {
      const match = hashQuery?.match(/id=([a-z0-9-]+)/i);
      const bId = match?.[1];
      return {
        view: 'barber-profile',
        barberId: bId,
        cleanPath: bId ? `/barbers/${bId}` : '/barber-profile',
      };
    }
    if (
      hashView === 'barbers' ||
      hashView === 'services' ||
      hashView === 'waitlist' ||
      hashView === 'booking' ||
      hashView === 'route' ||
      hashView === 'gallery' ||
      hashView === 'reviews'
    ) {
      return {
        view: hashView as ActiveView,
        cleanPath: `/${hashView}`,
      };
    }
  }

  // Parse clean pathname (no # in URL)
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);

  if (pathname === '/' || pathname === '/home' || pathname === '/index.html') {
    return { view: 'home', cleanPath: pathname === '/' ? undefined : '/' };
  }
  if (pathname === '/barbers') {
    return { view: 'barbers' };
  }
  if (pathname.startsWith('/barbers/')) {
    const slug = pathname.replace('/barbers/', '').trim().toLowerCase();
    if (slug && (validBarberIds.length === 0 || validBarberIds.includes(slug))) {
      return { view: 'barber-profile', barberId: slug };
    }
    return { view: 'not-found' };
  }
  if (pathname === '/barber-profile') {
    const bId = searchParams.get('id') || undefined;
    return { view: 'barber-profile', barberId: bId };
  }
  if (pathname === '/services' || pathname === '/pricing') {
    return { view: 'services' };
  }
  if (pathname === '/waitlist' || pathname === '/queue') {
    return { view: 'waitlist' };
  }
  if (pathname === '/booking' || pathname === '/book') {
    return { view: 'booking' };
  }
  if (pathname === '/route' || pathname === '/directions') {
    return { view: 'route' };
  }
  if (pathname === '/gallery' || pathname === '/portfolio') {
    return { view: 'gallery' };
  }
  if (pathname === '/reviews' || pathname === '/testimonials') {
    return { view: 'reviews' };
  }

  return { view: 'not-found' };
}

export default function App() {
  const { site, barbers } = useSiteData();
  const validBarberIds = barbers.map((b) => b.id);
  const defaultBarberId = barbers[0]?.id ?? '';

  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    return parseBrowserLocation(validBarberIds).view;
  });

  const [selectedBarberId, setSelectedBarberId] = useState<string>(() => {
    const parsed = parseBrowserLocation(validBarberIds);
    if (parsed.barberId && barbers.some((b) => b.id === parsed.barberId)) {
      return parsed.barberId;
    }
    return defaultBarberId;
  });

  // Selected service for booking pre-selection
  const [bookingService, setBookingService] = useState<string | undefined>(undefined);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [hubMode, setHubMode] = useState<ModalMode>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

  // Waitlist open/closed is managed by the shop from the LevelUp dashboard.
  const isWaitlistOpen = site.features.includes('waitlist') && site.waitlist.open;

  // Dynamic SEO Synchronization per page/view
  useEffect(() => {
    updateDocumentSEO(currentView);
  }, [currentView]);

  // Lenis Smooth Scroll (v0 Template Inertia Scroll)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [currentView]);

  // Sync location on mount (strip any legacy #hash) and on browser Back / Forward
  const syncLocationState = useCallback(() => {
    const parsed = parseBrowserLocation(barbers.map((b) => b.id));
    if (parsed.cleanPath) {
      window.history.replaceState(null, '', parsed.cleanPath);
    }
    setCurrentView(parsed.view);
    if (parsed.barberId && barbers.some((b) => b.id === parsed.barberId)) {
      setSelectedBarberId(parsed.barberId);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [barbers]);

  useEffect(() => {
    syncLocationState();
    window.addEventListener('popstate', syncLocationState);
    window.addEventListener('hashchange', syncLocationState);
    return () => {
      window.removeEventListener('popstate', syncLocationState);
      window.removeEventListener('hashchange', syncLocationState);
    };
  }, [syncLocationState]);

  // Global call modal listener
  useEffect(() => {
    const handleOpenCall = () => setIsCallModalOpen(true);
    window.addEventListener('open-call-modal', handleOpenCall);
    return () => window.removeEventListener('open-call-modal', handleOpenCall);
  }, []);

  // Clean Pathname Navigation (Zero # hashes in the browser address bar)
  const navigateTo = (view: ActiveView, params?: { barberId?: string; service?: string }) => {
    if (params?.barberId) {
      setSelectedBarberId(params.barberId);
    }
    if (params?.service) {
      setBookingService(params.service);
    }

    let nextPath = '/';
    if (view === 'home') {
      nextPath = '/';
    } else if (view === 'barber-profile') {
      const bId = params?.barberId || selectedBarberId || defaultBarberId;
      nextPath = bId ? `/barbers/${bId}` : '/barber-profile';
    } else if (view === 'not-found') {
      nextPath = '/404';
    } else {
      nextPath = `/${view}`;
    }

    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.pushState(null, '', nextPath);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCheckStatus = (initialQuery?: string) => {
    setStatusQuery(initialQuery || '');
    setIsStatusModalOpen(true);
  };

  // Render active page from its dedicated folder
  const renderPage = () => {
    switch (currentView) {
      case 'barber-profile':
        return (
          <BarberProfilePage
            barberId={selectedBarberId}
            onBackToHome={() => navigateTo('home')}
            onNavigateToBooking={(barberId, service) => navigateTo('booking', { barberId, service })}
            onOpenWaitlist={(barberId) => navigateTo('waitlist', { barberId })}
            onSwitchBarber={(nextBarberId) => navigateTo('barber-profile', { barberId: nextBarberId })}
          />
        );

      case 'barbers':
        return (
          <BarbersPage
            onBackToHome={() => navigateTo('home')}
            onSelectBarber={(barberId) => navigateTo('barber-profile', { barberId })}
            onNavigateToBooking={(barberId) => navigateTo('booking', { barberId })}
            onOpenWaitlist={(barberId) => navigateTo('waitlist', { barberId })}
          />
        );

      case 'services':
        return (
          <ServicesPage
            onBackToHome={() => navigateTo('home')}
            onNavigateToBooking={(serviceId) => navigateTo('booking', { service: serviceId })}
            onNavigateToBarbers={() => navigateTo('barbers')}
          />
        );

      case 'waitlist':
        return (
          <WaitlistPage
            onBackToHome={() => navigateTo('home')}
            onNavigateToBooking={() => navigateTo('booking')}
            initialBarber={selectedBarberId}
            isWaitlistOpen={isWaitlistOpen}
          />
        );

      case 'booking':
        return (
          <BookingPage
            onBackToHome={() => navigateTo('home')}
            initialBarber={selectedBarberId}
            initialService={bookingService}
          />
        );

      case 'route':
        return <RoutePlannerPage onBackToHome={() => navigateTo('home')} />;

      case 'gallery':
        return (
          <GalleryPage
            onBackToHome={() => navigateTo('home')}
            onNavigateToBooking={(service, barberId) => navigateTo('booking', { service, barberId })}
            onNavigateToBarbers={() => navigateTo('barbers')}
          />
        );

      case 'reviews':
        return (
          <ReviewsPage
            onBackToHome={() => navigateTo('home')}
            onNavigateToBooking={() => navigateTo('booking')}
            onNavigateToBarbers={() => navigateTo('barbers')}
          />
        );

      case 'not-found':
        return (
          <NotFoundPage
            isWaitlistOpen={isWaitlistOpen}
            onNavigateToView={(view) => navigateTo(view as ActiveView)}
            onNavigateToBooking={() => navigateTo('booking')}
            onOpenCheckStatus={() => handleOpenCheckStatus()}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenPolicies={() => setIsPoliciesOpen(true)}
          />
        );

      case 'home':
      default:
        return (
          <HomePage
            isWaitlistOpen={isWaitlistOpen}
            onNavigateToView={(view) => navigateTo(view as ActiveView)}
            onNavigateToBooking={(params) => navigateTo('booking', params)}
            onSelectBarber={(barberId) => navigateTo('barber-profile', { barberId })}
            onOpenCheckStatus={handleOpenCheckStatus}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenPolicies={() => setIsPoliciesOpen(true)}
          />
        );
    }
  };

  return (
    <>
      {renderPage()}

      {/* Salon Policies & Safety Rules Modal */}
      <ShopPoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Dedicated 'Check My Status' Modal */}
      <CheckStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusQuery('');
        }}
        onOpenWaitlist={() => navigateTo('waitlist')}
        initialQuery={statusQuery}
        isWaitlistOpen={isWaitlistOpen}
        onNavigateToBooking={() => navigateTo('booking')}
      />

      {/* Walk-in Waitlist Modal */}
      <WalkInHubModal
        mode={hubMode}
        onClose={() => setHubMode(null)}
        onOpenStatusCheck={() => handleOpenCheckStatus()}
        isWaitlistOpen={isWaitlistOpen}
        onNavigateToBooking={() => navigateTo('booking')}
      />

      {/* Direct Phone Lines Modal */}
      <CallShopModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />
    </>
  );
}
