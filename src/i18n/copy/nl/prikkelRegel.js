/**
 * prikkelRegel — één regel in het eigen profiel, onder de drie Bricks, als je
 * antwoord op de werkomgevingsvraag tegen je werkstijl in gaat (zie
 * src/lib/prikkel.js). Teksten letterlijk uit
 * tof-marketingteam/content/teksten-app-prikkelbehoefte.md (redactietoets 16 nov).
 *
 * `werkstijlMv` is het meervoud met hoofdletter (`naamMv` in archetypes.js).
 */
const prikkelRegel = {
  label: 'Geluid om je heen',
  reuringBijStil: (werkstijlMv) =>
    `Je werkt het best met leven om je heen. Dat is anders dan bij veel ${werkstijlMv}. Kies voor geconcentreerd werk een plek met wat geroezemoes, en spreek af wanneer je niet aangesproken wilt worden.`,
  stilBijLeven: (werkstijlMv) =>
    `Je werkt het best in stilte. Dat is anders dan bij veel ${werkstijlMv}. Zoek voor geconcentreerd werk een stille plek op, en zet overleg en bijpraten op vaste momenten in je week.`,
};

export default prikkelRegel;
