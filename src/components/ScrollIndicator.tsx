import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  label?: string;
  className?: string;
}

export default function ScrollIndicator({
  containerRef,
  label = 'Scroll down to read more',
  className = ''
}: ScrollIndicatorProps) {
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef && containerRef.current) {
        const el = containerRef.current;
        const hasOverflow = el.scrollHeight - el.scrollTop - el.clientHeight > 24;
        setCanScrollDown(hasOverflow);
      } else if (typeof window !== 'undefined') {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const currentScroll = window.scrollY;
        const hasOverflow = documentHeight - currentScroll - windowHeight > 60;
        setCanScrollDown(hasOverflow);
      }
    };

    checkScroll();

    let targetElement: HTMLElement | Window = window;
    if (containerRef && containerRef.current) {
      targetElement = containerRef.current;
    }

    targetElement.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    // Periodic check in case content loads dynamically
    const interval = setInterval(checkScroll, 800);

    return () => {
      targetElement.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      clearInterval(interval);
    };
  }, [containerRef]);

  if (!canScrollDown) return null;

  const handleScrollClick = () => {
    if (containerRef && containerRef.current) {
      containerRef.current.scrollBy({ top: 220, behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      window.scrollBy({ top: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className={`pointer-events-none flex justify-center py-2 z-20 ${className}`}>
      <button
        type="button"
        onClick={handleScrollClick}
        className="pointer-events-auto bg-black/90 hover:bg-black text-gold border border-gold/50 shadow-xl px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md animate-bounce active:scale-95"
        title="Click to scroll down"
      >
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
      </button>
    </div>
  );
}
