const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const SITE = path.join(__dirname, ".."), NM = path.join(__dirname, "node_modules");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  let f = u.startsWith("/__nm/") ? path.join(NM, u.slice(6)) : path.join(SITE, u === "/" ? "index.html" : u);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(d);
  });
});
const FONT_CSS = `@font-face{font-family:"Bricolage Grotesque";font-style:normal;font-weight:200 800;font-stretch:75% 100%;font-display:swap;src:url(http://127.0.0.1:8123/__nm/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wdth-normal.woff2) format("woff2")}
${[400, 500, 600, 700].map(w => `@font-face{font-family:"Instrument Sans";font-style:normal;font-weight:${w};font-display:swap;src:url(http://127.0.0.1:8123/__nm/@fontsource/instrument-sans/files/instrument-sans-latin-${w}-normal.woff2) format("woff2")}`).join("\n")}`;
async function open(opts) {
  await new Promise(r => server.listen(8123, "127.0.0.1", r));
  const browser = await chromium.launch(); const ctx = await browser.newContext(opts); const page = await ctx.newPage();
  await ctx.route("**/*", route => { const url = route.request().url(); const L = (p, t) => route.fulfill({ status: 200, contentType: t, body: fs.readFileSync(p) });
    if (url.includes("react@18.3.1/umd/react.production")) return L(NM + "/react/umd/react.production.min.js", "text/javascript");
    if (url.includes("react-dom@18.3.1")) return L(NM + "/react-dom/umd/react-dom.production.min.js", "text/javascript");
    if (url.includes("htm@3.1.1")) return L(NM + "/htm/dist/htm.umd.js", "text/javascript");
    if (url.includes("fonts.googleapis.com/css2")) return route.fulfill({ status: 200, contentType: "text/css", body: FONT_CSS });
    if (url.startsWith("http://127.0.0.1")) return route.continue();
    return route.abort(); });
  return { browser, ctx, page, close: async () => { await browser.close(); server.close(); } };
}
module.exports = { open };
