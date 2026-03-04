# Phase 1 – Authentication

Last updated: 2026-02-06

## Goal
Allow store owners to sign up, log in, and securely access protected pages.

## What is included
- Email + password signup
- Email + password login
- Session handling (Supabase GoTrue)
- Protected dashboard
- Logout functionality
- Centralized auth helper structure

## What is NOT included (In this phase)
- Stores & Products
- Payments
- Buyers
- Public storefront

## Auth Architecture

Auth logic is centralized in `src/lib/auth.ts`.

### Helpers:
- `getSession()` → returns current session via `supabase.auth.getSession()`
- `requireAuth(Astro)` → enforces authentication; redirects to `/login` if missing
- `logout(Astro)` → signs out and redirects to login

## Redirect Rules
- Logged-in users visiting `/login` or `/signup` are redirected to `/dashboard`
- Logged-out users visiting `/dashboard` are redirected to `/login`

## Route Protection
1. Disable prerendering (`export const prerender = false`)
2. Check Supabase session server-side using `requireAuth()`
3. Redirect immediately if session is missing

## Known Gotchas
- **Server-Side Only**: Auth checks are performed on the server to prevent UI flickers.
- **Rate Limiting**: Supabase may rate-limit rapid signup attempts.
- **Prerendering**: Pages using auth helpers must not be prerendered.
