/**
 * servicesProfile.js (NL) — zichtbare tekst voor "Wat dit team naar kantoor
 * trekt" (dienstenprofiel): de laag in het Werkplek-paneel van het
 * teamdashboard en de jij-zin in het persoonlijke profiel.
 *
 * Bron, teken voor teken: tof-marketingteam/toetsen/2026-11-04-ID-001-dienstenprofiel-v2.md
 * (punt 1 koppen en toestand, punt 2 team, punt 3 individueel, punt 4 diensten).
 * Besloten door Judith, 4 nov 2026. Niet zelf herschrijven.
 *
 * Twee bewerkingen van de vorm, niet van de woorden (ontwerp 4 nov):
 *   - `geenUitgesproken`: de eerste zin (`kop`) staat los van de rest (`tekst`).
 *   - `voorbeelden`: de opsomming uit punt 4 als lijst, gesplitst op de komma's.
 * De IT-voetregel krijgt de dienstnaam vooraan (`diensten.it.naam`), goedgekeurd
 * met de schets op 4 nov.
 *
 * LOGICA-SLEUTELS (nooit vertalen):
 *   - `diensten` → ids uit DIENSTTYPEN (src/team/werkplek/dienstenmix.js)
 *   - `wie`      → team / organisatie / beide
 *   - `waarom`, `individueel.zin` → persona-ids
 */

const servicesProfile = {
    titel: 'Wat dit team naar kantoor trekt',
    waaromKop: 'Waarom dit team komt',
    dienstenKop: 'Wat een kantoordag de moeite waard maakt',
    helptOokKop: 'Helpt ook',

    geenUitgesproken: {
        kop: 'Voor dit team springt er niets uit.',
        tekst: 'Voor deze werkstijlen weegt geen onderdeel van een kantoordag duidelijk zwaarder dan de rest. Spreek samen af waar jullie kantoordagen om draaien.',
    },

    itVoetregel: 'Voor iedereen in dit team is dit een voorwaarde: alles werkt bij aankomst en als het hapert, is er snel hulp.',

    disclaimer: 'Afgeleid uit de werkstijlen in dit team, op basis van een expertoordeel en niet gemeten. Over hoe vaak iemand naar kantoor komt, zegt het niets.',

    wie: {
        team: 'Spreek je als team af',
        organisatie: 'Regelt de organisatie',
        beide: 'Deels het team, deels de organisatie',
    },

    diensten: {
        ontvangst: {
            naam: 'Ontvangst en gastvrijheid',
            uitleg: 'Iemand die je welkom heet, wegwijs maakt en mensen met elkaar in contact brengt.',
            voorbeelden: ['een gastheer of gastvrouw', 'een communitymanager', "een welkom voor nieuwe collega's"],
        },
        eten: {
            naam: 'Eten en drinken',
            uitleg: 'Goede koffie en lunch als vanzelfsprekend moment om elkaar te treffen.',
            voorbeelden: ['een koffiebar', 'lunch op locatie', 'een tafel waar je samen eet'],
        },
        ontmoeting: {
            naam: 'Ontmoetingsmomenten',
            uitleg: 'Geplande momenten die een reden geven om te komen.',
            voorbeelden: ['teamdagen', 'kennissessies', 'vieringen en mijlpalen'],
        },
        focus: {
            naam: 'Focusondersteuning',
            uitleg: 'Afspraken die rust bewaken, zodat geconcentreerd werk ook op kantoor lukt.',
            voorbeelden: ['stiltezones die stil blijven', 'vaste focusuren', 'afspraken over storen'],
        },
        it: {
            naam: 'IT-ondersteuning',
            uitleg: 'Alles werkt bij aankomst en als het hapert, is er snel hulp.',
            voorbeelden: ['schermen en verbinding', 'vergaderapparatuur', 'hulp op locatie'],
        },
        leren: {
            naam: 'Leren en kennisdelen',
            uitleg: 'Tijd en gelegenheid om van elkaar te leren.',
            voorbeelden: ['lunchlezingen', 'intervisie', 'meekijkmomenten'],
        },
        welzijn: {
            naam: 'Welzijn en herstel',
            uitleg: 'Aandacht voor energie en herstel gedurende de dag.',
            voorbeelden: ['een wandeloverleg', 'beweegmomenten', 'een plek om te ontprikkelen'],
        },
        gemak: {
            naam: 'Praktisch gemak',
            uitleg: 'Dingen die de dag makkelijker en voorspelbaarder maken.',
            voorbeelden: ['pakketjes en kluisjes', 'fietsenstalling', 'eenvoudig een plek reserveren en zien wie er komt'],
        },
    },

    // Teamweergave, derde persoon (punt 2). Hoogstens drie tegelijk.
    waarom: {
        maker: 'Komt om iets te maken. Aan een projecttafel of whiteboard wordt een idee snel zichtbaar, als de spullen bij de hand liggen.',
        groeier: 'Komt om van anderen te leren, door mee te kijken met een collega en feedback te krijgen die thuis uitblijft.',
        presteerder: 'Komt als er die dag een besluit valt en het werk daarna zonder ruis vooruit kan.',
        denker: 'Komt voor een goed voorbereid gesprek over de inhoud, mits er daarna een stille plek is om het uit te denken.',
        verbinder: 'Komt voor de mensen, om bij te praten en het vertrouwen te onderhouden dat op afstand slijt.',
        teamspeler: 'Komt als het eigen team er ook is. Een vaste teamdag en een eigen plek maken van kantoor een thuisbasis.',
        zekerzoeker: 'Komt als de dag voorspelbaar is: vooraf weten wie er komt en dat er een plek is.',
        vernieuwer: 'Komt voor gesprekken met mensen buiten het eigen team, waar een idee scherper wordt en een richting ontstaat.',
    },

    // Individuele weergave, jij-vorm (punt 3).
    individueel: {
        kop: 'Wat jou naar kantoor trekt',
        disclaimer: 'Afgeleid uit je werkstijl, op basis van een expertoordeel en niet gemeten.',
        zin: {
            maker: 'Jij komt om iets te maken, aan een projecttafel of whiteboard waar een idee snel zichtbaar wordt.',
            groeier: 'Jij komt om van anderen te leren: meekijken met een collega en feedback krijgen die thuis uitblijft.',
            presteerder: 'Jij komt als er die dag een besluit valt en je daarna zonder ruis verder kunt.',
            denker: 'Jij komt voor een goed voorbereid gesprek over de inhoud, als je daarna een stille plek hebt om het uit te denken.',
            verbinder: 'Jij komt voor de mensen, om bij te praten en het vertrouwen te onderhouden dat op afstand slijt.',
            teamspeler: 'Jij komt als je eigen team er ook is, op een vaste teamdag en met een plek die van jullie is.',
            zekerzoeker: 'Jij komt als de dag voorspelbaar is en je vooraf weet wie er is en waar je zit.',
            vernieuwer: 'Jij komt voor gesprekken met mensen buiten je eigen team, waar een idee scherper wordt.',
        },
    },
};

export default servicesProfile;
