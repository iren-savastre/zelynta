/* Zelynta Admin — SPA moderare + RBAC (securitate impusă de Supabase RLS) */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var ovl = document.getElementById("ovl");
  var modal = document.getElementById("modal");
  var cfg = window.ZELYNTA_SUPABASE || {};
  var sb = null, me = null, role = "readonly";

  var ICONS = {
    grid:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></svg>',
    star:'<svg viewBox="0 0 24 24"><path class="f" d="m12 3 2.5 5.3 5.5.5-4.2 3.7 1.2 5.5L12 20.6 7 17.7l1.2-5.5L4 8.5l5.5-.5z"/><path class="s" d="m12 3 2.5 5.3 5.5.5-4.2 3.7 1.2 5.5L12 20.6 7 17.7l1.2-5.5L4 8.5l5.5-.5z"/></svg>',
    chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/></svg>',
    life:'<svg viewBox="0 0 24 24"><circle class="f" cx="12" cy="12" r="9"/><circle class="s" cx="12" cy="12" r="9"/><circle class="s" cx="12" cy="12" r="3.4"/><path class="s" d="m5.5 5.5 3 3M18.5 5.5l-3 3M5.5 18.5l3-3M18.5 18.5l-3-3"/></svg>',
    mail:'<svg viewBox="0 0 24 24"><rect class="f" x="3" y="5" width="18" height="14" rx="2.4"/><rect class="s" x="3" y="5" width="18" height="14" rx="2.4"/><path class="s" d="m4 7.5 8 5.5 8-5.5"/></svg>',
    bug:'<svg viewBox="0 0 24 24"><rect class="f" x="8" y="8" width="8" height="11" rx="4"/><rect class="s" x="8" y="8" width="8" height="11" rx="4"/><path class="s" d="M12 8V5M9 6 7 4M15 6l2-2M8 12H4M20 12h-4M8 16l-3 2M16 16l3 2M10 11.5h4"/></svg>',
    key:'<svg viewBox="0 0 24 24"><circle cx="8" cy="14" r="4"/><path d="M11 11 20 4M17 7l2 2M15 9l2 2"/></svg>',
    chart:'<svg viewBox="0 0 24 24"><path d="M4 4v16h16"/><path d="M8 16v-4M12 16V9M16 16v-6"/></svg>',
    log:'<svg viewBox="0 0 24 24"><path d="M7 4h10a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1Z"/><path d="M9 8h6M9 12h6"/></svg>',
    cog:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    out:'<svg viewBox="0 0 24 24"><path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M10 12h11M18 9l3 3-3 3"/></svg>',
    ext:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>',
    layout:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/></svg>',
    doc:'<svg viewBox="0 0 24 24"><path d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M13 4v4h4M9 13h6M9 16h4"/></svg>',
    cookie:'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Z"/><path d="M9 10h.01M14 13h.01M10 15h.01"/></svg>',
    scan:'<svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 9v6M11 9v6M14 9v6M17 9v6"/></svg>',
    bell:'<svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 20a1.8 1.8 0 0 0 3 0"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    save:'<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13a0 0 0 0 1 0 0H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M8 4v5h7M8 14h8v6H8z"/></svg>',
    eye:'<svg viewBox="0 0 24 24"><path class="f" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><path class="s" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle class="f" cx="12" cy="12" r="3.2"/><circle class="s" cx="12" cy="12" r="3.2"/></svg>',
    dl:'<svg viewBox="0 0 24 24"><path class="f" d="M4 14h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path class="s" d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3M7 10l5 5 5-5M12 15V3"/></svg>',
    pencil:'<svg viewBox="0 0 24 24"><path class="f" d="M14.5 5.5 18 9 8.5 18.5 4 20l1.5-4.5z"/><path class="s" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    monitor:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    tablet:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/></svg>',
    win:'<svg viewBox="0 0 24 24"><path d="M3 5l8-1v7H3zM13 3.7 21 3v9h-8zM3 13h8v6l-8-1zM13 13h8v8l-8-1z"/></svg>',
    apple:'<svg viewBox="0 0 24 24"><path d="M16 13c0-3 2.5-3.5 2.6-3.6C17.5 7.8 15.9 7.6 15.3 7.6c-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.8-2.8-.8C8 7.7 6.5 8.6 5.7 10c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.7 2.5 3 2.4 1.2 0 1.6-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.4.5-.8.9-1.6 1.1-2.3-2.9-1.1-3.2-4.2-1.1-4.5ZM14 5.7c.7-.8 1.1-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.1 1.9-1 3 .1.1 1.3-.5 2.9-1.3Z"/></svg>',
    android:'<svg viewBox="0 0 24 24"><path d="M5 11h14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 19v2M15 19v2M7 11a5 5 0 0 1 10 0M9 8.5V7M15 8.5V7M3 12v4M21 12v4"/></svg>',
    tux:'<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v4c-1 1-3 4-3 7 0 2 3 3 6 3s6-1 6-3c0-3-2-6-3-7V6a3 3 0 0 0-3-3Z"/><path d="M10.5 8h.01M13.5 8h.01"/></svg>',
    flag:'<svg viewBox="0 0 24 24"><path d="M5 21V4M5 5h12l-2 4 2 4H5"/></svg>',
    users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5"/><path d="M16 7.2a3 3 0 0 1 0 5.6M21 20c0-2.6-1.6-4.3-3.6-5"/></svg>',
    inbox:'<svg viewBox="0 0 24 24"><path d="M4 13l2-7h12l2 7M4 13v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M4 13h5l1 2h4l1-2h5"/></svg>',
    send:'<svg viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    palette:'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.6-3.6-6.4-9-6.4Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="14.5" cy="7.5" r="1.2"/><circle cx="17" cy="11" r="1.2"/></svg>',
    image:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>'
  };
  // iconițe pe categorie/valoare pentru grafice
  var ANALYTICS_ICONS = {
    event_name:{landing_view:"eye",cta_click:"dl",review_form_open:"pencil",review_submit:"star",contact_submit:"mail",support_submit:"life",report_problem_submit:"bug","*":"chart"},
    device_type:{mobile:"phone",desktop:"monitor",tablet:"tablet","*":"phone"},
    os:{Windows:"win",iOS:"apple",macOS:"apple",Android:"android",Linux:"tux","*":"cog"},
    browser:{Chrome:"globe",Safari:"globe",Firefox:"globe",Edge:"globe","*":"globe"},
    country:{"*":"flag"}, locale:{"*":"globe"}
  };
  function iconFor(cat,key){ var m=ANALYTICS_ICONS[cat]||{}; return m[key]||m["*"]||"chart"; }
  var CHART_COLORS=["#38bdf8","#f59e0b","#a78bfa","#fbbf24","#f472b6","#2dd4bf","#fb7185","#84cc16","#c084fc","#22d3ee"];
  // culori distincte per valoare (iconițe colorate)
  var ANALYTICS_COLORS={
    event_name:{landing_view:"#38bdf8",cta_click:"#f59e0b",review_form_open:"#a78bfa",review_submit:"#fbbf24",contact_submit:"#f472b6",support_submit:"#2dd4bf",report_problem_submit:"#fb7185"},
    device_type:{mobile:"#38bdf8",desktop:"#a78bfa",tablet:"#2dd4bf"},
    os:{Windows:"#38bdf8",iOS:"#e5e7eb",macOS:"#e5e7eb",Android:"#84cc16",Linux:"#fbbf24"},
    browser:{Chrome:"#fbbf24",Safari:"#38bdf8",Firefox:"#fb7185",Edge:"#2dd4bf"}
  };
  function colorFor(cat,key,i){ var m=ANALYTICS_COLORS[cat]||{}; return m[key]||CHART_COLORS[(i||0)%CHART_COLORS.length]; }
  // drapele pentru limbă/țară
  var LOCALE_CC={ro:"ro",en:"gb",fr:"fr",it:"it",es:"es",de:"de",ru:"ru",pl:"pl",nl:"nl"};
  function flagCC(cat,key){
    if(cat==="locale") return LOCALE_CC[(key||"").toLowerCase()]||null;
    if(cat==="country"){ var k=(key||"").toLowerCase(); if(!k||k==="necunoscut"||k==="unknown") return null; return k.length===2?k:null; }
    return null;
  }
  function flagImg(cc){ return '<img src="https://flagcdn.com/w40/'+cc+'.png" alt="" style="width:26px;height:19px;border-radius:3px;display:block;box-shadow:0 1px 3px rgba(0,0,0,0.4)">'; }
  function ic(n){ return '<span class="ico">'+(ICONS[n]||"")+'</span>'; }
  function esc(s){ return (s==null?"":String(s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmt(ts){ try{ return new Date(ts).toLocaleString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); }catch(e){ return ts; } }
  function stars(n){ n=+n||0; return '<span class="stars-ro">'+"★".repeat(n)+'<span style="color:#3a4a40">'+"★".repeat(5-n)+'</span></span>'; }
  function countUp(scope){
    var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    (scope||document).querySelectorAll("[data-to]").forEach(function(el){
      var to=parseInt(el.getAttribute("data-to"),10)||0;
      if(reduce||to<=0){ el.textContent=to; return; }
      var start=null, dur=700;
      function step(ts){ if(!start)start=ts; var p=Math.min((ts-start)/dur,1); var e=1-Math.pow(1-p,3); el.textContent=Math.round(to*e); if(p<1)requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }

  // ---- RBAC: ce secțiuni vede fiecare rol ----
  var STAFF=["moderator","admin","super_admin"], CM=["content_manager","admin","super_admin"], ADM=["admin","super_admin"];
  var SECTIONS = [
    {id:"overview", label:"Overview", ic:"grid", color:"#38bdf8", roles:"*", group:"Principal", desc:"Privire de ansamblu și acțiuni în așteptare."},
    {id:"analytics", label:"Analytics", ic:"chart", color:"#f59e0b", roles:["analyst","admin","super_admin"], group:"Principal", desc:"Date agregate, privacy-aware: evenimente, dispozitive, țări."},
    {id:"inbox", label:"E-mail / Inbox", ic:"inbox", color:"#f472b6", roles:["support","admin","super_admin"], group:"Moderare", desc:"Mesaje de contact și suport, în stil e-mail."},
    {id:"reviews", label:"Recenzii", ic:"star", color:"#fbbf24", roles:STAFF, group:"Moderare", desc:"Aprobă, respinge sau ascunde recenziile utilizatorilor."},
    {id:"comments", label:"Comentarii", ic:"chat", color:"#60a5fa", roles:STAFF, group:"Moderare", desc:"Moderarea comentariilor (sistem pregătit)."},
    {id:"support", label:"Suport & Contact", ic:"life", color:"#2dd4bf", roles:["support","admin","super_admin"], group:"Moderare", desc:"Tichete de suport și mesaje de contact."},
    {id:"reports", label:"Raportări", ic:"bug", color:"#fb7185", roles:["support","moderator","admin","super_admin"], group:"Moderare", desc:"Probleme raportate de utilizatori."},
    {id:"privacy", label:"Cereri GDPR", ic:"key", color:"#c084fc", roles:ADM, group:"Moderare", desc:"Cereri privind datele personale. Acces restrâns."},
    {id:"landing", label:"Landing Page", ic:"layout", color:"#34d399", roles:CM, group:"Conținut", desc:"Editare conținut landing, per secțiune și limbă."},
    {id:"legal", label:"Pagini legale", ic:"doc", color:"#94a3b8", roles:CM, group:"Conținut", desc:"Status și previzualizare pagini legale."},
    {id:"cookies", label:"Cookie Consent", ic:"cookie", color:"#fb923c", roles:ADM, group:"Conținut", desc:"Inventar cookie și categorii de consimțământ."},
    {id:"appdata", label:"App / Scan Data", ic:"scan", color:"#22d3ee", roles:ADM, group:"Conținut", desc:"Date despre aplicația de scanare (offline-first)."},
    {id:"images", label:"Optimizare imagini", ic:"image", color:"#f97316", roles:CM, group:"Conținut", desc:"Scanează și convertește imagini în WebP — totul la apăsare de buton."},
    {id:"users", label:"Utilizatori (staff)", ic:"users", color:"#a78bfa", roles:ADM, group:"Sistem", desc:"Echipa și rolurile (RBAC)."},
    {id:"appstores", label:"Butoane store", ic:"dl", color:"#34d399", roles:ADM, group:"Conținut", desc:"Butoanele de descărcare din footer (Google Play / App Store) — editează, ascunde, șterge."},
    {id:"settings", label:"Setări", ic:"cog", color:"#9ca3af", roles:ADM, group:"Sistem", desc:"Setări platformă, temă și date companie."},
    {id:"audit", label:"Audit log", ic:"log", color:"#84cc16", roles:ADM, group:"Sistem", desc:"Jurnal de audit pentru acțiunile de moderare."}
  ];
  function can(sec){ return sec.roles==="*" || sec.roles.indexOf(role)>=0; }

  // ---- modal helpers ----
  function openModal(html){ modal.innerHTML=html; ovl.classList.add("show"); var f=modal.querySelector("button,input,textarea"); if(f)f.focus(); }
  function closeModal(){ ovl.classList.remove("show"); modal.innerHTML=""; }
  ovl.addEventListener("click",function(e){ if(e.target===ovl) closeModal(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeModal(); });

  // ====== TEME (5, premium glass) ======
  var THEMES=[
    {id:"emerald",label:"Emerald",g:"#059669",l:"#34d399"},
    {id:"sapphire",label:"Sapphire",g:"#3b82f6",l:"#22d3ee"},
    {id:"violet",label:"Violet",g:"#8b5cf6",l:"#f0abfc"},
    {id:"graphite",label:"Carbon",g:"#0891b2",l:"#67e8f9"},
    {id:"sunset",label:"Sunset",g:"#f97316",l:"#fb7185"},
    {id:"obsidian",label:"Obsidian",g:"#27272a",l:"#a1a1aa"},
    {id:"gold",label:"Gold",g:"#b8860b",l:"#f4d03f"},
    {id:"silver",label:"Silver",g:"#64748b",l:"#e2e8f0"},
    {id:"aurora",label:"Aurora",g:"#06b6d4",l:"#e879f9"},
    {id:"crimson",label:"Crimson",g:"#be123c",l:"#fb7185"}
  ];
  function currentTheme(){ try{ return localStorage.getItem("zelynta_admin_theme")||"emerald"; }catch(e){ return "emerald"; } }
  function applyTheme(id){
    if(id&&id!=="emerald") document.documentElement.setAttribute("data-theme",id);
    else document.documentElement.removeAttribute("data-theme");
    try{ localStorage.setItem("zelynta_admin_theme",id); }catch(e){}
    var btn=document.getElementById("themeBtn"); var t=THEMES.filter(function(x){return x.id===id;})[0]||THEMES[0];
    if(btn) btn.style.background="linear-gradient(135deg,"+t.g+","+t.l+")";
    document.querySelectorAll(".theme-row").forEach(function(r){ r.classList.toggle("active", r.getAttribute("data-theme")===id); });
  }
  applyTheme(currentTheme());

  // ====== BOOT ======
  var DEMO = /[?&]demo=1/.test(location.search);
  if(DEMO && window.ZELYNTA_MOCK){
    sb = window.ZELYNTA_MOCK.createClient(); window.__ZDEMO = true;
  } else if(!cfg.url || !cfg.anonKey){
    app.innerHTML='<div class="login"><div class="login-card"><div class="brand"><img src="icon.png" alt=""/>Zelynta Admin</div>'+
      '<p class="sub">Backend neconfigurat.</p><div class="note">Lipește <b>Project URL</b> și <b>anon key</b> din Supabase în fișierul <b>admin/config.js</b>, apoi reîncarcă. Vezi <b>backend/supabase/README.md</b>.</div>'+
      (window.ZELYNTA_MOCK?'<a class="btn btn-ghost" style="width:100%;margin-top:14px" href="?demo=1">Vezi un DEMO local (date fictive)</a>':'')+
      '</div></div>';
    return;
  } else {
    sb = supabase.createClient(cfg.url, cfg.anonKey);
  }

  sb.auth.getSession().then(function(res){
    if(res.data && res.data.session){ loadMe(); } else { renderLogin(); }
  });

  function renderLogin(err){
    app.innerHTML='<div class="login"><form class="login-card" id="lf"><div class="brand"><img src="icon.png" alt=""/>Zelynta Admin</div>'+
      '<p class="sub">Autentificare moderator / administrator</p>'+
      (window.__ZDEMO?'<div class="note">Mod DEMO — autentifică-te cu orice e-mail și parola <b>demo</b>. Încearcă <b>mod@x.com</b> (moderator) sau <b>analyst@x.com</b> ca să vezi RBAC.</div>':'')+
      '<div class="field"><label for="le">E-mail</label><input id="le" type="email" autocomplete="email" required></div>'+
      '<div class="field"><label for="lp">Parolă</label><input id="lp" type="password" autocomplete="current-password" required></div>'+
      '<button class="btn btn-primary" style="width:100%" type="submit">Intră în cont</button>'+
      '<div class="msg '+(err?"bad":"")+'">'+(err?esc(err):"")+'</div></form></div>';
    document.getElementById("lf").addEventListener("submit",function(e){
      e.preventDefault();
      sb.auth.signInWithPassword({email:document.getElementById("le").value.trim(),password:document.getElementById("lp").value})
        .then(function(r){ if(r.error) renderLogin(r.error.message); else loadMe(); });
    });
  }

  function loadMe(){
    sb.auth.getUser().then(function(u){
      me = u.data ? u.data.user : null;
      if(!me){ renderLogin(); return; }
      sb.from("profiles").select("role,full_name,email").eq("id",me.id).single().then(function(p){
        role = (p.data && p.data.role) || "readonly";
        renderShell();
        navigate("overview");
      });
    });
  }

  function renderShell(){
    var lastGroup=null;
    var links = SECTIONS.filter(can).map(function(s){
      var head=""; if(s.group&&s.group!==lastGroup){ lastGroup=s.group; head='<div class="nav-group">'+s.group+'</div>'; }
      return head+'<div class="navlink" data-sec="'+s.id+'"><span class="ico" style="--ic:'+(s.color||"#85BB2F")+'">'+(ICONS[s.ic]||"")+'</span><span>'+s.label+'</span><span class="badge" id="b-'+s.id+'" style="display:none"></span></div>';
    }).join("");
    app.innerHTML=
      '<div class="shell">'+
        '<aside class="side" id="side"><div class="brand"><img src="icon.png" alt=""/>Zelynta</div>'+links+
          '<div class="sep"></div>'+
          '<a class="navlink" href="../docs/index.html" target="_blank" rel="noopener">'+ic("ext")+'<span>Vezi site-ul</span></a>'+
          '<div class="navlink" id="logout">'+ic("out")+'<span>Ieșire</span></div>'+
        '</aside>'+
        '<div class="main"><div class="topbar">'+
          '<button class="burger" id="burger">☰</button>'+
          '<h1 id="ptitle">Overview</h1><div class="spacer"></div>'+
          '<div class="theme-wrap"><button class="theme-btn" id="themeBtn" aria-label="Schimbă tema" title="Temă">'+ic("palette")+'</button>'+
            '<div class="theme-menu" id="themeMenu"><h5>Temă</h5>'+
            THEMES.map(function(t){ return '<div class="theme-row" data-theme="'+t.id+'"><span class="theme-sw" style="background:linear-gradient(135deg,'+t.g+','+t.l+')"></span><span>'+t.label+'</span><span class="ck">✓</span></div>'; }).join("")+
            '</div></div>'+
          '<input id="gsearch" placeholder="Caută recenzii / mesaje..." aria-label="Căutare globală" style="background:var(--glass);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:8px 12px;font-size:13px;width:200px">'+
          '<button class="btn btn-ghost btn-sm" id="gbell" title="În așteptare" aria-label="Notificări">'+ic("bell")+'<span id="bellN" style="display:none" class="badge">0</span></button>'+
          (window.__ZDEMO?'<span class="env" style="background:rgba(238,129,0,0.2);color:#ffb866;border-color:rgba(238,129,0,0.4)">DEMO</span>':'')+
          '<span class="env">'+(location.hostname==="localhost"||location.protocol==="file:"?"DEVELOPMENT":"PRODUCTION")+'</span>'+
          '<span class="who">'+esc(role)+' · <b>'+esc(me.email)+'</b></span>'+
        '</div><div class="content" id="content"></div></div>'+
      '</div>';
    app.querySelectorAll(".navlink[data-sec]").forEach(function(el){ el.addEventListener("click",function(){ navigate(el.getAttribute("data-sec")); }); });
    document.getElementById("logout").addEventListener("click",function(){ sb.auth.signOut().then(function(){ location.reload(); }); });
    var burger=document.getElementById("burger"); if(burger) burger.addEventListener("click",function(){ document.getElementById("side").classList.toggle("open"); });
    var gs=document.getElementById("gsearch"); if(gs) gs.addEventListener("keydown",function(e){ if(e.key==="Enter") searchGlobal(gs.value.trim()); });
    var gb=document.getElementById("gbell"); if(gb) gb.addEventListener("click",function(){ navigate("overview"); });
    var tb=document.getElementById("themeBtn"), tm=document.getElementById("themeMenu");
    if(tb&&tm){ tb.addEventListener("click",function(e){ e.stopPropagation(); tm.classList.toggle("show"); });
      document.querySelectorAll(".theme-row").forEach(function(r){ r.addEventListener("click",function(){ applyTheme(r.getAttribute("data-theme")); tm.classList.remove("show"); }); });
      document.addEventListener("click",function(){ tm.classList.remove("show"); }); }
    applyTheme(currentTheme());
    refreshBadges();
  }

  function setActive(id){
    app.querySelectorAll(".navlink[data-sec]").forEach(function(el){ el.classList.toggle("active", el.getAttribute("data-sec")===id); });
    var s=SECTIONS.filter(function(x){return x.id===id;})[0];
    document.getElementById("ptitle").textContent = s?s.label:id;
    var side=document.getElementById("side"); if(side) side.classList.remove("open");
  }

  function pageHeader(s){
    return '<div class="page-head"><div class="ph-ic ico" style="--ic:'+(s.color||"#85BB2F")+'">'+(ICONS[s.ic]||"")+'</div>'+
      '<div class="ph-txt"><h2 class="ph-title">'+esc(s.label)+'</h2><p class="ph-desc">'+esc(s.desc||"")+'</p></div></div>';
  }
  function navigate(id){
    var s=SECTIONS.filter(function(x){return x.id===id;})[0];
    if(!s || !can(s)){ id="overview"; s=SECTIONS[0]; }
    setActive(id);
    var c=document.getElementById("content");
    c.innerHTML=pageHeader(s)+'<div id="pbody"><div class="panel"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div></div>';
    var body=document.getElementById("pbody");
    ({overview:secOverview,landing:secLanding,reviews:secReviews,comments:secComments,support:secSupport,reports:secReports,privacy:secPrivacy,legal:secLegal,cookies:secCookies,appdata:secAppData,images:secImages,analytics:secAnalytics,audit:secAudit,settings:secSettings,appstores:secAppStores,users:secUsers,inbox:secInbox}[id]||secOverview)(body);
  }

  // ---- counts pentru badge-uri ----
  function count(table, col, val){
    var q=sb.from(table).select("*",{count:"exact",head:true});
    if(col) q=q.eq(col,val);
    return q.then(function(r){ return r.count||0; });
  }
  function refreshBadges(){
    var jobs=[["reviews","reviews","status","pending"],["comments","comments","status","pending"],
      ["support","support_tickets","status","new"],["reports","problem_reports","status","new"],["privacy","privacy_requests","status","new"]];
    var total=0;
    Promise.all(jobs.map(function(j){
      var sec=SECTIONS.filter(function(x){return x.id===j[0];})[0];
      if(!can(sec)) return Promise.resolve(0);
      return count(j[1],j[2],j[3]).then(function(n){ var b=document.getElementById("b-"+j[0]); if(b){ if(n>0){b.textContent=n;b.style.display="";}else b.style.display="none"; } total+=n; return n; });
    })).then(function(){ var bn=document.getElementById("bellN"); if(bn){ if(total>0){bn.textContent=total;bn.style.display="";} else bn.style.display="none"; } });
  }

  function searchGlobal(q){
    setActive("overview"); document.getElementById("ptitle").textContent="Căutare: "+q;
    var c=document.getElementById("content");
    if(!q){ navigate("overview"); return; }
    c.innerHTML='<div class="panel"><div class="skel"></div></div>';
    var ql=q.toLowerCase();
    Promise.all([
      sb.from("reviews").select("*").order("created_at",{ascending:false}).limit(200),
      sb.from("support_tickets").select("*").order("created_at",{ascending:false}).limit(200)
    ]).then(function(res){
      var rv=(res[0].data||[]).filter(function(r){ return ((r.name||"")+(r.body||"")+(r.title||"")).toLowerCase().indexOf(ql)>=0; });
      var tk=(res[1].data||[]).filter(function(t){ return ((t.email||"")+(t.subject||"")+(t.message||"")).toLowerCase().indexOf(ql)>=0; });
      var html='';
      html+='<div class="panel"><div class="panel-head"><h2>Recenzii ('+rv.length+')</h2></div>'+(rv.length?'<table class="tbl"><tbody>'+rv.map(function(r){return '<tr><td><b>'+esc(r.name)+'</b> '+stars(r.rating)+'<div class="muted">'+esc((r.body||"").slice(0,140))+'</div></td><td><span class="badge-s s-'+r.status+'">'+r.status+'</span></td></tr>';}).join("")+'</tbody></table>':emptyBox("Nimic."))+'</div>';
      html+='<div class="panel"><div class="panel-head"><h2>Mesaje ('+tk.length+')</h2></div>'+(tk.length?'<table class="tbl"><tbody>'+tk.map(function(t){return '<tr><td><b>'+esc(t.email)+'</b><div class="muted">'+esc((t.message||"").slice(0,140))+'</div></td><td><span class="badge-s s-'+t.status+'">'+t.status+'</span></td></tr>';}).join("")+'</tbody></table>':emptyBox("Nimic."))+'</div>';
      c.innerHTML=html;
    });
  }

  function emptyBox(txt){ return '<div class="empty"><div class="e-ic">'+ic("grid")+'</div><p>'+esc(txt)+'</p></div>'; }

  // ====== OVERVIEW ======
  function secOverview(c){
    Promise.all([
      count("reviews","status","pending"), count("reviews","status","approved"),
      count("support_tickets","status","new"), count("problem_reports","status","new"),
      count("privacy_requests","status","new"), count("comments","status","pending")
    ]).then(function(v){
      var kpi=[["star","Recenzii în așteptare",v[0],"#fbbf24"],["star","Recenzii aprobate",v[1],"#34d399"],["chat","Comentarii în așteptare",v[5],"#60a5fa"],
        ["life","Tickete noi",v[2],"#2dd4bf"],["bug","Raportări noi",v[3],"#fb7185"],["key","Cereri GDPR noi",v[4],"#c084fc"]];
      c.innerHTML='<div class="kpis kpis-6">'+kpi.map(function(k){
        return '<div class="kpi"><div class="k-ic" style="--ic:'+k[3]+'">'+ic(k[0])+'</div><div class="k-val" data-to="'+k[2]+'">0</div><div class="k-lab">'+k[1]+'</div></div>';
      }).join("")+'</div>'+
      '<div class="panel"><div class="panel-head"><h2>Acțiuni în așteptare</h2></div>'+
        (v[0]+v[2]+v[3]+v[4]+v[5]===0 ? emptyBox("Nimic de moderat acum. Totul e la zi.") :
        '<table class="tbl"><tbody>'+
          rowLink("star","Recenzii de moderat",v[0],"reviews")+
          rowLink("chat","Comentarii de moderat",v[5],"comments")+
          rowLink("life","Tickete noi de suport",v[2],"support")+
          rowLink("bug","Raportări noi",v[3],"reports")+
          rowLink("key","Cereri GDPR noi",v[4],"privacy")+
        '</tbody></table>')+'</div>';
      c.querySelectorAll("[data-go]").forEach(function(el){ el.addEventListener("click",function(){ navigate(el.getAttribute("data-go")); }); });
      countUp(c);
    });
  }
  function rowLink(icn,label,n,go){
    if(!n) return "";
    var sec=SECTIONS.filter(function(x){return x.id===go;})[0];
    if(!can(sec)) return "";
    return '<tr style="cursor:pointer" data-go="'+go+'"><td style="width:48px">'+ic(icn)+'</td><td>'+esc(label)+'</td><td style="text-align:right"><span class="badge-s s-pending">'+n+'</span></td></tr>';
  }

  // ====== generic moderation table (reviews / comments) ======
  function modSection(c, table, opts){
    var filter = "pending";
    function load(){
      var q=sb.from(table).select("*").order("created_at",{ascending:false}).limit(200);
      if(filter!=="all") q=q.eq("status",filter);
      q.then(function(r){ render(r.data||[]); });
    }
    function render(rows){
      var chips=["pending","approved","rejected","hidden","all"].map(function(s){
        return '<span class="chip-f '+(s===filter?"active":"")+'" data-f="'+s+'">'+s+'</span>';
      }).join("");
      var body = rows.length? rows.map(opts.row).join("") : '';
      c.innerHTML='<div class="note">'+opts.note+'</div><div class="panel"><div class="panel-head"><h2>'+opts.title+'</h2><div class="spacer"></div><div class="filters">'+chips+'</div></div>'+
        (rows.length? '<table class="tbl"><thead>'+opts.head+'</thead><tbody>'+body+'</tbody></table>' : emptyBox(opts.empty))+'</div>';
      c.querySelectorAll(".chip-f").forEach(function(el){ el.addEventListener("click",function(){ filter=el.getAttribute("data-f"); load(); }); });
      c.querySelectorAll("[data-act]").forEach(function(el){ el.addEventListener("click",function(){ act(el.getAttribute("data-act"), el.getAttribute("data-id")); }); });
    }
    function act(a,id){
      if(a==="approve"){ if(confirm("Aprobi acest element? Va deveni vizibil public.")) doUpdate(id,{status:"approved",rejection_reason:null}); }
      else if(a==="hide"){ if(confirm("Ascunzi acest element din public?")) doUpdate(id,{status:"hidden"}); }
      else if(a==="reject"){
        openModal('<h3>Respinge cu motiv</h3><p>Motivul (opțional, intern):</p><div class="field"><textarea id="rr" rows="3"></textarea></div><div class="actions"><button class="btn btn-ghost" id="mc">Anulează</button><button class="btn btn-danger" id="mo">Respinge</button></div>');
        document.getElementById("mc").onclick=closeModal;
        document.getElementById("mo").onclick=function(){ var rr=document.getElementById("rr").value.trim(); closeModal(); doUpdate(id,{status:"rejected",rejection_reason:rr||null}); };
      }
    }
    function doUpdate(id,patch){
      sb.from(table).update(patch).eq("id",id).then(function(r){
        if(r.error){ alert("Eroare: "+r.error.message); } else { load(); refreshBadges(); }
      });
    }
    load();
  }

  function secReviews(c){
    modSection(c,"reviews",{
      title:"Recenzii", note:"Doar recenziile <b>aprobate</b> apar pe site. Acțiunile sunt înregistrate în audit log.",
      empty:"Nicio recenzie aici.",
      head:'<tr><th>Autor</th><th>Rating</th><th>Recenzie</th><th>Limbă</th><th>Status</th><th>Data</th><th>Acțiuni</th></tr>',
      row:function(r){
        return '<tr><td><b>'+esc(r.nickname||r.name)+'</b><div class="muted">'+esc(r.name)+'</div></td>'+
          '<td>'+stars(r.rating)+'</td>'+
          '<td>'+(r.title?'<b>'+esc(r.title)+'</b><br>':'')+esc((r.body||"").slice(0,160))+'</td>'+
          '<td>'+esc(r.locale)+'</td><td><span class="badge-s s-'+r.status+'">'+r.status+'</span></td>'+
          '<td class="muted">'+fmt(r.created_at)+'</td>'+
          '<td><div class="row-actions">'+actBtns(r)+'</div></td></tr>';
      }
    });
  }
  function secComments(c){
    modSection(c,"comments",{
      title:"Comentarii", note:"Sistem de comentarii pregătit. Doar comentariile aprobate ar apărea public (acolo unde adaugi o secțiune de comentarii).",
      empty:"Niciun comentariu. (Sistem pregătit; activează-l când adaugi o secțiune de comentarii pe site.)",
      head:'<tr><th>Autor</th><th>Comentariu</th><th>Țintă</th><th>Status</th><th>Data</th><th>Acțiuni</th></tr>',
      row:function(r){
        return '<tr><td><b>'+esc(r.nickname||r.author_name)+'</b></td><td>'+esc((r.body||"").slice(0,180))+'</td>'+
          '<td class="muted">'+esc(r.target_type||"")+' '+esc(r.target_id||"")+'</td>'+
          '<td><span class="badge-s s-'+r.status+'">'+r.status+'</span></td><td class="muted">'+fmt(r.created_at)+'</td>'+
          '<td><div class="row-actions">'+actBtns(r)+'</div></td></tr>';
      }
    });
  }
  function actBtns(r){
    var b="";
    if(r.status!=="approved") b+='<button class="btn btn-primary btn-sm" data-act="approve" data-id="'+r.id+'">Aprobă</button>';
    if(r.status!=="rejected") b+='<button class="btn btn-danger btn-sm" data-act="reject" data-id="'+r.id+'">Respinge</button>';
    if(r.status!=="hidden") b+='<button class="btn btn-ghost btn-sm" data-act="hide" data-id="'+r.id+'">Ascunde</button>';
    return b;
  }

  // ====== generic ticket table (support / reports / privacy) ======
  function ticketSection(c, table, opts){
    var filter="all";
    function load(){
      var q=sb.from(table).select("*").order("created_at",{ascending:false}).limit(200);
      if(filter!=="all") q=q.eq("status",filter);
      q.then(function(r){ render(r.data||[]); });
    }
    function render(rows){
      var chips=["all","new","in_progress","resolved","closed"].map(function(s){ return '<span class="chip-f '+(s===filter?"active":"")+'" data-f="'+s+'">'+s.replace("_"," ")+'</span>'; }).join("");
      c.innerHTML='<div class="note">'+opts.note+'</div><div class="panel"><div class="panel-head"><h2>'+opts.title+'</h2><div class="spacer"></div><div class="filters">'+chips+'</div></div>'+
        (rows.length? '<table class="tbl"><thead>'+opts.head+'</thead><tbody>'+rows.map(opts.row).join("")+'</tbody></table>' : emptyBox(opts.empty))+'</div>';
      c.querySelectorAll(".chip-f").forEach(function(el){ el.addEventListener("click",function(){ filter=el.getAttribute("data-f"); load(); }); });
      c.querySelectorAll("select[data-status]").forEach(function(el){ el.addEventListener("change",function(){ upd(el.getAttribute("data-status"),{status:el.value}); }); });
      c.querySelectorAll("button[data-gdpr-del]").forEach(function(el){ el.addEventListener("click",function(){ gdprDelete(el.getAttribute("data-gdpr-del"), el.getAttribute("data-id"), load); }); });
    }
    function upd(id,patch){ sb.from(table).update(patch).eq("id",id).then(function(r){ if(r.error)alert("Eroare: "+r.error.message); else { load(); refreshBadges(); } }); }
    load();
  }
  // GDPR — „dreptul de a fi uitat": șterge datele personale asociate unui e-mail
  // (tichete + raportări), apoi marchează cererea ca rezolvată (rămâne ca dovadă, auditată).
  function gdprDelete(email, id, done){
    if(!email) return;
    if(!confirm("ȘTERGE definitiv datele personale asociate cu „"+email+"” (tichete de suport + raportări)?\nCererea va fi marcată rezolvată. Acțiune ireversibilă.")) return;
    Promise.all([
      sb.from("support_tickets").delete().eq("email", email),
      sb.from("problem_reports").delete().eq("email", email)
    ]).then(function(){
      sb.from("privacy_requests").update({status:"resolved"}).eq("id", id).then(function(r){
        if(r && r.error){ alert("Eroare: "+r.error.message); return; }
        if(typeof done==="function") done();
        refreshBadges();
        alert("Datele personale asociate au fost șterse; cererea a fost marcată rezolvată.");
      });
    });
  }
  function statusSelect(r){
    return '<select data-status="'+r.id+'">'+["new","in_progress","resolved","closed"].map(function(s){
      return '<option value="'+s+'"'+(r.status===s?" selected":"")+'>'+s.replace("_"," ")+'</option>';
    }).join("")+'</select>';
  }
  function secSupport(c){
    ticketSection(c,"support_tickets",{
      title:"Suport & Contact", note:"Mesaje din formularele de contact și suport.", empty:"Niciun mesaj încă.",
      head:'<tr><th>De la</th><th>Subiect / mesaj</th><th>Categorie</th><th>Limbă</th><th>Status</th><th>Data</th></tr>',
      row:function(r){ return '<tr><td><b>'+esc(r.name||"—")+'</b><div class="muted">'+esc(r.email)+'</div></td>'+
        '<td>'+(r.subject?'<b>'+esc(r.subject)+'</b><br>':'')+esc((r.message||"").slice(0,180))+'</td>'+
        '<td class="muted">'+esc(r.category||"")+'</td><td class="muted">'+esc(r.locale)+'</td><td>'+statusSelect(r)+'</td><td class="muted">'+fmt(r.created_at)+'</td></tr>'; }
    });
  }
  function secReports(c){
    ticketSection(c,"problem_reports",{
      title:"Raportări probleme", note:"Probleme raportate de utilizatori.", empty:"Nicio raportare încă.",
      head:'<tr><th>De la</th><th>Categorie</th><th>Descriere</th><th>Status</th><th>Data</th></tr>',
      row:function(r){ return '<tr><td class="muted">'+esc(r.email)+'</td><td>'+esc(r.category||"")+'</td>'+
        '<td>'+esc((r.description||"").slice(0,180))+(r.steps_to_reproduce?'<div class="muted">Pași: '+esc(r.steps_to_reproduce.slice(0,100))+'</div>':'')+'</td>'+
        '<td>'+statusSelect(r)+'</td><td class="muted">'+fmt(r.created_at)+'</td></tr>'; }
    });
  }
  function secPrivacy(c){
    ticketSection(c,"privacy_requests",{
      title:"Cereri de confidențialitate (GDPR)", note:"Acces limitat. Procesează conform Politicii de confidențialitate. Toate acțiunile sunt în audit log.", empty:"Nicio cerere GDPR.",
      head:'<tr><th>E-mail</th><th>Tip cerere</th><th>Mesaj</th><th>Status</th><th>Data</th><th>Acțiune</th></tr>',
      row:function(r){ return '<tr><td class="muted">'+esc(r.email)+'</td><td><b>'+esc(r.request_type)+'</b></td>'+
        '<td>'+esc((r.message||"").slice(0,180))+'</td><td>'+statusSelect(r)+'</td><td class="muted">'+fmt(r.created_at)+'</td>'+
        '<td><button class="btn btn-danger btn-sm" data-gdpr-del="'+esc(r.email)+'" data-id="'+r.id+'" title="Șterge datele personale asociate">Execută ștergerea</button></td></tr>'; }
    });
  }

  // ====== ANALYTICS (agregat, fără PII) ======
  function secAnalytics(c){
    sb.from("analytics_events").select("event_name,device_type,os,browser,country,locale,created_at").limit(5000).then(function(r){
      var rows=r.data||[];
      if(!rows.length){ c.innerHTML='<div class="note">Analytics agregat, privacy-aware (fără IP, doar cu consimțământ). Activează trimiterea evenimentelor pe site pentru a vedea date aici.</div>'+emptyBox("Niciun eveniment înregistrat încă."); return; }
      function agg(key){ var m={}; rows.forEach(function(x){ var k=x[key]||"necunoscut"; m[k]=(m[k]||0)+1; }); return Object.keys(m).map(function(k){return [k,m[k]];}).sort(function(a,b){return b[1]-a[1];}); }
      // agregare pe zile pentru graficul de activitate
      function dailySeries(){
        var m={}; rows.forEach(function(x){ var d=new Date(x.created_at); if(isNaN(d))return; var k=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); m[k]=(m[k]||0)+1; });
        return Object.keys(m).sort().map(function(k){ var p=k.split("-"); return [p[2]+"."+p[1], m[k]]; });
      }
      c.innerHTML='<div class="note">Total evenimente (eșantion): <b>'+rows.length+'</b>. Date agregate, privacy-aware (fără IP, doar cu consimțământ).</div>'+
        '<div class="panel"><div class="panel-head"><h2>Activitate în timp</h2><div class="spacer"></div><span class="muted">evenimente / zi</span></div>'+barChartV(dailySeries())+'</div>'+
        '<div class="panel" style="background:none;border:none;box-shadow:none;margin-top:18px"><div class="panel-head" style="border:none;padding-left:0"><h2>Evenimente</h2></div>'+metricCards(agg("event_name"),"event_name")+'</div>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px">'+
          chartPanel("Dispozitiv",agg("device_type"),"device_type","donut")+
          chartPanel("Sistem de operare",agg("os"),"os","donut")+
          chartPanel("Browser",agg("browser"),"browser","donut")+
          chartPanel("Limbă",agg("locale"),"locale","list")+
          chartPanel("Țară (agregat)",agg("country"),"country","list")+
        '</div>';
      countUp(c);
    });
  }

  // ====== AUDIT ======
  function secAudit(c){
    sb.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(200).then(function(r){
      var rows=r.data||[];
      c.innerHTML='<div class="note">Jurnal de audit pentru acțiunile de moderare (acces doar admin).</div><div class="panel">'+
        (rows.length? '<table class="tbl"><thead><tr><th>Data</th><th>Acțiune</th><th>Entitate</th><th>Detalii</th></tr></thead><tbody>'+
          rows.map(function(a){ return '<tr><td class="muted">'+fmt(a.created_at)+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.entity_type)+'</td><td class="muted">'+esc(JSON.stringify(a.metadata||{}))+'</td></tr>'; }).join("")+
        '</tbody></table>' : emptyBox("Niciun eveniment de audit încă."))+'</div>';
    });
  }

  // ====== Chart toolkit (SVG, fără librărie) ======
  // grafic de activitate în timp (area + line, gradient)
  function areaChart(points){
    var n=points.length; if(n<2) return '<div style="padding:18px">'+emptyBox("Date insuficiente pentru trend.")+'</div>';
    var W=620,H=190,pad=30, max=Math.max.apply(null,points.map(function(p){return p[1];}).concat([1]));
    var step=(W-pad*2)/(n-1);
    var xs=points.map(function(p,i){return pad+i*step;}), ys=points.map(function(p){return H-pad-(p[1]/max)*(H-pad*2-6);});
    var line="M"+xs[0].toFixed(1)+" "+ys[0].toFixed(1);
    for(var i=1;i<n;i++){ var cx=((xs[i-1]+xs[i])/2).toFixed(1); line+=" C"+cx+" "+ys[i-1].toFixed(1)+" "+cx+" "+ys[i].toFixed(1)+" "+xs[i].toFixed(1)+" "+ys[i].toFixed(1); }
    var area=line+" L"+xs[n-1].toFixed(1)+" "+(H-pad)+" L"+xs[0].toFixed(1)+" "+(H-pad)+" Z";
    var grid=""; for(var g=0;g<=3;g++){ var gy=(pad+g*((H-pad*2)/3)).toFixed(1); grid+='<line x1="'+pad+'" y1="'+gy+'" x2="'+(W-pad)+'" y2="'+gy+'" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>'; }
    var dots=xs.map(function(x,i){return '<circle cx="'+x.toFixed(1)+'" cy="'+ys[i].toFixed(1)+'" r="4" fill="var(--bg-base)" stroke="var(--lime)" stroke-width="2.5"/>';}).join("");
    var labels=points.map(function(p,i){return '<text x="'+xs[i].toFixed(1)+'" y="'+(H-9)+'" fill="var(--faint)" font-size="11" text-anchor="middle">'+esc(p[0])+'</text>';}).join("");
    return '<div style="padding:14px 12px 6px"><svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;overflow:visible">'+
      '<defs><linearGradient id="zgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--green);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--green);stop-opacity:0"/></linearGradient></defs>'+
      grid+'<path d="'+area+'" fill="url(#zgrad)" class="area-fill"/><path class="area-line" d="'+line+'" fill="none" stroke="var(--lime)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 4px 8px color-mix(in srgb,var(--lime) 40%,transparent))"/>'+dots+labels+'</svg></div>';
  }
  // grafic de bare verticale (coloane) cu gradient — curat, dashboard-style
  function barChartV(points){
    var n=points.length; if(!n) return '<div style="padding:18px">'+emptyBox("Fără date.")+'</div>';
    var max=Math.max.apply(null,points.map(function(p){return p[1];}).concat([1]));
    return '<div style="display:flex;align-items:flex-end;gap:12px;height:210px;padding:20px 18px 12px">'+points.map(function(p,i){
      var h=Math.max(Math.round(p[1]/max*148),6);
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;justify-content:flex-end;height:100%">'+
        '<b style="font-size:12px;color:var(--text)" data-to="'+p[1]+'">0</b>'+
        '<div class="vbar" style="width:100%;max-width:48px;height:'+h+'px;animation-delay:'+(i*0.05)+'s"><span></span></div>'+
        '<span class="muted" style="font-size:11px;font-weight:600">'+esc(p[0])+'</span></div>';
    }).join("")+'</div>';
  }
  function donut(data, cat){
    var total=data.reduce(function(s,d){return s+d[1];},0)||1, r=52, cx=64, cy=64, circ=2*Math.PI*r, off=0, gap=6;
    var defs="", segs=data.map(function(d,i){
      var frac=d[1]/total, len=frac*circ, col=CHART_COLORS[i%CHART_COLORS.length], vis=Math.max(len-gap,0.5), gid="dg_"+cat+"_"+i;
      defs+='<linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+col+'"/><stop offset="1" stop-color="'+col+'" stop-opacity="0.65"/></linearGradient>';
      var s='<circle class="seg" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="url(#'+gid+')" stroke-width="15" stroke-linecap="round" stroke-dasharray="'+vis.toFixed(1)+' '+(circ-vis).toFixed(1)+'" stroke-dashoffset="'+(-off).toFixed(1)+'" transform="rotate(-90 '+cx+' '+cy+')"><title>'+esc(d[0])+': '+d[1]+'</title></circle>';
      off+=len; return s;
    }).join("");
    var legend=data.map(function(d,i){ var col=CHART_COLORS[i%CHART_COLORS.length], pct=Math.round(d[1]/total*100);
      return '<div style="display:flex;align-items:center;gap:9px;margin:7px 0"><span class="ico" style="font-size:16px;color:'+col+'">'+(ICONS[iconFor(cat,d[0])]||"")+'</span>'+
        '<span style="width:9px;height:9px;border-radius:3px;background:'+col+';flex:0 0 auto;box-shadow:0 0 6px '+col+'"></span>'+
        '<span style="flex:1;font-size:13px;color:var(--text)">'+esc(d[0])+'</span><b style="font-size:13px">'+d[1]+'</b><span class="muted" style="font-size:12px;width:38px;text-align:right">'+pct+'%</span></div>';
    }).join("");
    return '<div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap;padding:18px"><div style="position:relative;flex:0 0 auto">'+
      '<svg class="donut-svg" width="132" height="132" viewBox="0 0 128 128"><defs>'+defs+'</defs><circle cx="64" cy="64" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="15"/>'+segs+'</svg>'+
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none"><b style="font-size:25px;color:#fff" data-to="'+total+'">0</b><span class="muted" style="font-size:11px">total</span></div></div>'+
      '<div style="flex:1;min-width:180px">'+legend+'</div></div>';
  }
  function iconList(data, cat){
    var max=Math.max.apply(null,data.map(function(d){return d[1];}).concat([1]));
    return '<div style="padding:12px 16px 16px">'+data.slice(0,12).map(function(d,i){ var w=Math.round(d[1]/max*100), col=colorFor(cat,d[0],i), cc=flagCC(cat,d[0]);
      var badge = cc
        ? '<span style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);border:1px solid var(--line)">'+flagImg(cc)+'</span>'
        : '<span class="ico" style="width:30px;height:30px;border-radius:9px;background:color-mix(in srgb,'+col+' 16%,transparent);border:1px solid color-mix(in srgb,'+col+' 26%,transparent);font-size:16px;color:'+col+'">'+(ICONS[iconFor(cat,d[0])]||"")+'</span>';
      return '<div style="display:flex;align-items:center;gap:11px;margin:9px 0">'+badge+
        '<span style="width:96px;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(d[0])+'</span>'+
        '<span style="flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,0.06)"><span style="display:block;height:100%;width:'+w+'%;border-radius:6px;background:linear-gradient(90deg,'+col+',color-mix(in srgb,'+col+' 50%,#fff))"></span></span>'+
        '<b style="width:34px;text-align:right">'+d[1]+'</b></div>';
    }).join("")+'</div>';
  }
  function chartPanel(title,data,cat,kind){ return '<div class="panel"><div class="panel-head"><h2>'+esc(title)+'</h2></div>'+(data.length?(kind==="donut"?donut(data,cat):iconList(data,cat)):emptyBox("Fără date."))+'</div>'; }
  function metricCards(data,cat){
    return '<div class="kpis">'+data.map(function(d,i){ var col=colorFor(cat,d[0],i), cc=flagCC(cat,d[0]);
      var badge = cc
        ? '<div class="k-ic k-soft" style="background:rgba(255,255,255,0.05);border:1px solid var(--line)">'+flagImg(cc)+'</div>'
        : '<div class="k-ic k-soft" style="color:'+col+';background:color-mix(in srgb,'+col+' 18%,transparent);border:1px solid color-mix(in srgb,'+col+' 34%,transparent)"><span class="ico">'+(ICONS[iconFor(cat,d[0])]||"")+'</span></div>';
      return '<div class="kpi">'+badge+'<div class="k-val" data-to="'+d[1]+'">0</div><div class="k-lab">'+esc(d[0])+'</div></div>';
    }).join("")+'</div>';
  }

  // ====== SETTINGS (editabil) ======
  function secSettings(c){
    var KEYS=[["company","Companie"],["support_email","E-mail suport"],["privacy_email","E-mail confidențialitate"],["address","Adresă"],["vat","CUI/TVA"],["default_locale","Limbă implicită"],["social_facebook","Facebook URL"],["social_tiktok","TikTok URL"],["social_instagram","Instagram URL"]];
    sb.from("settings").select("*").then(function(r){
      var map={}; (r.data||[]).forEach(function(s){ map[s.key]=typeof s.value==="string"?s.value:JSON.stringify(s.value); });
      c.innerHTML='<div class="note">Setări platformă. Modificările se salvează în baza de date (audit-abil).</div>'+
        '<div class="panel"><div class="panel-head"><h2>Aspect / Temă</h2><div class="spacer"></div><span class="muted">5 teme premium</span></div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:18px">'+
        THEMES.map(function(t){ return '<button type="button" class="t-card'+(currentTheme()===t.id?" active":"")+'" data-theme="'+t.id+'" style="border:1px solid var(--line);border-radius:14px;padding:0;cursor:pointer;overflow:hidden;width:148px;background:var(--card);transition:transform .15s">'+
          '<div style="height:56px;background:linear-gradient(135deg,'+t.g+','+t.l+')"></div>'+
          '<div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between"><span style="color:var(--text);font-weight:700;font-size:13px">'+t.label+'</span><span style="color:'+t.l+';font-weight:800">'+(currentTheme()===t.id?"✓":"")+'</span></div></button>'; }).join("")+
        '</div></div>'+
        '<div class="panel"><div class="panel-head"><h2>Setări generale</h2></div><div style="padding:18px;max-width:560px">'+
        KEYS.map(function(k){ return '<div class="field"><label for="set-'+k[0]+'">'+esc(k[1])+'</label><input id="set-'+k[0]+'" value="'+esc(map[k[0]]||"")+'"></div>'; }).join("")+
        '<button class="btn btn-primary" id="setSave">'+ic("save")+'Salvează</button><div class="msg" id="setMsg"></div></div></div>';
      document.getElementById("setSave").addEventListener("click",function(){
        var rows=KEYS.map(function(k){ return {key:k[0], value:document.getElementById("set-"+k[0]).value}; });
        sb.from("settings").upsert(rows,{onConflict:"key"}).then(function(rr){
          var m=document.getElementById("setMsg"); if(rr.error){m.className="msg bad";m.textContent="Eroare: "+rr.error.message;} else {m.className="msg ok";m.textContent="Setări salvate.";}
        });
      });
      c.querySelectorAll(".t-card").forEach(function(b){ b.addEventListener("click",function(){ applyTheme(b.getAttribute("data-theme")); navigate("settings"); }); });
    });
  }

  // ====== BUTOANE STORE (footer site + aplicație) ======
  function secAppStores(c){
    var DEF="https://github.com/iren-savastre/zelynta/releases/latest";
    sb.from("settings").select("*").then(function(r){
      var map={}; (r.data||[]).forEach(function(s){ map[s.key]=typeof s.value==="string"?s.value:JSON.stringify(s.value); });
      function chk(k){ return (map[k]==="0"||map[k]==="false") ? "" : "checked"; }
      c.innerHTML='<div class="note">Butoanele de descărcare din footer (site + aplicație). Lasă URL gol și debifează „Afișat" ca să ascunzi un buton. „Șterge" golește URL-ul și ascunde.</div>'+
        '<div class="panel"><div class="panel-head"><h2>Butoane store</h2><div class="spacer"></div><span class="muted">Google Play · App Store</span></div><div style="padding:18px;max-width:580px">'+
        '<div class="field"><label for="st-android">Google Play — URL</label><input id="st-android" placeholder="'+DEF+'" value="'+esc(map["store_android_url"]||"")+'"></div>'+
        '<label style="display:flex;gap:8px;align-items:center;margin:-4px 0 16px;color:var(--text)"><input type="checkbox" id="st-android-show" '+chk("store_android_show")+'> Afișat</label>'+
        '<div class="field"><label for="st-ios">App Store — URL</label><input id="st-ios" placeholder="'+DEF+'" value="'+esc(map["store_ios_url"]||"")+'"></div>'+
        '<label style="display:flex;gap:8px;align-items:center;margin:-4px 0 16px;color:var(--text)"><input type="checkbox" id="st-ios-show" '+chk("store_ios_show")+'> Afișat</label>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
          '<button class="btn btn-primary" id="stSave">'+ic("save")+'Salvează</button>'+
          '<button class="btn" id="stClearA" type="button">Șterge Google Play</button>'+
          '<button class="btn" id="stClearI" type="button">Șterge App Store</button>'+
        '</div><div class="msg" id="stMsg"></div></div></div>';
      function save(rows,okText,reload){
        sb.from("settings").upsert(rows,{onConflict:"key"}).then(function(rr){
          var m=document.getElementById("stMsg");
          if(rr.error){ m.className="msg bad"; m.textContent="Eroare: "+rr.error.message; }
          else { m.className="msg ok"; m.textContent=okText; if(reload) setTimeout(function(){ navigate("appstores"); },500); }
        });
      }
      document.getElementById("stSave").addEventListener("click",function(){
        save([
          {key:"store_android_url",value:document.getElementById("st-android").value.trim()},
          {key:"store_ios_url",value:document.getElementById("st-ios").value.trim()},
          {key:"store_android_show",value:document.getElementById("st-android-show").checked?"1":"0"},
          {key:"store_ios_show",value:document.getElementById("st-ios-show").checked?"1":"0"}
        ],"Salvat. Butoanele se actualizează pe site și în aplicație.",false);
      });
      document.getElementById("stClearA").addEventListener("click",function(){ save([{key:"store_android_url",value:""},{key:"store_android_show",value:"0"}],"Google Play șters și ascuns.",true); });
      document.getElementById("stClearI").addEventListener("click",function(){ save([{key:"store_ios_url",value:""},{key:"store_ios_show",value:"0"}],"App Store șters și ascuns.",true); });
    });
  }

  // ====== LANDING PAGE (CMS) ======
  // Curăță conținutul CMS la scriere (anti-XSS stocat): elimină tag-uri periculoase,
  // handlere de evenimente (on*) și URI-uri javascript:.
  function sanitizeCms(s){
    return String(s==null?"":s)
      .replace(/<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,"")
      .replace(/<\s*(script|iframe|object|embed|style)[^>]*\/?>/gi,"")
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"")
      .replace(/(href|src)\s*=\s*("?)\s*javascript:[^"'>\s]*/gi,"$1=$2#");
  }
  function secLanding(c){
    sb.from("landing_content").select("*").order("section",{ascending:true}).limit(500).then(function(r){
      var rows=r.data||[];
      c.innerHTML='<div class="note">Conținut editabil al landing page-ului, per secțiune și limbă. Site-ul citește textele <b>published</b>; fallback la valorile implicite din pagină dacă nu există rând.</div>'+
        '<div class="panel"><div class="panel-head"><h2>Conținut landing</h2><div class="spacer"></div><button class="btn btn-ghost btn-sm" id="lcAdd">+ Adaugă</button></div>'+
        (rows.length?'<table class="tbl"><thead><tr><th>Secțiune</th><th>Cheie</th><th>Limbă</th><th>Valoare</th><th>Status</th><th></th></tr></thead><tbody>'+
          rows.map(function(x){ return '<tr><td>'+esc(x.section)+'</td><td class="muted">'+esc(x.key)+'</td><td>'+esc(x.locale)+'</td>'+
            '<td><input data-lc="'+x.id+'" value="'+esc(x.value||"")+'" style="min-width:240px"></td>'+
            '<td><span class="badge-s '+(x.status==="published"?"s-approved":"s-pending")+'">'+esc(x.status)+'</span></td>'+
            '<td><button class="btn btn-primary btn-sm" data-lcsave="'+x.id+'" data-sec="'+esc(x.section)+'" data-key="'+esc(x.key)+'" data-loc="'+esc(x.locale)+'">Salvează</button></td></tr>'; }).join("")+'</tbody></table>'
          : emptyBox("Niciun conținut CMS. Site-ul folosește textele implicite din pagină. Adaugă rânduri ca să le suprascrii."))+'</div>';
      c.querySelectorAll("[data-lcsave]").forEach(function(b){ b.addEventListener("click",function(){
        var id=b.getAttribute("data-lcsave"); var val=sanitizeCms(c.querySelector('[data-lc="'+id+'"]').value);
        sb.from("landing_content").update({value:val}).eq("id",id).then(function(){ b.textContent="Salvat ✓"; setTimeout(function(){b.textContent="Salvează";},1200); });
      }); });
      var add=document.getElementById("lcAdd"); if(add) add.addEventListener("click",function(){
        openModal('<h3>Adaugă conținut</h3>'+
          '<div class="field"><label>Secțiune</label><input id="ns"></div><div class="field"><label>Cheie</label><input id="nk"></div>'+
          '<div class="field"><label>Limbă</label><input id="nl" value="ro"></div><div class="field"><label>Valoare</label><textarea id="nv"></textarea></div>'+
          '<div class="actions"><button class="btn btn-ghost" id="nc">Anulează</button><button class="btn btn-primary" id="no">Adaugă</button></div>');
        document.getElementById("nc").onclick=closeModal;
        document.getElementById("no").onclick=function(){
          sb.from("landing_content").insert({section:document.getElementById("ns").value,key:document.getElementById("nk").value,locale:document.getElementById("nl").value,value:sanitizeCms(document.getElementById("nv").value),status:"published"}).then(function(){ closeModal(); navigate("landing"); });
        };
      });
    });
  }

  // ====== LEGAL PAGES (CMS) ======
  function secLegal(c){
    var SLUGS=["legal","privacy","terms","cookies","cookie-preferences","gdpr-rights","data-processing","acceptable-use"];
    sb.from("legal_pages").select("*").limit(500).then(function(r){
      var rows=r.data||[];
      c.innerHTML='<div class="note">Pagini legale administrate (titlu, conținut, status, ultima actualizare), per limbă.</div>'+
        '<div class="panel"><div class="panel-head"><h2>Pagini legale</h2></div>'+
        '<table class="tbl"><thead><tr><th>Slug</th><th>Titlu</th><th>Limbă</th><th>Status</th><th>Actualizat</th><th></th></tr></thead><tbody>'+
        SLUGS.map(function(slug){
          var x=rows.filter(function(p){return p.slug===slug;})[0];
          return '<tr><td><b>'+esc(slug)+'</b></td><td>'+esc(x?x.title:"—")+'</td><td>'+esc(x?x.locale:"ro")+'</td>'+
            '<td>'+(x?'<span class="badge-s '+(x.status==="published"?"s-approved":"s-pending")+'">'+esc(x.status)+'</span>':'<span class="muted">implicit</span>')+'</td>'+
            '<td class="muted">'+(x?fmt(x.last_updated_at):"—")+'</td>'+
            '<td><a class="btn btn-ghost btn-sm" href="../docs/legal/'+(slug==="legal"?"index":slug)+'.html" target="_blank" rel="noopener">Preview</a></td></tr>';
        }).join("")+'</tbody></table></div>'+
        '<div class="note" style="margin-top:14px">Editarea integrală a conținutului legal se face în fișierele paginilor (versionate). Acest tabel reflectă starea/CMS pentru sincronizare.</div>';
    });
  }

  // ====== COOKIE CONSENT MANAGER ======
  function secCookies(c){
    var inv=[
      ["zelynta_lang","Zelynta (first-party)","Reține limba aleasă","Funcțional","Persistent","Nu"],
      ["zelynta_consent","Zelynta (first-party)","Reține consimțământul cookie","Strict necesar","Persistent","Nu"],
      ["flagcdn.com","flagcdn (terț)","Imagini steaguri","Funcțional","La cerere","Nu"]
    ];
    c.innerHTML='<div class="note">Inventar cookie + categorii. Analytics/Marketing rămân <b>off</b> până la consimțământ. Verificarea „înainte de accept" se face pe site (consent gating).</div>'+
      '<div class="kpis"><div class="kpi"><div class="k-ic">'+ic("cookie")+'</div><div class="k-val">4</div><div class="k-lab">Categorii</div></div>'+
      '<div class="kpi"><div class="k-ic">'+ic("cookie")+'</div><div class="k-val">2</div><div class="k-lab">Strict necesare / funcționale active</div></div>'+
      '<div class="kpi"><div class="k-ic">'+ic("cookie")+'</div><div class="k-val">0</div><div class="k-lab">Analytics/Marketing implicit</div></div></div>'+
      '<div class="panel"><div class="panel-head"><h2>Inventar cookie</h2></div><table class="tbl"><thead><tr><th>Nume</th><th>Furnizor</th><th>Scop</th><th>Categorie</th><th>Durată</th><th>Consimțământ</th></tr></thead><tbody>'+
      inv.map(function(i){ return '<tr><td><b>'+esc(i[0])+'</b></td><td class="muted">'+esc(i[1])+'</td><td>'+esc(i[2])+'</td><td>'+esc(i[3])+'</td><td class="muted">'+esc(i[4])+'</td><td>'+esc(i[5])+'</td></tr>'; }).join("")+'</tbody></table></div>'+
      '<div class="panel"><div class="panel-head"><h2>Categorii</h2></div><table class="tbl"><tbody>'+
      [["Strict necesare","Mereu active"],["Funcționale","Cu consimțământ"],["Analytics","Off implicit"],["Marketing","Off implicit"]].map(function(x){return '<tr><td><b>'+x[0]+'</b></td><td class="muted">'+x[1]+'</td></tr>';}).join("")+'</tbody></table></div>';
  }

  // ====== APP / SCAN DATA ======
  function secAppData(c){
    c.innerHTML='<div class="note">Aplicația scanează produse <b>local pe dispozitiv</b> (fără server propriu), folosind baze deschise (Open Food Facts etc.). Nu există date de scanare stocate pe server — deci nu există ce administra aici. Dacă în viitor adaugi telemetrie de scanare (consent-gated), apare aici.</div>'+
      emptyBox("Fără date de scanare pe server. Aplicația funcționează offline-first, fără cont.");
  }

  // ====== OPTIMIZARE IMAGINI (scanare + conversie WebP, 100% în browser) ======
  function fmtB(n){ if(n==null)return "—"; if(n<1024)return n+" B"; if(n<1048576)return (n/1024).toFixed(1)+" KB"; return (n/1048576).toFixed(2)+" MB"; }
  function webpName(n){ return String(n||"imagine").replace(/\.(png|jpe?g|jpeg)$/i,"")+".webp"; }
  function dlBlob(blob,name){ var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); }
  function imgToWebp(file,quality){
    return new Promise(function(resolve,reject){
      var url=URL.createObjectURL(file); var img=new Image();
      img.onload=function(){ var cv=document.createElement("canvas"); cv.width=img.naturalWidth||img.width; cv.height=img.naturalHeight||img.height;
        try{ cv.getContext("2d").drawImage(img,0,0); }catch(e){ URL.revokeObjectURL(url); return reject(e); }
        cv.toBlob(function(b){ URL.revokeObjectURL(url); if(b)resolve(b); else reject(new Error("Conversie esuata")); },"image/webp",quality); };
      img.onerror=function(){ URL.revokeObjectURL(url); reject(new Error("Imagine invalida")); };
      img.src=url;
    });
  }
  function secImages(c){
    var DEFURL="https://iren-savastre.github.io/zelynta/";
    c.innerHTML=
      '<div class="note">Optimizezi imaginile <b>fără cod</b>, din butoane. <b>1)</b> Scanezi site-ul ca să vezi ce e greu. <b>2)</b> Tragi imaginile aici și le transformi în <b>WebP</b> (mult mai mici), cu același nume + <code>.webp</code>. La publicare, site-ul folosește automat versiunea optimizată — maparea nu se strică.</div>'+
      '<div class="panel"><div class="panel-head"><h2>1. Scanează imaginile site-ului</h2></div>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:0 4px 4px">'+
          '<input id="imgUrl" value="'+DEFURL+'" style="flex:1;min-width:240px;background:var(--glass);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:9px 12px;font-size:13px">'+
          '<button class="btn btn-primary btn-sm" id="imgScan">Scanează</button></div>'+
        '<div id="imgScanRes" style="padding:6px"></div>'+
      '</div>'+
      '<div class="panel"><div class="panel-head"><h2>2. Convertește în WebP</h2><div class="spacer"></div>'+
        '<label class="muted" style="font-size:13px">Calitate <input id="imgQ" type="range" min="50" max="95" value="82" style="vertical-align:middle"> <span id="imgQv">82</span></label></div>'+
        '<div id="imgDrop" style="margin:4px;border:2px dashed var(--line);border-radius:14px;padding:26px;text-align:center;color:var(--muted);cursor:pointer">'+
          'Trage imaginile aici (PNG/JPG) sau <b>apasă ca să alegi</b>. <input id="imgFile" type="file" accept="image/png,image/jpeg" multiple style="display:none"></div>'+
        '<div style="padding:4px 4px 0"><button class="btn btn-ghost btn-sm" id="imgDlAll" style="display:none">Descarcă toate WebP</button></div>'+
        '<div id="imgList" style="padding:4px"></div>'+
      '</div>';

    // --- conversie ---
    var Q=function(){ return (parseInt(document.getElementById("imgQ").value,10)||82)/100; };
    document.getElementById("imgQ").addEventListener("input",function(){ document.getElementById("imgQv").textContent=this.value; });
    var converted=[]; // {name, blob}
    var listEl=document.getElementById("imgList"), dlAll=document.getElementById("imgDlAll");
    function handleFiles(files){
      Array.prototype.forEach.call(files,function(f){
        if(!/^image\/(png|jpe?g)$/.test(f.type)) return;
        var row=document.createElement("div"); row.style.cssText="display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:8px;flex-wrap:wrap";
        row.innerHTML='<img style="width:46px;height:46px;object-fit:contain;border-radius:8px;background:var(--glass)" src="'+URL.createObjectURL(f)+'">'+
          '<div style="flex:1;min-width:160px"><b>'+esc(f.name)+'</b><br><span class="muted" style="font-size:13px">original: '+fmtB(f.size)+' <span class="conv"></span></span></div>'+
          '<div class="act"><span class="muted" style="font-size:13px">se convertește…</span></div>';
        listEl.appendChild(row);
        imgToWebp(f,Q()).then(function(blob){
          var wn=webpName(f.name); converted.push({name:wn,blob:blob});
          var saved=Math.max(0,Math.round((1-blob.size/f.size)*100));
          row.querySelector(".conv").innerHTML=' → <b style="color:#4ade80">'+fmtB(blob.size)+' WebP (−'+saved+'%)</b>';
          var snip='<picture><source type="image/webp" srcset="'+wn+'"><img src="'+f.name+'"></picture>';
          var act=row.querySelector(".act"); act.innerHTML='';
          var b1=document.createElement("button"); b1.className="btn btn-primary btn-sm"; b1.textContent="Descarcă "+wn;
          b1.addEventListener("click",function(){ dlBlob(blob,wn); });
          var b2=document.createElement("button"); b2.className="btn btn-ghost btn-sm"; b2.style.marginLeft="6px"; b2.textContent="Copiază snippet";
          b2.addEventListener("click",function(){ navigator.clipboard&&navigator.clipboard.writeText(snip); b2.textContent="Copiat ✓"; setTimeout(function(){b2.textContent="Copiază snippet";},1200); });
          act.appendChild(b1); act.appendChild(b2);
          dlAll.style.display="";
        }).catch(function(e){ row.querySelector(".act").innerHTML='<span style="color:#f87171">Eroare: '+esc(e.message)+'</span>'; });
      });
    }
    var fileInput=document.getElementById("imgFile"), drop=document.getElementById("imgDrop");
    drop.addEventListener("click",function(){ fileInput.click(); });
    fileInput.addEventListener("change",function(){ handleFiles(this.files); this.value=""; });
    ["dragover","dragenter"].forEach(function(ev){ drop.addEventListener(ev,function(e){ e.preventDefault(); drop.style.borderColor="var(--accent,#34d399)"; }); });
    ["dragleave","drop"].forEach(function(ev){ drop.addEventListener(ev,function(e){ e.preventDefault(); drop.style.borderColor="var(--line)"; }); });
    drop.addEventListener("drop",function(e){ if(e.dataTransfer&&e.dataTransfer.files) handleFiles(e.dataTransfer.files); });
    dlAll.addEventListener("click",function(){ converted.forEach(function(it,i){ setTimeout(function(){ dlBlob(it.blob,it.name); }, i*300); }); });

    // --- scanare ---
    document.getElementById("imgScan").addEventListener("click",function(){
      var url=document.getElementById("imgUrl").value.trim(); var out=document.getElementById("imgScanRes");
      if(!url){ out.innerHTML=emptyBox("Pune o adresă (URL) a site-ului."); return; }
      out.innerHTML='<div class="muted" style="padding:8px">Se scanează…</div>';
      fetch(url).then(function(r){ return r.text(); }).then(function(html){
        var doc=new DOMParser().parseFromString(html,"text/html");
        var found={};
        doc.querySelectorAll("img[src]").forEach(function(el){ found[el.getAttribute("src")]=1; });
        doc.querySelectorAll("source[srcset]").forEach(function(el){ (el.getAttribute("srcset")||"").split(",").forEach(function(s){ var u=s.trim().split(" ")[0]; if(u)found[u]=1; }); });
        doc.querySelectorAll('link[rel="preload"][as="image"],link[rel="icon"],link[rel="apple-touch-icon"]').forEach(function(el){ if(el.getAttribute("href"))found[el.getAttribute("href")]=1; });
        var imgs=Object.keys(found).filter(function(u){ return /\.(png|jpe?g|webp|svg|gif|avif)(\?|$)/i.test(u); });
        if(!imgs.length){ out.innerHTML=emptyBox("Nu am găsit imagini referite în pagină."); return; }
        var rows=imgs.map(function(u){
          var ext=(u.match(/\.([a-z0-9]+)(\?|$)/i)||[])[1]||""; ext=ext.toLowerCase();
          var verdict, cls;
          if(ext==="png"||ext==="jpg"||ext==="jpeg"||ext==="gif"){ verdict="Poate fi optimizată → WebP"; cls="s-pending"; }
          else if(ext==="svg"){ verdict="Deja ușoară (vector)"; cls="s-approved"; }
          else { verdict="Deja optimizată ("+ext+")"; cls="s-approved"; }
          return '<tr><td style="word-break:break-all">'+esc(u)+'</td><td>'+ext.toUpperCase()+'</td><td><span class="badge-s '+cls+'">'+verdict+'</span></td></tr>';
        }).join("");
        var heavy=imgs.filter(function(u){ return /\.(png|jpe?g|gif)(\?|$)/i.test(u); }).length;
        out.innerHTML='<div class="note">Găsite '+imgs.length+' imagini · <b>'+heavy+'</b> de optimizat (PNG/JPG). Convertește-le mai jos în WebP.</div>'+
          '<table class="tbl"><thead><tr><th>Imagine</th><th>Tip</th><th>Recomandare</th></tr></thead><tbody>'+rows+'</tbody></table>';
      }).catch(function(){
        out.innerHTML='<div class="note">Nu am putut citi pagina automat (restricție de securitate a browserului / CORS). <b>Nicio problemă:</b> folosește convertorul de mai jos — tragi imaginile din folderul <code>docs/</code> și le transformi în WebP la apăsare de buton. (Cea mai grea e de obicei logo-ul <code>icon.png</code>.)</div>';
      });
    });
  }

  // ====== UTILIZATORI (staff) ======
  var ROLES=["super_admin","admin","moderator","support","content_manager","analyst","readonly"];
  function secUsers(c){
    sb.from("profiles").select("*").then(function(r){
      var rows=r.data||[];
      c.innerHTML='<div class="note">Conturile de <b>staff</b> (moderatori/administratori). Aplicația publică nu are conturi de utilizatori — deci aici administrezi doar echipa. Rolul controlează accesul (RBAC, impus de RLS).</div>'+
        '<div class="panel"><div class="panel-head"><h2>Echipă</h2><div class="spacer"></div><span class="muted">'+rows.length+' membri</span></div>'+
        (rows.length?'<table class="tbl"><thead><tr><th>Membru</th><th>E-mail</th><th>Rol</th></tr></thead><tbody>'+
          rows.map(function(u){ var ini=((u.full_name||u.email||"?").trim()[0]||"?").toUpperCase();
            var canEdit=(role==="super_admin");
            return '<tr><td><div style="display:flex;align-items:center;gap:10px"><span class="rev-av" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--green),var(--lime))">'+esc(ini)+'</span><b>'+esc(u.full_name||"—")+'</b></div></td>'+
              '<td class="muted">'+esc(u.email)+'</td>'+
              '<td>'+(canEdit?'<select data-role="'+u.id+'">'+ROLES.map(function(rl){return '<option value="'+rl+'"'+(u.role===rl?" selected":"")+'>'+rl+'</option>';}).join("")+'</select>':'<span class="badge-s s-approved">'+esc(u.role)+'</span>')+'</td></tr>';
          }).join("")+'</tbody></table>'
          : emptyBox("Niciun membru. Creează utilizatori în Supabase → Authentication."))+'</div>'+
        '<div class="note" style="margin-top:14px">Conturile noi se creează din Supabase (Authentication). Aici le atribui rolul.</div>';
      c.querySelectorAll("select[data-role]").forEach(function(el){ el.addEventListener("change",function(){
        sb.from("profiles").update({role:el.value}).eq("id",el.getAttribute("data-role")).then(function(rr){ if(rr.error) alert("Eroare: "+rr.error.message); });
      }); });
    });
  }

  // ====== E-MAIL / INBOX (tip Gmail) ======
  function secInbox(c){
    var sel=null;
    sb.from("support_tickets").select("*").order("created_at",{ascending:false}).limit(200).then(function(r){
      var rows=r.data||[];
      function listItem(m){ var ini=((m.name||m.email||"?").trim()[0]||"?").toUpperCase();
        return '<div class="inbox-item'+(sel===m.id?" active":"")+'" data-mid="'+m.id+'"><span class="inbox-av">'+esc(ini)+'</span>'+
          '<div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:14px;color:#fff">'+esc(m.name||m.email)+'</b><span class="muted" style="font-size:11px">'+fmt(m.created_at).split(",")[0]+'</span></div>'+
          '<div style="font-size:13px;color:var(--text)">'+esc(m.subject||"(fără subiect)")+'</div>'+
          '<div class="muted" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc((m.message||"").slice(0,80))+'</div></div>'+
          '<span class="badge-s s-'+m.status+'" style="align-self:flex-start">'+m.status+'</span></div>';
      }
      function readPane(m){
        if(!m) return '<div class="empty" style="margin:auto"><div class="e-ic">'+ic("inbox")+'</div><p>Selectează un mesaj din stânga.</p></div>';
        return '<div style="padding:22px;overflow:auto"><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'+
          '<span class="inbox-av" style="width:44px;height:44px;font-size:17px">'+(((m.name||m.email||"?").trim()[0]||"?").toUpperCase())+'</span>'+
          '<div><b style="color:#fff;font-size:16px">'+esc(m.name||m.email)+'</b><div class="muted" style="font-size:13px">'+esc(m.email)+' · '+fmt(m.created_at)+'</div></div>'+
          '<div class="spacer" style="flex:1"></div><select id="inboxStatus">'+["new","in_progress","resolved","closed"].map(function(s){return '<option value="'+s+'"'+(m.status===s?" selected":"")+'>'+s.replace("_"," ")+'</option>';}).join("")+'</select></div>'+
          '<h3 style="color:#fff;font-size:18px;margin-bottom:8px">'+esc(m.subject||"(fără subiect)")+'</h3>'+
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--line);border-radius:12px;padding:16px;color:var(--text);white-space:pre-wrap;line-height:1.6">'+esc(m.message||"")+'</div>'+
          '<div style="margin-top:18px"><label style="font-size:13px;color:var(--muted);font-weight:700">Răspuns</label>'+
          '<textarea id="reply" rows="5" placeholder="Scrie răspunsul..." style="width:100%;margin-top:6px;padding:12px;border-radius:11px;border:1px solid var(--line);background:rgba(255,255,255,0.05);color:var(--text);font-family:inherit"></textarea>'+
          '<div style="display:flex;gap:10px;margin-top:10px;align-items:center"><button class="btn btn-primary" id="replyBtn">'+ic("send")+'Trimite răspuns</button><span class="muted" id="replyMsg" style="font-size:13px"></span></div>'+
          '<div class="note" style="margin-top:12px">Trimiterea reală prin e-mail necesită un provider (ex. Resend) printr-o Edge Function. Momentan deschide aplicația ta de e-mail.</div></div></div>';
      }
      function paint(){
        c.innerHTML='<div class="note">Inbox-ul mesajelor de contact/suport, în stil e-mail. Răspunzi și schimbi statusul direct de aici.</div>'+
          '<div class="panel" style="padding:0;overflow:hidden"><div class="inbox-grid">'+
          '<div class="inbox-list">'+(rows.length?rows.map(listItem).join(""):'<div class="empty"><p>Niciun mesaj.</p></div>')+'</div>'+
          '<div class="inbox-read" id="inboxRead">'+readPane(rows.filter(function(m){return m.id===sel;})[0])+'</div>'+
          '</div></div>';
        c.querySelectorAll(".inbox-item").forEach(function(el){ el.addEventListener("click",function(){ sel=el.getAttribute("data-mid"); paint(); }); });
        var ss=document.getElementById("inboxStatus"); if(ss) ss.addEventListener("change",function(){ sb.from("support_tickets").update({status:ss.value}).eq("id",sel).then(function(){ var m=rows.filter(function(x){return x.id===sel;})[0]; if(m)m.status=ss.value; paint(); refreshBadges(); }); });
        var rb=document.getElementById("replyBtn"); if(rb) rb.addEventListener("click",function(){
          var m=rows.filter(function(x){return x.id===sel;})[0]; var txt=document.getElementById("reply").value.trim();
          if(!txt){ document.getElementById("replyMsg").textContent="Scrie un răspuns."; return; }
          window.location.href="mailto:"+encodeURIComponent(m.email)+"?subject="+encodeURIComponent("Re: "+(m.subject||"mesajul tău"))+"&body="+encodeURIComponent(txt);
          document.getElementById("replyMsg").textContent="S-a deschis aplicația de e-mail.";
        });
      }
      paint();
    });
  }
})();
