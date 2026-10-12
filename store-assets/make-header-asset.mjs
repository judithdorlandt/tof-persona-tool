/**
 * Maakt het header asset voor de App Store: 5244 x 2950 (16:9).
 *
 * Dit is het optionele beeld bovenaan de productpagina. Apple snijdt het voor
 * elke plek anders bij — breed op een iPad, bijna vierkant in een lijstje — en
 * zet er zelf de appnaam en de knop "Download" overheen. Daarom staat alles
 * hier in het midden en blijft de buitenrand leeg: wat tegen de rand staat is
 * ergens weggesneden. De veilige breedte is 1966 van de 2622 CSS-pixels (een
 * 4:3-uitsnede van de volle hoogte), dus de inhoud blijft onder 1900.
 *
 * Gerenderd op 2622 x 1475 met deviceScaleFactor 2 — precies de helft van
 * 5244 x 2950, dus het komt zonder afronding uit. Rechtstreeks een venster van
 * 5244 px vragen gaat niet goed in een headless Chrome.
 *
 * Kleuren en letters komen uit de app zelf (index.css en @fontsource), zodat de
 * winkelpagina er hetzelfde uitziet als wat je daarna opent.
 *
 * Vooraf, eenmalig:
 *   npm i puppeteer-core --no-save
 *
 * Draaien:
 *   node store-assets/make-header-asset.mjs nl
 *   node store-assets/make-header-asset.mjs en
 *
 * De bestanden komen in store-assets/header-asset/<taal>.png.
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
const UIT = resolve(HIER, 'header-asset');
mkdirSync(UIT, { recursive: true });

const BREED = 2622;
const HOOG = 1475;
const SCHAAL = 2; // 2622 x 2 = 5244, 1475 x 2 = 2950

const base64 = (pad) => readFileSync(resolve(WORTEL, pad)).toString('base64');

const PLAYFAIR = base64('node_modules/@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff2');
const INTER = base64('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2');
const LOGO = base64('src/assets/tof-logo.png');

const T = {
    nl: {
        naam: 'TOF Persona',
        kop: 'Ontdek hoe jij werkt',
        regel: 'Negen vragen, een paar minuten. Alles blijft op je toestel.',
    },
    en: {
        naam: 'TOF Persona',
        kop: 'Discover how you work',
        regel: 'Nine questions, a few minutes. Everything stays on your device.',
    },
}[taal];

const html = `<!doctype html>
<html lang="${taal}"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Playfair'; src: url(data:font/woff2;base64,${PLAYFAIR}) format('woff2'); font-weight: 500; }
  @font-face { font-family: 'Inter'; src: url(data:font/woff2;base64,${INTER}) format('woff2'); font-weight: 400; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${BREED}px; height: ${HOOG}px; overflow: hidden;
    background: #F7F3EE;
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  /*
    Twee zachte salie-gloeden, in de hoeken die als eerste worden weggesneden.
    Ze geven diepte zonder dat er iets verdwijnt dat je moet kunnen lezen.
  */
  body::before, body::after {
    content: ''; position: absolute;
    width: 1700px; height: 1700px; border-radius: 50%;
    background: radial-gradient(circle, #C6D9C9 0%, rgba(198,217,201,0) 70%);
  }
  body::before { left: -520px; top: -760px; }
  body::after { right: -520px; bottom: -760px; }

  /* Alles binnen de 4:3-uitsnede, dus smaller dan 1966 px. */
  .midden {
    position: relative; z-index: 1;
    width: 1900px; max-height: 1300px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
  }
  .merk { width: 460px; height: 460px; margin-bottom: 76px; }
  .merk img { width: 100%; height: 100%; object-fit: contain; }
  .naam {
    font-family: 'Inter', sans-serif; font-size: 52px; letter-spacing: 0.18em;
    text-transform: uppercase; color: #6E8872; margin-bottom: 54px;
  }
  .kop {
    font-family: 'Playfair', serif; font-size: 174px; line-height: 1.06;
    color: #1F1F1F; margin-bottom: 60px;
  }
  .regel { font-family: 'Inter', sans-serif; font-size: 62px; color: #555555; line-height: 1.45; }
</style></head>
<body>
  <div class="midden">
    <div class="merk"><img src="data:image/png;base64,${LOGO}" alt=""></div>
    <div class="naam">${T.naam}</div>
    <div class="kop">${T.kop}</div>
    <div class="regel">${T.regel}</div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: BREED, height: HOOG, deviceScaleFactor: SCHAAL },
    args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

// Waarschuw als de inhoud toch buiten de veilige 4:3-uitsnede valt.
const overschot = await page.evaluate(() => {
    const r = document.querySelector('.midden').getBoundingClientRect();
    return { breedte: Math.round(r.width), hoogte: Math.round(r.height) };
});
if (overschot.breedte > 1966 || overschot.hoogte > 1475) {
    console.warn('let op: de inhoud valt buiten de veilige uitsnede', overschot);
}

await page.screenshot({ path: `${UIT}/${taal}.png`, captureBeyondViewport: false });
await browser.close();
console.log(`klaar: ${UIT}/${taal}.png (inhoud ${overschot.breedte} x ${overschot.hoogte} css-px)`);
