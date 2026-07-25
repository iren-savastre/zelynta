/* ===== Zelynta — JS partajat: i18n, header, footer, cookie consent, forms, TOC ===== */
(async function(){
  "use strict";
  var ROOT = location.pathname.indexOf("/legal/") !== -1 ? "../" : "./";
  var YEAR = new Date().getFullYear();
  var DL = "https://github.com/iren-savastre/zelynta/releases/latest";

  /* ---------- i18n ---------- */
  var DICT = window.ZLEGAL_CHROME || { ro:{}, en:{} };
  var PAGES = window.ZLEGAL_PAGES || {}; // dicționare de conținut per pagină (opțional)
  var LANGS = [["ro","ro"],["en","gb"],["fr","fr"],["it","it"],["es","es"],["de","de"],["ru","ru"],["pl","pl"],["nl","nl"],["bg","bg"],["el","gr"]];
  var LNAME = { ro:"Română", en:"English", fr:"Français", it:"Italiano", es:"Español", de:"Deutsch", ru:"Русский", pl:"Polski", nl:"Nederlands", bg:"Български", el:"Ελληνικά" };
  var RIGHTS = { ro:"toate drepturile rezervate.", en:"all rights reserved.", fr:"tous droits réservés.", it:"tutti i diritti riservati.", es:"todos los derechos reservados.", de:"alle Rechte vorbehalten.", ru:"все права защищены.", pl:"wszelkie prawa zastrzeżone.", nl:"alle rechten voorbehouden.", bg:"всички права запазени.", el:"με επιφύλαξη παντός δικαιώματος." };
  var TOOFAST = { ro:"Așteaptă câteva secunde înainte de a trimite din nou.", en:"Please wait a few seconds before sending again.", fr:"Veuillez patienter quelques secondes avant de renvoyer.", it:"Attendi qualche secondo prima di inviare di nuovo.", es:"Espera unos segundos antes de volver a enviar.", de:"Bitte warte ein paar Sekunden, bevor du erneut sendest.", ru:"Подождите несколько секунд перед повторной отправкой.", pl:"Odczekaj kilka sekund przed ponownym wysłaniem.", nl:"Wacht een paar seconden voordat je opnieuw verzendt.", bg:"Изчакайте няколко секунди, преди да изпратите отново.", el:"Περιμένετε λίγα δευτερόλεπτα πριν στείλετε ξανά." };
  // țară (ISO-3166-1 alpha-2) -> limbă disponibilă; restul -> engleză
  var CC2LANG = {
    RO:"ro", MD:"ro",
    GB:"en", US:"en", IE:"en", AU:"en", NZ:"en", ZA:"en", IN:"en", CA:"en", SG:"en", MT:"en", PH:"en", NG:"en",
    FR:"fr", BE:"fr", LU:"fr", MC:"fr",
    IT:"it", CH:"it", SM:"it", VA:"it",
    ES:"es", MX:"es", AR:"es", CO:"es", CL:"es", PE:"es", VE:"es", EC:"es", GT:"es", CU:"es", BO:"es", DO:"es", HN:"es", PY:"es", SV:"es", NI:"es", CR:"es", PA:"es", UY:"es", PR:"es",
    DE:"de", AT:"de", LI:"de",
    RU:"ru", BY:"ru", KZ:"ru", KG:"ru", AM:"ru",
    PL:"pl",
    NL:"nl", SR:"nl", AW:"nl",
    BG:"bg",
    EL:"el", GR:"el", CY:"el"
  };
  // detectează limba după IP-ul dispozitivului (geojs.io, fără cheie). Fallback: null
  function detectByIp(){
    return new Promise(function(resolve){
      var done=false, ctrl=null;
      var t=setTimeout(function(){ done=true; try{ ctrl&&ctrl.abort(); }catch(e){} resolve(null); }, 1500);
      try{ ctrl=new AbortController(); }catch(e){ ctrl=null; }
      fetch("https://get.geojs.io/v1/ip/country.json", ctrl?{signal:ctrl.signal}:{})
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){ if(done) return; clearTimeout(t); var cc=(d&&d.country||"").toUpperCase(); resolve(cc ? (CC2LANG[cc]||"en") : "en"); })
        .catch(function(){ if(done) return; clearTimeout(t); resolve(null); });
    });
  }
  async function pickLang(){
    var s=null; try{ s=localStorage.getItem("zelynta_lang"); }catch(e){}
    if(s && DICT[s]) return s;              // alegere explicită salvată -> o respectăm
    var ip=await detectByIp();              // prima vizită -> automat după IP
    if(ip && DICT[ip]){ try{ localStorage.setItem("zelynta_lang", ip); }catch(e){} return ip; }
    return "en";                            // implicit ENGLEZĂ când nu se poate determina
  }
  var LANG = await pickLang();
  document.documentElement.lang = LANG;
  function waveBrand(){ return '<span class="wave" aria-label="Zelynta">'+"Zelynta".split("").map(function(c){return "<span>"+c+"</span>";}).join("")+'</span>'; }
  function T(k){
    var d = DICT[LANG] || {}; if(d[k]!=null) return d[k];
    var pd = (PAGES[LANG]||{}); if(pd[k]!=null) return pd[k];
    var rp = (PAGES.ro||{}); if(rp[k]!=null) return rp[k];
    return (DICT.ro && DICT.ro[k]!=null) ? DICT.ro[k] : k;
  }
  function setLang(l){ try{ localStorage.setItem("zelynta_lang", l); }catch(e){} location.reload(); }

  // aplică traducerile pe orice element marcat (folosit de corpul paginilor)
  function applyI18n(scope){
    (scope||document).querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent = T(el.getAttribute("data-i18n")); });
    (scope||document).querySelectorAll("[data-i18n-html]").forEach(function(el){ el.innerHTML = T(el.getAttribute("data-i18n-html")); });
    (scope||document).querySelectorAll("[data-i18n-ph]").forEach(function(el){ el.setAttribute("placeholder", T(el.getAttribute("data-i18n-ph"))); });
    (scope||document).querySelectorAll("[data-i18n-al]").forEach(function(el){ el.setAttribute("aria-label", T(el.getAttribute("data-i18n-al"))); });
  }

  var ICONS = {
    shield:'<svg viewBox="0 0 24 24"><path class="f" d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path class="s" d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path class="s" d="M9.3 12l2 2 3.4-4.2"/></svg>',
    lock:'<svg viewBox="0 0 24 24"><rect class="f" x="5" y="11" width="14" height="9" rx="2.4"/><rect class="s" x="5" y="11" width="14" height="9" rx="2.4"/><path class="s" d="M8 11V8a4 4 0 0 1 8 0v3M12 14.5v2"/></svg>',
    cookie:'<svg viewBox="0 0 24 24"><path class="f" d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Z"/><path class="s" d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Z"/><path class="s" d="M9 10.5h.01M14 13.5h.01M10 15.5h.01"/></svg>',
    doc:'<svg viewBox="0 0 24 24"><path class="f" d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path class="s" d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path class="s" d="M13 4v4h4M9 13h6M9 16h4"/></svg>',
    scale:'<svg viewBox="0 0 24 24"><path class="f" d="M7 7 4 13h6L7 7Zm10 0-3 6h6l-3-6Z"/><path class="s" d="M12 3v18M5 21h14M7 7l-3 6a3 3 0 0 0 6 0L7 7Zm10 0-3 6a3 3 0 0 0 6 0l-3-6ZM6 7h12"/></svg>',
    sliders:'<svg viewBox="0 0 24 24"><circle class="f" cx="16" cy="8" r="3"/><circle class="f" cx="8" cy="16" r="3"/><path class="s" d="M4 8h9M19 8h1M4 16h1M11 16h9"/><circle class="s" cx="16" cy="8" r="2.6"/><circle class="s" cx="8" cy="16" r="2.6"/></svg>',
    usershield:'<svg viewBox="0 0 24 24"><circle class="f" cx="9" cy="8" r="3"/><path class="f" d="M18 12.5 14.5 14v2.5c0 2 1.7 3.2 3.5 4 1.8-.8 3.5-2 3.5-4V14L18 12.5Z"/><circle class="s" cx="9" cy="8" r="3"/><path class="s" d="M3 20c0-3.3 2.7-5 6-5"/><path class="s" d="M18 12.5 14.5 14v2.5c0 2 1.7 3.2 3.5 4 1.8-.8 3.5-2 3.5-4V14L18 12.5Z"/></svg>',
    server:'<svg viewBox="0 0 24 24"><rect class="f" x="4" y="4" width="16" height="7" rx="2"/><rect class="f" x="4" y="13" width="16" height="7" rx="2"/><rect class="s" x="4" y="4" width="16" height="7" rx="2"/><rect class="s" x="4" y="13" width="16" height="7" rx="2"/><path class="s" d="M8 7.5h.01M8 16.5h.01"/></svg>',
    ban:'<svg viewBox="0 0 24 24"><circle class="f" cx="12" cy="12" r="8"/><circle class="s" cx="12" cy="12" r="8"/><path class="s" d="M6.5 6.5l11 11"/></svg>',
    headset:'<svg viewBox="0 0 24 24"><rect class="f" x="3" y="13" width="4.5" height="6.5" rx="1.8"/><rect class="f" x="16.5" y="13" width="4.5" height="6.5" rx="1.8"/><path class="s" d="M4 13.5v-1.5a8 8 0 0 1 16 0v1.5"/><rect class="s" x="3" y="13" width="4.5" height="6.5" rx="1.8"/><rect class="s" x="16.5" y="13" width="4.5" height="6.5" rx="1.8"/><path class="s" d="M20 19.5a4 4 0 0 1-4 3h-2"/></svg>',
    mail:'<svg viewBox="0 0 24 24"><rect class="f" x="3" y="5" width="18" height="14" rx="2.4"/><rect class="s" x="3" y="5" width="18" height="14" rx="2.4"/><path class="s" d="m4 7.5 8 5.5 8-5.5"/></svg>',
    flag:'<svg viewBox="0 0 24 24"><path class="f" d="M5 5h11l-2 4 2 4H5Z"/><path class="s" d="M5 21V4M5 5h11l-2 4 2 4H5"/></svg>',
    bug:'<svg viewBox="0 0 24 24"><rect class="f" x="8" y="8" width="8" height="11" rx="4"/><rect class="s" x="8" y="8" width="8" height="11" rx="4"/><path class="s" d="M12 8V5M9 6 7 4M15 6l2-2M8 12H4M20 12h-4M8 16l-3 2M16 16l3 2M10 11.5h4"/></svg>',
    grid:'<svg viewBox="0 0 24 24"><rect class="f" x="4" y="4" width="7" height="7" rx="1.8"/><rect class="f" x="13" y="13" width="7" height="7" rx="1.8"/><rect class="s" x="4" y="4" width="7" height="7" rx="1.8"/><rect class="s" x="13" y="4" width="7" height="7" rx="1.8"/><rect class="s" x="4" y="13" width="7" height="7" rx="1.8"/><rect class="s" x="13" y="13" width="7" height="7" rx="1.8"/></svg>',
    key:'<svg viewBox="0 0 24 24"><circle class="f" cx="8" cy="14" r="4.2"/><circle class="s" cx="8" cy="14" r="4.2"/><path class="s" d="M11 11 20 4M17 7l2 2M15 9l2 2"/></svg>'
  };
  function injectIcons(scope){ (scope||document).querySelectorAll("[data-ico]").forEach(function(el){ var k=el.getAttribute("data-ico"); if(ICONS[k]) el.innerHTML=ICONS[k]; }); }

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  /* ---------- selector de limbă ---------- */
  function langSwitcher(){
    var opts = LANGS.map(function(p){
      var l=p[0], cc=p[1], act = l===LANG ? " aria-current=\"true\"" : "";
      return '<button type="button" class="lang-opt'+(l===LANG?' on':'')+'" data-lang="'+l+'"'+act+'>'+
        '<img class="flag" src="https://flagcdn.com/w40/'+cc+'.png" alt="" width="20" height="14" loading="lazy" decoding="async"/>'+
        '<span>'+LNAME[l]+'</span></button>';
    }).join("");
    var curCc = (LANGS.filter(function(p){return p[0]===LANG;})[0]||["ro","ro"])[1];
    return '<div class="lang-sw"><button type="button" class="lang-btn" id="langBtn" aria-haspopup="true" aria-expanded="false" aria-label="'+LNAME[LANG]+'">'+
      '<img class="flag" src="https://flagcdn.com/w40/'+curCc+'.png" alt="" width="20" height="14" decoding="async"/>'+
      '<span>'+LANG.toUpperCase()+'</span><svg class="cv" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>'+
      '</button><div class="lang-menu" id="langMenu" role="menu">'+opts+'</div></div>';
  }

  /* ---------- header ---------- */
  var hh = document.getElementById("site-header");
  if(hh){
    hh.outerHTML =
      '<header class="nav"><div class="wrap nav-inner">'+
      '<a class="brand" href="'+ROOT+'index.html"><img src="'+ROOT+'icon.png" alt="Zelynta" width="32" height="32" decoding="async"/>'+waveBrand()+'</a>'+
      '<nav class="nav-links" aria-label="Principal">'+
      '<a href="'+ROOT+'index.html">'+esc(T("nav_home"))+'</a>'+
      '<a href="'+ROOT+'legal/index.html">'+esc(T("nav_legal"))+'</a>'+
      '<a href="'+ROOT+'support.html">'+esc(T("nav_support"))+'</a>'+
      '<a href="'+ROOT+'contact.html">'+esc(T("nav_contact"))+'</a>'+
      langSwitcher()+
      '<a class="btn btn-dl" style="padding:9px 16px;font-size:14px" href="'+DL+'" rel="noopener">'+esc(T("nav_download"))+'</a>'+
      '</nav>'+
      '<div class="nav-compact">'+langSwitcher()+'</div>'+
      '</div></header>';
  }

  /* ---------- disclaimer „RO oficial" (doar non-RO) ---------- */
  if(LANG !== "ro"){
    var dz = document.createElement("div");
    dz.className = "lang-note";
    dz.innerHTML = '<span class="ln-ic" aria-hidden="true"></span><span>'+esc(T("disclaimer"))+'</span>';
    var hdr = document.querySelector("header.nav");
    if(hdr && hdr.parentNode){ hdr.parentNode.insertBefore(dz, hdr.nextSibling); }
  }

  /* ---------- skip to content + landmark main ---------- */
  var firstSection = document.querySelector("section");
  if(firstSection){
    firstSection.id = firstSection.id || "main";
    firstSection.setAttribute("tabindex","-1");
    var skip = document.createElement("a");
    skip.href = "#"+firstSection.id; skip.className = "skip"; skip.textContent = T("skip");
    document.body.insertBefore(skip, document.body.firstChild);
  }

  /* ---------- footer ---------- */
  function L(href,label){ return '<a href="'+ROOT+href+'">'+esc(label)+'</a>'; }
  var ff = document.getElementById("site-footer");
  if(ff){
    ff.outerHTML =
    '<footer class="ft"><div class="wrap">'+
      '<div class="ft-cta"><div><h3>'+esc(T("fcta_h"))+'</h3>'+
        '<p>'+esc(T("fcta_p"))+'</p></div>'+
        '<a class="btn btn-dl" href="'+DL+'" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>'+esc(T("fcta_btn"))+'</a></div>'+
      '<div class="ft-top">'+
        '<div class="col"><div class="ft-brand"><img src="'+ROOT+'icon.png" alt="Zelynta" width="30" height="30" loading="lazy" decoding="async"/>'+waveBrand()+'</div>'+
          '<p>'+esc(T("fdesc"))+'</p>'+
          '<div class="ft-badges">'+
            '<span class="ft-badge"><span class="ico" data-ico="shield"></span>'+esc(T("badge_gdpr"))+'</span>'+
            '<span class="ft-badge"><span class="ico" data-ico="cookie"></span>'+esc(T("badge_cookie"))+'</span>'+
            '<span class="ft-badge"><span class="ico" data-ico="lock"></span>'+esc(T("badge_device"))+'</span>'+
          '</div></div>'+
        '<div class="col"><h4>'+esc(T("col_legal"))+'</h4>'+
          L("legal/index.html",T("nav_legal"))+L("legal/privacy.html",T("l_privacy"))+
          L("legal/terms.html",T("l_terms"))+L("legal/cookies.html",T("l_cookies"))+
          '<button class="linklike" data-ck-open>'+esc(T("l_ckpref"))+'</button>'+
          L("legal/gdpr-rights.html",T("l_gdpr"))+L("legal/data-processing.html",T("l_dataproc"))+
          L("legal/acceptable-use.html",T("l_acceptable"))+'</div>'+
        '<div class="col"><h4>'+esc(T("col_support"))+'</h4>'+
          L("support.html",T("l_support"))+L("contact.html",T("l_contact"))+L("report-problem.html",T("l_report"))+'</div>'+
        '<div class="col"><h4>'+esc(T("col_privacy"))+'</h4>'+
          L("privacy-contact.html",T("l_privcontact"))+L("legal/gdpr-rights.html",T("l_gdpr"))+
          '<button class="linklike" data-ck-open>'+esc(T("l_ckpref"))+'</button>'+
          L("legal/privacy.html",T("l_privacy"))+
          '<p style="margin-top:10px;font-size:13px;color:#9fb3a6">Email: zelynta.app@yahoo.com<br>Suport: zelynta.app@yahoo.com</p>'+
        '</div>'+
      '</div>'+
      '<div class="ft-legal">'+
        '<span>© '+YEAR+' Irèn Savastre — '+esc(RIGHTS[LANG]||RIGHTS.ro)+'</span>'+
        '<span class="ft-bottom-actions">'+L("privacy-contact.html",T("l_privcontact"))+'<button class="ft-cookie-btn" data-ck-open>'+esc(T("l_ckpref"))+'</button></span>'+
      '</div>'+
    '</div></footer>';
  }

  /* ---------- comutare limbă (delegat) ---------- */
  document.addEventListener("click",function(e){
    var btn=e.target.closest(".lang-btn");
    if(btn){ var m=btn.parentNode.querySelector(".lang-menu"); var open=m.classList.toggle("show"); btn.setAttribute("aria-expanded", open?"true":"false"); return; }
    var opt=e.target.closest(".lang-opt");
    if(opt){ setLang(opt.getAttribute("data-lang")); return; }
    var anyMenu=document.querySelector(".lang-menu.show");
    if(anyMenu && !e.target.closest(".lang-sw")){ anyMenu.classList.remove("show"); var lb=document.getElementById("langBtn"); if(lb) lb.setAttribute("aria-expanded","false"); }
  });

  /* ---------- cookie consent (cheie comună: zelynta_consent) ---------- */
  var KEY="zelynta_consent";
  function getConsent(){ try{ return JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){ return null; } }
  function setConsent(c){ try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(e){} syncPanel(); }
  var bm = document.createElement("div");
  bm.innerHTML =
    '<div class="cookie" id="ckBanner" role="dialog" aria-label="'+esc(T("ck_banner_h"))+'"><h4>'+esc(T("ck_banner_h"))+'</h4>'+
    '<p>'+esc(T("ck_banner_p"))+'</p>'+
    '<div class="row"><button class="btn btn-primary" data-ck="all">'+esc(T("ck_all"))+'</button>'+
    '<button class="btn btn-ghost" data-ck="reject">'+esc(T("ck_reject"))+'</button>'+
    '<button class="btn btn-ghost" data-ck-open>'+esc(T("ck_manage"))+'</button></div></div>'+
    '<div class="ovl" id="ckOverlay" role="dialog" aria-modal="true" aria-label="'+esc(T("ck_modal_h"))+'"><div class="modal">'+
    '<h3>'+esc(T("ck_modal_h"))+'</h3><p style="color:var(--muted);font-size:14px">'+esc(T("ck_modal_p"))+'</p>'+
    catRow(T("ck_cat_nec"),T("ck_cat_nec_d"),null,true)+
    catRow(T("ck_cat_func"),T("ck_cat_func_d"),"functional",false)+
    catRow(T("ck_cat_an"),T("ck_cat_an_d"),"analytics",false)+
    catRow(T("ck_cat_mk"),T("ck_cat_mk_d"),"marketing",false)+
    '<div class="ck-actions"><button class="btn btn-primary" data-ck="save">'+esc(T("ck_save"))+'</button>'+
    '<button class="btn btn-ghost" data-ck="all">'+esc(T("ck_all"))+'</button>'+
    '<button class="btn btn-ghost" data-ck="reject">'+esc(T("ck_reject"))+'</button>'+
    '<button class="btn btn-ghost" data-ck="close">'+esc(T("ck_close"))+'</button></div></div></div>';
  document.body.appendChild(bm);
  function catRow(t,d,id,disabled){
    return '<div class="ck-cat"><div><b>'+esc(t)+'</b><br><small>'+esc(d)+'</small></div>'+
      '<label class="switch"><input type="checkbox" '+(id?'data-cat="'+id+'"':'checked')+' '+(disabled?'checked disabled':'')+'><span class="slider"></span></label></div>';
  }
  var banner=document.getElementById("ckBanner"), ovl=document.getElementById("ckOverlay");
  var catInputs={}; ovl.querySelectorAll("[data-cat]").forEach(function(i){ catInputs[i.getAttribute("data-cat")]=i; });
  function fillModal(){ var c=getConsent()||{}; for(var k in catInputs){ catInputs[k].checked=!!c[k]; } }
  var lastFocus=null;
  function openModal(){ lastFocus=document.activeElement; fillModal(); ovl.classList.add("show"); var f=ovl.querySelector("button,[href],input:not([disabled])"); if(f) f.focus(); }
  function closeModal(){ ovl.classList.remove("show"); if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  function hideBanner(){ banner.classList.remove("show"); }
  if(!getConsent()) banner.classList.add("show");
  function applyAll(v){ var c={necessary:true,functional:v,analytics:v,marketing:v}; setConsent(c); fillModal(); }
  document.addEventListener("click",function(e){
    var o=e.target.closest("[data-ck-open]"); if(o){ e.preventDefault(); openModal(); return; }
    var b=e.target.closest("[data-ck]"); if(!b) return;
    var a=b.getAttribute("data-ck");
    if(a==="all"){ applyAll(true); hideBanner(); closeModal(); }
    else if(a==="reject"){ applyAll(false); hideBanner(); closeModal(); }
    else if(a==="save"){ var c={necessary:true}; for(var k in catInputs){ c[k]=catInputs[k].checked; } setConsent(c); hideBanner(); closeModal(); }
    else if(a==="close"){ closeModal(); }
  });
  ovl.addEventListener("click",function(e){ if(e.target===ovl) closeModal(); });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape" && ovl.classList.contains("show")) closeModal();
    if(e.key==="Tab" && ovl.classList.contains("show")){
      var f=ovl.querySelectorAll("button:not([disabled]),input:not([disabled])"); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- panou cookie dedicat (pagina cookie-preferences) ---------- */
  function syncPanel(){
    var p=document.getElementById("ckPanel"); if(!p) return;
    var c=getConsent()||{}; p.querySelectorAll("[data-pcat]").forEach(function(i){ i.checked=!!c[i.getAttribute("data-pcat")]; });
  }
  var panel=document.getElementById("ckPanel");
  if(panel){
    syncPanel();
    panel.addEventListener("click",function(e){
      var b=e.target.closest("[data-pck]"); if(!b) return;
      var a=b.getAttribute("data-pck");
      if(a==="all"){ applyAll(true); }
      else if(a==="reject"){ applyAll(false); }
      else if(a==="reset"){ try{ localStorage.removeItem(KEY); }catch(x){} syncPanel(); }
      else if(a==="save"){ var c={necessary:true}; panel.querySelectorAll("[data-pcat]").forEach(function(i){ c[i.getAttribute("data-pcat")]=i.checked; }); setConsent(c); }
      var st=document.getElementById("ckPanelStatus"); if(st){ st.className="form-status ok"; st.textContent=T("ck_updated"); }
      hideBanner();
    });
  }

  /* ---------- formulare (mailto, fără trackere) ---------- */
  document.querySelectorAll("form.lz-form").forEach(function(form){
    var status=form.querySelector(".form-status");
    var btn=form.querySelector("[type=submit]");
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var ok=true;
      form.querySelectorAll("[data-required]").forEach(function(f){
        var v=(f.value||"").trim(); var bad=!v;
        if(f.type==="email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        f.closest(".field").classList.toggle("err",bad); if(bad) ok=false;
      });
      if(status){ status.className="form-status"; status.textContent=""; }
      var priv=form.querySelector("[data-privacy]");
      if(!ok) return;
      if(priv && !priv.checked){ if(status){ status.className="form-status bad"; status.textContent=T("need_privacy"); } return; }
      // mitigare anti-spam: cooldown 15s între trimiteri (client-side)
      try{
        var lastTs=parseInt(localStorage.getItem("zelynta_form_ts")||"0",10);
        if(Date.now()-lastTs < 15000){ if(status){ status.className="form-status bad"; status.textContent=TOOFAST[LANG]||TOOFAST.en; } return; }
        localStorage.setItem("zelynta_form_ts", String(Date.now()));
      }catch(e){}
      if(btn) btn.setAttribute("aria-busy","true");
      var lines=[];
      form.querySelectorAll("input,select,textarea").forEach(function(f){
        if(f.type==="checkbox"){ lines.push((f.dataset.label||f.name||"")+": "+(f.checked?"Da":"Nu")); }
        else if(f.value && f.value.trim()){ lines.push((f.dataset.label||f.name||f.id)+": "+f.value.trim()); }
      });
      var subject=encodeURIComponent("[Zelynta] "+(form.getAttribute("data-subject")||"Mesaj"));
      var body=encodeURIComponent(lines.join("\n"));
      setTimeout(function(){
        window.location.href="mailto:zelynta.app@yahoo.com?subject="+subject+"&body="+body;
        if(btn) btn.removeAttribute("aria-busy");
        if(status){ status.className="form-status ok"; status.textContent=T("form_ok"); }
        form.reset();
      },350);
    });
  });

  /* ---------- TOC active highlight ---------- */
  var toc=document.querySelector(".toc");
  if(toc && "IntersectionObserver" in window){
    var links={}; toc.querySelectorAll("a[href^='#']").forEach(function(a){ links[a.getAttribute("href").slice(1)]=a; });
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ for(var id in links) links[id].classList.remove("active"); var l=links[en.target.id]; if(l) l.classList.add("active"); } });
    },{rootMargin:"-20% 0px -70% 0px"});
    document.querySelectorAll(".anchor[id]").forEach(function(s){ io.observe(s); });
  }

  // aplică traducerile de conținut (data-i18n) + iconuri
  applyI18n(document);
  injectIcons(document);

  /* ---------- reveal la scroll (respectă reduced-motion) ---------- */
  var reduceMo = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduceMo && "IntersectionObserver" in window){
    var els = document.querySelectorAll(".lcard,.rcard,.step3,.legal-body,.tbl-scroll,.callout,.lz-form,.ck-cat,.lz-faq,.badge");
    els.forEach(function(el){ el.classList.add("reveal"); });
    var io2 = new IntersectionObserver(function(ents){ ents.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io2.unobserve(e.target); } }); }, {threshold:0.1, rootMargin:"0px 0px -6% 0px"});
    els.forEach(function(el){ io2.observe(el); });
  }
})();
