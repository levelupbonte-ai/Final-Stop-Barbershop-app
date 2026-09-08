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
import AdminPage from './pages/AdminPage';
import GalleryPage from './pages/GalleryPage';
import ReviewsPage from './pages/ReviewsPage';
import BookingPage from './pages/BookingPage';
import RoutePlannerPage from './pages/RoutePlannerPage';

// Modals
import CheckStatusModal from './components/CheckStatusModal';
import WalkInHubModal, { ModalMode } from './components/WalkInHubModal';
import ClientStatusHub from './components/ClientStatusHub';
import OwnerWaitlistModal from './components/OwnerWaitlistModal';
import WelcomePromoModal from './components/WelcomePromoModal';
import CallShopModal from './components/CallShopModal';
import { getIsWaitlistOpen } from './lib/waitlistService';

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
  | 'admin';

export default function App() {
  // Parse initial view from hash if present
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('barber-profile')) return 'barber-profile';
    if (hash === 'barbers') return 'barbers';
    if (hash === 'services') return 'services';
    if (hash === 'waitlist') return 'waitlist';
    if (hash === 'booking') return 'booking';
    if (hash === 'route') return 'route';
    if (hash === 'gallery') return 'gallery';
    if (hash === 'reviews') return 'reviews';
    if (hash === 'admin') return 'admin';
    return 'home';
  });

  // Selected barber for profile or booking
  const [selectedBarberId, setSelectedBarberId] = useState<'mika' | 'lusca'>(() => {
    const hash = window.location.hash;
    if (hash.includes('id=lusca')) return 'lusca';
    return 'mika';
  });

  // Selected service for booking pre-selection
  const [bookingService, setBookingService] = useState<string | undefined>(undefined);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [hubMode, setHubMode] = useState<ModalMode>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Shop Owner-controlled waitlist state
  const [isWaitlistOpen, setIsWaitlistOpen] = useState<boolean>(getIsWaitlistOpen);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Hash change listener for true browser navigation (Back / Forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      const [viewName, queryStr] = rawHash.split('?');

      if (viewName === 'barber-profile') {
        setCurrentView('barber-profile');
        if (queryStr && queryStr.includes('id=lusca')) {
          setSelectedBarberId('lusca');
        } else if (queryStr && queryStr.includes('id=mika')) {
          setSelectedBarberId('mika');
        }
      } else if (
        viewName === 'barbers' ||
        viewName === 'services' ||
        viewName === 'waitlist' ||
        viewName === 'booking' ||
        viewName === 'route' ||
        viewName === 'gallery' ||
        viewName === 'reviews' ||
        viewName === 'admin'
      ) {
        setCurrentView(viewName as ActiveView);
      } else {
        setCurrentView('home');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global call modal listener
  useEffect(() => {
    const handleOpenCall = () => setIsCallModalOpen(true);
    window.addEventListener('open-call-modal', handleOpenCall);
    return () => window.removeEventListener('open-call-modal', handleOpenCall);
  }, []);

  // Timed VIP Welcome Promo Pop-up (strictly 5 seconds after arrival)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPromoModalOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Waitlist status event listener
  useEffect(() => {
    const handleWaitlistChange = (e: any) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setIsWaitlistOpen(e.detail.isOpen);
      }
    };
    window.addEventListener('waitlist-status-changed', handleWaitlistChange);
    return () => window.removeEventListener('waitlist-status-changed', handleWaitlistChange);
  }, []);

  // Navigation handlers
  const navigateTo = (view: ActiveView, params?: { barberId?: 'mika' | 'lusca'; service?: string }) => {
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
      window.history.pushState(null, '', window.location.pathname);
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

  // 1. PAGE: Barber Profile Page (Dedicated Clickable Profile for Mika or Lusca)
  if (currentView === 'barber-profile') {
    return (
      <BarberProfilePage
        barberId={selectedBarberId}
        onBackToHome={() => navigateTo('home')}
        onNavigateToBooking={(barberId) => navigateTo('booking', { barberId: barberId as any })}
        onOpenWaitlist={(barberId) => navigateTo('waitlist', { barberId: barberId as any })}
        onSwitchBarber={(nextBarberId) => navigateTo('barber-profile', { barberId: nextBarberId })}
      />
    );
  }

  // 2. PAGE: All Barbers Overview (Mika & Lusca - 20+ years of experience)
  if (currentView === 'barbers') {
    return (
      <BarbersPage
        onBackToHome={() => navigateTo('home')}
        onSelectBarber={(barberId) => navigateTo('barber-profile', { barberId })}
        onNavigateToBooking={(barberId) => navigateTo('booking', { barberId: barberId as any })}
        onOpenWaitlist={(barberId) => navigateTo('waitlist', { barberId: barberId as any })}
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

  // 9. PAGE: Admin Console & Firestore Database Management
  if (currentView === 'admin') {
    return (
      <AdminPage
        onBackToHome={() => navigateTo('home')}
        isWaitlistOpen={isWaitlistOpen}
        onWaitlistToggle={(isOpen) => setIsWaitlistOpen(isOpen)}
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
        onOpenAdmin={() => navigateTo('admin')}
        isWaitlistOpen={isWaitlistOpen}
      />

      {/* Hero section */}
      <Hero onNavigateToBooking={() => navigateTo('booking')} />

      <main>
        {/* Clickable Barbers Section (Mika & Lusca, 20+ years) */}
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
          onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
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
        onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
        onOpenAdmin={() => navigateTo('admin')}
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
        onOpenOwnerControls={() => setIsOwnerModalOpen(true)}
        onNavigateToBooking={() => navigateTo('booking')}
      />

      {/* 3. Shop Owner Waitlist Control Modal */}
      <OwnerWaitlistModal 
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        isWaitlistOpen={isWaitlistOpen}
        onStatusChange={(newState) => setIsWaitlistOpen(newState)}
        onOpenFullAdmin={() => navigateTo('admin')}
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
