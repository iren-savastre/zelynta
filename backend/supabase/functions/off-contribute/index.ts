// Zelynta — Edge Function "off-contribute"
//
// Primeste de la aplicatie ingredientele citite din poza (+ poza etichetei) si
// le trimite in Open Food Facts / Open Beauty Facts cu contul GLOBAL al aplicatiei.
// Parola contului sta DOAR aici, ca secret Supabase — nu ajunge niciodata in aplicatie.
//
// Secrete necesare (Dashboard → Edge Functions → Secrets):
//   OFF_USER       — user_id-ul contului Open Food Facts al aplicatiei (nu emailul)
//   OFF_PASSWORD   — parola acelui cont
//   CONTRIB_SALT   — un text lung, aleator, folosit la anonimizarea id-urilor
// SUPABASE_URL si SUPABASE_SERVICE_ROLE_KEY sunt puse automat de Supabase.

import { createClient } from "jsr:@supabase/supabase-js@2";

const DBS: Record<string, string> = {
  food: "https://world.openfoodfacts.org",
  beauty: "https://world.openbeautyfacts.org",
};

// Limite anti-abuz pe 24 de ore.
const MAX_PER_DEVICE = 20;
const MAX_PER_IP = 60;
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const MAX_TEXT = 5000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Hash cu sare: nu pastram nici IP-ul, nici id-ul telefonului in clar.
async function hash(value: string): Promise<string> {
  const salt = Deno.env.get("CONTRIB_SALT") ?? "";
  const data = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// OFF raspunde cu {status: 1} sau {status: "status ok"} cand a salvat.
async function postToOff(url: string, form: FormData): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    body: form,
    headers: { "User-Agent": "Zelynta/1.0 (https://zelynta.com/)" },
  });
  if (!res.ok) throw new Error(`OFF HTTP ${res.status}`);
  const data = await res.json().catch(() => null);
  if (!data || (data.status !== 1 && data.status !== "status ok")) {
    throw new Error(data?.status_verbose || data?.error || "OFF did not save");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { error: "method" });

  const offUser = Deno.env.get("OFF_USER");
  const offPassword = Deno.env.get("OFF_PASSWORD");
  if (!offUser || !offPassword) return reply(503, { error: "not configured" });

  let input: FormData;
  try {
    input = await req.formData();
  } catch {
    return reply(400, { error: "bad form" });
  }

  const db = String(input.get("db") ?? "");
  const code = String(input.get("code") ?? "").trim();
  const text = String(input.get("text") ?? "").trim();
  const textLang = String(input.get("textLang") ?? "").trim();
  const imageLang = String(input.get("imageLang") ?? "").trim();
  const appVersion = String(input.get("appVersion") ?? "1.0.0").slice(0, 20);
  const deviceId = String(input.get("deviceId") ?? "").trim();
  const photo = input.get("photo");

  // Validare: doar ce are sens pentru OFF, nimic altceva nu trece mai departe.
  if (!DBS[db]) return reply(400, { error: "db" });
  if (!/^\d{8,14}$/.test(code)) return reply(400, { error: "code" });
  if (!/^[0-9a-f]{16,64}$/i.test(deviceId)) return reply(400, { error: "device" });
  if (textLang && !/^[a-z]{2}$/.test(textLang)) return reply(400, { error: "lang" });
  if (!/^[a-z]{2}$/.test(imageLang)) return reply(400, { error: "lang" });
  if (text.length > MAX_TEXT) return reply(400, { error: "text too long" });
  const hasText = Boolean(textLang && text.length >= 12);
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto && (photo as File).size > MAX_PHOTO_BYTES) return reply(413, { error: "photo too big" });
  if (!hasText && !hasPhoto) return reply(400, { error: "nothing to send" });

  // Limitarea trimiterilor (per telefon si per retea), pe ultimele 24h.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const deviceHash = await hash(`device:${deviceId}`);
  const ipHash = await hash(`ip:${ip}`);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [byDevice, byIp] = await Promise.all([
    supabase.from("off_contributions").select("id", { count: "exact", head: true })
      .eq("device_hash", deviceHash).gte("created_at", since),
    supabase.from("off_contributions").select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", since),
  ]);
  if (byDevice.error || byIp.error) return reply(500, { error: "db" });
  if ((byDevice.count ?? 0) >= MAX_PER_DEVICE || (byIp.count ?? 0) >= MAX_PER_IP) {
    return reply(429, { error: "too many" });
  }

  // app_uuid catre OFF: id stabil per telefon, dar anonim (hash cu sare),
  // ca moderatorii OFF sa poata bloca doar acel telefon daca e nevoie.
  const auth: Record<string, string> = {
    user_id: offUser,
    password: offPassword,
    app_name: "Zelynta",
    app_version: appVersion,
    app_uuid: deviceHash.slice(0, 32),
  };
  const base = DBS[db];
  let sentText = false;
  let sentPhoto = false;

  try {
    if (hasText) {
      const form = new FormData();
      for (const [k, v] of Object.entries(auth)) form.append(k, v);
      form.append("code", code);
      form.append(`ingredients_text_${textLang}`, text);
      form.append("comment", "Ingredients read from the label photo (Zelynta app)");
      await postToOff(`${base}/cgi/product_jqm2.pl`, form);
      sentText = true;
    }
    if (hasPhoto) {
      try {
        const form = new FormData();
        for (const [k, v] of Object.entries(auth)) form.append(k, v);
        form.append("code", code);
        form.append("imagefield", `ingredients_${imageLang}`);
        form.append(`imgupload_ingredients_${imageLang}`, photo as File, "ingredients.jpg");
        await postToOff(`${base}/cgi/product_image_upload.pl`, form);
        sentPhoto = true;
      } catch (e) {
        // Daca textul a intrat deja, o poza esuata nu e un esec al trimiterii.
        if (!sentText) throw e;
      }
    }
  } catch (e) {
    console.error("off-contribute", code, db, String(e));
    return reply(502, { error: "off" });
  }

  await supabase.from("off_contributions").insert({
    device_hash: deviceHash,
    ip_hash: ipHash,
    db,
    code,
    sent_text: sentText,
    sent_photo: sentPhoto,
  });

  return reply(200, { ok: true, sentText, sentPhoto });
});
