// Page views for the LevelUp dashboard's Analytics page.
// One view per page shown (first load and every client-side route), with only
// the path, the referrer and the browser language. No cookie, no storage, no
// identifier: the database keeps daily counters only, skips bots, and accepts
// views from this site's own domains (finalstop.org, www.finalstop.org).
// Nothing is sent when the browser asks not to be tracked (Do Not Track).

export interface PageviewPayload {
  p_path: string;
  p_referrer: string | null;
  p_lang: string | null;
}

interface TrackerEnv {
  send: (payload: PageviewPayload) => void;
  doNotTrack: () => boolean;
  referrer: () => string;
  href: () => string;
  language: () => string;
}

const LANG = /^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$/;

/** Returns `track(path)`: sends a view when the path differs from the last one. */
export function createPageviewTracker(env: TrackerEnv) {
  let lastPath: string | null = null;
  let lastHref: string | null = null;
  return function track(pathname: string): boolean {
    if (env.doNotTrack()) return false;
    const path = (pathname || '/').slice(0, 2000);
    if (path === lastPath) return false;
    // First view: the page that sent the visitor; afterwards the previous page
    // of this site (counted as a direct visit by the database).
    const referrer = lastHref === null ? env.referrer() : lastHref;
    lastPath = path;
    lastHref = env.href();
    const lang = env.language();
    env.send({
      p_path: path,
      p_referrer: /^https?:\/\//i.test(referrer) ? referrer.slice(0, 2000) : null,
      p_lang: LANG.test(lang) ? lang : null
    });
    return true;
  };
}

export function browserDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return true;
  const w = window as Window & { doNotTrack?: string };
  const n = navigator as Navigator & { msDoNotTrack?: string };
  const v = n.doNotTrack || w.doNotTrack || n.msDoNotTrack;
  return v === '1' || v === 'yes';
}
