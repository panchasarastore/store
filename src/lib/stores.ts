/**
 * Helper functions for managing stores in Panchasara.
 * This is the ONLY interface between the app and the stores table.
 */
import { supabase } from './supabase';

/**
 * Fetch the current user's active store.
 * Returns the store row or null if no store is found.
 *
 * Note: This only returns stores with status != 'deleted'.
 */
export async function getUserStore() {
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .neq('status', 'deleted')
    .single();

  // No store found is NOT an error
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching user store:', error);
    throw new Error('Failed to fetch store data');
  }

  return data;
}

/**
 * Check if the current user already has a store.
 * Returns true or false.
 */
export async function hasStore() {
  try {
    const store = await getUserStore();
    return store !== null;
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return false;
    }
    throw error;
  }
}

/**
 * Input type for creating a store.
 * This mirrors what the frontend is allowed to send.
 */
export interface CreateStoreInput {
  name: string;
  slug: string;

  tagline?: string | null;
  about_us?: string | null;

  whatsapp_number?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;

  logo_url?: string | null;

  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
  };
}

/**
 * Create a store for the current user.
 * Throws readable errors if validation or creation fails.
 */
export async function createStore(input: CreateStoreInput) {
  const {
    name,
    slug,
    tagline = null,
    about_us = null,
    whatsapp_number = null,
    instagram_url = null,
    facebook_url = null,
    logo_url = null,
    theme = undefined,
  } = input;

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  if (!name?.trim()) {
    throw new Error('Store name is required');
  }

  if (!slug?.trim()) {
    throw new Error('Store URL is required');
  }

  const normalizedName = name.trim();
  const normalizedSlug = slug.trim().toLowerCase();

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(normalizedSlug)) {
    throw new Error(
      'Store URL can only contain lowercase letters, numbers, and hyphens'
    );
  }

  if (normalizedSlug.length < 3 || normalizedSlug.length > 50) {
    throw new Error('Store URL must be between 3 and 50 characters');
  }

  if (about_us && about_us.length > 1000) {
    throw new Error('About section cannot exceed 1000 characters');
  }

  // ---------------------------------------------------------------------------
  // Auth check (defense in depth)
  // ---------------------------------------------------------------------------

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // ---------------------------------------------------------------------------
  // Insert store
  // owner_id is enforced via RLS (auth.uid())
  // ---------------------------------------------------------------------------

  const { data, error } = await supabase
    .from('stores')
    .insert({
      store_name: normalizedName,
      store_url_slug: normalizedSlug,
      store_tagline: tagline,
      about_us,
      whatsapp_number,
      instagram_url,
      facebook_url,
      logo_url,
      theme,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violations
    if (error.code === '23505') {
      const detail = error.details || error.message || '';

      if (detail.includes('owner_id') || detail.includes('one_per_user')) {
        throw new Error('You already have a store');
      }

      if (detail.includes('store_url_slug') || detail.includes('slug')) {
        throw new Error('This store URL is already taken');
      }

      throw new Error('A store with these details already exists');
    }

    console.error('Error creating store:', error);
    throw new Error('Failed to create store. Please try again.');
  }

  return data;
}
