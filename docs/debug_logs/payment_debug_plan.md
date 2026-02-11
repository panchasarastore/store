# Debugging Payment Flow

The objective is to resolve the payment failure where the frontend is unable to fetch the Supabase Edge Function `Place-Order` and potential database-level errors in the order placement logic.

## Analysis Findings

### 1. Missing `apikey` Header in Frontend Fetch
In `PaymentProcessor.astro`, the `fetch` call to the Supabase Edge Function is missing the `apikey` (or `Authorization`) header. Supabase's API gateway (Kong) typically rejects requests without an API key, which can cause preflight (CORS) failures if the gateway's error response doesn't include the expected CORS headers for your origin.

### 2. Schema Mismatch: Missing `payment_method` Column
The `ORDERS_TABLE.sql` script does not define a `payment_method` column, yet the `create_order_with_items` RPC function (and the `place-order.ts` edge function) attempts to insert values into this column. This will cause the RPC call to fail silently or return a 500 error.

### 3. Edge Function CORS Handling
Initially, any error before parsing the body might have caused CORS issues. After refactoring to `supabase.functions.invoke`, the request is reaching the function, but now returns a **500 Internal Server Error**.

### 4. Database Enum Mismatch: `'initiated'` Status
The Edge Function `place-order.ts` attempts to set `payment_status` to `'initiated'` for online payments. However, your `payment_status_enum` in the database only allows `'pending'`, `'completed'`, `'failed'`, and `'refunded'`. This mismatch causes the database to reject the order creation, resulting in a 500 error.

## Proposed Planning Steps

### [Database] Schema Correction
- **Action**: Add the missing `payment_method` column to the `orders` table.
- **Verification**: Run `\d orders` in the Supabase SQL editor to confirm the column exists with the correct type (can be `text` or a new enum).

### [Frontend] Transition to `supabase.functions.invoke`
- **Action**: Refactor the manual `fetch` in `PaymentProcessor.astro` to use the official Supabase SDK client. This automatically handles URL construction, `apikey` headers, and basic CORS.

### [Backend] Enhanced Logging (Edge Function)
- **Action**: Add more granular logs in `place-order.ts` specifically around the RPC call and the Cashfree API interaction.
- **Action**: Ensure every `catch` block returns a response with `corsHeaders`.

### Manual Verification
- Once logs are added, I will ask the user to attempt a payment again and share the console output.
- After reviewing the Edge Function code, I will propose fixes (e.g., adding proper CORS headers) and ask the user to deploy and test.
- I will check the browser console for the preflight request status.
