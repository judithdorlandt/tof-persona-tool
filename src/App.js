import React, { useEffect, useState } from 'react';
import './index.css';

import Landing from './components/Landing.jsx';
import Nav from './components/Nav.jsx';
import Home from './components/Home.jsx';
import Intro from './components/Intro.jsx';
import Library from './components/Library.jsx';
import Quiz from './components/Quiz.jsx';
import Team from './components/Team.jsx';
import TeamIntro from './components/TeamIntro.jsx';
import Results from './components/Results.jsx';
import TeamSelector from './components/TeamSelector.jsx';
import Login from './components/Login.jsx';
import ManagerTeams from './components/ManagerTeams.jsx';

import {
  getCurrentSession,
  onAuthChange,
  signOut,
} from './supabase';

export default function App() {
  const [page, setPage] = useState('landing');
  const [resultData, setResultData] = useState(null);
  const [teamResponses, setTeamResponses] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Check bestaande sessie bij app-start
  useEffect(() => {
    let active = true;

    const init = async () => {
      const session = await getCurrentSession();
      if (active && session?.user) {
        setCurrentUser(session.user);
      }
    };

    init();

    // Luister naar login/logout events (ook uit andere tabs)
    const unsubscribe = onAuthChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (session?.user) {
        setCurrentUser(session.user);
      }
    });

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  function navigate(target) {
    setPage(target);
  }

  async function handleLogout() {
    await signOut();
    setCurrentUser(null);
    setTeamResponses([]);
    setSelectedTeam(null);
    setPage('home');
  }

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
          <Team
            setPage={navigate}
            teamResponses={teamResponses}
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
        return (
          <Login
            setPage={navigate}
            setCurrentUser={setCurrentUser}
          />
        );

      case 'managerteams':
        return (
          <ManagerTeams
            setPage={navigate}
            setTeamResponses={setTeamResponses}
            setSelectedTeam={setSelectedTeam}
          />
        );

      default:
        return <Landing setPage={navigate} />;
    }
  };

  return (
    <>
      {page !== 'landing' && (
        <Nav
          page={page}
          setPage={navigate}
          hasResult={!!resultData}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      <main>{renderPage()}</main>
    </>
  );
}