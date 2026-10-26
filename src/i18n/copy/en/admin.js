/**
 * admin — English copy for the internal TOF admin screen (src/components/Admin.jsx).
 * Mirrors the key structure of copy/nl/admin.js.
 *
 * Database values stay untranslated: observation categories (`leegloper`,
 * `werkt_goed`), module levels (`insight`, `dynamics`), team codes and the
 * organisation and team names that come from Supabase.
 */

/** "1 team" / "3 teams" — singular and plural in one place. */
const counts = {
  teams: (n) => `${n} ${n === 1 ? 'team' : 'teams'}`,
  responses: (n) => `${n} ${n === 1 ? 'response' : 'responses'}`,
  managers: (n) => `${n} ${n === 1 ? 'manager' : 'managers'}`,
};

const admin = {
  counts,

  gate: {
    checking: 'Checking your access…',
  },

  noAccess: {
    eyebrow: 'No access',
    title: 'This page is for TOF admins only.',
    body: 'You are signed in, but this account does not have admin rights.',
    backHome: 'Back to home',
  },

  login: {
    eyebrow: 'TOF Admin',
    title: 'Sign in.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@tof.services',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    submit: 'Sign in →',
    submitting: 'Signing you in…',
    failed: 'Sign-in failed.',
  },

  hero: {
    eyebrow: 'TOF — Admin',
    titleLead: 'A new client at ',
    titleAccent: 'a glance',
    lead: 'Create a team access code, get a ready-to-send welcome email, and keep your client list clear.',
  },

  createTeam: {
    eyebrow: 'Add a new client',
    organizationLabel: 'Organisation',
    organizationPlaceholder: 'E.g. Sample Council',
    teamLabel: 'Team / Department',
    teamPlaceholder: 'E.g. Corporate Affairs',
    leaderNameLabel: 'Team leader first name (optional)',
    leaderNamePlaceholder: 'E.g. Sam',
    leaderEmailLabel: 'Team leader email (optional)',
    leaderEmailPlaceholder: 'name@organisation.com',
    leaderEmailHint:
      'This address is linked to the team as team leader straight away. After logging in, this person sees Team Insight and Team Dynamics. The team code itself gives everyone Team Insight.',
    submit: 'Create team',
    submitting: 'Creating…',
    hint: 'The code is generated automatically.',
    errors: {
      required: 'Organisation and team name are required.',
      invalidEmail: 'This email address is not valid.',
      leaderLinkFailed: (msg) =>
        `The team was created, but the team leader could not be linked${msg ? ` (${msg})` : ''}. Add them under Managers.`,
      failed: 'Could not create the team.',
      unknown: 'Unknown error.',
    },
  },

  justCreated: {
    eyebrow: 'Team created',
    leaderLinked: (email) => `Team leader linked: ${email}`,
    noLeader: 'No team leader linked yet — add one under Managers.',
    dismiss: 'Close',
    codeLabel: 'Code',
    copyCode: 'Copy code',
    toggleMail: 'Show the ready-to-send welcome email ↓',
    copyMail: 'Copy email text',
    copied: '✓ Copied',
    /** Placeholder shown when no team leader email was entered. */
    fallbackRecipient: '[first name]',
    /**
     * The delivery email (marketing repo, content/klantreis-teamcode.md § 3(c),
     * version of 22 Oct 2026). The team gets the link and the code: the link
     * opens the store screen, the team member enters the code after the test
     * via "Add my profile" — it does not travel into the app by itself. The
     * app fills in code, team name and the manager's email; Judith fills in or
     * deletes the date, first-name line, purchase order number and session
     * before sending. Touchpoint 4 is deliberately left out (until tasks A, D, F).
     */
    mailBody: ({ recipient, code, team, managerEmail }) => `Dear ${recipient},

Everything is ready for ${team}. Your team can start today.

First, one thing: send your team the message between the two lines below. Copy it in one go and paste it into an email or chat message. It contains both the link and the team code, and your team needs both: the link to get started, the code to add their profile after the test. The message is written in your voice; change whatever doesn't sound like you, and fill in a date at [date] or delete that line.


———— MESSAGE FOR YOUR TEAM ————

Hi all,

I'd like us to look at which working styles we have in this team and what we need from our workplace. To do that, each of us takes a short test in the TOF Persona app. Once enough of us have done it, we'll get a picture of the team. Here's how to take part:

1. Open this link on your phone and download the TOF Persona app:
https://team.persona-tool.nl/en/quiz?code=${encodeURIComponent(code)}

2. Take the test in the app: nine questions, about five minutes. An optional deep dive of about three minutes follows.

3. Tap "Add my profile" at the bottom of your profile. The website opens. Enter this team code there, tap "Check code" and then "Add my profile" again:
${code}

[You can leave the first name field empty.]

Your profile only counts once you've tapped "Add my profile" on the website. Keep this message until then: you only need the team code after the test.

Once five colleagues have added their profile, the team picture is ready. You can open it at team.persona-tool.nl/en/team, with the same team code.

Please do this by [date], so we can talk the picture through together.

Nobody sees who has which working style, not even a manager.

———— END OF MESSAGE ————


TAKE PART YOURSELF

Follow the same three steps and you'll count in the team picture too.


WHEN YOU'LL SEE SOMETHING

Once five profiles have been added. Until then there's no team picture, not even for you: in a smaller group it's too easy to work out who answered what.


HOW TO LOG IN

1. Go to team.persona-tool.nl/en/login
2. Enter ${managerEmail || '[manager email]'}
3. Open the login link in the email you receive. It is valid for one hour, and you'll be logged in on the device where you open it.

Once you're logged in, you don't need the team code: you go straight to your team. Until there are five, you'll see how many profiles have been added so far.


WHAT YOU SEE AND YOUR TEAM DOESN'T

Your team sees Team Insight: which working styles are in the team and what it needs from the workplace. You see that too, plus Team Dynamics: what this mix of people asks of the person leading it. You'll find it at the bottom of Team Insight.

Team Dynamics is tied to your login, not to the code. That's why you can share the code with your whole team.


TELLING A COLLEAGUE?

If you'd like to show a fellow manager how this works, show them the example team: www.persona-tool.nl/demo. My advice: keep your own team's picture inside the team. Even without names, anyone who knows your team can still pick people out. Knowing it stays inside is what lets your team answer honestly. What you can pass on is how the conversation with your team went.


THE INVOICE

You'll receive the invoice separately by email[, with purchase order number …].

[With a guided session: "You indicated you'd like a guided session. I'll be in touch to agree a date; I'll invoice that session separately."]
[With "not sure yet": "Would you like to read the team picture together with your team, in a guided session? Just reply to this email."]

Any questions? Just reply to this email.

Kind regards,
Judith Dorlandt
The Office Factory
+31 6 8389 4556`,
  },


  organizations: {
    heading: (n) => `Organisations (${n})`,
    empty: 'No organisations with teams yet.',
    view: 'View →',
  },

  detail: {
    back: '← Back to Admin',
    eyebrow: 'TOF — ADMIN · ORGANISATION',
    title: 'Organisation insight for',
    lead: (teamCount, responseCount) =>
      `Aggregated across ${counts.teams(teamCount)} and ${counts.responses(responseCount)}.`,
    downloadPdf: 'Download as PDF',
    noSignalsNote: "You haven't added any signals from observation and conversation yet. Without them, that page is left out.",
    loadingResponses: 'Loading responses…',
    closeTile: 'Close ✕',
    teamsHeading: (n) => `Teams in this organisation (${n})`,
    ambiguous: {
      heading: (n) => (n === 1
        ? '1 completed profile fits two teams'
        : `${n} completed profiles fit more than one team`),
      line: ({ name, code, teamName, chosen, others }) =>
        `${name} (code ${code}, team name "${teamName}") now counts for ${chosen}; also fitted ${others}.`,
      anonymous: 'No name',
    },
    viewTeam: 'View team →',
    viewTeamBusy: '…',
    /** Names switch per team (show_names). Only on once the team has agreed. */
    names: {
      off: 'Names: off · turn on',
      on: 'Names: on, showing · turn off',
      onHidden: 'Names: on, not showing · turn off',
      hiddenWhy: (without, total) =>
        `Without a name: ${without} of ${total} profiles. Names show once everyone has one, or once at least five people don't.`,
      hiddenTooFew: 'Names show once five profiles have been added.',
      confirmOn: (team) =>
        `Has ${team} agreed together to show names in the team picture?\n\nEveryone in the team and the manager can then see first names in Team Insight, including names already entered. They only show when no one without a name can be identified: everyone has a name, or at least five people don't.`,
      failed: (msg) => `Couldn't save.${msg ? ` ${msg}` : ''}`,
    },
    empty: '—',
  },

  moduleToggle: {
    ariaLabel: 'View',
    options: {
      insight: 'Team Insight',
      dynamics: 'Team Dynamics',
    },
  },

  observations: {
    eyebrow: 'Your own observations — added per organisation',
    lead: 'Alongside the data-driven insights from the persona responses, you can add your own observations here. They appear in the organisation PDF.',
    // Keys are database values of the `category` column — do not translate.
    categories: {
      leegloper: {
        label: 'Where the organisation loses energy',
        helper: 'E.g. acoustics, no-shows, agreements not being kept.',
        placeholder: 'acoustics on the work floor',
      },
      werkt_goed: {
        label: 'What works well in the organisation',
        helper: 'E.g. an open feedback culture, quick decision-making.',
        placeholder: 'open feedback culture between teams',
      },
    },
    add: 'Add',
    removeTitle: 'Remove',
    errors: {
      addFailed: 'Could not add that.',
      removeFailed: 'Could not remove that.',
    },
  },

  managers: {
    eyebrow: 'Managers — direct team access by email',
    lead: 'Link a manager email to a team code. From their first magic-link sign-in they see their team or teams in their access overview automatically — no code to type in.',
    emailLabel: 'Manager email',
    emailPlaceholder: 'name@organisation.com',
    codeLabel: 'Team code',
    codePlaceholder: '— choose a team —',
    teamWithoutName: '(no name)',
    submit: 'Link',
    submitting: 'Working…',
    linkedHeading: (n) => `Linked (${n})`,
    empty: 'No managers linked yet. (Or the SQL migration has not been run.)',
    errors: {
      required: 'Email and team code are required.',
      invalidEmail: 'Enter a valid email address.',
      linkFailed: 'Could not link that manager.',
      removeFailed: 'Could not remove that.',
      unknown: 'Unknown error.',
    },
    row: {
      noTeam: '—',
      sendLink: 'Send magic link',
      sending: 'Working…',
      resend: 'Send again',
      sent: 'Magic link sent.',
      sendFailed: 'Sending failed.',
      remove: 'Remove',
    },
  },

  director: {
    eyebrow: 'Director',
    title: 'Coming soon',
    bodyBefore: 'Here you will soon be able to link a director or board member to',
    bodyAfter: '. At organisation level they get the same insights a manager gets within a single team.',
  },
};

export default admin;
