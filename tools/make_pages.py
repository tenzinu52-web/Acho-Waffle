"""Writes the six page files. Heads are identical so the header, footer and cart behave the same everywhere."""
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Instrument+Sans:wght@400;500;600;700&display=swap"
PAGES = {
 "index": dict(page="home", title="ACHO WAFFLES",
    desc="Crispy waffle sticks, chocolate toppings and boba drinks from ACHO WAFFLES at Ga Phel Shopping Center Building Secound Floor.",
    sections=["Hero", "Marquee", "Picks", "Surprise", "BuildTeaser", {"name": "Story", "props": {"teaser": True}}, "Drinks", "GalleryStrip", "Visit"], builder=False),
 "story": dict(page="story", title="Our Story | ACHO WAFFLES",
    desc="More than just waffles. The story behind ACHO WAFFLES and what makes it special.",
    sections=["Story", "Promises", "Visit"], builder=False),
 "menu": dict(page="menu", title="Menu | ACHO WAFFLES",
    desc="Waffle sticks, pops, bubble waffles, sundaes and drinks. Prices in Nu.",
    sections=["Menu", "BuildCta", "Visit"], builder=False),
 "build": dict(page="build", title="Build Your Waffle | ACHO WAFFLES",
    desc="Build your dream waffle: choose your waffle, chocolate, toppings and extras.",
    sections=["Builder"], builder=True),
 "gallery": dict(page="gallery", title="Gallery | ACHO WAFFLES",
    desc="Photos of ACHO WAFFLES waffle sticks, chocolate creations and drinks.",
    sections=["Gallery", "Visit"], builder=False),
 "contact": dict(page="contact", title="Contact | ACHO WAFFLES",
    desc="Find ACHO WAFFLES at Ga Phel Shopping Center Building Secound Floor. Call 77771913 or 17590047.",
    sections=["Contact", "Faq"], builder=False),
 "checkout": dict(page="checkout", title="Checkout | ACHO WAFFLES",
    desc="Check out your ACHO WAFFLES order. Pick up or ask about delivery, then send your order on WhatsApp.",
    sections=["Checkout"], builder=False, extra="checkout"),
}
for name, p in PAGES.items():
    full = True   # every page is a complete document, so the site works on GitHub Pages or any static host
    mount = json.dumps({"page": p["page"], "sections": p["sections"]})
    head = (
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' if full else ''
    )
    body = f'''<title>{p["title"]}</title>
<meta name="description" content="{p["desc"].replace('"', '&quot;')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
'''
    if name == "index":
        body += '<link rel="preload" as="image" href="img/hero.webp" fetchpriority="high">\n'
    body2 = f'''<a class="skip" href="#main">Skip to the content</a>
<div id="root"></div>
<noscript><p style="padding:24px">ACHO WAFFLES needs JavaScript to show this page. You can still call us on 77771913 or 17590047.</p></noscript>
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js"></script>
<script src="assets/site.js"></script>
<script src="assets/sections.js"></script>
''' + ('<script src="assets/builder.js"></script>\n' if p["builder"] else '') + (f'<script src="assets/{p["extra"]}.js"></script>\n' if p.get("extra") else '') + f'''<script>ACHO.mount({mount});</script>
'''
    if full:
        out = f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n{head}{body}</head>\n<body>\n{body2}</body>\n</html>\n'
    else:
        out = body + body2
    open(os.path.join(OUT, f'{name}.html'), 'w', encoding='utf8').write(out)
    print(name, len(out))
