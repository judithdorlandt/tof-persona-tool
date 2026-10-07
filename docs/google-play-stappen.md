# Naar Google Play — stappenplan met links

Status op 6 oktober 2026: **er ligt een getekende, uploadklare AAB van 4,7 MB.**
Stappen 2, 3a, 4 en het beeldmateriaal op het icoon na zijn afgerond. Wat nog
open staat is menselijk werk bij Google: de accountkeuze (stap 0), de
inschrijving (stap 1), Play App Signing (stap 3b), de teksten invullen (stap 5),
het 512×512-icoon (stap 6) en uitbrengen (stap 7).

De winkelteksten voor Google staan al klaar in [store-teksten.md](store-teksten.md).
Dit bestand gaat alleen over de weg ernaartoe.

---

## 0. Eerst beslissen: persoonlijk of organisatie-account

Dit is de belangrijkste keuze en die is lastig terug te draaien. Bij Apple werd het
noodgedwongen een individueel account (ZZP, geen D-U-N-S). Bij Google is het een
vrije keuze, maar met een andere afweging.

| | Persoonlijk account | Organisatie-account |
| --- | --- | --- |
| Wat je nodig hebt | ID-bewijs | KVK-gegevens **én een D-U-N-S-nummer** |
| Vóór productie | Gesloten test: **12 testers, 14 dagen aaneengesloten ingeschreven** | Niets extra's |
| Verkoper in de winkel | `Judith Dorlandt` | `The Office Factory` (of de KVK-naam) |
| Wachttijd | Alleen identiteitsverificatie | Verificatie + aanvraag D-U-N-S |

Let op: Google eist voor organisatie-accounts wél een D-U-N-S-nummer. Dat is
precies de hobbel die we bij Apple hebben omzeild door individu te worden. Een
D-U-N-S is gratis aan te vragen, maar de doorlooptijd is dagen tot weken.

- D-U-N-S aanvragen: <https://www.dnb.com/duns/get-a-duns.html>
- KVK-uittreksel bij de hand houden: <https://www.kvk.nl>

De afweging is dus: **twee weken wachten op twaalf testers** (persoonlijk) tegen
**wachten op een D-U-N-S** (organisatie). Mijn advies blijft de organisatie, om
twee redenen die niets met tijd te maken hebben: de app wordt verkocht aan
organisaties, en dan hoort er geen privépersoon als verkoper in de winkel te staan.
Bovendien hoeft dat maar één keer; de twaalf-testers-eis geldt alleen de eerste
keer, maar de verkopersnaam staat er voor altijd.

Eenmalig **$25** inschrijfgeld, geen jaarlijkse kosten (anders dan Apple's $99/jaar).

---

## 1. Play Console-account aanmaken

1. Inschrijven: <https://play.google.com/console/signup>
2. Accounttype kiezen (zie stap 0), gegevens invullen, $25 betalen
3. Identiteit laten verifiëren — Google vraagt ID en soms aanvullende stukken
4. De Developer Distribution Agreement accepteren

Naslag:

- Play Console zelf: <https://play.google.com/console>
- Overzicht en handleidingen: <https://play.google.com/console/about/>
- Beleid en helpcentrum voor ontwikkelaars: <https://support.google.com/googleplay/android-developer>
- Policy-overtredingen en wat wel en niet mag: <https://play.google.com/about/developer-content-policy/>

De verificatie loopt op de achtergrond door. Begin daarom hiermee en ga in de
tussentijd verder met stap 2.

---

## 2. Bouwgereedschap installeren — GEDAAN op 6 okt 2026

Wat er nu staat, en waar:

| Onderdeel | Versie | Pad |
| --- | --- | --- |
| Homebrew | 7.0.8 | `/opt/homebrew` |
| OpenJDK | 21.0.12.1 | `/opt/homebrew/opt/openjdk@21` |
| Android command-line tools | — | `/opt/homebrew/share/android-commandlinetools` |
| platform-tools (incl. `adb` 1.0.41) | r37.0.1 | idem, submap `platform-tools` |
| Android SDK Platform | API 36 | idem, submap `platforms` |
| Build-tools | 36.0.0 | idem, submap `build-tools` |
| Gradle | komt mee in de repo als `android/gradlew` | — |

Zo is het geïnstalleerd:

```bash
brew install openjdk@21
brew install --cask android-commandlinetools
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

**Waarom `openjdk@21` en niet de Temurin-cask:** de cask schrijft in
`/Library/Java` en vraagt om een adminwachtwoord. De formule blijft binnen
Homebrew. Functioneel maakt het voor Gradle niets uit. De formule is wel
*keg-only*, dus hij komt niet vanzelf in je `PATH` — vandaar de `JAVA_HOME`
hieronder.

De omgevingsvariabelen staan in `~/.zshrc`:

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

Controleren dat het nog werkt:

```bash
java -version        # 21.0.12.1
adb version          # 1.0.41
```

De repo staat al op `compileSdk`/`targetSdk` 36 en `minSdk` 24
(`android/variables.gradle`), ruim boven de ondergrens die Google stelt. Daar
hoeft niets aan.

Naslag, mocht dit ooit opnieuw moeten:

- Homebrew: <https://brew.sh>
- Temurin JDK (het alternatief): <https://adoptium.net/temurin/releases/>
- Android Studio, als je ooit de grafische kant wilt: <https://developer.android.com/studio>
- `sdkmanager`: <https://developer.android.com/tools/sdkmanager>

---

## 3. Ondertekening regelen — a GEDAAN op 6 okt 2026, b nog te doen

**a. Upload-keystore.** Aangemaakt met `keytool` (zit in de JDK):

| | |
| --- | --- |
| Bestand | `~/Documents/tof-persona-upload.jks` (PKCS12, buiten de repo) |
| Alias | `tof-persona-upload` |
| Sleutel | RSA 2048, geldig 10.000 dagen |
| Naam op het certificaat | `CN=TOF Persona, O=The Office Factory, C=NL` |
| SHA-256 vingerafdruk | `E6:78:F4:42:90:C6:F1:B6:6B:5F:C6:81:01:22:F3:EA:0D:57:73:30:AD:41:10:92:64:5E:34:51:97:98:3F:59` |

Het wachtwoord staat in `android/keystore.properties`. Dat bestand én `*.jks`
staan nu in `android/.gitignore`, dus ze komen niet in git terecht.

**Bewaar het `.jks`-bestand en het wachtwoord ook ergens buiten deze Mac**
(1Password, een kluis). Raak je ze kwijt én staat Play App Signing níét aan, dan
is er nooit meer een update mogelijk onder dezelfde app.

`android/app/build.gradle` leest die eigenschappen nu in en gebruikt ze voor de
release-variant. Zonder `keystore.properties` bouwt alleen de debug-variant —
dat is met opzet, zodat een verse kloon van de repo niet struikelt.

**b. Play App Signing aanzetten.** Google bewaart dan de echte
ondertekeningssleutel; jij tekent alleen de upload. Dat is het vangnet voor punt a:
een verloren upload-sleutel kan Google resetten, een verloren app-sleutel niet.
Dit staat in de Console onder Release → Setup → App integrity en gaat standaard
aan bij nieuwe apps.

- Hoe ondertekenen werkt: <https://developer.android.com/studio/publish/app-signing>
- Signeren via Gradle configureren: <https://developer.android.com/studio/publish/app-signing#sign-gradle>

---

## 4. De AAB bouwen

Google wil een Android App Bundle (`.aab`), geen APK.

```bash
npm run build:app                      # webbundel + npx cap sync
cd android
./gradlew bundleRelease
```

Resultaat: `android/app/build/outputs/bundle/release/app-release.aab`.

Op 6 okt 2026 gedaan en gelukt: **4,7 MB, getekend** (`jarsigner -verify` zegt
"jar verified"). De waarschuwing over een ongeldige certificaatketen hoort erbij
— een upload-sleutel is zelfondertekend, dat is precies de bedoeling.

Twee dingen om te controleren vóór elke upload:

- `android/app/build.gradle:10-11` staat nu op `versionCode 1` / `versionName "1.0.0"`.
  **`versionCode` moet omhoog bij élke nieuwe upload**, ook bij een afgekeurde
  inzending — Google weigert een bundel met een bestaand nummer.
- Dat `PUBLIC_URL` nog op `/` staat in `build:app`. Dat was de logo-bug in
  iOS-build 1.0(1) en gaat in de Android-webview precies zo stuk. Check:
  `grep -o 'n\.p="[^"]*"' build/static/js/main.*.js` → moet `n.p="/"` geven.

Naslag:

- Capacitor en Android: <https://capacitorjs.com/docs/android>
- App bundles: <https://developer.android.com/guide/app-bundle>
- `bundletool`, om de AAB lokaal te testen voor je hem uploadt:
  <https://developer.android.com/tools/bundletool>

Een alternatief op `./gradlew` is Android Studio openen met
`npx cap open android` en daar Build → Generate Signed App Bundle kiezen. Zelfde
resultaat, meer klikken.

---

## 5. Het Play Console-record vullen

Alles hieronder is invulwerk in de Console; de teksten komen uit
[store-teksten.md](store-teksten.md). De naam van het pakket staat vast:
`services.tof.persona` (`android/app/build.gradle:7`) — dezelfde als bij Apple.

| Onderdeel | Wat erin | Waar het staat |
| --- | --- | --- |
| Korte omschrijving (80) | NL + EN | store-teksten.md §1 |
| Volledige omschrijving (4000) | NL + EN | store-teksten.md §3 en §4 |
| Data safety | Geen gegevens verzameld, geen gegevens gedeeld | Policy → App content |
| Content rating | IARC-vragenlijst → komt uit op Everyone / 3+ | Policy → App content |
| Privacyverklaring | <https://www.tof.services/privacy> | Policy → App content |
| Doelgroep en inhoud | Niet op kinderen gericht | Policy → App content |
| Advertenties | Geen advertenties | Policy → App content |
| App-toegang | Alle functionaliteit zonder inloggen beschikbaar | Policy → App content |
| Overheid / financieel / gezondheid | Geen van drie | Policy → App content |

Twee dingen die bij Apple ook voorkwamen en hier terugkeren:

- **Data safety** is Google's tegenhanger van "Data Not Collected". Het antwoord
  is hier net zo eenvoudig als bij Apple, omdat de app-modus volledig lokaal
  werkt (`src/native/localStore.js`, geen Supabase) en geen enkel netwerkverzoek
  doet behalve de twee links die de gebruiker zelf aantikt.
- **App-toegang**: geen login, geen testaccount nodig. Dat scheelt de hele
  toestand die bij Apple om een schermopname vroeg.

De content rating loopt via IARC: <https://www.globalratings.com>

---

## 6. Beeldmateriaal

| Nodig | Formaat | Status |
| --- | --- | --- |
| Screenshots telefoon | min. 2, max. 8 | **Klaar** — `store-assets/screenshots/{nl,en}/`, 1320×2868 voldoet |
| Feature graphic | 1024 × 500 PNG of JPG | **Klaar** — `store-assets/feature-graphic/{nl,en}.png` |
| App-icoon | 512 × 512 PNG, **geen transparantie** | Nog te doen |

De feature graphic wordt gerenderd door `store-assets/make-feature-graphic.mjs`,
in dezelfde geest als het screenshot-script: een HTML-pagina van 1024×500 die in
Chrome wordt gefotografeerd. Kleuren en letters komen uit de app zelf — `#F7F3EE`
als achtergrond, `#6E8872` als accent, Playfair voor de kop, Inter voor de rest.
De lettertypen worden als base64 ingebed, zodat er niets van een CDN komt.

```bash
npm i puppeteer-core --no-save
node store-assets/make-feature-graphic.mjs nl
node store-assets/make-feature-graphic.mjs en
```

Wil je de tekst of de opmaak anders, pas dan het `T`-object of de CSS boven in
dat bestand aan en draai het opnieuw.

**Het icoon is níét zomaar een verkleining.** Google eist 512×512 **zonder
alfakanaal**, en `src/assets/tof-logo.png` heeft dat wel. `sips -z 512 512` levert
dus een bestand dat Google weigert. Er moet eerst een effen achtergrond onder,
in de bufferkleur van de app (`#F7F3EE`). Dat is een klein klusje, maar wel een
dat je niet per ongeluk goed doet.

Naslag:

- Canva (<https://www.canva.com>) of Figma (<https://www.figma.com>) als je liever
  met de hand ontwerpt
- Android Asset Studio voor launcher-iconen:
  <https://romannurik.github.io/AndroidAssetStudio/>
- Specificaties in het helpcentrum, onder "Graphic assets, screenshots, and
  video": <https://support.google.com/googleplay/android-developer>

---

## 7. Uitbrengen

**Organisatie-account:** interne test → productie aanvragen. Google's beoordeling
duurt bij een nieuw account doorgaans langer dan bij Apple; reken op dagen.

**Persoonlijk account:** eerst een gesloten test (Release → Testing → Closed
testing) met minstens **12 testers die 14 dagen aaneengesloten ingeschreven
staan**, en dan pas "Apply for production access". Die twaalf zijn twaalf echte
mensen met een Google-account; opt-in via een e-maillijst of een Google-groep.

Kies ook hier, net als bij Apple, **handmatige uitrol** ("Managed publishing"),
zodat jij bepaalt wanneer hij live gaat.

---

## Mijn volgorde

1. ~~Gereedschap (stap 2), keystore (stap 3a), AAB (stap 4), feature graphic (stap 6)~~ — gedaan, 6 okt 2026
2. Accountkeuze (stap 0) — en als het de organisatie wordt: direct D-U-N-S aanvragen
3. Inschrijven (stap 1), zodat de verificatie op de achtergrond loopt
4. Icoon 512×512 maken (stap 6) — klein klusje, kan wanneer het uitkomt
5. Play App Signing aanzetten (stap 3b) en de Console vullen (stap 5)
6. Uitbrengen (stap 7)
