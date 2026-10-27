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

        <div className="rounded-[2.75rem] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent border border-white/[0.08] px-6 sm:px-12 py-4 divide-y divide-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="py-2"
              >
                <button
                  type="button"
                  className="w-full py-5 text-left flex justify-between items-center gap-4 focus:outline-none cursor-pointer transition-colors group"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs font-serif italic text-gold/70 shrink-0 tabular-nums">
                      0{index + 1}
                    </span>
                    <span className={`font-serif font-bold text-base sm:text-xl transition-colors ${
                      isOpen ? 'text-gold' : 'text-gray-100 group-hover:text-gold'
                    }`}>
                      {faq.question}
                    </span>
                  </div>
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isOpen 
                      ? 'bg-gold text-black border-gold shadow-[0_0_20px_rgba(197,160,89,0.4)]' 
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
                      <div className="pl-8 pr-4 pb-5 text-gray-300/90 text-sm leading-relaxed">
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
