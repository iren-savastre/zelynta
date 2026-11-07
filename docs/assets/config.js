// Zelynta — config Supabase pentru site-ul public.
// Lipește cheile PUBLICE din Supabase (Project Settings → API).
// Sunt chei publice, sigure pentru client — securitatea e impusă de Row-Level Security.
// Zelynta — Supabase config for the public site.
// Paste the PUBLIC keys from Supabase (Project Settings → API).
// These are public keys, safe for the client — security is enforced by Row-Level Security.
window.ZELYNTA_SUPABASE = {
  url: "https://zzqyenqxmnsnryzvigew.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cXllbnF4bW5zbnJ5enZpZ2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwODczMDcsImV4cCI6MjEwOTY2MzMwN30.xKHzxvTLJMKBwB3ep_fX1ZC_O95xVmpp7-tBA6P5WgU"
};
window.ZELYNTA_CONFIGURED = function () {
  return !!(window.ZELYNTA_SUPABASE && window.ZELYNTA_SUPABASE.url && window.ZELYNTA_SUPABASE.anonKey);
};
