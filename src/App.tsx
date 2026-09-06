/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReservationForm from './components/ReservationForm';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import MapSection from './components/MapSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
      <Navbar />
      <Hero />
      <main>
        <ReservationForm />
        <Gallery />
        <Testimonials />
        <FAQ />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}
