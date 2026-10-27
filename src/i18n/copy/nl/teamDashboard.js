/**
 * teamDashboard — Module 1 · Teaminzicht (src/components/TeamDashboard.jsx).
 *
 * De vier tegels staan in `tiles`. De sleutels daarvan (`personas`,
 * `workplace`, `tension`, `quickwins`) zijn logica-ids uit TeamDashboard.jsx —
 * nooit vertalen, alleen de waarden.
 *
 * Deze namespace wordt ook gebruikt door het organisatie-overzicht in
 * Admin.jsx, dat dezelfde tegels hergebruikt.
 */

// Plekken als lopende tekst: "Concentratieplekken, samenwerkplekken en
// rustplekken". Alleen de eerste met hoofdletter (begin van de zin).
function lijst(labels) {
  const l = labels.map((x, i) => (i === 0 ? x : x.toLowerCase()));
  return l.length <= 1 ? (l[0] || '') : `${l.slice(0, -1).join(', ')} en ${l[l.length - 1]}`;
}

const teamDashboard = {
  hero: {
    eyebrow: '01 — Teaminzicht',
    title: 'Teaminzicht voor',
    lead: 'Welke werkstijlen in dit team zitten, wat het team van de werkplek vraagt en waar de eerste kansen liggen.',
    downloadPdf: 'Download als PDF',
    otherTeam: 'Ander team',
  },

  // Als er geen teamnaam bekend is.
  fallbackTeamName: 'jouw team',

  chips: {
    responses: 'Ingebracht',
    organisation: 'Organisatie',
    dominant: 'Dominant',
    reliability: 'Betrouwbaarheid',
  },


  // Wat er in plaats van het dashboard staat als het team nog te klein is
  // (drempel in utils/access.js, blok in components/TeamGate.jsx).
  // Ook Teamdynamiek toont dit blok; de teksten staan alleen hier.
  // Opdracht C4 (akkoord Judith 23 okt 2026). De oude hint "Deel de teamcode
  // met je collega's" is weg (C6): de kopieerknop vervangt hem.
  gate: {
    title: 'Nog geen teambeeld',
    titleFor: 'Nog geen teambeeld voor',
    body: 'Het teambeeld verschijnt vanaf vijf ingebrachte profielen. Daaronder is te makkelijk te herleiden wie wat heeft geantwoord, ook als er geen namen bij staan.',
    count: (n) => `${n} van de 5 ingebracht`,
    copyMessage: 'Kopieer het bericht voor je team',
    copied: 'Gekopieerd',
    copyFailed: 'Kopiëren lukte niet. Probeer het nog een keer.',
    // Ophalen van de profielen lukte niet (E1.7, akkoord Judith 27 okt 2026).
    // De kop zegt "nu": de app weet in deze stand niet of het team onder de
    // vijf zit.
    titleLoadFailed: 'Nu geen teambeeld',
    titleForLoadFailed: 'Nu geen teambeeld voor',
    loadFailed: 'Het lukte niet om het aantal ingebrachte profielen op te halen. Probeer het later opnieuw.',
    // Rond de knop (besluit 2, akkoord Judith 27 okt 2026). Zonder teamcode
    // staat er geen knop, en vallen recipients en return ook weg.
    recipients: 'Stuur het bericht naar je team. Daarin staan de link naar de app en de teamcode. Iedereen in het team mag het doorsturen.',
    return: 'Kom later terug op team.persona-tool.nl/team. In deze browser hoef je de teamcode niet opnieuw in te vullen.',
    example: {
      before: 'Hoe een teambeeld eruitziet, zie je aan ',
      link: 'het voorbeeldteam',
      after: '.',
    },
    // Het bericht dat de knop kopieert. Neutrale stem: ook een teamlid kan
    // het doorsturen. De laatste zin hangt af van de namenschakelaar.
    message: ({ team, code, showNames }) => [
      `Doe je mee met het teambeeld van ${team}? Zo werkt het:`,
      `1. Open deze link op je telefoon en download de app TOF Persona: https://team.persona-tool.nl/quiz?code=${encodeURIComponent(code)}`,
      '2. Doe de test in de app: negen vragen, ongeveer vijf minuten.',
      `3. Tik onderaan je profiel op 'Profiel inbrengen'. Vul op de website deze teamcode in, tik op 'Code controleren' en daarna op 'Inbrengen': ${code}`,
      "Pas na 'Inbrengen' telt je profiel mee. Bewaar dit bericht tot dan: de teamcode heb je pas na de test nodig.",
      "Zodra vijf collega's hun profiel hebben ingebracht, staat het teambeeld klaar. Je opent het op team.persona-tool.nl/team, met dezelfde teamcode.",
      showNames
        ? 'Je team gebruikt de namenoptie. Iedereen in het team ziet dezelfde namen, ook de leidinggevende. Wie het naamveld leeg laat, staat er zonder naam in.'
        : 'Niemand ziet wie welke werkstijl heeft, ook een leidinggevende niet.',
    ].join('\n'),
  },

  close: 'Sluiten ✕',
  // Voor de schermlezer; het kruisje zelf leest als "maal".
  closeLabel: 'Paneel sluiten',

  // Als een waarde ontbreekt.
  empty: '—',

  tiles: {
    personas: {
      eyebrow: 'Werkstijlen',
      hint: 'Wie zit er in dit team',
      detailTitle: 'Wie zit er in dit team',
    },
    workplace: {
      eyebrow: 'Werkplek',
      hint: 'Wat vraagt dit team',
      detailTitle: 'Wat vraagt dit team van de werkplek',
    },
    // Aansluiting werkplek (besluit 1, 27 okt; tekst redacteur). De tegel
    // stelt de vraag die het paneel ("Check in je kantoor") uitwerkt.
    // `first` = de eerste kernplek (zonder kern het hoogste type),
    // `beperkt` = de plek die het minst nodig is, `extra` = aantal andere
    // plekken in beperkt nodig. Labels zoals ze in het profiel heten.
    tension: {
      eyebrow: 'Aansluiting werkplek',
      detailTitle: 'Sluit de werkplek aan bij dit team?',
      value: (first) => `Genoeg ${first.toLowerCase()}?`,
      hint: (beperkt, extra) => (beperkt
        ? `Beperkt nodig: ${beperkt.toLowerCase()}${extra > 0 ? ` +${extra}` : ''}`
        : 'Beperkt nodig: geen'),
      // `kernen` = labels van de kernplekken ([] zonder kern), `hoogste` =
      // het meest gevraagde type, `beperkt` = labels in beperkt nodig.
      lead: (kernen, hoogste, beperkt) => {
        const eerste = kernen.length > 0
          ? `${lijst(kernen)} zijn de kern voor dit team.`
          : `Dit team heeft geen uitgesproken kernplek. Het meest gevraagd zijn ${hoogste.toLowerCase()}.`;
        return beperkt.length > 0
          ? `${eerste} ${lijst(beperkt)} zijn beperkt nodig.`
          : eerste;
      },
    },
    quickwins: {
      eyebrow: 'Direct te doen',
      hint: 'Voor morgen',
      detailTitle: 'Acties voor morgen',
      detailLead: 'Concrete acties afgeleid uit alle inzichten van dit dashboard.',
      value: (n) => `${n} ${n === 1 ? 'actie' : 'acties'}`,
    },
  },

  bridge: {
    available: {
      eyebrow: 'Teamdynamiek beschikbaar',
      lead: 'Zie de onderliggende patronen: waarom deze samenstelling werkt of schuurt.',
      cta: 'Naar Teamdynamiek →',
    },
    // Voor wie geen Teamdynamiek ziet: teamlid, of leidinggevende die nog
    // niet is ingelogd (opdracht D, besluit Judith 23 okt 2026: variant A
    // met inloglink). Geen aanprijzing, geen knop naar een gesprek.
    locked: {
      // Besluit 4, 27 okt: waar dit beeld voor is, voor wie niet is ingelogd.
      discuss: 'Dit beeld is bedoeld om samen in je team te bespreken: wat herken je, en wat niet?',
      body: 'Je leidinggevende ziet daarnaast Teamdynamiek: wat de samenstelling van dit team vraagt van leidinggeven. Daarin staat niet wie welke werkstijl heeft.',
      login: 'Ben jij de leidinggevende? Log in →',
      // Deelmoment 2, deel B (deelteksten 22 okt 2026): een tekst voor de
      // leidinggevende van een ánder team. Niets van het eigen team erin.
      shareEyebrow: 'Ander team?',
      shareLead: 'Wil een ander team dit ook? Kopieer de tekst voor hun leidinggevende.',
      button: 'Tekst kopiëren',
      copied: 'Gekopieerd. Zet er in je eigen woorden bij wat jou bijbleef. Jullie eigen teambeeld blijft erbuiten.',
      copyFailed: 'Kopiëren lukte niet. Probeer het nog een keer.',
      shareText: `Hoi,

In ons team hebben we TOF Persona gedaan. Iedereen vult negen vragen in over de eigen manier van werken. Ik vond het vooral interessant om te zien hoe ik zelf werk, en waarom dat in een team soms schuurt.

Daarna krijgt het team een gezamenlijk beeld: welke werkstijlen er zijn en wat het team van de werkplek vraagt. Wie welke werkstijl heeft, staat er standaard niet in, ook niet voor de leidinggevende. En onder vijf ingevulde profielen is er geen beeld.

Hoe zo'n beeld eruitziet, zie je aan het voorbeeldteam op www.persona-tool.nl/demo. Hoe je het voor een team regelt, staat op www.persona-tool.nl/voor-je-team.

Groet,`,
    },
  },
};

export default teamDashboard;
