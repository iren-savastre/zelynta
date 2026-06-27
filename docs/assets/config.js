// Zelynta — config Supabase pentru site-ul public.
// Lipește cheile PUBLICE din Supabase (Project Settings → API).
// Sunt chei publice, sigure pentru client — securitatea e impusă de Row-Level Security.
window.ZELYNTA_SUPABASE = {
  url: "",      // ex: https://xxxxxxxx.supabase.co
  anonKey: ""   // ex: eyJhbGciOi...
};
window.ZELYNTA_CONFIGURED = function () {
  return !!(window.ZELYNTA_SUPABASE && window.ZELYNTA_SUPABASE.url && window.ZELYNTA_SUPABASE.anonKey);
};
