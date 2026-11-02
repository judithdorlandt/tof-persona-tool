# Terugkoppeling — naam en woordmerk (fase 1, inventaris)

Datum: 2 november 2026 · branch `main` · stand na commit `a678942`.
In deze fase is niets gewijzigd. Dit bestand is het enige nieuwe bestand.

Twee begrippen die hieronder steeds terugkomen:

- **Web** = de webversie op team.persona-tool.nl. Die gaat live zodra er naar `main` gepusht wordt (Netlify).
- **Store** = de app in de App Store en Google Play. Die toont de code die in de laatste store-build zit. Een wijziging in de app is pas zichtbaar na een nieuwe build en een nieuwe indiening. De app gebruikt dezelfde `src/`, dus alles wat de app laat zien, vraagt een store-build.

Pagina's in de app (`src/config/platform.js`): landing, home, intro, quiz, results, library, historie, gesprek, privacy. Alles daarbuiten (teamomgeving, admin, Strategisch Kompas, team-PDF's, organisatielandschap) bestaat alleen op het web.

---

## 0. De beweringen uit de opdracht

| # | Bewering | Klopt? | Toelichting |
|---|---|---|---|
| a | `Nav.jsx` r. 139–145 toont "The Office *Factory*" met daaronder `nav.brandSub` ("Persona Team", web) of `nav.brandSubApp` ("Persona", app) | **Klopt** | Precies r. 139–145: `brandWord` "The Office" + `brandAccent` "Factory", daaronder `IS_NATIVE ? t.brandSubApp : t.brandSub`. NL en EN zijn gelijk (`src/i18n/copy/{nl,en}/nav.js:4–5`). **Aanvulling:** onder 820 px breed staat `.brandSub { display: none; }` (`Nav.module.css:238`). Op een telefoon is de tweede regel dus nergens te zien, ook niet in de app. "Persona" verschijnt in de app alleen op een iPad of een brede tablet. |
| b | "Persona Tool" als productnaam staat onder meer in `landing.js:2`, `kompasForms.js:21`, `shell.js:14`, `personaCardPdf.js`, `Results.jsx`, `StrategischKompas.jsx` en `werkplekmix.js` | **Deels** | Gebruikerstekst: `landing.js:2`, `kompasForms.js:21`, `shell.js:14`, `personaCardPdf.js` (r. 47, 65, 654) en `Results.jsx:127`, telkens in NL en EN. **`StrategischKompas.jsx` en `werkplekmix.js` hebben het alleen in codecommentaar** (r. 2). Niet genoemd maar wel gevonden: `public/index.html:18` (de `<title>`). |
| c | "De Persona-app" staat in `strategicCompass.js:170` | **Klopt** | NL `num: 'Module 01 · De Persona-app'`, EN `'Module 01 · The Persona app'`, allebei op r. 170. |
| d | Huisvesting als doelgroep in `strategicCompass.js` (r. 9, 38, 182) en in `teamIntro.js` ("Module 3 · Voor directie & huisvesting") | **Deels** | `strategicCompass.js` r. 9, 38 en 182 kloppen, in NL en EN. **`teamIntro.js` bevat die tekst niet meer.** Volgens het kopcommentaar zijn de module-kaarten op 21 okt 2026 verwijderd. In `src/` komt "Voor directie & huisvesting" nergens meer voor. |

---

## 1. Waar het woordmerk verschijnt

Kleuren uit `src/index.css`: `--tof-text` #1F1F1F, `--tof-text-muted` #666666, `--tof-accent-rose` #B05252.
Lettertypes: `--tof-font-heading` = Playfair Display en `--tof-font-body` = Inter.
**Geladen gewichten** (`src/index.js:9–16`): Inter 400/500/600/700, Playfair Display 400/500 en 400-/500-italic. **Playfair 300 wordt niet geladen.** Waar 300 gevraagd wordt, toont de browser 400.

| Plek | Wat er staat | Lettertype · gewicht · grootte · kleur | Web / app |
|---|---|---|---|
| **Nav**, regel 1 (`Nav.jsx:140–143`, `Nav.module.css:72–85`) | "The Office *Factory*" naast het TOF-logo (40 px, 34 px op mobiel) | Playfair Display, **gewicht 300 (feitelijk 400)**, 1.125rem (1rem onder 820 px), letterafstand −0.025em, #1F1F1F. "Factory" cursief in #B05252 | beide |
| **Nav**, regel 2 (`Nav.jsx:144`, `Nav.module.css:86–95`) | `nav.brandSub` "Persona Team" (web) / `nav.brandSubApp` "Persona" (app) | Inter 400, 12 px, kapitalen, letterafstand 0.18em, #666666. **Verborgen onder 820 px** | beide |
| **Landing / opstartscherm** (`Landing.jsx:67–70`, `Landing.module.css:54–66`) | Groot logo, daaronder "The Office *Factory*" en de ondertitel `landing.subtitle` | Playfair Display, **gewicht 300 (feitelijk 400)**, clamp(30px, 5vw, 56px), −0.025em, #1F1F1F. "Factory" cursief in #B05252 | beide. In de app is dit tegelijk het splash- en taalkeuzescherm (`isSplash`) |
| **Native splash** iOS (`ios/App/App/Assets.xcassets/Splash.imageset`, `LaunchScreen.storyboard`) en Android (`res/drawable*/splash.png`, bron `assets/splash.png`) | **Alleen het TOF-beeldmerk** (rose cirkel met F) op crème #F7F3EE. **Geen tekst** | — | alleen app |
| **Personakaart-PDF** (`utils/personaCardPdf.js`) | Kop: pil "PRIMAIRE PERSONA" + TOF-beeldmerk, zonder woordmerk. Eyebrow eronder: "NAAM · TOF Persona Tool" (zie §2) | Naam Inter SemiBold 8.6 pt #1F1B17; "· TOF Persona Tool" Inter 400 7.6 pt #8B8278. Slotbron achterkant: "TOF · The Office Factory" (`Results.jsx:160`) | beide (resultaatpagina) |
| **Teaminzicht-PDF** (`utils/teamInsightPDF.js`) | Kop: pil + beeldmerk, zonder woordmerk. Voet: beeldmerk + `footerTagline` "TOF Persona · The Office Factory" (r. 108/153) | Inter 400, 4.6 mm, #8B8278 | alleen web |
| **Teamdynamiek-PDF** (`utils/teamDynamicsPDF.js`) | Gelijk aan Teaminzicht. Voet: "TOF Persona · The Office Factory" (r. 114/152) | Inter 400, 4.8 mm, #8B8278 | alleen web |
| **Organisatielandschap-PDF**, omslag (`OL_Cover.jsx`, `copy.{nl,en}.js`) | Beeldmerk, eyebrow "TOF PERSONA", daaronder "Organisatielandschap" en de organisatienaam | Eyebrow Inter 600, 9 pt, letterafstand 0.45, #4D433D | alleen web |
| **Organisatielandschap-PDF**, voet p. 2–6 (`OL_Chrome.jsx:70`) | Beeldmerk + `brand` "TOF · The Office Factory" | Inter 400, 9 pt, #9A8E82 | alleen web |
| **Home-voet** (`Home.jsx:241`) | Beeldmerk (34 px) met lopende tekst "TOF Persona is ontwikkeld door The Office Factory…" (`home.js:28`). Dit is geen woordmerk | — | beide |
| **Browsertab** (`public/index.html:18`) | `<title>TOF Persona Tool — The Office Factory</title>` | — | web (in de app onzichtbaar) |

Opvallend:

- In de PDF's van het team en de organisatie staat al "TOF Persona · The Office Factory" of "TOF PERSONA". De Nav en het opstartscherm lopen achter.
- `public/manifest.json` staat nog op de CRA-standaard: `short_name: "React App"`, `name: "Create React App Sample"`. Wie de webversie aan een beginscherm toevoegt, krijgt die naam te zien.
- Het voorgestelde woordmerk vraagt "The Office Factory" in Inter 500 (fase 2). Inter 500 wordt al geladen. Playfair 400 en 400-italic ook.

---

## 2. Vindplaatsen van "Persona Tool", "Persona-app", "Persona App" en "Persona Test"

Zoekopdracht: niet hoofdlettergevoelig, in `src/`, met spatie of koppelteken. URL's met `persona-tool.nl` zijn weggelaten, want dat is het domein en dat blijft.

### 2a. Tekst die een gebruiker ziet

| Bestand:regel | Sleutel | Tekst (NL) | Tekst (EN) | Waar zichtbaar | Web / store |
|---|---|---|---|---|---|
| `i18n/copy/nl/landing.js:2` · `en/landing.js:2` | `landing.logoButtonLabel` | "Begin de Persona Tool" | "Start the Persona Tool" | aria-label van de logoknop op het opstartscherm (voor schermlezers) | **store** + web |
| `i18n/copy/nl/shell.js:14` · `en/shell.js:14` | `shell.…mailSubject` | "Foutmelding Persona Tool" | "Error report Persona Tool" | onderwerpregel van de mail vanaf het foutscherm (`ErrorBoundary.jsx:135`) | **store** + web |
| `utils/personaCardPdf.js:47` (nl) · `:65` (en) | `CARD_COPY.{nl,en}.roleFallback` | "TOF Persona Tool" | "TOF Persona Tool" | eyebrow op de personakaart als er geen rol is | **store** + web |
| `components/Results.jsx:127` | `pdfData.voorkant.rol` (vaste tekst, geen sleutel) | "TOF Persona Tool" | (zelfde, taalloos) | zelfde eyebrow. Results geeft dit altijd mee als er geen rol of teamgrootte is, dus in de praktijk wint dit van `roleFallback` | **store** + web |
| `utils/personaCardPdf.js:654` | `pdf.setProperties({ creator })` | "TOF Persona Tool" | (taalloos) | PDF-eigenschappen, "Gemaakt met" in Acrobat/Voorvertoning | **store** + web |
| `i18n/copy/nl/kompasForms.js:21` · `en/kompasForms.js:21` | `kompasForms.dashboard.backToTool` | "← Terug naar Persona Tool" | "← Back to the Persona Tool" | terugknop in het Strategisch-Kompas-dashboard (`TeamStrategic.jsx:92`) | web |
| `i18n/copy/nl/strategicCompass.js:170` · `en/…:170` | `strategicCompass.stack[0].num` | "Module 01 · De Persona-app" | "Module 01 · The Persona app" | Strategisch Kompas, blok "Waar Module 4 in past" | web |
| `i18n/copy/nl/native.js:196` · `en/native.js:192` | `native.…subject` (fallback zonder persona) | "Ik heb de Persona-test gedaan — en dit wil ik met het team doen" | "I took the Persona test — and I want to do this with the team" | onderwerpregel van de mail aan je leidinggevende, in de app | **store** |
| `i18n/copy/nl/native.js:201` · `en/native.js:197` | `native.…body` (eerste regel) | "Ik heb de Persona-test gedaan en werd er even stil van." | "I took the Persona test and it genuinely stopped me for a moment." | mailtekst aan je leidinggevende, in de app | **store** |
| `public/index.html:18` (buiten `src/`) | `<title>` | "TOF Persona Tool — The Office Factory" | — | browsertab | web (ook in de app-build, maar daar onzichtbaar) |

"Persona-test" is geen productnaam maar een omschrijving van de test. Ik noem het hier omdat de opdracht erom vraagt. Of het moet veranderen (bijv. "de test in TOF Persona"), beslis jij.

**Al goed, ter info.** Hier staat de nieuwe naam al, maar in EN met lidwoord ervoor. Het voorstel in fase 2 zegt "zonder lidwoord":

| Bestand:regel | Sleutel | Tekst |
|---|---|---|
| `en/quizInApp.js:16` | `quizInApp.lead` | "The test lives in the TOF Persona app — …" |
| `en/home.js:6` | `home.heroLead` | "… takes the test in the TOF Persona app." |
| `en/home.js:15` | `home.offerCard.title` | "The TOF Persona app" |
| `en/teamDashboard.js:48` · `en/admin.js:108, 110` | uitnodigingsteksten | "download the TOF Persona app" / "in the TOF Persona app" |

De NL-tegenhangers ("de app TOF Persona") zetten de naam al zonder lidwoord. In het Engels is "the TOF Persona app" gewoon goed Engels. Mijn advies: laten staan, tenzij je het anders wilt.

### 2b. Alleen codecommentaar (mag blijven)

| Bestand:regel | Tekst |
|---|---|
| `config/platform.js:11` | "… stap 1, de individuele persona-tool, …" |
| `components/StrategischKompas.jsx:2` | "StrategischKompas.jsx — Module 3 in de Persona Tool." |
| `team/werkplek/werkplekmix.js:2` | "Persona-werkplekmix voor de TOF Persona Tool." |
| `utils/personaCardPdf.js:195` | "Eyebrow: "JUDITH · TOF Persona Tool" — …" |
| `i18n/copy/{nl,en}/nav.js:2–3` | uitleg bij `brandSub` / `brandSubApp` (verdwijnt als die sleutels vervallen) |

---

## 3. Huisvesting / real estate / workplace planning als doelgroep, en modulelabels

### 3a. Doelgroep

"real estate" en "workplace planning" komen in `src/` niet voor. In EN heet het "workplace leads" / "workplace". Alles staat in de Strategisch-Kompas-pagina (`StrategischKompas.jsx`, alleen web):

| Bestand:regel | Sleutel | NL | EN |
|---|---|---|---|
| `strategicCompass.js:9` | `hero.sub` | "Voor MT, bestuur en huisvesting. Externe trends gekoppeld aan …" | "For management teams, boards and workplace leads. External trends …" |
| `strategicCompass.js:38` | `compare…rows[Doelgroep].cells[1]` (kolom Module 3) | "Directie, HR, huisvesting" | "Leadership, HR, workplace leads" |
| `strategicCompass.js:182` | `stack[2].body` (Module 03 · Organisatielandschap) | "… met duiding voor directie, HR en huisvesting." | "… with interpretation for leadership, HR and workplace." |

Niet als doelgroep, dus buiten scope: `experimental/quizTest/quizTestData.js:106` ("huisvestingsadvies", commentaar) en `team/werkplek/werkplekProfielLogic.js:11` ("vastgoedadvies", commentaar).

### 3b. Modulelabels in teksten die een klant ziet

Alle onderstaande plekken zijn alleen web (Strategisch Kompas en zijn formulieren). NL en EN staan op dezelfde regel.

| Bestand:regel | Sleutel | NL | EN |
|---|---|---|---|
| `strategicCompass.js:5` | `hero.eyebrow` | "Module 04 · Het Strategisch Kompas" | "Module 04 · The Strategic Compass" |
| `strategicCompass.js:15` | (sectie-eyebrow) | "Waarom Module 4" | "Why Module 4" |
| `strategicCompass.js:22` | `compareHeads` | "Module 2", "Module 3", "Module 4" | idem |
| `strategicCompass.js:118` | `steps[2].meta` | "Uit Module 2 + 3" | "From Module 2 + 3" |
| `strategicCompass.js:161` | `stackSection.eyebrow` | "Waar Module 4 in past" | "Where Module 4 fits" |
| `strategicCompass.js:165` | `stackSection.lead` | "Module 4 staat op de schouders van de modules ervoor. …" | "Module 4 stands on the shoulders of …" |
| `strategicCompass.js:170` | `stack[0].num` | "Module 01 · De Persona-app" | "Module 01 · The Persona app" |
| `strategicCompass.js:175` | `stack[1].num` | "Module 02 · Teaminzicht & Dynamiek" | "Module 02 · Team Insight & Dynamics" |
| `strategicCompass.js:180` | `stack[2].num` | "Module 03 · Organisatielandschap" | "Module 03 · Organisation landscape" |
| `strategicCompass.js:185` | `stack[3].num` | "Module 04 · Strategisch Kompas" | "Module 04 · Strategic Compass" |
| `kompasForms.js:19` | `dashboard.eyebrow` | "Module 4 · Strategisch Kompas" | "Module 4 · Strategic Compass" |
| `kompasForms.js:73` | `intake.eyebrow` | "Module 4 · Strategisch Kompas · Intake" | "… · Intake" |
| `kompasForms.js:78` | `intake.intro` | "… persona-data uit Module 2 en 3 …" | "… persona data from Modules 2 and 3 …" |
| `kompasForms.js:153` | `intake.done.eyebrow` | "Module 4 · Strategisch Kompas" | idem |
| `kompasForms.js:158` | `intake.done.back` | "← Terug naar Module 4" | "← Back to Module 4" |
| `kompasForms.js:164` | `review.eyebrow` | "Module 4 · Strategisch Kompas · Check na 3 maanden" | "… · Three-month check" |
| `kompasForms.js:208` | `review.done.eyebrow` | "Module 4 · Strategisch Kompas" | idem |
| `kompasForms.js:211` | `review.done.back` | "← Terug naar Module 4" | "← Back to Module 4" |

Let op:

- **Twee nummeringen door elkaar.** In de klantteksten is het Kompas Module **4** (app = 1, Inzicht & Dynamiek = 2, Organisatielandschap = 3). In codecommentaar en in `supabase.js`/`access.js` heet het Kompas nog Module **3** en Inzicht Module 1. Dat is alleen commentaar en zie je niet.
- Het organisatielandschap heeft al geen modulenummer meer (`copy.nl.js:19`, besluit J1). De commentaren in `OL_Chrome.jsx:6` en `OL_Cover.jsx:7, 73` noemen nog "MODULE 3 · ORGANISATIELANDSCHAP", maar de echte eyebrow is "TOF PERSONA". Dat is alleen commentaar.
- In de app (stores) komen geen modulelabels voor.

---

## 4. Web of store, per wijziging uit fase 2

| Wijziging (voorstel fase 2) | Bestanden | Raakt | Waarom |
|---|---|---|---|
| Nieuw woordmerk "TOF *Persona*" + "The Office Factory" in de Nav; `brandSub`/`brandSubApp` vervallen | `Nav.jsx`, `Nav.module.css`, `nav.js` (nl/en) | **web + store** | De Nav staat in beide |
| Zelfde woordmerk op het opstartscherm | `Landing.jsx`, `Landing.module.css` | **web + store** | In de app is dit het splash- en taalscherm. Niet expliciet in het voorstel; jij beslist of het meegaat |
| Native splash (iOS/Android) | — | geen | Alleen beeldmerk, geen tekst. Hoeft niet te veranderen |
| `landing.logoButtonLabel` → TOF Persona | `landing.js` | **web + store** | |
| `shell.mailSubject` → TOF Persona | `shell.js` | **web + store** | Foutscherm zit in beide |
| Personakaart-eyebrow + PDF-creator → TOF Persona | `Results.jsx:127`, `personaCardPdf.js:47, 65, 654` | **web + store** | Personakaart wordt in de app gemaakt |
| "Persona-test" in de mail aan je leidinggevende (als je dat wilt) | `native.js` (nl/en) | **alleen store** | Alleen in de app |
| `kompasForms.dashboard.backToTool` → TOF Persona | `kompasForms.js` | **alleen web** | |
| "De Persona-app" → TOF Persona; modulenummers weg | `strategicCompass.js`, `kompasForms.js` | **alleen web** | |
| Doelgroeplabels zonder huisvesting ("Voor de organisatie", "Voor de koers") | `strategicCompass.js` | **alleen web** | |
| `<title>` en `manifest.json` | `public/index.html`, `public/manifest.json` | **web** (zitten ook in de app-build, maar zijn daar niet zichtbaar) | |
| Team- en organisatie-PDF's | — | geen | Staan al op "TOF Persona · The Office Factory" / "TOF PERSONA" |

Kort samengevat: de **naam in de Nav, het opstartscherm, de personakaart, het foutscherm en de schermlezerlabel** vragen een store-build (dus mee met de versie na 1.0.4). **Strategisch Kompas, de doelgroepen en de modulelabels** zijn alleen web en kunnen live zodra jij "push" zegt.

## Open vragen voor Judith

1. Gaat het nieuwe woordmerk ook op het opstartscherm (`Landing.jsx`), of alleen in de Nav?
2. "Persona-test" in de mail uit de app: laten staan of herschrijven?
3. EN "the TOF Persona app": laten staan (mijn advies) of herschrijven zonder lidwoord?
4. `manifest.json` ("React App") meteen meenemen?
5. Nav-regel 2: het voorstel laat die op mobiel wegvallen, zoals nu. In de app betekent dat: op een telefoon nooit "The Office Factory" in de balk. Is dat de bedoeling?

---

# Fase 2 — uitgevoerd op 2 november 2026 (niet gecommit, niet gepusht)

Uitgevoerd na Judiths akkoord en besluiten van 2 nov, doorgegeven via de marketingsessie. Alles staat als ongecommitte wijziging op `main`. Judith beslist later over "push".

## Woordmerk

| Plek | Oud | Nieuw | Web / store |
|---|---|---|---|
| Nav, regel 1 (`Nav.jsx`, `Nav.module.css`) | "The Office *Factory*", Playfair 300 (feitelijk 400) | "TOF *Persona*", Playfair Display 400. "Persona" cursief in `--tof-accent-rose` | web + store |
| Nav, regel 2 | `nav.brandSub` "Persona Team" (web) / `nav.brandSubApp` "Persona" (app), Inter 400, kapitalen, letterafstand 0.18em | "The Office Factory", Inter 500, 12 px, gewone letters, geen letterafstand, `--tof-text-muted`. Op web en app gelijk. Onder 820 px verborgen, zoals voorheen | web + store |
| `nav.brandSub`, `nav.brandSubApp` (`i18n/copy/{nl,en}/nav.js`) | "Persona Team" / "Persona" | **vervallen**, samen met het commentaar erboven | web + store |
| Landing / opstartscherm (`Landing.jsx`, `Landing.module.css`) | "The Office *Factory*", feitelijk in **Inter** (zie hieronder) | "TOF *Persona*", Playfair Display 400, met eronder "The Office Factory" (`.titleSub`, Inter 500, 12 px, `--tof-text-muted`). Regel 2 blijft ook op mobiel staan | web + store |

**Gevonden en opgelost.** `index.css:92` zet elke `span` op de body-font (Inter), en die regel wint van overerving. Daardoor stond het woordmerk op het opstartscherm al die tijd in Inter, en in de Nav het eerste woord ook. `.titleSpace`, `.titleAccent` en `.brandWord` hebben nu `font-family: inherit`, net als in de rest van de code. Gecontroleerd met getComputedStyle: alle drie staan nu op Playfair Display 400.

## Teksten — sleutel: oud → nieuw

### Naam "TOF Persona"

| Bestand · sleutel | Oud (NL / EN) | Nieuw (NL / EN) | Web / store |
|---|---|---|---|
| `landing.js` · `logoButtonLabel` | "Begin de Persona Tool" / "Start the Persona Tool" | "Begin TOF Persona" / "Start TOF Persona" | web + store |
| `shell.js` · `mailSubject` | "Foutmelding Persona Tool" / "Error report Persona Tool" | "Foutmelding TOF Persona" / "Error report TOF Persona" | web + store |
| `Results.jsx:127` · `pdfData.voorkant.rol` (fallback) | "TOF Persona Tool" | "TOF Persona" | web + store |
| `personaCardPdf.js:47, 65` · `CARD_COPY.{nl,en}.roleFallback` | "TOF Persona Tool" | "TOF Persona" | web + store |
| `personaCardPdf.js:654` · PDF `creator` | "TOF Persona Tool" | "TOF Persona" | web + store |
| `kompasForms.js` · `dashboard.backToTool` | "← Terug naar Persona Tool" / "← Back to the Persona Tool" | "← Terug naar TOF Persona" / "← Back to TOF Persona" | web |
| `native.js` · mail aan je leidinggevende, `subject` (zonder persona) | "Ik heb de Persona-test gedaan — en dit wil ik met het team doen" / "I took the Persona test — and I want to do this with the team" | "Ik heb de test in TOF Persona gedaan — en dit wil ik met het team doen" / "I took the test in TOF Persona — and I want to do this with the team" | **alleen store** |
| `native.js` · zelfde mail, `body` eerste regel | "Ik heb de Persona-test gedaan en werd er even stil van." / "I took the Persona test and it genuinely stopped me for a moment." | "Ik heb de test in TOF Persona gedaan en werd er even stil van." / "I took the test in TOF Persona and it genuinely stopped me for a moment." | **alleen store** |
| `public/index.html` · `<title>` | "TOF Persona Tool — The Office Factory" | "TOF Persona — The Office Factory" | web |
| `public/manifest.json` · `name`, `short_name` | "Create React App Sample", "React App" | "TOF Persona", "TOF Persona" | web |

EN "the TOF Persona app" (`quizInApp`, `home`, `teamDashboard`, `admin`) blijft staan, zoals besloten.

### Strategisch Kompas — `strategicCompass.js` (NL / EN, alleen web)

| Sleutel | Oud | Nieuw |
|---|---|---|
| `hero.eyebrow` | "Module 04 · Het Strategisch Kompas" / "Module 04 · The Strategic Compass" | "TOF Persona · Het Strategisch Kompas" / "TOF Persona · The Strategic Compass" |
| `hero.sub` (begin) | "Voor MT, bestuur en huisvesting." / "For management teams, boards and workplace leads." | "Voor MT en bestuur." / "For management teams and boards." (rest van de zin ongewijzigd) |
| `why.eyebrow` | "Waarom Module 4" / "Why Module 4" | "Waarom het Kompas" / "Why the Compass" |
| `why.compareHeads` | "Module 2", "Module 3", "Module 4" | "TOF Persona Team", "Organisatielandschap", "Strategisch Kompas" / "TOF Persona Team", "The Organisation Landscape", "The Strategic Compass" |
| `why.compareRows[Doelgroep].cells[1]` | "Directie, HR, huisvesting" / "Leadership, HR, workplace leads" | "Directie, HR" / "Leadership, HR" |
| `steps[2].meta` | "Uit Module 2 + 3" / "From Module 2 + 3" | "Uit de teambeelden en het Organisatielandschap" / "From the team pictures and the Organisation Landscape" |
| `stackSection.eyebrow` | "Waar Module 4 in past" / "Where Module 4 fits" | "Waar het Kompas in past" / "Where the Compass fits" |
| `stackSection.lead` (eerste zin) | "Module 4 staat op de schouders van de modules ervoor." / "Module 4 stands on the shoulders of the modules before it." | "Het Kompas staat op de schouders van wat ervoor komt." / "The Compass stands on the shoulders of what comes before it." (aangepast op Judiths akkoord van 2 nov, vóór de push) |
| `stack[0].num` | "Module 01 · De Persona-app" / "Module 01 · The Persona app" | "01 · De app" / "01 · The app" |
| `stack[1].num` | "Module 02 · Teaminzicht & Dynamiek" / "Module 02 · Team Insight & Dynamics" | "02 · TOF Persona Team" |
| `stack[2].num` | "Module 03 · Organisatielandschap" / "Module 03 · Organisation landscape" | "03 · Organisatielandschap" / "03 · The Organisation Landscape" |
| `stack[3].num` | "Module 04 · Strategisch Kompas" / "Module 04 · Strategic Compass" | "04 · Strategisch Kompas" / "04 · The Strategic Compass" |
| `stack[2].body` (slot) | "… voor directie, HR en huisvesting." / "… for leadership, HR and workplace." | "… voor directie en HR." / "… for leadership and HR." |

### Strategisch Kompas — `kompasForms.js` (NL / EN, alleen web)

| Sleutel | Oud | Nieuw |
|---|---|---|
| `dashboard.eyebrow`, `intake.done.eyebrow`, `review.done.eyebrow` | "Module 4 · Strategisch Kompas" / "Module 4 · Strategic Compass" | "Strategisch Kompas" / "Strategic Compass" |
| `intake.eyebrow` | "Module 4 · Strategisch Kompas · Intake" / "… · Intake" | "Strategisch Kompas · Intake" / "Strategic Compass · Intake" |
| `review.eyebrow` | "Module 4 · Strategisch Kompas · Check na 3 maanden" / "… · Three-month check" | "Strategisch Kompas · Check na 3 maanden" / "Strategic Compass · Three-month check" |
| `intake.done.back`, `review.done.back` | "← Terug naar Module 4" / "← Back to Module 4" | "← Terug naar het Kompas" / "← Back to the Compass" |
| `intake.intro` | "… persona-data uit Module 2 en 3 …" / "… persona data from Modules 2 and 3 …" | "… persona-data uit de teambeelden en het Organisatielandschap …" / "… persona data from the team pictures and the Organisation Landscape …" |

Na de wijziging staan "Module 1–4", "huisvesting", "workplace leads", "Persona Tool", "Persona-test" en "Persona-app" alleen nog in codecommentaar en in de interne sleutel `MODULE2_LEGACY_KEY` (`access.js`).

**Niet aangeraakt, wel om naar te kijken.** `stackSection.titleLead` zegt nog "Vier modules, één *verhaal*." / "Four modules, one *story*." Zonder nummer, maar het woord "modules" staat er nog. Dat zat niet in de opdracht en is ook bij de push niet gewijzigd.

## Web of store

- **Store-build nodig** (mee met de versie na 1.0.4): het woordmerk in Nav en Landing, `landing.logoButtonLabel`, `shell.mailSubject`, de personakaart (`Results.jsx`, `personaCardPdf.js`) en de mail in `native.js`. Dat laatste is alleen app.
- **Alleen web** (live na "push"): `strategicCompass.js`, `kompasForms.js`, `public/index.html`, `public/manifest.json`. De `<title>` en het manifest gaan ook mee in de app-build, maar zijn daar niet zichtbaar.
- Let op: na een push staat het nieuwe woordmerk ook meteen op team.persona-tool.nl. De apps in de stores tonen tot de volgende versie nog "The Office Factory".

## Controle

- **Build:** `CI=false GENERATE_SOURCEMAP=false npx react-scripts build` → *Compiled successfully* (opnieuw gedraaid na de span-fix).
- **ESLint** op de gewijzigde bestanden: geen meldingen.
- **Tests:** `CI=true npx react-scripts test --watchAll=false` → 1 suite, **9/9 geslaagd** (`access.test.js`, de namenregel).
- **Visueel** (preview `persona-app-verify`, poort 3002):
  - Landing, desktop: "TOF *Persona*" in Playfair, met "The Office Factory" klein eronder.
  - Landing, 375 px: idem, regel 2 blijft staan.
  - Nav, 1024 px: twee regels. Computed: titel Playfair 400 18 px #1F1F1F, "Persona" cursief rgb(176, 82, 82), regel 2 Inter 500 12 px #666666, geen kapitalen of letterafstand.
  - Nav, 375 px: alleen "TOF *Persona*" naast het logo.
  - App-modus (poort 3003) niet apart bekeken. Nav en Landing gebruiken daar dezelfde code; alleen de vervallen `brandSubApp` maakte verschil.
- Grenzen: geen prijzen, geen "gratis" of toestelclaim toegevoegd. Teamdrempel, namenregel en dashboard-rekenregels niet aangeraakt.

## `git status` (na fase 2)

```
 M public/index.html
 M public/manifest.json
 M src/components/Landing.jsx
 M src/components/Landing.module.css
 M src/components/Nav.jsx
 M src/components/Nav.module.css
 M src/components/Results.jsx
 M src/i18n/copy/en/kompasForms.js
 M src/i18n/copy/en/landing.js
 M src/i18n/copy/en/native.js
 M src/i18n/copy/en/nav.js
 M src/i18n/copy/en/shell.js
 M src/i18n/copy/en/strategicCompass.js
 M src/i18n/copy/nl/kompasForms.js
 M src/i18n/copy/nl/landing.js
 M src/i18n/copy/nl/native.js
 M src/i18n/copy/nl/nav.js
 M src/i18n/copy/nl/shell.js
 M src/i18n/copy/nl/strategicCompass.js
 M src/utils/personaCardPdf.js
?? docs/terugkoppeling-naam-en-woordmerk.md
```

Niets gecommit, niets gepusht.
