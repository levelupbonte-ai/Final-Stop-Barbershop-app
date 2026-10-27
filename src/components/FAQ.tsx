import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useSiteData } from '../lib/site/SiteDataProvider';

export default function FAQ() {
  const { faqs } = useSiteData();

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-dark-bg overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Common Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight mb-4 text-white">
            Frequently Asked <span className="font-serif italic font-bold text-gold">Questions</span>
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full"></div>
        </motion.div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className={`card-luxury overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-gold/45' : ''
                }`}
              >
                <button
                  type="button"
                  className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 focus:outline-none hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={`font-medium text-base sm:text-lg transition-colors ${
                    isOpen ? 'text-gold' : 'text-gray-100 group-hover:text-white'
                  }`}>
                    {faq.question}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isOpen 
                      ? 'bg-gold/15 border-gold/50 text-gold' 
                      : 'bg-white/[0.03] border-white/10 text-gray-400 group-hover:border-gold/40 group-hover:text-gold'
                  }`}>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-gray-300/90 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
