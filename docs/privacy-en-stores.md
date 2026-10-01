# Privacy en AVG — TOF Persona (app)

Alles wat je nodig hebt voor fase 7: de tekst voor je website, en de antwoorden
op de privacyvragenlijsten van Apple en Google.

De app is gebouwd op één uitgangspunt: **er gaat niets naar een server.** Dat is
geen belofte in een tekst, het is hoe de code in elkaar zit. In app-modus wordt
Supabase niet aangeroepen en staat er geen enkel extern verzoek in de bundel.
Daardoor zijn de antwoorden hieronder ook zo kort.

De tekst staat óók in de app zelf, op het privacyscherm (`src/native/Privacy.jsx`,
copy in `src/i18n/copy/{nl,en}/native.js`). Dat is bewust: de app werkt offline,
dus een link naar buiten loopt zonder bereik op niets uit.

---

## 1. Privacyverklaring voor `tof.services/privacy`

Beide stores eisen een privacyverklaring op een openbare URL. Onderstaande tekst
kun je overnemen. De Engelse formuleringen staan kant-en-klaar in
`src/i18n/copy/en/native.js` onder `privacy`.

> ### Privacy — TOF Persona
>
> *Laatst bijgewerkt: 30 september 2026*
>
> De TOF Persona-app helpt je ontdekken hoe jij werkt, en het gesprek daarover
> voor te bereiden. Alles wat je in de app maakt blijft op je eigen toestel.
>
> **Wat we bewaren, en waar**
> De app bewaart je persona-profiel (de uitslag van de test en de datum), je
> voornaam als je die hebt ingevuld, je antwoorden op de drie gespreksvragen, de
> inzichten die je aan je gesprek hebt vastgeprikt, en welke taal je hebt
> gekozen. Dat staat in de opslag van de app op je toestel. Er is geen server,
> geen database en geen kopie elders.
>
> **Wat we niet doen**
> Er is geen account, geen e-mailadres en geen wachtwoord. Je voornaam blijft op
> je toestel en bereikt ons nooit. We gebruiken
> geen statistieken, geen trackers en geen advertenties. De app vraagt geen
> toegang tot je contacten, locatie, camera of bestanden. De app heeft geen
> internetverbinding nodig en maakt er ook geen gebruik van.
>
> **Wie erbij kan**
> Alleen wie je toestel kan ontgrendelen. The Office Factory kan niet bij je
> gegevens, omdat ze ons nooit bereiken.
>
> **Je rechten**
> Omdat we geen persoonsgegevens ontvangen of verwerken, is er bij ons niets in
> te zien, te corrigeren of te verwijderen. Alles staat bij jou. In de app kun
> je onder *Wat deze app over je bewaart* met één knop alles van je toestel
> wissen. Verwijder je de app, dan gaat alles wat erin staat mee.
>
> **De webversie is iets anders**
> Op tof.services staat ook een webversie van de persona-tool. Die werkt
> anders: daar worden uitslagen wel opgeslagen, zodat teams en organisaties er
> een gezamenlijk beeld uit kunnen halen. Deze verklaring gaat over de app.
> *(Vul hier aan of verwijs naar je bestaande privacyverklaring voor de
> webversie — die twee verhalen moeten los van elkaar kloppen.)*
>
> **Contact**
> The Office Factory · *(adres, KvK-nummer en e-mailadres invullen)*

**Let op bij het publiceren**

- Het adres moet openbaar zijn, zonder inloggen, en in het Engels te begrijpen
  zijn of een Engelse versie hebben — Apple's reviewers lezen geen Nederlands.
- De alinea over de webversie is belangrijk. Als één verklaring beide dekt en de
  webversie wél gegevens opslaat, klopt "er gaat niets naar een server" niet meer.

---

## 2. Apple — App Privacy (App Store Connect)

Onder *App Store Connect → jouw app → App Privacy*.

| Vraag | Antwoord |
| --- | --- |
| Do you or your third-party partners collect data from this app? | **No** |
| Privacy Policy URL | `https://tof.services/privacy` |

Meer is er niet. Kies je "No", dan slaat Apple alle vervolgvragen over en komt er
**Data Not Collected** in de App Store te staan — het sterkste privacylabel dat er
is, en meteen een van de vier redenen waarom dit een app is en geen website.

Dat antwoord geldt alleen zolang het waar blijft. Het dekt namelijk ook alles wat
van buiten meekomt. De app gebruikt drie Capacitor-plugins (haptiek,
startscherm, statusbalk); die verzamelen niets. Komt er ooit een SDK bij die dat
wél doet — een crashmelder, statistieken, een advertentienetwerk — dan moet dit
antwoord mee veranderen.

**Privacymanifest.** Apple wil sinds iOS 17 een `PrivacyInfo.xcprivacy` in de app.
Die staat er (`ios/App/App/PrivacyInfo.xcprivacy`), is aan de app-target
toegevoegd en verklaart: geen tracking, geen trackingdomeinen, geen verzamelde
gegevens, geen API's waarvoor Apple een reden wil horen. Capacitor levert een
eigen manifest mee voor zijn framework.

**Encryptie.** `ITSAppUsesNonExemptEncryption` staat op `false` in `Info.plist`,
zodat App Store Connect er niet bij elke upload naar vraagt. Dat klopt: de app
versleutelt zelf niets.

---

## 3. Google — Data safety (Play Console)

Onder *Play Console → App-inhoud → Gegevensbeveiliging*.

| Vraag | Antwoord |
| --- | --- |
| Verzamelt of deelt je app de vereiste gebruikersgegevenstypen? | **Nee** |
| Worden alle gegevens versleuteld tijdens verzending? | Niet van toepassing — er wordt niets verzonden |
| Kunnen gebruikers verzoeken dat hun gegevens worden verwijderd? | **Ja** |
| Privacybeleid-URL | `https://tof.services/privacy` |

Toelichting bij de verwijdervraag: er is geen verwijderverzoek nodig, want
gebruikers wissen alles zelf in de app (*Wat deze app over je bewaart → Alles
verwijderen*). Google vraagt daarbij om een URL; verwijs naar
`tof.services/privacy`, waar dat staat uitgelegd.

Let op het verschil in woordkeus tussen de twee stores. Google rekent gegevens
die het toestel nooit verlaten **niet** als "verzamelen" — precies wat hier
gebeurt. Vult iemand toch "ja" in omdat er lokaal iets wordt opgeslagen, dan
volgt een vragenlijst die niet te beantwoorden is.

Daarnaast vraagt Google apart om een **doelverklaring voor gevoelige
machtigingen**. Die is hier niet nodig: de app vraagt geen enkele gevaarlijke
machtiging. In `android/app/src/main/AndroidManifest.xml` staat precies één
regel, `android.permission.INTERNET` — de standaardregel van Capacitor. Die
geldt als "normaal", vraagt de gebruiker niets en hoeft nergens verantwoord te
worden. De app gebruikt hem ook niet; hij staat er omdat het sjabloon hem
meelevert.

---

## 4. Wat er verandert als de app ooit wél iets verstuurt

Dit hoofdstuk staat er zodat het besluit "alles lokaal" niet per ongeluk wordt
teruggedraaid. Zodra er iets naar Supabase gaat — één uitslag, één e-mailadres —
verandert het volgende in één klap:

1. Er moet een expliciete toestemmingsvraag in de app komen: wát er wordt
   verstuurd, waarvóór, en hoe je het laat verwijderen.
2. Apple's antwoord wordt **Yes**, met per gegevenstype de vraag of het aan je
   identiteit gekoppeld is en of je er gebruikers mee volgt.
3. Google's antwoord wordt **Ja**, met dezelfde uitsplitsing plus versleuteling
   in transit en een echte verwijderroute.
4. De privacyverklaring moet een verwerkingsgrondslag, een bewaartermijn en een
   verwerkersovereenkomst met Supabase noemen.
5. Het privacyscherm in de app klopt dan niet meer en moet mee.

Met andere woorden: de lichte papierwinkel is niet gratis meegekomen, die is
gekocht met het besluit om niets te versturen.
