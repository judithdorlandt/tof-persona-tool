import React, { useState } from 'react';
import Nav from './components/nav';
import Home from './components/home';
import Intro from './components/intro';
import Quiz from './components/quiz';
import Library from './components/library';
import Results from './components/results';

export default function App() {
  const [page, setPage] = useState('home');
  const [resultData, setResultData] = useState(null);

  return (
    <div>
      <Nav page={page} setPage={setPage} />

      {page === 'home' && <Home setPage={setPage} />}
      {page === 'intro' && <Intro setPage={setPage} />}
      {page === 'quiz' && (
        <Quiz setPage={setPage} setResultData={setResultData} />
      )}
      {page === 'library' && <Library />}
      {page === 'results' && <Results resultData={resultData} />}
    </div>
  );
}