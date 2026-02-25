import { createClient } from "@supabase/supabase-js";
import { defineMiddleware } from "astro:middleware";

// Read env vars directly since import.meta.env might not be fully available in this context
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const STORAGE_KEY = 'sb-auth-token';

export const onRequest = defineMiddleware(async ({ cookies, locals, request, url }, next) => {
    // Skip middleware for public pages (static pages that don't need auth)
    const publicPaths = ['/', '/favicon.ico', '/track'];
    if (publicPaths.includes(url.pathname)) {
        return next();
    }

    // Create a SCOPED Supabase client for this request
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    // Provide the client to the rest of the app
    locals.supabase = supabaseClient;

    // Try to restore session from cookie
    const cookie = cookies.get(STORAGE_KEY);

    if (cookie) {
        try {
            const decodedValue = decodeURIComponent(cookie.value);
            const sessionData = JSON.parse(decodedValue);

            if (sessionData.access_token && sessionData.refresh_token) {
                // Restore session in this scoped client
                const { data: { user } } = await supabaseClient.auth.setSession({
                    access_token: sessionData.access_token,
                    refresh_token: sessionData.refresh_token
                });

                locals.user = user;
            }
        } catch (e) {
            console.error(`[Middleware] Failed to restore session: ${e}`);
        }
    }

    return next();
});
