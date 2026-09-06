import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F0F10] pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6">
              <img 
                src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
                alt="Logo" 
                className="h-16 w-auto object-contain hover:scale-105 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-6">
              L'art du grooming masculin élevé au rang de rituel. Prenez le temps pour vous dans notre espace dédié à l'excellence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-white/5 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-white/5 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-white/5 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Liens Rapides</h4>
            <ul className="space-y-3 text-[11px] text-gray-500 uppercase tracking-widest">
              <li><a href="#services" className="hover:text-gold transition-colors">Prestations</a></li>
              <li><a href="#reservation" className="hover:text-gold transition-colors">Réservation</a></li>
              <li><a href="#gallery" className="hover:text-gold transition-colors">Réalisations</a></li>
              <li><a href="#faq" className="hover:text-gold transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Horaires</h4>
            <ul className="space-y-3 text-[11px] text-gray-500 uppercase tracking-widest">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Lun - Sam</span>
                <span className="text-white">10:00 - 18:00</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Dimanche</span>
                <span className="text-gold">Fermé</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Contact</h4>
            <ul className="space-y-4 text-[11px] text-gray-500 tracking-widest">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  5277 El Cajon Blvd<br />San Diego, CA 92115
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+16198861267" className="hover:text-gold transition-colors">
                  +1 (619) 886-1267
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="uppercase">contact@finalstopbarbershop.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest opacity-60">
          <p>
            &copy; {new Date().getFullYear()} Barber Shop. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <span className="opacity-40">|</span>
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
