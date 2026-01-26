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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .neq('status', 'deleted')
    .single();

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
  store_address?: string | null;

  instagram_url?: string | null;
  facebook_url?: string | null;

  logo?: File | null;

  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
  };
}

/**
 * Create a store for the current user.
 */
export async function createStore(input: CreateStoreInput) {
  const {
    name,
    slug,
    tagline = null,
    about_us = null,
    whatsapp_number = null,
    store_address = null,
    instagram_url = null,
    facebook_url = null,
    logo = null,
    theme = undefined,
  } = input;

  // ----------------------------
  // Validation
  // ----------------------------

  if (!name?.trim()) {
    throw new Error('Store name is required');
  }

  if (!slug?.trim()) {
    throw new Error('Store URL is required');
  }

  const normalizedName = name.trim();
  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(normalizedSlug)) {
    throw new Error(
      'Store URL can only contain lowercase letters, numbers, and hyphens'
    );
  }

  // Normalize WhatsApp number
  let normalizedWhatsapp =
    whatsapp_number?.replace(/[^\d+]/g, '') || null;

  if (normalizedWhatsapp && !normalizedWhatsapp.startsWith('+')) {
    normalizedWhatsapp = `+${normalizedWhatsapp}`;
  }

  if (
    normalizedWhatsapp &&
    !/^\+[1-9]\d{7,14}$/.test(normalizedWhatsapp)
  ) {
    throw new Error(
      'Invalid WhatsApp number format. Include country code (e.g. +91...)'
    );
  }

  // ----------------------------
  // Auth check
  // ----------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // ----------------------------
  // 1. Insert store record
  // ----------------------------

  const { data: store, error: insertError } = await supabase
    .from('stores')
    .insert({
      owner_id: user.id,

      store_name: normalizedName,
      store_url_slug: normalizedSlug,
      store_tagline: tagline,
      about_us,

      whatsapp_number: normalizedWhatsapp,
      store_address,

      instagram_url,
      facebook_url,

      theme,
      status: 'draft',
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      const detail = insertError.details || insertError.message || '';
      if (detail.includes('owner_id')) {
        throw new Error('You already have a store');
      }
      if (detail.includes('store_url_slug')) {
        throw new Error('This store URL is already taken');
      }
      throw new Error('A store with these details already exists');
    }

    console.error('Error creating store:', insertError);
    throw new Error('Failed to create store');
  }

  // ----------------------------
  // 2. Logo upload (optional)
  // ----------------------------

  if (logo && logo.size > 0) {
    const fileExt = logo.name.split('.').pop() || 'png';
    const filePath = `stores/${store.id}/logo/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(filePath, logo, {
        upsert: true,
        cacheControl: '3600',
      });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      await supabase
        .from('stores')
        .update({ logo_url: publicUrl })
        .eq('id', store.id);

      store.logo_url = publicUrl;
    } else {
      console.error('Logo upload failed:', uploadError);
    }
  }

  return store;
}
