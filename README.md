# Evolution Law Firm — ELF

Premium landing page for the Evolution Law Firm. Single-page static site with multi-language support (UA / RU / EN), GSAP scroll animations, Lenis smooth scroll and a custom canvas network background.

## Stack

- Plain HTML / CSS / vanilla JS — no build step
- GSAP + ScrollTrigger (CDN)
- Lenis (CDN)
- Google Fonts: Cinzel · Cormorant Garamond · Inter

## Local preview

Open `index.html` in any modern browser, or run a static server:

```bash
npx serve .
```

## Deploy

Hosted on Vercel as a static site. Deploy from this repo:

```bash
vercel deploy --prod
```

## Structure

```
index.html
assets/
  css/style.css
  js/main.js
  js/i18n.js
  img/         # logo files
```
