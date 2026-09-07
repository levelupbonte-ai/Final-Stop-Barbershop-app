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

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'booking' | 'route'>(() => {
    if (window.location.hash === '#booking') return 'booking';
    if (window.location.hash === '#route') return 'route';
    return 'home';
  });

  // Modals state for menu action items
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [hubMode, setHubMode] = useState<ModalMode>(null);

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
        onOpenCheckStatus={() => setIsStatusModalOpen(true)}
        onOpenWaitlist={() => setHubMode('waitlist')}
        onOpenPromo={() => setHubMode('promo')}
      />

      {/* Hero section with Book Appointment & Explore Our Work */}
      <Hero onNavigateToBooking={navigateToBooking} />

      <main>
        {/* Barbers craft specialties and rates */}
        <TeamAndPricing />
        
        {/* Realizations portfolio */}
        <Gallery />
        
        {/* Google Reviews testimonials */}
        <Testimonials />
        
        {/* FAQ section */}
        <FAQ />
        
        {/* Location & Map Section with route planner trigger */}
        <MapSection onNavigateToRoutePlanner={navigateToRoutePlanner} />
      </main>

      <Footer onNavigateToBooking={navigateToBooking} />

      {/* 1. Dedicated 'Check My Status' Modal */}
      <CheckStatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onOpenWaitlist={() => setHubMode('waitlist')}
      />

      {/* 2. Walk-in Waitlist & VIP Promo Modal */}
      <WalkInHubModal 
        mode={hubMode}
        onClose={() => setHubMode(null)}
        onOpenStatusCheck={() => setIsStatusModalOpen(true)}
      />
    </div>
  );
}
