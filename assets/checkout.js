/* ACHO WAFFLES checkout.
   There is no card form on purpose: a static page cannot take card payments safely.
   The customer fills in their details, then sends the order to the shop on WhatsApp with one tap.
   Nothing is confirmed until the shop replies. */
(function () {
  "use strict";
  var A = window.ACHO;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var html = A.html, CONFIG = A.CONFIG, PHOTOS = A.PHOTOS, LOGO = A.LOGO, WRAP = A.WRAP, BTN_DARK = A.BTN_DARK, BTN_LINE = A.BTN_LINE, BTN_GOLD = A.BTN_GOLD,
    money = A.money, reduceMotion = A.reduceMotion, CartCtx = A.CartCtx, Ico = A.Ico, Hd = A.Hd, PAD = A.PAD, stack = A.stack, Reveal = A.Reveal,
    CopyBtn = A.CopyBtn, IconPhone = A.IconPhone, IconChat = A.IconChat;

  var CUSTOMER_KEY = "acho_customer";
  var PAY = CONFIG.payment || {};
  var CAN_DELIVER = CONFIG.delivery !== false;
  var CAN_CASH = PAY.pickup !== false;
  var CAN_ONLINE = PAY.online !== false;

  function readCustomer() {
    try {
      var v = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "null");
      return v && typeof v === "object" ? { name: String(v.name || "").slice(0, 80), phone: String(v.phone || "").slice(0, 30) } : null;
    } catch (e) { return null; }
  }
  function saveCustomer(c) { try { if (c) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c)); else localStorage.removeItem(CUSTOMER_KEY); } catch (e) {} }

  // A short code the customer and the shop can both quote, e.g. ACHO-2211-K7QD
  function newRef() {
    var d = new Date(), pad = function (n) { return (n < 10 ? "0" : "") + n; }, abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", code = "";
    for (var i = 0; i < 4; i++) code += abc.charAt(Math.floor(Math.random() * abc.length));
    return "ACHO-" + pad(d.getDate()) + pad(d.getMonth() + 1) + "-" + code;
  }
  var phoneOk = function (v) { var d = String(v).replace(/\D/g, ""); return d.length >= 7 && d.length <= 15; };

  function buildOrder(f, lines, ref) {
    return {
      ref: ref, name: f.name.trim(), phone: f.phone.trim(), mode: f.mode, address: f.address.trim(), pay: f.pay, note: f.note.trim(),
      lines: lines.map(function (l) { return { name: l.name, qty: l.qty, price: l.price, desc: l.custom ? l.desc : "", photo: l.photo }; }),
      total: lines.reduce(function (n, l) { return n + l.qty * l.price; }, 0)
    };
  }
  function payLabel(o) {
    if (o.pay === "online") return "QR or bank transfer (please send me the payment details)";
    return o.mode === "delivery" ? "Pay on delivery" : "Pay when I collect";
  }
  function buildMessage(o) {
    var L = ["Hello ACHO WAFFLES! New order " + o.ref, "", "Name: " + o.name, "Phone: " + o.phone,
      o.mode === "delivery" ? "Delivery request: " + o.address : "Pickup from the shop", "Payment: " + payLabel(o), ""];
    o.lines.forEach(function (l) { L.push(l.qty + " x " + l.name + " - " + money(l.price * l.qty)); if (l.desc) L.push("   " + l.desc); });
    L.push("", "Total: " + money(o.total));
    if (o.note) L.push("", "Note: " + o.note);
    return L.join("\n");
  }
  var waLink = function (o) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(buildMessage(o)); };

  /* ---------- small building blocks ---------- */
  function Stepper(p) {
    var steps = ["Your details", "Send on WhatsApp"];
    return html`<ol className="mt-8 flex items-center gap-3 sm:gap-4" aria-label="Checkout steps">${steps.map(function (s, i) {
      var cur = i === p.step, done = i < p.step;
      return html`<li key=${s} aria-current=${cur ? "step" : null} className="flex items-center gap-2 sm:gap-3">
        <span className=${"grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition duration-500 " + (cur || done ? "bg-gold text-[#2E1A10]" : "border-2 border-ink/25 text-ink2")}>${done ? html`<${Ico} name="check" className="h-4 w-4"/>` : i + 1}</span>
        <span className=${"font-display text-[.95rem] font-bold sm:text-lg " + (cur ? "" : "text-ink2")}>${s}</span>
        ${i < steps.length - 1 ? html`<span aria-hidden="true" className="h-0.5 w-4 bg-ink/20 sm:w-10"></span>` : null}
      </li>`;
    })}</ol>`;
  }

  function Choice(p) {
    return html`<label className="choice relative block">
      <input type="radio" name=${p.name} value=${p.value} checked=${p.checked} onChange=${p.onChange}/>
      <span className="box"><span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-ink/40"><span className="dot h-2.5 w-2.5 rounded-full bg-ink"></span></span>
        <span><span className="block font-display text-lg font-bold leading-tight">${p.title}</span><span className="mt-1 block text-sm leading-relaxed text-ink2">${p.text}</span></span></span>
    </label>`;
  }

  function Field(p) {
    var err = p.error;
    return html`<div>
      <label htmlFor=${p.id} className="mb-2 block text-sm font-bold">${p.label}${p.optional ? html` <span className="font-medium text-ink2">(optional)</span>` : null}</label>
      ${p.children}
      ${err ? html`<p id=${p.id + "-err"} role="alert" className="err mt-2 text-sm font-semibold">${err}</p>` : null}
    </div>`;
  }

  function PayInfo(p) {
    var has = PAY.qrImage || (PAY.accounts && PAY.accounts.length);
    return html`<div className="chip-in mt-4 rounded-2xl bg-sand p-5">
      <p className="font-display text-lg font-bold">Pay by QR or bank transfer</p>
      ${has ? html`<div className="mt-3 flex flex-wrap items-start gap-5">
        ${PAY.qrImage ? html`<img src=${PAY.qrImage} alt="ACHO WAFFLES payment QR code" className="h-40 w-40 rounded-xl bg-white object-contain p-2"/>` : null}
        <ul className="min-w-0 flex-1 space-y-3">${(PAY.accounts || []).map(function (a) {
          return html`<li key=${a.label + a.number} className="flex flex-wrap items-center gap-2"><span className="min-w-0"><span className="block text-sm font-semibold text-ink2">${a.label}${a.name ? " · " + a.name : ""}</span><span className="block font-display text-xl font-bold tracking-wide">${a.number}</span></span><${CopyBtn} text=${a.number} label=${a.label + " account number"}/></li>`;
        })}</ul></div>
        <p className="mt-3 text-sm text-ink2">Please pay ${html`<strong>${money(p.total)}</strong>`}, then send us a screenshot on WhatsApp so we can confirm it.</p>`
      : html`<p className="mt-1 text-ink2">When you send your order, we reply on WhatsApp with our payment details. Pay ${html`<strong>${money(p.total)}</strong>`}, then send us a screenshot so we can confirm it.</p>`}
      <p className="mt-2 text-sm text-ink2">Your order is not confirmed until we reply on WhatsApp.</p>
    </div>`;
  }

  function Summary(p) {
    var cart = React.useContext(CartCtx);
    return html`<aside aria-label="Order summary" className="rounded-[2rem] bg-surface p-6 sm:p-8 lg:sticky lg:top-28">
      <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-extrabold">Your order</h2>${p.editable ? html`<button type="button" onClick=${function () { cart.setOpen(true); }} className="text-sm font-bold underline underline-offset-4 transition hover:text-choc">Edit cart</button>` : null}</div>
      <ul className="mt-5 divide-y divide-ink/10">${p.lines.map(function (l, i) {
        return html`<li key=${l.name + i} className="flex gap-4 py-4 first:pt-0">
          <span className="frame relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand"><img src=${PHOTOS[l.photo] || PHOTOS.acho} alt="" className="h-full w-full object-cover"/></span>
          <span className="min-w-0 flex-1"><span className="flex justify-between gap-3"><span className="font-semibold leading-tight">${l.qty} × ${l.name}</span><span className="shrink-0 font-semibold">${money(l.price * l.qty)}</span></span>${l.desc ? html`<span className="mt-1 block text-sm text-ink2">${l.desc}</span>` : null}</span>
        </li>`;
      })}</ul>
      <div className="mt-2 flex items-baseline justify-between border-t border-ink/15 pt-5"><span className="font-semibold">Total</span><span className="font-display text-3xl font-extrabold" data-testid="co-total">${money(p.total)}</span></div>
      ${p.mode === "delivery" ? html`<p className="mt-2 text-sm text-ink2">Delivery, if we can do it, is confirmed on WhatsApp together with any charge.</p>` : null}
      ${CONFIG.samplePrices ? html`<p className="mt-2 text-xs text-ink2">Sample prices. Replace them before launch.</p>` : null}
    </aside>`;
  }

  var CHECK = html`<svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden="true"><circle className="chk-c" cx="32" cy="32" r="28" fill="none" stroke="#F0B83A" strokeWidth="4"/><path className="chk-t" d="M20 33l8 8 16-18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>`;

  /* ---------- the checkout page ---------- */
  function Checkout(p) {
    var cart = React.useContext(CartCtx), lines = cart.lines;
    var saved = useState(readCustomer)[0];
    var fs = useState(function () {
      return { name: saved ? saved.name : "", phone: saved ? saved.phone : "", mode: "pickup", address: "", pay: CAN_CASH ? "cash" : "online", note: "", remember: !!saved };
    }), f = fs[0], setF = fs[1];
    var es = useState({}), errs = es[0], setErrs = es[1];
    var vs = useState("form"), view = vs[0], setView = vs[1];
    var rs = useState(""), ref = rs[0], setRef = rs[1];
    var cl = useState(null), cleared = cl[0], setCleared = cl[1];
    var head = useRef(null), first = useRef(true);

    useEffect(function () {
      if (first.current) { first.current = false; return; }
      window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
      if (head.current) head.current.focus({ preventScroll: true });
    }, [view]);

    var set = function (k, v) { setF(function (cur) { var n = Object.assign({}, cur); n[k] = v; return n; }); setErrs(function (cur) { if (!cur[k]) return cur; var n = Object.assign({}, cur); delete n[k]; return n; }); };
    var total = lines.reduce(function (n, l) { return n + l.qty * l.price; }, 0);
    var order = cleared || buildOrder(f, lines, ref || "ACHO");

    var submit = function (e) {
      e.preventDefault();
      var er = {};
      if (f.name.trim().length < 2) er.name = "Please tell us your name.";
      if (!phoneOk(f.phone)) er.phone = "Please enter a phone number we can reach you on.";
      if (f.mode === "delivery" && f.address.trim().length < 4) er.address = "Please tell us where to deliver, or choose pickup.";
      setErrs(er);
      var bad = Object.keys(er)[0];
      if (bad) { var el = document.getElementById("co-" + bad); if (el) el.focus(); return; }
      saveCustomer(f.remember ? { name: f.name.trim(), phone: f.phone.trim() } : null);
      if (!ref) setRef(newRef());
      setView("ready");
    };
    var clearCart = function () { setCleared(buildOrder(f, lines, ref)); cart.clear(); setView("done"); };

    var inputCls = "field";
    var aria = function (k) { return { "aria-invalid": errs[k] ? "true" : null, "aria-describedby": errs[k] ? "co-" + k + "-err" : null }; };
    var section = function (children) { return html`<section id="checkout" className=${"bg-bg" + stack(p.first)}><div className=${WRAP + PAD(p.first)}>${children}</div></section>`; };

    /* ----- nothing in the cart ----- */
    if (!lines.length && view !== "done") {
      return section(html`<${Reveal}><${Hd} h1=${p.h1}>Checkout<//><//>
        <div className="mx-auto mt-14 max-w-xl rounded-[2rem] bg-surface p-10 text-center"><img src=${LOGO} alt="" width="88" height="100" className="mx-auto h-20 w-auto"/>
          <p className="mt-5 font-display text-3xl font-bold">Your cart is empty</p><p className="mt-2 text-ink2">Add a waffle or a drink first, then come back to check out.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><a href="menu.html" className=${BTN_GOLD}>See the menu</a><a href="build.html" className=${BTN_LINE}>Build your own</a></div></div>`);
    }

    /* ----- after the cart was cleared ----- */
    if (view === "done") {
      return section(html`<div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center text-choc">${CHECK}</div>
        <h1 ref=${head} tabIndex="-1" className="mt-6 font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold uppercase leading-[.95] tracking-[-0.03em] outline-none [font-stretch:84%]">Thank you, ${order.name.split(" ")[0]}.</h1>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-ink2">Your cart is cleared. If you have sent the WhatsApp message, we will reply to confirm your order <strong className="text-ink">${order.ref}</strong>. If you have not sent it yet, you can still do that.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><a href=${waLink(order)} target="_blank" rel="noopener noreferrer" className=${BTN_GOLD}><${IconChat}/>Open WhatsApp again</a><a href="menu.html" className=${BTN_LINE}>Back to the menu</a></div>
      </div>`);
    }

    /* ----- ready to send ----- */
    if (view === "ready") {
      return section(html`<div>
        <${Stepper} step=${1}/>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="text-choc">${CHECK}</div>
            <h1 ref=${head} tabIndex="-1" className="mt-4 font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-extrabold uppercase leading-[.95] tracking-[-0.03em] outline-none [font-stretch:84%]">Your order is ready to send.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink2">Nothing has been sent yet. Tap the button to open WhatsApp with your order already written, then press send. Your order is not confirmed until we reply.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl bg-sand p-4 sm:p-5"><span className="text-sm font-semibold text-ink2">Order reference</span><span className="font-display text-2xl font-extrabold tracking-wide" data-testid="co-ref">${order.ref}</span><${CopyBtn} text=${order.ref} label="order reference" fail="Select the code to copy"/></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href=${waLink(order)} target="_blank" rel="noopener noreferrer" data-testid="co-wa" className=${BTN_GOLD}><${IconChat}/>Send order on WhatsApp</a>
              <button type="button" onClick=${function () { setView("form"); }} className=${BTN_LINE}>Change my details</button>
            </div>
            <ol className="mt-10 max-w-xl space-y-4">${[
              ["Send it", "WhatsApp opens with your order and reference filled in. Press send."],
              ["We reply", order.pay === "online" ? "We confirm your order and send our payment details. Pay, then send us a screenshot." : "We confirm your order and tell you when it is ready."],
              [order.mode === "delivery" ? "Delivery" : "Collect", order.mode === "delivery" ? "We tell you if we can deliver to " + order.address + " and what it costs. If not, you can collect." : "Collect your order from us: " + CONFIG.address]
            ].map(function (s, i) { return html`<li key=${s[0]} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-[#2E1A10]">${i + 1}</span><span><span className="block font-display text-lg font-bold">${s[0]}</span><span className="text-ink2">${s[1]}</span></span></li>`; })}</ol>
            <div className="mt-10 max-w-xl rounded-2xl border-2 border-ink/15 p-5">
              <p className="font-display text-lg font-bold">WhatsApp not working?</p>
              <p className="mt-1 text-ink2">Copy your order and send it to +${CONFIG.whatsapp.slice(0, 3)} ${CONFIG.whatsapp.slice(3)}, or call us.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2"><${CopyBtn} text=${buildMessage(order)} label="order message" fail="Copy failed, use WhatsApp"/>${CONFIG.phones.map(function (n) { return html`<span key=${n} className="inline-flex items-center gap-2"><a href=${"tel:" + n} className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink/25 px-4 text-sm font-bold transition hover:border-ink"><${IconPhone}/>${n}</a></span>`; })}</div>
              <p className="mt-3 text-sm text-ink2">If a number does not open your phone app, dial it by hand.</p>
            </div>
            <div className="mt-10 max-w-xl border-t border-ink/15 pt-6">
              <p className="text-ink2">Sent it? Clear your cart so the next order starts fresh.</p>
              <button type="button" onClick=${clearCart} data-testid="co-clear" className=${BTN_DARK + " mt-4"}>I have sent it, clear my cart</button>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5"><${Summary} lines=${order.lines} total=${order.total} mode=${order.mode}/></div>
        </div>
      </div>`);
    }

    /* ----- the details form ----- */
    var errCount = Object.keys(errs).length;
    return section(html`<div>
      <${Reveal}><${Hd} h1=${p.h1}>Checkout<//><//>
      <${Stepper} step=${0}/>
      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <form noValidate onSubmit=${submit} className="order-2 space-y-10 lg:order-1 lg:col-span-7" aria-label="Checkout details">
          ${errCount ? html`<p role="alert" className="err-box rounded-2xl border-2 p-4 font-semibold">Please fix ${errCount === 1 ? "one thing" : errCount + " things"} below.</p>` : null}
          <fieldset className="space-y-5"><legend className="mb-5 font-display text-2xl font-extrabold">Your details</legend>
            <${Field} id="co-name" label="Your name" error=${errs.name}><input id="co-name" type="text" autoComplete="name" value=${f.name} onChange=${function (e) { set("name", e.target.value); }} maxLength="80" className=${inputCls} ...${aria("name")}/><//>
            <${Field} id="co-phone" label="Phone number" error=${errs.phone}><input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" value=${f.phone} onChange=${function (e) { set("phone", e.target.value); }} maxLength="30" className=${inputCls} ...${aria("phone")}/><//>
            <label className="flex items-start gap-3 text-sm text-ink2"><input type="checkbox" checked=${f.remember} onChange=${function (e) { set("remember", e.target.checked); }} className="mt-0.5 h-5 w-5 shrink-0 accent-[#6B3C24]"/><span>Remember my name and phone on this device for next time.</span></label>
          </fieldset>
          <fieldset><legend className="mb-5 font-display text-2xl font-extrabold">How do you want it?</legend>
            <div className=${"grid gap-3 " + (CAN_DELIVER ? "sm:grid-cols-2" : "")}>
              <${Choice} name="mode" value="pickup" checked=${f.mode === "pickup"} onChange=${function () { set("mode", "pickup"); }} title="Pickup" text=${"Collect from us: " + CONFIG.address}/>
              ${CAN_DELIVER ? html`<${Choice} name="mode" value="delivery" checked=${f.mode === "delivery"} onChange=${function () { set("mode", "delivery"); }} title="Ask about delivery" text="We reply on WhatsApp to say if we can deliver to you, and what it costs."/>` : null}
            </div>
            ${f.mode === "delivery" ? html`<div className="chip-in mt-4"><${Field} id="co-address" label="Where should we deliver?" error=${errs.address}><textarea id="co-address" rows="3" value=${f.address} onChange=${function (e) { set("address", e.target.value); }} maxLength="240" placeholder="Building, street, a landmark near you" className=${inputCls + " !h-auto py-3"} ...${aria("address")}></textarea><//></div>` : null}
          </fieldset>
          <fieldset><legend className="mb-5 font-display text-2xl font-extrabold">How do you want to pay?</legend>
            <div className=${"grid gap-3 " + (CAN_CASH && CAN_ONLINE ? "sm:grid-cols-2" : "")}>
              ${CAN_CASH ? html`<${Choice} name="pay" value="cash" checked=${f.pay === "cash"} onChange=${function () { set("pay", "cash"); }} title=${f.mode === "delivery" ? "Pay on delivery" : "Pay when you collect"} text=${f.mode === "delivery" ? "Pay when your order arrives, if we confirm delivery." : "Pay at the shop when you pick up your order."}/>` : null}
              ${CAN_ONLINE ? html`<${Choice} name="pay" value="online" checked=${f.pay === "online"} onChange=${function () { set("pay", "online"); }} title="Pay by QR or bank transfer" text="Pay now from your banking app. We confirm it on WhatsApp."/>` : null}
            </div>
            ${f.pay === "online" ? html`<${PayInfo} total=${total}/>` : null}
            <p className="mt-4 text-sm text-ink2">We do not take card payments on this website.</p>
          </fieldset>
          <${Field} id="co-note" label="Anything we should know?" optional=${true}><textarea id="co-note" rows="3" value=${f.note} onChange=${function (e) { set("note", e.target.value); }} maxLength="300" placeholder="For example, no sprinkles, or a time you will arrive" className=${inputCls + " !h-auto py-3"}></textarea><//>
          <div>
            <button type="submit" data-testid="co-submit" className=${BTN_GOLD + " w-full sm:w-auto"}>Review order · ${money(total)}<${Ico} name="arrow" className="arr-idle h-5 w-5"/></button>
            <p className="mt-3 max-w-md text-sm text-ink2">Next, you send your order to us on WhatsApp. It is not confirmed until we reply.</p>
          </div>
        </form>
        <div className="order-1 lg:order-2 lg:col-span-5"><${Summary} lines=${lines} total=${total} mode=${f.mode} editable=${true}/></div>
      </div>
    </div>`);
  }

  A.sections = A.sections || {};
  A.sections.Checkout = Checkout;
})();
