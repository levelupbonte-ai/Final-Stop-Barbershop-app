import { createClient } from '@supabase/supabase-js';

// Public, browser-safe configuration only. The publishable key is protected by
// Row Level Security: it can read published content of this website and call
// the public RPCs (bookings, waitlist, forms). Never put a secret key here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const WEBSITE_ID = (import.meta.env.VITE_WEBSITE_ID as string | undefined) ?? '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && /^ws_[a-z0-9]{8,32}$/.test(WEBSITE_ID)
);

export const supabase = createClient(
  SUPABASE_URL || 'https://invalid.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'missing-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
);
