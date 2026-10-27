import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

import { useAuth } from './auth/AuthContext';
import { IS_NATIVE, isPageAllowed } from './config/platform';
import { useCopy, useLang } from './i18n/LanguageContext';
import { pagePath, resolvePath } from './i18n/routes';
import { signOut, getMyManagedTeams, getResponsesByTeam } from './supabase';
import {
  rememberManagedTeams,
  forgetManagedTeams,
  rememberCurrentTeam,
  forgetCurrentTeam,
  getCurrentTeam,
  findTeamAccess,
  hasTeamLevel,
  LEVEL_INSIGHT,
} from './utils/access';
import { PageShell } from './ui/AppShell';

import Bijdragen from './components/Bijdragen.jsx';
import Landing from './components/Landing.jsx';
import Nav from './components/Nav.jsx';
import Home from './components/Home.jsx';
import Intro from './components/Intro.jsx';
import Library from './components/Library.jsx';
import TeamIntro from './components/TeamIntro.jsx';
import TeamDashboard from './components/TeamDashboard.jsx';
import TeamDynamics from './components/TeamDynamics.jsx';
import TeamStrategic from './components/TeamStrategic.jsx';
import Results from './components/Results.jsx';
import TeamSelector from './components/TeamSelector.jsx';
import Login from './components/Login.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import AuthConfirm from './components/AuthConfirm.jsx';
import Admin from './components/Admin.jsx';
import StrategischKompas from './components/StrategischKompas.jsx';
import StrategischKompasIntake from './components/StrategischKompasIntake.jsx';
import StrategischKompasReview from './components/StrategischKompasReview.jsx';
import AppStart from './native/AppStart.jsx';
import History from './native/History.jsx';
import ConversationPrep from './native/ConversationPrep.jsx';
import Privacy from './native/Privacy.jsx';
import TabBar from './native/TabBar.jsx';
import { getCurrentEntry, subscribe } from './native/localStore';

import WerkplekProfiel from './team/werkplek/WerkplekProfiel.jsx';
import { QUIZTEST_ENABLED } from './experimental/featureFlag';

// EXPERIMENTEEL — verkorte testvariant van de vragenlijst, achter een flag.
import QuizTest from './experimental/quizTest/QuizTest.jsx';
import QuizInApp from './components/QuizInApp.jsx';

// Pagina's die een gekozen team nodig hebben.
const TEAM_PAGES = ['teamdashboard', 'teamdynamics', 'teamstrategic', 'teamwerkplekprofiel'];

function sameTeam(a, b) {
  const norm = (v) => String(v || '').trim().toLowerCase();
  return norm(a.team) === norm(b.team) && norm(a.organization) === norm(b.organization);
}

/**
 * Welk team terugzetten na verversen: het laatst geopende als je daar nog
 * toegang toe hebt, anders je eigen team als leidinggevende. 'choose' =
 * leidinggevende van meer teams zonder bewaard team; null = niets te vinden.
 */
function teamToRestore(managedTeams = []) {
  const stored = getCurrentTeam();
  if (stored && hasTeamLevel(stored.team, stored.organization, LEVEL_INSIGHT)) {
    const access = findTeamAccess(stored.team, stored.organization);
    const managed = managedTeams.find((m) => sameTeam(m, stored));
    return {
      team: stored.team,
      organization: stored.organization,
      code: access?.code || managed?.code || null,
    };
  }
  if (managedTeams.length === 1) {
    const { team, organization, code } = managedTeams[0];
    return { team, organization, code };
  }
  if (managedTeams.length > 1) return 'choose';
  return null;
}

export default function App() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const { common } = useCopy();

  // Page-key + taal komen uit de URL (zie src/i18n/routes.js), zodat
  // deep-links en browser-back/forward in beide talen blijven werken.
  const { page } = resolvePath(location.pathname);

  const [resultData, setResultData] = useState(null);

  // App-modus: het profiel staat op het toestel en blijft dus staan tussen
  // sessies. Bij elke route-wissel opnieuw lezen, zodat een net afgeronde
  // test en een keuze uit de historie meteen zichtbaar zijn.
  const [nativeEntry, setNativeEntry] = useState(() =>
    IS_NATIVE ? getCurrentEntry() : null
  );
  useEffect(() => {
    if (IS_NATIVE) setNativeEntry(getCurrentEntry());
  }, [location.pathname]);

  // En ook zodra er iets op het toestel verandert zonder dat je van scherm
  // wisselt — vastprikken op het profielscherm laat de teller in de tabbalk
  // meteen meelopen.
  useEffect(() => {
    if (!IS_NATIVE) return undefined;
    return subscribe(() => setNativeEntry(getCurrentEntry()));
  }, []);

  const [teamResponses, setTeamResponsesState] = useState([]);
  // null van getResponsesByTeam = ophalen lukte niet. Het wachtscherm toont
  // dan geen "0 van de 5" (E1.7, 27 okt 2026).
  const [teamLoadFailed, setTeamLoadFailed] = useState(false);
  const setTeamResponses = useCallback((responses) => {
    setTeamLoadFailed(responses === null);
    setTeamResponsesState(Array.isArray(responses) ? responses : []);
  }, []);
  const [selectedTeam, setSelectedTeamState] = useState(null);

  // Elk gekozen team wordt onthouden, zodat verversen of een bladwijzer je
  // terugbrengt (zie rememberCurrentTeam). Een selectie van meerdere teams
  // uit de TeamSelector is geen team om naar terug te keren.
  const setSelectedTeam = useCallback((sel) => {
    setSelectedTeamState(sel);
    const names = sel?.team_names;
    if (sel?.team && (!Array.isArray(names) || names.length === 1)) {
      rememberCurrentTeam(sel);
    } else {
      forgetCurrentTeam();
    }
  }, []);

  // Manager-vlag: is de ingelogde user een team-manager (rij in
  // team_managers)? Wordt eenmalig opgehaald per sessie en gebruikt
  // door Nav om irrelevante items (Home/Intro/Quiz/Resultaat) te
  // verbergen. Dezelfde lijst bepaalt wie Teamdynamiek mag zien, daarom
  // gaat hij ook naar utils/access (die wordt synchroon bevraagd).
  //
  // Pas beslissen als de sessie geladen is: bij het verversen is `user`
  // eerst even null, en dan zou de lijst gewist worden net voordat hij
  // nodig is. managedTeams is null zolang de rol nog niet bekend is.
  const [isManager, setIsManager] = useState(false);
  const [managedTeams, setManagedTeams] = useState(null);
  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;
    if (!user) {
      setIsManager(false);
      setManagedTeams([]);
      forgetManagedTeams();
      return undefined;
    }
    setManagedTeams(null);
    (async () => {
      try {
        const managed = await getMyManagedTeams();
        if (cancelled) return;
        setIsManager(managed.length > 0);
        rememberManagedTeams(managed);
        setManagedTeams(managed);
      } catch (_e) {
        if (!cancelled) {
          setIsManager(false);
          setManagedTeams([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const handleLogout = useCallback(async () => {
    await signOut();
    forgetCurrentTeam();
    // Naar /login (i.p.v. landing) zodat je direct met een ander
    // account kunt inloggen — handig voor managers die wisselen
    // tussen team-accounts, of voor admins die als manager willen
    // testen.
    routerNavigate(pagePath('login', lang));
  }, [routerNavigate, lang]);

  // Drop-in compatible setPage(target) — vervangt useState-versie
  // door router-navigatie. Bestaande componenten hoeven niets te weten:
  // de taal van de huidige URL blijft automatisch behouden.
  const navigate = useCallback(
    (target) => {
      routerNavigate(pagePath(target, lang));
    },
    [routerNavigate, lang]
  );

  // ── Team terugvinden na verversen of via een bladwijzer ──
  // Op een teampagina zonder gekozen team zoeken we het team op dat je het
  // laatst opende, mits je er nog toegang toe hebt. Anders: een ingelogde
  // leidinggevende met één team gaat naar dat team; verder naar /team. Eén
  // poging per bezoek.
  const needsTeam = !IS_NATIVE && TEAM_PAGES.includes(page) && !selectedTeam;
  const [teamRestoreTried, setTeamRestoreTried] = useState(false);
  const restoringTeam = needsTeam && !teamRestoreTried;

  useEffect(() => {
    if (!restoringTeam) return undefined;
    if (authLoading || managedTeams === null) return undefined; // rol nog onbekend
    let cancelled = false;
    (async () => {
      const target = teamToRestore(managedTeams);
      // Niets terug te vinden, of meer teams om uit te kiezen: naar /team,
      // waar je met je code of als leidinggevende verder kunt (opdracht C2).
      // Anders stond hier het wachtscherm met "0 van de vijf", en dat leest
      // als: je team is leeg.
      if (!target || target === 'choose') {
        setTeamRestoreTried(true);
        navigate('team');
        return;
      }
      let responses = null;
      try {
        responses = await getResponsesByTeam(target.team, target.organization, target.code);
      } catch (_e) {
        responses = null;
      }
      if (cancelled) return;
      setTeamResponses(responses);
      setSelectedTeam(target);
      setTeamRestoreTried(true);
    })();
    return () => { cancelled = true; };
  }, [restoringTeam, authLoading, managedTeams, navigate, setSelectedTeam, setTeamResponses]);

  // Scroll naar boven bij route-wissel — premium gevoel,
  // anders blijft de scrollpositie op de vorige pagina hangen.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Waar je op opent verschilt per platform: het web begint bij de uitleg,
  // de app bij je eigen profiel.
  const startScherm = IS_NATIVE
    ? <AppStart setPage={navigate} />
    : <Home setPage={navigate} />;

  const renderPage = () => {
    // App-modus: alleen stap 1. De cases hieronder blijven staan voor het
    // web; in de app zijn ze onbereikbaar en val je terug op de start.
    if (!isPageAllowed(page)) return startScherm;

    // Nog bezig het team terug te vinden: niet even "0 van de vijf" tonen.
    if (restoringTeam) {
      return (
        <PageShell>
          <p style={{ color: 'var(--tof-text-soft)', fontSize: 15, margin: 0 }}>
            {common.loading}
          </p>
        </PageShell>
      );
    }

    switch (page) {
      case 'landing':
        return <Landing setPage={navigate} />;

      case 'home':
        return startScherm;

      case 'intro':
        // De uitleg hoort bij de test, en die zit op het web niet meer: oude
        // links landen op het storescherm. In de app blijft hij gewoon staan.
        return IS_NATIVE
          ? <Intro setPage={navigate} />
          : <QuizInApp setPage={navigate} />;

      case 'library':
        return <Library />;

      case 'quiz': {
        // De verkorte quiz (voorheen "QuizTest") is nu de echte vragenlijst.
        // Hij slaat zelf op in Supabase en toont het profiel intern, dus
        // setResultData is hier niet meer nodig.
        //
        // Op het web bestaat de vragenlijst niet meer (besluit Judith, 21 okt
        // 2026): ook wie via een uitnodigingslink komt (?org=…&code=…), gaat
        // naar de app. Het storescherm toont dan de teamcode van die link,
        // zodat die na de test bij "Profiel inbrengen" klaarligt.
        return IS_NATIVE
          ? <QuizTest setPage={navigate} />
          : <QuizInApp setPage={navigate} />;
      }

      case 'results': {
        // Op het web komt het resultaat uit de sessie; in de app uit de
        // lokale opslag — daar hoort ook het aantekeningenblok bij.
        const shown = resultData || nativeEntry?.result;
        if (!shown) return startScherm;
        return (
          <Results
            resultData={shown}
            setPage={navigate}
            noteEntry={resultData ? null : nativeEntry}
          />
        );
      }

      // Het profiel uit de app bij een team leggen. Alleen op het web, want de
      // app stuurt zelf niets; zie components/Bijdragen.jsx.
      case 'bijdragen':
        return (
          <Bijdragen
            setPage={navigate}
            setSelectedTeam={setSelectedTeam}
            setTeamResponses={setTeamResponses}
          />
        );

      case 'historie':
        return <History setPage={navigate} />;

      case 'gesprek':
        return <ConversationPrep setPage={navigate} />;

      case 'privacy':
        return <Privacy setPage={navigate} />;

      case 'team':
        return (
          <TeamIntro
            setPage={navigate}
            setTeamResponses={setTeamResponses}
            setSelectedTeam={setSelectedTeam}
          />
        );

      case 'teamdashboard':
        return (
          <TeamDashboard
            setPage={navigate}
            teamResponses={teamResponses}
            loadFailed={teamLoadFailed}
            selectedTeam={selectedTeam}
          />
        );

      case 'teamdynamics':
        return (
          <TeamDynamics
            setPage={navigate}
            teamResponses={teamResponses}
            loadFailed={teamLoadFailed}
            selectedTeam={selectedTeam}
          />
        );

      case 'teamstrategic':
        return (
          <TeamStrategic
            setPage={navigate}
            selectedTeam={selectedTeam}
          />
        );

      case 'teamselector':
        // Beheerder-tool: leest álle teams. Alleen voor ingelogde gebruikers
        // (authenticated → policy #1), zodat anon niet alle responses kan
        // opvragen. Niet-ingelogd → naar login.
        return user ? (
          <TeamSelector
            setPage={navigate}
            setResultData={setResultData}
            setTeamResponses={setTeamResponses}
            setSelectedTeam={setSelectedTeam}
          />
        ) : (
          <Login setPage={navigate} />
        );

      case 'login':
        return <Login setPage={navigate} />;

      case 'testerlogin':
        return <Login setPage={navigate} testerInvite />;

      case 'authcallback':
        return (
          <AuthCallback
            setPage={navigate}
            setSelectedTeam={setSelectedTeam}
            setTeamResponses={setTeamResponses}
          />
        );

      case 'authconfirm':
        return <AuthConfirm setPage={navigate} />;

      case 'admin':
        return (
          <Admin
            setPage={navigate}
            setSelectedTeam={setSelectedTeam}
            setTeamResponses={setTeamResponses}
          />
        );

      case 'strategischkompas':
        return <StrategischKompas setPage={navigate} />;

      case 'strategischkompasintake':
        return <StrategischKompasIntake setPage={navigate} />;

      case 'strategischkompasreview':
        return <StrategischKompasReview setPage={navigate} />;

      case 'quiztest':
        // Uit: een oude link landt op het storescherm, niet op de voorpagina —
        // wie hier komt wilde de test doen.
        return QUIZTEST_ENABLED ? (
          <QuizTest setPage={navigate} />
        ) : (
          <QuizInApp setPage={navigate} />
        );

      case 'teamwerkplekprofiel':
        return (
          <WerkplekProfiel
            setPage={navigate}
            teamResponses={teamResponses}
            selectedTeam={selectedTeam}
          />
        );

      default:
        return <Landing setPage={navigate} />;
    }
  };

  // Pagina's waar de Nav NIET getoond moet worden. De landing is in beide
  // werelden een kaal merkscherm; de auth-pagina's bestaan alleen op het web.
  const hideNav = page === 'landing'
    || (!IS_NATIVE && (page === 'login' || page === 'testerlogin' || page === 'authcallback' || page === 'authconfirm'));

  // De balk onderin hoort bij een app die iets van je bewaart: zolang er geen
  // profiel is, is er ook niets om heen te gaan en blijft hij weg.
  const showTabBar = IS_NATIVE && !hideNav && !!nativeEntry;

  return (
    <>
      {!hideNav && (
        <Nav
          page={page}
          setPage={navigate}
          hasResult={!!resultData || !!nativeEntry}
          currentUser={user}
          isManager={isManager}
          onLogout={handleLogout}
        />
      )}
      {/* De vaste balk ligt over de pagina heen, dus houdt de pagina onderaan
          ruimte vrij — anders valt de laatste knop eronder. */}
      <main style={showTabBar ? { paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' } : undefined}>
        {renderPage()}
      </main>
      {showTabBar && (
        <TabBar
          page={page}
          setPage={navigate}
          pinnedCount={nativeEntry.pinned?.length || 0}
        />
      )}
    </>
  );
}
