# Panchasara Project Architecture & Flow

This document explains how the store works, from creation to checkouLast updated: 2026-02-06

## 1. Core Technology Stack
- **Framework**: [Astro](https://astro.build/) (using SSR for dynamic routes)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + OpenStreetMap + Nominatim
- **Payment Gateway**: Cashfree (integrated via Supabase Edge Functions)

---

## 2. The "Create-Store" Flow
1. **User Authentication**: Handled via Supabase Auth (`signup.astro`, `login.astro`).
2. **Store Configuration**: `create-store.astro` captures branding (name, logo, theme, social links).
3. **Database Insertion**: Calls `createStore()` in `src/lib/stores.ts`.
   - Data is saved in the `stores` table.
   - Logo is uploaded to the `store-assets` bucket in Supabase Storage.
4. **Dashboard Redirect**: Once created, the user is redirected to the management dashboard.

---

## 3. The "Storefront to Payment" Flow

### A. Browsing
- **Route**: `src/pages/[slug].astro`
- Fetches store details and products from Supabase based on the URL slug.
- Renders the UI using `StoreTemplate.astro`.

### B. Cart Management (Client-Side)
- **Mechanism**: Local state in `StoreTemplate.astro`.
- **Variables**:
  - `cartState`: `{ productId: quantity }`
  - `cartNotes`: `{ productId: "custom note" }`
- **UI Sync**: updates "Add to Cart" buttons and the shopping bag badge in real-time.

### C. Checkout Wizard (`CheckoutWizard.astro`)
- **Step 1: Details**: Captures name, email, phone, and delivery method (Pickup/Delivery). 
- **Step 2: Schedule**: Captures date, time slot, and optional order notes.
- **Step 3: Payment**: Choice between "Online" (UPI/Cards) and "Pay on Pickup".

### D. Location Picker (`LocationPicker.astro`)
- Integrated into Step 1 for "Delivery" mode.
- Uses **GPS** and **Leaflet Map** to pinpoint delivery address.
- **Nominatim API** for reverse geocoding coordinates to a human-readable address.

### E. Order Placement
1. **Payload**: When "Pay" is clicked, a JSON payload is built with customer details, selected items, and location data.
2. **API Call**: POST request to the Supabase Edge Function (`Place-Order`).
3. **Payment**: For online payments, the Edge Function returns a Cashfree `payment_link_url`.
4. **Redirect**: Frontend redirects the user to complete payment.

---

## 4. Key Variables
- `wrapper.dataset.storeId`: The unique ID of the current store.
- `productsData`: Array of available products.
- `cartState`: Current items in the cart.
- `window.checkoutLocation`: Lat, Lng, and Address from the Location Picker.

---

## 5. Roadmap: Email Integration
- **Service**: [Resend](https://resend.com/)
- **Trigger**: Success webhook after payment or immediately for COD.
- **Implementation**: Edge Function call to Resend API.
