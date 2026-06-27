// E2E — Zelynta Admin Dashboard (mod DEMO). Verifică login, RBAC, moderare, setări, căutare.
const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

const ADMIN = pathToFileURL(path.join(__dirname, "..", "admin", "index.html")).href + "?demo=1";

async function open(page) {
  // acceptăm automat dialogurile native (confirm/alert) — moderarea cere confirmare
  page.on("dialog", (d) => d.accept());
  // blocăm CDN-ul supabase (în DEMO nu e folosit) ca testul să fie rapid și offline
  await page.route(/supabase-js@2/, (r) => r.abort());
  await page.goto(ADMIN);
}
async function login(page, email = "demo@zelynta.com") {
  await open(page);
  await page.fill("#le", email);
  await page.fill("#lp", "demo");
  await page.click('#lf button[type="submit"]');
  await page.waitForSelector(".side");
}
async function gotoSec(page, sec) {
  await page.click('.navlink[data-sec="' + sec + '"]');
  await page.waitForTimeout(150);
}

test("login reușit + shell afișat", async ({ page }) => {
  await login(page);
  await expect(page.locator(".side .brand")).toContainText("Zelynta");
  await expect(page.locator(".env", { hasText: "DEMO" })).toBeVisible();
  await expect(page.locator("#ptitle")).toHaveText("Overview");
});

test("login eșuează cu parolă greșită", async ({ page }) => {
  await open(page);
  await page.fill("#le", "x@x.com");
  await page.fill("#lp", "gresit");
  await page.click('#lf button[type="submit"]');
  await expect(page.locator(".msg.bad")).toBeVisible();
});

test("RBAC: moderator NU vede Setări/GDPR", async ({ page }) => {
  await login(page, "mod@x.com");
  await expect(page.locator(".who")).toContainText("moderator");
  await expect(page.locator('.navlink[data-sec="reviews"]')).toBeVisible();
  await expect(page.locator('.navlink[data-sec="settings"]')).toHaveCount(0);
  await expect(page.locator('.navlink[data-sec="privacy"]')).toHaveCount(0);
});

test("RBAC: analyst vede Analytics, NU Recenzii", async ({ page }) => {
  await login(page, "analyst@x.com");
  await expect(page.locator('.navlink[data-sec="analytics"]')).toBeVisible();
  await expect(page.locator('.navlink[data-sec="reviews"]')).toHaveCount(0);
});

test("Overview afișează KPI reale", async ({ page }) => {
  await login(page);
  await expect(page.locator(".kpi")).toHaveCount(6);
  await expect(page.locator(".kpis")).toContainText("Recenzii în așteptare");
});

test("Moderare: aprobă o recenzie pending", async ({ page }) => {
  await login(page);
  await gotoSec(page, "reviews");
  await expect(page.locator(".tbl tbody tr")).toHaveCount(2); // 2 pending în seed
  await expect(page.locator(".tbl")).toContainText("Ana P.");
  await page.locator('button[data-act="approve"]').first().click();
  await page.waitForTimeout(200);
  // după aprobare, dispare din filtrul pending
  await expect(page.locator(".tbl")).not.toContainText("Ana P.");
  await expect(page.locator(".tbl tbody tr")).toHaveCount(1);
});

test("Moderare: respinge cu motiv (modal)", async ({ page }) => {
  await login(page);
  await gotoSec(page, "reviews");
  await page.locator('button[data-act="reject"]').first().click();
  await expect(page.locator("#ovl.show")).toBeVisible();
  await page.fill("#rr", "conținut neadecvat");
  await page.click("#mo");
  await page.waitForTimeout(200);
  await expect(page.locator("#ovl.show")).toHaveCount(0);
});

test("Recenzia aprobată apare la filtrul approved", async ({ page }) => {
  await login(page);
  await gotoSec(page, "reviews");
  await page.click('.chip-f[data-f="approved"]');
  await page.waitForTimeout(150);
  await expect(page.locator(".tbl")).toContainText("Ion D.");
});

test("Suport: schimbarea statusului unui ticket", async ({ page }) => {
  await login(page);
  await gotoSec(page, "support");
  await expect(page.locator(".tbl")).toContainText("elena@example.com");
  await page.locator("select[data-status]").first().selectOption("in_progress");
  await page.waitForTimeout(200);
  await expect(page.locator(".tbl")).toBeVisible();
});

test("Setări: salvare (super_admin)", async ({ page }) => {
  await login(page);
  await gotoSec(page, "settings");
  await page.fill("#set-company", "Irèn Savastre SRL");
  await page.click("#setSave");
  await expect(page.locator("#setMsg.ok")).toHaveText("Setări salvate.");
});

test("Analytics: carduri eveniment cu iconițe + donut-uri", async ({ page }) => {
  await login(page);
  await gotoSec(page, "analytics");
  // evenimentele ca metric cards cu iconiță
  await expect(page.locator(".kpi", { hasText: "landing_view" })).toBeVisible();
  await expect(page.locator(".kpi .k-ic svg").first()).toBeVisible();
  // donut SVG pentru distribuții
  await expect(page.locator(".panel", { hasText: "Dispozitiv" }).locator("svg").first()).toBeVisible();
});

test("Analytics: drapele la Limbă/Țară + iconițe colorate", async ({ page }) => {
  await login(page);
  await gotoSec(page, "analytics");
  await expect(page.locator('img[src*="flagcdn"]').first()).toBeVisible(); // drapele
  await expect(page.locator('.kpi .k-ic.k-soft .ico svg').first()).toBeVisible(); // iconițe colorate (nu negre)
  await expect(page.locator(".vbar").first()).toBeVisible(); // grafic bare
});

test("Header de pagină per modul + grupuri sidebar", async ({ page }) => {
  await login(page);
  await expect(page.locator(".page-head .ph-title")).toHaveText("Overview");
  await expect(page.locator(".nav-group", { hasText: "Moderare" })).toBeVisible();
  await expect(page.locator(".nav-group", { hasText: "Sistem" })).toBeVisible();
  await gotoSec(page, "reviews");
  await expect(page.locator(".page-head .ph-title")).toHaveText("Recenzii");
  await expect(page.locator(".page-head .ph-desc")).toBeVisible();
});

test("Sidebar: iconițe colorate distinct (--ic per secțiune)", async ({ page }) => {
  await login(page);
  await expect(page.locator('.navlink[data-sec="analytics"] .ico[style*="--ic"]')).toBeVisible();
  await expect(page.locator('.navlink[data-sec="users"] .ico[style*="--ic"]')).toBeVisible();
});

test("Utilizatori (staff): listă + schimbare rol", async ({ page }) => {
  await login(page);
  await gotoSec(page, "users");
  await expect(page.locator(".tbl")).toContainText("Maria Mod");
  await expect(page.locator("select[data-role]").first()).toBeVisible();
});

test("RBAC: moderator NU vede Utilizatori/Inbox", async ({ page }) => {
  await login(page, "mod@x.com");
  await expect(page.locator('.navlink[data-sec="users"]')).toHaveCount(0);
  // moderatorul nu are inbox (doar support/admin)
  await expect(page.locator('.navlink[data-sec="inbox"]')).toHaveCount(0);
});

test("Inbox (Gmail-style): listă + citire + reply", async ({ page }) => {
  await login(page);
  await gotoSec(page, "inbox");
  await expect(page.locator(".inbox-item")).toHaveCount(2);
  await page.locator(".inbox-item").first().click();
  await page.waitForTimeout(150);
  await expect(page.locator("#reply")).toBeVisible();
  await expect(page.locator("#replyBtn")).toBeVisible();
});

test("Audit log afișează acțiuni", async ({ page }) => {
  await login(page);
  await gotoSec(page, "audit");
  await expect(page.locator(".tbl")).toContainText("reviews");
});

test("Căutare globală", async ({ page }) => {
  await login(page);
  await page.fill("#gsearch", "palmier");
  await page.press("#gsearch", "Enter");
  await page.waitForTimeout(200);
  await expect(page.locator(".panel", { hasText: "Recenzii (" })).toBeVisible();
});

test("Landing CMS afișează conținut + salvare", async ({ page }) => {
  await login(page);
  await gotoSec(page, "landing");
  await expect(page.locator(".tbl")).toContainText("hero");
  await page.locator("[data-lcsave]").first().click();
  await page.waitForTimeout(100);
});

test("Pagini legale: listă cu slug-uri", async ({ page }) => {
  await login(page);
  await gotoSec(page, "legal");
  await expect(page.locator(".tbl")).toContainText("privacy");
  await expect(page.locator(".tbl")).toContainText("cookies");
});

test("App/Scan Data: empty state corect (fără date server)", async ({ page }) => {
  await login(page);
  await gotoSec(page, "appdata");
  await expect(page.locator(".empty")).toBeVisible();
});

test("Sesiunea rămâne salvată după refresh (per dispozitiv)", async ({ page }) => {
  await login(page, "admin@zelynta.com");
  await expect(page.locator(".side")).toBeVisible();
  await page.reload();
  await page.waitForSelector(".side");
  await expect(page.locator(".side")).toBeVisible();
  await expect(page.locator("#lf")).toHaveCount(0); // NU mai cere login
  await expect(page.locator(".who")).toContainText("admin@zelynta.com");
});

test("Teme: schimbare + persistență după refresh", async ({ page }) => {
  await login(page, "admin@zelynta.com");
  await page.click("#themeBtn");
  await expect(page.locator("#themeMenu.show")).toBeVisible();
  await page.click('.theme-row[data-theme="violet"]');
  await expect(page.locator("html")).toHaveAttribute("data-theme", "violet");
  await page.reload();
  await page.waitForSelector(".side");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "violet");
});

test("Logout", async ({ page }) => {
  await login(page);
  await page.click("#logout");
  await page.waitForSelector("#lf");
  await expect(page.locator("#lf")).toBeVisible();
});
