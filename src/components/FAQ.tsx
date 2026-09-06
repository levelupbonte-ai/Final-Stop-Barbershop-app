import { MapPin, Phone, Mail, Instagram, Facebook, Clock, ChevronDown, ChevronUp, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: "Combien de temps à l'avance dois-je réserver ?",
      answer: "Nous vous recommandons de réserver au moins 48 heures à l'avance pour vous garantir l'horaire de votre choix, particulièrement le week-end."
    },
    {
      question: "Acceptez-vous les clients sans rendez-vous ?",
      answer: "Oui, selon nos disponibilités du jour. Cependant, pour éviter une longue attente, la prise de rendez-vous reste privilégiée."
    },
    {
      question: "Quels produits utilisez-vous ?",
      answer: "Nous utilisons exclusivement des produits professionnels haut de gamme, adaptés à chaque type de cheveux et de barbe, sélectionnés pour leur qualité et leur respect de la peau."
    },
    {
      question: "Puis-je annuler ou modifier mon rendez-vous ?",
      answer: "Bien sûr. Vous pouvez modifier ou annuler votre réservation directement depuis votre espace client jusqu'à 24h avant le rendez-vous."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">Questions Fréquentes</h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-white/5 overflow-hidden bg-[#151517] transition-all duration-300"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-white/5"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-lg text-gray-100">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gold flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
