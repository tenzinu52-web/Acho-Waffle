/* ACHO WAFFLES page sections. Each page picks the sections it needs (see the small script at the bottom of each page). */
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

  var GALLERY = [
    { key: "m0", cap: "Rainbow sprinkle stick", alt: "A long waffle stick with chocolate drizzle and rainbow sprinkles in a box" },
    { key: "m3", cap: "Chocolate Boba", alt: "An ACHO WAFFLES cup of chocolate boba" },
    { key: "m1", cap: "Banana Magic", alt: "Banana slices over chocolate-striped waffle bites" },
    { key: "m8", cap: "Choco chips and Oreo bites", alt: "Two long waffle sticks covered in choco chips and Oreo bites" },
    { key: "m2", cap: "Rainbow Pops", alt: "Close-up of a waffle pop covered in rainbow sprinkles and chocolate" },
    { key: "m6", cap: "Strawberry Boba", alt: "An ACHO WAFFLES cup of strawberry boba" },
    { key: "m4", cap: "Sundae Bliss", alt: "Chocolate-striped waffle bites with a scoop of vanilla and a scoop of strawberry ice cream" },
    { key: "m7", cap: "Rich Choco", alt: "Waffle bites wrapped in dark and white chocolate" },
    { key: "m5", cap: "Bubble Wrap", alt: "A bubble waffle topped with whole Oreos, sprinkles and chocolate" },
    { key: "m9", cap: "Rich Choco with Milk", alt: "A cup topped with a bowl of chocolate-drizzled waffle bites" }
  ];
  var GBY = {}; GALLERY.forEach(function (g) { GBY[g.key] = g; });

  /* ================================================================
     Home: hero
  ================================================================ */
  var HERO_SLIDES = [
    { k: "hero", alt: "Chocolate-striped waffle bites topped with a scoop of vanilla and a scoop of strawberry ice cream" },
    { k: "banana", alt: "Banana slices over waffle bites striped with white and dark chocolate" },
    { k: "rainbow", alt: "A waffle pop drizzled with chocolate and covered in rainbow sprinkles" }
  ];

  // A gently floating round close-up of real food
  function Bubble(p) {
    return html`<span aria-hidden="true" className=${"pointer-events-none absolute " + p.pos}><span className=${"fl block overflow-hidden rounded-full border-[3px] border-surface shadow-[0_14px_30px_-12px_rgba(58,34,24,.55)] " + p.size} style=${{ "--d": p.d + "s", "--dl": p.dl + "s", "--dx": (p.dx || 6) + "px", "--dy": (p.dy || -14) + "px", "--r0": (p.r0 || -4) + "deg", "--r1": (p.r1 || 5) + "deg" }}><img src=${PHOTOS[p.k]} alt="" width="300" height="300" loading="lazy" decoding="async" className="h-full w-full object-cover"/></span></span>`;
  }

  function HeroSlides() {
    var st = useState(0), idx = st[0], setIdx = st[1], hold = useRef(false), ready = useState(false), rdy = ready[0], setRdy = ready[1], tl = useRef(null);
    var tiltMove = function (e) {
      if (e.pointerType !== "mouse" || reduceMotion() || !tl.current) return;
      var r = tl.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tl.current.style.setProperty("--ry", (x * 7).toFixed(2) + "deg"); tl.current.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg");
    };
    var tiltEnd = function () { if (!tl.current) return; tl.current.style.setProperty("--ry", "0deg"); tl.current.style.setProperty("--rx", "0deg"); };
    useEffect(function () { var t = setTimeout(function () { setRdy(true); }, 80); return function () { clearTimeout(t); }; }, []);
    useEffect(function () {
      if (reduceMotion()) return;
      var id = setInterval(function () { if (!hold.current && !document.hidden) setIdx(function (i) { return (i + 1) % HERO_SLIDES.length; }); }, 5600);
      return function () { clearInterval(id); };
    }, []);
    return html`<div className="relative" onMouseEnter=${function () { hold.current = true; }} onMouseLeave=${function () { hold.current = false; }} onFocus=${function () { hold.current = true; }} onBlur=${function () { hold.current = false; }}>
      <div ref=${tl} className="tilt" onPointerMove=${tiltMove} onPointerLeave=${tiltEnd}>
      <div className=${"rvi relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand lg:rounded-[3rem] " + (rdy ? "in" : "")}>
        ${HERO_SLIDES.map(function (s, i) {
          return html`<div key=${s.k} className=${"slide absolute inset-0 " + (i === idx ? "on" : "")} aria-hidden=${i !== idx}>
            <img src=${PHOTOS[s.k]} alt=${s.alt} width=${SIZES[s.k][0]} height=${SIZES[s.k][1]} loading=${i === 0 ? "eager" : "lazy"} decoding="async" fetchpriority=${i === 0 ? "high" : "auto"} className="h-full w-full object-cover"/>
          </div>`;
        })}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          ${HERO_SLIDES.map(function (s, i) { return html`<button key=${s.k} type="button" aria-label=${"Show photo " + (i + 1)} aria-current=${i === idx} onClick=${function () { setIdx(i); }} className=${"h-2 rounded-full bg-white/90 shadow transition-all duration-500 " + (i === idx ? "w-7" : "w-2 opacity-60 hover:opacity-100")}></button>`; })}
        </div>
      </div>
      </div>
      <${Bubble} k="f_scoop" pos="-left-5 top-10 sm:-left-9" size="h-16 w-16 sm:h-24 sm:w-24" d=${7} dl=${0} r0=${-8} r1=${8}/>
      <${Bubble} k="f_banana" pos="-right-3 top-[24%] sm:-right-8" size="h-14 w-14 sm:h-20 sm:w-20" d=${6.2} dl=${1.2} dx=${-6} dy=${-12} r0=${6} r1=${-6}/>
      <${Bubble} k="f_sprinkles" pos="-right-2 bottom-[17%] hidden sm:block sm:-right-10" size="h-24 w-24" d=${7.6} dl=${0.6} r0=${-4} r1=${9}/>
      <${Bubble} k="f_oreo" pos="left-[6%] bottom-[34%] hidden lg:block" size="h-16 w-16" d=${5.4} dl=${0.4} dx=${4} dy=${-9}/>
      <div className="absolute -bottom-8 -left-3 h-32 w-32 sm:-left-8 sm:h-36 sm:w-36"><${Badge}/></div>
    </div>`;
  }

  function Badge() {
    var ref = useRef(null);
    useEffect(function () {
      var fit = function () { var t = ref.current; if (!t || !t.getComputedTextLength) return; t.setAttribute("letter-spacing", "0"); var len = t.getComputedTextLength(), n = t.textContent.length; t.setAttribute("letter-spacing", String(Math.max(0, (270 - len) / n))); };
      fit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }, []);
    return html`<div className="relative grid h-full w-full place-items-center rounded-full bg-gold text-[#2E1A10] shadow-[0_18px_40px_-14px_rgba(58,34,24,.6)]">
      <svg viewBox="0 0 120 120" className="spin absolute inset-0 h-full w-full" aria-hidden="true">
        <defs><path id="acho-circ" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"/></defs>
        <text ref=${ref} fontSize="10.5" fontWeight="700" fill="currentColor" fontFamily="Instrument Sans, sans-serif"><textPath href="#acho-circ">SWEETER MOMENTS • FRESHLY MADE • </textPath></text>
      </svg>
      <img src=${LOGO} alt="" width="88" height="100" className="relative h-[3.4rem] w-auto sm:h-16"/>
    </div>`;
  }

  function Hero() {
    return html`<section id="home" className=${WRAP + " pb-28 pt-6 sm:pt-10 lg:pb-40 lg:pt-14"}>
      <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <h1 className="font-display text-[clamp(2.7rem,7.4vw,6.8rem)] font-extrabold uppercase leading-[.9] tracking-[-0.035em] [font-stretch:84%]">
            <span className="block">Waffles that</span>${" "}<span className="block">make every</span>${" "}<span className="block">moment sweeter.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink2 sm:text-xl">Discover the delicious world of ACHO WAFFLES. Crispy waffle sticks, irresistible chocolate toppings and refreshing drinks.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="menu.html" className=${BTN_DARK}>Explore our menu<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>
            <a href="build.html" className=${BTN_LINE}>Build your own waffle<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>
          </div>
          <a href="#picks" aria-label="Scroll down to our favourites" className="mt-14 hidden h-11 w-11 place-items-center rounded-full border-2 border-ink/30 text-ink2 transition hover:border-ink hover:text-ink lg:grid"><${Ico} name="down" className="bob h-5 w-5"/></a>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5"><${HeroSlides}/></div>
      </div>
    </section>`;
  }

  /* ================================================================
     Home: a few menu items, the builder, the gallery and a visit panel
  ================================================================ */
  function Card(p) {
    var cart = React.useContext(CartCtx);
    var item = p.item, drink = item.cat === "drinks", sp = item.id === "acho", fav = cart.favs.indexOf(item.id) > -1;
    return html`<article className=${"card-in group flex h-full flex-col rounded-[1.75rem] p-3 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-26px_rgba(58,34,24,.55)] " + (sp ? "on-dark bg-cocoa text-[#FAF1E2]" : "bg-surface")} style=${{ animationDelay: (Math.min(p.i, 8) * 70) + "ms" }}>
      <div className="relative">
        <${Photo} k=${item.photo} alt=${item.alt} inner="transition-transform duration-700 ease-out group-hover:scale-[1.06]" className=${(drink ? "aspect-[2/3]" : "aspect-[4/5]") + " rounded-[1.25rem]"}/>
        <button type="button" onClick=${function () { cart.openQuick(item.id); }} aria-label=${"Quick view: " + item.name} className="absolute inset-0 z-10 rounded-[1.25rem]">
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto hidden w-fit translate-y-2 rounded-full bg-bg/95 px-4 py-1.5 text-xs font-bold uppercase tracking-[.08em] text-ink opacity-0 transition duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 sm:block">Quick view</span>
        </button>
        ${sp ? html`<span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#2E1A10]">Signature</span>` : null}
        <button type="button" aria-pressed=${fav} aria-label=${(fav ? "Remove " : "Save ") + item.name + (fav ? " from favourites" : " to favourites")} onClick=${function () { cart.toggleFav(item.id); }} className=${"fav absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#3A2218] shadow transition hover:scale-110 " + (fav ? "is-on" : "")}><${IconHeart}/></button>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold leading-tight">${item.name}</h3>
          <span className=${"shrink-0 pt-0.5 text-sm font-bold " + (sp ? "text-gold" : "text-choc")}>${money(item.price)}</span>
        </div>
        <p className=${"mt-2 flex-1 text-sm leading-relaxed " + (sp ? "text-[#E9D3B2]" : "text-ink2")}>${item.desc}</p>
        <${AddButton} id=${item.id} className="mt-6 w-full"/>
      </div>
    </article>`;
  }

  /* ================================================================
     Home: scrolling band and the "surprise me" picker
  ================================================================ */
  var BAND = ["Freshly made", "Crispy waffle sticks", "Chocolate toppings", "Bubble waffles", "Sundaes", "Boba drinks", "Sweeter moments"];
  function Marquee() {
    var ps = useState(false), paused = ps[0], setPaused = ps[1];
    var run = function (hidden) {
      return html`<ul aria-hidden=${hidden ? "true" : null} className=${"marq-run flex shrink-0 items-center " + (hidden ? "marq-dup" : "")}>${BAND.map(function (w) {
        return html`<li key=${w} className="flex items-center"><span className="px-6 font-display text-2xl font-extrabold uppercase tracking-[-0.01em] [font-stretch:84%] sm:text-3xl">${w}</span><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="shrink-0"><path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" fill="currentColor"/></svg></li>`;
      })}</ul>`;
    };
    return html`<section aria-label="Why people love ACHO" className=${"marq relative overflow-hidden bg-gold py-4 text-[#2E1A10] " + (paused ? "is-paused" : "")}><div className="marq-track flex w-max">${run(false)}${run(true)}</div>
      <button type="button" aria-pressed=${paused} aria-label=${paused ? "Play the scrolling band" : "Pause the scrolling band"} onClick=${function () { setPaused(!paused); }} className="marq-btn absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#2E1A10] text-[#FAF1E2] ring-[6px] ring-gold transition hover:scale-105"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">${paused ? html`<path d="M8 5v14l11-7z"/>` : html`<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>`}</svg></button>
    </section>`;
  }

  var DICE = html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/></svg>`;
  function Surprise() {
    var cart = React.useContext(CartCtx);
    var ks = useState("all"), kind = ks[0], setKind = ks[1];
    var cs = useState("acho"), id = cs[0], setId = cs[1];
    var sps = useState(false), spinning = sps[0], setSpinning = sps[1];
    var rs = useState(false), rolled = rs[0], setRolled = rs[1];
    var timer = useRef(null), warmed = useRef(false);
    var v = useInView({ threshold: 0.05 }), vref = v[0], vin = v[1];
    useEffect(function () { return function () { clearInterval(timer.current); }; }, []);
    useEffect(function () {
      // warm the photos once the section is close, so the shuffle does not flash empty frames
      if (!vin || warmed.current) return; warmed.current = true;
      PRODUCTS.forEach(function (x) { var im = new Image(); im.src = PHOTOS[x.photo]; });
    }, [vin]);
    var pool = function () { return PRODUCTS.filter(function (x) { return kind === "all" || (kind === "drinks" ? x.cat === "drinks" : x.cat !== "drinks"); }); };
    var roll = function () {
      if (spinning) return;
      var list = pool(), pickFrom = list.filter(function (x) { return x.id !== id; }), final = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      setRolled(true);
      if (reduceMotion()) { setId(final.id); return; }
      setSpinning(true); var n = 0;
      timer.current = setInterval(function () {
        n++;
        if (n >= 9) { clearInterval(timer.current); setId(final.id); setSpinning(false); }
        else setId(list[Math.floor(Math.random() * list.length)].id);
      }, 110);
    };
    var item = BYID[id];
    var KINDS = [["all", "Anything"], ["waffles", "A waffle"], ["drinks", "A drink"]];
    return html`<section id="surprise" ref=${vref} className="bg-sand">
      <div className=${WRAP + " py-20 lg:py-28"}>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <${Reveal}><${Hd}>Can’t${" "}<br/>decide?<//><//>
            <${Reveal} delay=${100}><p className="mt-6 max-w-md text-lg leading-relaxed text-ink2">Tap the button and we pick something from the menu for you. Not feeling it? Tap again.</p><//>
            <div role="group" aria-label="What should we pick?" className="mt-8 flex flex-wrap gap-2">
              ${KINDS.map(function (k) { var on = kind === k[0]; return html`<button key=${k[0]} type="button" aria-pressed=${on} onClick=${function () { setKind(k[0]); }} className=${"h-10 rounded-full border-2 px-5 text-sm font-bold transition duration-300 " + (on ? "border-ink bg-ink text-bg" : "border-ink/25 hover:border-ink")}>${k[1]}</button>`; })}
            </div>
            <button type="button" onClick=${roll} disabled=${spinning} className=${BTN_GOLD + " mt-6 disabled:cursor-wait"}><span className=${spinning ? "dice-roll inline-flex" : "inline-flex"}>${DICE}</span>${spinning ? "Picking…" : "Surprise me"}</button>
          </div>
          <div className="lg:col-span-6">
            <article className="mx-auto grid max-w-xl overflow-hidden rounded-[2rem] bg-surface sm:grid-cols-2">
              <div className="frame relative aspect-[3/4] bg-sand sm:aspect-auto sm:min-h-[22rem]">
                <img key=${spinning ? "spin" : id} src=${PHOTOS[item.photo]} alt=${spinning ? "" : item.alt} width=${SIZES[item.photo][0]} height=${SIZES[item.photo][1]} className=${"absolute inset-0 h-full w-full object-cover " + (spinning ? "" : "land")}/>
              </div>
              <div className="flex flex-col p-6">
                <p className="text-xs font-bold uppercase tracking-[.1em] text-choc">${item.cat === "drinks" ? "Drink" : "Waffle"}</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight">${spinning ? "…" : item.name}</h3>
                <p className="mt-1 font-display text-xl font-bold text-choc">${money(item.price)}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink2">${spinning ? "Rolling the dice." : item.desc}</p>
                <div className="mt-5 grid gap-2">
                  <${AddButton} key=${item.id} id=${item.id} className="w-full"/>
                  <button type="button" onClick=${function () { cart.openQuick(item.id); }} className="h-10 text-sm font-semibold text-ink2 underline underline-offset-4 transition hover:text-ink">Quick view</button>
                </div>
              </div>
            </article>
            <p className="sr-only" role="status" aria-live="polite">${rolled && !spinning ? "We picked " + item.name + ", " + money(item.price) : ""}</p>
          </div>
        </div>
      </div>
    </section>`;
  }

  var PICKS = ["acho", "banana", "bubble", "sundae"];
  function Picks() {
    return html`<section id="picks" className="relative">
      <div className=${WRAP + " pb-24 pt-20 lg:pb-32 lg:pt-28"}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <${Reveal}><${Hd}>Fresh${" "}<br/>favourites<//><//>
          <${Reveal} delay=${100}><p className="max-w-sm text-lg leading-relaxed text-ink2">Four waffles from the menu to start with. Tap Add to Cart on anything you fancy.</p><//>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          ${PICKS.map(function (id, i) { return html`<${Card} key=${id} item=${BYID[id]} i=${i}/>`; })}
        </div>
        <${Reveal} delay=${100}><a href="menu.html" className=${BTN_DARK + " mt-12"}>See the full menu<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a><//>
      </div>
    </section>`;
  }

  var TEASE = [["t_oreocrumbs", "Oreo Crumbs"], ["t_chips", "Chocolate Chips"], ["t_sprinkles", "Rainbow Sprinkles"], ["t_banana", "Banana Pieces"]];
  function BuildTeaser() {
    var steps = ["Choose your waffle", "Choose your chocolate", "Add your toppings", "Add extras"];
    return html`<section id="build-teaser" className=${"on-dark bg-cocoa text-[#FAF1E2]" + stack(false)}>
      <div className=${WRAP + PAD(false)}>
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <${Reveal}><${Hd}>Build your${" "}<br/>dream waffle<//><//>
            <${Reveal} delay=${100}><p className="mt-6 max-w-lg text-lg leading-relaxed text-[#E9D3B2]">Pick your waffle, your chocolate and your toppings. You see the closest real ACHO photo to what you chose, with a running total in Nu.</p><//>
            <ol className="mt-10 max-w-lg border-t border-[#FAF1E2]/20">
              ${steps.map(function (s, i) { return html`<li key=${s} className="flex items-center gap-4 border-b border-[#FAF1E2]/20 py-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-[#2E1A10]">${i + 1}</span><span className="font-display text-xl font-bold">${s}</span></li>`; })}
            </ol>
            <${Reveal} delay=${160}><a href="build.html" className=${BTN_GOLD + " mt-10"}>Start building<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a><//>
          </div>
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-7"><${Photo} k="sprinkles" alt="A long waffle stick with chocolate drizzle and rainbow sprinkles in a box" className="aspect-[4/5] rounded-[2rem]"/></div>
              <div className="col-span-5 self-end"><${Photo} k="tree" alt="A long tree waffle drizzled with chocolate and choco chips in a paper box" className="aspect-[3/5] rounded-[1.5rem]"/></div>
            </div>
            <ul className="mt-4 grid grid-cols-4 gap-3 sm:gap-4">
              ${TEASE.map(function (t) { return html`<li key=${t[0]}><div className="aspect-square overflow-hidden rounded-2xl bg-sand"><img src=${PHOTOS[t[0]]} alt="" width=${SIZES[t[0]][0]} height=${SIZES[t[0]][1]} loading="lazy" decoding="async" className="h-full w-full object-cover"/></div><p className="mt-2 text-xs font-semibold leading-tight text-[#E9D3B2] sm:text-sm">${t[1]}</p></li>`; })}
            </ul>
          </div>
        </div>
      </div>
    </section>`;
  }

  function GalleryStrip() {
    var keys = ["m0", "m3", "m1", "m8", "m4", "m7"];
    return html`<section id="gallery-strip" className=${"bg-bg" + stack(false)}>
      <div className=${WRAP + PAD(false)}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <${Reveal}><${Hd}>From our${" "}<br/>counter<//><//>
          <${Reveal} delay=${100} className="max-w-sm">
            <p className="text-lg leading-relaxed text-ink2">Waffle sticks, chocolate, Oreo creations and drinks. Follow along at ${CONFIG.instagramHandle}.</p>
            <div className="mt-6 flex flex-wrap gap-3"><a href="gallery.html" className=${BTN_DARK}>See the gallery</a><a href=${CONFIG.instagram} target="_blank" rel="noopener noreferrer" className=${BTN_LINE}><${IconIG}/> Instagram</a></div>
          <//>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          ${keys.map(function (k) { var g = GBY[k]; return html`<a key=${k} href="gallery.html" aria-label=${"Open the gallery: " + g.cap} className="group block overflow-hidden rounded-2xl"><${Photo} k=${k} alt=${g.alt} inner="transition-transform duration-700 ease-out group-hover:scale-[1.06]" className="aspect-[4/5] w-full !rounded-none"/></a>`; })}
        </div>
      </div>
    </section>`;
  }

  function Visit() {
    return html`<section id="visit" className=${"bg-sand" + stack(false)}>
      <div className=${WRAP + " py-20 lg:py-28"}>
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <${Reveal}><${Hd}>Come and${" "}<br/>get yours.<//><//>
            <${Reveal} delay=${100}><p className="mt-6 max-w-xl text-lg leading-relaxed text-ink2">${CONFIG.address}</p><//>
          </div>
          <${Reveal} delay=${140} className="lg:col-span-5">
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href="contact.html" className=${BTN_DARK}>Find us<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>
              ${CONFIG.phones.map(function (n) { return html`<a key=${n} href=${"tel:" + n} className=${BTN_LINE}><${IconPhone}/>${n}</a>`; })}
            </div>
          <//>
        </div>
      </div>
    </section>`;
  }

  function BuildCta() {
    return html`<section id="build-cta" className=${"on-dark bg-cocoa text-[#FAF1E2]" + stack(false)}>
      <div className=${WRAP + " py-20 lg:py-28"}>
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7"><${Reveal}><${Hd}>Want it${" "}<br/>your way?<//><//></div>
          <${Reveal} delay=${100} className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-[#E9D3B2]">Pick your waffle, chocolate and toppings in the builder, then add the result to your cart.</p>
            <a href="build.html" className=${BTN_GOLD + " mt-8"}>Build your own<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>
          <//>
        </div>
      </div>
    </section>`;
  }

  /* ================================================================
     Menu page
  ================================================================ */
  var SEARCH_ICON = html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>`;
  function Menu(p) {
    var cart = React.useContext(CartCtx);
    var initial = function () { return location.hash === "#drinks" ? "drinks" : "waffles"; };
    var st = useState(initial), cat = st[0], setCat = st[1];
    var qs = useState(""), q = qs[0], setQ = qs[1];
    var ts = useState(""), tag = ts[0], setTag = ts[1];
    var fs = useState(false), onlyFav = fs[0], setOnlyFav = fs[1];
    var os = useState("menu"), sort = os[0], setSort = os[1];
    useEffect(function () { var f = function () { setCat(initial()); setTag(""); }; window.addEventListener("hashchange", f); return function () { window.removeEventListener("hashchange", f); }; }, []);
    var pick = function (id) { setCat(id); setTag(""); try { history.replaceState(null, "", "#" + id); } catch (e) {} };
    var base = PRODUCTS.filter(function (x) { return x.cat === cat; });
    var counts = {}; base.forEach(function (x) { x.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    var tags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); });
    var needle = q.trim().toLowerCase();
    var items = base.filter(function (x) {
      if (tag && x.tags.indexOf(tag) < 0) return false;
      if (onlyFav && cart.favs.indexOf(x.id) < 0) return false;
      return !needle || (x.name + " " + x.desc + " " + x.tags.join(" ")).toLowerCase().indexOf(needle) > -1;
    });
    if (sort === "low") items = items.slice().sort(function (a, b) { return a.price - b.price; });
    if (sort === "high") items = items.slice().sort(function (a, b) { return b.price - a.price; });
    var active = !!(needle || tag || onlyFav);
    var clearAll = function () { setQ(""); setTag(""); setOnlyFav(false); };
    var chip = function (on) { return "h-10 rounded-full border-2 px-4 text-sm font-semibold capitalize transition duration-300 " + (on ? "border-ink bg-ink text-bg" : "border-ink/20 hover:border-ink"); };
    var label = cat === "drinks" ? "drinks" : "waffles";
    return html`<section id="menu" className="relative">
      <div className=${WRAP + PAD(p.first)}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <${Reveal}><${Hd} h1=${p.h1}>Our menu<//><//>
          <${Reveal} delay=${100}><p className="max-w-sm text-lg leading-relaxed text-ink2">Waffle sticks, pops, bubble waffles and sundaes, all with plenty of chocolate, plus boba, matcha and smoothies. Tap a photo for a closer look.</p><//>
        </div>
        <div role="tablist" aria-label="Menu categories" className="mt-12 flex flex-wrap gap-2">
          ${CATS.map(function (c) { var on = cat === c[0]; return html`<button key=${c[0]} role="tab" type="button" aria-selected=${on} onClick=${function () { pick(c[0]); }} className=${"h-11 rounded-full border-2 px-6 text-sm font-bold uppercase tracking-[.06em] transition duration-300 " + (on ? "border-ink bg-ink text-bg" : "border-ink/25 hover:border-ink")}>${c[1]}</button>`; })}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <label className="relative block">
            <span className="sr-only">Search the menu</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink2">${SEARCH_ICON}</span>
            <input type="search" value=${q} onChange=${function (e) { setQ(e.target.value); }} placeholder=${"Search " + label + ", for example “choco”"} autoComplete="off" className="field !pl-11"/>
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-ink2"><span>Sort</span>
            <select value=${sort} onChange=${function (e) { setSort(e.target.value); }} className="field !w-auto !pr-9">
              <option value="menu">Menu order</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option>
            </select>
          </label>
        </div>
        <div role="group" aria-label="Filter by what is on it" className="mt-4 flex flex-wrap gap-2">
          <button type="button" aria-pressed=${!tag} onClick=${function () { setTag(""); }} className=${chip(!tag)}>All</button>
          ${tags.map(function (t) { return html`<button key=${t} type="button" aria-pressed=${tag === t} onClick=${function () { setTag(tag === t ? "" : t); }} className=${chip(tag === t)}>${t}</button>`; })}
          <button type="button" aria-pressed=${onlyFav} onClick=${function () { setOnlyFav(!onlyFav); }} className=${"fav inline-flex items-center gap-2 " + chip(onlyFav) + (onlyFav ? " is-on" : "")}><${IconHeart}/>Saved${cart.favs.length ? " (" + cart.favs.length + ")" : ""}</button>
        </div>
        <p role="status" aria-live="polite" data-testid="menu-count" className="mt-6 text-sm font-semibold text-ink2">${items.length === 0 ? "No " + label + " match" : "Showing " + items.length + " of " + base.length + " " + label}${active ? html` · <button type="button" onClick=${clearAll} className="underline underline-offset-4 transition hover:text-ink">Clear filters</button>` : null}</p>
        ${items.length === 0 ? html`<div className="mt-8 rounded-[1.75rem] bg-surface p-10 text-center"><img src=${LOGO} alt="" width="88" height="100" className="mx-auto h-16 w-auto"/><p className="mt-4 font-display text-2xl font-bold">Nothing here yet</p><p className="mx-auto mt-2 max-w-sm text-ink2">${onlyFav && !cart.favs.length ? "Tap the heart on anything you like and it will show up here." : "Try a different word or clear the filters."}</p><button type="button" onClick=${clearAll} className=${BTN_DARK + " mt-6"}>Clear filters</button></div>` : html`<div key=${cat} role="tabpanel" aria-label=${label} className=${"mt-6 grid gap-4 sm:gap-5 " + (cat === "drinks" ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")}>
          ${items.map(function (item, i) { return html`<${Card} key=${item.id} item=${item} i=${i}/>`; })}
        </div>`}
        ${CONFIG.samplePrices ? html`<p className="mt-10 text-sm text-ink2">All prices are in Bhutanese Ngultrum (Nu.). These are sample prices until the real ones are added.</p>` : null}
      </div>
    </section>`;
  }

  /* ================================================================
     Our story page
  ================================================================ */
  function Story(p) {
    var teaser = !!p.teaser, first = !!p.first;
    return html`<section id="story" className=${"bg-sand" + stack(first)}>
      <div className=${WRAP + (first ? " pb-28 pt-12 lg:pb-36 lg:pt-16" : " py-24 lg:py-36")}>
        <div className="grid items-center gap-20 lg:grid-cols-12 lg:gap-16">
          <div className="relative lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-8"><${Photo} k="story1" alt="Close-up of a waffle stick layered with dark chocolate and crunchy crumb" className="aspect-[4/5] rounded-[2rem]"/></div>
              <div className="col-span-4 self-end"><${Photo} k="story2" alt="A bubble waffle topped with whole Oreos, sprinkles and chocolate" className="aspect-[3/5] rounded-[1.5rem]"/></div>
            </div>
            <div className="absolute -bottom-10 right-2 grid aspect-square w-[34%] max-w-[210px] place-items-center rounded-full border-[6px] border-sand bg-surface p-4 shadow-2xl sm:right-6 sm:p-5">
              <img src=${LOGO} alt="ACHO WAFFLES logo" width="88" height="100" loading="lazy" className="h-full w-auto"/>
            </div>
          </div>
          <div className="lg:col-span-6">
            <${Reveal}><${Hd} h1=${p.h1}>More than just waffles. It’s an ACHO experience.<//><//>
            <${Reveal} delay=${100}>
              <p className="mt-8 max-w-xl text-xl leading-relaxed">ACHO WAFFLES is a local waffle business with a simple idea: make something sweet that turns an ordinary day into a good one.</p>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink2">Every waffle stick, bubble waffle and sundae is made fresh, piled with chocolate, fruit, cream and crunch, then handed over with a smile. And because good waffles deserve a good drink, we pour boba, matcha and smoothies in our own cups.</p>
              ${teaser ? null : html`<p className="mt-5 max-w-xl text-lg leading-relaxed text-ink2">Come find us. We are ${CONFIG.address.charAt(0).toLowerCase() + CONFIG.address.slice(1)}</p>`}
            <//>
            <${Reveal} delay=${180}>${teaser
              ? html`<a href="story.html" className=${BTN_DARK + " mt-9"}>Read our story<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>`
              : html`<a href="contact.html" className=${BTN_DARK + " mt-9"}>Find us<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a>`}<//>
          </div>
        </div>
      </div>
    </section>`;
  }

  var PROMISES = [
    ["Freshly Prepared", "Every waffle is made fresh, so it reaches you warm and crisp."],
    ["Delicious Toppings", "Chocolate, fruit, cream, sprinkles and crunch, piled high."],
    ["Made with Passion", "We love what we make, and it shows in every bite."],
    ["Sweet Moments", "Waffles are better shared. Bring someone you like."]
  ];
  function PromiseRow(p) {
    var v = useInView({ threshold: 0.3 }), ref = v[0], on = v[1];
    return html`<li ref=${ref} className=${"group relative " + (on ? "in" : "")}>
      <span className="draw absolute inset-x-0 top-0 h-[2px] bg-ink" style=${{ transitionDelay: (p.i * 80) + "ms" }}></span>
      <div className="grid items-baseline gap-3 py-8 sm:py-10 lg:grid-cols-12 lg:gap-8">
        <h3 className="mask font-display text-[clamp(2rem,5vw,4.2rem)] font-extrabold uppercase leading-[.95] tracking-[-0.03em] transition-transform duration-500 [font-stretch:84%] group-hover:translate-x-2 lg:col-span-7"><span style=${{ transitionDelay: (p.i * 80 + 120) + "ms" }}>${p.t}</span></h3>
        <p className="max-w-md text-lg leading-relaxed text-ink2 lg:col-span-5">${p.d}</p>
      </div>
    </li>`;
  }
  function Promises(p) {
    return html`<section id="promise" className=${"bg-bg" + stack(p.first)}>
      <div className=${WRAP + PAD(p.first)}>
        <${Reveal}><${Hd} h1=${p.h1} className="max-w-3xl">What makes ACHO special?<//><//>
        <ul className="mt-14 border-b-2 border-ink">
          ${PROMISES.map(function (p, i) { return html`<${PromiseRow} key=${p[0]} t=${p[0]} d=${p[1]} i=${i}/>`; })}
        </ul>
      </div>
    </section>`;
  }

  function Drinks(p) {
    return html`<section id="drinks" className=${"on-dark bg-cocoa text-[#FAF1E2]" + stack(p.first)}>
      <div className=${WRAP + PAD(p.first)}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <${Reveal}><${Hd} h1=${p.h1}>Sip something${" "}<br/>sweet<//><//>
          <${Reveal} delay=${100}><p className="max-w-sm text-lg leading-relaxed text-[#E9D3B2]">Boba, matcha and smoothies, poured into our own ACHO cups.</p><//>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          ${DRINKS.map(function (d, i) {
            return html`<${Reveal} key=${d.id} delay=${i * 90} className="group flex flex-col">
              <${Photo} k=${d.photo} alt=${d.alt} inner="transition-transform duration-700 ease-out group-hover:scale-[1.06]" className="aspect-[2/3] rounded-[1.5rem]"/>
              <div className="mt-5 flex items-start justify-between gap-3"><h3 className="font-display text-xl font-bold leading-tight">${d.name}</h3><span className="shrink-0 pt-0.5 text-sm font-bold text-gold">${money(d.price)}</span></div>
              <${AddButton} id=${d.id} className="mt-4 w-full"/>
            <//>`;
          })}
        </div>
        <${Reveal} delay=${100}><a href="menu.html#drinks" className=${BTN_GOLD + " mt-12"}>See all drinks<${Ico} name="arrow" className="arr-idle h-5 w-5"/></a><//>
      </div>
    </section>`;
  }


  /* ================================================================
     Gallery page
  ================================================================ */
  var ARROW_L = html`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`;
  var ARROW_R = html`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  function Lightbox(p) {
    var ref = useRef(null), touch = useRef(null), n = GALLERY.length;
    var g = p.index == null ? null : GALLERY[p.index];
    useEffect(function () {
      var d = ref.current; if (!d) return;
      if (g && !d.open) { d.showModal(); document.documentElement.style.overflow = "hidden"; }
      if (!g && d.open) d.close();
    }, [p.index]);
    useEffect(function () {
      var d = ref.current; if (!d) return;
      var onClose = function () { document.documentElement.style.overflow = ""; if (p.index != null) p.onClose(); };
      d.addEventListener("close", onClose); return function () { d.removeEventListener("close", onClose); };
    }, [p.index]);
    useEffect(function () {
      if (p.index == null) return;
      [1, -1].forEach(function (d) { var im = new Image(); im.src = PHOTOS[GALLERY[(p.index + d + n) % n].key]; });
    }, [p.index]);
    var go = function (d) { p.onGo((p.index + d + n) % n); };
    var close = function () { if (ref.current && ref.current.open) ref.current.close(); };
    var onKey = function (e) { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } };
    var onTouchStart = function (e) { touch.current = e.touches[0].clientX; };
    var onTouchEnd = function (e) { if (touch.current == null) return; var dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); };
    var sz = g ? SIZES[g.key] : [4, 5];
    var arrow = "grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white/40 text-white transition hover:border-white hover:bg-white/10";
    return html`<dialog ref=${ref} aria-label="Photo viewer" onKeyDown=${onKey} onClick=${function (e) { if (e.target === ref.current) close(); }} className="lb on-dark m-0 h-[100dvh] max-h-none w-[100vw] max-w-none border-0 bg-[#1c120c] p-0 text-white backdrop:bg-black/70">
      ${g ? html`<div className="flex h-full flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-white/80" data-testid="lb-count">${p.index + 1} / ${n}</p>
          <button type="button" onClick=${close} className="h-11 rounded-full border-2 border-white/40 px-5 text-sm font-bold transition hover:border-white hover:bg-white/10">Close</button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-4 sm:gap-6" onTouchStart=${onTouchStart} onTouchEnd=${onTouchEnd}>
          <button type="button" onClick=${function () { go(-1); }} aria-label="Previous photo" className=${arrow + " hidden sm:grid"}>${ARROW_L}</button>
          <img key=${g.key} src=${PHOTOS[g.key]} alt=${g.alt} width=${sz[0]} height=${sz[1]} className="lb-img h-auto max-h-full min-h-0 w-auto min-w-0 max-w-full rounded-2xl object-contain shadow-2xl"/>
          <button type="button" onClick=${function () { go(1); }} aria-label="Next photo" className=${arrow + " hidden sm:grid"}>${ARROW_R}</button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-xl font-bold" data-testid="lb-cap">${g.cap}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick=${function () { go(-1); }} aria-label="Previous photo" className=${arrow + " sm:hidden"}>${ARROW_L}</button>
            <button type="button" onClick=${function () { go(1); }} aria-label="Next photo" className=${arrow + " sm:hidden"}>${ARROW_R}</button>
            <a href=${CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-white/40 px-5 text-sm font-bold transition hover:border-white hover:bg-white/10"><${IconIG}/>${CONFIG.instagramHandle}</a>
          </div>
        </div>
      </div>` : null}
    </dialog>`;
  }

  var ZOOM_ICON = html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M11 8.5v5M8.5 11h5"/></svg>`;
  function Gallery(p) {
    var st = useState(null), idx = st[0], setIdx = st[1];
    return html`<section id="gallery" className=${"bg-bg" + stack(p.first)}>
      <div className=${WRAP + PAD(p.first)}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <${Reveal}><${Hd} h1=${p.h1}>Fresh from${" "}<br/>the iron<//><//>
          <${Reveal} delay=${100} className="max-w-sm">
            <p className="text-lg leading-relaxed text-ink2">Waffle sticks, chocolate, Oreo creations and drinks, straight from our counter. Tap a photo to see it bigger, or follow along at ${CONFIG.instagramHandle}.</p>
            <a href=${CONFIG.instagram} target="_blank" rel="noopener noreferrer" className=${BTN_LINE + " mt-6"}><${IconIG}/> Follow on Instagram</a>
          <//>
        </div>
        <div className="mt-14 columns-2 gap-3 md:columns-3 lg:gap-4">
          ${GALLERY.map(function (g, i) {
            var s = SIZES[g.key];
            return html`<button key=${g.key} type="button" onClick=${function () { setIdx(i); }} aria-label=${"Open photo: " + g.cap} className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left lg:mb-4">
              <${Photo} k=${g.key} alt="" style=${{ aspectRatio: s[0] + " / " + s[1] }} inner="transition-transform duration-700 ease-out group-hover:scale-[1.06]" className="w-full !rounded-none"/>
              <span className="absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-black/60 via-black/0 to-black/0 p-4 text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:flex">
                <span className="flex items-center justify-between gap-2"><span className="font-semibold">${g.cap}</span>${ZOOM_ICON}</span>
              </span>
            </button>`;
          })}
        </div>
      </div>
      <${Lightbox} index=${idx} onGo=${setIdx} onClose=${function () { setIdx(null); }}/>
    </section>`;
  }
  function Row(p) {
    return html`<div className="flex gap-4 border-t border-ink/15 py-6"><span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-[#2E1A10]">${p.icon}</span><div className="min-w-0"><h3 className="font-display text-lg font-bold">${p.title}</h3><div className="mt-1 text-ink2">${p.children}</div></div></div>`;
  }

  function MapPanel() {
    // Google Maps cannot be embedded in a published page, so this is a visit card that opens Maps in a new tab.
    return html`<div className="overflow-hidden rounded-[2rem] bg-surface">
      <${Photo} k="bubble" alt="A bubble waffle topped with whole Oreos, sprinkles and chocolate drizzle" className="aspect-[16/9] w-full !rounded-none"/>
      <div className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <h3 className="font-display text-2xl font-bold">Find us on Google Maps</h3>
        <p className="max-w-sm text-ink2">${CONFIG.address}</p>
        <a href=${CONFIG.mapsLink} target="_blank" rel="noopener noreferrer" className=${BTN_DARK}>Open Google Maps</a>
      </div>
    </div>`;
  }
  function Contact(p) {
    var wa = "+" + CONFIG.whatsapp.slice(0, 3) + " " + CONFIG.whatsapp.slice(3);
    return html`<section id="contact" className=${"bg-sand" + stack(p.first)}>
      <div className=${WRAP + PAD(p.first)}>
        <${Reveal}><${Hd} h1=${p.h1} className="max-w-4xl">Let’s make your day sweeter.<//><//>
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <${Reveal} className="lg:col-span-5">
            <${Row} icon=${html`<${IconPin}/>`} title="Location"><p>${CONFIG.address}</p><//>
            <${Row} icon=${html`<${IconPhone}/>`} title="Call us">
              <ul className="flex flex-col gap-2">${CONFIG.phones.map(function (n) { return html`<li key=${n} className="flex flex-wrap items-center gap-2"><a href=${"tel:" + n} className=${BTN_GOLD + " !h-11 !px-5 !text-base !tracking-normal"}><${IconPhone}/>${n}</a><${CopyBtn} text=${n} label=${"phone number " + n}/></li>`; })}</ul>
              <p className="mt-3 text-sm">If your device does not open the phone app, copy the number and dial it.</p>
            <//>
            <${Row} icon=${html`<${IconChat}/>`} title="WhatsApp"><a href=${"https://wa.me/" + CONFIG.whatsapp} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink">Message ${wa}</a><//>
            <${Row} icon=${html`<${IconIG}/>`} title="Instagram"><a href=${CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink">${CONFIG.instagramHandle}</a><//>
            <${Row} icon=${html`<${IconClock}/>`} title="Opening hours">
              <dl>${CONFIG.hours.map(function (h) { return html`<div key=${h[0]} className="flex justify-between gap-6 py-0.5"><dt>${h[0]}</dt><dd className="font-semibold text-ink">${h[1]}</dd></div>`; })}</dl>
            <//>
          <//>
          <${Reveal} delay=${120} className="lg:col-span-7"><${MapPanel}/><//>
        </div>
      </div>
    </section>`;
  }

  var FAQ = [
    ["How do I order?", function () { return "Add what you like to your cart on this site, then press Checkout. Your order opens as a WhatsApp message to us, and we reply to confirm it. You can also call " + CONFIG.phones.join(" or ") + "."; }],
    ["How do I pay?", function () { return "At checkout you can choose to pay when you collect, or to pay by QR or bank transfer. For QR or transfer we send the payment details on WhatsApp, and you send us a screenshot. We do not take card payments on this website."; }],
    ["Can I get my order delivered?", function () { return "At checkout you can ask about delivery. We reply on WhatsApp to say whether we can deliver to you and what it would cost. Until we confirm, please treat it as pickup."; }],
    ["Can I make my own waffle?", function () { return html`<span>Yes. The <a href="build.html" className="underline underline-offset-4">Build page</a> lets you choose your waffle, chocolate, toppings and extras, shows the closest real ACHO photo, and adds your creation to the cart with the price.</span>`; }],
    ["Where do I find you?", function () { return CONFIG.address + " Open Google Maps from the Contact page to get directions."; }]
  ];
  function Faq(p) {
    var st = useState(0), open = st[0], setOpen = st[1];
    return html`<section id="faq" className=${"bg-bg" + stack(false)}>
      <div className=${WRAP + " py-20 lg:py-28"}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5"><${Reveal}><${Hd}>Good to${" "}<br/>know<//><//></div>
          <div className="lg:col-span-7">
            <ul className="border-b border-ink/15">
              ${FAQ.map(function (f, i) {
                var on = open === i;
                return html`<li key=${f[0]} className=${"acc border-t border-ink/15 " + (on ? "is-open" : "")}>
                  <h3><button type="button" id=${"faq-b" + i} aria-expanded=${on} aria-controls=${"faq-p" + i} onClick=${function () { setOpen(on ? -1 : i); }} className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-xl font-bold sm:text-2xl">
                    ${f[0]}<span aria-hidden="true" className="acc-plus grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink/30"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
                  </button></h3>
                  <div id=${"faq-p" + i} role="region" aria-labelledby=${"faq-b" + i} className="acc-panel"><div className="acc-in"><p className="max-w-xl pb-6 text-lg leading-relaxed text-ink2">${f[1]()}</p></div></div>
                </li>`;
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>`;
  }

  var S = A.sections = A.sections || {};
  S.Marquee = Marquee; S.Surprise = Surprise; S.Faq = Faq;
  S.Hero = Hero; S.Picks = Picks; S.BuildTeaser = BuildTeaser; S.Story = Story; S.Promises = Promises; S.Drinks = Drinks;
  S.GalleryStrip = GalleryStrip; S.Visit = Visit; S.BuildCta = BuildCta; S.Menu = Menu; S.Gallery = Gallery; S.Contact = Contact;
})();
