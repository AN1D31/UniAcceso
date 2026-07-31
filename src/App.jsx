import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import EarlyAccess from './components/EarlyAccess';
import Explorar from './pages/Explorar';
import UniversityDetailPage from './pages/UniversityDetailPage';
import Contacto from './pages/Contacto';
import Eventos from './pages/Eventos';
import ResourceDetailPage from './pages/ResourceDetailPage';
import Scholarships from './pages/Scholarships';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<EarlyAccess />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/universidades/:universityId" element={<UniversityDetailPage />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/recursos" element={<Eventos />} />
          <Route path="/recursos/:resourceId" element={<ResourceDetailPage />} />
          <Route path="/becas" element={<Scholarships />} />
          <Route path="/becas/:scholarshipId" element={<ScholarshipDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;