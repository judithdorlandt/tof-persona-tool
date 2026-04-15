import React, { useState } from 'react';
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

export default function App() {
  const [page, setPage] = useState('landing');
  const [resultData, setResultData] = useState(null);

  function navigate(target) {
    setPage(target);
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
        return <TeamIntro setPage={navigate} />;

      case 'teamselector':
        return (
          <TeamSelector
            setPage={navigate}
            setResultData={setResultData}
          />
        );

      case 'teamdashboard':
        return <Team resultData={resultData} setPage={navigate} />;

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
        />
      )}
      <main>{renderPage()}</main>
    </>
  );
}