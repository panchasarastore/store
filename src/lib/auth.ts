/**
 * The above TypeScript code defines functions to get the current session, require authentication for a
 * page, and log the user out and redirect to the login page.
 * @returns The `getSession` function returns the current session (or null). The `requireAuth` function
 * requires authentication for a page by redirecting to `/login` if not logged in, and returns the
 * session if logged in. The `logout` function logs the user out and redirects to `/login`.
 */
import { supabase } from './supabase';
import type { AstroGlobal } from 'astro';

/**
 * Get the current session (or null)
 */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * Require authentication for a page.
 * - Redirects to /login if not logged in
 * - Returns session if logged in
 */
export async function requireAuth(Astro: AstroGlobal) {
  const session = await getSession();

  if (!session) {
    return Astro.redirect('/login');
  }

  return session;
}

/**
 * Log the user out and redirect to login
 */
export async function logout(Astro: AstroGlobal) {
  await supabase.auth.signOut();
  return Astro.redirect('/login');
}
