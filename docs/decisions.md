# Architectural Decisions

Last updated: 2026-02-06

## Why Supabase Auth?
- Secure and production-ready
- Handles sessions automatically
- Faster MVP development

## Why no custom users table?
- Supabase manages `auth.users`
- Avoids duplication and sync issues

## Why Astro SSR?
- Enables true server-side route protection
- Prevents content flashes and data leaks

## Why OSM/Leaflet for Location?
- Avoids expensive Google Maps API keys.
- OpenStreetMap and Leaflet provide a flexible, free alternative for MVP.
- **Nominatim** handles reverse geocoding (coordinates to address).

## Why Cashfree for Payments?
- Strong support for local payment methods (UPI, etc.).
- Integrated via Supabase Edge Functions to keep the secret keys off the client.

## Auth structure cleanup
- Auth logic centralized into helpers in `src/lib/auth.ts`.
- Prevents missed protection on new pages.
