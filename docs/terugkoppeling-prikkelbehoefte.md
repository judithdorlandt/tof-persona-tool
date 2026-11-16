# Terugkoppeling: prikkelbehoefte ("Geluid en werkomgeving")

Opdracht: `tof-marketingteam/content/opdracht-app-prikkelbehoefte.md`
Bronnen: `tof-marketingteam/ux/2026-11-16-prikkelbehoefte-schets.md` (kop "UX-uitwerking", §0–§9) en `tof-marketingteam/content/teksten-app-prikkelbehoefte.md` (versie na "Redactietoets 16 nov").

## Ronde 1: inventaris (16 november 2026)

Ik heb niets in de code gewijzigd, geen branch gemaakt, niets gecommit, niets op Supabase gedraaid en niet gepusht. Ik zat op `main` bij `ef4d1f6`, met alleen het ongevolgde `docs/prompt-stores-1.0.5.md` als wijziging. Dit bestand is het enige nieuwe bestand. Voor controle 2 heb ik een losse meetpagina gebruikt in de kladmap, buiten de repo.

---

### 1. De grootste afwijking: op het web bestaat de vragenlijst niet meer

De UX-uitwerking (§1, §3) en besluit A gaan ervan uit dat teamleden de vragenlijst op het web invullen. Dat klopt sinds **21 oktober 2026** niet meer:

- `src/App.js:282–294` (`case 'quiz'`): op het web `IS_NATIVE ? <QuizTest/> : <QuizInApp/>`. Daar staat het storescherm, ook voor wie via een uitnodigingslink `?org=…&code=…` binnenkomt. Het commentaar zegt: "Op het web bestaat de vragenlijst niet meer (besluit Judith, 21 okt 2026)".
- `src/App.js:418–424` (`case 'quiztest'`): de enige webroute naar `QuizTest` staat achter `QUIZTEST_ENABLED`, en dat staat standaard **uit** (`src/experimental/featureFlag.js:22`, `QUIZTEST_DEFAULT = false`).
- `saveResponse` wordt live alleen nog aangeroepen vanuit `Bijdragen.jsx:194`, dus app → team. De aanroep in `QuizTest.jsx:436` draait alleen op het web, en het web toont die route niet.

**Gevolg:**
- Onderdeel 3 (de vraag op het web na de basis, `!IS_NATIVE`) bereikt **niemand**, zolang de webquiz dicht is. Je ziet hem alleen lokaal met `REACT_APP_QUIZTEST=1`.
- Elk nieuw teamprofiel komt nu uit de app, via de verdieping en daarna Bijdragen (onderdelen 4 en 6), of via de losse link (onderdeel 8).
- In de app is de verdieping optioneel. Als de vraag alleen daar staat, krijgt maar een deel van de nieuwe teamleden hem. Dat is precies het dekkingsprobleem dat besluit A voor het web oploste.

Dit vraagt een keuze van Judith (zie §7, keuze 1).

Kleine verwante afwijking: de UX-uitwerking §1 zegt "Op het web hoort iedereen bij een organisatie en afdeling (`QuizAanmelding.jsx` r. 220–239)". De code klopt nog wel, maar die regels draaien op het web niet meer.

---

### 2. Bevestigde paden, regels, functies en sleutels

✓ = klopt, ≈ = klopt op een paar regels na, ✗ = wijkt af.

**QuizTest en quizteksten**

| Genoemd | Stand in de repo | |
|---|---|---|
| `QuizTest.jsx` | Staat in `src/experimental/quizTest/QuizTest.jsx` (770 regels), niet in `components/` | ✓ (pad aangevuld) |
| Fasen `intake \| basis \| keuze \| verdieping \| onthulling \| profielScherp` | r. 320 | ✓ |
| `nextBasis` → `setPhase('keuze')` r. 479 | r. 479 | ✓ |
| `scherpResult` r. 413–419 met `werkplek` en `openAntwoord` | r. 413–419 | ✓ |
| Opslaan r. 421–443 (`saveResponse` op het web, `saveProfile` in de app) | r. 421–443 (436 en 429) | ✓ |
| Verdiepingsstappen r. 332 / 702 / 713 | r. 332 (commentaar), druk r. 657–681, werkplek r. 684–709, open vraag valt door naar r. 711 | ✓ |
| Voortgangsbalk r. 504–521 | r. 504–521 | ✓ |
| Hulpcomponenten `Card`, `Eyebrow`, `Title`, `OptionButton`, `PrimaryBtn` | r. 91, 109, 117, 180, 136, op moduleniveau | ✓ |
| Opties schudden (basis r. 363–374, druk r. 376–385) | aanwezig. De nieuwe vraag schudt niet. | ✓ |
| `quiz.js` r. 9 "9 vragen · ± 5 minuten" | `nl/quiz.js:9`, `en/quiz.js:2` | ✓ |
| `quiz.js` r. 56 "tot slot" | `nl/quiz.js:56` `openEyebrow`, `en/quiz.js:41` | ✓ |
| `quiz.pickOne`, `quiz.next` (tekstenbestand §1) | `nl/quiz.js:13, 23`. `pickOne` is een object `{before, strong, after}`, net als bij de basisvragen | ✓ |
| `quizData.js` nl r. 154 `hybride` | `nl/quizData.js:154` en `en/quizData.js:154`. Wordt niet gebruikt: `WERKPLEK_IDS` (`quizTestData.js:56`) heeft acht ids zonder `hybride` | ✓ |
| `quizTestData.js` r. 104 "negen plektypen" | r. 104 | ✓ |

**Aanmelden, overdracht en Bijdragen**

| Genoemd | Stand in de repo | |
|---|---|---|
| `QuizAanmelding.jsx` r. 64–67 (geen teams in de app), r. 196, r. 220–239 | r. 64–67, r. 196, r. 220–239 | ✓ |
| `invite_code` in het webprofiel | `QuizAanmelding.jsx:239` stuurt `form.teamcode`. Dat mag leeg zijn: dan vult de servertrigger `responses_fill_invite_code` (`008`, r. 263–285) de code in | ✓, zie de opmerking bij onderdeel 3 |
| `TeamInvite.jsx` r. 56 | `src/native/TeamInvite.jsx:55–57` (`handoffUrl(resultData, …)`) | ✓ |
| `profileHandoff.js` r. 17–21, 22–24, 36, 69–75, 91–95, 115–130 | `src/lib/profileHandoff.js`: precies die regels. `VERSION = 1` op r. 36, versiecontrole op r. 115 | ✓ |
| `Bijdragen.jsx` r. 9 ("letterlijk"), r. 194–207, r. 195–198 | r. 9, r. 194–207, r. 195–198 | ✓ |
| Lokale markering tegen dubbel inbrengen | `Bijdragen.jsx:62` `tof_bijdragen_ingebracht`, vingerafdruk r. 66–78 (zonder prikkel) | ✓ (nuttig voor onderdeel 8) |
| `contribute.payload.note` | `nl/contribute.js:24`, `en/contribute.js:24` | ✓ |

**Profielkaarten**

| Genoemd | Stand in de repo | |
|---|---|---|
| `ResultsProfileCard.jsx` Bricks r. 406–472, `WatJouTrekt` r. 474–481 | `src/components/ResultsProfileCard.jsx` r. 406, `WatJouTrekt` r. 477 | ✓ |
| `ProfileScreen.jsx` r. 343–380, `WatJouTrekt` r. 382–386 | `src/native/ProfileScreen.jsx` r. 343, `WatJouTrekt` r. 385 | ✓ |
| `WatJouTrekt.jsx` opmaak | `src/components/result/WatJouTrekt.jsx`: lijn erboven, label via `labelStyle`, zin in Playfair 18 px | ✓ |
| App: antwoord in het lokale profiel | `localStore.saveProfile(result)` bewaart het hele `result`. Een veld `prikkel` in `scherpResult` gaat dus vanzelf mee, zonder nieuwe opslagversie | ✓ |

**Teamkant**

| Genoemd | Stand in de repo | |
|---|---|---|
| `WerkplekProfielInline.jsx` r. 12–13, `metDiensten` r. 56–59, `SignalenBlok` r. 97–99, `DienstenLaag` r. 101–105 | `src/team/werkplek/WerkplekProfielInline.jsx`: precies die regels | ✓ |
| `DienstenLaag.jsx` `Blok` en `GeenUitgesproken` (r. 130–137, 239–246) | r. 130–137 en r. 239–246. Stijlen `KOP`, `UITLEG`, `DIENSTNAAM` op r. 31–48 | ✓ |
| `DIENSTENPROFIEL_ENABLED` in `experimental/featureFlag` | `featureFlag.js:43–50`, standaard aan | ✓ |
| /admin krijgt het blok niet | `Admin.jsx:1033` roept `buildTiles(…)` aan zonder `metDiensten`. Alleen `TeamDashboard.jsx:193` zet het aan. Een eigen prop gaat langs dezelfde weg (`buildTiles`, r. 84 en 117) | ✓ |
| `TeamDashboard.jsx` r. 232–236 (geen teambeeld onder vijf) | r. 232–236 | ✓ |
| Teamcode in het dashboard | `selectedTeam?.code` (r. 244, 295) | ✓ |
| `werkplekProfielLogic.js` r. 4–6, `tegelKern` r. 98–103 | aanwezig | ✓ |
| `access.js` r. 47–52, r. 150–152, `MIN_TEAM_RESPONSES` | r. 45 `MIN_TEAM_RESPONSES = 5`, r. 47–52 en r. 145–152 | ≈ |
| `constants.js` r. 16 | `organisatieLandschap/constants.js:16` `MIN_ROW_PROFILES = 10` | ✓ |
| `dienstenProfielLogic.test.js` als voorbeeld | `src/team/werkplek/dienstenProfielLogic.test.js` | ✓ |

**Supabase en teksten**

| Genoemd | Stand in de repo | |
|---|---|---|
| `supabase.js` `saveResponse` | r. 342–380. Geeft `true` terug, of `null` als Supabase ontbreekt, en gooit bij een fout | ✓ |
| `supabase.js` r. 364–367 (lockdown), r. 504–506 (`withoutName`), r. 565–572 (noodroute `select('*')`) | r. 364–367, r. 504–506, r. 565–572 | ✓ |
| `010_names_rule.sql` r. 60–94 en r. 98 | r. 60–95 en r. 98–135 | ✓ |
| `archetypes.js` (nl) r. 167–170, 236–282, 307, 514 | gecontroleerd op 169, 170, 238, 307, 514: kloppen | ✓ |
| `werkplekmix.js` r. 81/88/95/109/116, `dienstenmix.js` r. 24/44/48/52/60/64 | kloppen | ✓ |
| `teamInsightText.js` `personaPlural` | `nl` r. 56, `en` r. 55 (tekstenbestand zegt r. 55–56) | ✓ |
| Namen `name` in `archetypes.js` (nl) | r. 13, 91, 160, 229, 298, 367, 436, 505 | ✓ |

**Afwijkingen in de tekst van de opdracht en de bronnen**

- **Leveringsmail "per teamcode" in /admin bestaat niet.** De kant-en-klare mail staat alleen in `JustCreatedCard` (`Admin.jsx:775–911`), direct na het aanmaken van een nieuw team. Per bestaande teamcode is er wel een rij in het organisatieoverzicht (`Admin.jsx:1478–1570`), met code, namenschakelaar, aantal en "bekijk". Daar past de kopieerknop. Zie het plan bij onderdeel 8.
- **Geen tekst voor de knop in /admin.** "kopieer link werkomgeving" staat alleen in de opdracht. Het tekstenbestand heeft er geen NL- of EN-sleutel voor, en ook geen melding als het kopiëren gelukt is. Ik herschrijf niets zelf. Zie keuze 6.
- **`{maand}`** in `prikkelTeam.leeg` moet de maand van livegang worden (EN: Engelse maandnaam). Die maand ligt nog niet vast.
- **`private.responses` is ook voor ingelogde gebruikers volledig leesbaar.** Policy "Authed mag responses lezen" (`006`, r. 108, `qual=true`). Elke ingelogde leidinggevende kan dus alle rijen lezen. Dat valt buiten deze opdracht, maar het is een reden om de nieuwe tabel ook voor `authenticated` dicht te zetten. Zie onderdeel 1.

---

### 3. Migraties in `supabase/`

| Bestand | Inhoud | Status volgens het bestand |
|---|---|---|
| 001_team_managers | `team_managers` + RLS, seed Nijkerk | – |
| 002_test_judith_manager | testkoppeling demoteams | – |
| 003_organization_observations | observaties per organisatie | – |
| 004_strategic_kompas_intake | kompas-intake | – |
| 005_private_schema_access | grants op `private` en `public`, controleblok | basis was al actief |
| 006_responses_access_code_read | `responses_for_code(s)`, anon `select` ingetrokken | gedraaid 16 okt 2026 |
| 007_responses_show_names | `show_names`, naam op null | (vervangen door 010) |
| 008_code_check_functions | `check_team_code`, `quiz_teams`, trigger `responses_fill_invite_code`, codetabel dicht | gedraaid 21 okt 2026 |
| 009_check_team_code_show_names | `check_team_code` + `show_names` | in gebruik (Bijdragen) |
| 010_names_rule | `private.names_allowed`, nieuwe `responses_for_code(s)` | gedraaid 26 okt 2026 (volgens geheugen) |

De nieuwe migratie wordt **`011_prikkel_antwoorden.sql`**.

**Rechten op `private.responses` (stand na 006 §3–4):**
- `anon`: alleen `INSERT`, via de policy "Iedereen mag response invoegen". `SELECT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` en `TRIGGER` zijn ingetrokken.
- `authenticated`: `select, insert, update, delete` (005 r. 80) en de policy "Authed mag responses lezen" (`qual=true`).
- `service_role`: alles.
- Lezen door anon gaat alleen via `public.responses_for_code(text)` en `responses_for_codes(text[])`. Die zijn `security definer`, controleren `active = true` en geven `setof private.responses` terug, dus de hele rij.
- Trigger `trg_responses_fill_invite_code` (before insert) vult de code in uit organisatie en afdeling.
- Sinds de Supabase-wijziging van 30 okt 2026 krijgt een nieuwe tabel geen automatische grants meer. Elke `GRANT` moet dus in de migratie staan (zie de memo in `005`).

---

### 4. Plan per bestand, per onderdeel

**Schakelaar (bij onderdeel 1 of 3).**
- `src/experimental/featureFlag.js`: `PRIKKEL_DEFAULT = false` plus `REACT_APP_PRIKKEL` ('1'/'0'), naar het voorbeeld van `DIENSTENPROFIEL_*`.
- Eén export `PRIKKEL_ENABLED`. Alles hangt eraan: de vraag op het web, de vraag in de app, de profielregel, `pk` in de overdracht, het teamblok, de losse link en de kopieerknop.
- `.claude/launch.json`: twee previewservers met `REACT_APP_PRIKKEL=1` (web en native). Dat bestand valt buiten de commits van de app, of gaat mee in een aparte commit (keuze aan Judith).

**Onderdeel 1: tabel en leesfunctie**

`supabase/011_prikkel_antwoorden.sql` (nieuw):
- `private.prikkel_antwoorden` met `id uuid pk default gen_random_uuid()`, `invite_code text not null`, `prikkel text not null check (prikkel in ('stil','geroezemoes','reuring','maakt_niet_uit'))` en `created_on date not null default current_date`.
  - Het type `date` maakt een tijdstip onmogelijk, ook als de browser er een meestuurt.
  - Er komt geen kolom voor naam, werkstijl, `responses.id`, organisatie of team.
- RLS aan. `revoke all` van `public`, `anon` en `authenticated`. Daarna alleen het hoogst nodige, en **geen** `select` voor anon of authenticated.
- Hoe anon schrijft, en hoe de code gecontroleerd wordt: **keuze 3**.
  - (a) Letterlijk volgens de opdracht: `grant insert` aan anon, met een policy `with check (exists (actieve code))`. De codetabel is sinds 008 dicht voor anon, dus die check moet via een `security definer`-hulpfunctie lopen.
  - (b) Een functie `public.prikkel_opslaan(p_code text, p_prikkel text)` met `security definer`. Die controleert `active = true` net als `check_team_code` en schrijft de rij. Anon krijgt alleen `execute`, geen tabelrecht. Mijn voorkeur, omdat de code- en datumregel dan op de server liggen.
- `public.prikkel_voor_code(p_code text) returns text`, `stable security definer`, `search_path = private, public`, zelfde codecontrole als `responses_for_code` (`active = true`). Uitkomstregels in deze volgorde, alleen op n = stil + geroezemoes + reuring:
  - `null` als n < 5 (of de code niet bestaat of niet actief is);
  - `'gemengd'` als stil ≥ 30 % én reuring ≥ 30 %;
  - `'stil'` als stil ≥ 50 %;
  - `'reuring'` als reuring ≥ 50 %;
  - anders `'zonder_uitersten'`.
  - Ik reken in gehele getallen (`stil*10 >= n*3`), zodat er geen afrondingsverschil is tussen SQL en JS.
- Rechten op de functies: `revoke all … from public`, daarna `grant execute` aan anon en authenticated.
- Onderaan een controleblok, alleen-lezen en uitgecommentarieerd:
  - de rechten op de tabel: anon en authenticated geen `select`;
  - de functiedefinities;
  - een SQL-test met verzonnen verdelingen in een `values`-lijst, via een pure hulpfunctie `private.prikkel_uitkomst(stil, geroezemoes, reuring)` die `prikkel_voor_code` zelf ook gebruikt. Zo is de regel te testen zonder rijen te schrijven.
- `private.responses`, `responses_for_code` en `responses_for_codes` raak ik niet aan.

`src/team/werkplek/prikkelUitkomst.js` (nieuw):
- dezelfde regel als pure JS-functie `prikkelUitkomst({ stil, geroezemoes, reuring })`, alleen om te testen en te documenteren. Het scherm gebruikt hem niet, want de uitkomst komt uit SQL.

`src/team/werkplek/prikkelUitkomst.test.js` (nieuw):
- verzonnen verdelingen, onder meer: 5 antwoorden waarvan 4 'maakt niet uit' → `null`; 3 stil + 2 reuring → `gemengd`;
- de grenzen 30 % en 50 %, en n = 4 tegenover n = 5.

**Onderdeel 2: opslaan**

`src/supabase.js`:
- `savePrikkel(inviteCode, prikkel)`, los van `saveResponse`. Roept de RPC aan (b) of doet een kale insert zonder `.select()` (a).
- Gooit nooit en geeft `true` of `false` terug. Bij een fout alleen `console.warn`, geen foutmelding in beeld.
- Doet niets bij een onbekende waarde of een lege code.

**Onderdeel 3: de vraag op het web na de basis** (bereikt nu niemand, zie §1)

`src/experimental/quizTest/QuizTest.jsx`:
- Nieuwe state `prikkel` (null of een van de vier sleutels).
- In `nextBasis` (r. 479): `!IS_NATIVE && PRIKKEL_ENABLED ? setPhase('werkomgeving') : setPhase('keuze')`.
- Nieuwe fase `werkomgeving`, met dezelfde opbouw als de drukvraag (r. 657–681):
  - geen voortgangsbalk, geen "10 / 10";
  - eyebrow `eyebrowWeb`, `Title` met `q`, regel `pickOne`;
  - vier `OptionButton`s in vaste volgorde, in één kolom, ook op desktop;
  - de privacyregel, en `PrimaryBtn` `next` die naar `keuze` gaat.
- `scherpResult` (r. 413–419) krijgt `prikkel`.
- In het opslaan (r. 436): na een gelukte `saveResponse` → `savePrikkel(...)` zonder `await` op het resultaat, dus het blokkeert niets.
- Kanttekening: `invite_code` kan op het web leeg zijn. De trigger vult hem dan pas op de server in. `savePrikkel` heeft de code dan niet. Mogelijkheden: alleen opslaan als er een code is, of de RPC (b) dezelfde opzoekregel geven (organisatie + afdeling → code). Dit speelt alleen als de webquiz weer opengaat.

Teksten in `src/i18n/copy/{nl,en}/quizData.js`, blok `werkomgeving` (`q`, `a.stil` … `a.maakt_niet_uit`):
- via `getQuizData`/`quizTestData.js` als `WERKOMGEVING_VRAAG` met de vaste volgorde `stil, geroezemoes, reuring, maakt_niet_uit`;
- in `quiz.js` (nl/en) `werkomgeving.eyebrowWeb`, `eyebrowApp` en `privacy`.

Opruimen:
- `hybride` uit `werkplek` in `nl/quizData.js:154` en `en/quizData.js:154`;
- "negen plektypen" → "acht plektypen" in `quizTestData.js:104`.

**Onderdeel 4: de vraag in de app (verdieping)**

`QuizTest.jsx`:
- De stappen worden 0 duel, 1 duel, 2 druk, 3 werkplek, **4 werkomgeving** en 5 open. Het commentaar op r. 332 gaat mee.
- De werkplekknop (r. 702) gaat naar `prikkel ? 5 : 4`.
- Nieuw blok `verdiepStep === 4` met eyebrow `eyebrowApp` en zonder privacyregel. "Volgende" gaat naar 5.
- De open vraag blijft de laatste, in het blok waar de code naar doorvalt.
- "Overslaan als het antwoord er al is" geldt alleen als het web en de verdieping in één flow zitten. Op het web blijft de verdieping de stap overslaan.
- Bij keuze 1 (de vraag in de app direct na de basis) verandert dit onderdeel: dan komt dezelfde fase `werkomgeving` ook in de app vóór `keuze`, en verdwijnt stap 4.

**Onderdeel 5: regel in het eigen profiel**

`src/components/result/PrikkelRegel.jsx` (nieuw):
- Props `personaId`, `prikkel` en `labelStyle`.
- Data als ids: `{ denker: 'reuring', presteerder: 'reuring', verbinder: 'stil', vernieuwer: 'stil' }`. Maker, Groeier, Teamspeler en Zekerzoeker krijgen nooit een regel.
- Opmaak als `WatJouTrekt`, maar de zin in 14 px `--tof-text-soft`. Geen personakleur.

Teksten:
- `prikkelRegel.label`, `reuringBijStil` en `stilBijLeven` in `nl/` en `en/`, met een nieuw bestand of in `resultsCard.js`; dat beslis ik bij het bouwen. Steeds teken voor teken.
- `naamMv` per persona in `src/i18n/copy/{nl,en}/archetypes.js`, naast `name`, voor alle acht. Het tekstenbestand geeft alleen de vijf die een regel kunnen krijgen. Voor Maker, Groeier en Teamspeler: alleen de vijf toevoegen, of zelf de drie andere laten aanvullen? Zie keuze 6.

Plaats:
- `ResultsProfileCard.jsx`, vóór r. 474 (`WatJouTrekt`);
- `ProfileScreen.jsx`, vóór r. 382;
- beide achter `PRIKKEL_ENABLED`.

**Onderdeel 6: van de app naar het team**

`src/lib/profileHandoff.js`:
- In `encodeHandoff` alleen `pk: result.prikkel` als het een van de vier sleutels is, anders weglaten.
- In `decodeHandoff` geeft `pk` alleen een bekende waarde door, anders `null`. `VERSION` blijft 1.
- Het commentaar op r. 22–24 gaat mee.
- `pk` alleen meesturen bij `PRIKKEL_ENABLED`. Een oude website negeert het veld, dus dat is veilig.

`src/lib/profileHandoff.test.js` (nieuw):
- een oude link zonder `pk` levert een geldig profiel met `prikkel: null`;
- een link met `pk` werkt;
- een onbekende `pk` wordt `null` en het profiel blijft geldig;
- `v: 2` wordt nog steeds geweigerd.

`src/components/Bijdragen.jsx`:
- In het blok "Dit gaat mee" komt boven `t.payload.note` (r. 381–383) de regel "Je werkomgeving": kop, waarde (de tekst uit `werkomgeving.a.*`) en de kleine regel eronder. Alleen als `profiel.prikkel` er is.
- In `breng()` na een gelukte `saveResponse` → `savePrikkel(access.code, profiel.prikkel)`, zonder te wachten.
- Teksten in `contribute.js` (nl/en): `payload.werkomgevingHeading` en `werkomgevingNote`.

**Onderdeel 7: teamblok "Geluid en werkomgeving"**

`src/supabase.js`:
- `getPrikkelVoorCode(code)` → `'gemengd' | 'stil' | 'reuring' | 'zonder_uitersten' | null`. Bij een fout of een ontbrekende functie `null`, zonder foutmelding.

`src/components/TeamDashboard.jsx`:
- ophalen bij `selectedTeam?.code`, alleen bij `PRIKKEL_ENABLED`;
- doorgeven via `buildTiles(t, { …, prikkel })` (r. 84, 117, 193) aan `WerkplekProfielInline`.

`src/team/werkplek/WerkplekProfielInline.jsx`:
- nieuwe prop `prikkel` (standaard `undefined` = geen blok);
- blok tussen r. 99 en 101, alleen bij `PRIKKEL_ENABLED && prikkel !== undefined && profiel.totaalLeden >= MIN_TEAM_RESPONSES`;
- `Admin.jsx:1033` geeft de prop niet door, dus daar verschijnt niets. `Admin.jsx` wijzigt hier niet.

`src/team/werkplek/PrikkelBlok.jsx` (nieuw):
- de opmaak van `Blok`/`GeenUitgesproken` (lijn, eyebrow, Playfair 20 px, uitleg 13 px, metaregel);
- bij `null` alleen de lege regel in de metastijl;
- geen kader, geen rose, geen getallen.

Teksten: `prikkelTeam.*` in `workplaceProfile.js` (nl/en).

**Onderdeel 8: losse link voor bestaande teams**

Nieuwe pagina:
- `src/components/PrikkelLink.jsx` (nieuw), naar het voorbeeld van `Bijdragen.jsx` en `QuizInApp.jsx`;
- leest `?code=` en controleert met `validateTeamAccessCode` (`check_team_code`, `active = true`); bij een ongeldige code de melding `prikkelLink.ongeldig`;
- verder intro, `alGehad`, de vraag (dezelfde vaste volgorde), de privacyregel, versturen en het bedankscherm;
- geen naamveld, en de code hoeft niet ingevuld te worden;
- schrijft alleen via `savePrikkel`. Mislukt het, dan staat de knop weer klaar, maar er komt geen foutmelding.

Route:
- `src/i18n/routes.js`: nieuwe page-key, bijvoorbeeld `werkomgeving` → `/werkomgeving` en EN `/working-environment` (naam: keuze 6);
- `src/App.js`: `case` voor die key, alleen op het web en achter `PRIKKEL_ENABLED`, anders het storescherm; zonder navigatiebalk (`hideNav`);
- niet in `NATIVE_PAGES`.

Teksten: `prikkelLink.*` (nl/en), in een nieuw copybestand dat in `copy/{nl,en}/index.js` wordt geregistreerd.

`src/components/Admin.jsx`:
- in de rij per teamcode (r. 1514–1545, onder de namenschakelaar) een tekstknop "kopieer link werkomgeving", met `copyText` (`src/utils/copyText.js`);
- de link wordt `https://team.persona-tool.nl/werkomgeving?code=<CODE>`;
- alleen bij `PRIKKEL_ENABLED` en een actieve code.

**Dubbel tellen bij de losse link: de mogelijkheden (ik kies nog niets)**

1. **Lokale markering, zoals bij Bijdragen.** Na een gelukte verzending bewaart de pagina `tof_prikkel_<CODE>` in `localStorage`. Bij een volgend bezoek staat er "je antwoord is al binnen" in plaats van de vraag, eventueel met "toch opnieuw". Dit vangt dezelfde browser, maar geen ander toestel en geen privévenster. Het kost niets aan privacy.
2. **Dezelfde markering ook zetten vanuit Bijdragen** (en de webquiz) als daar een `pk` is opgeslagen. Wie zijn profiel via Bijdragen inbracht en later de losse link in dezelfde browser opent, telt dan niet dubbel. Bijdragen draait in de systeembrowser van de telefoon, dus het werkt alleen als de link op hetzelfde toestel en in dezelfde browser opengaat.
3. **Alleen de tekst `alGehad`** ("Kreeg je deze vraag al…? Dan hoef je niets te doen."). Dat staat al in het tekstenbestand. Iedereen beslist dan zelf.
4. **Een persoonlijke eenmalige code per link.** Dat vraagt een sleutel per persoon en botst met "zonder naam, zonder verwijzing". Dit raad ik af.
5. **Accepteren.** De drempel van vijf en de grens van 30 % maken één dubbele stem zelden beslissend. Dubbel inbrengen in `responses` wordt nu ook al geaccepteerd (`access.js:47–52`).

Mogelijkheden 1, 2 en 3 zijn te combineren. Een tekst die belooft dat één keer genoeg is, komt er volgens het tekstenbestand pas als het gebouwd is.

---

### 5. Controle 1: belooft de verdieping dat V4 of V5 bij het team komt?

**Nee.** Ik heb alle copy doorzocht op verdieping, werkplek, open vraag, scherper en de Engelse tegenhangers.
- `nl/quiz.js`: `profileReady.refine` "Ja, maak scherper (3 min)", `saveHint` "…wordt het bewaard", `deepDive.*` en `sharpened.*`. Nergens het team.
- Het Engels zegt hetzelfde.
- De open vraag (`quizData.open.q`) noemt het team niet.
- `admin.js:124` (nl/en), `quizInApp.js:31` en `contribute.js:89` noemen de verdieping alleen als optionele drie minuten.
- `contribute.js:24` (nl/en) zegt juist uitdrukkelijk: "geen antwoorden op open vragen, geen werkplekkeuzes".

Wel een bijvondst. `werkplek` (V4) en `openAntwoord` (V5) staan in `scherpResult` en gaan in de app mee in het lokale profiel. Maar **geen enkel scherm toont ze**: buiten `QuizTest.jsx` zijn er geen treffers voor `openAntwoord`, `gebruikNu` of `.werkplek`. Wie ze invult, ziet ze dus ook zelf nergens terug. Dit is geen belofte die breekt, maar het hoort wel bij hetzelfde onderwerp.

### 6. Controle 2: hoe lang wordt het Werkplek-paneel op 375 px?

Gemeten met een nabouw van het blok: de stijlen van `DienstenLaag` (eyebrow 12 px, Playfair 20 px, uitleg 13/1,5, meta 12/1,5, `paddingTop` 24, gap 16), de definitieve teksten uit het tekstenbestand, een tekstbreedte van 300 px en headless Chrome met Inter en Playfair geladen. Het is geen meting in de app zelf; die komt in ronde 2.

| Toestand | Blok (NL) | Blok (EN) |
|---|---|---|
| Gemengd | 274 px | 274 px |
| Overwegend stil | 232 px | 232 px |
| Overwegend reuring | 254 px | 254 px |
| Zonder uitersten | 254 px | 254 px |
| Lege toestand (alleen de metaregel) | 97 px | 97 px |

Daar komt de gap van het paneel bij (16 px op mobiel). **Het paneel wordt dus 250 tot 290 px langer met een signaal, en ongeveer 115 px langer in de lege toestand.**

Op 4 november was het paneel 2.417 tot 2.508 px (`terugkoppeling-dienstenprofiel.md`), maar dat was vóór `868859c` ("Waarom dit team komt" toont elke werkstijl). Het kan nu al iets langer zijn. Met het blok erbij komt het paneel uit op **ongeveer 2.700 tot 2.800 px, ongeveer 3,3 tot 3,5 telefoonschermen van 812 px**. Het blok staat vóór "Wat dit team naar kantoor trekt", dus het schuift die laag ongeveer een derde scherm naar beneden.

---

### 7. Keuzes voor Judith

1. **De webquiz is dicht. Waar staat de vraag dan voor nieuwe teamleden?**
   - (a) Zoals besloten: alleen in de app-verdieping, plus de losse link. Onderdeel 3 bouw ik wel, maar het bereikt niemand zolang de webquiz dicht is.
   - (b) In de app direct na de basis, net als besluit A voor het web. Ook buiten de teller, en voor iedereen in de app, ook zonder team (het antwoord blijft dan op het toestel tot Bijdragen).
   - (c) Onderdeel 3 overslaan zolang het web dicht is.
2. **Datum in de tabel.** Alleen een datum is beter dan een tijdstip. Maar in een klein team waar die dag maar één profiel binnenkwam, is het antwoord voor een beheerder via datum en code nog steeds aan een rij in `responses` te koppelen, en dus aan een naam. Wordt het een datum, een week of een maand, of geen datumkolom?
3. **Hoe schrijft anon?** (a) Een tabelrecht `insert` met een policy (letterlijk de opdracht), of (b) alleen een functie `prikkel_opslaan` met `security definer`, zonder tabelrecht (mijn voorkeur: de codecontrole en de datum liggen dan op de server). In beide gevallen krijgen anon en authenticated **geen** `select`.
4. **Dubbel tellen bij de losse link:** 1, 2, 3, 5 of een combinatie (zie §4, onderdeel 8).
5. **Webprofielen zonder teamcode** (alleen als de webquiz weer opengaat): het antwoord dan niet opslaan, of de server de code laten opzoeken uit organisatie en afdeling?
6. **Teksten die ontbreken** (die schrijf ik niet zelf):
   - de knop "kopieer link werkomgeving" in /admin, in NL en EN, met een melding als het kopiëren gelukt is;
   - de padnaam van de losse link (`/werkomgeving` en `/working-environment`?);
   - `naamMv` voor Maker, Groeier en Teamspeler, of alleen de vijf;
   - de maand voor `{maand}`.

---

### 8. Besluit Judith op keuze 1 (16 nov 2026): "9 vragen worden er 10"

**Zo lees ik het besluit.** De werkomgevingsvraag wordt vraag 10 van de basis, in de app en op het web, voor iedereen. Hij telt mee in de teller en de voortgangsbalk ("10 / 10"), maar niet in de score: geen `WEIGHTS`, geen `BUMP` en geen archetype. Daarmee vervallen de eigen kaart "Voor je team" buiten de teller (besluit A) en stap 4 in de verdieping (onderdeel 4). De verdieping blijft 0 duel, 1 duel, 2 druk, 3 werkplek, 4 open. Zit ik ernaast, dan hoor ik het graag.

**Wat dit in de bouw verandert.**
- **Onderdelen 3 en 4 worden samen één onderdeel.** In `QuizTest.jsx` komt na de laatste basisvraag de werkomgevingsvraag als stap 10, met dezelfde balk en teller.
  - De teller rekent met `BASIS_VRAGEN.length + 1` en loopt niet meer via `BASIS_VRAGEN`. Zo blijft de scoring (`nextBasis`, r. 471–480) ongemoeid.
  - De knoptekst "Naar mijn profiel" (r. 568) verhuist van vraag 9 naar vraag 10.
  - Opties niet schudden, één kolom en één antwoord.
  - De regel `pickOne` hergebruiken.
  - De privacyregel komt alleen op het web, of ook in de app? Dat is een vraag aan de redacteur.
  - Geen `IS_NATIVE`-voorwaarde meer.
- **Eyebrows.** `werkomgeving.eyebrowWeb` ("Voor je team · werkomgeving") en `eyebrowApp` ("Verdieping · werkomgeving") passen niet meer bij een gewone tiende vraag. Ik herschrijf ze niet zelf. Zelfde vraag aan de redacteur: geen eyebrow, of een nieuwe?
- **Het getal staat op 18 plekken los in de tekst** (het getal in de quizkop komt vanzelf uit de code en hoeft niet mee):

| Bestand | NL | EN |
|---|---|---|
| `intro.js` r. 21 | "Negen vragen, ongeveer vijf minuten." | "Nine questions, about five minutes." |
| `native.js` r. 14 (startscherm app, de enige plek waar de app het getal noemt) | "Negen vragen, vijf minuten." | "Nine questions, five minutes." |
| `quizInApp.js` r. 31 | "negen vragen, ongeveer vijf minuten" | "nine questions, about five minutes" |
| `admin.js` nl r. 124 / en r. 113 (welkomstmail) | "negen vragen, ongeveer vijf minuten" | idem |
| `teamDashboard.js` nl r. 72 / en r. 49 | "negen vragen, ongeveer vijf minuten" | idem |
| `teamDashboard.js` nl r. 155 / en r. 118 (deeltekst) | "Iedereen vult negen vragen in…" | "Everyone answers nine questions…" |
| `teamDynamics.js` nl r. 290 / en r. 258 (deeltekst) | "Iedereen vult negen vragen in…" | idem |
| `contribute.js` nl r. 85 / en r. 81 (deeltekst) | "negen vragen over hoe ik werk" | "nine questions about how I work" |
| `quiz.js` nl r. 66 / en r. 49 | "op basis van je negen antwoorden" | "based on your nine answers" |

  - De laatste rij klopt nog steeds: het profiel rust op negen antwoorden, want vraag 10 telt niet mee. Die laat ik staan, tenzij de redacteur anders beslist.
  - Buiten de repo: de storeteksten (`content/storeteksten-persona-app.md` in het marketingproject) en de geheugenregel "negen vragen · vijf minuten". Die zijn voor het marketingteam.
  - Of "± 5 minuten" blijft staan, is aan Judith en de redacteur. Eén vraag met vier knoppen kost ongeveer tien seconden (UX §3).
- **Commentaar.** Het commentaar in `quizTestData.js:97`, `nl/quizData.js:14`, `en/quizData.js:14`, `nl/quiz.js:25` en `QuizTest.jsx:527` zegt nog "9 vragen". Dat werk ik bij in dezelfde commit.
- **Dekking.** Iedereen die de app gebruikt, beantwoordt de vraag nu. Elk nieuw profiel dat via Bijdragen binnenkomt heeft dus een `pk`. De losse link (onderdeel 8) blijft nodig voor de profielen van vóór de livegang.
- **App-versie.** Het tellen gaat pas mee met de volgende store-build. Tot die tijd staat er in de oude app "negen vragen", en die is daar ook waar. Pas ik de webteksten (welkomstmail, teamdashboard, deelteksten) eerder aan, dan zeggen die "tien" terwijl de app in de stores nog negen vraagt. Het voorstel is daarom: de teksten achter dezelfde schakelaar, of pas aanzetten als de nieuwe appversie live staat.

Keuze 1 is daarmee beslist. Keuzes 2 tot en met 6 staan nog open, plus twee nieuwe vragen voor de redacteur: de eyebrow van vraag 10, en de nieuwe "tien vragen"-teksten in NL en EN.

---

### 9. Besluit Judith (16 nov 2026): eerst de app

**Eerst alleen de app.** De Supabase-kant (onderdelen 1, 2, 7 en 8, plus de opslag in Bijdragen) komt later, samen met keuzes 2 tot en met 5 (datum, schrijfrecht voor anon, dubbel tellen, webprofielen zonder code). In de app gaat niets naar een server, dus voor dit deel is de tabel nog niet nodig.

**Wat er in de app-ronde zit (voorstel, één commit per stap):**
1. **Schakelaar.** `PRIKKEL_ENABLED` in `src/experimental/featureFlag.js`, standaard **uit**. Aanzetten met `REACT_APP_PRIKKEL=1`.
2. **Vraag 10.** In `QuizTest.jsx` komt na de negende basisvraag de werkomgevingsvraag, in de teller ("10 / 10") en zonder score.
   - Vaste volgorde, één kolom, één antwoord.
   - Het antwoord gaat als `prikkel` in `scherpResult`, en zo vanzelf mee in het lokale profiel (`saveProfile`).
   - Teksten `werkomgeving.q` en `werkomgeving.a.*` in `quizData.js` (nl en en).
   - Opruimen: `hybride` en "negen plektypen".
3. **Regel in het eigen profiel.** Nieuw component `PrikkelRegel.jsx` in `ProfileScreen.jsx`, vóór `WatJouTrekt`. `ProfileScreen` is wat de app toont (`Results.jsx:245`). `ResultsProfileCard.jsx` (web) neem ik mee, zodat web en app gelijk lopen. Met de teksten `prikkelRegel.*` en `naamMv` in `archetypes.js`.
4. **Overdracht naar het team.** `pk` in `profileHandoff.js` (`VERSION` blijft 1), met een nieuwe test (oude link zonder `pk` werkt). Bijdragen leest `pk` al wel. Of Bijdragen het antwoord nu al toont, of pas als het ook opgeslagen wordt, is een vraag aan Judith. Tonen zonder opslaan klopt niet met de belofte "wordt apart bewaard". Mijn voorstel is daarom: in Bijdragen nog niets, dat komt met de Supabase-ronde. Er gaat met `pk` in de link niets verloren. Een app met `pk` die vóór de tabel live gaat, levert alleen antwoorden op die de website nog niet bewaart.

**Wat ik voor de app-ronde nog nodig heb (teksten, die schrijf ik niet zelf):**
- de **eyebrow boven vraag 10**: de bestaande `eyebrowApp` "Verdieping · werkomgeving" klopt niet meer. Geen eyebrow, of een nieuwe?
- **"Tien vragen"** in de app-teksten: `native.js` r. 14 (startscherm) en `intro.js` r. 21, in NL en EN. De webteksten (welkomstmail, deelteksten) wachten tot de nieuwe appversie live is.
- de privacyregel: in de app niet tonen, zoals de UX-uitwerking zegt ("daar gaat niets weg zonder de stap op Bijdragen"). Dat is wat ik doe, tenzij Judith anders wil.

Bouwen begint pas na een expliciet "ga bouwen".

---

## Ronde 2: de app (16 november 2026)

Gebouwd na het "ga bouwen" van Judith, in de omvang van §9 (eerst de app). Op de branch **`prikkelbehoefte-app`**, vier commits, niet gepusht en niet gemerged in `main`. Niets op Supabase.

### 1. Commits

| Commit | Wat |
|---|---|
| `e826f68` | Schakelaar `PRIKKEL_ENABLED` in `src/experimental/featureFlag.js`, standaard **uit** (`PRIKKEL_DEFAULT = false`, env `REACT_APP_PRIKKEL`) |
| `c804e41` | Vraag 10 "werkomgeving" in `QuizTest.jsx`, teksten in `quizData.js` (nl en en), `hybride` en "negen plektypen" opgeruimd |
| `7405d7b` | Regel "Geluid om je heen" in het eigen profiel: `src/lib/prikkel.js` (regels en tests), `src/components/result/PrikkelRegel.jsx`, geplaatst in `ProfileScreen.jsx` (app) en `ResultsProfileCard.jsx` (web), teksten in het nieuwe `copy/{nl,en}/prikkelRegel.js`, `naamMv` in `archetypes.js` |
| `063ed7d` | Optioneel `pk` in `src/lib/profileHandoff.js` (`VERSION` blijft 1) met de nieuwe `profileHandoff.test.js` |

### 2. Hoe het werkt

**Vraag 10**
- Na de negende basisvraag komt de werkomgevingsvraag, op hetzelfde scherm als een basisvraag: balk, teller "10 / 10" en de regel "Kies 1 antwoord".
- De knop bij vraag 9 heet nu "Volgende vraag", bij vraag 10 "Naar mijn profiel". Daarna volgt het keuzescherm zoals altijd.
- Opties in vaste volgorde, één kolom, ook op desktop. Een tweede klik op hetzelfde antwoord laat het staan, een klik op een ander antwoord wisselt.
- Telt niet mee in de score. De scoring loopt alleen over `BASIS_VRAGEN`, en `WEIGHTS`, `BUMP` en de archetypevolgorde zijn niet aangeraakt.
- Het antwoord staat als `prikkel` in `scherpResult` en gaat zo mee in het lokale profiel.
- Op het web werkt het ook in dezelfde component, maar daar is de vragenlijst dicht (zie §1).
- De kop op desktop zegt nu vanzelf "10 vragen · ± 5 minuten", want het getal komt uit de code.

**Profielregel**
- Alleen Denker of Presteerder met "reuring", en Verbinder of Vernieuwer met "stil".
- Opmaak als `WatJouTrekt`, maar de zin in 14 px broodtekst. De regel staat vóór "Wat jou naar kantoor trekt".

**Overdracht**
- `pk` gaat alleen mee als het antwoord een van de vier sleutels is.
- Bij het lezen geldt: onbekend wordt `null`, en een oude link geeft `prikkel: null`.
- `Bijdragen.jsx` is **niet** gewijzigd. Het toont het antwoord niet en bewaart het niet. Dat komt met de Supabase-ronde (zie §9).

### 3. Tests

`CI=true npx react-scripts test --watchAll=false`: **4 suites, 32 tests, allemaal geslaagd**. Nieuw zijn:
- `src/lib/prikkel.test.js` (4):
  - alleen de vier sleutels zijn geldig;
  - Denker en Presteerder krijgen alleen een regel bij reuring;
  - Verbinder en Vernieuwer krijgen alleen een regel bij stil;
  - Maker, Groeier, Teamspeler en Zekerzoeker krijgen nooit een regel.
- `src/lib/profileHandoff.test.js` (5):
  - **een oude link zonder `pk` werkt nog**;
  - zonder antwoord gaat er geen `pk` mee;
  - heen en terug met `reuring`;
  - een onbekende of geknoeide waarde wordt `null` en het profiel blijft geldig;
  - `v: 2` wordt nog steeds geweigerd.

Productiebuild (`CI=false GENERATE_SOURCEMAP=false npx react-scripts build`): **Compiled successfully**, zonder lintwaarschuwingen, +1,57 kB gzip.

### 4. Preview (375 × 812, app-modus met `REACT_APP_PRIKKEL=1`)

De previewservers `prikkel-native` (3007) en `prikkel-web` (3006) staan in `.claude/launch.json`. Die map valt buiten git.

| Beeld | Bestand |
|---|---|
| Vraag 10 in de app, NL | `docs/prikkel-preview/vraag10-app-nl.jpg` |
| Profielregel, Denker met reuring, NL | `docs/prikkel-preview/profielregel-app-nl.jpg` |
| Profielregel, Verbinder met stil, EN | `docs/prikkel-preview/profielregel-app-en.jpg` |

Wat ik verder heb gecontroleerd:
- Doorgeklikt van 1/10 tot 10/10. Na "Naar mijn profiel" staat `prikkel: 'reuring'` in `tof_native_profiles`.
- Denker met "geroezemoes" geeft geen regel.
- De profielregel is 148 px hoog (NL).
- De verzonnen uitslagen in de preview zijn met de hand in `localStorage` gezet. Het zijn geen deelnemersdata.

Niet gemaakt: vraag 10 in het Engels en vraag 10 op het web of desktop. De Engelse vraag staat letterlijk in `en/quizData.js`.

### 5. Bewijs dat de schakelaar uit staat

1. `src/experimental/featureFlag.js`: `const PRIKKEL_DEFAULT = false;`. Zonder `REACT_APP_PRIKKEL` is `PRIKKEL_ENABLED` dus `false`. De productiebuild hierboven is zonder die variabele gemaakt.
2. Op de gewone previewserver `persona-app-native` (3003, zonder variabele) de vragenlijst doorgeklikt:
   - de teller loopt tot "9 / 9";
   - bij vraag 9 staat "Naar mijn profiel", en daarna volgt direct het keuzescherm;
   - het bewaarde profiel heeft **geen** veld `prikkel`.

   Zonder `prikkel` verschijnt er geen profielregel en gaat er geen `pk` mee.

### 6. Nog open

- **Teksten (redacteur):**
  - "Tien vragen" in `native.js` r. 14 en `intro.js` r. 21 (nl en en). Die zeggen nog "Negen". Met de schakelaar aan is dat onjuist, dus ze moeten mee vóór de schakelaar aangaat.
  - De webteksten (welkomstmail, deelteksten, teamdashboard) volgen pas als de nieuwe appversie live staat (§8).
  - Een eyebrow boven vraag 10 is niet nodig gebleken. Het scherm is gelijk aan een basisvraag, en op de telefoon staat daar geen eyebrow. De sleutels `werkomgeving.eyebrowWeb` en `eyebrowApp` zijn dus niet gebruikt.
- **`naamMv`** staat alleen bij de vijf werkstijlen uit het tekstenbestand.
- **App-versie:** gaat mee met de eerstvolgende store-build na 1.0.6, met de schakelaar aan. Judith bouwt en dient in.
- **Later (Supabase-ronde):** tabel en leesfunctie, opslaan via Bijdragen, de regel "Je werkomgeving" in Bijdragen, het teamblok, de losse link en de kopieerknop. Daarbij horen keuzes 2 tot en met 5.
- **Pushen:** alleen na een expliciet "push" voor deze opdracht. Eerst moet de branch in `main`.

---

### 7. Besluit Judith (16 nov 2026): altijd aan, geen schakelaar

Commit `feat(prikkel): altijd aan, geen schakelaar`:
- `PRIKKEL_ENABLED` is weg uit `featureFlag.js`, `QuizTest.jsx` en `PrikkelRegel.jsx`.
- Vraag 10 staat altijd na de basisvragen. `prikkel` staat altijd in `scherpResult`.
- De profielregel verschijnt zodra het antwoord tegen de werkstijl in gaat.

**Gecontroleerd:**
- 32 tests geslaagd en de build compileert.
- Op de gewone previewserver `persona-app-native`, zonder env-variabele:
  - de teller loopt van 1 / 10 tot 10 / 10;
  - vraag 10 verschijnt, op desktop met de kop "10 vragen · ± 5 minuten";
  - het antwoord `stil` staat in het bewaarde profiel.

§5 ("Bewijs dat de schakelaar uit staat") geldt daarmee niet meer.

**Gevolg voor de teksten:** "Negen vragen" in `native.js` r. 14 (startscherm van de app) en `intro.js` r. 21 (nl en en) klopt in de app niet meer zodra deze code in een store-build zit. De webteksten (welkomstmail, teamdashboard, deelteksten) zeggen ook "negen" en horen bij de app-versie die mensen downloaden, dus die kunnen pas mee als de nieuwe app in de stores staat.

**Web:** de webquiz is dicht, dus op het web verandert er voor bezoekers niets. Mergen in `main` en pushen kan veilig. De app krijgt het pas met de volgende store-build.

### 8. "9 wordt 10", overal (besluit Judith 16 nov 2026)

Commit `ec914ee`, NL en EN:
- **In de app:** het startscherm (`native.js` r. 14) en de intro (`intro.js` r. 21).
- **Op het web:** het storescherm (`quizInApp.js` r. 31), de welkomstmail in /admin (`admin.js`) en de stappen op het teamdashboard (`teamDashboard.js` r. 72/49).
- **De drie deelteksten:** `teamDashboard.js`, `teamDynamics.js` en `contribute.js`.
- **Commentaar:** in `quiz.js` en `QuizTest.jsx`.
- Het getal in de quizkop en in de teller komt uit de code en zegt al "10".

Gecontroleerd:
- in de app-preview: het startscherm toont "Tien vragen, vijf minuten" en "Ten questions, five minutes";
- 32 tests geslaagd en de build compileert.

**Bewust niet aangepast:**
- `quiz.js` r. 66 / en r. 49, "Dit is je profiel, op basis van je negen antwoorden.": dat klopt, want vraag 10 telt niet mee in de score. Met "tien" zou de zin onwaar worden.
- Het commentaar "Basis — 9 vragen" in `quizData.js` en `quizTestData.js`: dat gaat over de negen basisvragen.
- Oude terugkoppelingen (`terugkoppeling-vragenlijstduur.md`) en de als verouderd gemarkeerde `docs/store-teksten.md`: dat is historie.
- De gebouwde bundels in `ios/` en `android/`: die worden bij de volgende `cap sync` vervangen.

**Buiten de repo, nog "negen":** `tof-marketingteam/content/storeteksten-persona-app.md`. Daar staan de Apple-ondertitel ("Hoe jij werkt in negen vragen" / "How you work in nine questions"), de korte omschrijving voor Google en de lange omschrijvingen in NL en EN.

**Let op het moment van live gaan:** de webteksten (storescherm, welkomstmail, deelteksten) zeggen nu "tien". De app in de stores (1.0.6 en ouder) vraagt nog negen. Pushen naar `main` kan dus het best samenvallen met de nieuwe app in de stores.

### 9. Storeteksten op tien (akkoord Judith 16 nov 2026)

- **`tof-marketingteam/content/storeteksten-persona-app.md`.** Die map staat niet in git; de reservekopie van vóór de wijziging staat in de kladmap van deze sessie.
  - Nieuwe teksten en tekenaantallen:

    | Veld | NL | EN |
    |---|---|---|
    | Ondertitel Apple | "Hoe jij werkt in tien vragen" (28/30) | "How you work in ten questions" (29/30) |
    | Korte omschrijving Google | (66/80) | (70/80) |
    | Promotietekst Apple | (139/170) | (150/170) |

  - In beide lange omschrijvingen: "Tien vragen" en "Ten questions".
  - Bovenaan een gedateerde notitie: pas in de winkels aanpassen als de app met de tiende vraag live staat.
  - De historische alinea's in §8 (15 okt) blijven, met één aanvulling.
- **`docs/store-teksten.md` (dit repo, commit `1f19432`).** Het document is verouderd, maar de notities voor de beoordelaar en de opname-instructie zijn nog in gebruik. Die zeggen nu "ten questions" en "alle tien vragen".

**Nog "negen" in andere marketingbestanden** (niet aangepast, niet gevraagd):
- de skills `tof-schrijfstijl`, `tof-positionering` en `tof-persona-inhoud`;
- `websiteteksten.md`, `propositie.md`, `klantreis-teamcode.md`, `advies-website-na-app.md`;
- de Lovable-prompts, `strategie-nov-dec-2026.md`, `kalender.md` en de concepten.

Gepubliceerde LinkedIn-posts en archieven blijven zoals ze zijn.
