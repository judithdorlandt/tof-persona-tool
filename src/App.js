import React, { useState } from 'react';
import './index.css';

import Nav from './components/Nav';
import Home from './components/Home';
import Library from './components/Library';
import Quiz from './components/Quiz';
import Team from './components/Team';
import Results from './components/Results';

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