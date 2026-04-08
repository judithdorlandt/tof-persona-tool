import React, { useState } from 'react';
import './index.css';

import Nav from './components/Nav.jsx';
import Home from './components/Home.jsx';
import Intro from './components/Intro.jsx';
import Library from './components/Library.jsx';
import Quiz from './components/Quiz.jsx';
import Team from './components/Team.jsx';
import Results from './components/Results.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [resultData, setResultData] = useState(null);

  const navigate = (target) => {
    setPage(target);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home setPage={navigate} />;

      case 'intro':
        return <Intro setPage={navigate} />;

      case 'library':
        return <Library />;

      case 'team':
        return <Team setPage={navigate} />;

      case 'quiz':
        return (
          <Quiz
            setPage={navigate}
            setResultData={setResultData}
          />
        );

      case 'results':
        return resultData ? (
          <Results resultData={resultData} />
        ) : (
          <Home setPage={navigate} />
        );

      default:
        return <Home setPage={navigate} />;
    }
  };

  return (
    <>
      <Nav
        page={page}
        setPage={navigate}
        hasResult={Boolean(resultData)}
      />
      <main>{renderPage()}</main>
    </>
  );
}