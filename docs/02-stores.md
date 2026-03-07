# Phase 2 – Stores

This phase covers store creation, branding, and management.

Last updated: 2026-02-06

## Store Rules
- **One store per user**: Enforced at the database level (`owner_id` is unique).
- **Initial status**: `draft` by default.
- **Store URL slug**: Unique, lowercase, and hyphenated.
- **Branding**: Includes name, tagline, about story, and logo.
- **Contact Details**: WhatsApp, Email, Instagram, and Facebook links.
- **Themes**: Support for primary/secondary colors and font presets (Editorial, Modern, Maker).

## Database Implementation (`stores` table)
- `owner_id`: UUID (FK to auth.users, Unique)
- `store_name`: Text
- `store_url_slug`: Text (Unique)
- `store_tagline`: Text (Nullable)
- `about_us`: Text (Nullable)
- `logo_url`: Text (Nullable)
- `theme`: JSONB (Stores colors and fonts)
- `whatsapp_number`: Text (Normalized with country code)
- `status`: Enum ('draft', 'active', 'deleted')
- **RLS**: Enabled to ensure only owners can update their stores.

## Onboarding Flow (`create-store.astro`)
1. **Auth Guard**: Users must be logged in.
2. **Store Check**: If a store already exists, redirect to dashboard.
3. **Multi-section Form**:
   - **Basics**: Name and Slug.
   - **Voice**: Tagline, Story, and Logo upload.
   - **Identity**: Theme selection (Colors and Vibe presets).
   - **Contact**: Social and contact details.
4. **Live Preview**: Real-time UI preview of the store as the user fills the form.
5. **Launch**: Data is validated and saved to Supabase; user is redirected to the dashboard.

## Store Helpers (`src/lib/stores.ts`)
- `getUserStore()`: Fetches the active store for the current user.
- `hasStore()`: Simple boolean check if the user has a store.
- `createStore(input)`: Validates input, uploads logo to Supabase Storage, and inserts the database record.

## Routing Logic
- Logged-in users without a store are redirected to `/create-store`.
- Logged-in users with a store are redirected to the dashboard.
- Storefronts are accessible via `/[slug]`.
