// Zelynta — config Supabase pentru site-ul public.
// Lipește cheile PUBLICE din Supabase (Project Settings → API).
// Sunt chei publice, sigure pentru client — securitatea e impusă de Row-Level Security.
// Zelynta — Supabase config for the public site.
// Paste the PUBLIC keys from Supabase (Project Settings → API).
// These are public keys, safe for the client — security is enforced by Row-Level Security.
window.ZELYNTA_SUPABASE = {
  url: "https://zuvvlrfvztfrsznicbaz.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dnZscmZ2enRmcnN6bmljYmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDUyNTgsImV4cCI6MjEwNzcyMTI1OH0.AGATziAHpUZ3SVOH7XAmyF4z74kJNG6wuyFGMfoLzVg"
};
window.ZELYNTA_CONFIGURED = function () {
  return !!(window.ZELYNTA_SUPABASE && window.ZELYNTA_SUPABASE.url && window.ZELYNTA_SUPABASE.anonKey);
};
