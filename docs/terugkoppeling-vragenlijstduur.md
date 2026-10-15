# Terugkoppeling — duur en aantal vragen van de vragenlijst

Opgesteld 15 oktober 2026, in opdracht van de marketingsessie die de propositie
van de Persona-app heeft herzien. Alle regelnummers verwijzen naar de staat van
het repo op het moment van schrijven (branch `main`, werkmap-wijzigingen nog
niet gecommit).

---

## Controle van de beweringen

### 1. Negen basisvragen — **klopt**

`src/i18n/copy/nl/quizData.js:15` opent de array `basis`; daarin staan negen
objecten met een `q`-sleutel, op de regels 17, 30, 43, 56, 69, 82, 95, 108 en
121. De array sluit op regel 133. De Engelse tegenhanger
`src/i18n/copy/en/quizData.js` heeft eveneens exact negen `q`-sleutels, dus de
talen lopen gelijk. De comment-regel `quizData.js:14` ("Basis — 9 vragen")
bevestigt het.

Het aantal wordt nergens hard ingetypt in de schil: `quiz.js` krijgt het door
als parameter (`eyebrow: (count) => …`) en `QuizTest.jsx:533` vult daar
`BASIS_VRAGEN.length` in. Het getal op het scherm volgt dus automatisch de data.

### 2. QuizTest is de echte vragenlijst, web én app — **klopt**

`src/App.js:145-149`:

```
case 'quiz':
  // De verkorte quiz (voorheen "QuizTest") is nu de echte vragenlijst.
  // Hij slaat zelf op in Supabase en toont het profiel intern, dus
  // setResultData is hier niet meer nodig.
  return <QuizTest setPage={navigate} />;
```

Er is één `case 'quiz'` en die is niet platform-afhankelijk. Er bestaat geen
tweede quizcomponent meer: `src/components/Quiz.jsx` is verwijderd in commit
`9438e6b` ("chore: verwijder de zeven overgebleven onbereikbare bestanden"). Web
en app draaien dus gegarandeerd dezelfde negen vragen uit dezelfde databron.

### 3. De verdieping is optioneel — **klopt, met één correctie in je formulering**

De fase-reeks staat in `QuizTest.jsx:320`: `intake | basis | keuze |
verdieping | onthulling | profielScherp`. Op het keuzescherm staan twee knoppen
(`QuizTest.jsx:596` en `:601`): `verdiepen()` zet fase `verdieping`,
`onthullen()` slaat die over en gaat rechtstreeks naar `onthulling`. De
verdieping wordt dus niet standaard doorlopen — je bewering houdt stand en er is
geen reden om te stoppen.

**Correctie:** het pad heet niet "ik ben klaar". Die tekst bestaat niet meer. In
`src/i18n/copy/nl/quiz.js:40` staat `done: 'Toon mijn profiel'`. De label is
veranderd in commit `5314a5f`. Inhoudelijk verandert dat niets aan je punt, maar
citeer de knop niet verkeerd in de propositie.

**Tweede correctie, en deze raakt de propositie wél:** de andere knop luidt
`refine: 'Ja, maak scherper (3 min)'` (`quiz.js:39`). Daar staat een vierde
getal dat niet in je lijst voorkwam. Zie "Nog gevonden".

### 4. Het vragenscherm toont al de juiste tijd — **genuanceerd**

De strings zijn er en zijn correct: `src/i18n/copy/nl/quiz.js:9` geeft
`${count} vragen · ± 5 minuten`, `src/i18n/copy/en/quiz.js:2` geeft
`${count} questions · about 5 minutes`.

Maar die regel wordt **alleen op desktop gerenderd**.
`QuizTest.jsx:533` luidt:

```
{!isMobile && <Eyebrow>{t.eyebrow(BASIS_VRAGEN.length)}</Eyebrow>}
```

De kop is op mobiel bewust weggehaald om de vraag op één schermhoogte te laten
passen (commit `5314a5f`). Gevolg: **in de app ziet niemand deze regel ooit**,
want de app draait altijd op een mobiel formaat. Ook een bezoeker op een
telefoon op het web ziet hem niet.

In de preview geverifieerd op breedte 1280: NL toont `9 VRAGEN · ± 5 MINUTEN`,
EN toont `9 QUESTIONS · ABOUT 5 MINUTES`. Op breedte 362 verdwijnen beide.

Dat betekent dat jouw aanname "het vragenscherm toont het al, dus de rest moet
mee" voor de app niet opgaat: in de app is het **startscherm** (`native.js`) de
enige plek waar de gebruiker het getal te zien krijgt. Die string is nu
aangepast, dus het resultaat is goed — maar de reden is anders dan je dacht.

### 5. Alle genoemde vermeldingen zijn onjuist en stammen van een 16-vragenlijst — **klopt, inclusief de herkomst**

De zestien strings bestaan alle zestien, exact op de door jou genoemde plekken.
Een zoekactie op `kwartier|15 minut|fifteen minut|paar minuten|few minutes|30
stellingen|30 statements` over heel `src/` gaf vóór de wijziging precies zestien
treffers in twaalf bestanden — niet één meer, niet één minder. Je lijst was dus
volledig.

De herkomst is hard te maken: `src/data.js:144` exporteert nog een `QUESTIONS`-
array en die telt **exact zestien** vragen (geteld: 16 objecten, 16 `q`-
sleutels). Die export wordt nergens meer geïmporteerd — de enige andere
`QUESTIONS`-treffers in de codebase zijn een lokale `const` in
`StrategischKompasReview.jsx:34`. Het is dode code uit de oude quiz. Dat maakt
"overblijfselen van een langere vragenlijst van zestien vragen" geen aanname
maar een vaststelling.

---

## Wat is gewijzigd

Zestien strings in twaalf bestanden, plus één regel in een document. Niets
anders.

| Bestand | Regel | Van | Naar |
| --- | --- | --- | --- |
| `src/i18n/copy/nl/home.js` | 11 | `Duurt ongeveer 15 minuten` | `Negen vragen · ongeveer 5 minuten` |
| `src/i18n/copy/en/home.js` | 11 | `Takes about 15 minutes` | `Nine questions · about 5 minutes` |
| `src/i18n/copy/nl/intro.js` | 21 | `Ongeveer 15 minuten. …` | `Negen vragen, ongeveer vijf minuten. …` |
| `src/i18n/copy/en/intro.js` | 21 | `About 15 minutes. …` | `Nine questions, about five minutes. …` |
| `src/i18n/copy/nl/native.js` | 14 | `Negen vragen, een paar minuten. …` | `Negen vragen, vijf minuten. …` |
| `src/i18n/copy/en/native.js` | 14 | `Nine questions, a few minutes. …` | `Nine questions, five minutes. …` |
| `src/i18n/copy/nl/quizInApp.js` | 20 | `Doe de test — een paar minuten, …` | `Doe de test — vijf minuten, …` |
| `src/i18n/copy/en/quizInApp.js` | 20 | `Take the test — a few minutes, …` | `Take the test — five minutes, …` |
| `src/i18n/copy/nl/teamIntro.js` | 18 | `… in een paar minuten, …` | `… in vijf minuten, …` |
| `src/i18n/copy/en/teamIntro.js` | 10 | `… in a few minutes, …` | `… in five minutes, …` |
| `src/i18n/copy/nl/admin.js` | 108 | `(15 minuten per persoon)` | `(5 minuten per persoon)` |
| `src/i18n/copy/en/admin.js` | 96 | `(15 minutes each)` | `(5 minutes each)` |
| `src/i18n/copy/nl/admin.js` | 111 | `Vul de quiz in — ~30 stellingen` | `Vul de vragenlijst in — negen vragen` |
| `src/i18n/copy/en/admin.js` | 99 | `— around 30 statements` | `— nine questions` |
| `src/i18n/copy/nl/admin.js` | 151 | `… een kwartiertje mee bezig.` | `… vijf minuten mee bezig.` |
| `src/i18n/copy/en/admin.js` | 138 | `… about fifteen minutes.` | `… about five minutes.` |

Daarnaast `docs/store-teksten.md:3-8`: een blokcitaat bovenaan dat het document
als verouderd markeert en doorverwijst naar
`content/storeteksten-persona-app.md` in het marketingproject, met de vermelding
dat §3 en §4 nog "een paar minuten" noemen. De rest van het document is
onaangeroerd.

### Verificatie

1. Zoekactie op alle acht patronen over `src/`: **nul treffers**. De bewust
   gespaarde teksten staan er nog (zeven treffers op `last-minute` /
   `30 minuten` / `tien minuten`, verdeeld over `data.js`, `archetypes.js`
   NL+EN, `quizData.js` NL+EN en `strategicCompass.js`).
2. `CI=false GENERATE_SOURCEMAP=false npx react-scripts build` → "The build
   folder is ready to be deployed", geen nieuwe fouten.
3. In de preview nagelopen op breedte 1280, beide talen: homepage
   (`Negen vragen · ongeveer 5 minuten` / `Nine questions · about 5 minutes`),
   introscherm (`Negen vragen, ongeveer vijf minuten` / `Nine questions, about
   five minutes`) en vragenscherm (`9 VRAGEN · ± 5 MINUTEN` /
   `9 QUESTIONS · ABOUT 5 MINUTES`). Alle zes schermen noemen hetzelfde getal.
4. Beide mailteksten in beide talen volledig doorgelezen; geen overgebleven
   tegenstrijdigheid. De zelftegenspraak in de testermail is weg: "vijf minuten"
   boven en "Na negen vragen zie je je eigen persona" zes regels later staan nu
   met elkaar in lijn.

---

## Wat niet is gewijzigd en waarom

- **`src/data.js`, de scoring, `quizData.js`, de archetype-volgorde en alle
  componenten.** Buiten scope, zoals opgedragen. Geen vraag toegevoegd,
  weggelaten of verplaatst.
- **De dode `QUESTIONS`-array in `src/data.js:144`.** Zestien vragen, nergens
  geïmporteerd. Opruimen viel buiten de scope en het is geen tekststring. Zie
  "Nog gevonden" — ik raad aan dit apart op te pakken.
- **`refine: 'Ja, maak scherper (3 min)'` (`quiz.js:39`) en de Engelse
  tegenhanger.** Dit is een vierde getal dat je niet had opgemerkt, maar het
  stond niet in de opdrachtlijst en het is voor zover ik kan nagaan correct. Ik
  heb het niet aangeraakt. Beslissing is aan jou; zie hieronder.
- **De regel in `quiz.js:66`** (`'Dit is je profiel, op basis van je negen
  antwoorden.'`) — klopt al, niets aan te doen.
- **`docs/store-teksten.md` zelf.** Alleen de verwijzende regel toegevoegd, niet
  herschreven, conform opdracht.
- **Niet gecommit en niet gepusht.** Alles staat als werkmap-wijziging klaar.

---

## Nog gevonden

Vijf dingen die niet in je lijst stonden en die je propositie raken.

**1. De verdieping draagt een eigen tijdsbelofte: "3 min".**
`src/i18n/copy/nl/quiz.js:39` → `refine: 'Ja, maak scherper (3 min)'`. In het
Engels staat hetzelfde. Dit is het vierde getal waar je naar vroeg. Het is niet
fout, maar het betekent dat de volledige flow inclusief verdieping op ongeveer
acht minuten uitkomt. Als de propositie "vijf minuten" buiten de app gaat
claimen, is het eerlijker te zeggen dat de kern vijf minuten is en dat er een
optionele verdieping van drie minuten achter zit. Anders voelt wie beide doet de
belofte alsnog overschreden — precies het mechanisme dat je met deze opdracht
wilde wegnemen.

**2. Twee van de zestien strings zijn op dit moment onzichtbaar.**
`src/i18n/copy/nl/quizInApp.js` en de Engelse tegenhanger worden **nergens
geïmporteerd**. Ze staan niet in `src/i18n/copy/nl/index.js` (die registreert
wel `quiz` en `quizData`, regels 15-16 en 45-46) en komen in heel `src/` alleen
in hun eigen bestand voor. Dit is voorbereide copy voor het moment dat de
webquiz dichtgaat en `/quiz` naar de app verwijst — een scenario dat volgens de
projectdocumentatie bewust níet is gebouwd. De wijziging is correct en
toekomstvast, maar reken er niet op dat hier vandaag iets verandert voor een
bezoeker.

**3. Het aantal vragen staat nergens dubbel geadministreerd, de duur wél.**
`QuizTest.jsx:533` leidt "9" af uit `BASIS_VRAGEN.length`, dus dat getal kan
nooit meer uit de pas lopen met de data. De vijf minuten zijn daarentegen op
twaalf plekken los ingetypt, nu dertien met de verdiepingsknop. Als de
vragenlijst ooit weer van lengte verandert, loopt dit opnieuw uiteen. Overweeg
één `duration`-sleutel in de i18n-laag waar de rest naar verwijst. Dat is een
codewijziging en viel buiten deze opdracht.

**4. De dode 16-vragenlijst staat nog in de repo.**
`src/data.js:144` exporteert `QUESTIONS` met zestien vragen, zonder enige
afnemer. Dit is de bron van de verwarring die je hebt opgespoord. Zolang die
array er staat, kan iemand hem opnieuw voor de waarheid aannemen. Aanbeveling:
verwijderen in een losse commit, buiten deze tekstwijziging om.

**5. Eén kleine onnauwkeurigheid in je keeper-lijst.**
Je noemde `teamDynamics.js` als bestand waar `last-minute` mag blijven staan. Op
`last-minute`, `minuut`, `minuten` of `minute` geeft dat bestand nul treffers,
in geen van beide talen. Verder klopt de keeper-lijst wel: `archetypes.js`
(NL 2×, EN 1×), `data.js`, `quizData.js` (NL+EN) en de 30 minuten in
`strategicCompass.js:195` staan er alle nog. Geen gevolg, maar neem
`teamDynamics.js` uit het lijstje.

---

## Gevolgen voor de propositie

**"Negen vragen" is onvoorwaardelijk houdbaar.** Eén databron, negen items,
dezelfde in web en app, en het schermgetal wordt uit de array berekend in plaats
van ingetypt. Dit kan zonder voorbehoud de propositie in.

**"Vijf minuten" is houdbaar voor wat de gebruiker zich verplicht, maar niet voor
de volledige flow.** De negen basisvragen zijn het enige waaraan iemand zich bij
de start bindt: na vraag negen staat er een keuzescherm met een knop die
rechtstreeks naar het profiel gaat. Daarmee dekt vijf minuten de belofte die je
op het introscherm doet. Maar de app biedt op datzelfde scherm een verdieping
aan met een eigen label "(3 min)", en wie die doet is ruim acht minuten bezig.

Mijn advies: claim "negen vragen, vijf minuten" voor de kern en benoem de
verdieping als optioneel extraatje in plaats van hem te verzwijgen. Dat is
verifieerbaar waar op elk niveau en het geeft de verdieping bovendien iets te
doen in het verhaal.

**Eén punt om bij de appstore-teksten in de gaten te houden.** De regel met de
duur is in de app alleen zichtbaar op het startscherm, niet op het vragenscherm
(`QuizTest.jsx:533`, mobiel verbergt de kop). Als de store-tekst "negen vragen,
vijf minuten" belooft, is het startscherm de enige plek waar de gebruiker dat
terugziet. Die string is nu gelijkgetrokken, dus het sluit aan — maar er is geen
tweede plek die het nog bevestigt.

Geen enkel feit dat ik ben tegengekomen maakt "negen vragen, vijf minuten"
onhoudbaar. Ik heb geen getal verzonnen: alle vijf-minutenvermeldingen leunen op
de bestaande, al goedgekeurde regel in `quiz.js:9`, die er vóór deze opdracht al
stond.
