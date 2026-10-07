import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchSiteContent, errorMessage, type SiteContent } from './api';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; content: SiteContent };

const SiteDataContext = createContext<(SiteContent & { refresh: () => Promise<void> }) | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const content = await fetchSiteContent();
      setState({ status: 'ready', content });
    } catch (err) {
      setState({ status: 'error', message: errorMessage(err) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <div className='min-h-screen bg-[#0A0A0B] flex items-center justify-center' role='status' aria-live='polite'>
        <div className='h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin motion-reduce:animate-none' />
        <span className='sr-only'>Loading…</span>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className='min-h-screen bg-[#0A0A0B] flex items-center justify-center px-6'>
        <div className='max-w-md text-center' role='alert'>
          <h1 className='text-2xl font-serif text-white mb-3'>We’ll be right back</h1>
          <p className='text-sm text-gray-400 mb-6'>{state.message}</p>
          <button
            type='button'
            onClick={() => {
              setState({ status: 'loading' });
              void load();
            }}
            className='bg-gold hover:bg-gold-light text-black text-xs font-extrabold uppercase tracking-widest px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <SiteDataContext.Provider value={{ ...state.content, refresh: load }}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used inside <SiteDataProvider>');
  return ctx;
}
