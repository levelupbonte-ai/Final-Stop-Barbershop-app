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
import { getIsWaitlistOpen } from './lib/waitlistService';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'booking' | 'route'>(() => {
    if (window.location.hash === '#booking') return 'booking';
    if (window.location.hash === '#route') return 'route';
    return 'home';
  });

  // Modals state for menu action items
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [hubMode, setHubMode] = useState<ModalMode>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Shop Owner-controlled waitlist state (Default: closed until owner opens it)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState<boolean>(getIsWaitlistOpen);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

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

  const navigateToBooking = () => {
    window.location.hash = '#booking';
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

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
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
        <Gallery />
        
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
    </div>
  );
}
