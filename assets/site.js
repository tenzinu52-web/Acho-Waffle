/* ACHO WAFFLES shared shell: contact details, prices, cart, header and footer.
   Every page loads this file, so the header, footer and cart are written once.
   Edit contact details and prices in the two EDIT THESE blocks below. */
(function () {
  "use strict";
  var A = window.ACHO = window.ACHO || {};
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo, useCallback = React.useCallback;
  var html = htm.bind(React.createElement);

  /* Every photograph is a real file in the img folder. Nothing on this site is drawn. */
  var SIZES = {"hero":[961,1200],"story1":[800,1000],"story2":[900,900],"acho":[720,900],"banana":[720,900],"oreo":[720,900],"choco":[721,900],"rainbow":[720,900],"munch":[698,900],"bubble":[721,900],"sundae":[721,900],"tree":[721,900],"sprinkles":[721,900],"dchoco":[675,900],"dmatcha":[721,900],"dstrawberry":[675,900],"dmango":[583,900],"t_choc":[375,420],"t_oreo":[392,420],"t_dark":[331,226],"t_white":[419,248],"t_milk":[221,193],"t_mixed":[420,186],"t_oreocrumbs":[250,250],"t_chips":[375,275],"t_sprinkles":[323,280],"t_crushed":[292,290],"t_cookie":[292,290],"t_banana":[420,326],"t_drizzle":[354,275],"t_ice":[420,417],"t_extra":[420,326],"m0":[533,800],"m1":[800,800],"m2":[800,640],"m3":[601,800],"m4":[800,800],"m5":[800,640],"m6":[533,800],"m7":[800,800],"m8":[599,800],"m9":[800,800],"f_scoop":[260,260],"f_banana":[260,260],"f_sprinkles":[260,260],"f_oreo":[260,260]};
  var PHOTOS = {}; Object.keys(SIZES).forEach(function (k) { PHOTOS[k] = "img/" + k + ".webp"; });
  var LOGO = "img/logo.webp";   // the original ACHO WAFFLES logo, cut from the brand's own cup sticker

  /* ================================================================
     EDIT THESE: contact details and links
  ================================================================ */
  var CONFIG = {
    instagram: "https://www.instagram.com/acho_waffles/",
    instagramHandle: "@acho_waffles",
    tiktok: "https://www.tiktok.com/@acho.waffles",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=ACHO+WAFFLES",
    address: "Opposite 8eleven & OH WOW, below YOLO Cafe.",
    phones: ["77771913", "17590047"],
    whatsapp: "97577771913",   // country code 975 (Bhutan) + number. Change it if your WhatsApp is a different number.
    delivery: true,            // shows "Ask about delivery" at checkout. We never promise delivery: ACHO confirms it on WhatsApp.
    payment: {
      pickup: true,            // "Pay when you collect"
      online: true,            // "Pay by QR or bank transfer", confirmed on WhatsApp
      qrImage: null,           // add your payment QR photo to the img folder and put its path here, e.g. "img/pay-qr.webp"
      accounts: []             // e.g. [{ label: "mBoB", name: "ACHO WAFFLES", number: "123456789" }]  (each one gets a Copy button)
    },
    hours: [["Monday to Friday", "[Add opening hours]"], ["Saturday and Sunday", "[Add opening hours]"]],
    samplePrices: true         // shows a "sample prices" note in the cart and builder. Set to false once your real prices are in.
  };

  /* ================================================================
     EDIT THESE: prices, in Bhutanese Ngultrum (Nu.)
     Every number below is a SAMPLE so the totals work. Replace them with your own.
  ================================================================ */
  var PRODUCTS = [
    { id: "acho", cat: "waffles", name: "ACHO Special", price: 220, photo: "acho", desc: "Choco chips and Oreo bites on long waffle sticks, loaded with chocolate drizzle.", alt: "Two long waffle sticks covered in choco chips, Oreo bites and chocolate drizzle" },
    { id: "banana", cat: "waffles", name: "Banana Magic", price: 180, photo: "banana", desc: "Fresh banana slices over warm waffle bites, finished with white and dark chocolate drizzle.", alt: "Banana slices over waffle bites striped with white and dark chocolate" },
    { id: "oreo", cat: "waffles", name: "Oreo Bites", price: 190, photo: "oreo", desc: "A long, crisp waffle stick striped with white chocolate and covered in crushed Oreo.", alt: "A long waffle stick striped with white chocolate and crushed Oreo in a paper box" },
    { id: "choco", cat: "waffles", name: "Rich Choco", price: 180, photo: "choco", desc: "Waffle bites wrapped in ribbons of rich dark and white chocolate.", alt: "Waffle bites wrapped in dark and white chocolate in a tray" },
    { id: "rainbow", cat: "waffles", name: "Rainbow Pops", price: 150, photo: "rainbow", desc: "A waffle on a stick, drizzled with chocolate and covered in rainbow sprinkles.", alt: "A waffle pop drizzled with chocolate and covered in rainbow sprinkles" },
    { id: "munch", cat: "waffles", name: "Munch Pops", price: 170, photo: "munch", desc: "Layers of dark chocolate and crunchy crumb on a waffle stick.", alt: "A waffle on a stick layered with dark chocolate and crunchy crumb, on a paper plate" },
    { id: "bubble", cat: "waffles", name: "Bubble Wrap", price: 170, photo: "bubble", desc: "A bubble waffle packed with sprinkles, chocolate and crushed Oreo, topped with whole Oreos.", alt: "A bubble waffle topped with whole Oreos, sprinkles and chocolate drizzle" },
    { id: "sundae", cat: "waffles", name: "Sundae Bliss", price: 250, photo: "sundae", desc: "Chocolate-striped waffle bites served with two scoops of ice cream.", alt: "Chocolate-striped waffle bites in a box with two scoops of ice cream" },
    { id: "tree", cat: "waffles", name: "Choco Chips Tree Waffle", price: 200, photo: "tree", desc: "Our long tree waffle, drizzled with chocolate and scattered with choco chips.", alt: "A long tree waffle drizzled with chocolate and choco chips in a paper box" },
    { id: "dchoco", cat: "drinks", name: "Chocolate Boba", price: 120, photo: "dchoco", desc: "Creamy chocolate drink with chewy boba pearls.", alt: "An ACHO WAFFLES cup of chocolate boba" },
    { id: "dmatcha", cat: "drinks", name: "Strawberry Matcha", price: 130, photo: "dmatcha", desc: "Green matcha layered over sweet strawberry.", alt: "A layered strawberry and matcha drink in an ACHO WAFFLES cup" },
    { id: "dstrawberry", cat: "drinks", name: "Strawberry Boba", price: 120, photo: "dstrawberry", desc: "Strawberry milk drink with chewy boba pearls.", alt: "An ACHO WAFFLES cup of strawberry boba" },
    { id: "dmango", cat: "drinks", name: "Mango Smoothie", price: 110, photo: "dmango", desc: "A thick, cold mango smoothie.", alt: "An ACHO WAFFLES cup of mango smoothie" }
  ];
  var TAGS = { acho: ["chocolate", "oreo"], banana: ["fruit", "chocolate"], oreo: ["oreo", "chocolate"], choco: ["chocolate"], rainbow: ["sprinkles", "chocolate"], munch: ["chocolate"], bubble: ["oreo", "sprinkles", "chocolate"], sundae: ["ice cream", "chocolate"], tree: ["chocolate"], dchoco: ["chocolate", "boba"], dmatcha: ["matcha", "fruit"], dstrawberry: ["fruit", "boba"], dmango: ["fruit"] };
  PRODUCTS.forEach(function (p) { p.tags = TAGS[p.id] || []; });
  var BYID = {}; PRODUCTS.forEach(function (p) { BYID[p.id] = p; });
  var DRINKS = PRODUCTS.filter(function (p) { return p.cat === "drinks"; });
  var CATS = [["waffles", "Waffles"], ["drinks", "Drinks"]];

  /* The pages. Each one is its own file. */
  var NAV = [["Home", "index.html", "home"], ["Our Story", "story.html", "story"], ["Menu", "menu.html", "menu"], ["Build", "build.html", "build"], ["Gallery", "gallery.html", "gallery"], ["Contact", "contact.html", "contact"]];

  /* ================================================================
     Shared styles and helpers
  ================================================================ */
  var WRAP = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12";
  var H2 = "font-display font-extrabold uppercase leading-[.9] tracking-[-0.03em] [font-stretch:84%] text-[clamp(2.4rem,5.8vw,5.2rem)]";
  var BTN = "bx inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold uppercase tracking-[.08em] transition-colors duration-300";
  var BTN_DARK = BTN + " bg-ink text-bg [--sweep:rgb(var(--choc))]";
  var BTN_LINE = BTN + " border-2 border-ink/80 text-ink hover:text-bg";
  var BTN_GOLD = BTN + " bg-gold text-[#2E1A10] [--sweep:rgb(var(--ink))] hover:text-bg";
  var money = function (n) { return "Nu. " + Math.round(n).toLocaleString("en-US"); };
  var reduceMotion = function () { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); };

  var CartCtx = React.createContext(null);

  /* Interface icons only (cart, arrows, tick, social). No food is drawn anywhere on this page. */
  var UI = {
    cart: '<svg class="cart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"/><circle cx="9.5" cy="19.3" r="1.4"/><circle cx="17" cy="19.3" r="1.4"/></svg>',
    arrow: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M6 13l6 6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };
  function Ico(p) { return html`<span aria-hidden="true" className=${"inline-flex " + (p.className || "")} dangerouslySetInnerHTML=${{ __html: UI[p.name] }}/>`; }

  /* Section spacing. The first section on a page sits flat under the header; later ones slide up over the one before. */
  var PAD = function (first) { return first ? " pb-24 pt-12 lg:pb-32 lg:pt-16" : " py-24 lg:py-32"; };
  var stack = function (first) { return first ? " relative" : " relative z-10 -mt-12 rounded-t-[2.5rem] lg:-mt-16 lg:rounded-t-[4rem]"; };
  /* A page title is an h1; everywhere else the same big type is an h2. */
  function Hd(p) { return React.createElement(p.h1 ? "h1" : "h2", { className: H2 + " " + (p.className || "") }, p.children); }

  /* ================================================================
     Building blocks
  ================================================================ */
  function useInView(opts) {
    var ref = useRef(null), st = useState(false), on = st[0], setOn = st[1];
    useEffect(function () {
      var el = ref.current; if (!el) return;
      if (!("IntersectionObserver" in window)) { setOn(true); return; }
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setOn(true); io.disconnect(); } }, opts || { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      io.observe(el); return function () { io.disconnect(); };
    }, []);
    return [ref, on];
  }

  function Reveal(p) {
    var v = useInView(), ref = v[0], on = v[1];
    return React.createElement(p.as || "div", { ref: ref, className: "rv " + (on ? "in " : "") + (p.className || ""), style: { transitionDelay: (p.delay || 0) + "ms" } }, p.children);
  }

  // A real photograph. It reveals with a wipe and a slow zoom as it scrolls into view.
  function Photo(p) {
    var v = useInView({ threshold: 0.08, rootMargin: "0px 0px -4% 0px" }), ref = v[0], on = v[1];
    var st = useState(false), ready = st[0], setReady = st[1];
    useEffect(function () { if (p.eager) { var t = setTimeout(function () { setReady(true); }, 80); return function () { clearTimeout(t); }; } }, []);
    var shown = p.eager ? ready : on;
    var ld = useState(false), loaded = ld[0], setLoaded = ld[1], markLoaded = function () { setLoaded(true); };
    // The outer box is what scrolling is watched on. It is never clipped, because a fully clipped element counts as invisible and would never reveal.
    // The inner layer does the wipe and takes its rounded corners from the outer box.
    return html`<div ref=${ref} className=${"frame relative bg-sand " + (loaded ? "" : "shimmer ") + (p.className || "")} style=${p.style}>
      <div className=${"rvi absolute inset-0 overflow-hidden rounded-[inherit] " + (shown ? "in" : "")}>
        <div className=${"absolute inset-0 " + (p.inner || "")}>
          <img src=${PHOTOS[p.k]} alt=${p.alt} width=${SIZES[p.k] ? SIZES[p.k][0] : null} height=${SIZES[p.k] ? SIZES[p.k][1] : null} loading=${p.eager ? "eager" : "lazy"} decoding="async" onLoad=${markLoaded} onError=${markLoaded} className=${"zoom photo h-full w-full object-cover " + (loaded ? "is-loaded" : "")}/>
        </div>
      </div>
    </div>`;
  }

  // The original ACHO WAFFLES logo, extracted from the brand's own cup sticker.
  function Logo(p) {
    return html`<a href="index.html" className=${"inline-flex shrink-0 items-center " + (p.className || "")} aria-label="ACHO WAFFLES, home">
      <img src=${LOGO} alt="ACHO WAFFLES logo" width="88" height="100" className=${p.imgClass || "h-14 w-auto"}/>
    </a>`;
  }

  var ic = { fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "20", height: "20", viewBox: "0 0 24 24", "aria-hidden": "true" };
  var IconIG = function () { return html`<svg ...${ic}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>`; };
  var IconTT = function () { return html`<svg ...${ic}><path d="M14 3v11.2a3.6 3.6 0 1 1-3.6-3.6"/><path d="M14 3c.3 2.3 1.9 4 4.2 4.2"/></svg>`; };
  var IconPin = function () { return html`<svg ...${ic}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`; };
  var IconPhone = function () { return html`<svg ...${ic}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>`; };
  var IconClock = function () { return html`<svg ...${ic}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`; };
  var IconHeart = function () { return html`<svg ...${ic}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>`; };
  var IconChat = function () { return html`<svg ...${ic}><path d="M4 20l1.4-4.2A8 8 0 1 1 8.2 18.6L4 20Z"/></svg>`; };

  /* Add to Cart button with a tick that confirms the add */
  function AddButton(p) {
    var cart = React.useContext(CartCtx), st = useState(false), done = st[0], setDone = st[1];
    var click = function () { cart.add(p.id, p.custom); setDone(true); setTimeout(function () { setDone(false); }, 1400); };
    return html`<button type="button" onClick=${click} className=${BTN_GOLD + " " + (p.className || "") + " !h-11"}>
      ${done ? html`<${Ico} name="check" className="pop h-4 w-4"/>` : html`<${Ico} name="cart" className="h-[18px] w-[18px]"/>`}${done ? "Added" : "Add to Cart"}
    </button>`;
  }

  /* Copy button. A phone link may not open the dialler everywhere, so every number can also be copied. */
  function CopyBtn(p) {
    var st = useState(""), msg = st[0], setMsg = st[1];
    var click = function () {
      var done = function (m) { setMsg(m); setTimeout(function () { setMsg(""); }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p.text).then(function () { done("Copied"); }, function () { done(p.fail || "Select the number to copy"); });
      else done(p.fail || "Select the number to copy");
    };
    return html`<button type="button" onClick=${click} aria-label=${"Copy " + p.label} className="h-11 rounded-full border-2 border-ink/25 px-4 text-sm font-bold transition hover:border-ink">${msg || "Copy"}</button>`;
  }

  /* ================================================================
     Header and cart button
  ================================================================ */
  function CartButton() {
    var cart = React.useContext(CartCtx), ref = useRef(null), first = useRef(true);
    useEffect(function () {
      if (first.current) { first.current = false; return; }
      var el = ref.current; if (!el) return;
      el.classList.remove("cart-bump"); void el.offsetWidth; el.classList.add("cart-bump");
    }, [cart.bump]);
    return html`<button type="button" onClick=${function () { cart.setOpen(true); }} aria-label=${"Open cart, " + cart.count + (cart.count === 1 ? " item" : " items")} className="bx relative grid h-11 w-11 place-items-center rounded-full border-2 border-ink/80 text-ink transition-colors duration-300 hover:text-bg">
      <span ref=${ref} className="inline-flex"><${Ico} name="cart" className="h-[22px] w-[22px]"/></span>
      ${cart.count > 0 ? html`<span key=${cart.count} className="pop absolute -right-1.5 -top-1.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-gold px-1 text-[.7rem] font-bold text-[#2E1A10]">${cart.count}</span>` : null}
    </button>`;
  }

  function Header(p) {
    var o = useState(false), open = o[0], setOpen = o[1];
    var s = useState(false), scrolled = s[0], setScrolled = s[1];
    useEffect(function () {
      var on = function () { setScrolled(window.scrollY > 12); };
      var key = function (e) { if (e.key === "Escape") setOpen(false); };
      on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("keydown", key);
      return function () { window.removeEventListener("scroll", on); window.removeEventListener("keydown", key); };
    }, []);
    return html`<header className=${"hdr sticky top-[env(safe-area-inset-top,0px)] z-50 border-b transition-colors duration-300 " + (scrolled || open ? "border-ink/10" : "border-transparent")}>
      <div className=${WRAP + " flex h-[76px] items-center justify-between gap-4"}>
        <${Logo}/>
        <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label="Main">
          ${NAV.map(function (n) { var cur = p.page === n[2]; return html`<a key=${n[0]} href=${n[1]} aria-current=${cur ? "page" : null} className="group relative py-2 text-[.92rem] font-semibold">${n[0]}<span className=${"absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-ink transition-transform duration-300 group-hover:scale-x-100 " + (cur ? "scale-x-100" : "scale-x-0")}></span></a>`; })}
        </nav>
        <div className="flex items-center gap-2">
          <${CartButton}/>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink/80 lg:hidden" aria-expanded=${open} aria-controls="mobile-nav" aria-label=${open ? "Close menu" : "Open menu"} onClick=${function () { setOpen(!open); }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">${open ? html`<path d="M6 6l12 12M18 6L6 18"/>` : html`<path d="M4 8h16M4 16h16"/>`}</svg>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" hidden=${!open} className="border-t border-ink/10 lg:hidden" aria-label="Mobile">
        <ul className=${WRAP + " py-3"}>
          ${NAV.map(function (n) { var cur = p.page === n[2]; return html`<li key=${n[0]}><a href=${n[1]} aria-current=${cur ? "page" : null} className=${"block border-b border-ink/10 py-4 font-display text-2xl font-bold last:border-0 " + (cur ? "text-choc" : "")}>${n[0]}</a></li>`; })}
        </ul>
      </nav>
    </header>`;
  }

  /* ================================================================
     Footer
  ================================================================ */
  function Footer() {
    var social = [["Instagram", CONFIG.instagram, IconIG], ["TikTok", CONFIG.tiktok, IconTT]];
    return html`<footer className="on-dark relative z-10 -mt-12 rounded-t-[2.5rem] bg-cocoa text-[#FAF1E2] lg:-mt-16 lg:rounded-t-[4rem]">
      <div className=${WRAP + " pb-28 pt-24 lg:pb-16 lg:pt-28"}>
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <${Logo} imgClass="h-28 w-auto"/>
            <p className="mt-6 max-w-xs text-[#E9D3B2]">Waffles that make every moment sweeter.</p>
          </div>
          <nav className="md:col-span-3" aria-label="Footer">
            <ul className="space-y-3">${NAV.map(function (n) { return html`<li key=${n[0]}><a href=${n[1]} className="font-display text-lg font-semibold transition hover:text-gold">${n[0]}</a></li>`; })}</ul>
          </nav>
          <div className="md:col-span-4">
            <h3 className="font-display text-lg font-semibold">Follow along</h3>
            <ul className="mt-4 flex gap-3">${social.map(function (s) { var I = s[2]; return html`<li key=${s[0]}><a href=${s[1]} target="_blank" rel="noopener noreferrer" aria-label=${"ACHO WAFFLES on " + s[0]} className="grid h-11 w-11 place-items-center rounded-full border border-[#FAF1E2]/30 transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-[#2E1A10]"><${I}/></a></li>`; })}</ul>
            <p className="mt-6 text-[#E9D3B2]">${CONFIG.address}</p>
            <p className="mt-2 text-[#E9D3B2]">${CONFIG.phones.join(" / ")}</p>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-[#FAF1E2]/15 pt-6 text-sm text-[#E9D3B2] sm:flex-row">
          <p>© ${new Date().getFullYear()} ACHO WAFFLES. All rights reserved.</p>
          <button type="button" onClick=${function () { window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" }); }} className="text-left transition hover:text-gold">Back to top</button>
        </div>
      </div>
    </footer>`;
  }

  /* ================================================================
     Cart (saved in this browser, so it follows you from page to page)
  ================================================================ */
  function CartDrawer() {
    var cart = React.useContext(CartCtx), ref = useRef(null);
    useEffect(function () {
      var d = ref.current; if (!d) return;
      if (cart.open && !d.open) { d.showModal(); document.documentElement.style.overflow = "hidden"; }
      if (!cart.open && d.open) d.close();
      var onClose = function () { document.documentElement.style.overflow = ""; if (cart.open) cart.setOpen(false); };
      d.addEventListener("close", onClose); return function () { d.removeEventListener("close", onClose); };
    }, [cart.open]);
    var lines = cart.lines;
    var hasDrink = lines.some(function (l) { var p = BYID[l.id]; return p && p.cat === "drinks"; });
    return html`<dialog ref=${ref} aria-labelledby="cart-title" onClick=${function (e) { if (e.target === ref.current) cart.setOpen(false); }} className="drawer m-0 ml-auto h-[100dvh] max-h-[100dvh] w-[min(460px,100vw)] max-w-none rounded-l-[1.75rem] border-0 bg-bg p-0 text-ink backdrop:bg-black/55">
      <div className="flex h-full flex-col pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-6 py-5">
          <h2 id="cart-title" className="font-display text-3xl font-extrabold leading-none">Your cart</h2>
          <button type="button" onClick=${function () { cart.setOpen(false); }} className="h-10 rounded-full border-2 border-ink/30 px-4 text-sm font-bold transition hover:border-ink">Close</button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4">
          ${lines.length === 0 ? html`<div className="py-16 text-center"><img src=${LOGO} alt="" width="88" height="100" className="mx-auto h-20 w-auto"/><p className="mt-5 font-display text-2xl font-bold">Your cart is empty</p><p className="mt-2 text-ink2">Add a waffle or a drink from the menu, or build your own.</p><a href="menu.html" className=${BTN_GOLD + " mt-6"}>See the menu</a></div>` : html`<ul>
            ${lines.map(function (l) {
              return html`<li key=${l.id} className="flex gap-4 border-b border-ink/10 py-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sand"><img src=${PHOTOS[l.photo]} alt="" className="h-full w-full object-cover"/></span>
                <span className="min-w-0 flex-1"><span className="flex justify-between gap-3"><span className="font-semibold leading-tight">${l.name}</span><span className="shrink-0 font-semibold">${money(l.price * l.qty)}</span></span>
                  ${l.custom ? html`<span className="mt-1 block text-sm text-ink2">${l.desc}</span>` : html`<span className="mt-0.5 block text-sm text-ink2">${money(l.price)} each</span>`}
                  <span className="mt-2 flex items-center gap-1"><button type="button" aria-label=${"Remove one " + l.name} onClick=${function () { cart.change(l.id, -1); }} className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink/25 font-bold transition hover:border-ink">−</button><span className="w-8 text-center font-semibold">${l.qty}</span><button type="button" aria-label=${"Add one " + l.name} onClick=${function () { cart.change(l.id, 1); }} className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink/25 font-bold transition hover:border-ink">+</button><button type="button" onClick=${function () { cart.remove(l.id); }} className="ml-auto text-sm font-semibold text-ink2 underline underline-offset-4 transition hover:text-ink">Remove</button></span></span>
              </li>`;
            })}
          </ul>
          ${hasDrink ? null : html`<div className="mt-6" data-testid="upsell"><p className="font-display text-xl font-bold">Add a drink?</p><ul className="mt-3 grid grid-cols-2 gap-2.5">
            ${DRINKS.map(function (d) { return html`<li key=${d.id}><button type="button" onClick=${function () { cart.add(d.id); }} aria-label=${"Add " + d.name + " to your cart, " + money(d.price)} className="flex w-full items-center gap-3 rounded-2xl border-2 border-ink/15 bg-surface p-2 text-left transition hover:-translate-y-0.5 hover:border-ink"><span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand"><img src=${PHOTOS[d.photo]} alt="" loading="lazy" className="h-full w-full object-cover"/></span><span className="min-w-0"><span className="block text-sm font-bold leading-tight">${d.name}</span><span className="text-xs font-semibold text-ink2">${money(d.price)}</span></span></button></li>`; })}
          </ul></div>`}`}
        </div>
        ${lines.length ? html`<div className="border-t border-ink/10 bg-surface px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-5">
          <dl className="space-y-1"><div className="flex justify-between text-sm"><dt className="text-ink2">Subtotal</dt><dd className="font-semibold" data-testid="subtotal">${money(cart.total)}</dd></div>
          <div className="flex items-baseline justify-between"><dt className="font-semibold">Total</dt><dd className="font-display text-3xl font-extrabold" data-testid="total">${money(cart.total)}</dd></div></dl>
          ${CONFIG.samplePrices ? html`<p className="mt-1 text-xs text-ink2">Sample prices. Replace them before launch.</p>` : null}
          <p className="mt-3 text-sm text-ink2">Pay when you collect, or by QR or bank transfer. We confirm every order on WhatsApp.</p>
          <div className="mt-4 grid gap-2.5">
            <a href="checkout.html" className=${BTN_GOLD}>Checkout<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>
            <a href=${"tel:" + CONFIG.phones[0]} className=${BTN_LINE}><${IconPhone}/>Call ${CONFIG.phones[0]}</a>
            <button type="button" onClick=${cart.clear} className="h-9 text-sm font-semibold text-ink2 underline underline-offset-4 transition hover:text-ink">Clear cart</button>
          </div>
        </div>` : null}
      </div>
    </dialog>`;
  }

  function Toast(p) {
    return html`<div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[60] grid justify-items-center px-4 lg:bottom-[calc(1.1rem+env(safe-area-inset-bottom,0px))]" role="status" aria-live="polite">
      ${p.msg ? html`<div key=${p.id} className="pop flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg shadow-2xl"><span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[#2E1A10]"><${Ico} name="check" className="h-3.5 w-3.5 [&>svg]:h-full [&>svg]:w-full"/></span>${p.msg}</div>` : null}
    </div>`;
  }

  /* ================================================================
     Mount: every page calls ACHO.mount({ page, sections }) with the section names it wants.
  ================================================================ */
  /* ================================================================
     Scroll progress, phone mini-cart, product quick view
  ================================================================ */
  function ScrollBar() {
    var ref = useRef(null);
    useEffect(function () {
      var el = ref.current;
      var on = function () { var h = document.documentElement.scrollHeight - window.innerHeight; el.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")"; };
      on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
      return function () { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
    }, []);
    return html`<div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+75px)] z-[55] h-[3px]"><div ref=${ref} className="h-full origin-left bg-gold" style=${{ transform: "scaleX(0)" }}></div></div>`;
  }

  function MiniCart(p) {
    var cart = React.useContext(CartCtx);
    if (!cart.count || p.page === "build" || p.page === "checkout") return null;
    return html`<div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] pt-2 lg:hidden">
      <button key=${cart.count} type="button" onClick=${function () { cart.setOpen(true); }} className="pop pointer-events-auto mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 rounded-full bg-ink px-6 text-bg shadow-[0_18px_40px_-14px_rgba(58,34,24,.7)]">
        <span className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[.06em]"><${Ico} name="cart" className="h-5 w-5"/>View cart <span className="grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-gold px-1.5 text-xs text-[#2E1A10]">${cart.count}</span></span>
        <span className="font-display text-xl font-extrabold">${money(cart.total)}</span>
      </button>
    </div>`;
  }

  function QuickView(p) {
    var cart = React.useContext(CartCtx), ref = useRef(null), qs = useState(1), qty = qs[0], setQty = qs[1];
    var item = p.id ? BYID[p.id] : null, fav = item ? cart.favs.indexOf(item.id) > -1 : false;
    useEffect(function () {
      var d = ref.current; if (!d) return;
      if (item && !d.open) { setQty(1); d.showModal(); document.documentElement.style.overflow = "hidden"; }
      if (!item && d.open) d.close();
    }, [p.id]);
    useEffect(function () {
      var d = ref.current; if (!d) return;
      var onClose = function () { document.documentElement.style.overflow = ""; if (p.id) p.onClose(); };
      d.addEventListener("close", onClose); return function () { d.removeEventListener("close", onClose); };
    }, [p.id]);
    var close = function () { if (ref.current && ref.current.open) ref.current.close(); };
    return html`<dialog ref=${ref} aria-label=${item ? "Quick view: " + item.name : "Quick view"} onClick=${function (e) { if (e.target === ref.current) close(); }} className="modal m-auto w-[min(920px,calc(100vw-1.5rem))] max-w-none rounded-[2rem] border-0 bg-bg p-0 text-ink backdrop:bg-black/60">
      ${item ? html`<div className="grid max-h-[calc(100dvh-1.5rem)] overflow-auto md:grid-cols-2">
        <div className="frame relative bg-sand"><img src=${PHOTOS[item.photo]} alt=${item.alt} width=${SIZES[item.photo][0]} height=${SIZES[item.photo][1]} className="aspect-[4/5] h-full w-full object-cover md:aspect-auto md:min-h-[540px]"/></div>
        <div className="relative flex flex-col p-6 sm:p-9">
          <button type="button" onClick=${close} aria-label="Close quick view" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink/30 transition hover:border-ink"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <p className="text-sm font-semibold uppercase tracking-[.1em] text-choc">${item.cat === "drinks" ? "Drink" : "Waffle"}</p>
          <h2 className="mt-2 pr-12 font-display text-4xl font-extrabold uppercase leading-[.95] tracking-[-0.02em] [font-stretch:84%]">${item.name}</h2>
          <p className="mt-4 font-display text-3xl font-extrabold">${money(item.price)}</p>
          <ul className="mt-4 flex flex-wrap gap-2">${item.tags.map(function (t) { return html`<li key=${t} className="rounded-full border-2 border-ink/20 px-3 py-1 text-sm font-semibold capitalize text-ink2">${t}</li>`; })}</ul>
          <p className="mt-5 text-lg leading-relaxed text-ink2">${item.desc}</p>
          <div className="mt-auto pt-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1" role="group" aria-label="Quantity"><button type="button" aria-label="One fewer" onClick=${function () { setQty(Math.max(1, qty - 1)); }} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink/25 text-lg font-bold transition hover:border-ink">−</button><span className="w-10 text-center text-lg font-bold" data-testid="qv-qty">${qty}</span><button type="button" aria-label="One more" onClick=${function () { setQty(Math.min(20, qty + 1)); }} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink/25 text-lg font-bold transition hover:border-ink">+</button></div>
              <button type="button" aria-pressed=${fav} onClick=${function () { cart.toggleFav(item.id); }} className=${"fav grid h-11 w-11 place-items-center rounded-full border-2 border-ink/25 transition hover:border-ink " + (fav ? "is-on" : "")} aria-label=${fav ? "Remove from favourites" : "Save to favourites"}><${IconHeart}/></button>
            </div>
            <button type="button" onClick=${function () { cart.add(item.id, null, qty); close(); }} className=${BTN_GOLD + " mt-4 w-full"}><${Ico} name="cart" className="h-[18px] w-[18px]"/>Add ${qty > 1 ? qty + " " : ""}to cart · ${money(item.price * qty)}</button>
          </div>
        </div>
      </div>` : null}
    </dialog>`;
  }

  var CART_KEY = "acho_cart";
  var FAV_KEY = "acho_favs";
  function readFavs() {
    try { var v = JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); return Array.isArray(v) ? v.filter(function (id) { return BYID[id]; }) : []; } catch (e) { return []; }
  }
  function readCart() {
    try {
      var v = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(v) ? v.filter(function (l) { return l && typeof l.id === "string" && l.qty > 0; }) : [];
    } catch (e) { return []; }
  }

  function mount(cfg) {
    function Page() {
      var c = useState(readCart), raw = c[0], setRaw = c[1];
      var o = useState(false), open = o[0], setOpen = o[1];
      var b = useState(0), bump = b[0], setBump = b[1];
      var t = useState({ msg: "", id: 0 }), toast = t[0], setToast = t[1];
      useEffect(function () { try { localStorage.setItem(CART_KEY, JSON.stringify(raw)); } catch (e) {} }, [raw]);
      useEffect(function () {
        // keep the cart right when it changes in another tab, or when this page is restored by the Back button
        var onStorage = function (e) { if (e.key === CART_KEY) setRaw(readCart()); };
        var onShow = function (e) { if (e.persisted) setRaw(readCart()); };
        window.addEventListener("storage", onStorage); window.addEventListener("pageshow", onShow);
        return function () { window.removeEventListener("storage", onStorage); window.removeEventListener("pageshow", onShow); };
      }, []);
      useEffect(function () { if (!toast.msg) return; var id = setTimeout(function () { setToast({ msg: "", id: toast.id }); }, 2400); return function () { clearTimeout(id); }; }, [toast.id]);

      var add = useCallback(function (id, custom, n) {
        var label = custom ? custom.name : (BYID[id] ? BYID[id].name : "Item");
        setRaw(function (cur) {
          var hit = cur.filter(function (l) { return l.id === id; })[0];
          if (hit) return cur.map(function (l) { return l.id === id ? Object.assign({}, l, { qty: l.qty + (n || 1) }) : l; });
          return cur.concat(custom ? [{ id: id, qty: n || 1, custom: custom }] : [{ id: id, qty: n || 1 }]);
        });
        setBump(function (n) { return n + 1; });
        setToast(function (s) { return { msg: label + " added to your cart", id: s.id + 1 }; });
      }, []);
      var change = useCallback(function (id, d) { setRaw(function (cur) { return cur.map(function (l) { return l.id === id ? Object.assign({}, l, { qty: l.qty + d }) : l; }).filter(function (l) { return l.qty > 0; }); }); }, []);
      var remove = useCallback(function (id) { setRaw(function (cur) { return cur.filter(function (l) { return l.id !== id; }); }); }, []);
      var clear = useCallback(function () { setRaw([]); }, []);

      var fv = useState(readFavs), favs = fv[0], setFavs = fv[1];
      var qk = useState(null), quick = qk[0], setQuick = qk[1];
      useEffect(function () { try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {} }, [favs]);
      var toggleFav = useCallback(function (id) { setFavs(function (cur) { return cur.indexOf(id) > -1 ? cur.filter(function (x) { return x !== id; }) : cur.concat(id); }); }, []);

      var lines = raw.map(function (l) {
        if (l.custom) return { id: l.id, qty: l.qty, custom: true, name: l.custom.name, desc: l.custom.desc, price: l.custom.price, photo: PHOTOS[l.custom.photo] ? l.custom.photo : "acho" };
        var p = BYID[l.id]; return p ? { id: l.id, qty: l.qty, name: p.name, price: p.price, photo: p.photo } : null;
      }).filter(Boolean);
      var count = lines.reduce(function (n, l) { return n + l.qty; }, 0);
      var total = lines.reduce(function (n, l) { return n + l.qty * l.price; }, 0);
      var ctx = { lines: lines, count: count, total: total, add: add, change: change, remove: remove, clear: clear, open: open, setOpen: setOpen, bump: bump, favs: favs, toggleFav: toggleFav, openQuick: setQuick };

      var S = A.sections || {};
      return html`<${CartCtx.Provider} value=${ctx}>
        <${Header} page=${cfg.page}/>
        <main id="main" className="overflow-x-clip">
          ${cfg.sections.map(function (s, i) {
            var name = typeof s === "string" ? s : s.name, C = S[name];
            if (!C) { console.error("ACHO: unknown section " + name); return null; }
            var props = Object.assign({ key: name }, typeof s === "string" ? {} : s.props, i === 0 ? { first: true, h1: cfg.page !== "home" } : {});
            return React.createElement(C, props);
          })}
        </main>
        <${Footer}/>
        <${ScrollBar}/>
        <${MiniCart} page=${cfg.page}/>
        <${CartDrawer}/>
        <${QuickView} id=${quick} onClose=${function () { setQuick(null); }}/>
        <${Toast} msg=${toast.msg} id=${toast.id}/>
      <//>`;
    }
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Page));
  }

  /* Share with sections.js and builder.js */
  var EXPORT = { html: html, CONFIG: CONFIG, PRODUCTS: PRODUCTS, BYID: BYID, DRINKS: DRINKS, CATS: CATS, NAV: NAV, PHOTOS: PHOTOS, SIZES: SIZES, LOGO: LOGO,
    WRAP: WRAP, H2: H2, BTN: BTN, BTN_DARK: BTN_DARK, BTN_LINE: BTN_LINE, BTN_GOLD: BTN_GOLD, money: money, reduceMotion: reduceMotion, CartCtx: CartCtx,
    Ico: Ico, Hd: Hd, PAD: PAD, stack: stack, useInView: useInView, Reveal: Reveal, Photo: Photo, Logo: Logo, AddButton: AddButton, CopyBtn: CopyBtn,
    IconIG: IconIG, IconTT: IconTT, IconPin: IconPin, IconPhone: IconPhone, IconClock: IconClock, IconHeart: IconHeart, IconChat: IconChat, mount: mount };
  Object.keys(EXPORT).forEach(function (k) { A[k] = EXPORT[k]; });
  A.sections = A.sections || {};
})();
