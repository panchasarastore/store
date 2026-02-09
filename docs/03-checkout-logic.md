# Checkout Flow & Location Picker

This document details the implementation of the checkout process and the GPS-enabled location picker.

Last updated: 2026-02-06

## 1. Checkout Wizard (`CheckoutWizard.astro`)

The checkout process is a 3-step wizard integrated into the storefront.

### Steps
1. **Who & Where**:
   - Captures `Name`, `Email`, and `Phone`.
   - **Delivery Method**: Choice between "Pickup" and "Delivery".
   - **Form Fields**:
     - `fullAddress`: (Textarea) Required for delivery.
     - `pincode`: (Text) Required for delivery.
     - `landmark`: (Text) Optional.
     - `deliveryNotes`: (Textarea) Optional instructions.
   - If "Delivery" is selected, the **Location Picker** is revealed.
2. **When**:
   - Captures `Date` and `Time Slot`.
   - Optional `input-note` for general order context.
3. **Payment**:
   - Choice between "Online" and "COD".

---

## 2. Location Picker (`LocationPicker.astro`)
... (unchanged)

---

## 3. Order Submission (`StoreTemplate.astro`)

The logic resides in `StoreTemplate.astro` script section.

### Helper: `getDeliveryData()`
This function extracts data from the form and the map:
```javascript
function getDeliveryData() {
  // returns delivery_address, delivery_pincode, delivery_landmark, 
  // delivery_notes, delivery_lat, delivery_lng
}
```

### Submission Modes
1. **Online Payment**: Sends a JSON payload to the `Place-Order` Edge Function.
2. **COD (Cash on Delivery)**: Performs a direct insert into the Supabase `orders` table.

### Validation
- For delivery: `fullAddress`, `pincode`, and `window.checkoutLocation` are required.
- For pickup: No delivery fields are required (inserted as `null`).
