import Navbar, { NavView } from '../../components/Navbar';
import Hero from '../../components/Hero';
import TeamAndPricing from '../../components/TeamAndPricing';
import ClientStatusHub from '../../components/ClientStatusHub';
import Gallery from '../../components/Gallery';
import Testimonials from '../../components/Testimonials';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';

interface HomePageProps {
  isWaitlistOpen: boolean;
  onNavigateToView: (view: NavView) => void;
  onNavigateToBooking: (params?: { barberId?: string; service?: string }) => void;
  onSelectBarber: (barberId: string) => void;
  onOpenCheckStatus: (initialQuery?: string) => void;
  onOpenCallModal: () => void;
  onOpenPolicies: () => void;
}

export default function HomePage({
  isWaitlistOpen,
  onNavigateToView,
  onNavigateToBooking,
  onSelectBarber,
  onOpenCheckStatus,
  onOpenCallModal,
  onOpenPolicies,
}: HomePageProps) {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
      {/* Top Navbar */}
      <Navbar
        currentView="home"
        onNavigateToBooking={() => onNavigateToBooking()}
        onNavigateToView={onNavigateToView}
        onOpenCheckStatus={() => onOpenCheckStatus()}
        onOpenWaitlist={() => onNavigateToView('waitlist')}
        onOpenCallModal={onOpenCallModal}
        isWaitlistOpen={isWaitlistOpen}
      />

      {/* Hero section */}
      <Hero
        onNavigateToBooking={(barberId) => onNavigateToBooking({ barberId })}
        onSelectBarber={onSelectBarber}
      />

      <main>
        {/* Clickable barbers section */}
        <TeamAndPricing
          onNavigateToBooking={() => onNavigateToBooking()}
          onSelectBarber={onSelectBarber}
          onNavigateToServices={() => onNavigateToView('services')}
        />

        {/* Client Status Hub & Live Queue */}
        <ClientStatusHub
          onOpenCheckStatus={onOpenCheckStatus}
          onOpenWaitlist={() => onNavigateToView('waitlist')}
          isWaitlistOpen={isWaitlistOpen}
          onNavigateToBooking={() => onNavigateToBooking()}
        />

        {/* Realizations portfolio */}
        <Gallery onBookAppointment={(service) => onNavigateToBooking({ service })} />

        {/* Google Reviews testimonials */}
        <Testimonials />

        {/* FAQ section */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer
        onNavigateToBooking={(barberId) => onNavigateToBooking({ barberId })}
        onNavigateToView={onNavigateToView}
        onSelectBarber={onSelectBarber}
        onOpenPolicies={onOpenPolicies}
      />
    </div>
  );
}
