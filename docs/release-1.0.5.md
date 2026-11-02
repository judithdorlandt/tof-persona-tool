# Release 1.0.5: TOF Persona als woordmerk

Voorbereid op 2 november 2026. iOS **1.0.5 (build 7)**, Android **1.0.5 (versionCode 5)**.
Niets geüpload, niets ingediend, niets gepusht.

## Voorwaarde

Versie 1.0.4 (iOS build 6, versionCode 4, commit `b64bafe` van 19 okt) is volgens Judith goedgekeurd door Apple en Google. Er ligt dus geen beoordeling meer open die een nieuwe indiening zou herstarten.

## Wat er in deze versie zit

Sinds 1.0.4 staan er 187 commits op `main`. De meeste raken alleen de webversie: de teamomgeving, /admin, het Organisatielandschap en het Strategisch Kompas. Dit is wat een app-gebruiker merkt:

- **Naam en woordmerk** (`a0430c4`)
  - Bovenin de balk en op het opstartscherm staat "TOF *Persona*" in plaats van "The Office *Factory*".
  - Op een telefoon staat alleen "TOF *Persona*" in de balk. Op het opstartscherm staat "The Office Factory" klein eronder.
  - Het woordmerk staat nu echt in Playfair Display. Voorheen viel het deels terug op Inter.
- **Personakaart-PDF.** De regel naast je naam zegt "TOF Persona" in plaats van "TOF Persona Tool" (`a0430c4`). Tekst met gewicht 500/600 valt niet meer terug op Times (`26729e1`).
- **Mail aan je leidinggevende**
  - De mail zegt "de test in TOF Persona" in plaats van "de Persona-test" (`a0430c4`).
  - Hij wijst naar www.persona-tool.nl/voor-je-team (`2f280ec`).
  - Kleine tekstcorrecties rond delen (`680b993`).
- **Foutscherm en schermlezer.** Het onderwerp van de foutmail is nu "Foutmelding TOF Persona". De logoknop heet voor een schermlezer "Begin TOF Persona" (`a0430c4`).
- **Leesbaarheid**
  - Grijs #666666 en sage-tekst #56705C voor meer contrast (`f359049`).
  - Nergens tekst kleiner dan 12 px (`0d619a7`).
  - Eén grijstint overal (`f4e71c6`).
  - Invoervelden op 16 px (`f9dbc38`).
  - Het accentwoord in paginakoppen staat weer in Playfair (`cceec4a`).
- **Persona-teksten** zonder geslacht (`e870d32`).

Teamdrempel, namenregel en dashboard-rekenregels zijn alleen op het web veranderd. De app komt daar niet aan.

## Bouw en controle

| Stap | Uitslag |
|---|---|
| `npm run build:app` | Compiled successfully. `npx cap sync` naar `ios/` en `android/`. Publiek pad `t.p="/"`, dus het logo laadt ook op `/en` |
| Tests (`react-scripts test`) | 1 suite, 9/9 geslaagd |
| Android `./gradlew bundleRelease` | BUILD SUCCESSFUL. `jarsigner -verify` → "jar verified". De manifest in de AAB noemt versionName 1.0.5, de `<title>` is "TOF Persona — The Office Factory" |
| iOS `xcodebuild … -configuration Release -destination 'generic/platform=iOS' build` | BUILD SUCCEEDED. Info.plist: 1.0.5 / 7. De melding "CoreSimulator is out of date" gaat alleen over de simulator en blokkeert niets |

**De AAB staat hier:**
`android/app/build/outputs/bundle/release/app-release.aab` (4,97 MB, 2 nov 2026 17:44).
Hij is ondertekend met de bestaande upload-keystore (`~/Documents/tof-persona-upload.jks`, via `android/keystore.properties`). Het bestand is gitignored en staat dus alleen op deze Mac.

## "Wat is er nieuw" / release-opmerkingen

Voor Apple ("Wat is er nieuw in deze versie") en Google (release-opmerkingen), hooguit 170 tekens:

- **NL** (144 tekens):
  De app heet nu overal TOF Persona, ook bovenin het scherm. Teksten zijn beter leesbaar, met meer contrast. Verder een paar kleine verbeteringen.
- **EN** (156 tekens):
  The app is now called TOF Persona everywhere, including at the top of the screen. Text is easier to read, with more contrast. Plus a few small improvements.

"Vernieuwd logo" staat er bewust niet in. Het beeldmerk (de cirkel met de F) is niet veranderd, alleen de naam ernaast.

Google wil de opmerkingen per taal tussen taaltags:

```
<nl-NL>
De app heet nu overal TOF Persona, ook bovenin het scherm. Teksten zijn beter leesbaar, met meer contrast. Verder een paar kleine verbeteringen.
</nl-NL>
<en-US>
The app is now called TOF Persona everywhere, including at the top of the screen. Text is easier to read, with more contrast. Plus a few small improvements.
</en-US>
```

## Store-afbeeldingen

| Bestand | Oud woordmerk? |
|---|---|
| `store-assets/screenshots/nl/1-start.png`, `3-profiel.png`, `4-personas.png` | **Ja**, "The Office *Factory*" bovenin |
| `store-assets/screenshots/en/1-start.png`, `3-profiel.png`, `4-personas.png` | **Ja**, "The Office *Factory*" bovenin |
| `store-assets/feature-graphic/{nl,en}.png` (Google) | Nee. Toont "TOF PERSONA" en het beeldmerk |
| `store-assets/header-asset/{nl,en}.png` (Apple) | Nee. Toont "TOF PERSONA" en het beeldmerk |
| `store-assets/play-icon/icon-512.png`, app-icoon, splash | Nee. Alleen het beeldmerk |

De zes screenshots kunnen opnieuw gemaakt worden met `store-assets/make-store-screenshots.mjs`. Dat is in deze ronde **niet** gedaan, want het viel buiten de opdracht. Het kan als aparte stap vóór het indienen. Let op: de bestaande screenshots tonen ook nog de oude, lichtere grijstint.

Storeteksten (`docs/store-teksten.md`): de appnaam is al "TOF Persona". "Persona Tool" komt er alleen in voor als uitleg in de toelichting ("… past niet in dertig tekens"), niet in een storeveld.

## Stappen voor Judith

### Apple

1. Open `ios/App/App.xcworkspace` in Xcode.
2. Kies bovenin als bestemming **Any iOS Device (arm64)** en daarna **Product → Archive**.
3. In het Organizer-venster: **Distribute App → App Store Connect → Upload**. Laat het buildnummer staan op 7.
4. In App Store Connect: maak onder de app **versie 1.0.5** aan. Kies bij Build **1.0.5 (7)** (de verwerking duurt soms 10–30 minuten) en plak de NL- en EN-tekst bij "Wat is er nieuw".
5. Vervang zo nodig de screenshots met het oude logo (alle drie, per taal).
6. **Add for Review → Submit for Review**. Let op: "Ready for Review" is nog niet ingediend. Pas bij "Waiting for Review" is hij echt binnen.

### Google

1. Play Console → **Productie → Nieuwe release maken**.
2. Upload `android/app/build/outputs/bundle/release/app-release.aab` en plak de release-opmerkingen hierboven (met taaltags).
3. Vervang zo nodig de screenshots (Winkelvermelding → per taal).
4. **Opslaan**. Daarna **Publicatieoverzicht → "Wijzigingen indienen voor beoordeling"**. Op de releasepagina zelf staat geen indienknop.

### Git

De versie-ophoging en deze notitie staan lokaal in commit "chore(release): 1.0.5". Ze zijn nog **niet gepusht**. De webversie verandert er niet door, want alleen `android/` en `ios/` en deze notitie zijn gewijzigd. Pushen kan wanneer Judith "push" zegt.
