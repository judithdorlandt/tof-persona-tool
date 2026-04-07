import { ARCHETYPES } from './data';

export function getConfidence(n) {
  if (n < 5) return {
    level: 'low', label: 'Eerste signalen', cls: 'low', icon: '◎',
    text: `Op basis van ${n} profiel${n === 1 ? '' : 'en'} zijn dit eerste signalen. De patronen kunnen wijzen op een richting, maar vragen verdere validatie.`,
  };
  if (n <= 15) return {
    level: 'emerging', label: 'Opkomend patroon', cls: 'emerging', icon: '◑',
    text: `${n} profielen geven een opkomend patroon. De inzichten zijn waarschijnlijk representatief, maar winnen aan kracht naarmate meer collega's de test invullen.`,
  };
  if (n <= 30) return {
    level: 'reliable', label: 'Betrouwbaar patroon', cls: 'reliable', icon: '●',
    text: `Met ${n} profielen is dit een betrouwbaar beeld. De patronen komen consistent terug en geven een solide basis voor concrete beslissingen.`,
  };
  return {
    level: 'strong', label: 'Sterk patroon', cls: 'strong', icon: '◉',
    text: `${n} profielen leveren een sterk, consistent beeld. Dit patroon is duidelijk zichtbaar en geeft een betrouwbare basis voor strategische keuzes.`,
  };
}

export function getMaturity(pcts, srt) {
  const dominant = srt.filter(x => pcts[x.i] > 40);
  const thin = srt.filter(x => pcts[x.i] > 0 && pcts[x.i] < 5);
  const absent = srt.filter(x => pcts[x.i] === 0);

  if (dominant.length >= 1 && (absent.length + thin.length) >= 3) return {
    level: 1, label: 'Disbalans', color: 'rose',
    stmt: 'Dit team leunt zwaar op een beperkt aantal werkstijlen. Dat creëert cohesie — maar ook blinde vlekken die groter worden naarmate de context verandert.',
    explain: 'Eén of twee persona\'s domineren sterk. Meerdere andere zijn nauwelijks vertegenwoordigd. Dit werkt in stabiele contexten, maar is kwetsbaar bij verandering.',
  };

  const spread = srt.filter(x => pcts[x.i] >= 10).length;
  if (spread >= 5) return {
    level: 3, label: 'Complementair', color: 'green',
    stmt: 'Dit team heeft de potentie van een complementair team — mits de verschillen bewust worden ingericht en niet aan het toeval worden overgelaten.',
    explain: 'De werkstijlen zijn relatief evenwichtig verdeeld. Dat biedt breedte en veerkracht, maar vraagt bewuste coördinatie. Diversiteit werkt alleen als ze begrepen wordt.',
  };

  return {
    level: 2, label: 'Functioneel', color: 'amber',
    stmt: 'Dit team functioneert, maar leunt op een beperkt aantal werkstijlen. De ontbrekende perspectieven zijn niet kritiek — maar worden dat wel als de druk toeneemt.',
    explain: 'Er is enige dominantie zichtbaar maar geen extreme disbalans. Het team presteert goed in vertrouwde situaties; nieuwe uitdagingen onthullen de grenzen.',
  };
}

export function getDynamics(pcts) {
  const creatie = pcts[0] + pcts[1] + pcts[7];
  const structuur = pcts[6] + Math.round(pcts[3] / 2);
  const verbinding = pcts[4] + pcts[5];
  const individueel = pcts[0] + pcts[2] + pcts[3];
  const executie = pcts[2] + pcts[7];
  const reflectie = pcts[3] + pcts[1];

  return [
    {
      label: 'Creatie vs Structuur', left: 'Creatie', right: 'Structuur',
      lv: Math.min(creatie, 100), rv: Math.min(structuur, 100),
      desc: creatie > structuur + 20
        ? 'Het team genereert veel ideeën maar mist ankerpunten. Zonder structuur verliest creativiteit haar landing.'
        : structuur > creatie + 20
        ? 'Het team is sterk in uitvoering en kaders, maar kan nieuwe perspectieven mislopen.'
        : 'Creatie en structuur houden elkaar in evenwicht — een gezonde spanning als ze bewust worden benut.',
      tension: creatie > structuur + 20
        ? 'Risico: ideeën starten maar landen niet.'
        : structuur > creatie + 20
        ? 'Risico: bestaande kaders worden zelden uitgedaagd.'
        : 'Let op: balans vraagt actieve verbinding tussen beide polen.',
    },
    {
      label: 'Verbinding vs Individualiteit', left: 'Verbinding', right: 'Individueel',
      lv: Math.min(verbinding, 100), rv: Math.min(individueel, 100),
      desc: verbinding > individueel + 20
        ? 'Het team investeert sterk in relaties. Individuele prestaties kunnen daardoor onderbelicht raken.'
        : individueel > verbinding + 20
        ? 'Het team werkt graag autonoom. Samenwerking verloopt functioneel maar zelden warm — de onderstroom blijft onbesproken.'
        : 'Verbinding en individualiteit zijn in balans. Dat vraagt werkruimtes die beide faciliteren.',
      tension: verbinding > individueel + 20
        ? 'Risico: conflict wordt vermeden in plaats van besproken.'
        : individueel > verbinding + 20
        ? 'Risico: niemand signaleert wat er werkelijk speelt.'
        : 'Blijf de balans tussen groep en individu bewust volgen.',
    },
    {
      label: 'Executie vs Reflectie', left: 'Executie', right: 'Reflectie',
      lv: Math.min(executie, 100), rv: Math.min(reflectie, 100),
      desc: executie > reflectie + 20
        ? 'Het team is sterk in actie en resultaat. De kwaliteitscheck achteraf is soms dunner dan gewenst.'
        : reflectie > executie + 20
        ? 'Het team denkt grondig na. De omzetting van inzicht naar actie kost meer tijd dan nodig.'
        : 'Actie en reflectie wisselen elkaar af — een rijp patroon, als het bewust is.',
      tension: executie > reflectie + 20
        ? 'Risico: snelheid gaat ten koste van kwaliteit en draagvlak.'
        : reflectie > executie + 20
        ? 'Risico: het team analyseert terwijl de kans voorbijgaat.'
        : 'Zorg dat reflectie leidt tot beslissing — niet tot uitstel.',
    },
  ];
}

export function getAdaptiveTone(conf, maturity) {
  if (conf.level === 'low') return {
    schuurt: 'kan wijzen op', zien: 'eerste signalen suggereren',
    ontbreekt: 'zou kunnen betekenen', vraagt: 'zou kunnen vragen om',
  };
  if (conf.level === 'emerging') return {
    schuurt: 'waarschijnlijk', zien: 'het patroon wijst op',
    ontbreekt: 'lijkt te betekenen', vraagt: 'vraagt waarschijnlijk om',
  };
  if (maturity.level === 1) return {
    schuurt: 'is duidelijk zichtbaar', zien: 'komt consistent terug',
    ontbreekt: 'betekent concreet', vraagt: 'vraagt onmiskenbaar om',
  };
  return {
    schuurt: 'is zichtbaar', zien: 'geeft een betrouwbaar beeld van',
    ontbreekt: 'betekent', vraagt: 'vraagt om',
  };
}

export function getSignatureLine(dom, missing, maturity, dynamics) {
  const ids = dom.map(a => a.id);
  if (ids.includes('presteerder') && !ids.includes('verbinder'))
    return 'Waar snelheid domineert en verbinding ontbreekt, groeit resultaat — maar verdwijnt draagvlak.';
  if (ids.includes('maker') && ids.includes('zekerzoeker'))
    return 'Creativiteit en zekerheid trekken aan hetzelfde team in tegenovergestelde richting. Zonder regie wint de sterkste — niet de beste.';
  if (ids.includes('vernieuwer') && ids.includes('zekerzoeker'))
    return 'Een team dat tegelijk wil vernieuwen en vasthouden, staat zichzelf in de weg.';
  if (missing.some(a => a.id === 'verbinder') && ids.includes('presteerder'))
    return 'Een team dat alleen resultaten telt, raakt uiteindelijk de mensen kwijt die het resultaat maken.';
  if (missing.some(a => a.id === 'vernieuwer'))
    return 'Een organisatie zonder vernieuwers ziet de toekomst pas als het te laat is om te bewegen.';
  if (maturity.level === 3)
    return 'Diversiteit is geen belofte — het is een ontwerpvraagstuk. Dit team heeft de ingrediënten. Nu de regie.';
  if (maturity.level === 1)
    return 'Homogeniteit voelt als kracht — totdat de context verandert en iedereen dezelfde blinde vlek heeft.';
  const d = dynamics[0];
  if (d.lv > d.rv + 25)
    return 'Een team vol ideeën zonder structuur is een team dat zijn eigen energie verspilt.';
  if (d.rv > d.lv + 25)
    return 'Waar structuur regeert en creativiteit ontbreekt, wordt de toekomst herhaald in plaats van gemaakt.';
  return 'Het sterkste team is niet het meest homogene — maar het team dat zijn verschillen begrijpt en benut.';
}

export function aggregateProfiles(profiles) {
  const cnt = [0, 0, 0, 0, 0, 0, 0, 0];
  profiles.forEach(p => {
    const pi = ARCHETYPES.findIndex(a => a.id === p.primary_archetype);
    const si = ARCHETYPES.findIndex(a => a.id === p.secondary_archetype);
    const ti = ARCHETYPES.findIndex(a => a.id === p.tertiary_archetype);
    if (pi >= 0) cnt[pi] += 3;
    if (si >= 0) cnt[si] += 2;
    if (ti >= 0) cnt[ti] += 1;
  });
  const tot = cnt.reduce((a, b) => a + b, 0) || 1;
  const pcts = cnt.map(c => Math.round((c / tot) * 100));
  const srt = cnt.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
  const dom = srt.filter(x => x.c > 0).slice(0, 3).map(x => ARCHETYPES[x.i]);
  const missing = srt.filter(x => x.c === 0).map(x => ARCHETYPES[x.i]);
  const missCrit = missing.filter(a => ['denker', 'verbinder', 'vernieuwer'].includes(a.id));

  const n = profiles.length;
  const conf = getConfidence(n);
  const maturity = getMaturity(pcts, srt);
  const dynamics = getDynamics(pcts);
  const tone = getAdaptiveTone(conf, maturity);
  const sig = getSignatureLine(dom, missing, maturity, dynamics);

  return { cnt, pcts, srt, dom, missing, missCrit, conf, maturity, dynamics, tone, sig };
}
