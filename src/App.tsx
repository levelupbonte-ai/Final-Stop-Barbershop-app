/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar, { NavView } from './components/Navbar';
import Hero from './components/Hero';
import TeamAndPricing from './components/TeamAndPricing';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import MapSection from './components/MapSection';
import Footer from './components/Footer';

// Full dedicated pages
import BarberProfilePage from './pages/BarberProfilePage';
import BarbersPage from './pages/BarbersPage';
import ServicesPage from './pages/ServicesPage';
import WaitlistPage from './pages/WaitlistPage';
import GalleryPage from './pages/GalleryPage';
import ReviewsPage from './pages/ReviewsPage';
import BookingPage from './pages/BookingPage';
import RoutePlannerPage from './pages/RoutePlannerPage';

// Modals
import CheckStatusModal from './components/CheckStatusModal';
import WalkInHubModal, { ModalMode } from './components/WalkInHubModal';
import ClientStatusHub from './components/ClientStatusHub';
import WelcomePromoModal from './components/WelcomePromoModal';
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
  | 'reviews';

export default function App() {
  // Parse initial view from pathname or hash if present
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('barber-profile')) return 'barber-profile';
      if (hash === 'barbers') return 'barbers';
      if (hash === 'services') return 'services';
      if (hash === 'waitlist') return 'waitlist';
      if (hash === 'booking') return 'booking';
      if (hash === 'route') return 'route';
      if (hash === 'gallery') return 'gallery';
      if (hash === 'reviews') return 'reviews';
    }
    return 'home';
  });

  // Selected barber for profile or booking
  const { site, barbers } = useSiteData();
  const defaultBarberId = barbers[0]?.id ?? '';
  const [selectedBarberId, setSelectedBarberId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.hash.match(/id=([a-z0-9-]+)/);
      if (match && barbers.some((b) => b.id === match[1])) return match[1];
    }
    return defaultBarberId;
  });

  // Selected service for booking pre-selection
  const [bookingService, setBookingService] = useState<string | undefined>(undefined);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [hubMode, setHubMode] = useState<ModalMode>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

  // Waitlist open/closed is managed by the shop from the LevelUp dashboard.
  const isWaitlistOpen = site.features.includes('waitlist') && site.waitlist.open;

  // Dynamic SEO Synchronization per page/view
  useEffect(() => {
    updateDocumentSEO(currentView);
  }, [currentView]);

  // Hash change listener for browser navigation (Back / Forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      const [viewName, queryStr] = rawHash.split('?');

      if (viewName === 'barber-profile') {
        setCurrentView('barber-profile');
        const match = queryStr?.match(/id=([a-z0-9-]+)/);
        if (match && barbers.some((b) => b.id === match[1])) {
          setSelectedBarberId(match[1]);
        }
      } else if (
        viewName === 'barbers' ||
        viewName === 'services' ||
        viewName === 'waitlist' ||
        viewName === 'booking' ||
        viewName === 'route' ||
        viewName === 'gallery' ||
        viewName === 'reviews'
      ) {
        setCurrentView(viewName as ActiveView);
      } else {
        setCurrentView('home');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [barbers]);

  // Global call modal listener
  useEffect(() => {
    const handleOpenCall = () => setIsCallModalOpen(true);
    window.addEventListener('open-call-modal', handleOpenCall);
    return () => window.removeEventListener('open-call-modal', handleOpenCall);
  }, []);

  // Timed VIP welcome pop-up, configured from the dashboard (website_settings.promo_popup).
  useEffect(() => {
    if (!site.promoPopup.enabled) return;
    const timer = setTimeout(() => {
      setIsPromoModalOpen(true);
    }, site.promoPopup.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [site.promoPopup.enabled, site.promoPopup.delaySeconds]);

  // Navigation handlers
  const navigateTo = (view: ActiveView, params?: { barberId?: string; service?: string }) => {
    if (params?.barberId) {
      setSelectedBarberId(params.barberId);
    }
    if (params?.service) {
      setBookingService(params.service);
    }

    if (view === 'barber-profile') {
      const bId = params?.barberId || selectedBarberId;
      window.location.hash = `#barber-profile?id=${bId}`;
    } else if (view === 'home') {
      window.history.pushState(null, '', '/');
    } else {
      window.location.hash = `#${view}`;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCheckStatus = (initialQuery?: string) => {
    setStatusQuery(initialQuery || '');
    setIsStatusModalOpen(true);
  };

  // 1. PAGE: Barber Profile Page 
  if (currentView === 'barber-profile') {
    return (
      <BarberProfilePage
        barberId={selectedBarberId}
        onBackToHome={() => navigateTo('home')}
        onNavigateToBooking={(barberId) => navigateTo('booking', { barberId })}
        onOpenWaitlist={(barberId) => navigateTo('waitlist', { barberId })}
        onSwitchBarber={(nextBarberId) => navigateTo('barber-profile', { barberId: nextBarberId })}
      />
    );
  }

  // 2. PAGE: All Barbers Overview
  if (currentView === 'barbers') {
    return (
      <BarbersPage
        onBackToHome={() => navigateTo('home')}
        onSelectBarber={(barberId) => navigateTo('barber-profile', { barberId })}
        onNavigateToBooking={(barberId) => navigateTo('booking', { barberId })}
        onOpenWaitlist={(barberId) => navigateTo('waitlist', { barberId })}
      />
    );
  }

  // 3. PAGE: Full Services & Pricing Menu
  if (currentView === 'services') {
    return (
      <ServicesPage
        onBackToHome={() => navigateTo('home')}
        onNavigateToBooking={(serviceId) => navigateTo('booking', { service: serviceId })}
        onNavigateToBarbers={() => navigateTo('barbers')}
      />
    );
  }

  // 4. PAGE: Live Walk-In Waitlist & Queue
  if (currentView === 'waitlist') {
    return (
      <WaitlistPage
        onBackToHome={() => navigateTo('home')}
        onNavigateToBooking={() => navigateTo('booking')}
        initialBarber={selectedBarberId}
        isWaitlistOpen={isWaitlistOpen}
      />
    );
  }

  // 5. PAGE: Full Booking Experience
  if (currentView === 'booking') {
    return (
      <BookingPage 
        onBackToHome={() => navigateTo('home')} 
        initialBarber={selectedBarberId}
        initialService={bookingService}
      />
    );
  }

  // 6. PAGE: Route Planner (Mapbox Directions)
  if (currentView === 'route') {
    return <RoutePlannerPage onBackToHome={() => navigateTo('home')} />;
  }

  // 7. PAGE: Portfolio Gallery
  if (currentView === 'gallery') {
    return (
      <GalleryPage
        onBackToHome={() => navigateTo('home')}
        onNavigateToBooking={() => navigateTo('booking')}
        onNavigateToBarbers={() => navigateTo('barbers')}
      />
    );
  }

  // 8. PAGE: Reviews Page
  if (currentView === 'reviews') {
    return (
      <ReviewsPage
        onBackToHome={() => navigateTo('home')}
        onNavigateToBooking={() => navigateTo('booking')}
        onNavigateToBarbers={() => navigateTo('barbers')}
      />
    );
  }

  // 10. PAGE: Default Home Page
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
      
      {/* Top Navbar */}
      <Navbar 
        currentView="home"
        onNavigateToBooking={() => navigateTo('booking')}
        onNavigateToView={(view) => navigateTo(view as ActiveView)}
        onOpenCheckStatus={() => handleOpenCheckStatus()}
        onOpenWaitlist={() => navigateTo('waitlist')}
        onOpenPromo={() => setIsPromoModalOpen(true)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
        isWaitlistOpen={isWaitlistOpen}
      />

      {/* Hero section */}
      <Hero onNavigateToBooking={() => navigateTo('booking')} />

      <main>
        {/* Clickable barbers section */}
        <TeamAndPricing 
          onNavigateToBooking={() => navigateTo('booking')}
          onSelectBarber={(barberId) => navigateTo('barber-profile', { barberId })}
          onNavigateToServices={() => navigateTo('services')}
        />
        
        {/* Client Status Hub & Live Queue */}
        <ClientStatusHub 
          onOpenCheckStatus={handleOpenCheckStatus}
          onOpenWaitlist={() => navigateTo('waitlist')}
          onOpenPromo={() => setIsPromoModalOpen(true)}
          isWaitlistOpen={isWaitlistOpen}
          onNavigateToBooking={() => navigateTo('booking')}
        />

        {/* Realizations portfolio */}
        <Gallery />
        
        {/* Location & Map Section with interactive map & route planner */}
        <MapSection onNavigateToRoutePlanner={() => navigateTo('route')} />

        {/* Google Reviews testimonials */}
        <Testimonials />
        
        {/* FAQ section */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer 
        onNavigateToBooking={() => navigateTo('booking')} 
        onNavigateToView={(view) => navigateTo(view as ActiveView)}
        onOpenPolicies={() => setIsPoliciesOpen(true)}
      />

      {/* Salon Policies & Safety Rules Modal */}
      <ShopPoliciesModal 
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* 1. Dedicated 'Check My Status' Modal */}
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

      {/* 2. Walk-in Waitlist Modal */}
      <WalkInHubModal 
        mode={hubMode}
        onClose={() => setHubMode(null)}
        onOpenStatusCheck={() => handleOpenCheckStatus()}
        isWaitlistOpen={isWaitlistOpen}
        onNavigateToBooking={() => navigateTo('booking')}
      />

      {/* 4. Timed Welcome VIP 15% Off Pop-up Modal */}
      <WelcomePromoModal 
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onNavigateToBooking={() => navigateTo('booking')}
      />

      {/* 5. Direct Phone Lines Modal */}
      <CallShopModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
}
