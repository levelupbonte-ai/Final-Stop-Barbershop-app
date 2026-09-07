import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: "How far in advance should I book an appointment?",
      answer: "We recommend booking at least 24 to 48 hours in advance to secure your preferred time and barber, especially for Friday and Saturday slots."
    },
    {
      question: "Do you accept walk-in clients?",
      answer: "Yes! Walk-ins are always welcome based on daily chair availability. You can also join our live same-day waitlist directly from the website to track your turn in real time."
    },
    {
      question: "What grooming products do you use?",
      answer: "We exclusively formulate and use premium artisan grooming goods, natural eucalyptus steam balms, alcohol-free witch hazel toners, and certified organic beard oils gentle on all skin types."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can reschedule or cancel your reservation free of charge up to 2 hours before your scheduled appointment time."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Common Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">Frequently Asked Questions</h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-white/5 overflow-hidden bg-[#151517] transition-all duration-300"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-white/5 cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-base sm:text-lg text-gray-100">{faq.question}</span>
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
                    <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
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
