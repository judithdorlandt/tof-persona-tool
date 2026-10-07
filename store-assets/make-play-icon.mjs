/**
 * Maakt het winkelicoon voor Google Play: 512 x 512, zonder alfakanaal.
 *
 * Waarom niet gewoon `sips -z 512 512` op het logo: Google weigert
 * transparantie, en src/assets/tof-logo.png heeft een alfakanaal. Het logo moet
 * dus op een effen vlak staan — de bufferkleur van de app, #F7F3EE. Dat is wat
 * dit script doet: een pagina van 512x512 met die achtergrond, logo gecentreerd
 * met marge, en daar een schermafbeelding van.
 *
 * Google snijdt het icoon zelf rond; vandaar de ruime marge, zodat er niets van
 * het beeldmerk wegvalt.
 *
 * Vooraf, eenmalig:
 *   npm i puppeteer-core --no-save
 *
 * Draaien:
 *   node store-assets/make-play-icon.mjs
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
const UIT = resolve(HIER, 'play-icon');
mkdirSync(UIT, { recursive: true });

const LOGO = readFileSync(resolve(WORTEL, 'src/assets/tof-logo.png')).toString('base64');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 512px; height: 512px; overflow: hidden;
    background: #F7F3EE;
    display: flex; align-items: center; justify-content: center;
  }
  img { width: 340px; height: 340px; object-fit: contain; }
</style></head>
<body><img src="data:image/png;base64,${LOGO}" alt=""></body></html>`;

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 512, height: 512, deviceScaleFactor: 1 },
    args: ['--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: `${UIT}/icon-512.png`, omitBackground: false, captureBeyondViewport: false });
await browser.close();
console.log('klaar: ' + UIT + '/icon-512.png');
