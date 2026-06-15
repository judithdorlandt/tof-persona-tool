import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

import { useAuth } from './auth/AuthContext';
import { signOut, getMyManagedTeams } from './supabase';

import Landing from './components/Landing.jsx';
import Nav from './components/Nav.jsx';
import Home from './components/Home.jsx';
import Intro from './components/Intro.jsx';
import Library from './components/Library.jsx';
import Quiz from './components/Quiz.jsx';
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

// EXPERIMENTEEL — werkplekbehoefteprofiel, achter een feature-flag.
import WerkplekProfiel from './experimental/WerkplekProfiel.jsx';
import { WERKPLEKPROFIEL_ENABLED } from './experimental/featureFlag';

// Map page-keys naar URL-paths zodat we deep-links krijgen
// en browser-back/forward natuurlijk werkt.
const PAGE_TO_PATH = {
  landing: '/',
  home: '/home',
  intro: '/intro',
  library: '/library',
  quiz: '/quiz',
  results: '/results',
  team: '/team',
  teamdashboard: '/team/dashboard',
  teamdynamics: '/team/dynamics',
  teamselector: '/team/selector',
  login: '/login',
  authcallback: '/auth/callback',
  authconfirm: '/auth/confirm',
  admin: '/admin',
  strategischkompas: '/strategisch-kompas',
  // EXPERIMENTEEL — alleen actief als de feature-flag aanstaat.
  ...(WERKPLEKPROFIEL_ENABLED ? { teamwerkplekprofiel: '/team/werkplekprofiel' } : {}),
};

const PATH_TO_PAGE = Object.entries(PAGE_TO_PATH).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});

function pathToPage(pathname) {
  if (PATH_TO_PAGE[pathname]) return PATH_TO_PAGE[pathname];
  // Normaliseer: dubbele slashes inklappen (bv. //auth/confirm door een
  // SiteURL met trailing slash in de Supabase-template) en trailing slash weg.
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  return PATH_TO_PAGE[normalized] || 'landing';
}

export default function App() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const { user } = useAuth();

  const page = pathToPage(location.pathname);

  const [resultData, setResultData] = useState(null);
  const [teamResponses, setTeamResponses] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Manager-vlag: is de ingelogde user een team-manager (rij in
  // team_managers)? Wordt eenmalig opgehaald per sessie en gebruikt
  // door Nav om irrelevante items (Home/Intro/Quiz/Resultaat) te
  // verbergen.
  const [isManager, setIsManager] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!user) { setIsManager(false); return; }
    (async () => {
      try {
        const managed = await getMyManagedTeams();
        if (!cancelled) setIsManager(managed.length > 0);
      } catch (_e) {
        if (!cancelled) setIsManager(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleLogout = useCallback(async () => {
    await signOut();
    // Naar /login (i.p.v. landing) zodat je direct met een ander
    // account kunt inloggen — handig voor managers die wisselen
    // tussen team-accounts, of voor admins die als manager willen
    // testen.
    routerNavigate('/login');
  }, [routerNavigate]);

  // Drop-in compatible setPage(target) — vervangt useState-versie
  // door router-navigatie. Bestaande componenten hoeven niets te weten.
  const navigate = useCallback(
    (target) => {
      const path = PAGE_TO_PATH[target] || '/';
      routerNavigate(path);
    },
    [routerNavigate]
  );

  // Scroll naar boven bij route-wissel — premium gevoel,
  // anders blijft de scrollpositie op de vorige pagina hangen.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <Landing setPage={navigate} />;

      case 'home':
        return <Home setPage={navigate} />;

      case 'intro':
        return <Intro setPage={navigate} />;

      case 'library':
        return <Library />;

      case 'quiz':
        return (
          <Quiz
            setPage={navigate}
            setResultData={setResultData}
          />
        );

      case 'results':
        return resultData ? (
          <Results resultData={resultData} setPage={navigate} />
        ) : (
          <Home setPage={navigate} />
        );

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
            selectedTeam={selectedTeam}
          />
        );

      case 'teamdynamics':
        return (
          <TeamDynamics
            setPage={navigate}
            teamResponses={teamResponses}
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
        return (
          <TeamSelector
            setPage={navigate}
            setResultData={setResultData}
            setTeamResponses={setTeamResponses}
            setSelectedTeam={setSelectedTeam}
          />
        );

      case 'login':
        return <Login setPage={navigate} />;

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

      case 'teamwerkplekprofiel':
        return WERKPLEKPROFIEL_ENABLED ? (
          <WerkplekProfiel
            setPage={navigate}
            teamResponses={teamResponses}
            selectedTeam={selectedTeam}
          />
        ) : (
          <Landing setPage={navigate} />
        );

      default:
        return <Landing setPage={navigate} />;
    }
  };

  // Pagina's waar de Nav NIET getoond moet worden — landing en auth-flow.
  const hideNav = page === 'landing' || page === 'login' || page === 'authcallback' || page === 'authconfirm';

  return (
    <>
      {!hideNav && (
        <Nav
          page={page}
          setPage={navigate}
          hasResult={!!resultData}
          currentUser={user}
          isManager={isManager}
          onLogout={handleLogout}
        />
      )}
      <main>{renderPage()}</main>
    </>
  );
}
