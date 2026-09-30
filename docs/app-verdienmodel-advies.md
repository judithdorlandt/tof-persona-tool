# Verdienmodel en gegevensopslag — advies

*30 september 2026 · hoort naast `privacy-en-stores.md`*

Dit document legt vast wat er besloten is over de drie betaalde niveaus, wat er
wel en niet naar Supabase gaat, en wat dat betekent voor de bouwvolgorde. Het is
geen bouwopdracht: er staat bewust nog geen code tegenover.

Twee besluiten wegen zwaarder dan de rest en staan daarom vooraan. De app moet
**zelf omzet dragen** en is niet alleen een verkoopkanaal voor de webversie. En:
het individuele deel blijft **voor altijd werken zonder account**. Dat tweede is
de voorwaarde waarmee het eerste te bouwen is zonder iets terug te draaien — en
waarmee fase 8 gewoon door kan (§1 en §9).

---

## 0. Het advies in zes regels

1. "De app draagt zelf de omzet" betekent in de praktijk: de app is de plek waar
   een **door de organisatie gekochte** licentie wordt gebruikt. Niet: de
   medewerker betaalt in de app. Die tweede vorm heb je zelf al afgewezen.
2. Daarmee komen er accounts en synchronisatie in de app. Vijf van de acht fasen
   blijven staan, twee veranderen, één (privacy) moet opnieuw.
3. Verkoop blijft buiten de app: geen prijzen, geen koopknop, alleen inloggen of
   een code invullen.
4. De gespreksvoorbereiding en de aantekeningen gaan nooit mee. Dat is nu geen
   privacystandpunt meer maar een productvoorwaarde: het is het enige deel dat
   niet werkt als het gedeeld kan worden.
5. Het individuele deel blijft werken **zonder account**, voor altijd. Besloten,
   en daarmee kan de app nu uit en komt de rest als toevoeging.
6. Uit je eigen punt 3 volgt een harde grens: leunt de grondslag op
   gerechtvaardigd belang, dan mag een leidinggevende geen individuele profielen
   zien. Dat botst met "naam mee bij goedkeuring" en heeft een uitweg — §3.

---

## 1. Het besluit dat de rest bepaalt

De vraag was: *is de app er om de webversie te verkopen, of moet de app zelf de
omzet dragen?* Jouw antwoord is het tweede geval.

Dat is een legitieme keuze, maar hij heeft twee lezingen die ver uit elkaar
liggen, en jouw andere antwoorden sluiten er één van uit.

**Lezing A — de medewerker betaalt.** Dan is het een consumentenproduct en is
in-app-aankoop verplicht, met 15 tot 30 procent commissie. Dit heb je in punt 4
zelf al afgewezen: individu blijft gratis. Deze weg valt dus af, en dat is goed
nieuws.

**Lezing B — de organisatie betaalt, de app is waar het gebruikt wordt.** De
teamcode of het bedrijfsaccount wordt buiten de app gekocht; de medewerker
gebruikt de app om zijn deel te doen en zijn leidinggevende om het teambeeld te
zien. Dit is het patroon van elke zakelijke app: je koopt niets in de app, je
gebruikt er iets in dat je werkgever heeft geregeld.

Lezing B is wat je bedoelt, en het verschil met "de app verkoopt de webversie"
is kleiner dan het lijkt — behalve op één punt. In het eerste geval hoeft er
nooit iets de app uit. In lezing B moet dat wél, want anders valt er niets te
gebruiken dat de organisatie heeft gekocht. Dat is de hele omslag, en daar hangt
de rest van dit document aan.

### Wat het je oplevert, en wat het je kost

Wat je koopt: een leidinggevende die zijn teambeeld op zijn telefoon heeft, een
organisatie die haar mensen niet hoeft te begeleiden naar een webadres, en een
product dat op zichzelf verkoopbaar is in plaats van een gratis bijlage.

Wat je betaalt: het label *Data Not Collected*, het argument "hij werkt volledig
offline", en de eenvoud van de store-inzending. Dat zijn precies drie van de vier
redenen die nu in `privacy-en-stores.md` staan waarom dit een app is en geen
website. De vierde — het resultaat als hart van de app, met aantekeningen en
gespreksvoorbereiding — blijft overeind, en dat is ook de enige die echt uniek
is. Het is dus geen ramp, maar het is wel een ander verkoopverhaal dan het
verhaal waarop fase 0 tot 7 is gebouwd.

### De voorwaarde — vastgelegd

**Het individuele deel blijft werken zonder account, zonder koppeling, voor
altijd.** Accounts en synchronisatie komen erbij, nooit ervoor. Dit is besloten,
en het is de belangrijkste regel in dit document: alles in §8 en §9 hangt eraan.
Het motief is niet principieel maar praktisch:

- Een update die inloggen verplicht maakt in een app die dat niet had, levert de
  slechtste reviews die je kunt krijgen, en die blijven staan.
- Zonder die garantie kun je de app niet nu uitbrengen, want alles wat je nu
  belooft zou je later intrekken (§7).
- De gespreksvoorbereiding werkt alleen als de medewerker zeker weet dat niemand
  meekijkt. Een account zet die zekerheid onder druk, ook als de gegevens lokaal
  blijven.

Met deze regel is lezing B te bouwen zonder dat er iets terug hoeft. Ze heeft
twee gevolgen die je later niet meer vrij kunt kiezen, dus ze horen hier:

- **Een account is altijd een tweede laag.** De app start niet op een inlogscherm
  en vraagt nooit een account voor iets wat nu al werkt. Wie inlogt, doet dat om
  er iets bíj te krijgen — zijn teambeeld, of het beheer van een team.
- **Wissen blijft compleet voor wie niet koppelt.** De knop "alles verwijderen"
  mag niet stilletjes onwaar worden. Voor wie wél koppelt komt er een tweede
  handeling naast (intrekken, §3), niet in plaats van.

---

## 2. Wat er naar de server gaat, en wat niet

Je noemde vier informatiebehoeften. Ze vragen niet allemaal hetzelfde.

| | Behoefte | Naar Supabase? |
| --- | --- | --- |
| a | Wat heeft dit team of bedrijf nodig in de werkomgeving | **Ja** |
| b | Als leidinggevende: waar presteert mijn team, waar schuurt het | **Ja** |
| c | Als medewerker: welke werkomgeving past bij mij, hoe wil ik begeleid worden | **Ja**, in dezelfde vorm als a en b |
| d | Input voor mijn bila's met mijn leidinggevende | **Nee — blijft op het toestel** |

### Waarom a en b niet zonder server kunnen

Dit zijn optelsommen over meer dan één persoon. Een teambeeld bestaat niet op
één toestel; het ontstaat pas als de uitslagen van acht mensen bij elkaar komen.
Dat is geen technische keuze maar een rekenkundige: zonder gedeelde opslag is er
niets om op te tellen. Je conclusie dat hier een database onder moet, is juist.

Dit deel bestaat al. De webversie schrijft uitslagen in `private.responses`,
`getResponsesByTeam` en `getResponsesByOrganization` halen ze eruit, en daar
hangen het teamdashboard, de teamdynamiek en de PDF *Organisatie-landschap* al
aan. Er hoeft geen nieuwe gegevenslaag te komen. Wat ontbreekt is één ding:
uitslagen die in de **app** ontstaan, komen er nu niet in.

### Waarom c erbij mag, en wat dat betekent

Behoefte c is geen apart gegeven. "Welke werkomgeving past bij mij" en "hoe wil
ik begeleid worden" zijn afleidingen uit dezelfde uitslag — ze worden in
`src/lib/resultDerivations.js` uit `primary/secondary/tertiary` en de scores
berekend, voor het web, de PDF en het app-profielscherm tegelijk. Wie de uitslag
heeft, heeft c er automatisch bij.

Dat maakt je keuze eenvoudig: door de uitslag te delen, deelt de medewerker zijn
werkomgevingsbehoefte en zijn begeleidingsvoorkeur mee. Er hoeft geen tweede,
extra deling voor te komen. Wel moet in de tekst bij het koppelen staan wat de
leidinggevende er dus uit kan lezen — niet alleen "je persona", maar ook "hoe jij
het liefst wordt aangesproken". Dat is geen bezwaar; het is de waarde. Maar het
moet erbij staan, anders is de verrassing later negatief.

### Waarom d er buiten blijft — nu een productvoorwaarde

Hier waren we het al eens en jij bevestigt het. Het argument staat in je eigen
copy: *wie weet dat zijn leidinggevende kan meelezen, schrijft niet op wat er
werkelijk speelt.* Let op de precieze werking. Het gaat er niet om of een manager
daadwerkelijk kan meelezen — dat zou je met rechten kunnen dichtzetten. Het gaat
erom dat de medewerker **niet kan wéten** dat het dicht staat. Zodra die velden
op een server staan, is de enige veilige aanname voor hem: iemand kan erbij. Het
gevolg is een leeg scherm, en daarmee is de functie stuk.

In het tweede geval (§1) is dit geen privacystandpunt meer maar een
productvoorwaarde. Als de app zelf de omzet moet dragen, is dit het enige deel
dat niet elders te krijgen is. Juist dat deel moet je dus niet aantasten.

Concreet blijven op het toestel:

- `notes` — de drie gespreksvragen (herkennen / loopt leeg / wil ik vragen)
- `pinned` — de vastgeprikte inzichten
- de volledige historie van eerdere profielen met hun aantekeningen

---

## 3. Naam of anoniem — en de grens die uit punt 3 volgt

Je regel: naam mee als de persoon die zelf heeft ingevuld en goedkeuring geeft,
anders anoniem. Dat kan, maar er zit een addertje in je eigen punt 3 dat de
uitwerking bepaalt.

### De botsing

In een werkgever-werknemerverhouding is toestemming een zwakke grondslag: door de
gezagsverhouding is de vraag of "vrijwillig" echt vrijwillig is. Daarom leun je
voor het teambeeld op gerechtvaardigd belang — en **dan** mag een leidinggevende
geen individuele profielen zien. Anders is het geen organisatieonderzoek meer
maar personeelsbeoordeling, en daarvoor is gerechtvaardigd belang niet genoeg.

Dat staat op gespannen voet met wat je in punt 1 en 5 wilt: namen erbij, zodat de
leidinggevende weet wie wie is.

### De uitweg: twee gescheiden routes

Het is oplosbaar, maar niet met één schuifje. Splits het in twee dingen die
juridisch en in de interface verschillend zijn.

**Route 1 — het teambeeld. Altijd zonder namen.** Grondslag: gerechtvaardigd
belang. De uitslagen gaan geaggregeerd het dashboard in: de mix, waar het
schuurt, wat het team nodig heeft in de werkomgeving. Geen lijst met personen,
geen export met namen, ook niet voor de manager. Plus een drempel: toon pas iets
vanaf **vijf** gekoppelde uitslagen, want in een team van vier is "anoniem" niet
anoniem — zeker niet als drie mensen hun naam wél gaven. Zo'n drempel is gangbaar
in medewerkersonderzoek en beschermt jou net zo goed als de medewerker.

**Route 2 — mijn profiel laten zien. Altijd een handeling van de medewerker.**
Niet een vinkje bij het koppelen dat de manager een naam in zijn database geeft,
maar een knop in de geest van *ik laat mijn profiel aan mijn leidinggevende zien*.
Dat is een handeling met een moment en een ontvanger, geen instelling. Daarmee is
de vrijwilligheid aantoonbaar, en het past bij hoe het in de praktijk gaat: je
neemt je profiel mee naar een gesprek.

Wat je dan **niet** bouwt, is een managerscherm met een lijst namen plus persona.
Dat is precies het scherm waar een OR of een privacy-officer op gaat staan, en
bij gemeenten en grotere organisaties komt die vraag zeker.

### Praktische details

**De naamkolom bestaat al.** `saveResponse` doet `String(profile.name || '')
.trim() || null`. Leeg blijft leeg, en de rij gaat gewoon mee in alle
aggregaties. Geen schemawijziging, geen aparte anonieme tabel.

**Vraag het bij het delen, niet bij de test.** In de app wordt de voornaam nu
alleen op het scherm gebruikt en niet bewaard — zo staat het ook in de
privacyverklaring. Laat dat zo. De naam hoort bij het moment van delen, met
standaard **uit**.

**Leg de toestemming vast.** Wie zich op toestemming beroept, moet kunnen
aantonen dat hij hem had: moment, en welke tekst er stond. Anders is het geen
toestemming maar een bewering.

**Intrekken moet kunnen, en dat vraagt nu een ontwerpkeuze.** Zonder account is
de enige manier om een rij later terug te vinden dat de app een verwijzing
bewaart. `saveResponse` doet bewust géén `.select()` na de insert (anon mag sinds
migratie 006 niet meer uit `responses` lezen) en geeft dus geen id terug. Voor de
app is daarom een eigen ingang nodig: een functie in de database die de rij
wegschrijft en alleen een id plus een geheim intrek-token teruggeeft, dat de app
lokaal naast het profiel bewaart. Dit is niet achteraf bij te bouwen: rijen die
zonder token zijn weggeschreven, zijn later niet meer te vinden.

---

## 4. Wat de drie niveaus verkopen

Je driedeling klopt. Nuttig is om te zien hoeveel er al staat.

### Individu — gratis

De app zoals hij nu is, en die moet ook zónder account blijven werken (§1).
Waarom gratis: zie §6.

### Afdeling/team — betaald, bestaat grotendeels

Het koopobject is de **teamcode**, en dat is geen nieuwe uitvinding: het is
`team_access_codes` (met `code`, organisatie, team, `level` en `active`), plus
`validateTeamAccessCode`, `membership` en `joinTeamByCode`. Er zit zelfs al een
ladder in het `level`-veld — `insight` (module 1), `dynamics` (module 2),
`strategic` (module 3) — dus een deel van je prijsdifferentiatie staat er al en
wordt nu alleen niet als zodanig verkocht.

Wat er nog bij moet, is licentie-administratie: hoeveel plekken er betaald zijn,
tot wanneer de code geldig is, en bij welk bedrijfsaccount hij hoort. Let op dat
je eigen model dit makkelijk maakt: "x personen betaald, onbeperkt personen
toevoegen" betekent dat het aantal een **prijsstaffel** is en geen slot. Je hoeft
dus niets te blokkeren, alleen te tellen en te factureren. Dat scheelt bouwwerk
en boze gebruikers.

### Bedrijf — betaald, moet echt gebouwd worden

Dit is het enige niveau dat nieuw is, en het is precies één ding: de klant krijgt
de knoppen die jij nu zelf in `/admin` indrukt, ingeperkt tot zijn eigen
organisatie. Zelf afdelingen en teams aanmaken, zelf codes uitgeven, zelf de
dashboards zien. Technisch is dat vooral een rechtenklus en een beheerscherm.

Advies: **bouw dit niet eerst.** Doe het handmatig zolang je het bij kunt houden.
Een nieuwe organisatie opzetten kost je nu minuten; die bouw kost dagen en legt
je vast op keuzes over organisatiestructuur die je pas goed kunt maken als je een
paar echte bedrijven van binnen hebt gezien.

---

## 5. Hoe een gratis individu uiteindelijk een teamaccount wordt

Je scherpste vraag: *als iedereen het gratis heeft ingevuld, hoe komt het dan
ooit bij mij als teamaccount terecht?* Drie motoren.

### Motor 1 — de code-ingang (de organisatie koopt, de app is er al)

Zodra er in de app een veld "ik heb een teamcode" zit, verandert een gratis
installatiebasis van een probleem in je beste verkoopargument. Een organisatie
die met jou begint, hoeft niets uit te rollen: haar mensen hebben de app al, of
halen hem in dertig seconden. Vergelijk dat met een aanbieder die eerst een
uitrol, accounts en wachtwoorden moet organiseren. De gratis versie is geen
weggeefactie maar voorwerk dat je niet meer hoeft te doen.

### Motor 2 — de doorvraag van onderop

Na het profiel hoort er één kaart te staan, in deze geest: *dit is jouw beeld.
Het wordt pas echt interessant als je het naast je team legt.* Met twee wegen:
"ik heb een teamcode" en "vraag je organisatie om TOF".

Die tweede knop moet de **mail van de gebruiker** openen met een kant-en-klare
tekst, precies zoals `InviteTesterCard` dat nu op de adminkant doet. Dus geen
formulier waarin de app een e-mailadres verzamelt — dat zou het privacyverhaal en
het Apple-label direct kosten. De medewerker verstuurt zelf; de app verzamelt
niets. Kleine constructie, groot gevolg: een leadkanaal zonder één gegeven op te
slaan.

### Motor 3 — je eigen trajecten

De omzet die er nu al is, zit in het gesprek eromheen: het jaartraject, het
Strategisch Kompas, het Organisatie-landschap. De app is daar het visitekaartje
en het voorwerk voor. Een leidinggevende die zelf de test heeft gedaan, is een
makkelijker gesprek dan een koude introductie.

### De prijs van deze aanpak, eerlijk benoemd

Je kunt niet meten hoeveel mensen bij bedrijf X de app gratis gebruiken. Geen
statistieken, geen installatietelling per organisatie, geen funnel. Wil je die
cijfers wél, dan is dat een expliciete ruil (analytics erin, label eruit) en geen
detail.

---

## 6. Waarom ik de gratis versie niet "minimaal" zou maken

Je schreef: de uitkomst voor het individu net het minimale bieden, zodat men
direct naar een teamaccount wil. Ik zou dat op één punt bijstellen — niet omdat
het doel verkeerd is, maar omdat het middel tegen je gaat werken.

**Een uitgeklede app leest als een demo.** In de stores betekent dat
eensterrenreviews in de geest van "je moet toch betalen", en die staan er
jarenlang. Erger: Apple weegt bij richtlijn 4.2 (minimale functionaliteit) of een
app op zichzelf iets waard is. Die toets wordt in het tweede geval (§1) juist
belangrijker, niet minder — want je bent dan twee van de andere argumenten
(offline, niets verzamelen) kwijt.

**Beperk in bereik, niet in diepte.** Geef het individu zijn volledige profiel:
de verdeling, zijn mix, wat energie geeft, wat leegloopt, de bricks, de
begeleidingsvoorkeur, de gespreksvoorbereiding. Dat is een compleet product en
het kost je niets, want het is er al. Wat het individu structureel *niet* kan
krijgen is het wij-beeld: de mix van zijn team, waar het schuurt, wat de afdeling
nodig heeft. Niet omdat je het achterhoudt, maar omdat het zonder collega's niet
bestaat.

Dat is de sterkere verleiding. "Ik zie wat dit over mij zegt en ik wil weten wat
het over ons zegt" komt uit tevredenheid. "Ik zie de helft" komt uit irritatie, en
irritatie koopt niets — die verwijdert de app.

---

## 7. Wat het in de stores kost

Hoofdstuk 4 van `privacy-en-stores.md` beschrijft wat er verandert zodra er iets
wordt verstuurd. Hieronder wat dat concreet betekent, in de twee vormen die er
zijn.

### Opt-in koppelen tegenover volledig syncen

| | Nu (alles lokaal) | Opt-in koppeling | Volledig syncen |
| --- | --- | --- | --- |
| Apple — collect data | No | **Yes** — Other Data, plus Name als de gebruiker die geeft | **Yes**, breder: ook alles wat je ongevraagd meestuurt |
| Apple — linked to you | n.v.t. | alleen bij naam | ja, zodra er een account is |
| Apple — tracking | No | No | No (geen cross-app-volgen) |
| Google — verzamelen | Nee | **Ja**, mét het vakje "optioneel" | **Ja**, zonder dat vakje |
| Versleuteld in transit | n.v.t. | ja (Supabase over https) | ja |
| Verwijderroute | wissen in de app | wissen **plus** intrekken | account verwijderen in de app (5.1.1(v)) |
| Wissen in de app is compleet | ja | ja, als je ook intrekt | **nee** — er blijft een servercopie |

Dat laatste vakje is het belangrijkste. Het privacyscherm in de app zegt nu dat
één knop alles wist. Bij volledig syncen is dat onwaar, en die tekst is niet met
een woordje te repareren: hij is de kern van het scherm.

Google's *optioneel*-aanvinkvakje is het verschil tussen "de gebruiker kiest" en
"wij nemen het". Dat vakje is het waard om de koppeling écht optioneel te houden,
ook technisch.

**Accountverwijdering.** Zodra de app accounts kent (lezing B in §1 vraagt daar
om zodra een manager moet inloggen), eist richtlijn 5.1.1(v) dat je je account in
de app kunt verwijderen — niet per mail, niet op de website. Dat is een scherm en
een serverfunctie, plus de vraag wat er dan met het teambeeld gebeurt waarin die
uitslag is meegeteld. Kies daar vooraf voor: uitslag weg, of uitslag anoniem
achterlatend. Beide zijn verdedigbaar, maar niet "dat zien we dan".

### Verkoop

1. Verkoopt de app aan een individu, dan is in-app-aankoop verplicht met 15 tot
   30 procent commissie. Vandaar dat lezing A in §1 afvalt.
2. Verkoopt de organisatie buiten de app om, dan mag dat — dat is het patroon van
   elke zakelijke app — maar je mag er in de app niet naar verwijzen. Die regels
   verschillen per land en zijn de laatste jaren in beweging, dus daar wil je niet
   op leunen. De veilige vorm is simpel: **in de app geen prijzen en geen
   koopknop, alleen inloggen of een code invullen.** Een codeveld is
   functionaliteit, geen verkoop. En de "vraag je organisatie om TOF"-mail is een
   bericht van de gebruiker, geen aanbod van de app.

### Het juridische spoor

Verwerkingsgrondslag, bewaartermijn en een verwerkersovereenkomst met Supabase
horen in de verklaring. Voor het teambeeld: gerechtvaardigd belang, met de
gevolgen uit §3. Voor namen: aantoonbaar vrijwillig en intrekbaar. Bij een
organisatiebrede uitrol kan de OR hier iets over willen zeggen. Dit is het punt
waarop je een jurist of privacy-officer wilt hebben, en bij gemeenten vragen ze
er zelf naar. Het hoort bij dit model, het is geen verrassing, maar het is ook
geen middagje werk.

---

## 8. Wat dit doet met fase 0 tot 7

Je zei: in het tweede geval moeten we fase 0 tot 7 niet afronden maar
heroverwegen. Dat is de goede reflex, maar het is preciezer dan dat — en
gunstiger. Vijf fasen blijven staan, twee veranderen, één moet opnieuw.

Let op wanneer: geen van deze wijzigingen hoeft vóór de release. Ze horen bij fase
9 (privacy) en fase 11 (de manager in de app) uit §9. De app die je nu uitbrengt,
blijft kloppen zoals hij is.

| Fase | Wat er gebeurt |
| --- | --- |
| 0 · bundel en buildvlag | **blijft.** `IS_NATIVE` is juist wat je nodig hebt om web en app uiteen te houden. |
| 1 · Capacitor | **blijft.** Raakt het verdienmodel niet. |
| 2 · app-modus afbakenen | **verandert.** `NATIVE_PAGES` bevat nu geen team- of managerpagina's. Moet een leidinggevende zijn teambeeld op zijn telefoon zien, dan komen die erbij, met de bijbehorende rechten. Dit is de grootste wijziging. |
| 3 · lokale opslag | **blijft, met een laag erop.** `localStore.js` wordt een cache naast de server in plaats van de enige waarheid. Aantekeningen blijven er exclusief in staan. |
| 4 · offline en native gedrag | **verandert van karakter.** Van "werkt offline omdat er geen server is" naar "verdraagt offline". Het bewijs *nul externe verzoeken* geldt dan niet meer, en er komt een foutsituatie bij die nooit bestond: geen bereik tijdens synchroniseren. |
| 5 · het resultaat als hart | **blijft volledig.** Dit is het deel dat het product onderscheidt en het enige argument uit §1 dat overeind blijft. |
| 6 · iconen, splash, metadata | **blijft.** |
| 7 · privacy en AVG | **moet opnieuw.** Het privacyscherm, de verklaring, beide store-antwoorden en `PrivacyInfo.xcprivacy` gaan alle vier uit van "er is geen server". Dat wordt onwaar. |

Wat je dus niet kwijt bent: de bundel, Capacitor, het opslagmodel, het
profielscherm, de gespreksvoorbereiding, de historie, de iconen, de versies. Dat
is het meeste werk. Wat je kwijt bent, is een deel van het *verhaal* — en het
werk van fase 7, dat grotendeels tekst is.

---

## 9. Bouwvolgorde — vastgelegd

Omdat het individuele deel nooit een account gaat eisen (§1), hoeft de release
niet te wachten op het verdienmodel. Dat zijn twee projecten die elkaar anders
maanden ophouden. De volgorde is dus: uitbrengen, en de rest erbij bouwen.

**Fase 8 — de app uitbrengen zoals hij nu is.** Gratis, alles lokaal, *Data Not
Collected*, geen koppeling, geen account. Fase 0 tot 7 zijn af; dit is de lichtste
review die je ooit gaat krijgen. Nog te beslissen blijft wat in hoofdstuk 8 van de
briefing staat: delen als platte tekst, de rechtspersoon waaronder de app
verschijnt, en één taal of twee.

**Fase 9 — de koppeling, als update.** Opt-in delen met een teamcode: naamvraag
standaard uit, vastgelegde toestemming, intrek-token, nieuwe privacyteksten en
aangepaste store-antwoorden (§7). Bewust een update en niet de eerste inzending:
nieuwe gegevensverzameling in een bestaande app is een kleiner reviewrisico dan
alles tegelijk. Hier hoort ook de doorvraagkaart uit §5 bij.

**Fase 10 — teamaccount echt verkopen.** Licentievelden op de codes (plekken,
geldigheid, bij welk bedrijf), een besteltraject en facturatie op het web, buiten
de stores om. De dashboards bestaan al; de `level`-ladder kan hier van technisch
veld naar prijsdifferentiatie.

**Fase 11 — de manager in de app.** Pas hier komt het eerste account, en alleen
voor wie een team beheert. Dit is de grootste wijziging uit §8 (fase 2 opnieuw
indelen), en dat is precies de reden om hem laat te doen: die indeling wil je
maken met een leidinggevende die de app al gebruikt, niet op papier. Vanaf hier
geldt richtlijn 5.1.1(v) over accountverwijdering.

**Fase 12 — bedrijfsaccount met zelfbeheer.** Bij bewezen vraag, zie §4.

Wat hier bewust níét in staat, is een moment waarop de bestaande app iets
inlevert. Elke stap is een toevoeging. Dat is de hele winst van het besluit in §1.

---

## 10. Wat er technisch verandert

Geen opdracht, wel de omvang, zodat "even koppelen" niet als klein wordt
ingeschat.

**Database**

- Een functie die een app-uitslag wegschrijft en alleen een id plus een
  intrek-token teruggeeft (anon mag sinds migratie 006 niet uit `responses`
  lezen, dus dit kan niet met een gewone insert-en-select).
- Een functie om op dat token in te trekken.
- Licentievelden op `team_access_codes` (plekken, geldigheid, bedrijfsaccount).
- Rechten die anon precies deze functies geven en niets meer.
- Als er accounts komen: rechten per organisatie en per team, en een route om een
  account te verwijderen inclusief het besluit wat er met de uitslag gebeurt.

**App**

- De voornaam moet bewaard kunnen worden in een entry van `localStore.js`; nu
  wordt hij niet bewaard en bevat `entry.result` alleen de scores. Dat is een
  wijziging van het opslagmodel: versie 3, met migratie.
- Het intrek-token en de koppelstatus per entry erbij.
- Een deelscherm: code invullen, tekst over wat er weggaat en wat blijft,
  naamvraag standaard uit, vastleggen van de toestemming, en een intrekknop.
- De eerste netwerkcode in de app, met de foutsituatie die er nooit was: geen
  bereik. Dat moet netjes wachten of netjes falen, zonder dat het lokale profiel
  eronder lijdt.
- `platform.js` krijgt een nieuwe grens: offline blijven werken, maar niet meer
  offline-only. En als team- of managerpagina's meekomen: `NATIVE_PAGES` uitbreiden
  plus de pagina's zelf geschikt maken voor één kolom.

**Web en papier**

- Privacyverklaring in twee sporen, in de app én op tof.services.
- De antwoorden bij Apple en Google aanpassen (§7), en `PrivacyInfo.xcprivacy`
  vullen in plaats van leeg laten.
- Verwerkersovereenkomst, bewaartermijn, grondslag.
- Drempel van vijf gekoppelde uitslagen voordat een teamdashboard iets toont.
- Geen managerscherm met namen naast persona's (§3).

---

## 11. Nog open

Niets hiervan houdt fase 8 nog tegen.

- **Prijzen.** Niet te beoordelen zonder wat een organisatie nu betaalt en hoe
  groot de teams zijn. Zodra die twee er zijn, reken ik de staffels door.
- **De drempel** van vijf: past dat getal bij jouw klanten?
- **Het juridische spoor** (§7): wie doet dat, en vóór of na de koppeling?
- Uit hoofdstuk 8 van de app-briefing staan nog open: delen als platte tekst, de
  naam waaronder de app verschijnt, en één taal of twee in de stores.
