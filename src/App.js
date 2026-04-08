import React, { useState } from 'react';
import './index.css';

import Nav from './components/nav.jsx';
import Home from './components/Home.jsx';
import Library from './components/Library.jsx';
import Quiz from './components/Quiz.jsx';
import Team from './components/Team.jsx';
import Results from './components/Results.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [resultData, setResultData] = useState(null);

  function navigate(target) {
    setPage(target);
  }

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home setPage={navigate} />;

      case 'library':
        return resultData ? <Library /> : <Home setPage={navigate} />;

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
        return <Results resultData={resultData} />;

      default:
        return <Home setPage={navigate} />;
    }
  };

  return (
    <>
      <Nav
        page={page}
        setPage={navigate}
        hasResult={!!resultData}
      />
      <main>{renderPage()}</main>
    </>
  );
}