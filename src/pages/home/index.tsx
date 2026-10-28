import { NavView } from '../../components/Navbar';
import Hero from '../../components/Hero';
import TeamAndPricing from '../../components/TeamAndPricing';
import ClientStatusHub from '../../components/ClientStatusHub';
import Gallery from '../../components/Gallery';
import Testimonials from '../../components/Testimonials';
import FAQ from '../../components/FAQ';

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
  onOpenCheckStatus
}: HomePageProps) {
  return (
    <div>
      {/* Hero section */}
      <Hero
        onNavigateToBooking={(barberId) => onNavigateToBooking({ barberId })}
        onSelectBarber={onSelectBarber}
      />

      {/* Salon Menu & Pricing (Separated by Lusca vs Mika) */}
      <TeamAndPricing
        onNavigateToBooking={(service, barberId) => onNavigateToBooking({ service, barberId })}
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

      {/* Realizations portfolio (Separated by Lusca vs Mika) */}
      <Gallery
        onBookAppointment={(service, barberId) => onNavigateToBooking({ service, barberId })}
      />

      {/* Google Reviews testimonials */}
      <Testimonials />

      {/* FAQ section */}
      <FAQ />
    </div>
  );
}
