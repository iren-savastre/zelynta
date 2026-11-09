// Zelynta — Supabase Edge Function "off-contribute"
//
// Proxy-ul pe care il asteapta aplicatia (utils/offContribute.ts, prin
// EXPO_PUBLIC_CONTRIB_URL). Primeste un produs lipsa si il trimite in
// Open Food Facts sau Open Beauty Facts cu contul GLOBAL al aplicatiei.
// Parola contului sta DOAR aici, ca secret Supabase — nu ajunge niciodata in APK.
//
// The proxy the app expects (utils/offContribute.ts, via EXPO_PUBLIC_CONTRIB_URL).
// It receives a missing product and sends it to Open Food Facts or Open Beauty
// Facts with the app's GLOBAL account. The account password lives ONLY here, as a
// Supabase secret — it never ends up in the APK.
//
// Secrete / secrets (Dashboard → Edge Functions → Secrets):
//   OFF_USER      — user_id-ul contului Open Food Facts al aplicatiei (nu emailul)
//                   the app's Open Food Facts user_id (not the email)
//   OFF_PASSWORD  — parola acelui cont / that account's password
//   CONTRIB_SALT  — text lung, aleator, pentru anonimizarea id-urilor
//                   long random text used to anonymise identifiers
// SUPABASE_URL si SUPABASE_SERVICE_ROLE_KEY sunt puse automat de Supabase.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
//
// IMPORTANT: aplicatia nu trimite token Supabase, deci functia se publica cu
// verificarea JWT OPRITA (`--no-verify-jwt`, sau comutatorul din Dashboard).
// Protectia vine din validarea de mai jos si din limita de trimiteri.
// IMPORTANT: the app sends no Supabase token, so the function is deployed with
// JWT verification OFF. Protection comes from the validation and the rate limit below.

import { createClient } from "jsr:@supabase/supabase-js@2";

// Baza in care ajunge produsul: alimentele in OFF, cosmeticele/parfumurile in OBF.
// Where the product goes: food to OFF, cosmetics/perfumes to OBF.
const DBS: Record<string, string> = {
  food: "https://world.openfoodfacts.org",
  beauty: "https://world.openbeautyfacts.org",
};

// Limite anti-abuz pe 24 de ore. / Anti-abuse limits per 24 hours.
const MAX_PER_INSTALL = 20;
const MAX_PER_IP = 60;

// Lungimi maxime acceptate (ce depaseste e aproape sigur gunoi).
// Maximum accepted lengths (anything longer is almost certainly junk).
const MAX_NAME = 200;
const MAX_BRANDS = 200;
const MAX_CATEGORIES = 300;
const MAX_INGREDIENTS = 5000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, user-agent",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Hash cu sare: nu pastram nici IP-ul, nici id-ul instalarii in clar.
// Salted hash: we keep neither the IP nor the install id in plain text.
async function hash(value: string): Promise<string> {
  const salt = Deno.env.get("CONTRIB_SALT") ?? "";
  const data = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { ok: false, error: "method" });

  const offUser = Deno.env.get("OFF_USER");
  const offPassword = Deno.env.get("OFF_PASSWORD");
  // 503 → aplicatia arata „eroare la sursa", nu „refuzat".
  // 503 → the app shows "upstream error", not "rejected".
  if (!offUser || !offPassword) return reply(503, { ok: false, error: "not configured" });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(400, { ok: false, error: "bad json" });
  }

  // ---- Validare: doar campurile cunoscute trec mai departe ----
  // ---- Validation: only known fields are forwarded ----
  const code = str(body.code);
  const lang = str(body.lang).toLowerCase();
  const appUuid = str(body.app_uuid);
  const appVersion = str(body.app_version).slice(0, 20) || "1.0.0";
  const db = str(body.db) || "food"; // aplicatiile vechi nu trimit `db` / older apps don't send `db`

  if (!/^[0-9]{8}$|^[0-9]{12,14}$/.test(code)) return reply(400, { ok: false, error: "code" });
  if (!/^[a-z]{2}$/.test(lang)) return reply(400, { ok: false, error: "lang" });
  if (!/^[0-9a-f-]{32,36}$/i.test(appUuid)) return reply(400, { ok: false, error: "app_uuid" });
  if (!DBS[db]) return reply(400, { ok: false, error: "db" });

  const name = str(body[`product_name_${lang}`]);
  const brands = str(body.brands);
  const categories = str(body.categories);
  const ingredients = str(body[`ingredients_text_${lang}`]);
  if (name.length < 2 || name.length > MAX_NAME) return reply(400, { ok: false, error: "name" });
  if (brands.length > MAX_BRANDS || categories.length > MAX_CATEGORIES) {
    return reply(400, { ok: false, error: "too long" });
  }
  if (ingredients.length > MAX_INGREDIENTS) return reply(400, { ok: false, error: "too long" });

  // ---- Limita de trimiteri (per instalare si per retea, ultimele 24h) ----
  // ---- Rate limit (per install and per network, last 24h) ----
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const installHash = await hash(`install:${appUuid}`);
  const ipHash = await hash(`ip:${ip}`);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [byInstall, byIp] = await Promise.all([
    supabase.from("off_contributions").select("id", { count: "exact", head: true })
      .eq("install_hash", installHash).gte("created_at", since),
    supabase.from("off_contributions").select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", since),
  ]);
  if (byInstall.error || byIp.error) {
    console.error("off-contribute rate-limit query", byInstall.error ?? byIp.error);
    return reply(500, { ok: false, error: "db" });
  }
  if ((byInstall.count ?? 0) >= MAX_PER_INSTALL || (byIp.count ?? 0) >= MAX_PER_IP) {
    return reply(429, { ok: false, error: "too many" });
  }

  // ---- Trimiterea catre OFF / OBF ----
  // ---- Forwarding to OFF / OBF ----
  // app_uuid catre OFF: stabil per instalare, dar trecut prin hash cu sare,
  // ca moderatorii sa poata bloca doar acea instalare.
  // app_uuid to OFF: stable per install but salted-hashed, so moderators
  // can block just that install.
  const form = new URLSearchParams({
    user_id: offUser,
    password: offPassword,
    app_name: "Zelynta",
    app_version: appVersion,
    app_uuid: installHash.slice(0, 32),
    code,
    lang,
    [`product_name_${lang}`]: name,
    comment: "Added from the Zelynta app",
  });
  if (brands) form.set("brands", brands);
  if (categories) form.set("categories", categories);
  if (ingredients) form.set(`ingredients_text_${lang}`, ingredients);

  let offStatus: unknown = null;
  try {
    const res = await fetch(`${DBS[db]}/cgi/product_jqm2.pl`, {
      method: "POST",
      body: form,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Zelynta/" + appVersion + " (suport@zelynta.com)",
      },
    });
    if (!res.ok) {
      console.error("off-contribute OFF HTTP", res.status, code, db);
      return reply(502, { ok: false, error: "upstream" });
    }
    const data = await res.json().catch(() => null);
    offStatus = data?.status;
    if (data?.status !== 1) {
      // OFF a raspuns, dar n-a salvat (produs blocat, date invalide) → „refuzat".
      // OFF answered but didn't save (blocked product, invalid data) → "rejected".
      console.error("off-contribute OFF refused", code, db, data?.status_verbose);
      return reply(422, { ok: false, error: "rejected" });
    }
  } catch (e) {
    console.error("off-contribute OFF fetch", code, db, String(e));
    return reply(502, { ok: false, error: "upstream" });
  }

  const { error: logError } = await supabase.from("off_contributions").insert({
    install_hash: installHash,
    ip_hash: ipHash,
    db,
    code,
  });
  if (logError) console.error("off-contribute log insert", logError);

  return reply(200, { ok: true, status: offStatus });
});
