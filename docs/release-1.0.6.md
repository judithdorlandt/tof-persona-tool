# Release 1.0.6: Wat jou naar kantoor trekt

Voorbereid op 4 november 2026. iOS **1.0.6 (build 8)**, Android **1.0.6 (versionCode 6)**.
Niets geüpload, niets ingediend, niets gepusht.

## Voorwaarde

Dien 1.0.6 pas in als de beoordeling van 1.0.5 (iOS build 7, versionCode 5, commit `3c8c3de`) klaar is. Een nieuwe indiening tijdens een lopende beoordeling herstart die beoordeling. Is 1.0.5 nog niet ingediend, dan kan 1.0.6 in plaats daarvan: 1.0.6 bevat alles van 1.0.5.

## Wat er in deze versie zit

Sinds 1.0.5 staan er 11 commits op `main`, allemaal van het dienstenprofiel. Wat een app-gebruiker merkt:

- **"Wat jou naar kantoor trekt"** (`35db924`, aangezet in `d46c522`). In het profiel staat in de sectie Werkplek, onder de Bricks, één zin over wat jou naar kantoor trekt, met een disclaimerregel eronder. Hij volgt je primaire werkstijl. In het Engels heet het "What brings you to the office".

De teamlaag "Wat dit team naar kantoor trekt" zit alleen in de webversie (teamdashboard). De app komt daar niet aan.

## Bouw en controle

| Stap | Uitslag |
|---|---|
| `npm run build:app` | Compiled successfully. `npx cap sync` naar `ios/` en `android/`. Publiek pad `t.p="/"` |
| Tests (`react-scripts test`) | 2 suites, 22/22 geslaagd (bij de merge van het dienstenprofiel) |
| Android `./gradlew bundleRelease` | BUILD SUCCESSFUL. `jarsigner -verify` → "jar verified". De manifest in de AAB noemt versionName 1.0.6. De bundel bevat "Wat jou naar kantoor trekt" |
| iOS `xcodebuild … -configuration Release -destination 'generic/platform=iOS' build` | BUILD SUCCEEDED. Info.plist: 1.0.6 / 8 |

**De AAB staat hier:**
`android/app/build/outputs/bundle/release/app-release.aab` (4,98 MB, 4 nov 2026 15:37).
Ondertekend met de bestaande upload-keystore (`~/Documents/tof-persona-upload.jks`, via `android/keystore.properties`). Het bestand is gitignored en staat alleen op deze Mac. Let op: dit bestand vervangt de AAB van 1.0.5 op dezelfde plek.

## "Wat is er nieuw" / release-opmerkingen

**Voorstel, nog goed te keuren door Judith.** Hooguit 170 tekens:

- **NL** (91 tekens):
  Nieuw in je profiel, onder Werkplek: wat jou naar kantoor trekt, afgeleid uit je werkstijl.
- **EN** (97 tekens):
  New in your profile, under Workplace: what brings you to the office, based on your working style.

Google wil de opmerkingen per taal tussen taaltags:

```
<nl-NL>
Nieuw in je profiel, onder Werkplek: wat jou naar kantoor trekt, afgeleid uit je werkstijl.
</nl-NL>
<en-US>
New in your profile, under Workplace: what brings you to the office, based on your working style.
</en-US>
```

## Stappen voor Judith

### Apple

1. Open `ios/App/App.xcworkspace` in Xcode.
2. Kies **Any iOS Device (arm64)** en daarna **Product → Archive**.
3. Organizer: **Distribute App → App Store Connect → Upload**. Buildnummer blijft 8.
4. App Store Connect: maak **versie 1.0.6** aan, kies build **1.0.6 (8)** en plak de NL- en EN-tekst bij "Wat is er nieuw".
5. **Add for Review → Submit for Review**. Pas bij "Waiting for Review" is hij echt binnen.

### Google

1. Play Console → **Productie → Nieuwe release maken**.
2. Upload de AAB hierboven (moet **6 (1.0.6)** tonen) en plak de release-opmerkingen met taaltags.
3. **Opslaan**, daarna **Publicatieoverzicht → "Wijzigingen indienen voor beoordeling"**.

### Git

De versie-ophoging en deze notitie staan lokaal in commit "chore(release): 1.0.6". Nog **niet gepusht**. De webversie verandert er niet door, want alleen `android/`, `ios/` en deze notitie zijn gewijzigd.
