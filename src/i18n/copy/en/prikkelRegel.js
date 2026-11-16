/**
 * prikkelRegel — one line in your own profile, below the three Bricks, when
 * your answer to the working-environment question goes against your working
 * style (see src/lib/prikkel.js). Text verbatim from
 * tof-marketingteam/content/teksten-app-prikkelbehoefte.md (edit of 16 Nov).
 */
const prikkelRegel = {
  label: 'The sound around you',
  reuringBijStil: (werkstijlMv) =>
    `You work best with plenty going on around you. That sets you apart from many ${werkstijlMv}. For focused work, pick a spot with a low murmur of voices, and agree when you do not want to be interrupted.`,
  stilBijLeven: (werkstijlMv) =>
    `You work best in silence. That sets you apart from many ${werkstijlMv}. For focused work, find a quiet spot, and schedule meetings and catch-ups at set times in your week.`,
};

export default prikkelRegel;
