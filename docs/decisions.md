# Architectural Decisions

Last updated: 2026-01-07

## Why Supabase Auth?
- Secure and production-ready
- Handles sessions automatically
- Faster MVP development

## Why no custom users table?
- Supabase manages auth.users
- Avoids duplication and sync issues

## Why Astro SSR?
- Enables true server-side route protection
- Prevents content flashes and data leaks

## Why disable prerender on auth pages?
- Auth pages depend on request-specific data
- Prerendering causes Content-Type errors

## Auth structure cleanup
- Auth logic centralized into helpers
- Prevents duplication and missed protection
- Makes future protected pages safer
