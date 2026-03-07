/**
 * The above TypeScript code defines functions to get the current session, require authentication for a
 * page, and log the user out and redirect to the login page.
 * @returns The `getSession` function returns the current session (or null). The `requireAuth` function
 * requires authentication for a page by redirecting to `/login` if not logged in, and returns the
 * session if logged in. The `logout` function logs the user out and redirects to `/login`.
 */
import { supabase, STORAGE_KEY } from './supabase';
import type { AstroGlobal } from 'astro';

/**
 * Get the current session (or null)
 */
export async function getSession(Astro?: AstroGlobal) {
  // Use the client from locals if available (set by middleware)
  const supabaseClient = Astro?.locals?.supabase || supabase;

  // Use user from locals if available (set by middleware)
  if (Astro?.locals?.user) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  }

  // SSR Support Fallback: Restore session from cookie if on server
  if (Astro && typeof document === 'undefined' && !Astro.locals.user) {
    const cookie = Astro.cookies.get(STORAGE_KEY);
    if (cookie) {
      try {
        const decodedValue = decodeURIComponent(cookie.value);
        const sessionData = JSON.parse(decodedValue);
        if (sessionData.access_token && sessionData.refresh_token) {
          await supabaseClient.auth.setSession(sessionData);
        }
      } catch (e) {
        // Silent fail in fallback
      }
    }
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  return session;
}

/**
 * Require authentication for a page.
 * - Redirects to /login if not logged in
 * - Returns user if logged in
 */
export async function requireAuth(Astro: AstroGlobal) {
  // Middleware sets locals.user, so check that first
  if (Astro.locals.user) {
    return Astro.locals.user;
  }

  // Fallback: try to get session
  const session = await getSession(Astro);

  if (!session) {
    return Astro.redirect('https://dashboard.pnsara.store/login');
  }

  return session;
}

/**
 * Log the user out and redirect to login
 */
export async function logout(Astro: AstroGlobal) {
  const supabaseClient = Astro.locals.supabase || supabase;
  await supabaseClient.auth.signOut();
  return Astro.redirect('https://dashboard.pnsara.store/login');
}
