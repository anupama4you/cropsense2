import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './home/HomePage';
import History from './home/history';

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="history" element={<History />} />
      </Routes>
    </div>
  );
}