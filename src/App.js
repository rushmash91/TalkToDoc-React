import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PdfUpload from './components/PdfUpload';
import PdfViewer from './components/PdfViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<PdfUpload />} />
        <Route path="/view" element={<PdfViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
