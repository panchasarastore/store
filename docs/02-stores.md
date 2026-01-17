# Phase 2 – Stores

This phase introduces store creation and management.
Auth is considered complete before this phase.

## Store Rules

- One store per user
- Initial status: draft
- Store URL slug is editable
- Deleted store slugs can be reused

## Database Implementation

- Stores table created in Supabase
- One store per user enforced at DB level
- Store URL slug unique for non-deleted stores
- Soft delete implemented via status field
- RLS enabled to prevent cross-user access

## Store Helpers

### getUserStore()
- Fetches the current user's store
- Returns store row or null
- Relies on RLS for ownership enforcement

### hasStore()
- Returns true if the current user has a store
- Built on top of getUserStore()
- Used to control onboarding and dashboard flow

### createStore()
- Creates a store for the current user
- Relies on DB constraints for safety
- Handles one-store-per-user rule
- Handles slug uniqueness conflicts
- Returns created store or throws readable errors

## Routing Rules (Phase 2)

- Logged in users without a store are redirected to /create-store
- Logged in users with a store are redirected to /dashboard
- Users cannot access dashboard without creating a store

## Routing Logic

- Dashboard requires authentication and an existing store
- Users without a store are redirected to /create-store
- Users with a store cannot access /create-store
