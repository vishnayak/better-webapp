import React from 'react';
import './App.css';
import { Result, SearchResults } from '@components/search-results/SearchResults';

import hits from '@assets/HITL.IR-T1-r1.REQUESTHITS.events.json';

function App() {
  return (
    <>
      <header className="App-header">
          <p>
            Search Results
          </p>
      </header>
      <div className="App">
        <SearchResults results={hits.slice(0, 100) as Result[]} />
      </div>
    </>
  );
}

export default App;
