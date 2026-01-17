# Phase 1 – Authentication

Last updated: 2026-01-07

## Goal
Allow store owners to sign up, log in, and securely access protected pages.

## What is included
- Email + password signup
- Email + password login
- Session handling
- Protected dashboard
- Logout
- Clean auth structure

## What is NOT included
- Stores
- Products
- Payments
- Buyers
- Public storefront

## Auth Architecture

Auth logic is centralized in `src/lib/auth.ts`.

Helpers:
- getSession() → returns current session or null
- requireAuth(Astro) → enforces authentication and redirects if needed
- logout(Astro) → signs out and redirects to login

## Redirect Rules

- Logged-in users visiting /login or /signup are redirected to /dashboard
- Logged-out users visiting /dashboard are redirected to /login

## Route Protection

Protected pages:
- Disable prerendering
- Check Supabase session server-side
- Redirect immediately if session is missing

Client-side auth checks are not used.

## Logout

- Implemented as a POST action on /dashboard
- Uses supabase.auth.signOut()
- Clears session and redirects to /login

## Known Gotchas

- Astro prerendering must be disabled for auth pages
- Supabase signup may return session = null if email confirmation is enabled
- Supabase rate-limits rapid signup attempts
- TypeScript may require session type assertion when using redirect helpers

