// Chei PUBLICE ale proiectului Supabase (Project Settings → API).
// Sunt publice prin natura lor (le vede oricine deschide aplicația/site-ul);
// securitatea e impusă pe server (RLS + funcții). Le ținem în git ca să fie
// aceleași pe orice calculator. Aceleași valori ca în docs/assets/config.js.
// NU pune aici cheia service_role sau vreo parolă.
//
// Pot fi suprascrise din .env (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).

const env = typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);

export const SUPABASE_URL: string = env?.EXPO_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY: string = env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
