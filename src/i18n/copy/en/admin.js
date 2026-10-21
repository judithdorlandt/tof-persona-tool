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
     * The delivery email (marketing repo, content/klantreis-teamcode.md §3c).
     * The app fills in code, team link, team name and the manager's email;
     * Judith fills in the purchase order number and session before sending.
     */
    mailBody: ({ recipient, code, appStoreUrl, googlePlayUrl, team, managerEmail }) => `Dear ${recipient},

Here is the team code for ${team}. Your team can start today.

Team code: ${code}


FOR YOUR TEAM

Everyone takes the test in the TOF Persona app, on their own phone and
without an account:

App Store (iPhone): ${appStoreUrl}
Google Play (Android): ${googlePlayUrl}

1. Download the app and take the test: nine questions, about five minutes.
   After that there's an optional deeper section of three minutes.
2. On your profile, tap "Add my profile".
3. Enter the team code: ${code}

Pass these steps and the team code on to your team. Entering a first name is
optional: without one, people still count in the team picture.

You can view the team picture at team.persona-tool.nl/team, with the team
code.


FOR YOU AS TEAM LEAD

You have your own login for Team dynamics: what this mix of people asks of
leadership. It isn't part of the team code, so the code can go round the
team without that part going with it.

1. Go to team.persona-tool.nl/login
2. Enter ${managerEmail || '[team lead email]'}
3. You'll receive a login link by email

Take the test in the app yourself as well and add your profile. Then you count
in the picture too.


WHEN YOU'LL SEE SOMETHING

The team picture and Team dynamics appear once five profiles are complete.
Below that the screen stays empty: in a smaller group it's too easy to trace
who answered what. That applies to you as team lead as well.


THE INVOICE

You'll receive the invoice separately by email[, with purchase order number
…].

[With a guided session: "You indicated you'd like a guided session. I'll be
in touch to agree a date; I'll invoice that session separately."]
[With "not sure yet": "Would you like to read the team picture together with
your team, in a guided session? Just reply to this email."]

Any questions? Just reply to this email.

Kind regards,
Judith Dorlandt
The Office Factory
+31 6 8389 4556`,
  },

  inviteTester: {
    eyebrow: 'Invite an individual tester',
    lead: 'No team, no code — just a personal sign-in. After clicking the link in the email, they go straight into the questionnaire and see their own persona afterwards.',
    nameLabel: 'First name (optional)',
    namePlaceholder: 'E.g. Maarten',
    emailLabel: 'Email',
    emailPlaceholder: 'name@organisation.com',
    send: 'Send sign-in email',
    sending: 'Working…',
    cooldown: (seconds) => `Try again in ${seconds}s`,
    hint: "Can't get it sent? Email the text below yourself.",
    sent: (email) => `Sign-in email sent to ${email}. The link is valid for one hour.`,
    errors: {
      invalidEmail: 'Enter a valid email address.',
      sendFailed: 'Sending failed. Use the email text below instead.',
    },
    toggleMail: 'Send the email text and link yourself ↓',
    copyMail: 'Copy email text',
    copied: '✓ Copied',
    copyLink: 'Copy the link only',
    /** Fallbacks while the name or email field is still empty. */
    mailFallbackName: 'there',
    mailFallbackEmail: 'your own address',
    mailBody: ({ recipient, email, loginUrl }) => `Dear ${recipient},

I'd love you to experience our persona tool for yourself. It takes about five minutes.

HOW IT WORKS
1. Open this link: ${loginUrl}
2. Enter your email address (${email}) — a sign-in link lands in your inbox right away
3. Click that link and you're straight into the questionnaire
4. After nine questions you'll see your own persona

No password needed. Your answers stay yours.

Curious what this reveals for a whole team? Call or email me any time.

Warm regards,
Judith
The Office Factory
+31 6 8389 4556 · judith@tof.services`,
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
    loadingResponses: 'Loading responses…',
    closeTile: 'Close ✕',
    teamsHeading: (n) => `Teams in this organisation (${n})`,
    viewTeam: 'View team →',
    viewTeamBusy: '…',
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
