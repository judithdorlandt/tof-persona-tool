/**
 * workplaceProfile.js (NL) — ALLE zichtbare tekst voor het experimentele
 * werkplekbehoefteprofiel (src/team/werkplek/WerkplekProfiel*.jsx).
 *
 * Toon: behoefte, gebruik en gedrag — NOOIT m², aantallen plekken of
 * inrichting. De "soort plek"-illustraties beschrijven het SOORT plek, niet
 * hoeveel ervan. Er staan bewust geen getallen of percentages in.
 *
 * LOGICA-SLEUTELS (nooit vertalen):
 *   - `band`    → kern / steun / aanvullend (BAND uit werkplekProfielLogic.js)
 *   - `types`   → werkplektype-ids uit werkplekmix.js
 *   - `gebruik` → dezelfde werkplektype-ids
 *   - `signalen`→ signal-ids uit buildGedragssignalen()
 */

import { PRIKKEL_START_MAAND } from '../../../lib/prikkel';

const workplaceProfile = {
    ui: {
        eyebrow: 'Werkplekbehoefte',
        title: 'Hoe dit team de werkomgeving',
        titleAccent: 'nodig heeft en gebruikt',
        lead:
            'Vertaald uit de aanwezige werkstijlen: waar dit team z\u2019n energie kwijt wil, ' +
            'waar het op leunt en waar de balans aandacht vraagt. Geen inrichting, geen aantallen — ' +
            'alleen gedrag en gebruik.',
        terug: '\u2190 Terug naar teaminzicht',

        // Signatuur-regel met de teamnaam.
        signatuur: 'Werkplekprofiel van',
        teamFallback: 'jouw team',

        // Hero — de sterkste behoefte als dominant leespunt.
        heroEyebrow: 'Wat dit team het meest nodig heeft',
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

    // Naam en "soort plek"-illustratie per werkplektype. De ids komen uit
    // werkplekmix.js; die blijft de bron voor de LOGICA, deze lijst voor de TEKST.
    types: {
        standaard: {
            label: 'Standaard werkplekken',
            voorbeeldplekken: [
                'Eenpersoonswerkplek, open of afgesloten',
                'Tweepersoonswerkplek, open of afgesloten',
                'Open werkplek voor meer mensen',
            ],
        },
        concentratie: {
            label: 'Concentratieplekken',
            voorbeeldplekken: ['Afgesloten eenpersoonsplek', 'Stiltezone, zoals in een bibliotheek'],
        },
        overleg: {
            label: 'Overlegplekken',
            voorbeeldplekken: ['Plek voor gepland of spontaan overleg', 'Overlegruimte, klein of groot'],
        },
        samenwerk: {
            label: 'Samenwerkplekken',
            voorbeeldplekken: [
                'Werkplek voor meer mensen, open of afgesloten',
                'Teamruimte',
                'Projecttafel',
            ],
        },
        creatief: {
            label: 'Creatieve plekken',
            voorbeeldplekken: [
                'Brainstormruimte',
                'Projectruimte',
                'Wanden om op te schrijven',
                'Break-out',
                'Ruimte om voortgang zichtbaar te maken',
            ],
        },
        informeel: {
            label: 'Informele plekken',
            voorbeeldplekken: [
                'Koffiepunt',
                'Zithoek',
                'Restaurant of café',
                'Informele zitjes',
                'Plek om even neer te strijken',
            ],
        },
        rust: {
            label: 'Rustplekken',
            voorbeeldplekken: [
                'Rustruimte',
                'Stilteruimte',
                'Ruimte om te ontprikkelen',
                'Vitaliteitsruimte',
                'Gebedsruimte',
            ],
        },
        leer: {
            label: 'Leerplekken',
            voorbeeldplekken: [
                'Geen aparte ruimte: leren kan in een teamruimte, een overlegruimte of op een ontmoetingsplek.',
            ],
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
        weinig_ontmoeting: {
            titel: 'Weinig vanzelfsprekend contact',
            tekst:
                'Concentratie en rust domineren, terwijl informeel en samen werken weinig nadruk krijgen. ' +
                'Onderlinge afstemming kan verschralen als ontmoeting niet vanzelf gebeurt.',
        },
    },

    // Teamblok "Geluid en werkomgeving" (prikkelbehoefte). Het signaal komt
    // uit public.prikkel_voor_code (supabase/011); hier alleen de woorden.
    // Bron: tof-marketingteam/content/teksten-app-prikkelbehoefte.md, §3.
    prikkelTeam: {
        eyebrow: 'Geluid en werkomgeving',
        gemengd: {
            kop: 'Dit team heeft stilte én reuring nodig',
            tekst: 'Eén open ruimte werkt dan voor niemand goed. Spreek af dat wie stilte zoekt in de Concentratieplekken werkt en wie reuring zoekt aan de Informele plekken. Bellen en overleggen gebeurt buiten de Concentratieplekken.',
        },
        stil: {
            kop: 'Voor dit team komt stilte eerst',
            tekst: 'Bewaak dat de Concentratieplekken stil blijven en dat de Rustplekken geen belhoek worden. Spreek samen af waar wel gebeld en overlegd wordt.',
        },
        reuring: {
            kop: 'Dit team werkt het best met leven eromheen',
            tekst: 'Een stil kantoor voelt voor dit team leeg en geeft weinig reden om te komen. Spreek dagen af waarop het team er samen is en werk die dagen ook aan de Informele plekken.',
        },
        zonderUitersten: {
            kop: 'Dit team zit tussen stilte en reuring in',
            tekst: 'Een open ruimte met wat geroezemoes werkt hier, zolang er elders gebeld wordt. Houd de Concentratieplekken vrij voor wie een tijd helemaal stil wil werken.',
        },
        meta: 'Dit blok komt uit de antwoorden van het team zelf, zonder namen. De plekken hierboven zijn afgeleid uit de werkstijlen.',
        leeg: `Geluid en werkomgeving: nog te weinig antwoorden met een voorkeur om iets over dit team te zeggen. De vraag is nieuw: wie vóór ${PRIKKEL_START_MAAND.nl} een profiel invulde, kreeg hem toen nog niet.`,
    },
};

export default workplaceProfile;
