import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

// Initialize real Supabase client if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage helpers for mock fallback mode
const LOCAL_BOUQUETS_KEY = 'bloomly_saved_bouquets';
const LOCAL_FEEDBACK_KEY = 'bloomly_saved_feedback';
const LOCAL_USER_ID_KEY = 'bloomly_anon_user_id';

function getLocalBouquets(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_BOUQUETS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalBouquet(bouquet: any) {
  if (typeof window === 'undefined') return;
  const bouquets = getLocalBouquets();
  const index = bouquets.findIndex(b => b.slug === bouquet.slug);
  if (index >= 0) {
    bouquets[index] = bouquet;
  } else {
    bouquets.push(bouquet);
  }
  localStorage.setItem(LOCAL_BOUQUETS_KEY, JSON.stringify(bouquets));
}

// Generate a random stable anonymous user ID if we are offline/mocked
export function getOrCreateLocalUserId(): string {
  if (typeof window === 'undefined') return 'mock-guest-id';
  let userId = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!userId) {
    userId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(LOCAL_USER_ID_KEY, userId);
  }
  return userId;
}

// Core DB operations with automatic fallback

export interface BouquetData {
  slug: string;
  owner_id: string | null;
  title: string;
  message: string;
  sender_name: string;
  recipient_name: string;
  composition: any;
  card_style: string;
  is_public: boolean;
  view_count?: number;
  created_at?: string;
}

/**
 * Perform anonymous auth inside Supabase (or return a mock session user_id)
 */
export async function getAnonymousSession(): Promise<string> {
  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        return sessionData.session.user.id;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data?.user) {
        return data.user.id;
      }
    } catch {
      // Quietly ignore if anonymous sign-ins are disabled in Supabase project settings
    }
  }
  return getOrCreateLocalUserId();
}

/**
 * Save a bouquet composition
 */
export async function saveBouquet(data: BouquetData): Promise<{ success: boolean; data?: any; error?: any }> {
  const newBouquet = {
    ...data,
    created_at: new Date().toISOString(),
    view_count: 0
  };

  // Always save locally to user's history list
  if (typeof window !== 'undefined') {
    const historySlugs = JSON.parse(localStorage.getItem('bloomly_history_slugs') || '[]');
    if (!historySlugs.includes(data.slug)) {
      historySlugs.push(data.slug);
      localStorage.setItem('bloomly_history_slugs', JSON.stringify(historySlugs));
    }
  }

  if (supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('bouquets')
        .insert([newBouquet])
        .select()
        .single();
      if (!error && inserted) {
        return { success: true, data: inserted };
      }
    } catch {
      // Quietly fallback to local storage
    }
  }

  saveLocalBouquet(newBouquet);
  return { success: true, data: newBouquet };
}

/**
 * Fetch a bouquet by its unique shareable slug
 */
export async function getBouquetBySlug(slug: string): Promise<BouquetData | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bouquets')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (data) {
        supabase.rpc('increment_view_count', { row_id: data.id }).then(() => {}, () => {});
        return data;
      }
    } catch {
      // Quietly fallback to local storage if public.bouquets table is missing or unmigrated in Supabase
    }
  }
  
  // Fallback to local storage search
  const localList = getLocalBouquets();
  const match = localList.find(b => b.slug === slug);
  return match || null;
}

/**
 * Fetch public bouquets for the gallery
 */
export async function getPublicBouquets(): Promise<BouquetData[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bouquets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch {
      // Quietly fallback to local storage
    }
  }

  // Fallback to local storage (only public ones) plus a default example if empty
  const localList = getLocalBouquets().filter(b => b.is_public);
  return localList;
}

/**
 * Get user creation history
 */
export async function getUserHistory(userId: string | null): Promise<BouquetData[]> {
  const localSlugs: string[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('bloomly_history_slugs') || '[]')
    : [];

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('bouquets')
        .select('*')
        .or(`owner_id.eq.${userId},slug.in.(${localSlugs.join(',') || 'none'})`)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch {
      // Quietly fallback to local storage
    }
  }

  // Fallback to searching locally saved bouquets matching local slugs or owner_id
  const localList = getLocalBouquets();
  return localList.filter(b => localSlugs.includes(b.slug) || b.owner_id === userId);
}

/**
 * Submit contact form / feedback
 */
export async function submitFeedback(name: string, email: string, message: string): Promise<boolean> {
  const feedbackItem = {
    id: 'feedback_' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    message,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('feedback').insert([feedbackItem]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Failed to submit feedback to Supabase, saving to local feedback key", e);
    }
  }

  // Save to local feedback store
  if (typeof window !== 'undefined') {
    const feedbackList = JSON.parse(localStorage.getItem(LOCAL_FEEDBACK_KEY) || '[]');
    feedbackList.push(feedbackItem);
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(feedbackList));
  }
  return true;
}
