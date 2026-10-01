/**
 * Maakt winkel-schermafbeeldingen van de app, op exact het formaat dat Apple
 * voor het grootste iPhone-scherm vraagt: 1320 x 2868 (440 x 956 punten, 3x).
 *
 * Waarom niet in de iOS-simulator: `simctl` kan een toestel starten en een
 * schermafbeelding maken, maar niet tikken. Simulator.app — de versie met een
 * venster waar je in kan klikken — zit niet in deze Xcode-installatie. Daarom
 * draait dit tegen dezelfde productie-build die ín de app zit, in Chrome, op
 * precies het schermformaat van het toestel. De beelden kloppen dus met de app;
 * alleen de iOS-statusbalk en het streepje onderaan ontbreken, en die horen
 * sowieso niet in een winkelafbeelding.
 *
 * Vooraf, eenmalig:
 *   npm i puppeteer-core            (of ergens anders; zie PUPPETEER hieronder)
 *
 * Draaien:
 *   REACT_APP_PLATFORM=native CI=false GENERATE_SOURCEMAP=false npx react-scripts build
 *   npx serve -s build -l 4173 &
 *   node store-assets/make-store-screenshots.mjs nl
 *   node store-assets/make-store-screenshots.mjs en
 *
 * De bestanden komen in store-assets/screenshots/<taal>/.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core');

const CHROME = process.env.CHROME_PAD || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const taal = process.argv[2] === 'en' ? 'en' : 'nl';
const UIT = resolve(dirname(fileURLToPath(import.meta.url)), 'screenshots', taal);
mkdirSync(UIT, { recursive: true });

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

const T = {
    nl: {
        taalknop: 'Nederlands', begin: 'Begin bij jezelf', test: 'Doe de test',
        verder: 'Verder naar de quiz', klaar: 'Nee, ik ben klaar',
        privacy: 'Wat deze app over je bewaart',
        tabGesprek: 'Gesprek', tabPersonas: "Persona's",
    },
    en: {
        taalknop: 'English', begin: 'Start with yourself', test: 'Take the test',
        verder: 'On to the quiz', klaar: 'No, I am done',
        privacy: 'What this app keeps about you',
        tabGesprek: 'Conversation', tabPersonas: 'Personas',
    },
}[taal];

async function klik(page, tekst) {
    const ok = await page.evaluate((tekst) => {
        const el = [...document.querySelectorAll('button, a')]
            .find((n) => !n.disabled && (n.textContent || '').trim().includes(tekst));
        if (!el) return false;
        el.click();
        return true;
    }, tekst);
    if (!ok) throw new Error('knop niet gevonden: ' + tekst);
    await wacht(700);
}

async function schiet(page, naam) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await wacht(1100); // animaties laten uitlopen
    await page.screenshot({ path: `${UIT}/${naam}.png`, captureBeyondViewport: false });
    console.log('  ' + naam + '.png');
}

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 440, height: 956, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

await klik(page, T.taalknop);
await klik(page, T.begin);
await schiet(page, '1-start');

// Privacyscherm, voordat er een profiel staat
await klik(page, T.privacy);
await schiet(page, '6-privacy');
await page.goBack({ waitUntil: 'networkidle0' }).catch(() => {});
await wacht(800);

await klik(page, T.test);
await page.type('input', 'Judith');
await klik(page, T.verder);

// Twee antwoorden aanvinken, zodat het scherm laat zien hoe het werkt
const kiesTwee = async () => {
    for (const index of [0, 1]) {
        await page.evaluate((index) => {
            const opties = [...document.querySelectorAll('button')]
                .filter((n) => !(n.textContent || '').includes('Persona Tool') && !n.disabled)
                .filter((n) => n.getBoundingClientRect().width > 200);
            opties[index] && opties[index].click();
        }, index);
        await wacht(350);
    }
};
await kiesTwee();
await schiet(page, '2-vraag');

const volgende = async () => {
    await page.evaluate(() => {
        const knoppen = [...document.querySelectorAll('button')].filter((n) => !n.disabled);
        knoppen[knoppen.length - 1].click();
    });
    await wacht(800);
};
await volgende();
for (let q = 1; q < 9; q++) {
    await kiesTwee();
    await volgende();
}

await wacht(1500);
await klik(page, T.klaar);
await wacht(1200);
await schiet(page, '3-profiel');

await klik(page, T.tabPersonas);
await schiet(page, '4-personas');

await klik(page, T.tabGesprek);
await schiet(page, '5-gesprek');

await browser.close();
console.log('klaar: ' + UIT);
