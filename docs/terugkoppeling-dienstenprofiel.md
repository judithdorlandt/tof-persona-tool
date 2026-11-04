# Terugkoppeling: dienstenprofiel "Wat dit team naar kantoor trekt"

Opdracht van 4 november 2026 (hoofdsessie marketingteam).
Bronnen: `tof-marketingteam/toetsen/2026-11-04-ID-001-dienstenprofiel-v2.md` (leidend), `ontwerp/2026-11-04-dienstenprofiel.md` + `.html`.

---

## Ronde 1: inventaris (4 november 2026)

Er is niets gewijzigd in de code. Branch: `main`, schoon (op het ongevolgde `docs/prompt-stores-1.0.5.md` na). Dit bestand is het enige nieuwe bestand.

### 1. Bevestigde paden, functies en sleutels

| Genoemd in de opdracht | Gevonden | Klopt? |
|---|---|---|
| `src/team/werkplek/werkplekmix.js`, `PERSONA_WERKPLEKMIX` | Er staan 8 persona-id's in: maker, groeier, presteerder, denker, verbinder, teamspeler, zekerzoeker, vernieuwer. Die zijn gelijk aan `ARCHETYPE_ORDER` in `data.js:18–26`. | ja |
| `aantallenUitAggregate` | `werkplekProfielLogic.js:58`. Telt per persona het aantal mensen dat die persona primair heeft (`personasByPrimary`). Het gemiddelde is score / totaalLeden (`:85–87`). | ja |
| `dominantPersonas` | `src/utils/TeamAggregation.js:46`. De opdracht noemt `:47`, de functie begint één regel eerder. Hij geeft alle persona's die gelijk staan op het hoogste primaire aantal. De chip gebruikt `dominantNames` (`:54`), en `TeamDashboard.jsx:197` volgt dezelfde telling. | ja |
| Volgorde van de chip | `personasByPrimary` wordt gesorteerd op aantal (`TeamAggregation.js:110`). Die sortering is stabiel, dus bij gelijke stand geldt de archetypevolgorde uit `data.js`. | ja |
| `MIN_TEAM_RESPONSES` | `src/utils/access.js:45`, waarde 5 | ja |
| `QUIZTEST_ENABLED` | `src/experimental/featureFlag.js:25` geeft een standaardwaarde plus `REACT_APP_…` | ja |
| `WerkplekProfielInline.jsx`, "Let op de balans" | `SignalenBlok` is het laatste kind van de grid (`:91–93`). Het blok verschijnt alleen als er signalen zijn. | ja, zie afwijking b |
| Stijlen `SecondaryItem`, `BelowAverageNote` | `:288–339`, `:345–416` | ja, zie afwijking e |
| `TYPE.subhead`, `TYPE.eyebrow`, `TYPE.meta` | `src/ui/tokens.js:63`, `:92`, `:101` | ja |
| `TeamDashboard.jsx`, `buildTiles`, `tegelKern` | `buildTiles` staat op `:81`, de Werkplek-tegel op `:97–113`, `tegelKern` op `:105` | ja |
| `Admin.jsx:1033` | `buildTiles(teamDashboard, { workplaceProfile, lang })`, dus hetzelfde paneel | ja |
| `ProfileScreen.jsx` restlijst Bricks | `:337–378` (label `bricksRestLabel`), `LABEL` op `:486–492`. De persona staat in de prop `primary`, met `primary.id`. | ja |
| `ResultsProfileCard.jsx` items Bricks | `:404–470` staan binnen de `InnerCard` (`:395–472`), `INFO_LABEL_STYLE` bovenaan het bestand. De persona staat in `primary` (`getArchetype` in `Results.jsx:76`). | ja |
| `copy/en/archetypes.js` namen | Maker, Grower, Achiever, Thinker, Connector, Team Player, Stabiliser, Innovator | ja, gelijk aan v2 punt 7.5 |
| Testopzet | Jest via `react-scripts test`. Er is al `src/utils/access.test.js`. | ja |

**Naam van het copy-bestand.** Ik kies `servicesProfile`, dus `src/i18n/copy/nl/servicesProfile.js` en `src/i18n/copy/en/servicesProfile.js`. Dat volgt de conventie: Engelse camelCase-namespaces naast `workplaceProfile`. Elk bestand wordt opgenomen in `copy/{nl,en}/index.js`, zodat je het opvraagt met `useCopy().servicesProfile`.

### 2. Afwijkingen en punten waar jouw besluit nodig is

**a. Kop 1 laat vaak maar één zin zien.** "Dominant" betekent alleen de werkstijl(en) met het hoogste primaire aantal, en dus níet de top drie. Met de rekenvoorbeelden:
- één van elke werkstijl: alle acht staan gelijk. De eerste drie in de volgorde van de chip zijn Maker, Groeier en Presteerder.
- 3 Verbinders, 1 Teamspeler, 1 Denker: alleen Verbinder, dus **één** zin.
- 2 Presteerders, 2 Denkers, 1 Zekerzoeker: Presteerder en Denker, dus twee zinnen.

Dit is precies wat v2 punt 6 vraagt ("dezelfde telling"). Ik bouw het zo, tenzij je het anders wilt.

Een gevolg om te weten: bij een team waarin iedereen een andere werkstijl heeft, bepaalt de vaste archetypevolgorde welke drie zinnen er komen. Dat gebeurt dus niet op inhoud. De chip doet hetzelfde.

**b. De drempel geldt bij beheerders niet.** `TeamDashboard.jsx:231` laat beheerders (`isAdminAccess()`) het teambeeld ook onder vijf profielen zien. "Net als de rest van het teambeeld" zou betekenen dat een beheerder de dienstenlaag ook bij drie mensen ziet. **Mijn voorstel** is dat de laag zelf óók controleert op ten minste `MIN_TEAM_RESPONSES` profielen met een werkstijl. Dat kost één regel en is strenger. Ik tel daarvoor de som van de primaire aantallen, en dat is in de praktijk gelijk aan `countCompleteProfiles`.

**c. Gelijke stand op precies 0,25.** In kommagetallen kan 2,00 − 1,75 net onder 0,25 uitkomen. Ik vergelijk daarom met een kleine marge (1e-9), zodat een sprong van precies 0,25 meetelt. Zo staat het ook in v2: "minstens 0,25".

**d. Ruimte op mobiel.** Het ontwerp vraagt 40 px boven en onder de laaggrens, en op mobiel 24. Op mobiel is de gridgap al 16 px, dus `marginTop: SPACING.lg` geeft 32 px boven de lijn. Om op 24 uit te komen gebruik ik op mobiel `marginTop: SPACING.sm` (8 px). Dit is een kleine correctie in de uitvoering, niet in het beeld.

**e. Stijlen hergebruiken.** `SecondaryItem` en `BelowAverageNote` zijn lokale functies die vastzitten aan de werkplekteksten en aan `BandBadge`. Die kan ik niet hergebruiken zonder ze te wijzigen, en het werkplekprofiel blijft onaangeraakt. Ik neem daarom hun maten letterlijk over (lettergrootte, lijnkleur, padding, raster) in een nieuwe component `DienstenLaag.jsx`. Er komen geen nieuwe tokens of kleuren bij.

**f. Voorbeelden als lijst.** Het ontwerp splitst de voorbeelden op de komma's van v2 punt 4 en zet ze aan elkaar met " · ". De woorden blijven teken voor teken gelijk. Alleen het scheidingsteken op het scherm wordt " · " in plaats van ", ". "vieringen en mijlpalen" en "celebrations and milestones" blijven één item, en net zo "pakketjes en kluisjes" en "parcels and lockers".

**g. Plek op het web.** Het ontwerp zegt "vóór de sluitende `</div>` op `:471`". Dat is de binnengrid van de drie items. Ik zet het blok als laatste kind in die grid, zodat het dezelfde gap van 10 px krijgt. Het resultaat is hetzelfde.

**h. Preview zonder deelnemersdata.** Voor de screenshots in ronde 2 heb ik verzonnen samenstellingen nodig, zoals de rekenvoorbeelden. **Mijn voorstel:** een lokale, niet gecommitte override die alleen in de preview draait. Het teamdashboard leest dan in plaats van de Supabase-antwoorden een verzonnen lijst van 5–8 rijen met alleen `primary_archetype`. Die override haal ik weg vóór de commit, en in de terugkoppeling zet ik het bewijs dat hij weg is. Het demoteam (`DEM-DEM-26-0K8M`) gebruik ik niet, omdat ik de herkomst van die 17 rijen niet kan garanderen.

### 3. Rekenvoorbeelden, vooraf nagerekend

Ik heb de matrix uit v2 punt 5 en de regel uit punt 6 nagerekend in een los script, buiten de app:

| Samenstelling | Rangorde (IT niet meegeteld) | Kop 2 | Helpt ook |
|---|---|---|---|
| 1 × elke werkstijl | Ontmoeting 2,13 · Focus 2,00 · Eten 1,88 · Leren 1,88 · Gemak 1,88 · Ontvangst 1,75 · Welzijn 1,63 | geen uitgesproken dienst | alle zeven, in deze volgorde |
| 3 Verbinder, 1 Teamspeler, 1 Denker | Ontmoeting 2,80 · Eten 2,60 · Ontvangst 2,40 · Welzijn 2,00 · Leren 1,80 · Focus 1,40 · Gemak 1,40 | Ontmoeting, Eten, Ontvangst | Welzijn, Leren, Focus, Gemak |
| 2 Presteerder, 2 Denker, 1 Zekerzoeker | Focus 3,00 · Gemak 2,60 · Welzijn 2,00 · Ontvangst 1,60 · Leren 1,60 · Eten 1,40 · Ontmoeting 1,40 | Focus, Gemak, Welzijn | Ontvangst, Leren, Eten, Ontmoeting |

Alle drie zijn gelijk aan de verwachting in de opdracht. In ronde 2 komen ze erin als Jest-test.

### 4. Controles

**Controle 1: "Aanvullend" / "Additional" (`workplaceProfile.js:65`, `label`).** Dit label is nog maar op één plek zichtbaar:
- **`/team/werkplekprofiel` (EN `/team/workplace-profile`), `src/team/werkplek/WerkplekProfiel.jsx`.** `VolledigeBehoefte` toont per band een `BandGroep` (`:228–231`) met een `BandBadge` (`:331–350`). Die toont `bandCopy.label`, dus "AANVULLEND" / "ADDITIONAL". De route bestaat (`App.js:427`, `i18n/routes.js:48/75`), maar nergens in de app linkt iets ernaar. Je komt er alleen door het adres zelf in te typen.
- **Niet zichtbaar** in het Werkplek-paneel (`WerkplekProfielInline.jsx:366` gebruikt `kort`, "Beperkt nodig"), in het Organisatielandschap (`organisatieAggregation.js:280`, `kort`) of in de Teaminzicht-PDF. In de PDF gebruikt band 3 `kort` (`teamInsightPDF.js:759`). `bandLabel()` (`:636`) wordt alleen gebruikt voor de hero (`:681`) en voor kern- en steunitems (`:734`). De hero kan wiskundig nooit band 3 zijn: elke persona telt over de acht typen samen 14–16 punten op, dus het hoogste type komt gemiddeld op ten minste 1,75, boven de grens van 1,67.
- `NIVEAU_LABEL` in `werkplekmix.js:121` ('aanvullend') wordt nergens gebruikt.

Ik heb niets gewijzigd.

**Controle 2: de kop van `src/i18n/copy/nl/workplaceProfile.js`.** Bevestigd. "het experimentele werkplekbehoefteprofiel" staat alleen in het blokcommentaar (`:1–3`) en komt niet op een scherm. Hetzelfde geldt voor `en/workplaceProfile.js:1–3`. Ook de kop van `featureFlag.js:1–6` begint met "EXPERIMENTEEL", maar meldt zelf dat het werkplekprofiel vast aan staat. Ook dat is alleen commentaar.

**Controle 3: lengte van het Werkplek-paneel op 375 px.** Dit is een schatting, geen meting. De preview kan de schets niet meten, omdat de schets een lokaal bestand is buiten de projectmap. Echte screenshots komen in ronde 2.
- Uitgangspunt: een tekstbreedte van ongeveer 300 px (375 − paginamarge − paneelpadding 2 × 22). Inter 13–14 geeft ongeveer 45 tekens per regel, Playfair 20 ongeveer 28.
- Huidig paneel (hero, 3–5 kern- en steunplekken in één kolom met chips, "Beperkt nodig", 1–2 signalen): ongeveer **1.100–1.400 px**.
- Nieuwe laag, normaal (3 diensten):
  - laaggrens 48;
  - titel 50 (twee regels);
  - kop 1 met één zin ongeveer 120, met drie zinnen ongeveer 320;
  - kop 2 met drie diensten ongeveer 520 (per dienst: naam, wie, 2 regels uitleg en 2 regels voorbeelden, samen ongeveer 160);
  - Helpt ook (2 rijen) 100;
  - IT-voetregel 60;
  - disclaimer 65;
  - gaps 80.
  - Samen ongeveer **1.050–1.250 px**.
- Nieuwe laag bij "geen uitgesproken dienst": ongeveer **900 px**. Kop 1 heeft dan meestal drie zinnen, kop 2 alleen de toestandstekst en Helpt ook vier rijen.
- **Totaal: het paneel wordt ongeveer twee keer zo lang, van 1,5 naar ongeveer 3 schermhoogtes van een telefoon (812 px).** De laag begint dus pas onder de vouw van het tweede scherm. Volgens het ontwerp is dat zo bedoeld: er komt geen eigen tegel. Ik meld het wel, omdat "compact op 375 px" eerder gaat over het rustige beeld per blok dan over de totale lengte.

### 5. Plan per bestand (ronde 2, na "ga bouwen")

Ik werk op de branch `feature/dienstenprofiel` en maak per stap een commit. Ik push niet.

| # | Bestand | Wat |
|---|---|---|
| 1 | `src/experimental/featureFlag.js` | Ik voeg `DIENSTENPROFIEL_ENABLED` toe, met `DIENSTENPROFIEL_DEFAULT = false` en override via `REACT_APP_DIENSTENPROFIEL` ('1'/'true'), naar het patroon van `QUIZTEST_ENABLED`. De bestaande regels blijven ongewijzigd. |
| 2 | `src/team/werkplek/dienstenmix.js` (nieuw) | `DIENSTTYPEN`: 8 stuks `{ id, volgorde, wie, inRangorde }` in de volgorde van v2 punt 4, namelijk ontvangst, eten, ontmoeting, focus, it, leren, welzijn, gemak. `wie` is 'organisatie', 'team' of 'beide', en `it` heeft `inRangorde: false`. Daarnaast `PERSONA_DIENSTENMIX`: 8 persona-id's met de scores uit matrix v2, inclusief IT. Er komt geen zichtbare tekst in. |
| 3 | `src/team/werkplek/dienstenProfielLogic.js` (nieuw) | `SPRONG_DREMPEL = 0.25`. `buildDienstenProfiel(aantallen)` geeft `{ top, helptOok, geenUitgesproken, heeftData, totaalLeden }`, met items `{ id, gemiddeld }`. Dezelfde telling als `berekenTeamWerkplekmix` / `buildWerkplekProfiel`, met sorteren op gemiddelde en bij gelijke stand op `volgorde`. Daarnaast `waaromWerkstijlen(aggregate)`, dat `dominantPersonas(aggregate).slice(0, 3)` teruggeeft, alleen de id's. |
| 4 | `src/team/werkplek/dienstenProfielLogic.test.js` (nieuw) | De drie rekenvoorbeelden, plus: IT komt nooit voor in top of helptOok, bij gelijke stand geldt de lijstvolgorde, en een leeg team geeft geen data. Alleen verzonnen samenstellingen. |
| 5 | `src/i18n/copy/nl/servicesProfile.js` + `en/servicesProfile.js` (nieuw), en een regel in elk `copy/{nl,en}/index.js` | Gelijke sleutels: `titel`, `waaromKop`, `dienstenKop`, `helptOokKop`, `geenUitgesproken { kop, tekst }`, `itVoetregel`, `disclaimer`, `wie { team, organisatie, beide }`, `diensten.{id} { naam, uitleg, voorbeelden[] }`, `waarom.{personaId}`, `individueel { kop, disclaimer, zin.{personaId} }`. Alles letterlijk uit v2 punten 1–4. `geenUitgesproken` is gesplitst in de eerste zin (`kop`) en de rest (`tekst`), met dezelfde woorden. De voetregel wordt "**{diensten.it.naam}.** {itVoetregel}" ("IT-ondersteuning. Voor iedereen …" / "IT support. A condition for everyone …"). De lead neem ik niet op. |
| 6 | `src/team/werkplek/DienstenLaag.jsx` (nieuw) | De teamlaag volgens het ontwerp, punten 1 en 2: laaggrens, titel `TYPE.subhead`, eyebrows, `<dl>` met de waaromzinnen (naam in 600 zonder personakleur), dienstrijen met de maten van `SecondaryItem`, "wie" als gewone tekst, het namenraster van `BelowAverageNote` zonder `borderTop`, de voetregel en de disclaimer in `TYPE.meta`. Er komen geen badges, iconen of nieuwe kleuren bij. |
| 7 | `src/team/werkplek/WerkplekProfielInline.jsx` | Er komt één prop bij, `metDiensten = false`. Als laatste kind van de grid komt `{metDiensten && DIENSTENPROFIEL_ENABLED && totaal ≥ MIN_TEAM_RESPONSES ? <DienstenLaag/> : null}`. Is de schakelaar uit, dan staat er geen lijn en geen element. De rest van het bestand blijft ongewijzigd. |
| 8 | `src/components/TeamDashboard.jsx` | `buildTiles(t, { …, metDiensten = false })`. De Werkplek-`render` geeft `metDiensten` door, en alleen `TeamDashboard` roept het aan met `metDiensten: true`. `buildValue` / `tegelKern` blijven ongewijzigd. `Admin.jsx` raak ik niet aan, dus daar blijft de laag weg. |
| 9 | `src/components/result/WatJouTrekt.jsx` (nieuw, klein) | Het gedeelde blok voor de individuele weergave: kop, de jij-zin van `primary.id` in Playfair 18/1,35 en de disclaimer in 12/1,5 `--tof-text-muted`, met een lijn erboven. Het label-stijlobject komt als prop mee, zodat app en web hun eigen labelstijl houden. Er komen geen dienstnamen, geen pin en geen personakleur in. |
| 10 | `src/native/ProfileScreen.jsx` | Na de restlijst (`:378`), binnen dezelfde `Sectie`: `{DIENSTENPROFIEL_ENABLED && <WatJouTrekt … labelStyle={LABEL} />}`. |
| 11 | `src/components/ResultsProfileCard.jsx` | Als laatste kind in de items-grid van de Bricks-`InnerCard` (na `:470`): hetzelfde blok met `INFO_LABEL_STYLE`. |
| 12 | `docs/terugkoppeling-dienstenprofiel.md` | Hier komt het deel van ronde 2 bij: bestanden en regels, screenshots (team normaal, team zonder uitgesproken dienst, individueel; telkens NL en EN op 375 px), de uitkomst van de tests en het bewijs dat de schakelaar uit staat (`DIENSTENPROFIEL_DEFAULT = false`, en een build zonder env-variabele toont geen laag). |

Ik raak niet aan: de vragenlijst, de scoring, `quizData.js`, `data.js`, `werkplekmix.js`, `werkplekProfielLogic.js`, de bestaande teksten in `workplaceProfile.js`, de PDF's, `Admin.jsx` en `/team/werkplekprofiel`.

### 6. Wat ik van je nodig heb

1. Akkoord op het plan, en "ga bouwen".
2. Afwijking b: moet de laag ook bij beheerders pas vanaf vijf profielen verschijnen? (Mijn advies: ja.)
3. Afwijking h: mag ik de screenshots maken met een tijdelijke override die verzonnen rijen gebruikt en niet wordt gecommit?

---

## Ronde 2: gebouwd (4 november 2026)

Het werk staat lokaal op de branch `feature/dienstenprofiel`, in zes commits. **Er is niet gepusht.** `main` is niet aangeraakt.

Bij de open vragen uit ronde 1 heb ik mijn eigen voorstel gevolgd:
- **Afwijking b:** de laag heeft een eigen drempel van vijf, die ook geldt voor beheerders.
- **Afwijking h:** de screenshots zijn gemaakt met een tijdelijke override die verzonnen rijen gebruikt. Die override is niet gecommit en is weg (zie bewijs 4).

| Commit | Wat |
|---|---|
| `1ab5205` | schakelaar `DIENSTENPROFIEL_ENABLED`, standaard uit |
| `71c6af7` | `dienstenmix.js` (matrix v2), `dienstenProfielLogic.js` en de tests |
| `811db8e` | `servicesProfile` NL en EN |
| `4acc6e8` | de laag in het Werkplek-paneel |
| `35db924` | "Wat jou naar kantoor trekt" in de app en op het web |
| `61c9986` | correctie aan het raster bij lange namen |
| `876c437` | deze terugkoppeling en de screenshots |

### 1. Nieuwe en gewijzigde bestanden

**Nieuw**

| Bestand | Regels | Inhoud |
|---|---|---|
| `src/team/werkplek/dienstenmix.js` | 81 | `DIENSTTYPEN` (8 stuks, met `id`, `volgorde`, `wie` en `inRangorde`; IT staat op `false`), `PERSONA_DIENSTENMIX` (matrix v2, inclusief IT) en `berekenTeamDienstenmix` |
| `src/team/werkplek/dienstenProfielLogic.js` | 87 | `SPRONG_DREMPEL = 0.25` (`:22`), `buildDienstenProfiel` (`:39`) en `waaromWerkstijlen` (`:83`, gebaseerd op `dominantPersonas`, hoogstens drie) |
| `src/team/werkplek/dienstenProfielLogic.test.js` | 104 | 13 tests, alleen met verzonnen samenstellingen |
| `src/team/werkplek/DienstenLaag.jsx` | 286 | de teamlaag |
| `src/components/result/WatJouTrekt.jsx` | 63 | het individuele blok, gedeeld door app en web |
| `src/i18n/copy/nl/servicesProfile.js` | 115 | teksten NL |
| `src/i18n/copy/en/servicesProfile.js` | 106 | teksten EN (dezelfde sleutels) |

**Gewijzigd**

| Bestand | Regels | Wat |
|---|---|---|
| `src/experimental/featureFlag.js` | `:31–50` (toegevoegd) | `DIENSTENPROFIEL_DEFAULT = false`, met override via `REACT_APP_DIENSTENPROFIEL` |
| `src/team/werkplek/WerkplekProfielInline.jsx` | `:29–31`, `:56–59`, `:99–106` | Er zijn twee imports en een prop `metDiensten = false` bij gekomen. Als laatste kind van de grid staat `metDiensten && DIENSTENPROFIEL_ENABLED && totaalLeden >= MIN_TEAM_RESPONSES`. De rest van het bestand is ongewijzigd. |
| `src/components/TeamDashboard.jsx` | `:80–84`, `:116–118`, `:193` | `buildTiles` heeft een optie `metDiensten` gekregen. Alleen het teamdashboard zet die op `true`. De tegelwaarde (`tegelKern`) is ongewijzigd. |
| `src/native/ProfileScreen.jsx` | `:4`, `:10`, `:381–386` | `WatJouTrekt` staat na de restlijst, binnen dezelfde Werkplek-sectie |
| `src/components/ResultsProfileCard.jsx` | `:12–13`, `:472–480` | `WatJouTrekt` staat als laatste in de grid van de Bricks-kaart |
| `src/i18n/copy/{nl,en}/index.js` | `:28`, `:59` | `servicesProfile` geregistreerd |

**Niet aangeraakt** (`git diff main` is leeg): `App.js`, `Admin.jsx`, `werkplekmix.js`, `werkplekProfielLogic.js`, `WerkplekProfiel.jsx`, `workplaceProfile.js` (NL/EN), `data.js`, `quizData.js`, `src/utils/` (inclusief de PDF's). Ook de vragenlijst en de scoring heb ik niet aangeraakt.

### 2. Teksten

Alle 108 tekstwaarden in `servicesProfile` (NL en EN) heb ik automatisch vergeleken met v2. Elke waarde komt daar letterlijk in voor. De voorbeelden zijn vergeleken als de zin met komma's, zoals in v2, en "geen uitgesproken" ook als de twee delen samen. Er is niets herschreven.

Op het scherm komen er twee dingen bij die het ontwerp vraagt:
- de voorbeelden staan met " · " ertussen;
- de IT-voetregel begint met "**IT-ondersteuning.**" / "**IT support.**" (`diensten.it.naam`).

### 3. De drie rekenvoorbeelden

Dit is de uitkomst van `npx react-scripts test` (22/22 groen; 13 tests in dit bestand en 9 in het bestaande `access.test.js`):

| Samenstelling | Kop 1 (Waarom) | Kop 2 | Helpt ook |
|---|---|---|---|
| 1 × elke werkstijl | Maker, Groeier, Presteerder | geen uitgesproken dienst ✓ | Ontmoeting, Focus, Eten, Leren, Gemak, Ontvangst, Welzijn |
| 3 Verbinder, 1 Teamspeler, 1 Denker | Verbinder | Ontmoeting, Eten, Ontvangst ✓ | Welzijn, Leren, Focus, Gemak |
| 2 Presteerder, 2 Denker, 1 Zekerzoeker | Presteerder, Denker | Focus, Gemak, Welzijn ✓ | Ontvangst, Leren, Eten, Ontmoeting |

Er zijn ook tests voor de volgende regels:
- IT komt nooit in de lijsten;
- bovenaan staan hoogstens drie diensten;
- bij gelijke stand geldt de lijstvolgorde;
- een sprong van precies 0,25 telt mee (3 Makers en 1 Groeier geeft Ontmoeting en Focus);
- een team van alleen Makers geeft "geen uitgesproken dienst";
- een leeg team geeft geen data.

In de preview gaven dezelfde samenstellingen precies deze lijsten op het scherm.

### 4. Screenshots (375 px, map `docs/dienstenprofiel-preview/`)

De laag is hoger dan één scherm, dus per toestand zijn er twee beelden: `-1` is het begin van de laag, `-2` het einde.

| Beeld | NL | EN |
|---|---|---|
| Teampaneel normaal (3 Verbinder, 1 Teamspeler, 1 Denker) | `team-normaal-nl-1.jpg`, `-2.jpg` | `team-normaal-en-1.jpg`, `-2.jpg` |
| Teampaneel zonder uitgesproken dienst (1 × elke werkstijl) | `team-geen-uitgesproken-nl-1.jpg`, `-2.jpg` | `team-geen-uitgesproken-en-1.jpg`, `-2.jpg` |
| Individueel, web (Denker, verzonnen uitslag) | `individueel-web-nl.jpg` | `individueel-web-en.jpg` |
| Individueel, app (Denker) | `individueel-app-nl.jpg` | `individueel-app-en.jpg` |
| Werkplek-tegel ongewijzigd ("Overlegplekken +2") | `tegel-ongewijzigd-nl.jpg` | — |
| Schakelaar uit: het paneel eindigt bij "Let op de balans" | `schakelaar-uit-nl.jpg` | — |

**Lengte op 375 px (gemeten, niet geschat):**

| Toestand | Laag | Paneel met laag | Paneel zonder laag |
|---|---|---|---|
| Normaal, NL (3 diensten, 1 waaromzin) | 999 px | 2.508 px | 1.484 px |
| Normaal, EN | 997 px | — | — |
| Geen uitgesproken, NL (3 waaromzinnen) | 971 px (was 926 met twee kolommen) | 2.417 px | — |
| Geen uitgesproken, EN | 950 px (was 922 met twee kolommen) | 2.422 px | — |

Het paneel wordt dus ongeveer 1,7 keer zo lang: van bijna 2 naar ruim 3 telefoonschermen van 812 px. Dat is iets minder dan mijn schatting uit ronde 1.

Het individuele blok is 181 px hoog, in de app en op het web, in NL en in EN.

### 5. Bewijs dat de schakelaar uit staat

1. In de code staat `src/experimental/featureFlag.js:43`: `const DIENSTENPROFIEL_DEFAULT = false;`. Zonder `REACT_APP_DIENSTENPROFIEL` is `DIENSTENPROFIEL_ENABLED` dus `false`.
2. Op de gewone previewserver zonder env-variabele (`persona-app-verify`, poort 3002) heb ik dezelfde verzonnen teamsamenstelling geopend:
   - `#diensten-laag-titel` bestaat niet;
   - de tekst "Wat dit team naar kantoor trekt" staat niet op de pagina;
   - het paneel is 1.484 px hoog en eindigt bij "Let op de balans", zonder losse lijn (`schakelaar-uit-nl.jpg`).
   - Op de resultatenpagina laadt het profiel wel ("Jouw dominante profiel is Denker"), maar staat "Wat jou naar kantoor trekt" er niet.
3. Om het aan te zetten heb ik twee eigen previewservers gebruikt: `dienstenprofiel-web` (poort 3004) en `dienstenprofiel-native` (poort 3005), elk met `REACT_APP_DIENSTENPROFIEL=1`. Ze staan in het lokale `.claude/launch.json`, dat niet in git zit.
4. De tijdelijke preview-override in `App.js` (de parameters `?voorbeeld=` en `?voorbeeldprofiel=`, met verzonnen rijen) is weggehaald met `git checkout -- src/App.js`. `git diff main -- src/App.js` is leeg, en `grep -c voorbeeld src/App.js` geeft `0`.
5. De productiebuild (`CI=false GENERATE_SOURCEMAP=false npx react-scripts build`) compileert zonder fouten.

### 6. Wat ik onderweg tegenkwam

- **Lange Nederlandse namen in "Helpt ook" op 375 px.** "Focusondersteuning" was breder dan de halve kolom en duwde het hele paneel buiten het scherm. Ik heb dat opgelost met de kolommen `minmax(0, 1fr)` en woordafbreking (`hyphens: auto`). Het gevolg is dat "Ontmoetingsmomenten" in het raster soms afgebroken wordt als "Ontmoetingsmomen-ten" (zie `team-geen-uitgesproken-nl-2.jpg`). De andere mogelijkheid is één kolom op mobiel, maar die wijkt af van het ontwerp en maakt de laag ongeveer 90 px langer. **Besluit Judith (4 nov 2026): eerst afbreken laten staan, daarna toch één kolom op mobiel.** Gebouwd: "Helpt ook" staat op mobiel in één kolom, alle namen blijven heel. De laag wordt daardoor 45 px (NL) en 28 px (EN) langer. Desktop houdt drie kolommen. De screenshots `team-geen-uitgesproken-{nl,en}-2.jpg` zijn vervangen.
- **Jest en de router.** Het nieuwe testbestand moet `react-router-dom` nabootsen (`jest.mock(…, { virtual: true })`), omdat `TeamAggregation.js` via i18n de router binnenhaalt. De logica zelf heeft de router niet nodig.
- **De eigen drempel bij beheerders** heb ik in de preview niet apart getest. Daarvoor is een beheerderslogin nodig. In de code is het één voorwaarde (`WerkplekProfielInline.jsx:103`).
- **De laag in `/admin`** heb ik niet in de preview bekeken, om dezelfde reden (login). In de code roept `Admin.jsx:1033` `buildTiles` aan zonder `metDiensten`, dus de prop staat daar op `false`. `Admin.jsx` zelf is niet gewijzigd.

### 7. Wat er nog moet gebeuren

1. Jij bekijkt het in de preview. Lokaal kan dat met de server `dienstenprofiel-web`. Een verzonnen team krijg je alleen met de tijdelijke override; die zet ik desgewenst weer neer, zonder commit.
2. Daarna beslis je of de schakelaar aan gaat. Dat kan op twee manieren: `DIENSTENPROFIEL_DEFAULT` op `true` zetten, of op Netlify `REACT_APP_DIENSTENPROFIEL=1` instellen.
3. Daarna mergen naar `main` en pas na jouw "push" pushen. Let op: zo lang de schakelaar uit staat, is een push zonder zichtbaar effect.

## Wijziging na livegang (4 nov 2026)

**"Waarom dit team komt" toont nu élke werkstijl in het team**, niet alleen de dominante (hoogstens drie). Besluit Judith na het zien van de live versie. Volgorde: meeste mensen eerst, bij gelijke stand de volgorde van de archetypen (zoals "Wie zit er in dit team"). Elke werkstijl krijgt zijn eigen zin uit v2 punt 3; de teksten zijn ongewijzigd. Bij acht werkstijlen in één team zijn het acht zinnen.

Code: `waaromWerkstijlen` in `src/team/werkplek/dienstenProfielLogic.js`; tests in `dienstenProfielLogic.test.js` aangepast (23/23 geslaagd). Gecontroleerd in de preview met een verzonnen team (3 Verbinders, 2 Groeiers, 2 Zekerzoekers, 1 Maker, 1 Denker): vijf zinnen in die volgorde.
