/**
 * teamSignals — de duidende teksten uit `src/insights.js`.
 *
 * Deze laag hoort bij de afgeleide "signalen" over een team:
 *   - confidence : betrouwbaarheid van het beeld (aantal profielen)
 *   - maturity   : hoe evenwichtig de werkstijlen verdeeld zijn
 *   - axes       : de drie spanningsassen (Creatie/Structuur enz.)
 *   - tone       : losse zinsdelen die de toon aanpassen aan de zekerheid
 *   - signature  : de afsluitende signatuurzin onder een teamdashboard
 *
 * Verschijnt o.a. in `src/components/TeamDynamics.jsx` (signatuurzin en de
 * drie assen in het Dynamiek-paneel) en in de Team Dynamics PDF.
 *
 * Sleutels die logica zijn en dus NOOIT vertaald worden:
 *   - confidence-niveaus: low / emerging / reliable / strong
 *   - maturity-niveaus: imbalance / functional / complementary
 *   - as-ids: creationStructure / connectionIndividual / executionReflection
 *   - tone-sleutels: schuurt / zien / ontbreekt / vraagt
 *   - signature-ids
 *
 * LET OP — PDF-fonts: de gebundelde lettertypes missen de tekens voor
 * groter-of-gelijk en kleiner-of-gelijk. Schrijf drempels altijd uit
 * ("10 of meer"), gebruik die symbolen hier nooit.
 */

const teamSignals = {
  // Betrouwbaarheidsbadge + toelichting; `n` = aantal ingevulde profielen.
  confidence: {
    low: {
      label: 'Eerste signalen',
      text: (n) =>
        `Op basis van ${n} profiel${n === 1 ? '' : 'en'} zijn dit eerste signalen. De patronen kunnen wijzen op een richting, maar vragen verdere validatie.`,
    },
    emerging: {
      label: 'Opkomend patroon',
      text: (n) =>
        `${n} profielen geven een opkomend patroon. De inzichten zijn waarschijnlijk representatief, maar winnen aan kracht naarmate meer collega's de test invullen.`,
    },
    reliable: {
      label: 'Betrouwbaar patroon',
      text: (n) =>
        `Met ${n} profielen is dit een betrouwbaar beeld. De patronen komen consistent terug en geven een solide basis voor concrete beslissingen.`,
    },
    strong: {
      label: 'Sterk patroon',
      text: (n) =>
        `${n} profielen leveren een sterk, consistent beeld. Dit patroon is duidelijk zichtbaar en geeft een betrouwbare basis voor strategische keuzes.`,
    },
  },

  // Volwassenheid van de werkstijlmix. `stmt` = de kernzin, `explain` = de
  // uitleg eronder.
  maturity: {
    imbalance: {
      label: 'Disbalans',
      stmt: 'Dit team leunt zwaar op een beperkt aantal werkstijlen. Dat creëert cohesie — maar ook blinde vlekken die groter worden naarmate de context verandert.',
      explain: 'Eén of twee persona\'s domineren sterk. Meerdere andere zijn nauwelijks vertegenwoordigd. Dit werkt in stabiele contexten, maar is kwetsbaar bij verandering.',
    },
    functional: {
      label: 'Functioneel',
      stmt: 'Dit team functioneert, maar leunt op een beperkt aantal werkstijlen. De ontbrekende perspectieven zijn niet kritiek — maar worden dat wel als de druk toeneemt.',
      explain: 'Er is enige dominantie zichtbaar maar geen extreme disbalans. Het team presteert goed in vertrouwde situaties; nieuwe uitdagingen onthullen de grenzen.',
    },
    complementary: {
      label: 'Complementair',
      stmt: 'Dit team heeft de potentie van een complementair team — mits de verschillen bewust worden ingericht en niet aan het toeval worden overgelaten.',
      explain: 'De werkstijlen zijn relatief evenwichtig verdeeld. Dat biedt breedte en veerkracht, maar vraagt bewuste coördinatie. Diversiteit werkt alleen als ze begrepen wordt.',
    },
  },

  // De drie spanningsassen. Per as kiest de logica één van de drie
  // `desc`-varianten (linkerkant zwaarder / rechterkant zwaarder / in balans)
  // en de bijbehorende `tension`-regel.
  axes: {
    creationStructure: {
      label: 'Creatie vs Structuur',
      left: 'Creatie',
      right: 'Structuur',
      descLeft: 'Het team genereert veel ideeën maar mist ankerpunten. Zonder structuur verliest creativiteit haar landing.',
      descRight: 'Het team is sterk in uitvoering en kaders, maar kan nieuwe perspectieven mislopen.',
      descBalanced: 'Creatie en structuur houden elkaar in evenwicht — een gezonde spanning als ze bewust worden benut.',
      tensionLeft: 'Risico: ideeën starten maar landen niet.',
      tensionRight: 'Risico: bestaande kaders worden zelden uitgedaagd.',
      tensionBalanced: 'Let op: balans vraagt actieve verbinding tussen beide polen.',
    },
    connectionIndividual: {
      label: 'Verbinding vs Individualiteit',
      left: 'Verbinding',
      right: 'Individueel',
      descLeft: 'Het team investeert sterk in relaties. Individuele prestaties kunnen daardoor onderbelicht raken.',
      descRight: 'Het team werkt graag autonoom. Samenwerking verloopt functioneel maar zelden warm — de onderstroom blijft onbesproken.',
      descBalanced: 'Verbinding en individualiteit zijn in balans. Dat vraagt werkruimtes die beide faciliteren.',
      tensionLeft: 'Risico: conflict wordt vermeden in plaats van besproken.',
      tensionRight: 'Risico: niemand signaleert wat er werkelijk speelt.',
      tensionBalanced: 'Blijf de balans tussen groep en individu bewust volgen.',
    },
    executionReflection: {
      label: 'Executie vs Reflectie',
      left: 'Executie',
      right: 'Reflectie',
      descLeft: 'Het team is sterk in actie en resultaat. De kwaliteitscheck achteraf is soms dunner dan gewenst.',
      descRight: 'Het team denkt grondig na. De omzetting van inzicht naar actie kost meer tijd dan nodig.',
      descBalanced: 'Actie en reflectie wisselen elkaar af — een rijp patroon, als het bewust is.',
      tensionLeft: 'Risico: snelheid gaat ten koste van kwaliteit en draagvlak.',
      tensionRight: 'Risico: het team analyseert terwijl de kans voorbijgaat.',
      tensionBalanced: 'Zorg dat reflectie leidt tot beslissing — niet tot uitstel.',
    },
  },

  // Losse zinsdelen die middenin een zin worden ingevoegd. Daarom kleine
  // letter en geen punt. Welke set gebruikt wordt hangt af van hoe zeker
  // het beeld is.
  tone: {
    low: {
      schuurt: 'kan wijzen op',
      zien: 'eerste signalen suggereren',
      ontbreekt: 'zou kunnen betekenen',
      vraagt: 'zou kunnen vragen om',
    },
    emerging: {
      schuurt: 'waarschijnlijk',
      zien: 'het patroon wijst op',
      ontbreekt: 'lijkt te betekenen',
      vraagt: 'vraagt waarschijnlijk om',
    },
    imbalance: {
      schuurt: 'is duidelijk zichtbaar',
      zien: 'komt consistent terug',
      ontbreekt: 'betekent concreet',
      vraagt: 'vraagt onmiskenbaar om',
    },
    confident: {
      schuurt: 'is zichtbaar',
      zien: 'geeft een betrouwbaar beeld van',
      ontbreekt: 'betekent',
      vraagt: 'vraagt om',
    },
  },

  // Eén afsluitende zin onder het teamdashboard. De logica kiest de eerste
  // regel die past; `fallback` als er geen enkel patroon opgaat.
  signature: {
    achieverWithoutConnector: 'Waar snelheid domineert en verbinding ontbreekt, groeit resultaat — maar verdwijnt draagvlak.',
    makerAndStabiliser: 'Creativiteit en zekerheid trekken aan hetzelfde team in tegenovergestelde richting. Zonder regie wint de sterkste — niet de beste.',
    innovatorAndStabiliser: 'Een team dat tegelijk wil vernieuwen en vasthouden, staat zichzelf in de weg.',
    missingConnectorWithAchiever: 'Een team dat alleen resultaten telt, raakt uiteindelijk de mensen kwijt die het resultaat maken.',
    missingInnovator: 'Een organisatie zonder vernieuwers ziet de toekomst pas als het te laat is om te bewegen.',
    complementary: 'Diversiteit is geen belofte — het is een ontwerpvraagstuk. Dit team heeft de ingrediënten. Nu de regie.',
    imbalance: 'Homogeniteit voelt als kracht — totdat de context verandert en iedereen dezelfde blinde vlek heeft.',
    ideasWithoutStructure: 'Een team vol ideeën zonder structuur is een team dat zijn eigen energie verspilt.',
    structureWithoutCreation: 'Waar structuur regeert en creativiteit ontbreekt, wordt de toekomst herhaald in plaats van gemaakt.',
    fallback: 'Het sterkste team is niet het meest homogene — maar het team dat zijn verschillen begrijpt en benut.',
  },
};

export default teamSignals;
