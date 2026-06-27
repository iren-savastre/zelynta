/* Zelynta — build optimizat al landing-ului (docs/ -> build/).
 * Ce face:
 *   1. Copiază docs/ în build/ (sursa rămâne editabilă).
 *   2. Convertește icon.png -> icon.webp (sharp) și înlocuiește <img src="icon.png">
 *      cu <picture> (webp + fallback png). Favicon-ele rămân png.
 *   3. Minifică HTML + CSS + JS inline (html-minifier-terser).
 * Rulează: npm run optimize   (apoi deploy-ul publică folderul build/)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { minify } = require("html-minifier-terser");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "docs");
const OUT = path.join(ROOT, "build");

function kb(n) { return (n / 1024).toFixed(1) + " KB"; }

async function run() {
  // 1) curăță + copiază docs -> build
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(SRC, OUT, { recursive: true });
  console.log("✓ copiat docs/ -> build/");

  // 2) WebP din icon.png
  const pngPath = path.join(OUT, "icon.png");
  let webpDone = false;
  if (fs.existsSync(pngPath)) {
    const before = fs.statSync(pngPath).size;
    const buf = await sharp(pngPath).webp({ quality: 82 }).toBuffer();
    fs.writeFileSync(path.join(OUT, "icon.webp"), buf);
    webpDone = true;
    console.log(`✓ icon.webp generat: ${kb(before)} (png) -> ${kb(buf.length)} (webp)`);
  }

  // 3) procesează fiecare .html: <picture> pentru logo + minificare
  const htmlFiles = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".html")) htmlFiles.push(p);
    }
  })(OUT);

  let totalBefore = 0, totalAfter = 0;
  for (const file of htmlFiles) {
    let html = fs.readFileSync(file, "utf8");
    const before = Buffer.byteLength(html, "utf8");
    totalBefore += before;

    // calea relativă către icon.webp (root pages = "icon.webp", legal/ = "../icon.webp")
    const rel = path.relative(path.dirname(file), OUT).replace(/\\/g, "/");
    const webpHref = (rel ? rel + "/" : "") + "icon.webp";

    if (webpDone) {
      // 3a) preload png -> webp
      html = html.replace(
        /<link rel="preload" as="image" href="([^"]*?)icon\.png"([^>]*)\/?>/g,
        (m, pfx, rest) => `<link rel="preload" as="image" href="${pfx}icon.webp" type="image/webp"${rest}>`
      );
      // 3b) <img ... src=".../icon.png" ...> -> <picture> cu source webp + fallback png
      html = html.replace(
        /<img\b([^>]*?)\ssrc="([^"]*?)icon\.png"([^>]*?)\/?>/g,
        (m, pre, pfx, post) =>
          `<picture><source type="image/webp" srcset="${pfx}icon.webp"><img${pre} src="${pfx}icon.png"${post}></picture>`
      );
    }

    // 3c) minificare
    try {
      html = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
        keepClosingSlash: true,
        removeRedundantAttributes: false,
        sortAttributes: false,
        sortClassName: false,
      });
    } catch (e) {
      // dacă minifyJS dă peste un script complex, reîncearcă fără minifyJS (sigur)
      html = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: false,
        keepClosingSlash: true,
      });
      console.warn(`  ⚠ ${path.basename(file)}: minifyJS sărit (script complex), restul minificat`);
    }

    const after = Buffer.byteLength(html, "utf8");
    totalAfter += after;
    fs.writeFileSync(file, html);
    console.log(`  • ${path.relative(OUT, file)}: ${kb(before)} -> ${kb(after)}`);
  }

  console.log(`\n✓ GATA. HTML total: ${kb(totalBefore)} -> ${kb(totalAfter)} (−${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%)`);
  console.log("→ Deploy: workflow-ul publică folderul build/ (sursa docs/ rămâne neatinsă).");
}

run().catch((e) => { console.error("EROARE:", e); process.exit(1); });
