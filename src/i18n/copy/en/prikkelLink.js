/**
 * prikkelLink — the stand-alone link for existing teams
 * (/en/working-environment?code=…): one page with only the working-environment
 * question, no name field, no code to type. See src/components/PrikkelLink.jsx.
 *
 * Character for character from
 * tof-marketingteam/content/teksten-app-prikkelbehoefte.md, §5 and
 * "Aanvulling 17 nov". The question and answers come from
 * quizData.werkomgeving.
 */
const prikkelLink = {
  eyebrow: 'One question for your team',
  title: 'How much sound do you need to work well?',
  intro:
    'Your team already uses TOF Persona. One question has been added, so the team picture can also show how much quiet or buzz you need. Your profile stays as it is.',
  alGehad: 'If you already answered this question when you filled in your profile, there is nothing more to do.',
  privacy:
    'Your answer is stored without your name or your working style, even if your team uses the names option. Your team only sees one signal for the team as a whole, and only once there are five answers.',
  submit: 'Send',
  submitting: 'Sending…',
  done: {
    eyebrow: 'Done',
    title: 'Thank you, your answer is in.',
    body: 'It counts towards the team picture once there are at least five answers. Even then, your team only sees one signal for the team as a whole. You can close this window.',
  },
  // On a second visit in the same browser, instead of the question.
  alBinnen: 'Your answer for this team is already in. There is nothing more to do.',
  ongeldig:
    'This link does not work: the team code is wrong or no longer in use. Ask whoever sent it to you for the right link.',
};

export default prikkelLink;
