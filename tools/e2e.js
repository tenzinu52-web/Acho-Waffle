/* Real-Chromium checks for the multi-page ACHO WAFFLES site.
   The sandbox cannot reach the CDNs, so React/htm/fonts are served from local npm copies. Nothing else is stubbed. */
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");

const SITE = path.join(__dirname, ".."), NM = path.join(__dirname, "node_modules"), SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  let f = u.startsWith("/__nm/") ? path.join(NM, u.slice(6)) : path.join(SITE, u === "/" ? "index.html" : u);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(d);
  });
});

const results = []; let failed = 0;
const ok = (c, msg) => { results.push((c ? "PASS " : "FAIL ") + msg); if (!c) failed++; };

const FONT_CSS = `
@font-face{font-family:"Bricolage Grotesque";font-style:normal;font-weight:200 800;font-stretch:75% 100%;font-display:swap;src:url(http://127.0.0.1:8123/__nm/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wdth-normal.woff2) format("woff2")}
${[400, 500, 600, 700].map(w => `@font-face{font-family:"Instrument Sans";font-style:normal;font-weight:${w};font-display:swap;src:url(http://127.0.0.1:8123/__nm/@fontsource/instrument-sans/files/instrument-sans-latin-${w}-normal.woff2) format("woff2")}`).join("\n")}`;

async function newPage(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [], failedReq = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await ctx.route("**/*", route => {
    const url = route.request().url();
    const local = (p, type) => route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(p) });
    if (url.includes("cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js")) return local(NM + "/react/umd/react.production.min.js", "text/javascript");
    if (url.includes("cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js")) return local(NM + "/react-dom/umd/react-dom.production.min.js", "text/javascript");
    if (url.includes("cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js")) return local(NM + "/htm/dist/htm.umd.js", "text/javascript");
    if (url.includes("fonts.googleapis.com/css2")) return route.fulfill({ status: 200, contentType: "text/css", body: FONT_CSS });
    if (url.includes("fonts.gstatic.com")) return route.abort();
    if (url.startsWith("http://127.0.0.1")) return route.continue();
    failedReq.push(url); return route.abort();
  });
  return { ctx, page, errors, failedReq };
}

const money = n => "Nu. " + n.toLocaleString("en-US");
const PAGES = [["index", "home"], ["story", "story"], ["menu", "menu"], ["build", "build"], ["gallery", "gallery"], ["contact", "contact"], ["checkout", "checkout"]];

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(90); }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1500);
}

async function pageChecks(browser, label, opts) {
  for (const [file, id] of PAGES) {
    const { ctx, page, errors, failedReq } = await newPage(browser, opts);
    const t = label + " " + file + ": ";
    await page.goto(`http://127.0.0.1:8123/${file}.html`, { waitUntil: "load" });
    await page.waitForSelector("header", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(600);
    await scrollThrough(page);
    ok((await page.locator("h1").count()) === 1, t + "exactly one h1 (" + (await page.locator("h1").first().innerText().catch(() => "none")).replace(/\s+/g, " ").slice(0, 50) + ")");
    ok((await page.title()).includes("ACHO WAFFLES"), t + "title " + (await page.title()));
    const imgs = await page.evaluate(() => [...document.images].filter(i => i.getClientRects().length > 0).map(i => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0 && (!i.classList.contains("photo") || i.classList.contains("is-loaded")) })));
    const bad = imgs.filter(i => !i.ok);
    ok(bad.length === 0, t + imgs.length + " images, all loaded" + (bad.length ? " BAD: " + bad.map(b => b.src).join(",") : ""));
    ok(imgs.every(i => /^img\/[\w]+\.webp$/.test(i.src)), t + "every image is a real file in img/ (no data URIs, no drawings)");
    const overflow = await page.evaluate(w => document.documentElement.scrollWidth - w, opts.viewport.width);
    ok(overflow <= 0, t + "no horizontal scroll (" + overflow + "px)");
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")).filter(h => /^[\w-]+\.html/.test(h)));
    const uniq = [...new Set(hrefs.map(h => h.split("#")[0]))]; let all200 = true;
    for (const h of uniq) { const r = await page.request.get("http://127.0.0.1:8123/" + h); if (r.status() !== 200) { all200 = false; results.push("   missing page link " + h); } }
    ok(all200, t + "all " + uniq.length + " internal page links point at real pages");
    if (file !== "checkout") ok((await page.locator("header nav[aria-label=Main] a[aria-current=page]").count()) === 1 || opts.isMobile, t + "current page marked in the nav");
    ok(errors.length === 0, t + "no console or page errors" + (errors.length ? " -> " + errors.slice(0, 3).join(" | ") : ""));
    ok(failedReq.length === 0, t + "no blocked outside requests" + (failedReq.length ? " -> " + failedReq.slice(0, 3).join(",") : ""));
    const text = await page.evaluate(() => document.body.innerText);
    ok(!/\$\s?\d/.test(text), t + "no dollar prices");
    if (["index", "menu", "build"].includes(file)) ok(/Nu\. \d/.test(text), t + "prices shown in Nu.");
    await page.screenshot({ path: `${SHOTS}/${label}-${file}.png`, fullPage: true });
    await ctx.close();
  }
}

(async () => {
  await new Promise(r => server.listen(8123, "127.0.0.1", r));
  const browser = await chromium.launch();

  await pageChecks(browser, "desktop", { viewport: { width: 1440, height: 900 } });
  await pageChecks(browser, "phone", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  /* ---------- content facts on the contact page ---------- */
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/contact.html"); await page.waitForSelector("h1");
    const t = await page.evaluate(() => document.body.innerText);
    ok(t.includes("Ga Phel Shopping Center Building Secound Floor."), "contact: updated address text");
    ok((await page.locator('meta[name="description"]').getAttribute("content")).includes("Ga Phel Shopping Center Building Secound Floor."), "contact: updated address metadata");
    ok(t.includes("77771913") && t.includes("17590047"), "contact: both phone numbers shown as text");
    ok((await page.locator('a[href="tel:77771913"]').count()) >= 1 && (await page.locator('a[href="tel:17590047"]').count()) >= 1, "contact: tel links present");
    ok((await page.locator('button:has-text("Copy")').count()) >= 2, "contact: copy buttons for the phone numbers");
    const ig = await page.locator('a[href*="instagram.com"]').evaluateAll(a => a.map(x => x.href));
    ok(ig.length > 0 && ig.every(h => h === "https://www.instagram.com/acho_waffles/"), "contact: Instagram links go to acho_waffles (" + ig.length + ")");
    ok(!/instagram\.com\/acho\.waffles/i.test(await page.content()), "contact: old instagram handle (acho.waffles) absent");
    ok((await page.locator('a[href^="https://www.google.com/maps"]').count()) === 1, "contact: Google Maps link");
    ok((await page.locator('a[href^="https://wa.me/97577771913"]').count()) >= 1, "contact: WhatsApp link");
    await ctx.close();
  }

  /* ---------- cart follows you across pages ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/index.html"); await page.waitForSelector("#picks");
    const PR = await page.evaluate(() => Object.fromEntries(ACHO.PRODUCTS.map(p => [p.id, p.price])));
    await page.locator('#picks article button:has-text("Add to Cart")').first().click();   // ACHO Special 220
    ok(await page.getByRole("button", { name: /Open cart, 1 item/ }).count() === 1, "cart: home -> 1 item in the header badge");
    await page.locator('header nav[aria-label=Main] a:has-text("Menu")').click(); await page.waitForURL("**/menu.html"); await page.waitForSelector("h1");
    ok(await page.getByRole("button", { name: /Open cart, 1 item/ }).count() === 1, "cart: still 1 item after clicking through to the Menu page");
    await page.locator('article:has-text("Banana Magic") button:has-text("Add to Cart")').click();
    await page.locator('header nav[aria-label=Main] a:has-text("Contact")').click(); await page.waitForURL("**/contact.html"); await page.waitForSelector("h1");
    ok(await page.getByRole("button", { name: /Open cart, 2 items/ }).count() === 1, "cart: 2 items on the Contact page");
    await page.getByRole("button", { name: /Open cart/ }).click(); await page.waitForTimeout(300);
    ok(((await page.locator('[data-testid=total]').innerText())) === money(PR.acho + PR.banana), "cart: total = " + money(PR.acho + PR.banana) + " (ACHO Special + Banana Magic)");
    await page.getByRole("button", { name: "Add one Banana Magic" }).click();
    ok(((await page.locator('[data-testid=subtotal]').innerText())) === money(PR.acho + 2 * PR.banana), "cart: plus button -> " + money(PR.acho + 2 * PR.banana));
    await page.getByRole("button", { name: "Remove one Banana Magic" }).click();
    ok(((await page.locator('[data-testid=total]').innerText())) === money(PR.acho + PR.banana), "cart: minus button back to " + money(PR.acho + PR.banana));
    ok((await page.locator('dialog a[href="checkout.html"]:has-text("Checkout")').count()) === 1, "cart: Checkout button goes to checkout.html");
    ok((await page.locator('[data-testid=upsell]').count()) === 1, "cart: suggests a drink when the cart has none");
    ok(await page.locator('a[href="tel:77771913"]:has-text("Call 77771913")').count() === 1, "cart: call button");
    await page.screenshot({ path: SHOTS + "/desktop-cart-open.png" });
    await page.getByRole("button", { name: "Close", exact: true }).click(); await page.waitForTimeout(250);
    await page.reload(); await page.waitForSelector("h1");
    ok(await page.getByRole("button", { name: /Open cart, 2 items/ }).count() === 1, "cart: survives a reload");
    await page.getByRole("button", { name: /Open cart/ }).click(); await page.waitForTimeout(250);
    await page.getByRole("button", { name: "Remove", exact: true }).first().click();
    ok(await page.getByRole("button", { name: /Open cart, 1 item/ }).count() === 1, "cart: Remove takes a line out");
    await page.getByRole("button", { name: "Clear cart" }).click();
    ok(await page.locator("text=Your cart is empty").count() === 1, "cart: Clear cart -> empty message");
    ok(await page.locator('a[href="menu.html"]:has-text("See the menu")').count() === 1, "cart: empty state links to the Menu page");
    ok(errors.length === 0, "cart flow: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }

  /* ---------- menu tabs and the #drinks link ---------- */
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/menu.html"); await page.waitForSelector("h1");
    ok((await page.locator("#menu article").count()) === 9, "menu: 9 waffle cards by default");
    await page.getByRole("tab", { name: "Drinks" }).click(); await page.waitForTimeout(200);
    ok((await page.locator("#menu article").count()) === 4 && (await page.locator('#menu article:has-text("Chocolate Boba")').count()) === 1, "menu: Drinks tab shows 4 drinks");
    await page.goto("http://127.0.0.1:8123/menu.html#drinks"); await page.waitForSelector("h1"); await page.waitForTimeout(200);
    ok((await page.locator("#menu article").count()) === 4, "menu.html#drinks opens the Drinks tab");
    await ctx.close();
  }

  /* ---------- builder ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/build.html"); await page.waitForSelector("h1");
    const totalText = async () => { await page.waitForTimeout(700); return (await page.locator("p.font-display.text-5xl").innerText()).trim(); };
    ok((await totalText()) === "Nu. 155", "build: default Chocolate stick + Mixed chocolate = Nu. 155");
    await page.locator('input[name="b-top"][value="oreoCrumbs"]').check({ force: true });
    ok((await totalText()) === "Nu. 185", "build: + Oreo Crumbs = Nu. 185");
    await page.locator('input[name="b-extra"][value="ice"]').check({ force: true });
    ok((await totalText()) === "Nu. 235", "build: + Ice Cream = Nu. 235");
    await page.locator('input[name="b-waffle"][value="oreo"]').check({ force: true });
    ok((await totalText()) === "Nu. 245", "build: Oreo stick instead of Chocolate = Nu. 245");
    const label = await page.locator('[aria-live=polite]').first().innerText();
    ok(/photo/i.test(label), "build: preview names the real photo it is showing (" + label.replace(/\s+/g, " ").slice(0, 60) + ")");
    ok((await page.locator('img[src^="img/"]').count()) > 10, "build: option tiles are real photo files");
    ok((await page.locator("text=Photo coming soon").count()) === 3, "build: 3 options without a photo say 'Photo coming soon' (no drawing)");
    await page.locator('button:has-text("Add to cart")').first().click(); await page.waitForTimeout(300);
    ok(await page.getByRole("button", { name: /Open cart, 1 item/ }).count() === 1, "build: Add to cart puts the custom waffle in the cart");
    await page.getByRole("button", { name: /Open cart/ }).click(); await page.waitForTimeout(250);
    ok((await page.locator('[data-testid=total]').innerText()) === "Nu. 245" && (await page.locator("dialog.drawer").innerText()).includes("Your dream waffle"), "build: cart shows 'Your dream waffle' at Nu. 245");
    await page.screenshot({ path: SHOTS + "/desktop-build-cart.png" });
    ok(errors.length === 0, "build flow: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }

  /* ---------- menu: search, filters, sort, favourites, quick view ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/menu.html"); await page.waitForSelector("h1"); await page.waitForTimeout(500);
    const exp = await page.evaluate(() => {
      const w = ACHO.PRODUCTS.filter(p => p.cat !== "drinks");
      const hit = (p, n) => (p.name + " " + p.desc + " " + p.tags.join(" ")).toLowerCase().includes(n);
      return { total: w.length, oreo: w.filter(p => hit(p, "oreo")).length, choc: w.filter(p => p.tags.includes("chocolate")).length };
    });
    const status = async () => (await page.locator("[data-testid=menu-count]").innerText()).replace(/\s+/g, " ");
    ok((await status()).startsWith("Showing " + exp.total + " of " + exp.total + " waffles"), "menu: count line says " + (await status()));
    await page.getByLabel("Search the menu").fill("oreo"); await page.waitForTimeout(250);
    ok((await page.locator("#menu article").count()) === exp.oreo && exp.oreo > 0 && exp.oreo < exp.total, "menu: searching 'oreo' shows " + exp.oreo + " of " + exp.total);
    await page.getByLabel("Search the menu").fill("zzzz"); await page.waitForTimeout(250);
    ok((await page.locator("#menu article").count()) === 0 && (await page.locator("text=Nothing here yet").count()) === 1 && (await status()).startsWith("No waffles match"), "menu: no match -> friendly empty state");
    await page.locator('#menu button:has-text("Clear filters")').last().click(); await page.waitForTimeout(250);
    ok((await page.locator("#menu article").count()) === exp.total && (await page.getByLabel("Search the menu").inputValue()) === "", "menu: Clear filters brings every waffle back");
    await page.locator('[aria-label="Filter by what is on it"] button:has-text("chocolate")').click(); await page.waitForTimeout(250);
    ok((await page.locator("#menu article").count()) === exp.choc, "menu: 'chocolate' chip shows " + exp.choc + " waffles");
    ok((await page.locator('[aria-label="Filter by what is on it"] button[aria-pressed=true]').count()) === 1, "menu: the active chip is marked pressed");
    await page.locator('[aria-label="Filter by what is on it"] button:has-text("All")').click();
    await page.selectOption("select", "low"); await page.waitForTimeout(250);
    const prices = await page.locator("#menu article").evaluateAll(a => a.map(x => +((x.innerText.match(/Nu\. ([\d,]+)/) || [])[1] || "0").replace(/,/g, "")));
    ok(prices.length === exp.total && prices.every((p, i) => i === 0 || prices[i - 1] <= p), "menu: sort low to high -> " + prices.join(", "));
    await page.selectOption("select", "high"); await page.waitForTimeout(250);
    const prices2 = await page.locator("#menu article").evaluateAll(a => a.map(x => +((x.innerText.match(/Nu\. ([\d,]+)/) || [])[1] || "0").replace(/,/g, "")));
    ok(prices2.every((p, i) => i === 0 || prices2[i - 1] >= p), "menu: sort high to low");
    await page.selectOption("select", "menu");

    // favourites
    const heart = page.locator('button[aria-label="Save Banana Magic to favourites"]');
    await heart.click(); await page.waitForTimeout(200);
    ok((await page.locator('button[aria-label="Remove Banana Magic from favourites"]').getAttribute("aria-pressed")) === "true", "favourites: heart turns on");
    ok((await page.evaluate(() => localStorage.getItem("acho_favs"))) === '["banana"]', "favourites: remembered on this device");
    await page.reload(); await page.waitForSelector("h1"); await page.waitForTimeout(400);
    ok((await page.locator('button[aria-label="Remove Banana Magic from favourites"]').count()) === 1, "favourites: still saved after a reload");
    await page.locator('button:has-text("Saved (1)")').click(); await page.waitForTimeout(250);
    ok((await page.locator("#menu article").count()) === 1 && (await page.locator('#menu article:has-text("Banana Magic")').count()) === 1, "favourites: the Saved chip shows only the saved waffle");
    await page.locator('button:has-text("Saved (1)")').click();

    // quick view
    await page.locator('button[aria-label="Quick view: Rich Choco"]').click(); await page.waitForTimeout(500);
    const qv = page.locator('dialog[aria-label="Quick view: Rich Choco"]');
    ok(await qv.isVisible() && (await qv.locator("h2").innerText()).toLowerCase() === "rich choco", "quick view: opens with the waffle name");
    ok((await qv.locator("img").evaluate(i => i.complete && i.naturalWidth > 0)), "quick view: real photo loaded");
    await qv.getByRole("button", { name: "One more" }).click();
    ok((await qv.locator("[data-testid=qv-qty]").innerText()) === "2" && (await qv.getByRole("button", { name: /Add 2 to cart/ }).innerText()).toLowerCase().includes(money(2 * 180).toLowerCase()), "quick view: quantity 2 -> " + money(360));
    await page.screenshot({ path: SHOTS + "/desktop-quickview.png" });
    await qv.getByRole("button", { name: /Add 2 to cart/ }).click(); await page.waitForTimeout(400);
    ok(!(await qv.isVisible()) && (await page.getByRole("button", { name: /Open cart, 2 items/ }).count()) === 1, "quick view: Add closes it and puts 2 in the cart");
    await page.locator('button[aria-label="Quick view: Banana Magic"]').click(); await page.waitForTimeout(300);
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    ok(!(await page.locator('dialog[aria-label="Quick view: Banana Magic"]').isVisible()), "quick view: Escape closes it");
    await page.screenshot({ path: SHOTS + "/desktop-menu-filters.png", fullPage: false });
    ok(errors.length === 0, "menu flow: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }

  /* ---------- gallery viewer ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/gallery.html"); await page.waitForSelector("h1"); await page.waitForTimeout(400);
    ok((await page.locator('button[aria-label^="Open photo"]').count()) === 10, "gallery: 10 photo tiles are buttons");
    await page.locator('button[aria-label^="Open photo"]').first().click(); await page.waitForTimeout(500);
    const lb = page.locator('dialog[aria-label="Photo viewer"]');
    ok(await lb.isVisible() && (await lb.locator("[data-testid=lb-count]").innerText()) === "1 / 10", "gallery: viewer opens on photo 1 of 10");
    ok(await lb.locator("img.lb-img").evaluate(i => i.complete && i.naturalWidth > 0 && i.alt.length > 10), "gallery: big photo loaded with a description");
    await page.keyboard.press("ArrowRight"); await page.waitForTimeout(200);
    ok((await lb.locator("[data-testid=lb-count]").innerText()) === "2 / 10" && (await lb.locator("[data-testid=lb-cap]").innerText()) === "Chocolate Boba", "gallery: right arrow -> photo 2 (Chocolate Boba)");
    await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(200);
    ok((await lb.locator("[data-testid=lb-count]").innerText()) === "10 / 10", "gallery: left arrow wraps round to 10 / 10");
    await lb.getByRole("button", { name: "Next photo" }).first().click(); await page.waitForTimeout(150);
    ok((await lb.locator("[data-testid=lb-count]").innerText()) === "1 / 10", "gallery: Next button wraps back to 1 / 10");
    ok((await lb.locator('a[href="https://www.instagram.com/acho_waffles/"]').count()) === 1, "gallery: viewer links to @acho_waffles");
    await page.screenshot({ path: SHOTS + "/desktop-lightbox.png" });
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    ok(!(await lb.isVisible()) && (await page.evaluate(() => document.documentElement.style.overflow)) === "", "gallery: Escape closes the viewer and frees the page scroll");
    ok(errors.length === 0, "gallery flow: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }

  /* ---------- home: band, hero tilt, surprise me, scroll bar ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/index.html"); await page.waitForSelector("h1"); await page.waitForTimeout(900);
    ok((await page.locator(".marq-track").evaluate(e => getComputedStyle(e).animationName)) === "marq", "home: the scrolling band is animating");
    await page.getByRole("button", { name: "Pause the scrolling band" }).click();
    ok((await page.locator(".marq-track").evaluate(e => getComputedStyle(e).animationPlayState)) === "paused", "home: the band has a pause button and it pauses");
    await page.getByRole("button", { name: "Play the scrolling band" }).click();
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const box = await page.locator(".tilt").boundingBox();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2); await page.waitForTimeout(150);
    ok((await page.locator(".tilt").evaluate(e => e.style.getPropertyValue("--ry"))) !== "0deg" && (await page.locator(".tilt").evaluate(e => e.style.getPropertyValue("--ry"))) !== "", "home: hero photo tilts toward the pointer");
    await page.mouse.move(5, 5); await page.waitForTimeout(150);
    ok((await page.locator(".tilt").evaluate(e => e.style.getPropertyValue("--ry"))) === "0deg", "home: hero photo settles flat when the pointer leaves");
    await page.locator("#surprise").scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    ok((await page.locator("#surprise h3").innerText()) === "ACHO Special", "surprise: starts on the ACHO Special");
    await page.locator("#surprise").getByRole("button", { name: "A drink" }).click();
    await page.locator("#surprise").getByRole("button", { name: "Surprise me" }).click(); await page.waitForTimeout(250);
    ok(await page.locator("#surprise").getByRole("button", { name: "Picking…" }).isDisabled(), "surprise: button shows 'Picking…' while it shuffles");
    await page.waitForTimeout(1500);
    const picked = await page.locator("#surprise h3").innerText();
    const drinkNames = await page.evaluate(() => ACHO.DRINKS.map(d => d.name));
    ok(drinkNames.includes(picked), "surprise: 'A drink' picked a drink (" + picked + ")");
    ok((await page.locator("#surprise [role=status]").innerText()).startsWith("We picked " + picked), "surprise: result is announced to screen readers");
    await page.locator("#surprise").getByRole("button", { name: "Add to Cart" }).click(); await page.waitForTimeout(200);
    ok((await page.getByRole("button", { name: /Open cart, 1 item/ }).count()) === 1, "surprise: Add to Cart works on the picked item");
    await page.screenshot({ path: SHOTS + "/desktop-surprise.png" });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(300);
    const sx = await page.evaluate(() => { const b = document.querySelector("div.origin-left.bg-gold"); return new DOMMatrix(getComputedStyle(b).transform).a; });
    ok(sx > 0.95, "home: the scroll bar fills as you reach the bottom (" + sx.toFixed(2) + ")");
    ok(errors.length === 0, "home flow: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }

  /* ---------- contact: FAQ accordion ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/contact.html"); await page.waitForSelector("#faq"); await page.waitForTimeout(500);
    const btns = page.locator("#faq h3 button");
    ok((await btns.count()) === 5 && (await btns.nth(0).getAttribute("aria-expanded")) === "true", "faq: 5 questions, the first is open");
    await btns.nth(1).click(); await page.waitForTimeout(600);
    ok((await btns.nth(1).getAttribute("aria-expanded")) === "true" && (await btns.nth(0).getAttribute("aria-expanded")) === "false", "faq: opening another closes the first");
    ok((await page.locator("#faq-p1").innerText()).includes("We do not take card payments") && await page.locator("#faq-p1 p").isVisible() && !(await page.locator("#faq-p0 p").isVisible()), "faq: the open answer is visible, the closed one is hidden from view and from tabbing");
    await btns.nth(1).focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(600);
    ok((await btns.nth(1).getAttribute("aria-expanded")) === "false", "faq: Enter on the question toggles it");
    ok(errors.length === 0, "faq: no console errors");
    await ctx.close();
  }

  /* ---------- checkout: full flow ---------- */
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:8123/checkout.html"); await page.waitForSelector("h1"); await page.waitForTimeout(500);
    ok((await page.locator("main >> text=Your cart is empty").count()) === 1 && (await page.locator('main a[href="menu.html"]').count()) >= 1, "checkout: empty cart shows a friendly message and a way back to the menu");
    await page.screenshot({ path: SHOTS + "/desktop-checkout-empty.png" });
    await page.goto("http://127.0.0.1:8123/menu.html"); await page.waitForSelector("h1"); await page.waitForTimeout(400);
    const PR = await page.evaluate(() => Object.fromEntries(ACHO.PRODUCTS.map(p => [p.id, p.price])));
    await page.locator('article:has-text("ACHO Special") button:has-text("Add to Cart")').first().click();
    await page.getByRole("button", { name: /Open cart/ }).click(); await page.waitForTimeout(400);
    await page.locator("[data-testid=upsell] button").first().click(); await page.waitForTimeout(250);
    ok((await page.locator("[data-testid=upsell]").count()) === 0 && (await page.locator("[data-testid=total]").innerText()) === money(PR.acho + PR.dchoco), "cart: adding a suggested drink updates the total to " + money(PR.acho + PR.dchoco) + " and hides the suggestion");
    await page.locator('dialog a[href="checkout.html"]').click(); await page.waitForURL("**/checkout.html"); await page.waitForSelector("h1"); await page.waitForTimeout(500);
    const TOTAL = money(PR.acho + PR.dchoco);
    ok((await page.locator("[data-testid=co-total]").innerText()) === TOTAL, "checkout: summary total is " + TOTAL);
    ok((await page.locator("label.choice:has-text('Pickup')").innerText()).includes("Ga Phel Shopping Center Building Secound Floor."), "checkout: pickup option shows the current address");
    ok((await page.locator('input[autocomplete^="cc-"], input[name*="card" i]').count()) === 0, "checkout: no card number fields anywhere");
    ok((await page.locator("text=We do not take card payments").count()) >= 1, "checkout: says plainly that cards are not taken");
    await page.locator('[data-testid=co-submit]').click(); await page.waitForTimeout(300);
    ok((await page.locator("#co-name-err").count()) === 1 && (await page.locator("#co-phone-err").count()) === 1 && (await page.evaluate(() => document.activeElement.id)) === "co-name", "checkout: empty form -> name and phone errors, focus moves to the name");
    ok((await page.locator("#co-name").getAttribute("aria-invalid")) === "true" && (await page.locator("#co-name").getAttribute("aria-describedby")) === "co-name-err", "checkout: errors are tied to their fields for screen readers");
    await page.screenshot({ path: SHOTS + "/desktop-checkout-errors.png" });
    await page.locator("#co-name").fill("Test Person"); await page.locator("#co-phone").fill("abc");
    await page.locator('[data-testid=co-submit]').click(); await page.waitForTimeout(200);
    ok((await page.locator("#co-name-err").count()) === 0 && (await page.locator("#co-phone-err").count()) === 1, "checkout: a bad phone number is rejected, the fixed name error clears");
    await page.locator("#co-phone").fill("77 000 000");
    await page.locator("label.choice:has-text('Ask about delivery')").click(); await page.waitForTimeout(200);
    await page.locator('[data-testid=co-submit]').click(); await page.waitForTimeout(200);
    ok((await page.locator("#co-address-err").count()) === 1, "checkout: delivery needs an address");
    await page.locator("#co-address").fill("Test building, near the clock tower");
    ok((await page.locator("label.choice:has-text('Pay on delivery')").count()) === 1, "checkout: the cash option now reads 'Pay on delivery'");
    await page.locator("label.choice:has-text('Pay by QR or bank transfer')").click(); await page.waitForTimeout(300);
    ok((await page.locator("text=we reply on WhatsApp with our payment details").count()) === 1, "checkout: QR/transfer without configured details says we send them on WhatsApp");
    await page.locator("#co-note").fill("No sprinkles please");
    await page.screenshot({ path: SHOTS + "/desktop-checkout-form.png", fullPage: true });
    await page.locator('[data-testid=co-submit]').click(); await page.waitForTimeout(700);
    ok((await page.locator("h1").innerText()).toLowerCase().startsWith("your order is ready to send"), "checkout: valid form -> 'Your order is ready to send.'");
    ok((await page.evaluate(() => document.activeElement.tagName)) === "H1", "checkout: focus moves to the new heading");
    const ref = await page.locator("[data-testid=co-ref]").innerText();
    ok(/^ACHO-\d{4}-[A-HJ-NP-Z2-9]{4}$/.test(ref), "checkout: order reference looks right (" + ref + ")");
    const wa = page.locator("[data-testid=co-wa]"); const href = await wa.getAttribute("href"); const msg = decodeURIComponent(href.split("text=")[1] || "");
    ok(href.startsWith("https://wa.me/97577771913?text=") && (await wa.getAttribute("target")) === "_blank" && (await wa.getAttribute("rel")).includes("noopener"), "checkout: WhatsApp link goes to 97577771913 and opens a new tab");
    for (const bit of [ref, "Name: Test Person", "Phone: 77 000 000", "Delivery request: Test building, near the clock tower", "Payment: QR or bank transfer", "1 x ACHO Special - " + money(PR.acho), "1 x Chocolate Boba - " + money(PR.dchoco), "Total: " + TOTAL, "Note: No sprinkles please"])
      ok(msg.includes(bit), "checkout: WhatsApp message contains '" + bit + "'");
    ok((await page.locator("text=Nothing has been sent yet").count()) === 1 && (await page.locator("text=Your order is not confirmed until we reply").count()) >= 1, "checkout: wording does not claim anything was sent or paid");
    ok((await page.evaluate(() => localStorage.getItem("acho_customer"))) === null, "checkout: nothing about the customer saved unless they ask");
    await page.screenshot({ path: SHOTS + "/desktop-checkout-ready.png", fullPage: true });
    await page.getByRole("button", { name: "Change my details" }).click(); await page.waitForTimeout(400);
    ok((await page.locator("#co-name").inputValue()) === "Test Person" && (await page.locator("#co-address").inputValue()).startsWith("Test building"), "checkout: Change my details keeps what was typed");
    await page.locator("label.choice:has-text('Pickup')").click();
    await page.locator('[data-testid=co-submit]').click(); await page.waitForTimeout(500);
    const msg2 = decodeURIComponent((await page.locator("[data-testid=co-wa]").getAttribute("href")).split("text=")[1]);
    ok(msg2.includes("Pickup from the shop") && !msg2.includes("Delivery request") && (await page.locator("[data-testid=co-ref]").innerText()) === ref, "checkout: switching to pickup updates the message and keeps the same reference");
    await page.locator("[data-testid=co-clear]").click(); await page.waitForTimeout(500);
    ok((await page.locator("h1").innerText()).toLowerCase().startsWith("thank you, test") && (await page.locator("h1").innerText()).length < 40, "checkout: after clearing -> thank-you screen");
    ok((await page.evaluate(() => localStorage.getItem("acho_cart"))) === "[]" && (await page.getByRole("button", { name: /Open cart, 0 items/ }).count()) === 1, "checkout: the cart really is empty afterwards");
    ok(errors.length === 0, "checkout flow: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }
  {
    // remembered customer + configured payment details
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    await ctx.route("**/assets/site.js", async r => {
      let b = fs.readFileSync(SITE + "/assets/site.js", "utf8");
      b = b.replace("qrImage: null", 'qrImage: "img/logo.webp"').replace("accounts: []", 'accounts: [{ label: "Test bank", name: "ACHO WAFFLES", number: "000111222" }]');
      r.fulfill({ status: 200, contentType: "text/javascript", body: b });
    });
    await page.addInitScript(() => { localStorage.setItem("acho_cart", JSON.stringify([{ id: "banana", qty: 2 }])); localStorage.setItem("acho_customer", JSON.stringify({ name: "Saved Sam", phone: "17000000" })); });
    await page.goto("http://127.0.0.1:8123/checkout.html"); await page.waitForSelector("#co-name"); await page.waitForTimeout(400);
    ok((await page.locator("#co-name").inputValue()) === "Saved Sam" && (await page.locator("#co-phone").inputValue()) === "17000000" && await page.locator('input[type=checkbox]').isChecked(), "checkout: a customer who asked to be remembered is prefilled");
    await page.locator("label.choice:has-text('Pay by QR or bank transfer')").click(); await page.waitForTimeout(300);
    ok((await page.locator("text=000111222").count()) === 1 && (await page.locator('img[alt$="payment QR code"]').count()) === 1 && (await page.locator('button[aria-label="Copy Test bank account number"]').count()) === 1, "checkout: configured QR image and account number show up with a Copy button");
    ok((await page.locator("text=Please pay").count()) === 1, "checkout: tells the customer the amount to pay");
    await page.locator('input[type=checkbox]').uncheck(); await page.locator('[data-testid=co-submit]').click(); await page.waitForTimeout(400);
    ok((await page.evaluate(() => localStorage.getItem("acho_customer"))) === null, "checkout: un-ticking 'remember' erases the saved details");
    ok(errors.length === 0, "checkout (configured): no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }
  {
    // phone: mini cart bar and checkout layout
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://127.0.0.1:8123/menu.html"); await page.waitForSelector("h1"); await page.waitForTimeout(400);
    ok(!(await page.locator('button:has-text("View cart")').count()), "phone: no mini cart bar while the cart is empty");
    await page.locator('article:has-text("Banana Magic") button:has-text("Add to Cart")').tap(); await page.waitForTimeout(500);
    const mini = page.locator('button:has-text("View cart")');
    ok(await mini.isVisible() && (await mini.innerText()).includes(money(180)), "phone: mini cart bar appears with the total " + money(180));
    await page.screenshot({ path: SHOTS + "/phone-menu-minicart.png" });
    await mini.tap(); await page.waitForTimeout(500);
    ok(await page.locator("dialog[open] [data-testid=total]").isVisible(), "phone: tapping the bar opens the cart");
    await page.screenshot({ path: SHOTS + "/phone-cart.png" });
    await page.locator('dialog a[href="checkout.html"]').tap(); await page.waitForURL("**/checkout.html"); await page.waitForSelector("h1"); await page.waitForTimeout(600);
    ok(!(await page.locator('button:has-text("View cart")').count()), "phone: no mini cart bar on the checkout page");
    await page.screenshot({ path: SHOTS + "/phone-checkout.png", fullPage: true });
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - 390);
    ok(ov <= 0, "phone: checkout has no horizontal scroll (" + ov + "px)");
    await page.locator("#co-name").fill("Phone Pat"); await page.locator("#co-phone").fill("17000000"); await page.locator("[data-testid=co-submit]").tap(); await page.waitForTimeout(700);
    ok((await page.locator("h1").innerText()).toLowerCase().startsWith("your order is ready to send"), "phone: checkout works by touch");
    await page.screenshot({ path: SHOTS + "/phone-checkout-ready.png", fullPage: true });
    await page.goto("http://127.0.0.1:8123/gallery.html"); await page.waitForSelector("h1"); await page.waitForTimeout(500);
    await page.locator('button[aria-label^="Open photo"]').first().tap(); await page.waitForTimeout(500);
    const lbm = page.locator('dialog[aria-label="Photo viewer"]');
    await lbm.getByRole("button", { name: "Next photo" }).first().tap(); await page.waitForTimeout(200);
    ok((await lbm.locator("[data-testid=lb-count]").innerText()) === "2 / 10", "phone: viewer's Next button works by touch");
    await page.screenshot({ path: SHOTS + "/phone-lightbox.png" });
    ok(errors.length === 0, "phone flows: no console errors" + (errors.length ? " -> " + errors[0] : ""));
    await ctx.close();
  }

  /* ---------- phone navigation, dark mode, reduced motion ---------- */
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://127.0.0.1:8123/index.html"); await page.waitForSelector("header");
    ok(await page.locator("#mobile-nav").isHidden(), "phone: menu closed by default");
    await page.getByRole("button", { name: "Open menu" }).click(); await page.waitForTimeout(200);
    ok((await page.locator("#mobile-nav a").count()) === 6 && await page.locator("#mobile-nav").isVisible(), "phone: hamburger opens the 6 page links");
    await page.screenshot({ path: SHOTS + "/phone-menu-open.png" });
    await page.locator('#mobile-nav a:has-text("Gallery")').click(); await page.waitForURL("**/gallery.html");
    ok(true, "phone: tapping Gallery in the menu opens gallery.html");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    await page.goto("http://127.0.0.1:8123/index.html"); await page.waitForSelector("h1"); await scrollThrough(page);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(bg === "rgb(33, 22, 16)", "dark: page background is the dark token (" + bg + ")");
    await page.screenshot({ path: SHOTS + "/desktop-index-dark.png", fullPage: true });
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:8123/story.html"); await page.waitForSelector("h1"); await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => [...document.querySelectorAll(".rv")].filter(e => getComputedStyle(e).opacity !== "1").length);
    ok(hidden === 0, "reduced motion: nothing is left faded out (" + hidden + " hidden)");
    await page.goto("http://127.0.0.1:8123/index.html"); await page.waitForSelector("h1"); await page.waitForTimeout(600);
    ok((await page.locator(".marq-track").evaluate(e => getComputedStyle(e).animationName)) === "none" && (await page.locator(".marq-dup").evaluate(e => getComputedStyle(e).display)) === "none", "reduced motion: the scrolling band stands still");
    const faded = await page.evaluate(() => [...document.querySelectorAll("img.photo")].filter(i => i.getClientRects().length && getComputedStyle(i).opacity !== "1" && i.complete).length);
    ok(faded === 0, "reduced motion: loaded photos are fully visible without a fade (" + faded + " faded)");
    await page.goto("http://127.0.0.1:8123/checkout.html"); await page.waitForSelector("h1");
    ok((await page.evaluate(() => getComputedStyle(document.body).animationName)) === "none", "reduced motion: page fade is off");
    await ctx.close();
  }

  await browser.close(); server.close();
  console.log(results.join("\n")); console.log(`\n${results.filter(r => r.startsWith("PASS")).length} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
