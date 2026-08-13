import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !anonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
}

// Χρησιμοποιείται ΜΟΝΟ για auth calls (sign-in). Όχι για διάβασμα/γράψιμο δεδομένων.
export const supabaseAnon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});