# Winkelteksten — App Store en Google Play

Kant-en-klaar om over te nemen in App Store Connect en de Play Console, in beide
talen. De toon volgt de app zelf: "Ontdek hoe jij werkt", "Negen vragen, een paar
minuten". Tussen haakjes staat telkens de limiet van het veld.

Eén regel die overal geldt: **niets in deze teksten belooft iets wat de app niet
doet.** Geen team, geen account, geen synchronisatie. Dat is straks fase 9 en 10,
en dan passen we deze teksten aan.

---

## 1. Namen en korte velden

| Veld | Nederlands | English |
| --- | --- | --- |
| Appnaam (30) | `TOF Persona` | `TOF Persona` |
| Ondertitel — alleen Apple (30) | `Ontdek hoe jij werkt` | `Discover how you work` |
| Korte omschrijving — alleen Google (80) | `Negen vragen, één helder beeld van je werkstijl. Alles blijft op je toestel.` | `Nine questions, one clear picture of how you work. Everything stays on your device.` |

De appnaam is bewust kort. "TOF" alleen is te generiek om terug te vinden,
"The Office Factory Persona Tool" past niet in dertig tekens en leest als een
formulier.

---

## 2. Promotietekst — alleen Apple (170)

Dit veld mag je later wijzigen zonder nieuwe beoordeling. Gebruik het voor wat
tijdelijk is; de omschrijving hieronder is voor wat blijft.

**NL**
```
Negen vragen, een paar minuten. Daarna weet je in welke werkomgeving jij tot je
recht komt — en dat blijft op je eigen toestel, alleen voor jou.
```

**EN**
```
Nine questions, a few minutes. Afterwards you know which work environment brings
out your best — and it stays on your own device, for your eyes only.
```

---

## 3. Omschrijving (4000) — Nederlands

Voor beide winkels dezelfde tekst.

```
Ontdek hoe jij werkt.

Negen vragen, een paar minuten. Daarna weet je in welke werkomgeving jij tot je
recht komt, waar je energie van krijgt en waar het gaat schuren.

TOF Persona geeft je een persoonlijk werkstijlprofiel: welke van de acht
persona's het dichtst bij je ligt, welke daarnaast meespelen, en wat dat betekent
voor de manier waarop je het liefst werkt en begeleid wilt worden.

WAT JE KRIJGT

• Een helder profiel in gewone taal, geen cijferlijst
• Alle acht persona's om je eigen profiel naast te leggen
• Aantekeningen bij je profiel: drie vragen waarmee je een gesprek met je
  leidinggevende voorbereidt
• Historie — doe de test opnieuw als je werk verandert, en zie wat er verschuift

ALLES BLIJFT OP JE TOESTEL

Geen account. Geen inloggen. Geen internet nodig.

Je antwoorden, je profiel en je aantekeningen staan op je telefoon en worden
nergens naartoe gestuurd. Wij kunnen ze niet zien. In het privacyscherm lees je
precies wat de app bewaart, en wis je alles in één keer.

VOOR WIE

Voor iedereen die wil begrijpen waarom het ene werk moeiteloos gaat en het andere
energie kost. Voor een functioneringsgesprek, een nieuwe rol, of gewoon voor
jezelf.

De app is er in het Nederlands en het Engels; je kiest je taal bij het openen.

TOF Persona is gemaakt door The Office Factory.
```

---

## 4. Omschrijving (4000) — English

```
Discover how you work.

Nine questions, a few minutes. Afterwards you know which work environment brings
out your best, what gives you energy, and where things start to chafe.

TOF Persona gives you a personal working-style profile: which of the eight
personas sits closest to you, which ones play alongside it, and what that means
for the way you prefer to work and to be supported.

WHAT YOU GET

• A clear profile in plain language, not a list of scores
• All eight personas, to hold your own profile up against
• Notes on your profile: three questions to prepare a conversation with your
  manager
• History — take the test again when your work changes, and see what shifts

EVERYTHING STAYS ON YOUR DEVICE

No account. No sign-in. No internet needed.

Your answers, your profile and your notes live on your phone and are never sent
anywhere. We cannot see them. The privacy screen tells you exactly what the app
keeps, and clears all of it in one go.

WHO IT IS FOR

For anyone who wants to understand why one kind of work feels effortless and
another drains them. For a performance review, a new role, or simply for
yourself.

The app comes in Dutch and English; you choose your language when you open it.

TOF Persona is made by The Office Factory.
```

---

## 5. Zoekwoorden — alleen Apple (100, komma's zonder spaties)

**NL**
```
werkstijl,persona,zelfinzicht,loopbaan,bila,gesprek,leidinggevende,werkplek,teamrol,reflectie
```

**EN**
```
work style,self-insight,personality,career,one-on-one,manager,workplace,team role,reflection
```

Herhaal hier niet de appnaam of de categorie — die doorzoekt Apple al. Google
Play heeft geen zoekwoordveld; daar telt de omschrijving zelf.

---

## 6. "Wat is er nieuw" — eerste versie

**NL** `De eerste versie. Negen vragen, je eigen profiel, en alles blijft op je toestel.`

**EN** `The first release. Nine questions, your own profile, and everything stays on your device.`

---

## 7. Notities voor de beoordelaar

Meesturen bij de inzending. Dit voorkomt de twee vragen die een beoordelaar
anders stelt (waarom geen account, en of er iets verstuurd wordt).

**NL / EN — één tekst, Apple beoordeelt in het Engels**
```
This app works entirely offline and stores everything locally on the device.
There is no account, no login and no server component: no demo credentials are
needed to review it.

Open the app, choose a language, answer nine questions and the profile appears.
The privacy screen (reachable from the start screen) lists everything the app
stores and offers a single action to erase all of it.

The app makes no network requests at all. App Privacy is therefore declared as
"Data Not Collected".
```

---

## 8. Instellingen bij de inzending

| Onderwerp | Keuze |
| --- | --- |
| Categorie | Productiviteit (hoofd), Zakelijk (tweede) |
| Leeftijd | 4+ / Everyone |
| App Privacy (Apple) | Data Not Collected |
| Data safety (Google) | Geen gegevens verzameld, geen gegevens gedeeld |
| Talen | Nederlands en Engels |
| Prijs | Gratis, geen in-app aankopen |

---

## 9. Wat er nog moet komen voordat je kunt inzenden

Geen tekst, wel verplicht:

1. **Een privacyverklaring op een webadres.** Beide winkels eisen een openbare
   link; het privacyscherm ín de app telt niet mee. De inhoud staat al in
   `docs/privacy-en-stores.md` en in het app-scherm — die moet als pagina op de
   website van The Office Factory komen te staan.
2. **Een ondersteuningsadres**: een pagina of een mailadres waar iemand met een
   vraag terechtkan.
3. **Schermafbeeldingen.** Apple wil ze in het grootste iPhone-formaat, Google
   minstens twee plus een uitgelicht plaatje van 1024 × 500. Die kan ik maken
   zodra Xcode één keer is geopend — dan draai ik de app in de simulator en leg
   ik de schermen vast in beide talen.
De inschrijving bij Apple is al rond, als individu — dus géén D-U-N-S-nummer
nodig. Houd er wel rekening mee dat de verkoper in de App Store "Judith
Dorlandt" wordt en niet "The Office Factory".
