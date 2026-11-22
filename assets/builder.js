/* ACHO WAFFLES builder. Loaded only by build.html. Every picture is a real ACHO photograph; nothing is drawn. */
(function () {
  "use strict";
  var A = window.ACHO;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo, useCallback = React.useCallback;
  var html = A.html,
    CONFIG = A.CONFIG,
    PRODUCTS = A.PRODUCTS,
    BYID = A.BYID,
    DRINKS = A.DRINKS,
    CATS = A.CATS,
    PHOTOS = A.PHOTOS,
    SIZES = A.SIZES,
    LOGO = A.LOGO,
    WRAP = A.WRAP,
    H2 = A.H2,
    BTN = A.BTN,
    BTN_DARK = A.BTN_DARK,
    BTN_LINE = A.BTN_LINE,
    BTN_GOLD = A.BTN_GOLD,
    money = A.money,
    reduceMotion = A.reduceMotion,
    CartCtx = A.CartCtx,
    Ico = A.Ico,
    Hd = A.Hd,
    PAD = A.PAD,
    stack = A.stack,
    useInView = A.useInView,
    Reveal = A.Reveal,
    Photo = A.Photo,
    AddButton = A.AddButton,
    CopyBtn = A.CopyBtn,
    IconIG = A.IconIG,
    IconPin = A.IconPin,
    IconPhone = A.IconPhone,
    IconClock = A.IconClock,
    IconHeart = A.IconHeart,
    IconChat = A.IconChat;

  /* Waffle builder prices (Nu.), sample numbers */
  var BUILDER = {
    waffle: [
      { id: "classic", name: "Classic Golden Waffle Stick", tile: null, price: 120 },
      { id: "choc", name: "Chocolate Waffle Stick", tile: "t_choc", price: 140 },
      { id: "oreo", name: "Oreo Waffle Stick", tile: "t_oreo", price: 150 }
    ],
    choc: [
      { id: "milk", name: "Milk Chocolate", tile: "t_milk", price: 0 },
      { id: "dark", name: "Dark Chocolate", tile: "t_dark", price: 10 },
      { id: "white", name: "White Chocolate", tile: "t_white", price: 10 },
      { id: "mixed", name: "Mixed Chocolate", tile: "t_mixed", price: 15 }
    ],
    tops: [
      { id: "oreoCrumbs", name: "Oreo Crumbs", tile: "t_oreocrumbs", price: 30 },
      { id: "chips", name: "Chocolate Chips", tile: "t_chips", price: 25 },
      { id: "sprinkles", name: "Rainbow Sprinkles", tile: "t_sprinkles", price: 20 },
      { id: "crushed", name: "Crushed Cookies", tile: "t_crushed", price: 30 },
      { id: "strawberry", name: "Strawberry Pieces", tile: null, price: 40 },
      { id: "banana", name: "Banana Pieces", tile: "t_banana", price: 30 },
      { id: "cookie", name: "Cookie Crumbs", tile: "t_cookie", price: 25 }
    ],
    extras: [
      { id: "drizzle", name: "Extra Chocolate Drizzle", tile: "t_drizzle", price: 25 },
      { id: "cream", name: "Whipped Cream", tile: null, price: 20 },
      { id: "ice", name: "Ice Cream", tile: "t_ice", price: 50 },
      { id: "extra", name: "Extra Toppings", tile: "t_extra", price: 30 }
    ]
  };

  /* Real ACHO photographs the builder can show, and what each one actually contains.
     Nothing is tagged unless it can be seen in the photograph. */
  var REF = [
    { photo: "tree", name: "Choco Chips Tree Waffle", stick: true, base: ["choc"], choc: ["milk", "dark", "white"], tops: ["chips"], extras: ["drizzle"] },
    { photo: "acho", name: "ACHO Special (choco chips and Oreo bites)", stick: true, base: ["choc", "oreo"], choc: ["milk", "dark", "white"], tops: ["chips", "oreoCrumbs"], extras: ["drizzle"] },
    { photo: "oreo", name: "Oreo Bites", stick: true, base: ["oreo"], choc: ["white", "dark"], tops: ["oreoCrumbs"], extras: [] },
    { photo: "munch", name: "Munch Pops", stick: true, base: ["choc"], choc: ["dark", "milk"], tops: ["crushed", "cookie"], extras: ["drizzle"] },
    { photo: "rainbow", name: "Rainbow Pops", stick: true, base: ["classic"], choc: ["white", "dark"], tops: ["sprinkles"], extras: [] },
    { photo: "sprinkles", name: "Rainbow Sprinkle Stick", stick: true, base: ["classic"], choc: ["white", "dark"], tops: ["sprinkles"], extras: [] },
    { photo: "banana", name: "Banana Magic (waffle bites)", stick: false, base: ["classic"], choc: ["milk", "dark", "white"], tops: ["banana"], extras: [] },
    { photo: "sundae", name: "Sundae Bliss (waffle bites)", stick: false, base: ["classic"], choc: ["milk", "dark", "white"], tops: [], extras: ["ice"] },
    { photo: "choco", name: "Rich Choco (waffle bites)", stick: false, base: ["classic", "choc"], choc: ["dark", "white"], tops: [], extras: [] },
    { photo: "bubble", name: "Bubble Wrap (bubble waffle)", stick: false, base: ["classic", "oreo"], choc: ["white", "dark"], tops: ["sprinkles", "oreoCrumbs", "extra"], extras: ["extra"] }
  ];

  var ALLNAMES = {};
  ["waffle", "choc", "tops", "extras"].forEach(function (g) { BUILDER[g].forEach(function (o) { ALLNAMES[g + ":" + o.id] = o.name; }); });

  // Pick the real ACHO photograph that matches the selection best, and say exactly what it does and does not show.
  // Toppings and extras that can be SEEN count most; a photo showing something the customer did not pick is marked down.
  function closest(sel) {
    var best = null, bs = -1e9;
    REF.forEach(function (r) {
      var s = r.base.indexOf(sel.waffle) > -1 ? 2 : -0.5;
      var chocOk = sel.choc === "mixed" ? r.choc.length >= 3 : r.choc.indexOf(sel.choc) > -1;
      s += chocOk ? 2 : (sel.choc === "mixed" && r.choc.length === 2 ? 0.5 : 0);
      sel.tops.forEach(function (t) { s += r.tops.indexOf(t) > -1 ? 4 : -1; });
      r.tops.forEach(function (t) { if (sel.tops.indexOf(t) < 0) s -= 2; });
      sel.extras.forEach(function (x) { s += r.extras.indexOf(x) > -1 ? 4 : -1; });
      r.extras.forEach(function (x) { if (sel.extras.indexOf(x) < 0) s -= (x === "ice" ? 2.5 : 0.5); });
      if (r.stick) s += 1.5;
      if (s > bs) { bs = s; best = r; }
    });
    var shown = [], missing = [], alsoInPhoto = [];
    var chk = function (ok, label) { (ok ? shown : missing).push(label); };
    chk(best.base.indexOf(sel.waffle) > -1, ALLNAMES["waffle:" + sel.waffle]);
    chk(sel.choc === "mixed" ? best.choc.length >= 3 : best.choc.indexOf(sel.choc) > -1, ALLNAMES["choc:" + sel.choc]);
    sel.tops.forEach(function (t) { chk(best.tops.indexOf(t) > -1, ALLNAMES["tops:" + t]); });
    sel.extras.forEach(function (x) { chk(best.extras.indexOf(x) > -1, ALLNAMES["extras:" + x]); });
    if (sel.choc !== "mixed") best.choc.forEach(function (c) { if (c !== sel.choc) alsoInPhoto.push(ALLNAMES["choc:" + c]); });
    best.tops.forEach(function (t) { if (sel.tops.indexOf(t) < 0) alsoInPhoto.push(ALLNAMES["tops:" + t]); });
    best.extras.forEach(function (x) { if (sel.extras.indexOf(x) < 0) alsoInPhoto.push(ALLNAMES["extras:" + x]); });
    return { ref: best, shown: shown, missing: missing, alsoInPhoto: alsoInPhoto, exact: missing.length === 0 && alsoInPhoto.length === 0 && best.stick };
  }

  function useCountUp(target) {
    var st = useState(target), val = st[0], setVal = st[1], from = useRef(target);
    useEffect(function () {
      if (reduceMotion()) { setVal(target); from.current = target; return; }
      var start = performance.now(), a = from.current, raf;
      var tick = function (t) { var k = Math.min(1, (t - start) / 420), e = 1 - Math.pow(1 - k, 3); setVal(Math.round(a + (target - a) * e)); if (k < 1) raf = requestAnimationFrame(tick); else from.current = target; };
      raf = requestAnimationFrame(tick); return function () { cancelAnimationFrame(raf); from.current = target; };
    }, [target]);
    return val;
  }

  // One photographic option. If there is no real photograph for it yet, it is plain text, never a drawing.
  function Tile(p) {
    var o = p.o;
    return html`<label className="tile group">
      <input type=${p.type} name=${p.name} value=${o.id} checked=${p.checked} onChange=${p.onChange} aria-label=${o.name + (o.price ? ", plus " + money(o.price) : "")}/>
      <span className=${"box block " + p.ratio}>
        ${o.tile
          ? html`<img src=${PHOTOS[o.tile]} alt="" width=${SIZES[o.tile] ? SIZES[o.tile][0] : null} height=${SIZES[o.tile] ? SIZES[o.tile][1] : null} loading="lazy" decoding="async" className="ph absolute inset-0 h-full w-full object-cover"/><span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></span>`
          : html`<span className="absolute inset-0 grid place-items-center bg-sand px-3 text-center"><span className="text-xs font-semibold text-ink2">Photo coming soon</span></span>`}
        <span className=${"absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 " + (o.tile ? "text-white" : "text-ink")}>
          <span className="text-sm font-bold leading-tight sm:text-[.95rem]">${o.name}</span>
          ${o.price ? html`<span className=${"shrink-0 rounded-full px-2 py-0.5 text-xs font-bold " + (o.tile ? "bg-white/90 text-[#2E1A10]" : "bg-gold text-[#2E1A10]")}>${p.base ? "" : "+"}${money(o.price)}</span>` : null}
        </span>
        <span className="tick"><${Ico} name="check" className="h-3.5 w-3.5 [&>svg]:h-full [&>svg]:w-full"/></span>
      </span>
    </label>`;
  }

  function Step(p) {
    return html`<fieldset className="min-w-0 border-0 p-0"><legend className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 p-0"><span className="grid h-8 w-8 shrink-0 place-items-center self-center rounded-full bg-gold text-sm font-bold text-[#2E1A10]">${p.n}</span><span className="font-display text-2xl font-bold leading-tight">${p.title}</span><span className="text-sm text-ink2">${p.hint}</span></legend><div className=${"grid gap-3 " + p.cols}>${p.children}</div></fieldset>`;
  }

  function Builder(p) {
    var cart = React.useContext(CartCtx);
    var w = useState("choc"), waffle = w[0], setWaffle = w[1];
    var c = useState("mixed"), choc = c[0], setChoc = c[1];
    var t = useState([]), tops = t[0], setTops = t[1];
    var e = useState([]), extras = e[0], setExtras = e[1];
    var sel = { waffle: waffle, choc: choc, tops: tops, extras: extras };
    var match = useMemo(function () { return closest(sel); }, [waffle, choc, tops.join("|"), extras.join("|")]);

    // crossfade between real photographs when the closest photo changes
    var ls = useState([{ k: match.ref.photo, id: 0 }]), layers = ls[0], setLayers = ls[1], seq = useRef(0);
    useEffect(function () {
      setLayers(function (cur) { if (cur[cur.length - 1].k === match.ref.photo) return cur; seq.current += 1; return cur.concat([{ k: match.ref.photo, id: seq.current }]); });
    }, [match.ref.photo]);
    useEffect(function () {
      if (layers.length < 2) return; var id = setTimeout(function () { setLayers(function (cur) { return cur.slice(-1); }); }, 900);
      return function () { clearTimeout(id); };
    }, [layers.length, layers[layers.length - 1].id]);

    var toggle = function (list, setList, id) { setList(list.indexOf(id) > -1 ? list.filter(function (x) { return x !== id; }) : list.concat(id)); };
    var find = function (g, id) { return BUILDER[g].filter(function (o) { return o.id === id; })[0]; };

    var lines = [[find("waffle", waffle).name, find("waffle", waffle).price], [find("choc", choc).name, find("choc", choc).price]];
    tops.forEach(function (id) { lines.push([find("tops", id).name, find("tops", id).price]); });
    extras.forEach(function (id) { lines.push([find("extras", id).name, find("extras", id).price]); });
    var total = lines.reduce(function (n, l) { return n + l[1]; }, 0);
    var shown = useCountUp(total);
    var summary = lines.map(function (l) { return l[0]; }).join(", ");
    var addIt = function () {
      var key = ["custom", waffle, choc, tops.slice().sort().join("."), extras.slice().sort().join(".")].join("-");
      cart.add(key, { name: "Your dream waffle", desc: summary, price: total, photo: match.ref.photo });
    };

    // phone: sticky Add to Cart bar while the builder is on screen (hidden when the bottom panel is visible)
    var secRef = useRef(null), panRef = useRef(null), vs = useState(false), secOn = vs[0], setSecOn = vs[1], ps = useState(false), panOn = ps[0], setPanOn = ps[1];
    useEffect(function () {
      if (!("IntersectionObserver" in window)) return;
      var a = new IntersectionObserver(function (es) { setSecOn(es[0].isIntersecting); }, { threshold: 0.05 });
      var b = new IntersectionObserver(function (es) { setPanOn(es[0].isIntersecting); }, { threshold: 0.2 });
      if (secRef.current) a.observe(secRef.current); if (panRef.current) b.observe(panRef.current);
      return function () { a.disconnect(); b.disconnect(); };
    }, []);

    return html`<section id="build" ref=${secRef} className="relative">
      <div className=${WRAP + PAD(p.first)}>
        <${Reveal}><${Hd} h1=${p.h1}>Build your${" "}<br/>dream waffle<//><//>
        <${Reveal} delay=${100}><p className="mt-6 max-w-xl text-lg leading-relaxed text-ink2">Design your own waffle stick. Every picture here is a real ACHO photograph, so we show you the closest real waffle to your choices and list exactly what you picked.</p><//>
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sand lg:aspect-[4/5] lg:rounded-[2.5rem]" role="img" aria-label=${"Closest real ACHO photo to your waffle: " + match.ref.name}>
                ${layers.map(function (l) { return html`<img key=${l.id} src=${PHOTOS[l.k]} alt="" width=${SIZES[l.k][0]} height=${SIZES[l.k][1]} decoding="async" className=${"absolute inset-0 h-full w-full object-cover " + (l.id > 0 ? "xfade" : "")}/>`; })}
                <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur" aria-live="polite">${match.exact ? "Real photo of this combination" : "Closest real photo: " + match.ref.name}</span>
              </div>
              <div className="mt-5 space-y-3" aria-live="polite">
                ${match.shown.length ? html`<div><p className="mb-2 text-sm font-semibold">Shown in the photo</p><ul className="flex flex-wrap gap-2">${match.shown.map(function (n) { return html`<li key=${n} className="chip-in inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-bg"><${Ico} name="check" className="h-3 w-3 [&>svg]:h-full [&>svg]:w-full"/>${n}</li>`; })}</ul></div>` : null}
                ${match.missing.length ? html`<div><p className="mb-2 text-sm font-semibold">In your order, not visible in this photo</p><ul className="flex flex-wrap gap-2">${match.missing.map(function (n) { return html`<li key=${n} className="chip-in rounded-full border-2 border-dashed border-ink/40 px-3 py-1 text-sm font-semibold text-ink2">${n}</li>`; })}</ul></div>` : null}
                ${match.alsoInPhoto.length ? html`<p className="text-sm text-ink2">This photo also shows: ${match.alsoInPhoto.join(", ")}. Your waffle is made with only what you choose.</p>` : null}
              </div>
            </div>
          </div>
          <div className="space-y-12 lg:col-span-7">
            <${Step} n="1" title="Choose your waffle" hint="Pick one" cols="sm:grid-cols-3">
              ${BUILDER.waffle.map(function (o) { return html`<${Tile} key=${o.id} o=${o} type="radio" name="b-waffle" base=${true} ratio="aspect-[4/3] sm:aspect-[3/4]" checked=${waffle === o.id} onChange=${function () { setWaffle(o.id); }}/>`; })}
            <//>
            <${Step} n="2" title="Choose your chocolate" hint="Pick one" cols="grid-cols-2 sm:grid-cols-4">
              ${BUILDER.choc.map(function (o) { return html`<${Tile} key=${o.id} o=${o} type="radio" name="b-choc" ratio="aspect-square" checked=${choc === o.id} onChange=${function () { setChoc(o.id); }}/>`; })}
            <//>
            <${Step} n="3" title="Add your toppings" hint="Pick as many as you like" cols="grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
              ${BUILDER.tops.map(function (o) { return html`<${Tile} key=${o.id} o=${o} type="checkbox" name="b-top" ratio="aspect-square" checked=${tops.indexOf(o.id) > -1} onChange=${function () { toggle(tops, setTops, o.id); }}/>`; })}
            <//>
            <${Step} n="4" title="Add extras" hint="Optional" cols="grid-cols-2 sm:grid-cols-4">
              ${BUILDER.extras.map(function (o) { return html`<${Tile} key=${o.id} o=${o} type="checkbox" name="b-extra" ratio="aspect-square" checked=${extras.indexOf(o.id) > -1} onChange=${function () { toggle(extras, setExtras, o.id); }}/>`; })}
            <//>
          </div>
        </div>

        <div ref=${panRef} className="mt-14 rounded-[2rem] border-2 border-ink/15 bg-surface p-6 shadow-[0_24px_60px_-34px_rgba(58,34,24,.5)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h3 className="font-display text-2xl font-bold">Your waffle</h3>
              <ul className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2" aria-label="Selected ingredients">
                ${lines.map(function (l, i) { return html`<li key=${l[0] + i} className="flex justify-between gap-4 border-b border-ink/10 pb-1.5 text-sm"><span>${l[0]}</span><span className="font-semibold text-ink2">${l[1] ? money(l[1]) : "Included"}</span></li>`; })}
              </ul>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <p className="text-sm font-semibold text-ink2">Total</p>
              <p className="font-display text-5xl font-extrabold leading-none">${money(shown)}</p>
              ${CONFIG.samplePrices ? html`<p className="mt-2 text-xs text-ink2">Sample prices. Replace them in the BUILDER settings before launch.</p>` : null}
              <button type="button" onClick=${addIt} className=${BTN_GOLD + " mt-5 w-full lg:w-auto"}><${Ico} name="cart" className="h-[18px] w-[18px]"/>Add to cart</button>
            </div>
          </div>
        </div>
      </div>
      ${secOn && !panOn ? html`<div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-bg/95 px-5 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4"><div><p className="text-xs font-semibold text-ink2">Your waffle</p><p className="font-display text-2xl font-extrabold leading-none">${money(shown)}</p></div><button type="button" onClick=${addIt} className=${BTN_GOLD + " !h-12"}><${Ico} name="cart" className="h-[18px] w-[18px]"/>Add to cart</button></div>
      </div>` : null}
    </section>`;
  }

  (A.sections = A.sections || {}).Builder = Builder;
})();
