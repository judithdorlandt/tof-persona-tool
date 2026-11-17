# Release 1.0.7: tien vragen, en geluid om je heen

Gebouwd op 16 november 2026. iOS **1.0.7 (build 9)**, Android **1.0.7 (versionCode 7)**.
**iOS 1.0.7 (9) geüpload naar App Store Connect op 17 nov 2026** (`xcodebuild -exportArchive`, "Upload succeeded"). Nog niet ingediend voor beoordeling. Android nog niet geüpload.

## Voorwaarde

1.0.7 bevat alles van 1.0.6, en 1.0.6 alles van 1.0.5.
- **Is 1.0.6 nog niet ingediend?** Sla hem dan over en dien direct 1.0.7 in.
- **Loopt er bij Apple of Google nog een beoordeling?** Wacht dan tot die klaar is. Een nieuwe indiening tijdens een lopende beoordeling herstart die beoordeling.

## Wat er in deze versie zit

Sinds 1.0.6 (`b86d28d`) staan deze wijzigingen op `main`. Wat een app-gebruiker merkt:

- **Vraag 10: werkomgeving.** Na de negen basisvragen volgt "Je hebt een uur om iets lastigs af te maken. Waar lukt dat het best?", met vier antwoorden: stilte, geroezemoes, reuring, of maakt weinig uit. De teller loopt nu tot 10 / 10. De vraag telt niet mee in de werkstijl.
- **"Geluid om je heen"** in het profiel, onder Werkplek, vóór "Wat jou naar kantoor trekt". Die regel verschijnt alleen als je antwoord tegen je werkstijl in gaat: een Denker of Presteerder die reuring kiest, of een Verbinder of Vernieuwer die stilte kiest.
- **Tien vragen, zeven minuten.** Het startscherm en de intro zeggen nu "Tien vragen, zeven minuten" (EN "Ten questions, seven minutes").
- **Het antwoord gaat mee naar het team.** Bij "Profiel inbrengen" gaat het antwoord als `pk` mee in de link. De website bewaart het nog niet; dat komt met de Supabase-ronde. Oude links blijven werken.
- Ook mee sinds 1.0.6: "Waarom dit team komt" toont elke werkstijl (`868859c`) en de zinnen over de volle breedte (`ef4d1f6`). Dat zijn alleen wijzigingen in de webversie.

## Bouw en controle

| Stap | Uitslag |
|---|---|
| `npm run build:app` | Compiled successfully. `npx cap sync` naar `ios/` en `android/`. Publiek pad `t.p="/"` |
| Tests | 4 suites, 32/32 geslaagd |
| Inhoud van de bundel | "Tien vragen, zeven minuten", "Ten questions, seven minutes", "Geluid om je heen" en de vier antwoorden staan erin, ook in `ios/` en `android/` |
| Android `./gradlew bundleRelease` | BUILD SUCCESSFUL. `jarsigner -verify` → "jar verified". De manifest in de AAB noemt 1.0.7. De bundel in de AAB bevat de nieuwe teksten |
| iOS `xcodebuild … archive` | ARCHIVE SUCCEEDED. Info.plist: 1.0.7 / 9. De bundel in het archief bevat de nieuwe teksten |

**Android:** `android/app/build/outputs/bundle/release/app-release.aab` (4,98 MB, 16 nov 2026 15:10). Getekend met de bestaande upload-keystore. Dit bestand vervangt de AAB van 1.0.6 op dezelfde plek.

**iOS:** het archief staat in `/tmp/tof-archive-107.xcarchive`. Dat verschijnt niet in de Organizer van Xcode. Je kunt het op twee manieren uploaden: zelf opnieuw archiveren in Xcode (stappen hieronder), of mij vragen het vanaf de opdrachtregel te uploaden met `xcodebuild -exportArchive`, zoals bij 1.0.1 en 1.0.2.

## "Wat is er nieuw" / release-opmerkingen

**Voorstel, nog goed te keuren door Judith.** Hooguit 170 tekens:

- **NL** (152 tekens):
  Nieuw: een tiende vraag over hoeveel geluid je nodig hebt om goed te werken. Gaat je antwoord tegen je werkstijl in, dan zie je dat terug in je profiel.
- **EN** (141 tekens):
  New: a tenth question about how much sound you need to work well. If your answer goes against your working style, your profile now tells you.

Google wil de opmerkingen per taal tussen taaltags:

```
<nl-NL>
Nieuw: een tiende vraag over hoeveel geluid je nodig hebt om goed te werken. Gaat je antwoord tegen je werkstijl in, dan zie je dat terug in je profiel.
</nl-NL>
<en-US>
New: a tenth question about how much sound you need to work well. If your answer goes against your working style, your profile now tells you.
</en-US>
```

## Samen met deze versie

- **Storeteksten:** neem de nieuwe teksten over uit `tof-marketingteam/content/storeteksten-persona-app.md` ("tien vragen, zeven minuten"). Bij Apple zijn de ondertitel en de omschrijving versiegebonden, dus die gaan mee met deze inzending. De promotietekst en de Google-teksten kun je los aanpassen, het liefst als 1.0.7 live staat.
- **Notities voor de beoordelaar:** `docs/store-teksten.md` §7 zegt nu "ten questions".
- **Website persona-tool.nl:** plak `tof-marketingteam/content/plakklaar-lovable-2026-11-16-tien-vragen.md` als 1.0.7 live staat.
- **Winkelafbeeldingen: opnieuw gemaakt** (NL en EN, 1320 × 2868, `store-assets/screenshots/{nl,en}/`).
  - De oude `1-start` toonde nog "Negen vragen, een paar minuten" en het oude woordmerk "The Office Factory". De nieuwe toont "Tien vragen, zeven minuten" en "TOF Persona".
  - Het script `make-store-screenshots.mjs` doorloopt nu ook vraag 10.
  - Vervang in App Store Connect en Play Console alle drie de beelden per taal. Ook `3-profiel` en `4-personas` zijn opnieuw gerenderd, met het huidige woordmerk.
  - De oude beelden staan als reservekopie in de kladmap van de sessie (`oude-screenshots/`).
  - **Let op:** op `3-profiel` staat bovenaan "Dit is je profiel, op basis van je negen antwoorden." / "…based on your nine answers." Dat klopt inhoudelijk (vraag 10 telt niet mee in de werkstijl), maar het kan vreemd lezen naast "Tien vragen". Zie de vraag aan Judith.

## Stappen voor Judith

### Apple
1. ~~Archiveren en uploaden~~ — gedaan op 17 nov 2026. Wacht tot build 1.0.7 (9) in App Store Connect klaar is met verwerken (meestal 10–30 minuten, je krijgt een mail).
2. App Store Connect: maak **versie 1.0.7** aan, kies build **1.0.7 (9)**, plak de NL- en EN-tekst bij "Wat is er nieuw" en neem de nieuwe ondertitel en omschrijving over.
3. Dien in via **Add for Review**. Bij een eerdere afwijzing loopt het via Distribution → App Review → **Resubmit**.

### Google Play
1. Play Console → **Productie → Nieuwe release maken** → upload `app-release.aab`.
2. Plak de release-opmerkingen met de taaltags.
3. **Opslaan**, daarna **Publicatieoverzicht → wijzigingen indienen voor beoordeling**.
