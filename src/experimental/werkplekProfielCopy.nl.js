/**
 * werkplekProfielCopy.nl.js — EXPERIMENTEEL
 *
 * ALLE zichtbare Nederlandse tekst voor het werkplekbehoefteprofiel.
 * Bewust losgekoppeld van de logica (werkplekProfielLogic.js) zodat dit later
 * één-op-één naar een vertaalbestand (NL/EN) kan verhuizen.
 *
 * Toon: behoefte, gebruik en gedrag — NOOIT m², aantallen plekken of inrichting.
 * De "soort plek"-illustraties beschrijven het SOORT plek, niet hoeveel ervan.
 */

export const WERKPLEK_PROFIEL_COPY = {
    ui: {
        eyebrow: 'Experimenteel — Werkplekbehoefte',
        title: 'Hoe dit team de werkomgeving',
        titleAccent: 'nodig heeft en gebruikt',
        lead:
            'Vertaald uit de aanwezige werkstijlen: waar dit team z\u2019n energie kwijt wil, ' +
            'waar het op leunt en waar de balans aandacht vraagt. Geen inrichting, geen aantallen — ' +
            'alleen gedrag en gebruik.',
        terug: '\u2190 Terug naar teaminzicht',

        // Signatuur-regel met de teamnaam.
        signatuur: 'Werkplekprofiel van',

        // Hero — de sterkste behoefte als dominant leespunt.
        heroEyebrow: 'Waar de energie van dit team naartoe gaat',
        heroOnderschrift: 'De plek waar dit team het meeste aan heeft. Onderbelicht blijven kost energie.',

        // Volledige, gerangschikte behoefte (alle overige typen, gegroepeerd per band).
        overzichtKop: 'De volledige behoefte, op volgorde',
        overzichtLead:
            'Van meeste naar minste nadruk. De labels tonen hoe centraal een plek is in ' +
            'hoe dit team werkt — niet hoeveel ervan nodig is.',

        // Gedragssignalen — secundaire kanttekeningen.
        signalenKop: 'Let op de balans',
        signalenLead:
            'Geen tekort aan ruimte, maar een gedragssignaal: hier kan het patroon van dit team gaan schuren.',
        geenSignalen: 'De behoefte is in balans — geen opvallend gedragsrisico in dit team.',

        illustratieLabel: 'Soort plek',
        legeStaat: 'Nog geen werkstijlen beschikbaar om een werkplekprofiel op te bouwen.',
    },

    // Bandlabels op teamniveau (afgeleid van kern/steun/aanvullend uit de mix).
    // titel = sectiekop, uitleg = korte duiding onder de kop.
    band: {
        kern: {
            label: 'Kern',
            kort: 'Centraal in hoe dit team werkt',
            uitleg: 'Hier zit de energie. Krijgen deze plekken te weinig ruimte, dan ontstaat er wrijving.',
        },
        steun: {
            label: 'Steun',
            kort: 'Regelmatig nodig, ondersteunend',
            uitleg: 'Niet de hoofdrol, maar wel geregeld nodig om het werk soepel te laten lopen.',
        },
        aanvullend: {
            label: 'Aanvullend',
            kort: 'Beperkt nodig',
            uitleg: 'Af en toe waardevol; de afwezigheid ervan is voor dit team zelden een probleem.',
        },
    },

    // Waarvoor het team de plek GEBRUIKT (gedrag/gebruik, geen inrichting).
    gebruik: {
        standaard: 'De vaste basis voor dagelijks werk — waar dit team de meeste uren landt en schakelt tussen taken.',
        concentratie: 'Voor diep, ononderbroken werk waar dit team het hoofd bij moet houden.',
        overleg: 'Voor afstemmen, knopen doorhakken en gestructureerde gesprekken.',
        samenwerk: 'Voor actief samen bouwen aan iets, met gedeeld eigenaarschap.',
        creatief: 'Voor verkennen, schetsen en ideeën laten groeien door te combineren.',
        informeel: 'Voor het losse contact dat vertrouwen en samenwerking voedt.',
        hybride: 'Voor werk waar online en fysiek elkaar moeten ontmoeten.',
        rust: 'Voor herstel, even terugschakelen en mentale ademruimte.',
        leer: 'Voor ontwikkelen, reflecteren en kennis delen in eigen tempo.',
    },

    // Gedragssignalen — secundaire kanttekeningen. Titel = dominant leespunt,
    // tekst = duiding. Strikt gedrag, geen ruimteadvies.
    signalen: {
        uitputting: {
            titel: 'Veel schakelen, weinig herstel',
            tekst:
                'Dit team leunt sterk op concentratie \u00e9n overleg, terwijl rust weinig nadruk krijgt. ' +
                'Het patroon vraagt continu scherpte zonder ingebouwde adempauze — op den duur een risico op uitputting.',
        },
        focus_verdrongen: {
            titel: 'Focus dreigt onder te sneeuwen',
            tekst:
                'De nadruk ligt op afstemmen en samen werken, terwijl geconcentreerd werk weinig ruimte krijgt. ' +
                'Diep werk kan verdrongen raken door de drukte van onderling contact.',
        },
        altijd_aan: {
            titel: 'Bijna altijd "aan"',
            tekst:
                'Veel overleg en hybride schakelen, weinig rust. Dit team is vaak verbonden en bereikbaar — ' +
                'let erop dat er ook momenten zijn om echt los te koppelen.',
        },
        weinig_ontmoeting: {
            titel: 'Weinig vanzelfsprekend contact',
            tekst:
                'Concentratie en rust domineren, terwijl informeel en samen werken weinig nadruk krijgen. ' +
                'Onderlinge afstemming kan verschralen als ontmoeting niet vanzelf gebeurt.',
        },
    },
};

export default WERKPLEK_PROFIEL_COPY;
