/**
 * Maakt de feature graphic voor Google Play: 1024 x 500.
 *
 * Google toont deze bovenaan de winkelpagina. Hij wordt soms bijgesneden en er
 * kan een afspeelknop overheen vallen, dus: rustige achtergrond, tekst links,
 * beeldmerk rechts, en niets belangrijks tegen de randen.
 *
 * Kleuren en letters komen uit de app zelf (index.css en @fontsource), zodat de
 * winkelpagina er hetzelfde uitziet als wat je daarna opent.
 *
 * Vooraf, eenmalig:
 *   npm i puppeteer-core --no-save
 *
 * Draaien:
 *   node store-assets/make-feature-graphic.mjs nl
 *   node store-assets/make-feature-graphic.mjs en
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core');

const HIER = dirname(fileURLToPath(import.meta.url));
const WORTEL = resolve(HIER, '..');
const CHROME = process.env.CHROME_PAD || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const taal = process.argv[2] === 'en' ? 'en' : 'nl';
const UIT = resolve(HIER, 'feature-graphic');
mkdirSync(UIT, { recursive: true });

const base64 = (pad) => readFileSync(resolve(WORTEL, pad)).toString('base64');

const PLAYFAIR = base64('node_modules/@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff2');
const INTER = base64('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2');
const LOGO = base64('src/assets/tof-logo.png');

const T = {
    nl: {
        naam: 'TOF Persona',
        kop: 'Ontdek hoe jij werkt',
        regel: 'Negen vragen, een paar minuten.',
        slot: 'Alles blijft op je toestel.',
    },
    en: {
        naam: 'TOF Persona',
        kop: 'Discover how you work',
        regel: 'Nine questions, a few minutes.',
        slot: 'Everything stays on your device.',
    },
}[taal];

const html = `<!doctype html>
<html lang="${taal}"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Playfair'; src: url(data:font/woff2;base64,${PLAYFAIR}) format('woff2'); font-weight: 500; }
  @font-face { font-family: 'Inter'; src: url(data:font/woff2;base64,${INTER}) format('woff2'); font-weight: 400; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1024px; height: 500px; overflow: hidden;
    background: #F7F3EE;
    display: flex; align-items: center;
    position: relative;
  }
  /* zachte salie-gloed rechtsonder, zelfde familie als de app-achtergrond */
  body::after {
    content: ''; position: absolute; right: -120px; bottom: -200px;
    width: 620px; height: 620px; border-radius: 50%;
    background: radial-gradient(circle, #C6D9C9 0%, rgba(198,217,201,0) 70%);
  }
  .tekst { position: relative; z-index: 1; padding-left: 86px; max-width: 620px; }
  .naam {
    font-family: 'Inter', sans-serif; font-size: 20px; letter-spacing: 0.18em;
    text-transform: uppercase; color: #6E8872; margin-bottom: 26px;
  }
  .kop {
    font-family: 'Playfair', serif; font-size: 68px; line-height: 1.08;
    color: #1F1F1F; margin-bottom: 30px;
  }
  .regel { font-family: 'Inter', sans-serif; font-size: 25px; color: #555555; line-height: 1.5; }
  .slot { font-family: 'Inter', sans-serif; font-size: 25px; color: #6E8872; line-height: 1.5; }
  .merk {
    position: absolute; right: 92px; top: 50%; transform: translateY(-50%);
    width: 232px; height: 232px; z-index: 1;
  }
  .merk img { width: 100%; height: 100%; object-fit: contain; }
</style></head>
<body>
  <div class="tekst">
    <div class="naam">${T.naam}</div>
    <div class="kop">${T.kop}</div>
    <div class="regel">${T.regel}</div>
    <div class="slot">${T.slot}</div>
  </div>
  <div class="merk"><img src="data:image/png;base64,${LOGO}" alt=""></div>
</body></html>`;

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 1024, height: 500, deviceScaleFactor: 1 },
    args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${UIT}/${taal}.png`, captureBeyondViewport: false });
await browser.close();
console.log('klaar: ' + UIT + '/' + taal + '.png');
