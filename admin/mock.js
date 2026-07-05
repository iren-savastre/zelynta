/* Zelynta Admin — adaptor DEMO în memorie (DOAR pentru testare locală).
   Imită surface-ul Supabase folosit de admin.js. Datele sunt fictive, etichetate DEMO,
   și NU apar niciodată în producție (se folosește doar cu ?demo=1, fără chei reale). */
(function () {
  "use strict";
  function iso(daysAgo, h) { var d = new Date(2026, 5, 26 - (daysAgo || 0), 10 + (h || 0), 30); return d.toISOString(); }
  function uid(p, n) { return p + "-" + n; }

  function seed() {
    return {
      profiles: [
        { id: "u-admin", email: "admin@zelynta.com", full_name: "Administrator", role: "super_admin" },
        { id: "u-super", email: "demo@zelynta.com", full_name: "Demo Admin", role: "super_admin" },
        { id: "u-mod", email: "mod@zelynta.com", full_name: "Maria Mod", role: "moderator" },
        { id: "u-sup", email: "support@zelynta.com", full_name: "Sergiu Support", role: "support" },
        { id: "u-an", email: "analyst@zelynta.com", full_name: "Ana Analyst", role: "analyst" }
      ],
      reviews: [
        { id: uid("rv", 1), name: "Ana P.", nickname: "ana", avatar_url: null, rating: 5, title: "Foarte util", body: "Mi-a plăcut că văd rapid aditivii și scorul. Recomand.", locale: "ro", status: "pending", consent_privacy: true, consent_public_display: true, consent_marketing: false, source: "web", created_at: iso(0) },
        { id: uid("rv", 2), name: "Marco R.", nickname: null, avatar_url: null, rating: 4, title: null, body: "Buona app, traduzione ingredienti molto comoda.", locale: "it", status: "pending", consent_privacy: true, consent_public_display: true, consent_marketing: false, source: "web", created_at: iso(1) },
        { id: uid("rv", 3), name: "Ion D.", nickname: "iond", avatar_url: null, rating: 5, title: "Exact ce căutam", body: "Avertismentul de ulei de palmier e foarte bun.", locale: "ro", status: "approved", consent_privacy: true, consent_public_display: true, consent_marketing: false, source: "web", created_at: iso(3) },
        { id: uid("rv", 4), name: "Spam X", nickname: null, avatar_url: null, rating: 1, title: null, body: "buy cheap followers now www.spam.example", locale: "en", status: "rejected", rejection_reason: "spam", consent_privacy: true, consent_public_display: true, consent_marketing: false, source: "web", created_at: iso(4) }
      ],
      comments: [
        { id: uid("cm", 1), author_name: "Vlad", nickname: null, body: "Super tare!", target_type: "review", target_id: "rv-3", locale: "ro", status: "pending", consent_public_display: true, created_at: iso(0, 1) }
      ],
      support_tickets: [
        { id: uid("st", 1), name: "Elena", email: "elena@example.com", subject: "Întrebare scanare", message: "Cum scanez fără cod de bare?", category: "general", status: "new", priority: "medium", locale: "ro", source: "contact", created_at: iso(0, 2) },
        { id: uid("st", 2), name: null, email: "user@example.com", subject: "Mulțumesc", message: "App-ul e foarte bun.", category: "feedback", status: "resolved", priority: "low", locale: "ro", source: "contact", created_at: iso(5) }
      ],
      problem_reports: [
        { id: uid("pr", 1), name: null, email: "bug@example.com", category: "Problemă la scanare", description: "Camera nu pornește pe un telefon vechi.", steps_to_reproduce: "Deschid scanner -> ecran negru", screenshot_url: null, status: "new", priority: "high", locale: "ro", created_at: iso(1, 1) }
      ],
      privacy_requests: [
        { id: uid("pq", 1), email: "gdpr@example.com", request_type: "deletion", message: "Vă rog ștergeți datele mele.", status: "new", locale: "ro", created_at: iso(0, 3) }
      ],
      analytics_events: (function () {
        var ev = ["landing_view", "cta_click", "review_form_open", "review_submit", "contact_submit"];
        var dev = ["mobile", "desktop", "tablet"]; var os = ["Android", "iOS", "Windows", "macOS"];
        var br = ["Chrome", "Safari", "Firefox", "Edge"]; var co = ["RO", "IT", "DE", "FR", "necunoscut"]; var lo = ["ro", "it", "de", "fr", "en"];
        var out = []; for (var i = 0; i < 60; i++) out.push({ id: i + 1, event_name: ev[i % ev.length], path: "/", locale: lo[i % lo.length], device_type: dev[i % dev.length], os: os[i % os.length], browser: br[i % br.length], country: co[i % co.length], consent_category: "analytics", created_at: iso(i % 7) });
        return out;
      })(),
      audit_logs: [
        { id: 1, actor_id: "demo-user", action: "UPDATE", entity_type: "reviews", entity_id: "rv-3", metadata: { old_status: "pending", new_status: "approved" }, created_at: iso(3) }
      ],
      settings: [
        { key: "company", value: "Irèn Savastre", updated_at: iso(10) },
        { key: "support_email", value: "suport@zelynta.com", updated_at: iso(10) },
        { key: "default_locale", value: "ro", updated_at: iso(10) },
        { key: "social_facebook", value: "https://www.facebook.com/profile.php?id=100063203081052", updated_at: iso(10) },
        { key: "social_tiktok", value: "https://tiktok.com/@zelynta", updated_at: iso(10) },
        { key: "social_instagram", value: "https://instagram.com/zelynta", updated_at: iso(10) }
      ],
      landing_content: [
        { id: uid("lc", 1), section: "hero", key: "heroTitle", value: "Scanează produse. Înțelege etichetele. Alege mai sănătos.", locale: "ro", status: "published", updated_at: iso(8) }
      ],
      legal_pages: [
        { id: uid("lp", 1), slug: "privacy", title: "Politica de confidențialitate", content: "(conținut)", locale: "ro", status: "published", last_updated_at: iso(8) }
      ]
    };
  }

  var SK = "zelynta_demo_session";
  function loadSession() { try { return JSON.parse(localStorage.getItem(SK) || "null"); } catch (e) { return null; } }
  function saveSession(s) { try { s ? localStorage.setItem(SK, JSON.stringify(s)) : localStorage.removeItem(SK); } catch (e) {} }

  function createClient() {
    var DB = seed();
    function roleFor(email) {
      if (/^mod/i.test(email)) return "moderator";
      if (/^support/i.test(email)) return "support";
      if (/^analyst/i.test(email)) return "analyst";
      if (/^readonly/i.test(email)) return "readonly";
      return "super_admin";
    }
    function ensureProfile(email) {
      var p = DB.profiles.filter(function (x) { return x.email === email; })[0];
      if (!p) { p = { id: "u-" + DB.profiles.length, email: email, full_name: "Demo", role: roleFor(email) }; DB.profiles.push(p); }
      return p;
    }
    // restaurează sesiunea salvată pe dispozitiv (rămâi logat după refresh)
    var session = loadSession();
    if (session && session.user) ensureProfile(session.user.email);

    var auth = {
      getSession: function () { return Promise.resolve({ data: { session: session } }); },
      getUser: function () { return Promise.resolve({ data: { user: session ? session.user : null } }); },
      signInWithPassword: function (c) {
        if ((c.password || "") !== "demo") return Promise.resolve({ error: { message: "Parolă demo greșită (folosește: demo)" } });
        var email = (c.email || "demo@zelynta.com").trim();
        var p = ensureProfile(email);
        p.role = roleFor(email); // în demo, rolul derivă din prefixul emailului
        session = { user: { id: p.id, email: email } };
        saveSession(session); // salvează pe dispozitiv
        return Promise.resolve({ data: { user: session.user }, error: null });
      },
      signOut: function () { session = null; saveSession(null); return Promise.resolve({}); }
    };
    function from(table) {
      var st = { table: table, filters: [], order: null, limit: null, op: "select", count: false, head: false, patch: null, ins: null, single: false };
      var b = {
        select: function (cols, opts) { st.op = "select"; if (opts && opts.count) st.count = true; if (opts && opts.head) st.head = true; return b; },
        insert: function (rows) { st.op = "insert"; st.ins = Array.isArray(rows) ? rows : [rows]; return b; },
        upsert: function (rows, opts) { st.op = "upsert"; st.ins = Array.isArray(rows) ? rows : [rows]; st.conflict = (opts && opts.onConflict) || "id"; return b; },
        update: function (patch) { st.op = "update"; st.patch = patch; return b; },
        eq: function (c, v) { st.filters.push([c, v]); return b; },
        order: function (c, o) { st.order = [c, (o && o.ascending === false) ? -1 : 1]; return b; },
        limit: function (n) { st.limit = n; return b; },
        single: function () { st.single = true; return b; },
        then: function (res, rej) { return Promise.resolve().then(function () { return exec(st); }).then(res, rej); }
      };
      return b;
    }
    function match(row, filters) { return filters.every(function (f) { return row[f[0]] === f[1]; }); }
    function exec(st) {
      var arr = DB[st.table] || [];
      if (st.op === "insert") {
        st.ins.forEach(function (r) { r.id = r.id || (st.table + "-" + (arr.length + 1)); r.created_at = r.created_at || new Date(2026, 5, 26).toISOString(); arr.push(r); });
        return { data: null, error: null };
      }
      if (st.op === "upsert") {
        st.ins.forEach(function (r) {
          var i = -1; for (var k = 0; k < arr.length; k++) { if (arr[k][st.conflict] === r[st.conflict]) { i = k; break; } }
          r.updated_at = new Date(2026, 5, 26).toISOString();
          if (i >= 0) { for (var kk in r) arr[i][kk] = r[kk]; } else { r.id = r.id || (st.table + "-" + (arr.length + 1)); arr.push(r); }
        });
        return { data: null, error: null };
      }
      var rows = arr.filter(function (r) { return match(r, st.filters); });
      if (st.op === "update") {
        rows.forEach(function (r) {
          var oldStatus = r.status;
          Object.keys(st.patch).forEach(function (k) { r[k] = st.patch[k]; });
          r.updated_at = new Date(2026, 5, 26).toISOString();
          if ((st.table === "reviews" || st.table === "comments") && st.patch.status && st.patch.status !== oldStatus) {
            DB.audit_logs.unshift({ id: DB.audit_logs.length + 1, actor_id: "demo-user", action: "UPDATE", entity_type: st.table, entity_id: r.id, metadata: { old_status: oldStatus, new_status: st.patch.status }, created_at: new Date(2026, 5, 26, 12).toISOString() });
          }
        });
        return { data: null, error: null };
      }
      // select
      if (st.head && st.count) return { count: rows.length, data: null, error: null };
      rows = rows.slice();
      if (st.order) { var c = st.order[0], dir = st.order[1]; rows.sort(function (a, b) { return (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * dir; }); }
      if (st.limit) rows = rows.slice(0, st.limit);
      if (st.single) return { data: rows[0] || null, error: null };
      return { data: rows, count: st.count ? rows.length : undefined, error: null };
    }
    return { auth: auth, from: from };
  }

  window.ZELYNTA_MOCK = { createClient: createClient };
})();
