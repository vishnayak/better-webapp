import React from 'react';
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { SearchPage } from '@components/search-page/SearchPage';
import './App.css';
import { SubmissionsPage } from '@components/submissions-page/SubmissionsPage';
import { TasksPage } from '@components/tasks/TasksPage';

export const App: React.FC<{}> = () => {
  return (
    <>
      <header className="App-header">
          <Link to={'/'} className={'header-text'}>UMass BETTER</Link>
      </header>
      <div className='body'>
        <Routes>
          <Route path="/hits/:submissionId" element={<SearchPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/" element={<SubmissionsPage />} />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
