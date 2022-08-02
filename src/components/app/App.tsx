import React from 'react';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import { SearchPage } from '@components/search-page/SearchPage';
import './App.css';
import { SubmissionsPage } from '@components/submissions-page/SubmissionsPage';
import { TasksPage } from '@components/tasks-page/TasksPage';
import { TaskDetails } from '@components/task-details/TaskDetails';

const tabs = [
  {
    name: 'Tasks',
    path: '/'
  },
  {
    name: 'Submissions',
    path: '/submissions'
  }
];

export const App: React.FC<{}> = () => {
  return (
    <>
      <header className="App-header">
          <Link to={'/'} className={'header-title'}>UMass BETTER</Link>
          <div className='header-tabs-section'>
            {tabs.map((tab, i) => <React.Fragment key={i}>
              <NavLink to={tab.path} className={({ isActive }) => (isActive ? 'header-tab-active ' : '') + 'header-tab'}>{tab.name}</NavLink>
            </React.Fragment>)}
          </div>
      </header>
      <div className='body'>
        <Routes>
          <Route path="/submissions/:submissionId" element={<SearchPage />} />
          <Route path="/" element={<TasksPage />} />
          <Route path="/tasks/:taskNum" element={<TaskDetails />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
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
