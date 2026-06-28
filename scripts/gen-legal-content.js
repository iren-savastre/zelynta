/* Generează utils/legalContent.ts din paginile HTML existente (Legal + Suport).
   Parsează doar conținutul de articol (h1..h4, p, li) din <main>, ignorând formularele. */
const fs = require("fs");
const vm = require("vm");

const PAGES = {
  privacy: "docs/legal/privacy.html",
  terms: "docs/legal/terms.html",
  cookies: "docs/legal/cookies.html",
  gdpr: "docs/legal/gdpr-rights.html",
  contact: "docs/contact.html",
  support: "docs/support.html",
  report: "docs/report-problem.html",
};

// dicționarul (11 limbi) din legal-i18n.js
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("docs/assets/legal-i18n.js", "utf8"), ctx);
const PAGESDICT = ctx.window.ZLEGAL_PAGES || {};
const CHROME = ctx.window.ZLEGAL_CHROME || {};
const LANGS = Object.keys(PAGESDICT);

// strip tags HTML -> text simplu (pentru valorile data-i18n-html)
function strip(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .trim();
}

const TAG_RE = /<(h1|h2|h3|h4|p|li|b|small|div)\b[^>]*\bdata-i18n(-html)?="([a-z0-9_]+)"/gi;
// normalizare tag -> tip de bloc redat nativ
const NORM = { b: "h3", small: "p", div: "p" };

const blocks = {};
const usedKeys = new Set();
for (const [slug, file] of Object.entries(PAGES)) {
  const html = fs.readFileSync(file, "utf8");
  const ms = html.search(/<main\b/i);
  const me = html.search(/<\/main>/i);
  const region = ms >= 0 && me > ms ? html.slice(ms, me) : html;
  const arr = [];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(region))) {
    const raw = m[1].toLowerCase();
    const tag = NORM[raw] || raw;
    const key = m[3];
    arr.push({ tag, key });
    usedKeys.add(key);
  }
  blocks[slug] = arr;
  console.log(slug, "->", arr.length, "blocuri");
}

// dicționar redus la cheile folosite, pe 11 limbi, text simplu
const dict = {};
for (const L of LANGS) {
  const src = Object.assign({}, CHROME[L] || {}, PAGESDICT[L] || {});
  const o = {};
  for (const k of usedKeys) if (src[k] != null) o[k] = strip(src[k]);
  dict[L] = o;
}

const out =
  "// AUTO-GENERAT de scripts/gen-legal-content.js — nu edita manual.\n" +
  "// Conținut Legal + Suport importat din paginile HTML, în toate limbile.\n\n" +
  "export type LegalBlock = { tag: \"h1\" | \"h2\" | \"h3\" | \"h4\" | \"p\" | \"li\"; key: string };\n\n" +
  "export const LEGAL_BLOCKS: Record<string, LegalBlock[]> = " + JSON.stringify(blocks, null, 2) + ";\n\n" +
  "export const LEGAL_DICT: Record<string, Record<string, string>> = " + JSON.stringify(dict) + ";\n";

fs.writeFileSync("utils/legalContent.ts", out);
console.log("\nscris utils/legalContent.ts | limbi:", LANGS.length, "| chei:", usedKeys.size);
