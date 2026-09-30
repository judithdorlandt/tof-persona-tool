/**
 * make-app-assets.mjs — bouwt de bronplaatjes voor het app-icoon en de splash.
 *
 * Het TOF-merk (src/assets/tof-logo.png) staat van rand tot rand: de cirkel
 * raakt alle vier de zijden. Als app-icoon gaat dat mis, want zowel iOS als
 * Android snijden er een vorm uit — op iOS een squircle, op Android een masker
 * dat per toestel verschilt. Een cirkel die de rand raakt wordt dan afgeknipt.
 *
 * Daarom krijgt het merk hier lucht, en per doel een andere hoeveelheid:
 *
 *   icon-only        64%  — iOS snijdt de hoeken af, de rest blijft heel
 *   icon-foreground  62%  — even zwaar als op iOS; zie de noot hieronder
 *   splash           20%  — een startscherm is een merk, geen plaatje
 *
 * Draaien: `node scripts/make-app-assets.mjs`, daarna
 * `npx @capacitor/assets generate --ios --android`.
 * Die tweede stap bewust ZONDER --pwa: dat zou public/manifest.json en de
 * webiconen overschrijven, en de webversie blijft ongemoeid.
 *
 * TWEE DINGEN OM TE WETEN NA EEN REGENERATIE
 *
 * 1. `@capacitor/assets` herschrijft `mipmap-anydpi-v26/ic_launcher*.xml` en
 *    zet daar zélf `android:inset="16.7%"` op. Die inset legt de bronplaat
 *    precies op het altijd-zichtbare deel van een Android-icoon. De 62%
 *    hierboven is dus het aandeel van wat je uiteindelijk ziet, niet van het
 *    hele doek — een tweede marge in de bron zou er dubbelop komen.
 * 2. Diezelfde inset wordt ook op de ACHTERGROND gezet, en daar hoort hij
 *    niet: dan loopt het gekleurde vlak exact tot de rand van het zichtbare
 *    gebied en kan het parallax-effect van een launcher er doorzichtige
 *    hoeken achter vandaan schuiven. De achtergrond staat daarom met de hand
 *    terug op vollevlak. Controleer dat na elke regeneratie.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = path.join(ROOT, 'src/assets/tof-logo.png');
const OUT = path.join(ROOT, 'assets');

/** Huisstijl-achtergrond, dezelfde als de app zelf. */
const BG = { r: 0xf7, g: 0xf3, b: 0xee, alpha: 1 };
const LEEG = { r: 0, g: 0, b: 0, alpha: 0 };

/** Het merk op maat, met doorzichtige rand eromheen. */
async function merk(grootte) {
    return sharp(LOGO)
        .resize(grootte, grootte, { fit: 'contain', background: LEEG })
        .png()
        .toBuffer();
}

/** Eén vierkant doek met het merk gecentreerd erop; schaal 0 = kale kleur. */
async function plaat(bestand, doek, schaal, achtergrond) {
    const doek4 = sharp({
        create: { width: doek, height: doek, channels: 4, background: achtergrond },
    });
    const met = schaal > 0
        ? doek4.composite([{ input: await merk(Math.round(doek * schaal)), gravity: 'centre' }])
        : doek4;
    await met.png().toFile(path.join(OUT, bestand));
    return bestand;
}

await mkdir(OUT, { recursive: true });

const gemaakt = [
    // Het winkelicoon en de iOS-tegel: dicht vlak, want de App Store staat
    // geen doorzichtigheid toe.
    await plaat('icon-only.png', 1024, 0.64, BG),
    // Android zet voor- en achtergrond als losse lagen op elkaar.
    await plaat('icon-foreground.png', 1024, 0.62, LEEG),
    await plaat('icon-background.png', 1024, 0, BG),
    // De splash wordt op elk scherm bijgesneden vanuit het midden; vandaar
    // een ruim vierkant met een klein merk.
    await plaat('splash.png', 2732, 0.2, BG),
    // Geen aparte donkere huisstijl: op een toestel in donkere modus hoort
    // dezelfde warme achtergrond, niet een zwart vlak.
    await plaat('splash-dark.png', 2732, 0.2, BG),
];

console.log(gemaakt.join('\n'));
